/* Buchung – martinspeidel.info
   Lädt die Zeiträume eines Projekts aus buchung.php?k=… (Google Kalender) und zeigt
   Kalender, Kostenübersicht, „Infos kopieren“, .ics-Download und „Angebot anfordern“. */
(function () {
  "use strict";

  var MAIL = "hello@martinspeidel.info";
  var MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  var MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DOW_DE = ["Mo","Di","Mi","Do","Fr","Sa","So"], DOW_EN = ["Mo","Tu","We","Th","Fr","Sa","Su"];

  var ICON_COPY = '<svg class="vf-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path class="vf-pg-b" d="M16 8V4H4v12h4"/><rect class="vf-pg-f" x="8" y="8" width="12" height="12"/></svg>';
  var ICON_CHECK = '<svg class="vf-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="M4 12.5l5 5L20 6.5"/></svg>';
  var ICON_DL = '<svg class="vf-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><g class="vf-dl-a"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/></g><path d="M4 17v4h16v-4"/></svg>';
  var ICON_INFO = '<svg class="vf-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><g class="vf-in-i"><path d="M12 11v6"/><path d="M12 7.5v.5"/></g></svg>';
  var ICON_MAIL = '<svg class="vf-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><g class="vf-ml"><path d="M3 6h18v12H3z"/><path class="vf-ml-f" d="M3 6l9 7 9-7"/></g></svg>';
  var ICON_DOC = '<svg class="vf-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4"/><g class="vf-doc-l"><path d="M8.5 11.5h7"/><path d="M8.5 14.5h7"/><path d="M8.5 17.5h4.5"/></g></svg>';

  var lang = location.hash === "#en" ? "en" : "de";
  function L(de, en) { return lang === "en" ? en : de; }
  function M(i) { return (lang === "en" ? MONTHS_EN : MONTHS)[i]; }
  function DOW() { return lang === "en" ? DOW_EN : DOW_DE; }
  function setLang(l) { lang = l; document.documentElement.lang = l; }

  var state = null, hl = null;
  var $ = function (id) { return document.getElementById(id); };

  // ---------- dates ----------
  function iso(d) { return d.toISOString().slice(0, 10); }
  function parse(s) { var p = s.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function add(d, n) { var x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; }
  function now() { var t = new Date(); return new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())); }
  function monday(d) { return add(d, -((d.getUTCDay() + 6) % 7)); }
  function kw(d) { var t = add(d, 3 - ((d.getUTCDay() + 6) % 7)); var y = new Date(Date.UTC(t.getUTCFullYear(), 0, 4)); return 1 + Math.round(((t - y) / 864e5 - 3 + ((y.getUTCDay() + 6) % 7)) / 7); }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function isWe(d) { var w = d.getUTCDay(); return w === 0 || w === 6; }

  // Hamburger Feiertage: zählen wie Wochenenden (keine Balken, keine Arbeitstage).
  var HOLS = {};
  function holidays(y) {
    if (HOLS[y]) return HOLS[y];
    var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;
    var ea = new Date(Date.UTC(y, mo - 1, da)), o = {};
    function put(dt, de, en) { o[iso(dt)] = [de, en]; }
    put(new Date(Date.UTC(y,0,1)), "Neujahr", "New Year’s Day");
    put(add(ea,-2), "Karfreitag", "Good Friday");
    put(add(ea,1), "Ostermontag", "Easter Monday");
    put(new Date(Date.UTC(y,4,1)), "Tag der Arbeit", "Labour Day");
    put(add(ea,39), "Christi Himmelfahrt", "Ascension Day");
    put(add(ea,50), "Pfingstmontag", "Whit Monday");
    put(new Date(Date.UTC(y,9,3)), "Tag der Deutschen Einheit", "German Unity Day");
    put(new Date(Date.UTC(y,9,31)), "Reformationstag", "Reformation Day");
    put(new Date(Date.UTC(y,11,25)), "1. Weihnachtstag", "Christmas Day");
    put(new Date(Date.UTC(y,11,26)), "2. Weihnachtstag", "Boxing Day");
    return HOLS[y] = o;
  }
  function holName(d) { var h = holidays(d.getUTCFullYear())[iso(d)]; return h ? L(h[0], h[1]) : ""; }
  function isOff(d) { return isWe(d) || !!holName(d); }
  function workdays(a, b) { var n = 0; for (var d = parse(a); iso(d) <= b; d = add(d, 1)) if (!isOff(d)) n++; return n; }
  function visStart(e) { for (var d = parse(e.start); iso(d) <= e.end; d = add(d, 1)) if (!isOff(d)) return iso(d); return e.start; }
  function visEnd(e) { for (var d = parse(e.end); iso(d) >= e.start; d = add(d, -1)) if (!isOff(d)) return iso(d); return e.end; }
  function euro(v) { return lang === "en" ? "€" + Math.round(v).toLocaleString("en-GB") : Math.round(v).toLocaleString("de-DE") + "\u00a0€"; }
  function days(n, short) { return n + (short ? L(n === 1 ? " Tag" : " Tage", n === 1 ? " day" : " days") : L(n === 1 ? " Arbeitstag" : " Arbeitstage", n === 1 ? " working day" : " working days")); }
  function kindName(k) { return k === "option" ? "Option" : L("Buchbar", "Available"); }

  // „05.–09.10.“ bzw. mit Jahr „05.–09.10.2026“ (EN: „5–9 Oct“ / „5–9 Oct 2026“)
  function numRange(e, yr) {
    var t = iso(now()), a = visStart(e); if (a < t) a = t; var b = visEnd(e), x = parse(a), y = parse(b);
    if (e.open) return lang === "en" ? "from " + x.getUTCDate() + " " + M(x.getUTCMonth()).slice(0, 3) + (yr ? " " + x.getUTCFullYear() : "")
                                     : "ab " + p2(x.getUTCDate()) + "." + p2(x.getUTCMonth() + 1) + "." + (yr ? x.getUTCFullYear() : "");
    if (lang === "en") {
      var mm = function (z) { return M(z.getUTCMonth()).slice(0, 3); };
      var same = x.getUTCMonth() === y.getUTCMonth() && x.getUTCFullYear() === y.getUTCFullYear();
      var r = a === b ? y.getUTCDate() + " " + mm(y) : same ? x.getUTCDate() + "–" + y.getUTCDate() + " " + mm(y) : x.getUTCDate() + " " + mm(x) + " – " + y.getUTCDate() + " " + mm(y);
      return r + (yr ? " " + y.getUTCFullYear() : "");
    }
    var d = function (z, m, Y) { return p2(z.getUTCDate()) + "." + (m ? p2(z.getUTCMonth() + 1) + "." : "") + (Y ? z.getUTCFullYear() : ""); };
    var sameY = x.getUTCFullYear() === y.getUTCFullYear(), sameM = sameY && x.getUTCMonth() === y.getUTCMonth();
    if (a === b) return d(x, 1, yr);
    return (sameM ? d(x, 0, 0) : d(x, 1, !sameY)) + "–" + d(y, 1, yr || !sameY);
  }
  function upcoming() { var t = iso(now()); return state.entries.filter(function (e) { return e.end >= t; }).sort(function (a, b) { return a.start < b.start ? -1 : 1; }); }
  function wd(e) { if (e.open) return 0; if (e.days) return e.days; var t = iso(now()); return workdays(e.start < t ? t : e.start, e.end); }
  // Dauer: „5 Tage“ bzw. bei offenem Ende „Dauer projektabhängig“
  function dur(e, short) { return e.open ? L("Dauer projektabhängig", "duration depends on project") : days(wd(e), short); }
  function optTag(e) { return e.kind === "option" ? " (Option)" : ""; }

  // ---------- costs ----------
  // Optionen zählen nicht in Arbeitstage und Summe – außer es gibt nur Optionen
  function costs(list) {
    var total = 0, n = 0, rates = {}, missing = false;
    var firm = list.some(function (e) { return e.kind !== "option"; });
    list.forEach(function (e) { if (e.rate) rates[e.rate] = 1; });
    list.filter(function (e) { return !firm || e.kind !== "option"; }).forEach(function (e) { var k = wd(e); n += k; if (e.rate) { total += k * e.rate; rates[e.rate] = 1; } else missing = true; });
    var r = Object.keys(rates);
    return {days: n, total: missing || !n ? null : total, rate: !missing && r.length === 1 ? +r[0] : null};
  }
  function itemMoney(e) { return e.rate && !e.open ? " · " + euro(wd(e) * e.rate) : ""; }

  // ---------- calendar ----------
  function monthList() {
    var t = now(), today = iso(t), keys = {}, list = [];
    function key(d) { return d.getUTCFullYear() * 12 + d.getUTCMonth(); }
    state.entries.forEach(function (e) {
      if (e.end < today) return;
      var a = parse(e.start < today ? today : e.start), z = key(parse(e.end));
      for (var k = key(a); k <= z; k++) keys[k] = 1;
    });
    for (var k in keys) list.push(+k);
    list.sort(function (x, y) { return x - y; });
    if (!list.length) list.push(key(t));
    return list;
  }
  // Offenes Ende: Balken über 5 Arbeitstage, erst kräftig, dann transparent auslaufend (über alle Teilstücke durchgehend)
  function fadeMask(e, o, mon) {
    var N = Math.max(1, workdays(e.start, e.end)), P = 0.25;
    var i0 = Math.max(0, workdays(e.start, iso(add(mon, o.c0))) - 1), i1 = Math.max(i0, workdays(e.start, iso(add(mon, o.c1))) - 1);
    var t0 = i0 / N, t1 = (i1 + 1) / N;
    var f = function (x) { return x <= P ? 1 : Math.max(0, 1 - (x - P) / (1 - P)); };
    var stops = ["rgba(0,0,0," + f(t0).toFixed(3) + ") 0%"];
    if (t0 < P && P < t1) stops.push("rgba(0,0,0,1) " + ((P - t0) / (t1 - t0) * 100).toFixed(1) + "%");
    stops.push("rgba(0,0,0," + f(t1).toFixed(3) + ") 100%");
    var g = "linear-gradient(90deg," + stops.join(",") + ")";
    return "-webkit-mask-image:" + g + ";mask-image:" + g;
  }
  function segDays(o, mon) { return days(workdays(iso(add(mon, o.c0)), iso(add(mon, o.c1)))); }
  function calendar() {
    var today = iso(now()), h = [];
    var dowRow = '<div class="vf-dow"><div></div>' + DOW().map(function (x) { return "<div>" + x + "</div>"; }).join("") + "</div>";
    monthList().forEach(function (k, mi) {
      var y = Math.floor(k / 12), m = k % 12, first = new Date(Date.UTC(y, m, 1)), last = new Date(Date.UTC(y, m + 1, 0));
      var mS = iso(first), mE = iso(last);
      h.push('<div class="vf-month text-h3">' + M(m) + " " + y + "</div>");
      h.push(dowRow); // Wochentage über jedem Monat
      for (var mon = monday(first); iso(mon) <= mE; mon = add(mon, 7)) {
        var sun = add(mon, 6), ms = iso(mon) < mS ? mS : iso(mon), ss = iso(sun) > mE ? mE : iso(sun);
        var segs = state.entries.filter(function (e) { return e.start <= ss && e.end >= ms; }).sort(function (a, b) { return a.start < b.start ? -1 : 1; });
        var lanes = [], out = [];
        segs.forEach(function (e) {
          var s = e.start < ms ? ms : e.start, en = e.end > ss ? ss : e.end;
          var c0 = Math.round((parse(s) - mon) / 864e5), c1 = Math.round((parse(en) - mon) / 864e5);
          // Wochenenden und Feiertage bleiben frei: der Balken wird dort geteilt.
          var allOff = isOff(parse(visStart(e))), runs = [], r0 = null;
          for (var c = c0; c <= c1 + 1; c++) { var on = c <= c1 && (allOff || !isOff(add(mon, c))); if (on && r0 === null) r0 = c; if (!on && r0 !== null) { runs.push([r0, c - 1]); r0 = null; } }
          if (!runs.length) return;
          var l = 0; while (lanes[l] !== undefined && lanes[l] >= runs[0][0]) l++; lanes[l] = runs[runs.length - 1][1];
          runs.forEach(function (rn) { out.push({e: e, c0: rn[0], c1: rn[1], l: l}); });
        });
        h.push('<div class="vf-week" style="--L:' + Math.max(1, lanes.length) + '"><div class="vf-kw">' + kw(mon) + "</div>");
        for (var i = 0; i < 7; i++) {
          var d = add(mon, i), ds = iso(d), cls = ["vf-day"];
          if (ds < mS || ds > mE) { h.push('<div class="vf-day vf-out" style="grid-column:' + (i + 2) + '"></div>'); continue; }
          var hol = holName(d);
          if (i > 4 || hol) cls.push("vf-we"); if (ds < today) cls.push("vf-past"); if (ds === today) cls.push("vf-today");
          var cov = state.entries.find(function (e) { return e.start <= ds && e.end >= ds && (!isOff(d) || isOff(parse(visStart(e)))); });
          h.push('<div class="' + cls.join(" ") + '" style="grid-column:' + (i + 2) + '" data-date="' + ds + '"' + (cov ? ' data-bar="' + esc(cov.id) + '"' : "") + (hol ? ' title="' + esc(hol) + '"' : "") + (ds === today ? ' aria-current="date"' : "") + '><span class="vf-n">' + d.getUTCDate() + "</span></div>");
        }
        out.forEach(function (o) {
          var e = o.e, t = e.title || kindName(e.kind);
          h.push('<div class="vf-bar vf-' + e.kind + (e.open ? " vf-open" : "") + '" data-id="' + esc(e.id) + '" style="grid-column:' + (o.c0 + 2) + "/" + (o.c1 + 3) + ";grid-row:" + (o.l + 2) + (e.open ? ";" + fadeMask(e, o, mon) : "") + '"><span class="vf-lbl">' + esc(t) + (e.open ? '<span class="vf-days"> · ' + L("Dauer projektabhängig", "duration depends on project") + (e.kind === "option" ? " · Option" : "") + "</span>" : e.days ? (e.kind === "option" ? '<span class="vf-days"> · Option</span>' : "") : '<span class="vf-days"> · ' + segDays(o, mon) + (e.kind === "option" ? " · Option" : "") + "</span>") + "</span></div>");
        });
        h.push("</div>");
      }
    });
    return h.join("");
  }

  // ---------- summary ----------
  function summary(up) {
    if (!up.length) return '<p class="vf-total">' + L("Aktuell ist kein Zeitraum eingetragen.", "There are no dates at the moment.") + "</p>";
    // Teile bleiben beim Umbruch zusammen (mobil)
    var seg = function (x) { return '<span class="vf-seg">' + x + "</span>"; };
    var dot = '<span class="vf-dot"> · </span>';
    var rate = costs(up).rate;
    var rateSeg = rate ? '<span class="vf-s-rate">' + dot + seg(L("Tagessatz ", "Day rate ") + euro(rate)) + "</span>" : "";
    // Feste Zeiträume (ohne Optionen, außer es gibt nur Optionen), getrennt nach offen und abgeschlossen
    var hasFirm = up.some(function (e) { return e.kind !== "option"; });
    var firm = up.filter(function (e) { return !hasFirm || e.kind !== "option"; });
    var closed = firm.filter(function (e) { return !e.open; }), open = firm.filter(function (e) { return e.open; });
    // Zeile für abgeschlossene Zeiträume: Arbeitstage (Walze), Tagessatz, Gesamt
    function closedLine(hlId) {
      var c = costs(closed);
      return '<p class="vf-total"><button type="button" class="vf-total-link" data-hl="' + hlId + '">' +
        seg(closed.map(function (e) { return numRange(e, true); }).join(", ")) + dot +
        '<span class="vf-seg vf-s-days"><span class="vf-n-days" data-n="' + c.days + '">' + c.days + "</span>" + esc(days(c.days).replace(/^\d+/, "")) + "</span>" +
        rateSeg + (c.total !== null ? '<span class="vf-s-sum">' + dot + seg(L("Gesamt ", "Total ") + euro(c.total)) + "</span>" : "") +
        "</button></p>";
    }
    // Zeile für offene Zeiträume: ab Datum · Dauer projektabhängig · Tagessatz (ohne Summe)
    function openLine(hlId) {
      return '<p class="vf-total"><button type="button" class="vf-total-link" data-hl="' + hlId + '">' +
        seg(numRange(open[0], true)) + dot + seg(L("Dauer projektabhängig", "duration depends on project")) + rateSeg +
        "</button></p>";
    }
    // Optionen (nur wenn es auch feste Zeiträume gibt): je eine eigene Zeile, ohne Summe
    var opts = hasFirm ? up.filter(function (e) { return e.kind === "option"; }) : [];
    function optLine(e) {
      return '<p class="vf-total"><button type="button" class="vf-total-link" data-hl="' + e.id + '">' +
        // „(Option)“ hängt immer am letzten Teil, damit es mobil nicht allein in einer Zeile steht
        [numRange(e, true), e.open ? L("Dauer projektabhängig", "duration depends on project") : dur(e)]
          .concat(e.rate ? [L("Tagessatz ", "Day rate ") + euro(e.rate)] : [])
          .concat(e.rate && !e.open ? [L("Gesamt ", "Total ") + euro(wd(e) * e.rate)] : [])
          .map(function (x, i, a) { return (i ? dot : "") + seg(x + (i === a.length - 1 ? " (Option)" : "")); }).join("") +
        "</button></p>";
    }
    if (!opts.length && !open.length) return closedLine("firm");
    if (!opts.length && !closed.length) return openLine("firm");
    // Mehrere Arten: Zeilen untereinander, in der Reihenfolge wie im Kalender
    var both = open.length && closed.length, lines = [];
    if (closed.length) lines.push([closed[0].start, closedLine(both ? "firm-c" : "firm")]);
    if (open.length) lines.push([open[0].start, openLine(both ? "firm-o" : "firm")]);
    opts.forEach(function (e) { lines.push([e.start, optLine(e)]); });
    lines.sort(function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; });
    return lines.map(function (x) { return x[1]; }).join("");
  }

  // ---------- copy text ----------
  function infoText(up) {
    // Kurz und knapp wie in der Angebotsmail
    var c = costs(up), title = up.map(function (e) { return e.title; }).filter(Boolean)[0], anyOpen = up.some(function (e) { return e.open; });
    var line = function (e) { return numRange(e, true) + " (" + dur(e) + (e.kind === "option" ? ", Option" : "") + ")"; };
    var t = ["Martin Speidel Motion Design"];
    if (title) t.push(title);
    t.push("");
    if (up.length === 1) t.push(L("Zeitraum: ", "Dates: ") + line(up[0]));
    else { t.push(L("Zeiträume:", "Dates:")); up.forEach(function (e) { t.push("– " + line(e)); }); }
    if (c.rate) t.push(L("Tagessatz: ", "Day rate: ") + euro(c.rate));
    if (!anyOpen && c.total !== null) t.push(L("Gesamt: ", "Total: ") + euro(c.total));
    if (c.rate) t.push(L("Alle Beträge netto, zzgl. USt.", "All amounts net, plus VAT."));
    return t.join("\n");
  }
  function copyText(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt);
    return new Promise(function (ok, no) {
      var ta = document.createElement("textarea"); ta.value = txt; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;left:-9999px;top:0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? ok() : no(); } catch (e) { no(e); } ta.remove();
    });
  }

  // ---------- .ics ----------
  function icsEsc(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function icsFold(line) { var out = [], s = line; while (s.length > 74) { out.push(s.slice(0, 74)); s = " " + s.slice(74); } out.push(s); return out.join("\r\n"); }
  function icsFile(up) {
    var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    var L2 = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//martinspeidel.info//Verfuegbarkeit//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    up.forEach(function (e) {
      var t = iso(now()), s = e.start < t ? t : e.start;
      var desc = numRange(e, true) + " · " + dur(e) + itemMoney(e) + (e.rate && !e.open ? L(" netto", " net") : "") + optTag(e) + "\n" + location.href.split("#")[0];
      L2.push("BEGIN:VEVENT",
        "UID:" + e.id + "-" + s + "@martinspeidel.info",
        "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + s.replace(/-/g, ""),
        "DTEND;VALUE=DATE:" + iso(add(parse(e.open ? s : e.end), 1)).replace(/-/g, ""),
        icsFold("SUMMARY:" + icsEsc((e.kind === "option" ? "Option: " : "") + (e.title ? e.title + " · " : "") + "Martin Speidel")),
        icsFold("DESCRIPTION:" + icsEsc(desc)),
        "TRANSP:" + (e.kind === "option" ? "TRANSPARENT" : "OPAQUE"),
        "END:VEVENT");
    });
    L2.push("END:VCALENDAR");
    return L2.join("\r\n") + "\r\n";
  }
  function download(name, text, type) {
    var blob = new Blob([text], {type: type}), url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  // ---------- Antwort: vorformulierte Buchungsbestätigung ----------
  function offerMail(up) {
    var title = up.map(function (e) { return e.title; }).filter(Boolean)[0], c = costs(up);
    var line = function (e) { return numRange(e, true) + " (" + dur(e) + (e.kind === "option" ? ", Option" : "") + ")"; };
    var t = [L("Hallo Martin,", "Hi Martin,"), ""];
    t.push(L("bitte schick mir ein Angebot" + (title ? " für „" + title + "“" : "") + " zu folgenden Konditionen:",
             "please send me a quote" + (title ? " for “" + title + "”" : "") + " on the following terms:"), "");
    if (up.length === 1) t.push(L("Zeitraum: ", "Dates: ") + line(up[0]));
    else { t.push(L("Zeiträume:", "Dates:")); up.forEach(function (e) { t.push("– " + line(e)); }); }
    if (c.rate) t.push(L("Tagessatz: ", "Day rate: ") + euro(c.rate));
    if (c.total !== null) t.push(L("Gesamt: ", "Total: ") + euro(c.total), L("Alle Beträge netto, zzgl. USt.", "All amounts net, plus VAT."));
    t.push("", L("Viele Grüße", "Best regards"));
    var subj = L("Angebotsanfrage", "Quote request") + ": " + (title ? title + ", " : "") + up.map(function (e) { return numRange(e, true); }).join(", ");
    return "mailto:" + MAIL + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(t.join("\n"));
  }

  // ---------- render ----------
  function standDate() { var up = parse(state.updated); return p2(up.getUTCDate()) + "." + p2(up.getUTCMonth() + 1) + "." + up.getUTCFullYear(); }
  function render() {
    $("vf-title").textContent = L("Zeit für dein Projekt.", "Time for your project.");
    var ls = $("vf-lang"); if (ls) { ls.textContent = lang === "en" ? "DE" : "EN"; ls.setAttribute("lang", lang === "en" ? "de" : "en"); }
    if (!state) return;
    var up = upcoming(), c = costs(up);
    var many = up.length > 1;
    $("vf-intro").innerHTML = up.length ? L("Moin <span class=\"wave\" aria-hidden=\"true\">👋</span><br class=\"vf-mbr\"> Danke für deine Anfrage!<br>Für ", "Moin <span class=\"wave\" aria-hidden=\"true\">👋</span><br class=\"vf-mbr\"> Thanks for your enquiry!<br>You can book me for ") +
      '<button type="button" class="vf-intro-link" data-hl="*">' + (many ? L("folgende Zeiträume", "the following dates") : L("folgenden Zeitraum", "the following period")) + "</button>" +
      L(" kannst du mich buchen:", ":") : "";
    $("vf-cal").innerHTML = calendar();
    $("vf-sum").innerHTML = summary(up);
    $("vf-actions").innerHTML = up.length ?
      '<button type="button" class="vf-act" id="vf-copy">' + ICON_COPY + "<span>" + L("Infos kopieren", "Copy details") + "</span></button>" +
      '<button type="button" class="vf-act" id="vf-ics">' + ICON_DL + "<span>" + L("In den Kalender (.ics)", "Add to calendar (.ics)") + "</span></button>" +
      '<a class="vf-act" id="vf-offer" href="' + esc(offerMail(up)) + '">' + ICON_DOC + "<span>" + L("Angebot anfordern", "Request a quote") + "</span></a>" : "";
    $("vf-note").classList.remove("vf-open");
    $("vf-note").innerHTML = "";
    hl = null;
    reveal();
  }

  // ---------- sanftes Einblenden beim Scrollen, von oben nach unten nacheinander ----------
  var io = null, queue = [], qTimer = null, firstReveal = true;
  function reveal() {
    var sel = "#vf-intro, #vf-cal .vf-month, #vf-cal .vf-dow, #vf-cal .vf-week, #vf-sum .vf-total, #vf-sum .vf-item, #vf-actions .vf-act";
    var els = [].slice.call(document.querySelectorAll(sel)).filter(function (n) { return n.offsetParent !== null || n.id === "vf-intro"; });
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!firstReveal || reduce || !("IntersectionObserver" in window)) { firstReveal = false; return; } // Neu-Aufbau (z. B. Sprachwechsel): sofort stehen, ohne Bewegung
    firstReveal = false;
    els.forEach(function (n) { n.classList.add("vf-rv"); });
    prepAnim();
    // Erst die Überschrift aufbauen lassen (wie auf index.html), dann kurz warten und einblenden
    var box = document.querySelector("#vf-app .scaling-container"), t0 = Date.now();
    (function wait() {
      // Startet, sobald die Überschrift-Box sichtbar wird – der Rest baut sich parallel dazu auf
      var done = !box || parseFloat(getComputedStyle(box).opacity) > 0.35 || Date.now() - t0 > 2500;
      if (!done) return setTimeout(wait, 50);
      setTimeout(function () { startObserver(els); }, 120);
    })();
  }
  function startObserver(els) {
    io = new IntersectionObserver(function (list) {
      list.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); queue.push(en.target); } });
      queue.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
      if (!qTimer) flush();
    }, {rootMargin: "0px 0px -8% 0px", threshold: 0.05});
    els.forEach(function (n) { io.observe(n); });
  }
  function flush() {
    var n = queue.shift();
    if (!n) { qTimer = null; return; }
    n.classList.add("vf-rv-in");
    if (anim.bars && n.classList.contains("vf-week") && n.querySelector(".vf-bar.vf-pre")) queueWeek(n);
    if (n._stagger) { var gs = n._stagger; n._stagger = null; setTimeout(gs, 150); }
    qTimer = setTimeout(flush, 90);
  }
  // ---------- Balken- und Zahlen-Animation (nur beim ersten Laden) ----------
  var anim = {bars: null, nums: null};
  // Jeder Balken wächst einzeln in der Breite, sobald seine Woche beim Scrollen ins Bild kommt:
  // leicht anlaufend, dann zügig, am Ende sanft abgebremst. Der Rahmen der Option bleibt dünn, die Schrift steht.
  function bezier(x1, y1, x2, y2) {
    return function (t) {
      var lo = 0, hi = 1, u = t;
      for (var i = 0; i < 20; i++) { u = (lo + hi) / 2; var x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u; if (x < t) lo = u; else hi = u; }
      return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
    };
  }
  var growEase = bezier(0.4, 0, 0.12, 1);
  // Wochen, die kurz nacheinander ins Bild kommen, werden gesammelt. Balkenstücke desselben Zeitraums
  // wachsen dann als ein durchgehender Balken (ein Anlauf, ein Abbremsen am Ende des letzten Stücks).
  var weekQueue = [], weekTimer = null;
  function queueWeek(week) {
    weekQueue.push(week);
    clearTimeout(weekTimer);
    weekTimer = setTimeout(function () { var ws = weekQueue; weekQueue = []; growWeeks(ws); }, 260);
  }
  function growWeeks(weeks) {
    var groups = {}, order = [];
    weeks.forEach(function (wk) {
      [].slice.call(wk.querySelectorAll(".vf-bar.vf-pre")).forEach(function (b) {
        var id = b.getAttribute("data-id");
        if (!groups[id]) { groups[id] = []; order.push(id); }
        groups[id].push(b);
      });
    });
    // Verschiedene Zeiträume (z. B. gebucht, direkt danach Option) wachsen nacheinander, nicht als ein Balken
    var delay = 0;
    order.forEach(function (id) {
      var bars = groups[id];
      setTimeout(function () { growStrip(bars); }, delay);
      delay += Math.min(2000, 1100 + (bars.length - 1) * 300) - 250;
    });
  }
  function growStrip(bars) {
    if (!bars[0].classList.contains("vf-pre")) return;
    bars.forEach(function (b) { b.classList.remove("vf-pre"); b.style.width = ""; });
    var w = bars.map(function (b) { return b.getBoundingClientRect().width; }), total = w.reduce(function (a, b) { return a + b; }, 0), t0 = null;
    var ms = Math.min(2000, 1100 + (bars.length - 1) * 300);
    bars.forEach(function (b) { b.classList.add("vf-grow"); b.style.width = "0px"; b.style.visibility = "hidden"; });
    (function f(ts) {
      if (ts === undefined) return requestAnimationFrame(f);
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / ms), x = growEase(p) * total, off = 0;
      bars.forEach(function (b, i) { var px = Math.max(0, Math.min(w[i], x - off)); b.style.width = px.toFixed(1) + "px"; b.style.visibility = px > 0 ? "" : "hidden"; off += w[i]; });
      if (p < 1) requestAnimationFrame(f);
      else bars.forEach(function (b) { b.classList.remove("vf-grow"); b.style.width = ""; b.style.visibility = ""; });
    })();
  }
  function prepAnim() {
    var bars = [].slice.call(document.querySelectorAll("#vf-cal .vf-bar"));
    if (bars.length) { bars.forEach(function (b) { b.classList.add("vf-pre"); }); anim.bars = true; }
    // Summenzeilen: Teile minimal versetzt nacheinander einblenden (Datum, Arbeitstage, Tagessatz, Gesamt)
    [].slice.call(document.querySelectorAll("#vf-sum .vf-total-link")).forEach(function (btn) {
      var parts = [], cur = [];
      [].slice.call(btn.children).forEach(function (c) {
        cur.push(c);
        if (!c.classList.contains("vf-dot")) { parts.push(cur); cur = []; } // Punkt erscheint mit dem folgenden Teil
      });
      if (cur.length) parts.push(cur);
      parts.forEach(function (g) { g.forEach(function (c) { c.style.opacity = "0"; c.style.transition = "opacity .7s ease"; }); });
      btn.closest(".vf-total")._stagger = function () {
        parts.forEach(function (g, i) {
          setTimeout(function () { g.forEach(function (c) { c.style.opacity = ""; }); }, i * 160);
        });
        setTimeout(function () { parts.forEach(function (g) { g.forEach(function (c) { c.style.transition = ""; }); }); }, parts.length * 160 + 800);
      };
    });
  }
  function showError(code) {
    var msg = code === "unknown_key" || code === "missing_key"
      ? L("Dieser Link ist leider nicht (mehr) gültig. Schreib mir kurz, dann schicke ich dir einen neuen.", "This link is no longer valid. Drop me a line and I’ll send you a new one.")
      : L("Der Kalender konnte gerade nicht geladen werden. Versuch es bitte gleich noch einmal oder schreib mir kurz.", "The calendar couldn’t be loaded right now. Please try again in a moment or drop me a line.");
    $("vf-sum").innerHTML = '<p class="vf-total">' + msg + '</p><p class="vf-total"><a class="super-hover" style="--initial-color:#BFABFF;--hover-color:#f0ff96" href="mailto:' + MAIL + '">' + MAIL + "</a></p>";
    ["vf-intro", "vf-cal", "vf-actions", "vf-note"].forEach(function (id) { $(id).innerHTML = ""; });
  }

  // ---------- hover: Übersicht ↔ Balken im Kalender ----------
  // „*“ = alle, „firm“ = feste, „firm-c“/„firm-o“ = feste abgeschlossene/offene Zeiträume
  function hlIds(id) {
    var up0 = upcoming(), hasFirm = up0.some(function (x) { return x.kind !== "option"; });
    if (id === "*") return up0.map(function (x) { return x.id; });
    if (id.indexOf("firm") !== 0) return [id];
    return up0.filter(function (x) { return (!hasFirm || x.kind !== "option") && (id === "firm" || (id === "firm-o") === !!x.open); }).map(function (x) { return x.id; });
  }
  function setHl(id) {
    if (id === hl) return; hl = id;
    $("vf-cal").classList.toggle("vf-hlmode", !!id);
    document.querySelectorAll(".vf-hl").forEach(function (n) { n.classList.remove("vf-hl"); });
    document.querySelectorAll(".vf-hlday").forEach(function (n) { n.classList.remove("vf-hlday"); });
    if (!id) return;
    // „*“ = alle Zeiträume, „firm“ = nur feste (ohne Optionen, außer es gibt nur Optionen)
    var up0 = upcoming(), hasFirm = up0.some(function (x) { return x.kind !== "option"; });
    var ids = hlIds(id);
    if (id === "*" || id.indexOf("firm") === 0) document.querySelectorAll('[data-hl="' + id + '"]').forEach(function (n) { n.classList.add("vf-hl"); });
    // Summenzeilen, zu denen die Balken gehören, ebenfalls hervorheben
    document.querySelectorAll("#vf-sum .vf-total-link").forEach(function (n) {
      var g = hlIds(n.getAttribute("data-hl"));
      if (ids.some(function (x) { return g.indexOf(x) >= 0; }) && (id === n.getAttribute("data-hl") || id.indexOf("firm") !== 0 && id !== "*")) n.classList.add("vf-hl");
    });
    ids.forEach(function (one) {
      document.querySelectorAll('.vf-bar[data-id="' + one + '"],[data-hl="' + one + '"]').forEach(function (n) { n.classList.add("vf-hl"); });
      var e = state.entries.find(function (x) { return x.id === one; }); if (!e) return;
      document.querySelectorAll(".vf-day[data-date]").forEach(function (n) { var d = n.dataset.date; if (!isOff(parse(d)) && d >= e.start && d <= e.end) n.classList.add("vf-hlday"); });
    });
  }
  function hlTarget(el) { var t = el && el.closest && el.closest("#vf-app [data-hl],#vf-app .vf-bar,#vf-app .vf-day[data-bar]"); return t ? (t.dataset.hl || t.dataset.id || t.dataset.bar) : null; }
  document.addEventListener("pointerover", function (ev) {
    if (!state) return;
    setHl(hlTarget(ev.target));
    var cur = document.getElementById("mouseCursor");
    if (cur) cur.classList.toggle("vf-big", !!(ev.target.closest && ev.target.closest("#vf-app .vf-total-link,#vf-app .vf-act,#vf-app .vf-intro-link,#vf-app .vf-bar,#vf-lang")));
  });
  document.addEventListener("focusin", function (ev) { if (state) setHl(hlTarget(ev.target)); });
  document.addEventListener("focusout", function () { if (state) setHl(null); });

  function scrollToEl(el) {
    var r = el.getBoundingClientRect(), y = window.scrollY + r.top - window.innerHeight / 2 + r.height / 2;
    if (window.__lenis) window.__lenis.scrollTo(y, {duration: 1.2}); else window.scrollTo({top: y, behavior: "smooth"});
  }

  // ---------- clicks ----------
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (t.closest("#vf-lang")) { ev.preventDefault(); setLang(lang === "en" ? "de" : "en"); try { history.replaceState(null, "", location.pathname + location.search + (lang === "en" ? "#en" : "")); } catch (e) {} render(); return; }
    if (!state) return;
    var b = t.closest("#vf-copy");
    if (b) {
      copyText(infoText(upcoming())).then(function () {
        b.classList.add("vf-done"); b.innerHTML = ICON_CHECK + "<span>" + L("Kopiert", "Copied") + "</span>";
        setTimeout(function () { b.classList.remove("vf-done"); b.innerHTML = ICON_COPY + "<span>" + L("Infos kopieren", "Copy details") + "</span>"; }, 2000);
      });
      return;
    }
    var bar = t.closest("#vf-app .vf-bar");
    if (bar) {
      // zur passenden Summenzeile (bei offen + abgeschlossen gibt es zwei)
      var tot = [].slice.call(document.querySelectorAll("#vf-sum .vf-total-link")).filter(function (x) { return hlIds(x.getAttribute("data-hl")).indexOf(bar.dataset.id) >= 0; })[0];
      tot = tot ? tot.closest(".vf-total") : document.querySelector("#vf-sum .vf-total");
      if (tot) scrollToEl(tot);
      setHl(bar.dataset.id);
      return;
    }
    if (t.closest(".vf-intro-link, .vf-total-link")) {
      // Zum ersten (bei der Summenzeile: ersten festen) Balken scrollen, sonst zum Kalender
      var tl = t.closest(".vf-total-link"), isTot = !!tl, hid = isTot ? tl.getAttribute("data-hl") : "*";
      var gid = hlIds(hid)[0];
      var bar = (gid && document.querySelector('#vf-cal .vf-bar[data-id="' + gid + '"]')) || document.querySelector("#vf-cal .vf-bar") || $("vf-cal");
      var r = bar.getBoundingClientRect(), y = window.scrollY + r.top - window.innerHeight / 2 + r.height / 2;
      if (window.__lenis) window.__lenis.scrollTo(y, {duration: 1.2}); else window.scrollTo({top: y, behavior: "smooth"});
      setHl(hid);
      return;
    }
    var tb = t.closest("#vf-terms");
    if (tb) {
      // Konditionen: den kleinen Text darunter ein- bzw. ausblenden
      var open = !$("vf-note").classList.contains("vf-open");
      $("vf-note").classList.toggle("vf-open", open); tb.setAttribute("aria-expanded", open);
      return;
    }
    if (t.closest("#vf-ics")) { download("martin-speidel-verfuegbarkeit.ics", icsFile(upcoming()), "text/calendar;charset=utf-8"); return; }
  });

  // ---------- load ----------
  setLang(lang);
  render();
  var key = new URLSearchParams(location.search).get("k") || "";
  if (!key) { showError("missing_key"); return; }
  fetch("buchung.php?k=" + encodeURIComponent(key), {cache: "no-store"})
    .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j && j.error || "error"); return j; }); })
    .then(function (j) { state = j; state.entries = state.entries || []; render(); })
    .catch(function (e) { showError(e && e.message); });
})();
