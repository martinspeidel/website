<?php
/**
 * Buchung – liest deinen Google-Kalender „Buchung“ und gibt
 * pro Projekt nur dessen Zeiträume zurück (als JSON für buchung.html).
 *
 * Termin-Titel in Google:   Bär Tiger Wolf Relaunch      (= Projektname, steht auf dem Balken)
 * Anzeigen als:             Beschäftigt = Buchbar, Frei = Option
 * Beschreibung (optional):  700                          (erste Zahl = Tagessatz in €)
 *
 * Alle Termine mit gleichem Titel teilen sich einen Link. Termine ohne Titel bekommen je einen eigenen.
 * Achtung: Benennst du einen Termin um, ändert sich sein Link.
 *
 * Kundenlinks anzeigen:     buchung.php?liste  (fragt einmal nach dem Passwort, merkt sich das 1 Jahr)
 */

// ───────────── Einstellungen ─────────────

// Geheime iCal-Adresse deines Kalenders „Buchung“ (bleibt gleich, wenn du den Kalender umbenennst)
// (Google Kalender → Einstellungen → Kalender → „Geheime Adresse im iCal-Format“)
$ICAL_URL = 'https://calendar.google.com/calendar/ical/0a77e6bf18183684ef5ca2aa8e27888a43e157f760c243d9bdc25babcffc6855%40group.calendar.google.com/private-4dd4b80b0221a5a46c68a7d157996268/basic.ics';

// Beliebiger langer Zufallstext. Daraus entstehen die Codes in den Kundenlinks.
// Wenn du ihn änderst, werden alle bisherigen Kundenlinks ungültig.
$SECRET = 'Nun aber bleiben Glaube, Hoffnung, Liebe, diese drei; aber die Liebe ist die größte unter ihnen.';

// Passwort für die Linkliste
$ADMIN_PASSWORT = '102030';

// Adresse der Seite (für die Linkliste)
$SEITE = 'https://martinspeidel.info/buchung.html';

// Kundenseiten und Linkliste holen den Kalender bei jedem Aufruf frisch von Google.
// Ist Google kurz nicht erreichbar, wird der zuletzt geladene Stand gezeigt.
$CACHE_SEKUNDEN = 0;

// ─────────────────────────────────────────

date_default_timezone_set('Europe/Berlin');

function fail($code, $msg) {
  http_response_code($code);
  header('X-Robots-Tag: noindex, nofollow, noarchive');
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['error' => $msg]);
  exit;
}

function cache_file($url) { return sys_get_temp_dir() . '/vf_' . md5($url) . '.ics'; }

function fetch_ics($url, $ttl) {
  $cache = cache_file($url);
  if ($ttl > 0 && is_file($cache) && time() - filemtime($cache) < $ttl) return file_get_contents($cache);
  $data = false;
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 15]);
    $data = curl_exec($ch);
    if (curl_getinfo($ch, CURLINFO_HTTP_CODE) >= 400) $data = false;
    curl_close($ch);
  } elseif (ini_get('allow_url_fopen')) {
    $data = @file_get_contents($url);
  }
  if ($data === false || strpos($data, 'BEGIN:VCALENDAR') === false) {
    if (is_file($cache)) return file_get_contents($cache); // lieber alten Stand zeigen als nichts
    return false;
  }
  @file_put_contents($cache, $data);
  return $data;
}

function ics_unescape($s) {
  return str_replace(['\\n', '\\N', '\\,', '\\;', '\\\\'], ["\n", "\n", ',', ';', '\\'], $s);
}

// Nur das Datum (JJJJ-MM-TT) aus DTSTART/DTEND; bei Uhrzeiten zählt der Kalendertag in Berlin.
function ics_date($value, $params) {
  if (preg_match('/^(\d{4})(\d{2})(\d{2})$/', $value, $m)) return ["$m[1]-$m[2]-$m[3]", true];
  if (preg_match('/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/', $value, $m)) {
    $tz = $m[7] ? 'UTC' : (preg_match('/TZID=([^;:]+)/', $params, $t) ? $t[1] : 'Europe/Berlin');
    try { $d = new DateTime("$m[1]-$m[2]-$m[3] $m[4]:$m[5]:$m[6]", new DateTimeZone($tz)); }
    catch (Exception $e) { $d = new DateTime("$m[1]-$m[2]-$m[3] $m[4]:$m[5]:$m[6]"); }
    $d->setTimezone(new DateTimeZone('Europe/Berlin'));
    return [$d->format('Y-m-d'), false];
  }
  return [null, false];
}

function lower($s) { return function_exists('mb_strtolower') ? mb_strtolower($s, 'UTF-8') : strtolower($s); }

function parse_events($ics) {
  $ics = preg_replace("/\r\n[ \t]|\n[ \t]/", '', $ics); // gefaltete Zeilen zusammenfügen
  $lines = preg_split("/\r\n|\n|\r/", $ics);
  $events = []; $ev = null;
  foreach ($lines as $line) {
    if ($line === 'BEGIN:VEVENT') { $ev = []; continue; }
    if ($line === 'END:VEVENT') { if ($ev !== null) $events[] = $ev; $ev = null; continue; }
    if ($ev === null) continue;
    $pos = strpos($line, ':'); if ($pos === false) continue;
    $left = substr($line, 0, $pos); $val = substr($line, $pos + 1);
    $parts = explode(';', $left, 2);
    $name = strtoupper($parts[0]); $params = isset($parts[1]) ? $parts[1] : '';
    if (!isset($ev[$name])) $ev[$name] = ['v' => $val, 'p' => $params];
  }
  $out = [];
  foreach ($events as $e) {
    if (empty($e['DTSTART'])) continue;
    if (!empty($e['STATUS']) && strtoupper($e['STATUS']['v']) === 'CANCELLED') continue;
    $title = !empty($e['SUMMARY']) ? trim(ics_unescape($e['SUMMARY']['v'])) : '';
    // Art über „Anzeigen als“ in Google: Beschäftigt (OPAQUE) → Buchbar, Frei (TRANSPARENT) → Option.
    // Alte Präfixe „Option:“ / „Buchbar:“ / „Gebucht:“ gehen weiterhin und haben Vorrang.
    $transp = !empty($e['TRANSP']) ? strtoupper(trim($e['TRANSP']['v'])) : 'OPAQUE';
    $kind = $transp === 'TRANSPARENT' ? 'option' : 'booked';
    if (preg_match('/^\s*(buchbar|buchung|option|gebucht)\s*:\s*(.*)$/iu', $title, $m)) {
      $kind = lower($m[1]) === 'option' ? 'option' : 'booked'; $title = trim($m[2]);
    }
    list($start, $allDay) = ics_date($e['DTSTART']['v'], $e['DTSTART']['p']);
    if (!$start) continue;
    $end = $start;
    if (!empty($e['DTEND'])) {
      list($endRaw, $endAllDay) = ics_date($e['DTEND']['v'], $e['DTEND']['p']);
      if ($endRaw) {
        // Ganztägig: Google speichert das Ende exklusiv (Tag danach).
        $end = $endAllDay ? date('Y-m-d', strtotime($endRaw . ' -1 day')) : $endRaw;
        if ($end < $start) $end = $start;
      }
    }
    // Offenes Ende: steht „offen“ in der Beschreibung, gilt der Zeitraum als „ab … · Dauer projektabhängig“.
    // Der Balken läuft über den eingetragenen Zeitraum aus und zählt nicht in die Summen.
    $open = !empty($e['DESCRIPTION']) && preg_match('/\b(offen|open)\b/iu', strip_tags(ics_unescape($e['DESCRIPTION']['v'])));
    // Abgerechnete Tage: „3 Tage“, „3 Tag“, „3T“ oder „3 days“ in der Beschreibung (0 = alle Arbeitstage im Zeitraum)
    // Tagessatz: die erste andere Zahl in der Beschreibung („700“, „700 €“, „Tagessatz: 1.200“ …)
    $rate = 0; $billed = 0;
    if (!empty($e['DESCRIPTION'])) {
      $desc = strip_tags(ics_unescape($e['DESCRIPTION']['v']));
      if (preg_match('/(\d+)\s*(?:tage?|t|days?)\b/iu', $desc, $bd)) { $billed = (int)$bd[1]; $desc = str_replace($bd[0], ' ', $desc); }
      if (preg_match('/(\d[\d.,]*)/u', $desc, $r)) {
        $n = rtrim($r[1], '.,');
        if (preg_match('/,\d{1,2}$/', $n)) $n = str_replace(['.', ','], ['', '.'], $n); // 1.200,50
        else $n = str_replace(['.', ','], '', $n);                                       // 1.200 / 1,200
        $rate = (float)$n;
      }
    }
    $mod = '';
    foreach (['LAST-MODIFIED', 'DTSTAMP', 'CREATED'] as $k) {
      if (!empty($e[$k]) && preg_match('/^(\d{4})(\d{2})(\d{2})/', $e[$k]['v'], $d)) { $mod = "$d[1]-$d[2]-$d[3]"; break; }
    }
    $created = '';
    foreach (['CREATED', 'DTSTAMP', 'LAST-MODIFIED'] as $k) if (!empty($e[$k])) { $created = preg_replace('/[^0-9T]/', '', $e[$k]['v']); break; }
    $uid = !empty($e['UID']) ? $e['UID']['v'] : $title . $start;
    $out[] = ['id' => 'g' . substr(md5($uid), 0, 10), 'uid' => $uid, 'start' => $start, 'end' => $end,
              'title' => $title, 'kind' => $kind, 'rate' => $rate, 'modified' => $mod, 'created' => $created, 'open' => $open, 'billed' => $billed];
  }
  return $out;
}

function slug($s) {
  $s = lower($s);
  $s = strtr($s, ['ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'ß' => 'ss']);
  $s = preg_replace('/[^a-z0-9]+/', '-', $s);
  return trim($s, '-');
}
// Gleicher Titel = gleiche Gruppe = gleicher Link. Ohne Titel: jeder Termin für sich.
function group_of($e) { return $e['title'] !== '' ? 't:' . lower($e['title']) : 'u:' . $e['uid']; }
function group_key($e, $secret) {
  $first = $e['title'] !== '' ? explode('-', slug($e['title']))[0] : '';
  if ($first === '') $first = 'termin';
  return substr($first, 0, 16) . '-' . substr(hash_hmac('sha256', group_of($e), $secret), 0, 8);
}

// ───────── Arbeitstage (Wochenenden und Hamburger Feiertage zählen nicht) ─────────
function hh_holidays($y) {
  static $c = [];
  if (isset($c[$y])) return $c[$y];
  $a = $y % 19; $b = intdiv($y, 100); $cc = $y % 100; $d = intdiv($b, 4); $e = $b % 4; $f = intdiv($b + 8, 25);
  $g = intdiv($b - $f + 1, 3); $h = (19 * $a + $b - $d - $g + 15) % 30; $i = intdiv($cc, 4); $k = $cc % 4;
  $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7; $m = intdiv($a + 11 * $h + 22 * $l, 451);
  $mo = intdiv($h + $l - 7 * $m + 114, 31); $da = (($h + $l - 7 * $m + 114) % 31) + 1;
  $easter = mktime(12, 0, 0, $mo, $da, $y);
  $o = [];
  foreach (["$y-01-01", "$y-05-01", "$y-10-03", "$y-10-31", "$y-12-25", "$y-12-26"] as $x) $o[$x] = 1;
  foreach ([-2, 1, 39, 50] as $off) $o[date('Y-m-d', $easter + $off * 86400)] = 1;
  return $c[$y] = $o;
}
function is_off($ymd) {
  $w = (int)date('N', strtotime($ymd . ' 12:00'));
  return $w >= 6 || isset(hh_holidays((int)substr($ymd, 0, 4))[$ymd]);
}
// Termine gleicher Art, die direkt aneinander anschließen (z. B. Fr endet, Mo beginnt),
// gelten als ein Zeitraum. $list muss nach Start sortiert sein.
function merge_adjacent($list) {
  $out = [];
  foreach ($list as $e) {
    $n = count($out);
    if ($n && $out[$n - 1]['kind'] === $e['kind'] && empty($out[$n - 1]['billed']) && empty($e['billed'])) {
      $p = &$out[$n - 1];
      $gap = true;
      for ($t = strtotime($p['end'] . ' 12:00') + 86400; date('Y-m-d', $t) < $e['start']; $t += 86400) {
        if (!is_off(date('Y-m-d', $t))) { $gap = false; break; }
      }
      if ($gap) {
        if ($e['end'] > $p['end']) $p['end'] = $e['end'];
        // ist einer der beiden offen, wird der ganze Balken offen (ein Balken, Dauer projektabhängig)
        if (!empty($e['open'])) $p['open'] = true;
        $p['rate'] = max($p['rate'], $e['rate']);
        if ($e['modified'] > $p['modified']) $p['modified'] = $e['modified'];
        if ($e['created'] > $p['created']) $p['created'] = $e['created'];
        unset($p);
        continue;
      }
      unset($p);
    }
    $out[] = $e;
  }
  return $out;
}
// Datum des n-ten Arbeitstags ab $a (einschließlich)
function add_workdays($a, $n) {
  $t = strtotime($a . ' 12:00'); $last = $a;
  while ($n > 0) { $d = date('Y-m-d', $t); if (!is_off($d)) { $n--; $last = $d; } $t += 86400; }
  return $last;
}
function workdays($a, $b) {
  $n = 0;
  for ($t = strtotime($a . ' 12:00'); date('Y-m-d', $t) <= $b; $t += 86400) if (!is_off(date('Y-m-d', $t))) $n++;
  return $n;
}

// ───────── Texte für die Linkliste ─────────
$MON_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
$MON_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// „5.–16. Oktober 2026“ / „5–16 October 2026“ – Linktext für die Mail
function long_range($a, $b, $en) {
  global $MON_DE, $MON_EN;
  $M = $en ? $MON_EN : $MON_DE; $dot = $en ? '' : '.';
  $x = strtotime($a . ' 12:00'); $y = strtotime($b . ' 12:00');
  $dx = date('j', $x) . $dot; $dy = date('j', $y) . $dot;
  $mx = $M[date('n', $x) - 1]; $my = $M[date('n', $y) - 1];
  if ($a === $b) return "{$dy} {$my} " . date('Y', $y);
  if (date('Y-m', $x) === date('Y-m', $y)) return "{$dx}–{$dy} {$my} " . date('Y', $y);
  if (date('Y', $x) === date('Y', $y)) return "{$dx} {$mx} – {$dy} {$my} " . date('Y', $y);
  return "{$dx} {$mx} " . date('Y', $x) . " – {$dy} {$my} " . date('Y', $y);
}
// ───────── Kopierter Link: gleiche Zeilen wie unter dem Kalender auf der Kundenseite ─────────
function vis_start($e) { for ($t = strtotime($e['start'] . ' 12:00'); date('Y-m-d', $t) <= $e['end']; $t += 86400) if (!is_off(date('Y-m-d', $t))) return date('Y-m-d', $t); return $e['start']; }
function vis_end($e) { for ($t = strtotime($e['end'] . ' 12:00'); date('Y-m-d', $t) >= $e['start']; $t -= 86400) if (!is_off(date('Y-m-d', $t))) return date('Y-m-d', $t); return $e['end']; }
// „19.–23.10.2026“ / „ab 07.10.2026“ – EN „19–23 Oct 2026“ / „from 7 Oct 2026“
function num_range($e, $en, $today) {
  global $MON_EN;
  $a = vis_start($e); if ($a < $today) $a = $today; $b = vis_end($e);
  $x = strtotime($a . ' 12:00'); $y = strtotime($b . ' 12:00');
  if (!empty($e['open'])) return $en ? 'from ' . date('j', $x) . ' ' . substr($MON_EN[date('n', $x) - 1], 0, 3) . ' ' . date('Y', $x) : 'ab ' . date('d.m.Y', $x);
  if ($en) {
    $mm = function ($z) use ($MON_EN) { return substr($MON_EN[date('n', $z) - 1], 0, 3); };
    $r = $a === $b ? date('j', $y) . ' ' . $mm($y) : (date('Y-m', $x) === date('Y-m', $y) ? date('j', $x) . '–' . date('j', $y) . ' ' . $mm($y) : date('j', $x) . ' ' . $mm($x) . ' – ' . date('j', $y) . ' ' . $mm($y));
    return $r . ' ' . date('Y', $y);
  }
  if ($a === $b) return date('d.m.Y', $x);
  $sameY = date('Y', $x) === date('Y', $y); $sameM = date('Y-m', $x) === date('Y-m', $y);
  return ($sameM ? date('d.', $x) : ($sameY ? date('d.m.', $x) : date('d.m.Y', $x))) . '–' . date('d.m.Y', $y);
}
function entry_days($e, $today) { return !empty($e['open']) ? 0 : (!empty($e['billed']) ? $e['billed'] : workdays(max($e['start'], $today), $e['end'])); }
function money($v, $en) { return $en ? '€' . number_format(round($v), 0, '.', ',') : euro($v); }
function link_lines($list, $en, $today) {
  $hasFirm = false; foreach ($list as $e) if ($e['kind'] !== 'option') $hasFirm = true;
  $firm = array_values(array_filter($list, function ($e) use ($hasFirm) { return !$hasFirm || $e['kind'] !== 'option'; }));
  $closed = array_values(array_filter($firm, function ($e) { return empty($e['open']); }));
  $open = array_values(array_filter($firm, function ($e) { return !empty($e['open']); }));
  $opts = $hasFirm ? array_values(array_filter($list, function ($e) { return $e['kind'] === 'option'; })) : [];
  $rateOf = function ($es) { $r = []; foreach ($es as $e) { if (!($e['rate'] > 0)) return null; $r[(string)$e['rate']] = $e['rate']; } return count($r) === 1 ? reset($r) : null; };
  $T = function ($de, $eng) use ($en) { return $en ? $eng : $de; };
  $dayW = function ($n) use ($T) { return $n . $T($n === 1 ? ' Arbeitstag' : ' Arbeitstage', $n === 1 ? ' working day' : ' working days'); };
  $rateTxt = function ($r) use ($T, $en) { return $r ? $T('Tagessatz ', 'Day rate ') . money($r, $en) : null; };
  $oTag = $hasFirm ? '' : ' (Option)';
  $out = [];
  $all = $rateOf($list);
  if ($closed) {
    $n = 0; $tot = 0; $miss = false;
    foreach ($closed as $e) { $k = entry_days($e, $today); $n += $k; if ($e['rate'] > 0) $tot += $k * $e['rate']; else $miss = true; }
    $p = [implode(', ', array_map(function ($e) use ($en, $today) { return num_range($e, $en, $today); }, $closed)), $dayW($n)];
    if ($rt = $rateTxt($all)) $p[] = $rt;
    if (!$miss && $n) $p[] = $T('Gesamt ', 'Total ') . money($tot, $en);
    $out[] = [$closed[0]['start'], implode(' · ', $p) . $oTag];
  }
  if ($open) {
    $p = [num_range($open[0], $en, $today), $T('Dauer projektabhängig', 'duration depends on project')];
    if ($rt = $rateTxt($all)) $p[] = $rt;
    $out[] = [$open[0]['start'], implode(' · ', $p) . $oTag];
  }
  foreach ($opts as $e) {
    $p = [num_range($e, $en, $today), !empty($e['open']) ? $T('Dauer projektabhängig', 'duration depends on project') : $dayW(entry_days($e, $today))];
    if ($e['rate'] > 0) $p[] = $rateTxt($e['rate']);
    if ($e['rate'] > 0 && empty($e['open'])) $p[] = $T('Gesamt ', 'Total ') . money(entry_days($e, $today) * $e['rate'], $en);
    $out[] = [$e['start'], implode(' · ', $p) . ' (Option)'];
  }
  usort($out, function ($a, $b) { return strcmp($a[0], $b[0]); });
  return implode("\n", array_map(function ($x) { return $x[1]; }, $out));
}
// „05.–09.10.“ – kompakt für die Liste
function short_range($a, $b) {
  $x = strtotime($a . ' 12:00'); $y = strtotime($b . ' 12:00');
  if ($a === $b) return date('d.m.', $x);
  if (date('Y-m', $x) === date('Y-m', $y)) return date('d.', $x) . '–' . date('d.m.', $y);
  return date('d.m.', $x) . '–' . date('d.m.', $y);
}
function euro($v) { return number_format(round($v), 0, ',', '.') . ' €'; }
function h($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }

// ───────── Seitenrahmen für Passwort und Linkliste ─────────
// Nimmt Header, Menü, Footer und Skripte 1:1 aus buchung.html, damit alles wie die übrige Website aussieht.
function site_page($inner, $script = '') {
  $tpl = @file_get_contents(__DIR__ . '/buchung.html');
  if ($tpl === false) { header('Content-Type: text/html; charset=utf-8'); echo $inner; exit; }
  $css = <<<'CSS'
<style>
.kl-form{width:min(560px,100%);display:flex;flex-direction:column;gap:10px}
.kl-form label{font-size:17px;line-height:25px;color:#8e88a5}
.kl-form input[type=password]{width:100%;box-sizing:border-box;background:#191134;border:1px solid #3a3160;border-radius:8px;color:#fff;font:300 21px/34px "DM Sans",sans-serif;padding:12px 18px;outline:none;cursor:text;transition:border-color .3s ease,box-shadow .3s ease}
.kl-form input[type=password]:focus{border-color:#bfabff;box-shadow:0 0 0 1px #bfabff}
.kl-form .kl-err{margin:6px 0 0;font-size:17px;line-height:25px;color:#f0ff96}
.kl-go{background:none;border:0;padding:0;font:inherit;letter-spacing:inherit;color:#bfabff;display:inline-flex;align-items:center;gap:10px;cursor:pointer}
.kl-go span{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:9px;transition:color .3s ease}
.kl-go:hover span,.kl-go:hover{color:#f0ff96}
.kl-go svg{width:45px;height:15px;transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.kl-go:hover svg{transform:translateX(6px)}
.kl-small{font-size:17px;line-height:25px;color:#8e88a5;font-weight:300}
.kl-top,.kl-acc,.kl-more{max-width:1400px}
/* Akkordeon wie auf tools.html: großer lila Titel, feine Linie, „+“ rechts, dreht sich beim Öffnen zum „×“ */
.kl-acc{margin-top:40px}
.kl-item.kl-hidden{display:none}
.kl-head{background:none;border:0;margin:0;text-align:left;font-family:inherit;letter-spacing:inherit;box-sizing:border-box;width:100%;display:flex;align-items:center;justify-content:space-between;gap:24px;cursor:pointer;position:relative;padding:.75em 0;color:#bfabff;transition:color .6s ease}
.kl-item:first-child .kl-head{padding-top:0}
.kl-head::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:.5px;background:#8e88a5}
.kl-head:hover,.kl-head:focus-visible{color:#f0ff96;outline:none}
.kl-head.kl-none .kl-name{font-style:italic}
.kl-sub{color:#8e88a5;font-style:normal}
.kl-plus{font-size:1em;flex:none;color:#bfabff;transition:transform .5s cubic-bezier(.2,.7,.2,1),color .6s ease}
.kl-head:hover .kl-plus{color:#f0ff96}
.kl-open-item .kl-plus{transform:rotate(135deg)}
.kl-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .5s cubic-bezier(.2,.7,.2,1)}
.kl-open-item .kl-body{grid-template-rows:1fr}
.kl-inner{overflow:hidden;min-height:0}
.kl-pad{padding:1em 50px 1.6em 0;opacity:0;transform:translateY(12px);transition:opacity .4s ease,transform .5s cubic-bezier(.2,.7,.2,1)}
.kl-open-item .kl-pad{opacity:1;transform:none;transition-delay:.1s}
.kl-lines,.kl-acts{font-size:21px!important;line-height:34px!important}
.kl-lines{margin:0 0 .9em!important;color:#fff}
.kl-lines span{display:block}
@media (max-width:640px){.kl-lines > span + span{margin-top:10px}}
@media (min-width:769px){.kl-lines span{white-space:nowrap}}
.kl-warn{color:#f0ff96}
.kl-rate{color:#fff}
.kl-acts{display:flex;flex-wrap:wrap;gap:14px 24px;align-items:center;margin:0!important}
.kl-acts .kl-cp{color:#bfabff}
.kl-acts .kl-cp span{--ul:#bfabff}
.kl-acts .kl-cp svg{width:20px;height:20px}

.kl-more{background:none;border:0;padding:0;font-family:inherit;letter-spacing:inherit;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin-top:48px!important;color:#bfabff;transition:color .6s ease}
.kl-more:hover,.kl-more:focus-visible{color:#f0ff96;outline:none}
.kl-more span{position:relative}
@media (max-width:640px){.kl-acts{flex-direction:column;align-items:flex-start;gap:10px}}
.kl-more span::after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:2px;background:currentColor}
.kl-more i{font-size:1.1em;transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.kl-more:hover i{transform:translateY(4px)}
@keyframes kl-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.kl-reveal{animation:kl-in .6s cubic-bezier(.2,.8,.2,1) both}
@media (max-width:768px){.kl-pad{padding-right:0}.kl-acts{column-gap:20px}}
@media (max-width:450px){.kl-lines,.kl-acts{font-size:17px!important;line-height:28px!important}}
.kl-cp{background:none;border:0;padding:0;font:inherit;letter-spacing:inherit;color:#fff;display:inline-flex;align-items:center;gap:10px;cursor:pointer;text-decoration:none}
.kl-cp svg{width:20px;height:20px;flex:none;overflow:visible;transition:color .3s ease}
.kl-cp span{transition:color .3s ease}
/* Unterstreichung animiert wie „Client login“ (super-hover): Linie zieht sich nach rechts zurück, gelbe Linie wächst von links */
.kl-cp span{position:relative;text-decoration:none!important}
.kl-cp span::before,.kl-cp span::after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:2px;pointer-events:none}
.kl-cp span::before{background:var(--ul,currentColor);transform:scaleX(1);transform-origin:bottom right;transition:transform .2s ease-out .15s}
.kl-cp span::after{background:#f0ff96;transform:scaleX(0);transform-origin:bottom left;transition:transform .2s ease-out 0s}
.kl-cp:hover span::before,.kl-cp:focus-visible span::before{transform:scaleX(0);transition-delay:0s}
.kl-cp:hover span::after,.kl-cp:focus-visible span::after{transform:scaleX(1);transition-delay:.15s}
@media (max-width:767px){.kl-cp span::before,.kl-cp span::after{height:1.5px}}
@media (prefers-reduced-motion:reduce){.kl-cp span::before,.kl-cp span::after{transition:none}}
.kl-cp span{--ul:#fff}
.kl-cp.kl-open span{--ul:#8e88a5}
.kl-cp.kl-done span::before,.kl-cp.kl-done span::after{display:none}
.kl-cp:hover span,.kl-cp:hover svg{color:#f0ff96}
.kl-cp.kl-open{color:#8e88a5}
.kl-cp .pg,.kl-cp .ar{transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.kl-cp:hover .pg.front{transform:translate(2px,2px)}
.kl-cp:hover .pg.back{transform:translate(-2px,-2px)}
.kl-cp:hover .ar{transform:translate(2px,-2px)}
.kl-cp .ml,.kl-cp .ml-f{transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.kl-cp .ml-f{transform-box:fill-box;transform-origin:50% 0}
.kl-cp:hover .ml{transform:translateY(2px)}
.kl-cp:hover .ml-f{transform:scaleY(-1)}
.kl-cp.kl-done span{color:#f0ff96;text-decoration:none}
.kl-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:12px 32px;margin:0 0 20px}
.kl-out{display:inline-flex}
.kl-refresh{margin-right:24px}
</style>
CSS;
  $page = preg_replace('#<title>.*?</title>#s', '<title>Kundenlinks | Martin Speidel → 2D Motion Design Specialist, Hamburg</title>', $tpl, 1);
  $page = str_replace('</head>', $css . "\n</head>", $page);
  // Sprachumschalter der Kundenseite und deren Skript werden hier nicht gebraucht
  $page = preg_replace('#\s*<div class="text-h5"[^>]*>\s*<a href="\#" id="vf-lang".*?</a>\s*</div>#s', '', $page, 1);
  $page = preg_replace('#\s*<script src="js/verfuegbarkeit\.js[^"]*"></script>#', '', $page, 1);
  // Weiterleitung aus buchung.html (ohne ?k= → Kundenliste) gehört nicht in diese Seiten
  $page = preg_replace('#\s*<script>\s*// Ohne Kundenschlüssel.*?</script>#s', '', $page, 1);
  $a = strpos($page, '<div class="section no-margin" id="vf-app">');
  $b = strpos($page, '<!--/ Page Content -->');
  if ($a === false || $b === false) { header('Content-Type: text/html; charset=utf-8'); echo $inner; exit; }
  $b = strrpos(substr($page, 0, $b), '</div>');
  $page = substr($page, 0, $a) . $inner . "\n            " . substr($page, $b);
  if ($script) $page = str_replace('</body>', $script . "\n</body>", $page);
  header('Content-Type: text/html; charset=utf-8');
  header('X-Robots-Tag: noindex, nofollow, noarchive');
  header('Cache-Control: no-store');
  echo $page;
  exit;
}
// Überschrift mit Rahmen und Eckpunkten wie auf allen Seiten
function site_title($text, $logout = false) {
  return '<div class="section no-margin" id="vf-app">
                    <div class="wrapper-full no-margin">
                        <div class="c-col-12 sm-12 self-center">
                            <div class="hide-mobile" style="padding-top:75px;" aria-hidden="true"></div>
                            <div class="hide-desktop" style="padding-top:50px;" aria-hidden="true"></div>
                            <div class="text-wrapper no-margin">
                                <h1 class="no-margin no-revert" style="margin-top:5px;">
                                    <div class="text-container">
                                        <div class="scaling-container">
                                            <div class="border-box" aria-hidden="true"></div>
                                            <div class="corner-box top-left" aria-hidden="true" onclick="window.open(\'buchung.php?liste\',\'_blank\')"></div>
                                            <div class="corner-box top-right" aria-hidden="true"></div>
                                            <div class="corner-box bottom-left" aria-hidden="true"></div>
                                            <div class="corner-box bottom-right" aria-hidden="true"></div>
                                            ' . h($text) . '
                                        </div>
                                    </div>
                                </h1>
                            </div>
                        </div>
                    </div>
                    <span class="empty-space hide-mobile" style="height: 120px" aria-hidden="true"></span>
                    <span class="empty-space hide-desktop" style="height: 50px" aria-hidden="true"></span>
                    <div class="wrapper-full no-margin has-anim fadeIn">
                        <div class="c-col-2 hide-mobile" aria-hidden="true"></div>
                        <div class="c-col-10 sm-12">';
}
function site_title_end() {
  return '
                        </div>
                    </div>
                    <span class="empty-space hide-desktop" style="height: 60px" aria-hidden="true"></span>
                    <span class="empty-space hide-mobile" style="height: 150px" aria-hidden="true"></span>
                </div>';
}
$ARROW = '<svg viewBox="0 0 133.05 82.65" fill="currentColor" aria-hidden="true" focusable="false"><path d="M154.78,35.05v-2.52c-11.81-.88-24.75-8.04-24.75-32.53h13.44c0,28.51,21.61,34.79,33.41,34.79v13.06c-11.81,0-33.41,6.28-33.41,34.79h-13.44c0-24.5,12.94-31.65,24.75-32.53v-2.51H0v-12.56h154.78Z"/></svg>';
$ICON_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path class="pg back" d="M16 8V4H4v12h4"/><rect class="pg front" x="8" y="8" width="12" height="12"/></svg>';
$ICON_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><g class="ml"><path d="M3 6h18v12H3z"/><path class="ml-f" d="M3 6l9 7 9-7"/></g></svg>';
$ICON_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><g class="ar"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></g></svg>';

// ───────────── Ablauf ─────────────

if (strpos($ICAL_URL, 'HIER_') === 0 || strpos($SECRET, 'HIER_') === 0) fail(500, 'not_configured');

// Anmeldung für die Linkliste: Passwort einmal eingeben, Cookie hält 1 Jahr.
if (isset($_GET['liste'])) {
  if (strpos($ADMIN_PASSWORT, 'HIER_') === 0) fail(500, 'not_configured');
  $token = hash_hmac('sha256', 'liste:' . $ADMIN_PASSWORT, $SECRET);
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
  $setc = function ($v, $t) use ($https) {
    setcookie('vf_admin', $v, ['expires' => $t, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax']);
  };
  $self = strtok($_SERVER['REQUEST_URI'], '?') . '?liste';
  if (isset($_GET['abmelden'])) { $setc('', time() - 3600); header('Location: ' . $self); exit; }
  $pw = isset($_POST['passwort']) ? (string)$_POST['passwort'] : (string)$_GET['liste'];
  if ($pw !== '' && hash_equals($ADMIN_PASSWORT, $pw)) { $setc($token, time() + 365 * 86400); header('Location: ' . $self); exit; }
  if (!isset($_COOKIE['vf_admin']) || !hash_equals($token, (string)$_COOKIE['vf_admin'])) {
    if ($pw !== '') usleep(800000); // bremst Raten
    $html = site_title('Kundenlinks');
    $html .= '<form class="kl-form" method="post" action="' . h($self) . '">';
    $html .= '<label for="pw">Passwort</label>';
    $html .= '<input id="pw" type="password" name="passwort" autofocus autocomplete="current-password" required>';
    if ($pw !== '') $html .= '<p class="kl-err">Das Passwort stimmt nicht.</p>';
    $html .= '<div class="text-h5" style="display:flex;flex-wrap:wrap;gap:16px 32px;align-items:center;justify-content:space-between;margin:34px 0 0">';
    $html .= '<button type="submit" class="kl-go"><span>Öffnen</span>' . $ARROW . '</button>';
    $html .= '<span class="kl-small">Du bleibst auf diesem Gerät ein Jahr angemeldet.</span></div></form>';
    $html .= site_title_end();
    site_page($html);
    exit;
  }
}

// Linkliste: immer frisch von Google. Kundenseiten: Zwischenspeicher.
$liste = isset($_GET['liste']);
$ics = fetch_ics($ICAL_URL, $CACHE_SEKUNDEN);
if ($ics === false) fail(502, 'calendar_unreachable');
$events = parse_events($ics);
// Tagessatz je Projekt: Termine ohne Tagessatz übernehmen den des Projekts,
// bei unterschiedlichen Tagessätzen gilt der höhere – für alle Termine des Projekts.
$maxrate = [];
foreach ($events as $e) { $g = group_of($e); $maxrate[$g] = max(isset($maxrate[$g]) ? $maxrate[$g] : 0, $e['rate']); }
foreach ($events as &$e) $e['rate'] = $maxrate[group_of($e)];
unset($e);
$today = date('Y-m-d');

// ───────────── Linkliste für dich ─────────────
if ($liste) {
  $groups = [];
  foreach ($events as $e) {
    if ($e['end'] < $today) continue;
    $groups[group_of($e)][] = $e;
  }
  foreach ($groups as &$g) { usort($g, function ($a, $b) { return strcmp($a['start'], $b['start']); }); $g = merge_adjacent($g); }
  unset($g);
  // Neuester Job oben: zuletzt im Kalender angelegter Termin der Gruppe
  $newest = function ($g) { $m = ''; foreach ($g as $e) if ($e['created'] > $m) $m = $e['created']; return $m; };
  uasort($groups, function ($a, $b) use ($newest) { $c = strcmp($newest($b), $newest($a)); return $c ?: strcmp($a[0]['start'], $b[0]['start']); });
  $MAX_JOBS = 5;      // sofort sichtbar, der Rest über „Weitere … anzeigen“
  $MAX_LISTE = 25;    // höchstens so viele Jobs in der Liste (die neuesten), damit die Seite nicht wächst
  $groups = array_slice($groups, 0, $MAX_LISTE, true);

  $cf = cache_file($ICAL_URL);
  $html = site_title('Kundenlinks');
  $html .= '<div class="kl-small kl-top"><span>Aktualisiert: ' . (is_file($cf) ? date('d.m.y, H:i', filemtime($cf)) . ' Uhr' : '–')
         . '</span><a class="kl-cp kl-open kl-out" href="?liste&amp;abmelden"><span>Abmelden</span></a></div>';
  if (!$groups) $html .= '<p class="text-h5" style="color:#8e88a5">Keine kommenden Termine im Kalender „Buchung“.</p>';
  $html .= '<div class="kl-acc">';

  $idx = -1;
  foreach ($groups as $list) {
    $first = $list[0];
    $k = group_key($first, $SECRET);
    $de = $SEITE . '?k=' . $k; $en = $de . '#en';
    $a = max($first['start'], $today); $b = $first['end'];
    $lines = []; $total = 0; $rates = []; $missing = false; $nsum = 0; $closed = false; unset($openStart);
    $hasClosed = false; foreach ($list as $e) if (empty($e['open'])) $hasClosed = true;
    // Optionen zählen nicht in Tage und Summe – außer es gibt nur Optionen
    $hasFirm = false; foreach ($list as $e) if ($e['kind'] !== 'option') $hasFirm = true;
    foreach ($list as $e) {
      if ($e['end'] > $b) $b = $e['end'];
      $s = max($e['start'], $today);
      if (!empty($e['open'])) {
        $lines[] = h('ab ' . date('d.m.', strtotime($s . ' 12:00')) . ' · Dauer projektabhängig' . ($e['kind'] === 'option' ? ' (Option)' : ''));
        if ($e['rate'] > 0) $rates[(string)$e['rate']] = $e['rate']; else $missing = true;
        $openStart = isset($openStart) ? min($openStart, $s) : $s;
        continue;
      }
      $closed = true;
      $n = !empty($e['billed']) ? $e['billed'] : workdays($s, $e['end']);
      $counts = !$hasFirm || $e['kind'] !== 'option';
      if ($counts) $nsum += $n;
      $lines[] = h(short_range($s, $e['end']) . ' · ' . $n . ($n === 1 ? ' Tag' : ' Tage') . ($e['kind'] === 'option' ? ' (Option)' : ''));
      if ($e['rate'] > 0) { $rates[(string)$e['rate']] = $e['rate']; if ($counts) $total += $n * $e['rate']; } else $missing = true;
    }
    // Tagessatz-Zusatz für den kopierten Link
    $rs_de = ''; $rs_en = '';
    if (!$missing && $rates) {
      $rv = array_values($rates);
      if (count($rv) === 1) { $rs_de = ' · Tagessatz ' . euro($rv[0]); $rs_en = ' · Day rate €' . number_format($rv[0], 0, '.', ','); }
      else { $rs_de = ' · Tagessätze ' . implode(' / ', array_map(function ($r) { return number_format($r, 0, ',', '.'); }, $rv)) . ' €';
             $rs_en = ' · Day rates ' . implode(' / ', array_map(function ($r) { return '€' . number_format($r, 0, '.', ','); }, $rv)); }
    }
    // Kopierter Link: dieselben Zeilen wie unter dem Kalender auf der Kundenseite
    $lab_de = link_lines($list, false, $today); $lab_en = link_lines($list, true, $today);
    // Zeilen in der Liste: genau wie unter dem Kalender auf der Kundenseite
    $lines = array_map('h', explode("\n", $lab_de));
    if ($missing) $lines[] = '<span class="kl-warn">Kein Tagessatz eingetragen</span>';

    $idx++;
    $name = $first['title'] !== '' ? h($first['title']) : 'Ohne Titel <span class="kl-sub">· ' . h(long_range($a, $b, false)) . '</span>';
    $html .= '<div class="kl-item' . ($idx >= $MAX_JOBS ? ' kl-hidden' : '') . '">';
    $html .= '<button type="button" class="kl-head text-h3' . ($first['title'] === '' ? ' kl-none' : '') . '" aria-expanded="false"><span class="kl-name">' . $name . '</span><i class="material-icons kl-plus" aria-hidden="true">add</i></button>';
    $html .= '<div class="kl-body"><div class="kl-inner"><div class="kl-pad">';
    $html .= '<p class="kl-lines text-h5"><span>' . implode('</span><span>', $lines) . '</span></p>';
    $html .= '<div class="kl-acts text-h5">';
    $html .= '<button type="button" class="kl-cp" data-url="' . h($de) . '" data-label="' . h($lab_de) . '">' . $ICON_COPY . '<span>Deutsch</span></button>';
    $html .= '<button type="button" class="kl-cp" data-url="' . h($en) . '" data-label="' . h($lab_en) . '">' . $ICON_COPY . '<span>English</span></button>';
    $html .= '<a class="kl-cp kl-go2" href="' . h($de) . '" target="_blank" rel="noopener">' . $ICON_OPEN . '<span>Zur Seite</span></a>';
    $html .= '</div></div></div></div></div>';
  }
  if (count($groups) > $MAX_JOBS) {
    $rest = count($groups) - $MAX_JOBS;
    $html .= '<button type="button" class="kl-more text-h5"><span>' . ($rest === 1 ? 'Einen weiteren Job anzeigen' : 'Weitere ' . $rest . ' Jobs anzeigen') . '</span><i class="material-icons" aria-hidden="true">expand_more</i></button>';
  }
  $html .= '</div>';
  $html .= site_title_end();
  // Kopiert den Link formatiert („5.–16. Oktober 2026 → Details & Konditionen“) für Mailprogramme
  // und als nackte Adresse für alles ohne Formatierung (z. B. WhatsApp).
  $script = <<<'JS'
<script>
document.addEventListener('click', function (ev) {
  var hd = ev.target.closest('.kl-head');
  if (hd) { var it = hd.parentNode, open = !it.classList.contains('kl-open-item'); it.classList.toggle('kl-open-item', open); hd.setAttribute('aria-expanded', open); return; }
  var mo = ev.target.closest('.kl-more');
  if (mo) { document.querySelectorAll('.kl-item.kl-hidden').forEach(function (n) { n.classList.remove('kl-hidden'); n.classList.add('kl-reveal'); }); mo.remove(); return; }
  var b = ev.target.closest('button.kl-cp'); if (!b) return;
  var url = b.dataset.url, label = b.dataset.label, span = b.querySelector('span'), old = span.textContent;
  var href = url.replace(/"/g, '&quot;');
  var html = label.split('\n').map(function (l) { return '<a href="' + href + '">' + l.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</a>'; }).join('<br>');
  function ok() { b.classList.add('kl-done'); span.textContent = 'Kopiert ✓'; setTimeout(function () { b.classList.remove('kl-done'); span.textContent = old; }, 1800); }
  function legacy() {
    var d = document.createElement('div'); d.contentEditable = 'true'; d.innerHTML = html;
    d.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(d);
    var r = document.createRange(); r.selectNodeContents(d); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
    try { document.execCommand('copy'); ok(); } catch (e) {} s.removeAllRanges(); d.remove();
  }
  if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
    navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([html], {type: 'text/html'}),
      'text/plain': new Blob([url], {type: 'text/plain'})
    })]).then(ok, legacy);
  } else legacy();
});
</script>
JS;
  site_page($html, $script);
}

// ───────────── Daten für eine Kundenseite ─────────────
$key = isset($_GET['k']) ? preg_replace('/[^a-z0-9-]/', '', strtolower((string)$_GET['k'])) : '';
if ($key === '') fail(400, 'missing_key');

$found = false; $mine = [];
foreach ($events as $e) {
  if (!hash_equals(group_key($e, $SECRET), $key)) continue;
  $found = true;
  if ($e['end'] < $today) continue;
  $mine[] = $e;
}
if (!$found) fail(404, 'unknown_key');

usort($mine, function ($a, $b) { return strcmp($a['start'], $b['start']); });
$mine = merge_adjacent($mine);
$updated = '';
foreach ($mine as $e) if ($e['modified'] > $updated) $updated = $e['modified'];

$entries = array_map(function ($e) {
  $x = ['id' => $e['id'], 'start' => $e['start'], 'end' => $e['end'], 'title' => $e['title'], 'kind' => $e['kind']];
  if ($e['rate'] > 0) $x['rate'] = $e['rate'];
  if (!empty($e['open'])) $x['open'] = true;
  if (!empty($e['billed'])) $x['days'] = $e['billed'];
  return $x;
}, $mine);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow, noarchive');
echo json_encode(['updated' => $updated ?: $today, 'entries' => $entries], JSON_UNESCAPED_UNICODE);
