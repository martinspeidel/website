(function ($) {
    "use strict";

    gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger, ScrollToPlugin, InertiaPlugin, ScrollSmoother, Flip);

    gsap.config({
		nullTargetWarn: false
	});

    var mobileQuery = window.matchMedia('(max-width: 450px)');

    var keys = {
        37: 1,
        38: 1,
        39: 1,
        40: 1
    };

    function preventDefault(e) {
        e.preventDefault();
    }

    function preventDefaultForScrollKeys(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    // modern Chrome requires { passive: false } when adding event
    var supportsPassive = false;
    try {
        window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
            get: function () {
                supportsPassive = true;
            }
        }));
    } catch (e) {}

    var wheelOpt = supportsPassive ? {
        passive: false
    } : false;
    var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    // call this to Disable
    function disableScroll() {
        if ($('body').hasClass('smooth-scroll')) {


            let aliothSmoother = ScrollSmoother.get();
            aliothSmoother != null ? aliothSmoother.paused(true) : '';

        } else {

            window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
            window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
            window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
            window.addEventListener('keydown', preventDefaultForScrollKeys, false);
        }
    }

    // call this to Enable
    function enableScroll() {

        if ($('body').hasClass('smooth-scroll')) {

            let aliothSmoother = ScrollSmoother.get();
            aliothSmoother != null ? aliothSmoother.paused(false) : '';


        } else {
            window.removeEventListener('DOMMouseScroll', preventDefault, false);
            window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
            window.removeEventListener('touchmove', preventDefault, wheelOpt);
            window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
        }

    }


    var siteHeader = $('.site-header'),
        page = $('main'),
        body = $('body'),
        mouseCursor = $('#mouseCursor'),
        cursorDark, cursorLight, cursorY,
        scrollSmoother,
        $cursorInner = ' <div class="mouse-cursor-icon"></div><svg height="100%" width="100%" viewbox="0 0 100 100"><circle class="main-circle" cx="50" cy="50" r="40" /></svg><span class="mouse-cursor-text"></span>';

    mouseCursor.append($cursorInner);


    // Match Medias

    var matchMedia = gsap.matchMedia(),
        isPhone = '(max-width: 450px)',
        isTablet = '(min-width: 450px) and (max-width: 900px)',
        isDesktop = '(min-width: 900px)';

    /** Mouse Cursor **/
    function naylaMouseCursor(init) {

        var mouseCursor = $('#mouseCursor'),
            $cursorInner = ' <div class="mouse-cursor-icon"></div><svg height="100%" width="100%" viewbox="0 0 100 100"><circle class="main-circle" cx="50" cy="50" r="40" /></svg><span class="mouse-cursor-text"></span>';

        if (mouseCursor.length) {


            mouseCursor.append($cursorInner);

            let cursorText = mouseCursor.children('.mouse-cursor-text').wrapInner('<span></span>'),
                cursorIcon = mouseCursor.children('.mouse-cursor-icon'),
                yperc,
                cursorActive;



            gsap.set(mouseCursor, {
                xPercent: -50,
                yPercent: -50
            });


            let xTo = gsap.quickTo(mouseCursor, "x", {
                    duration: 0.6,
                    ease: "power3"
                }),
                yTo = gsap.quickTo(mouseCursor, "y", {
                    duration: 0.6,
                    ease: "power3"
                });


            function icko(e) {

                xTo(e.clientX);
                yTo(e.clientY);

                cursorY = e.clientY

            }

            window.addEventListener("mousemove", icko);

            // * Default Hover Stte *//

            function defaultHover(targets) {

                $(targets).on('mouseenter', function () {

                    mouseCursor.addClass('hover-size')

                })

                $(targets).on('mouseleave', function () {

                    mouseCursor.removeClass('hover-size');
                })



            }


            defaultHover('a , .menu-toggle, .rotate-text-area , .project-slide-button, button, .hover-classic, .cv-toggle,  .scroll-button');



            function textHover(targets) {

                $(targets).on('mouseenter', function () {

                    let $this = $(this),
                        text = $this.data('cursor-text');

                    mouseCursor.addClass('hover-size');
                    mouseCursor.addClass('hover-text');
                    cursorText.children('span').html(text)

                })

                $(targets).on('mouseleave', function () {

                    mouseCursor.removeClass('hover-size');
                    mouseCursor.removeClass('hover-text');

                    cursorText.find('span').empty()
                })

            }

            textHover('.cursor-text')


            function iconHover(targets) {

                $(targets).on('mouseenter', function () {

                    let $this = $(this),
                        icon = $this.data('cursor-icon'),
                        lib = $this.data('lib');


                    icon == null ? icon = 'arrow_outward' : '';

                    cursorIcon.attr('data-icon', icon);

                    cursorIcon.css({
                        "font-family": '"' + lib + '"'
                    });

                    mouseCursor.addClass('hover-size');
                    mouseCursor.addClass('hover-icon');

                })

                $(targets).on('mouseleave', function () {

                    mouseCursor.removeClass('hover-size');
                    mouseCursor.removeClass('hover-icon');
                })
            }

            iconHover('.cursor-icon, .showcase-carousel .showcase-project a');

            mouseCursor.hasClass('dark') ? cursorDark = true : '';
            mouseCursor.hasClass('light') ? cursorLight = true : '';


            function dragHover(targets) {

                $(targets).on('mouseenter', function (e) {

                    let $this = $(this),
                        winWidth = $(window).outerWidth();

                    mouseCursor.addClass('hover-size');
                    mouseCursor.addClass('hover-icon');

                })

                $(targets).on('mouseleave', function () {

                    mouseCursor.removeClass('hover-size');
                    mouseCursor.removeClass('hover-icon');
                })


                $(targets).on('mousemove', function (e) {


                    let $this = $(this),
                        winWidth = $(window).outerWidth();


                    if (e.clientX < winWidth / 2) {

                        cursorIcon.attr('data-icon', 'arrow_back');

                    } else {

                        cursorIcon.attr('data-icon', 'arrow_forward');
                    }

                })


            }

            dragHover('.drag-hover')

            function zoomHover(targets) {


                $(targets).on('mouseenter', function (e) {

                    if (!$(targets).hasClass('img-lightbox-open')) {

                        let $this = $(this),
                            winWidth = $(window).outerWidth();

                        mouseCursor.addClass('hover-size');
                        mouseCursor.addClass('hover-icon');

                        cursorIcon.attr('data-icon', 'fullscreen');

                    }

                })

                $(targets).on('click', function (e) {

                    mouseCursor.removeClass('hover-size');
                    mouseCursor.removeClass('hover-icon');

                })

                $(targets).on('mouseleave', function (e) {

                    mouseCursor.removeClass('hover-size');
                    mouseCursor.removeClass('hover-icon');

                })

                $('.lightbox-focus').on('mouseenter', function () {

                    mouseCursor.addClass('hover-size');
                    mouseCursor.addClass('hover-icon');

                    cursorIcon.attr('data-icon', 'fullscreen_exit');


                })

                $('.lightbox-focus').on('mouseleave', function () {

                    mouseCursor.removeClass('hover-size');
                    mouseCursor.removeClass('hover-icon');


                })

                $('.lightbox-focus').children('span').on('mouseenter', function () {

                    gsap.to(mouseCursor, {
                        opacity: .5
                    })

                })

                $('.lightbox-focus').children('span').on('mouseleave', function () {

                    gsap.to(mouseCursor, {
                        opacity: 1
                    })

                })



            }
            zoomHover('.zoom-hover')


        }

    }


    mouseCursor.hasClass('dark') ? cursorDark = true : '';
    mouseCursor.hasClass('light') ? cursorLight = true : '';

    function cursorLayoutChange(layout, color, reset) {

        mouseCursor.removeClass('dark light');

        if (reset) {

            cursorDark ? mouseCursor.addClass('dark') : '';
            cursorLight ? mouseCursor.addClass('light') : '';

        }

        if (color) {

            let hsl = gsap.utils.splitColor(color, true),
                lightness = hsl[hsl.length - 1];

            lightness <= 50 ? mouseCursor.addClass('light') : '';
            lightness > 50 ? mouseCursor.addClass('dark') : '';


        } else if (layout) {

            layout === 'light' ? mouseCursor.addClass('light') : '';
            layout === 'dark' ? mouseCursor.addClass('dark') : '';
        }

    }


    var winLoaded;
    winLoaded = false


    $(window).on('load', function () {

        setTimeout(function () {
            winLoaded = true

        }, 100)

    })

    function pageLoader() {

        if ($('.page-loader').length) {

            let perc = $('.page-loader-percentage'),
                totImages,
                loadedImages,
                percentage,
                minTime = 5,
                img = $('.page-loader-logo').children('img'),
                caption = $('.page-loader-caption'),
                countLabels = [0],
                i = 0,
                loader = $('.page-loader');

            loader.append('<div class="page-loader-overlays"></div>');

            let overlays = loader.find('.page-loader-overlays');

            if (loader.hasClass('columns')) {

                overlays.addClass('columns')

                for (i = 0; i <= 4; i++) {

                    overlays.append('<span class="loader-col"></span>');
                }

            } else if (loader.hasClass('overlay')) {

                overlays.addClass('overlay')

                for (i = 0; i <= 4; i++) {

                    overlays.append('<span class="loader-overlay"></span>');
                }


            } else if (loader.hasClass('blocks')) {

                overlays.addClass('blocks')

                for (i = 0; i <= 9; i++) {

                    overlays.append('<span class="loader-block"><span></span></span>');
                }


            } else {

                overlays.addClass('columns')

                for (i = 0; i <= 4; i++) {

                    overlays.append('<span class="loader-col"></span>');
                }

            }


            if (img.length) {

                img.clone().addClass('clone').insertAfter(img)
            }

            countLabels.push(Math.floor(gsap.utils.random(20, 30)));
            countLabels.push(Math.floor(gsap.utils.random(40, 60)));
            countLabels.push(Math.floor(gsap.utils.random(60, 80)));
            countLabels.push(100);

            perc.append('<div class="page-loader-count"></div>');

            countLabels.forEach(element => $('.page-loader-count').append('<span class="count_' + element + '">' + element + '</span>'));


            var innerTl = gsap.timeline({
                id: 'innerTl',
                paused: true,
                onStart: () => {
                    gsap.set('.page-loader', {
                        background: 'transparent'
                    });
                },
                onComplete: () => {
                    gsap.set('.page-loader', {
                        height: 0,
                        visibility: 'hidden'
                    });
                }
            })

            let tl = gsap.timeline({
                delay: .1,
                id: 'pageLoaderAnimation',
                onStart: () => {
                    $('html').addClass('loading');
                },
                onComplete: () => {

                    if (winLoaded == true) {



                        setTimeout(function () {


                            if (overlays.hasClass('columns')) {

                                let div = $('.page-loader > div').not('.page-loader-overlays');

                                innerTl.to(div, {
                                    opacity: 0,
                                    yPercent: -100,
                                    ease: 'power3.in'
                                })


                                innerTl.to('.loader-col', {
                                    height: '0%',
                                    delay: 0,
                                    id: 'loader-end',
                                    stagger: {
                                        grid: [1, 20],
                                        from: "random",
                                        amount: .3,

                                    },
                                    duration: 1.2,
                                    ease: 'expo.out',
                                    onStart: () => {

                                        let instance = ScrollTrigger.getAll(),
                                            i = 0;


                                        for (i = 0; i < instance.length; i++) {

                                            instance[i].enable();

                                        }

                                        ScrollTrigger.refresh(true)

                                        $('html').removeClass('loading');

                                    },
                                    onComplete: () => {

                                        transitions.removeClass('half')

                                    }

                                })

                                innerTl.play()


                            } else if (overlays.hasClass('overlay')) {

                                let div = $('.page-loader > div').not('.page-loader-overlays');

                                innerTl.to(div, {
                                    opacity: 0,
                                    yPercent: -100,
                                    ease: 'power3.in'
                                })


                                innerTl.to('.loader-overlay', {
                                    height: '0%',
                                    delay: 0,
                                    duration: 1,
                                    ease: 'expo.inOut',
                                    onStart: () => {
                                        setTimeout(function () {


                                            let instance = ScrollTrigger.getAll(),
                                                i = 0;


                                            for (i = 0; i < instance.length; i++) {

                                                instance[i].enable();

                                            }

                                            ScrollTrigger.refresh(true)


                                            $('html').removeClass('loading');
                                        }, 50)

                                    },
                                    onComplete: () => {

                                        transitions.removeClass('half')

                                    }

                                })

                                innerTl.play()

                            } else if (overlays.hasClass('blocks')) {

                                let div = $('.page-loader > div').not('.page-loader-overlays');

                                innerTl.to(div, {
                                    opacity: 0,
                                    yPercent: -100,
                                    ease: 'power3.in'
                                })


                                innerTl.to('.loader-block span', {
                                    height: '0%',
                                    stagger: -0.03,
                                    delay: 0,
                                    duration: 1,
                                    ease: 'power1.out',
                                    onStart: () => {



                                        let instance = ScrollTrigger.getAll(),
                                            i = 0;


                                        for (i = 0; i < instance.length; i++) {

                                            instance[i].enable();

                                        }

                                        ScrollTrigger.refresh(true)

                                        $('html').removeClass('loading');


                                    },
                                    onComplete: () => {
                                        transitions.removeClass('half')

                                    }

                                });

                                innerTl.play()

                            }

                        }, 100)

                    } else {

                        window.onload = function () {


                            setTimeout(function () {

                                if (overlays.hasClass('columns')) {

                                    let div = $('.page-loader > div').not('.page-loader-overlays');

                                    innerTl.to(div, {
                                        opacity: 0,
                                        yPercent: -100,
                                        ease: 'power3.in'
                                    })


                                    innerTl.to('.loader-col', {
                                        height: '0%',
                                        delay: 0,
                                        id: 'loader-end',
                                        stagger: {
                                            grid: [1, 20],
                                            from: "random",
                                            amount: .3,

                                        },
                                        duration: 1.2,
                                        ease: 'expo.out',
                                        onStart: () => {

                                            let instance = ScrollTrigger.getAll(),
                                                i = 0;


                                            for (i = 0; i < instance.length; i++) {

                                                instance[i].enable();

                                            }

                                            ScrollTrigger.refresh(true)


                                            $('html').removeClass('loading');

                                        },
                                        onComplete: () => {

                                            transitions.removeClass('half')

                                        }

                                    })

                                    innerTl.play()


                                } else if (overlays.hasClass('overlay')) {

                                    let div = $('.page-loader > div').not('.page-loader-overlays');

                                    innerTl.to(div, {
                                        opacity: 0,
                                        yPercent: -100,
                                        ease: 'power3.in'
                                    })


                                    innerTl.to('.loader-overlay', {
                                        height: '0%',
                                        delay: 0,
                                        duration: 1,
                                        ease: 'expo.inOut',
                                        onStart: () => {
                                            setTimeout(function () {


                                                let instance = ScrollTrigger.getAll(),
                                                    i = 0;


                                                for (i = 0; i < instance.length; i++) {

                                                    instance[i].enable();

                                                }

                                                ScrollTrigger.refresh(true)


                                                $('html').removeClass('loading');
                                            }, 50)

                                        },
                                        onComplete: () => {

                                            transitions.removeClass('half')

                                        }

                                    })

                                    innerTl.play()

                                } else if (overlays.hasClass('blocks')) {

                                    let div = $('.page-loader > div').not('.page-loader-overlays');

                                    innerTl.to(div, {
                                        opacity: 0,
                                        yPercent: -100,
                                        ease: 'power3.in'
                                    })


                                    innerTl.to('.loader-block span', {
                                        height: '0%',
                                        stagger: -0.03,
                                        delay: 0,
                                        duration: 1,
                                        ease: 'power1.out',
                                        onStart: () => {




                                            let instance = ScrollTrigger.getAll(),
                                                i = 0;


                                            for (i = 0; i < instance.length; i++) {

                                                instance[i].enable();

                                            }

                                            ScrollTrigger.refresh(true)

                                            $('html').removeClass('loading');


                                        },
                                        onComplete: () => {
                                            transitions.removeClass('half')

                                        }

                                    });

                                    innerTl.play()

                                }


                            }, 100)



                        };
                    }



                }
            });




            if (caption.length) {

                new SplitText(caption, {
                    type: 'lines, chars',
                    linesClass: 'capt_line',
                    charsClass: 'capt_char'
                })

                let lines = caption.find('.capt_line'),
                    chars = caption.find('.capt_char');


                lines.clone().addClass('clone').appendTo(caption)

                gsap.from(chars, {
                    yPercent: 100,
                    duration: .75,
                    stagger: 0.02,
                    delay: .5,
                    ease: 'expo.out',
                    onStart: () => {

                        gsap.set(caption, {
                            visibility: 'visible'
                        })

                    }
                })


            }


            $('body').imagesLoaded()

                .progress(function (instance, image) {


                    totImages = instance.images.length;
                    loadedImages = instance.progressedCount;
                    percentage = 100 / (totImages / loadedImages);

                    let snapPerc = gsap.utils.snap(countLabels, percentage);

                    if (perc.length) {

                        let countFind = '.count_' + snapPerc + '',
                            transVal = $(countFind).position().top,
                            calc = 100 / snapPerc,
                            calcWin = $(window).outerHeight() / calc,
                            i = 0,
                            spacing = mobileQuery.matches ? 60 : 150;


                        tl.to('.page-loader-count', {
                            y: -1 * $(countFind).position().top,
                            duration: 1,
                            ease: 'expo.inOut'
                        }, 'label_' + snapPerc);

                        tl.to(perc, {
                            y: -1 * (calcWin - (calcWin != 0 ? perc.outerHeight() : 0) - (calcWin == $(window).outerHeight() ? spacing : 0)),
                            duration: 1,
                            ease: 'expo.inOut'
                        }, 'label_' + snapPerc);
                    }

                    if (img.length) {
                        let logoMask = 'inset(' + (100 - percentage) + '% 0% 0% 0%)'

                        tl.to('img.clone', {
                            clipPath: logoMask
                        }, 'label_' + snapPerc);
                    }

                    if (caption.length) {


                        let capt = caption.find('.capt_line.clone'),
                            wido = percentage + '%'

                        tl.to(capt, {
                            width: wido,
                            duration: 1,
                            ease: 'expo.inOut'
                        }, 'label_' + snapPerc);

                    }

                }).done(function () {


                });

        }



    };


    var naylaSmoother = false;

    function smoothScroll() {

        let body = $('body');

        if (body.hasClass('smooth-scroll')) {

            naylaSmoother = true;

            $('#page').wrap('<div id="smooth-wrapper"></div>');
            $('main').wrap('<div id="smooth-content"></div>');

            if ((!siteHeader.hasClass('fixed')) && (!siteHeader.hasClass('sticky'))) {

                siteHeader.prependTo('#smooth-content')
                $('.menu-overlay').prependTo('#smooth-content')

            }

            $('#footer').appendTo('#smooth-content')

            let options = $('.smooth-scroll-options'),
                strength = options.data('smooth'),
                normalize = options.data('normalize'),
                speed = options.data('speed'),
                touch = options.data('touch'),
                touchStrength = options.data('touch-strength');

            let wrap = $('#smooth-wrapper');
            let cont = $('#smooth-content');

            var smoother = ScrollSmoother.create({
                wrapper: wrap,
                content: cont,
                smooth: strength,
                speed: speed,
                normalizeScroll: normalize,

            });

        }

    }

    var headerLight = false,
        headerDark = true;


    if (siteHeader.hasClass('light')) {
        headerLight = true
        headerDark = false
    }


    function headerLayoutChange(layout, color, smooth, reset) {

        if (!siteHeader.hasClass('blend')) {

            function resetHeader() {

                if (smooth) {

                    let tl = gsap.timeline({

                    });

                    tl.to(siteHeader, {
                        opacity: 0,
                        duration: 0.175,
                        ease: 'none',
                        onComplete: () => {
                            siteHeader.removeClass('dark light');

                        }
                    }, 0);

                    tl.to(siteHeader, {
                        opacity: 1,
                        duration: 0.175,
                        ease: 'none',
                        onStart: () => {
                            headerLight ? siteHeader.addClass('light') : '';
                            headerDark ? siteHeader.addClass('dark') : '';

                        }
                    }, 0.2)

                } else {

                    siteHeader.removeClass('dark light')

                    setTimeout(function () {

                        headerDark ? siteHeader.addClass('dark') : '';
                        headerLight ? siteHeader.addClass('light') : '';

                    })


                };


            }

            function changeLayout() {

                siteHeader.removeClass('dark light')

                if (color) {

                    let hsl = gsap.utils.splitColor(color, true),
                        lightness = hsl[hsl.length - 1];

                    lightness < 50 ? siteHeader.addClass('light') : '';
                    lightness > 50 ? siteHeader.addClass('dark') : '';



                } else if (layout) {

                    layout === 'light' ? siteHeader.addClass('light') : '';
                    layout === 'dark' ? siteHeader.addClass('dark') : '';
                }
            }

            function smoothChange() {

                let tl = gsap.timeline();

                tl.to(siteHeader, {
                    opacity: 0,
                    duration: 0.175,
                    ease: 'none',
                    onComplete: () => {
                        changeLayout();
                    }
                });

                tl.to(siteHeader, {
                    opacity: 1,
                    duration: 0.175,
                    ease: 'none',
                })

            }

            reset ? resetHeader() : '';
            smooth ? smoothChange() : changeLayout();

        }


    }

    function naylaDynamicList() {

        let list = $('.nayla-dynamic-list');


        list.each(function () {

            let list = $(this),
                item = list.find('ul').children('li'),
                image = item.find('.list-image'),
                animation = list.data('animation'),
                scrub = list.data('scrub');

            animation ? list.find('a').addClass(animation) : '';
            scrub ? list.find('a').data('scrub', true) : '';


            item.each(function () {

                let $this = $(this);

                animation ? new naylaTextAnimation($this.find('a')) : '';

                $this.find('a').on('mouseenter', () => {

                    list.addClass('hovered');
                    $this.addClass('current');

                })

                $this.find('a').on('mousemove', function (e) {

                    let mouseLeft = e.clientX,
                        mouseTop = e.clientY,
                        myLeft = mouseLeft - $this.offset().left,
                        myTop = mouseTop - $this.offset().top + $(window).scrollTop(),
                        movX = event.movementX < 0 ? event.movementX * -1 : event.movementX;

                    gsap.to(image, {
                        left: myLeft,
                        top: myTop,
                        duration: 1,
                        ease: 'power3.out',
                    })

                })

                $this.find('a').on('mouseleave', () => {

                    list.removeClass('hovered');
                    $this.removeClass('current');

                })



            })




        })




    }



    function naylaHeader() {

        var siteHeader = $('.site-header');

        var headerHeight = siteHeader.outerHeight(),
            stickyTargets = siteHeader.find('.hide-sticky'),
            logo = $('.site-logo'),
            stickyLogo = $('.sticky-logo'),
            headerPaddingTop = siteHeader.children('div').css('paddingTop'),
            headerPaddingBottom = siteHeader.children('div').css('paddingBottom'),
            resetDelay = 1,
            fixed,
            sticky,
            dynamic;

        matchMedia.add({
            isMobile: "(max-width: 450px)"

        }, (context) => {
            let {
                isMobile
            } = context.conditions;

            if (siteHeader.hasClass('blend')) {

                gsap.set(siteHeader, {
                    mixBlendMode: 'exclusion'
                })

            }

            return () => {

            }
        });


        function animateLogos(direction) {

            if (stickyLogo) {

                let tl = gsap.timeline();

                if (direction == 'play') {

                    tl.to(logo, {
                        opacity: 0,
                        duration: 0.35,
                        onComplete: () => {
                            logo.hide()
                        }
                    })

                    tl.fromTo(stickyLogo, {
                        opacity: 0
                    }, {
                        opacity: 1,
                        duration: 0.35,
                        onStart: () => {
                            stickyLogo.show()
                        }
                    });


                } else if (direction == 'reverse') {


                    tl.to(stickyLogo, {
                        opacity: 0,
                        duration: 0.35,
                        onComplete: () => {
                            stickyLogo.hide()
                        }
                    })

                    tl.fromTo(logo, {
                        opacity: 0
                    }, {
                        opacity: 1,
                        duration: 0.35,
                        onStart: () => {
                            logo.show()
                        }
                    });
                }

            }

        }

        animateLogos()

        if (siteHeader.hasClass('sticky')) {
            sticky = true;
        }

        if (siteHeader.hasClass('fixed')) {
            fixed = true;

            resetDelay = 0.1
        }

        if (siteHeader.hasClass('dynamic')) {
            dynamic = true;
        } else {
            dynamic = false;
        }

        function resetHeader(stAnim) {

            animateLogos('reverse');


            if (dynamic != true) {

                if (sticky) {

                    gsap.to(siteHeader, {
                        duration: .6,
                        onComplete: () => {
                            siteHeader.removeClass('sticked');

                            headerLight ? siteHeader.addClass('light') : siteHeader.removeClass('light');
                            headerDark ? siteHeader.addClass('dark') : siteHeader.removeClass('dark');

                            gsap.set(siteHeader, {
                                clearProps: 'all'
                            })

                        }
                    })

                    gsap.to(siteHeader.children('div'), {
                        paddingTop: headerPaddingTop,
                        paddingBottom: headerPaddingBottom,
                        duration: .6,
                        ease: 'power1.inOut',
                        onComplete: () => {

                            gsap.set(siteHeader.children('div'), {
                                clearProps: 'all'
                            })

                        }

                    })

                    if (stickyTargets.length) {

                        gsap.to(stickyTargets, {
                            opacity: 1,
                            yPercent: 0,
                            duration: .6,
                            ease: 'power1.inOut'
                        })

                    }



                } else if (fixed) {

                    siteHeader.removeClass('sticked');
                }

            } else {

                siteHeader.removeClass('sticked');

            }
            //            ScrollTrigger.getById('stickyAnim').disable()
        }

        var delayedCall = gsap.delayedCall(resetDelay, resetHeader);
        delayedCall.kill();


        function fixedHeader() {

            var fixedStart = 'top top',
                allInstances = ScrollTrigger.getAll();



            allInstances.forEach(function (st) {


                if ((st.pin != null) && (st.start <= 0)) {

                    fixedStart = 'top+=' + st.end + ' top';
                }

            })



            ScrollTrigger.create({
                trigger: $('body').hasClass('smooth-scroll') ? '#smooth-content' : 'body',
                start: fixedStart,
                end: 'bottom bottom',
                id: 'fixed_header',
                onEnter: () => {


                    animateLogos('play');

                    if (stickyTargets.length) {
                        gsap.to(stickyTargets, {
                            opacity: 0,
                            y: -50,
                            stagger: 0.05,
                            duration: .35,
                            ease: 'power3.in',
                            overwrite: true
                        })
                    }

                },
                onLeaveBack: () => {

                    resetHeader();

                    if (stickyTargets.length) {
                        gsap.to(stickyTargets, {
                            opacity: 1,
                            y: 0,
                            duration: 1.5,
                            stagger: 0.1,
                            ease: 'expo.out',
                            overwrite: true
                        })
                    }
                }

            })

            let fixedHeader = ScrollTrigger.getById('fixed_header');





        }

        if (siteHeader.hasClass('fixed')) {

            setTimeout(function () {

                fixedHeader()
            }, 20)


        }

        function dynamicHeader() {

            var fixedStart,
                allInstances = ScrollTrigger.getAll();

            allInstances.forEach(function (st) {

                if ((st.pin != null) && (st.start <= 0)) {

                    fixedStart = 'top+=' + st.vars.end + ' top';

                    ScrollTrigger.create({
                        trigger: 'body',
                        pin: siteHeader,
                        start: 'top top',
                        end: fixedStart,
                        id: 'header_pin'
                    })


                }

            })



        }


        if (siteHeader.hasClass('dynamic')) {

            setTimeout(function () {
                dynamicHeader()
            }, 20)
        }


        function stickyHeader() {

            let stickyStart = 'top+=1000 center',
                stickyReset = 'top top',
                topPin = [],
                smoothSticky;


            var stickyAnim = ScrollTrigger.create({
                trigger: "body",
                start: 'top top',
                end: 'bottom bottom',
                id: 'stickyAnim',
                onEnter: () => {

                    if (smoothSticky != null) {
                        smoothSticky.disable();
                    }

                },
                onUpdate: function (self) {

                    if (self.direction == -1) {
                        gsap.to(siteHeader, {
                            y: '0%'
                        })

                    } else if (self.direction == 1) {

                        gsap.to(siteHeader, {
                            y: '-100%'
                        })
                    }

                },

            });

            var allInstances = ScrollTrigger.getAll();

            stickyAnim.disable();

            allInstances.forEach(function (st) {

                if ((st.pin != null) && (st.start <= 0)) {
                    topPin.push(st);
              
                }

            })

            if (topPin.length) {

                stickyStart = 'top+=' + (600 + topPin[0].end) + ' center';
                stickyReset = 'top+=' + topPin[0].end + ' top';

                if ($('body').hasClass('smooth-scroll')) {

                    let pin = ScrollTrigger.create({
                        trigger: 'body',
                        pin: siteHeader,
                        start: 'top top',
                        end: stickyReset,
                        scroller: '#smooth-content'

                    })

                } else {

                    let pin = ScrollTrigger.create({
                        trigger: '#page',
                        pin: siteHeader,
                        start: 'top top',
                        end: stickyReset,

                    })
                }
                
          

                ScrollTrigger.create({
                    trigger: 'body',
                    start: stickyReset,
                    end: stickyStart,
                    onLeave: () => {

                        gsap.set(stickyTargets, {
                            opacity: 0,
                            yPercent: -100
                        })

                        siteHeader.hasClass('sticky-dark') ? siteHeader.addClass('dark') : siteHeader.removeClass('dark');
                        siteHeader.hasClass('sticky-light') ? siteHeader.addClass('light') : siteHeader.removeClass('light');


                        gsap.set(siteHeader, {
                            y: '-100%'
                        })
                        stickyAnim.enable();
                        siteHeader.addClass('sticked');
                        animateLogos('play')

                    },
                    onLeaveBack: () => {

                        siteHeader.removeClass('sticked');
                        stickyAnim.disable();
                        animateLogos('reverse')
                    },
                    onEnter: () => {
                        delayedCall.kill();

                        headerLight ? siteHeader.addClass('light') : siteHeader.removeClass('light');
                        headerDark ? siteHeader.addClass('dark') : siteHeader.removeClass('dark');
                    }

                })

            } else {

                if ($('body').hasClass('smooth-scroll')) {

                    gsap.to(siteHeader.children('div'), {
                        yPercent: -100,
                        scrollTrigger: {
                            trigger: 'body',
                            start: 'top top',
                            end: 'top+=' + siteHeader.outerHeight() + ' top',
                            scrub: true,
                            id: 'smoothSticky'
                        }
                    })

                    smoothSticky = ScrollTrigger.getById('smoothSticky');

                }

                ScrollTrigger.create({
                    trigger: 'body',
                    start: 'top top',
                    end: 'top+=1000 center',
                    onLeave: () => {

                        gsap.set(stickyTargets, {
                            opacity: 0,
                            yPercent: -100
                        })

                        if (siteHeader.hasClass('light')) {
                            headerLight = true
                            headerDark = false
                        } else {
                            headerLight = false
                            headerDark = true

                        }

                        siteHeader.hasClass('sticky-dark') ? siteHeader.addClass('dark') : siteHeader.removeClass('dark');
                        siteHeader.hasClass('sticky-light') ? siteHeader.addClass('light') : siteHeader.removeClass('light');



                        gsap.to(siteHeader, {
                            y: '-100%'
                        })

                        stickyAnim.enable();
                        siteHeader.addClass('sticked');
                        animateLogos('play')

                    },
                    onLeaveBack: (self) => {
                        delayedCall.restart(true);
                        stickyAnim.disable();

                        if (smoothSticky != null) {

                            smoothSticky.enable();

                        }


                    },
                    onEnter: () => {
                        delayedCall.kill();
                    }

                })

            }

        }

        if (siteHeader.hasClass('sticky')) {

            setTimeout(function () {
                stickyHeader()

            }, 20)


        }


    }


    function siteNavigation() {


        // Classic Navigation //

        var resetNavigation = '';

        function classicNavigation() {

            let nav = $('#site-navigation.classic'),
                overlay = $('.menu-overlay'),
                headerHeight = siteHeader.outerHeight(),
                subBg = nav.data('sub-background');


            if (nav.hasClass('one-page')) {

                nav.children('ul').children('li').each(function () {

                    let $this = $(this),
                        target = $this.children('a').attr('href');

                    $this.find('a').on('click', (e) => {

                        e.preventDefault()

                    })

                    $this.find('a').addClass('nayla-scroll-button');

                    $this.find('a').attr('data-scroll-to', target);

                })

            }


            let hasChild = nav.find('.main-menu').children('.nayla-has-children');

            var resetHeader = gsap.delayedCall(.7, headerLayoutChange, [false, false, false, true]);
            resetHeader.kill();

            setTimeout(function () {

                hasChild.each(function (i) {

                    $(this).addClass('sub_id_' + i);

                    let $this = $(this),
                        classes = $this.attr('class'),
                        arr = classes.split(' '),
                        tltl = gsap.timeline({
                            id: 'sub_menu_tl_' + i
                        }),
                        x = 0;

                    $this.find('.nayla-sub-menu-wrap').addClass('sub_' + i).insertBefore(siteHeader)

                    var subTl = gsap.getById('sub_menu_tl_' + i);

                    for (x = 0; x < arr.length; x++) {

                        if (arr[x].includes('sub_id')) {

                            var subid = arr[x].split('_')[2];
                            $this.attr('data-sub-id', subid);

                            let sub = '.sub_' + subid,
                                bg = $(sub).css('backgroundColor'),
                                overlay = $(sub).find('.sub-menu-overlay'),
                                ht = $(sub).outerHeight() + siteHeader.outerHeight(),
                                gs = gsap.fromTo($(sub), {
                                    height: 0
                                }, {
                                    height: ht,
                                    duration: 1,
                                    ease: 'power3.inOut',
                                    onStart: () => {
                                        $(sub).addClass('active');

                                        setTimeout(function () {

                                            headerLayoutChange(false, bg, false, false)

                                        }, 350)
                                    },
                                    onReverseComplete: () => {
                                        $(sub).removeClass('active')

                                    }
                                });


                            $(sub).insertBefore(siteHeader)

                            gsap.set($(sub).children('div').children('.elementor-section'), {
                                paddingTop: siteHeader.outerHeight()
                            })

                            subTl.add(gs, (0))
                            subTl.pause();

                        }
                    }


                    $this.children('a').on('mouseenter', function () {

                        subTl.restart(true);
                        resetHeader.kill()

                    })

                    $this.children('a').on('mouseleave', function () {

                        subTl.reverse(true);
                        resetHeader.restart(true);

                    })

                    let findSub = '.sub_' + $this.data('sub-id');

                    $(findSub).on('mouseenter', function () {



                        let $this = $(this),
                            bg = $this.children('div').children('.elementor-section').css('backgroundColor');

                        cursorLayoutChange(false, bg, false)




                        subTl.pause();
                        resetHeader.kill()

                    })

                    $(findSub).on('mouseleave', function () {

                        subTl.reverse(true);
                        resetHeader.restart(true);
                        cursorLayoutChange(false, false, true)


                    })

                })



            }, 90)




            if (nav.length) {


                nav.each(function () {

                    let $this = $(this),
                        menu = $this.children('ul'),
                        menuItems = menu.children('li');

                    menuItems.each(function () {

                        let menuItem = $(this),
                            link = menuItem.children('a');

                        link.wrapInner('<span class="hov_span" data-text="' + link.text() + '"></span>');
                    })

                })

            }

        }
        classicNavigation();

        function menuItemAnims(menu, direction) {

            menu.each(function () {

                let items = $(this).children('li'),
                    targets = [items.children('a').find('.mt_char'), items.children('.sub-toggle')],
                    val = items.outerHeight(),
                    stg = 0.02;

                $(this).hasClass('sub-menu') ? stg = 0.01 : '';

                if ((direction === 'in') && (targets.length > 0)) {

                    gsap.fromTo(targets, {
                        y: val
                    }, {
                        y: 0,
                        stagger: stg,

                        duration: 1.5,
                        ease: 'expo.out',
                        overwrite: true,
                        onStart: () => {
                            $(this).addClass('active');
                        },

                    })
                } else if ((direction === 'out') && (targets.length > 0)) {

                    var animOut = gsap.fromTo(targets, {
                        y: 0
                    }, {
                        y: -1 * val,
                        stagger: 0.005,
                        overwrite: true,
                        duration: .5,
                        ease: 'expo.in',
                        onStart: () => {
                            $(this).addClass('animating')
                        },
                        onComplete: () => {

                            $(this).removeClass('active')
                            $(this).removeClass('animating')
                        }

                    })

                }

            })

        }

        // Fullscreen Navigation //
        function fullscreenNavigation() {

            let nav = $('#site-navigation.fullscreen_menu'),
                wrapper = nav.children('.fullscreen-menu-wrapper'),
                mainMenu = nav.find('.main-menu'),
                headerHeight = $('.site-header').outerHeight(),
                items = mainMenu.find('li a'),
                hasChildren = mainMenu.find('li.menu-item-has-children');

            items.addClass('menu-link');

            if (nav.length) {

                hasChildren.each(function () {

                    let childLength = $(this).find('li').not('.sub-menu-title').length;
                    $(this).append('<span class="sub-toggle">(' + childLength + ')</span>');

                })

                mainMenu.append('<span class="sub-close"><span class="material-icons">close</span></span>')

                let subClose = nav.find('.sub-close');

                new SplitText(items, {
                    type: 'lines, chars',
                    linesClass: 'mt_line',
                    charsClass: 'mt_char'
                })

                wrapper.css('paddingTop', headerHeight + 50);

                hasChildren.children('.sub-toggle').on('click', function () {

                    let $this = $(this).parent('li'),
                        parentMenu = $this.parent('ul'),
                        subMenu = $this.children('.sub-menu-wrapper').children('.sub-menu');

                    subClose.addClass('active')

                    parentMenu.length ? menuItemAnims(parentMenu, 'out') : '';
                    gsap.delayedCall(.5, menuItemAnims, [subMenu, "in"]);

                })

                hasChildren.children('a').on('click', function () {

                    let parentLi = $(this).parent('li'),
                        toggle = parentLi.children('.sub-toggle');

                    $(this).attr('href').length <= 2 ? toggle.click() : '';

                })

                // Closing Sub Menus //
                subClose.on('click', function () {

                    let outMenu = nav.find('ul.sub-menu.active'),
                        inMenu = outMenu.parent('div').parent('li').parent('ul');

                    menuItemAnims(outMenu, 'out');
                    gsap.delayedCall(.5, menuItemAnims, [inMenu, "in"]);

                    if (inMenu.hasClass('main-menu')) {

                        subClose.removeClass('active')
                    }

                })

            }

        }
        fullscreenNavigation();

        // Menu Toggle //

        function menuToggle(targetMenu) {

            var menuToggle = $('.menu-toggle'),
                overlay = $('.menu-overlay'),
                text = menuToggle.find('.toggle-text'),
                closeText = text.attr('data-close-text'),
                bgColor = $('#site-navigation.fullscreen_menu').css('backgroundColor');

            text.wrapInner('<span data-close-text="' + closeText + '"></span>');

            var headerReset = gsap.delayedCall(1, headerLayoutChange, [false, false, false, true]);
            headerReset.kill();


            setTimeout(function () {

                let navTweens = gsap.getTweensOf(targetMenu.find('*').not('.main-menu *, .nayla-button, .nayla-button *')),
                    i = 0,
                    tltl = gsap.timeline({
                        id: 'fs_menu_tl'
                    });

                if (navTweens.length > 0) {

                    for (i = 0; i < navTweens.length; i++) {

                        if (navTweens[i]) {


                            if (navTweens[i].parent) {

                                navTweens[i].parent.pause()
                                navTweens[i].parent.scrollTrigger !== null ? navTweens[i].parent.scrollTrigger.kill() : '';
                                tltl.add(navTweens[i], (0 + i / 10))

                            } else {

                                navTweens[i].pause()
                                navTweens[i].scrollTrigger !== null ? navTweens[i].scrollTrigger.kill() : '';
                                tltl.add(navTweens[i], (0 + i / 10))
                            }

                        }

                    }

                } else {

                    return;

                }

                tltl.pause();


                menuToggle.on('click', function () {

                    var clicks = $(this).data('clicks'),
                        mainMenu = targetMenu.find('.menu.main-menu');



                    if (clicks) {

                        enableScroll();

                        let activeMenu = targetMenu.find('ul.menu.active, ul.sub-menu.active');
                        targetMenu.find('.sub-close').removeClass('active');

                        $('html').hasClass('loading') ? '' : headerReset.restart(true);

                        menuItemAnims(activeMenu, 'out');

                        tltl.timeScale(3)
                        tltl.reverse();

                        gsap.killTweensOf(overlay);

                        gsap.to(targetMenu, {
                            height: 0,
                            duration: .7,
                            delay: .5,
                            ease: 'expo.inOut',
                            onComplete: () => {
                                menuToggle.removeClass('active');
                                targetMenu.removeClass('active');
                                siteHeader.removeClass('menu-open');
                            }
                        })

                    } else {



                        disableScroll();

                        menuToggle.addClass('active')
                        targetMenu.addClass('active');
                        siteHeader.addClass('menu-open');

                        headerReset.kill();

                        headerLayoutChange(false, bgColor, false, false);


                        menuItemAnims(mainMenu, 'in');

                        gsap.killTweensOf(overlay);

                        gsap.to(targetMenu, {
                            height: '100vh',
                            duration: 1,
                            delay: 0,
                            ease: 'expo.out',
                        })

                        tltl.timeScale(1)
                        tltl.restart(true);



                    }

                    $(this).data("clicks", !clicks);

                })

            }, 100)



        }

        menuToggle($('#site-navigation.fullscreen_menu'));


    }



    /////////////////////////////////
    //  General Scroll Animations  //
    /////////////////////////////////

    class naylaGeneralAnimations {

        DOM = {
            el: null,
        };

        animations = ['fadeIn', 'fadeUp', 'fadeDown', 'fadeLeft', 'fadeRight', 'scaleIn', 'slideUp', 'slideLeft', 'slideRight', 'maskUp', 'maskDown', 'maskLeft', 'maskRight', 'maskCustom'];

        // Animation Defaults
        defaults = {

            duration: 1,
            delay: 0,
            stagger: 0,
            ease: 'power1.inOut',

        };

        // Animation start stages
        from = {

        }

        // Scroll options
        scroll = {
            scrollTrigger: {
                trigger: null,
                scrub: null,
                pin: null,
                start: 'top bottom',
                pinSpacing: 'margin',
            }
        }

        out = {
            yPercent: null,
            stagger: null,
            duration: null,
            ease: 'expo.in',
            delay: 0
        }

        constructor(DOM_el, options, fromOptions, scroll, out) {

            this.DOM.el = DOM_el;
            this.stagger = $(this.DOM.el).data('stagger');
            this.duration = $(this.DOM.el).data('duration');
            this.delay = $(this.DOM.el).data('delay');
            this.scrub = $(this.DOM.el).data('scrub');
            this.pin = $(this.DOM.el).data('pin');
            this.animOut = $(this.DOM.el).data('out');
            this.target = $(this.DOM.el).data('trigger');

            this.target == null ? this.scroll.scrollTrigger.trigger = this.DOM.el : this.scroll.scrollTrigger.trigger = $(this.target);


            this.progress = 0;

            this.pin == null ? this.pin = false : '';
            this.scrub == null ? this.scrub = false : '';

            this.animOut == null ? this.animOut = false : '';

            this.classes = this.DOM.el.attr('class').split(' ');

            let animations = this.animations,
                classes = this.classes;

            const activeAnimation = classes.filter(function (obj) {
                return animations.indexOf(obj) !== -1;
            });


            // Set Animation Targets
            this.target = $(this.DOM.el);
            this.img = $(this.DOM.el).children('img');
            ////

            this.scaleimage = false;
            classes.includes('imgScale') ? this.scaleimage = true : '';

            this.from.visibility = 'visible'
            // Defaults for animations

            if (activeAnimation[0] === 'fadeIn') {

                this.from.opacity = 0;

                this.defaults.opacity = 1;
                this.defaults.duration = 1.25;

            }

            if ((activeAnimation[0] === 'fadeUp') || (activeAnimation[0] === 'fadeDown')) {

                this.from.opacity = 0;


                activeAnimation[0] === 'fadeUp' ? this.from.y = 100 : this.from.yPercent = -100;

                this.defaults.opacity = 1;
                this.defaults.y = 0;

                this.defaults.duration = 1.25;


                this.scroll.scrollTrigger.start = 'top-=100 bottom'

            }

            if ((activeAnimation[0] === 'fadeLeft') || (activeAnimation[0] === 'fadeRight')) {

                this.from.opacity = 0;

                activeAnimation[0] === 'fadeLeft' ? this.from.xPercent = 100 : this.from.xPercent = -100;

                this.defaults.opacity = 1;
                this.defaults.xPercent = 0;
                this.defaults.duration = 1.25;

            }

            if (activeAnimation[0] === 'scaleIn') {

                this.target.attr('data-start') == null ? this.from.scale = 0 : this.from.scale = this.target.attr('data-start');

                this.target.css('transformOrigin', this.target.attr('data-origin'))

                this.defaults.scale = 1;

                this.scrub || this.pin ? this.defaults.ease = 'none' : this.defaults.ease = 'power4.out';
            }

            if ((activeAnimation[0] === 'slideRight') || (activeAnimation[0] === 'slideLeft')) {

                let leftVal = this.target.offset().left + this.target.outerWidth(),
                    rightVal = $(window).outerWidth() - leftVal + this.target.outerWidth();

                activeAnimation[0] === 'slideRight' ? this.from.x = -1 * leftVal : this.from.x = rightVal;

                this.defaults.x = 0
                this.defaults.duration = 2
                this.defaults.ease = 'power4.out'

                this.scrub || this.pin ? this.defaults.ease = 'none' : this.defaults.ease = 'power4.out';
            }

            if ((activeAnimation[0] === 'slideUp')) {

                this.from.y = $(window).outerHeight();

                this.scroll.scrollTrigger.trigger = this.target[0].offsetParent;

                this.defaults.y = 0
                this.defaults.duration = 2
                this.defaults.ease = 'expo.out'

                this.scrub || this.pin ? this.defaults.ease = 'none' : this.defaults.ease = 'expo.out';

            }



            if (activeAnimation[0] === 'maskUp' || activeAnimation[0] === 'maskDown' || activeAnimation[0] === 'maskLeft' || activeAnimation[0] === 'maskRight' || activeAnimation[0] === 'maskCustom') {


                activeAnimation[0] === 'maskUp' ? this.from.clipPath = 'inset(100% 0% 0% 0%)' : '';
                activeAnimation[0] === 'maskDown' ? this.from.clipPath = 'inset(0% 0% 100% 0%)' : '';
                activeAnimation[0] === 'maskRight' ? this.from.clipPath = 'inset(0% 100% 0% 0%)' : '';
                activeAnimation[0] === 'maskLeft' ? this.from.clipPath = 'inset(0% 0% 0% 100%)' : '';

                if (activeAnimation[0] === 'maskCustom') {

                    let startWidth = this.target.data('width'),
                        startLeft = this.target.data('left'),
                        startPath = 'inset(0% ' + (100 - startWidth - startLeft) + '% 0% ' + startLeft + '%)';

                    this.from.clipPath = startPath

                }

                this.defaults.clipPath = 'inset(0% 0% 0% 0%)'
                this.defaults.duration = 2

                this.scrub || this.pin ? this.defaults.ease = 'none' : this.defaults.ease = 'power4.inOut';

            }


            // Return default if data is null
            this.stagger == null ? this.stagger = this.defaults.stagger : '';
            this.delay == null ? this.delay = this.defaults.delay : '';
            this.duration == null ? this.duration = this.defaults.duration : '';

            // Asign options
            this.options = Object.assign(this.defaults, options);
            this.fromOptions = Object.assign(this.from, fromOptions);
            this.scroll = Object.assign(this.scroll, scroll);

            this.options.stagger = this.stagger;
            this.options.delay = this.delay;
            this.options.duration = this.duration;

            if (this.pin) {

                this.scrub = true

                this.scroll.scrollTrigger.pin = true;
                this.scroll.scrollTrigger.scrub = 1;
                this.scroll.scrollTrigger.start = 'center center';


                this.scroll.scrollTrigger.end = this.duration == null ? 'botom top' : 'bottom+=' + (this.duration * 1000) + ' top';
            }

            if ((this.scrub) && (!this.pin)) {
                this.scroll.scrollTrigger.scrub = 1;
                this.scroll.scrollTrigger.start = 'top bottom';
                this.scroll.scrollTrigger.end = 'top center'

            }

            if (this.animOut) {

                this.out.stagger = this.options.stagger;
                this.out.duration = this.options.duration;

                this.out = Object.assign(this.out, out);

            }

            this.render();
        }

        render() {

            var tl = gsap.timeline(this.scroll)

            tl.fromTo(this.target, this.fromOptions, this.options);



            this.animOut == true ? this.tl.to(this.target, this.out) : '';

            tl.eventCallback("onComplete", () => {

                $(this.DOM.el).addClass('is-inview');

                if (!this.scrub) {
                    gsap.set($(this.DOM.el), {

                        clearProps: 'clipPath,transform,rotate,scale,translate'
                    })
                }

            });

            tl.eventCallback("onStart", () => {

                $(this.DOM.el).addClass('anim_start')

            });


        }

    };


    function naylaGeneralAnims(target) {

        target.each(function () {

            let $this = $(this);

            new naylaGeneralAnimations($this)

        })

    }

    /////////////////////////////////
    //   Image Scroll Animations   //
    /////////////////////////////////

    function naylaParallaxImages() {

        var image = $('div.single-image.parallax-image');

        image.each(function () {

            let $this = $(this),
                img = $this.find('img'),
                width = $this.outerWidth(),
                height = $this.outerHeight(),
                speed = $this.data('parallax-speed') == null ? 60 : $this.data('parallax-speed'),
                parallaxVal = height * (speed / 100),
                imgHeight = 'calc(100% + ' + parallaxVal + 'px)';

            $this.wrapInner('<div class="image-parallax-wrap"></div>');

            let wrap = $this.find('.image-parallax-wrap');

            $this.css('height', height);

            wrap.css('height', imgHeight)


            gsap.from(wrap, {
                y: -parallaxVal,
                ease: 'none',
                id: 'parallaximg',
                scrollTrigger: {
                    trigger: $this,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                    onUpdate: () => {

                    }
                }
            })

        })

    }

    class naylaImageAnimation {

        DOM = {
            el: null,
            image: null
        };

        animations = ['slideLeft', 'slideRight', 'slideUp', 'slideDown', 'blockUp', 'blockLeft', 'blockRight', 'blockDown', 'maskCustom'];

        // Animation Defaults
        defaults = {

            duration: 1,
            delay: 0,
            stagger: 0,
            ease: 'expo.out',

        };

        // Animation start stages
        from = {
            yPercent: 0,

        }

        // Scroll options
        scroll = {
            scrollTrigger: {
                trigger: null,
                scrub: null,
                pin: null,
                start: 'top bottom',
            }
        }

        out = {
            yPercent: null,
            stagger: null,
            duration: null,
            ease: 'expo.in',
            delay: 0
        }


        constructor(DOM_el, options, fromOptions, scroll, out) {

            this.DOM.el = DOM_el;

            this.duration = $(this.DOM.el).data('duration');
            this.delay = $(this.DOM.el).data('delay');
            this.scrub = $(this.DOM.el).data('scrub');
            this.pin = $(this.DOM.el).data('pin');
            this.animOut = $(this.DOM.el).data('anim-out');
            this.imageScale = $(this.DOM.el).data('image-scale');

            this.scroll.scrollTrigger.trigger = this.DOM.el;

            this.classes = this.DOM.el.attr('class').split(' ');

            let animations = this.animations,
                classes = this.classes;

            const activeAnimation = classes.filter(function (obj) {
                return animations.indexOf(obj) !== -1;
            });

            this.pin == null ? this.pin = false : '';
            this.scrub == null ? this.scrub = false : '';
            this.imageScale == null ? this.imageScale = false : '';

            this.animOut == null ? this.animOut = false : '';
            // Set Animation Targets
            this.target = $(this.DOM.el);
            this.img = $(this.DOM.el).children('img');
            ////

            this.scaleimage = false;
            this.imageScale == true ? this.scaleimage = true : '';


            if (activeAnimation[0] === 'maskCustom') {

                let startWidth = this.target.data('width'),
                    startLeft = this.target.data('left'),
                    startPath = 'inset(0% ' + (100 - startWidth - startLeft) + '% 0% ' + startLeft + '%)';

                this.from.clipPath = startPath

            }

            this.defaults.clipPath = 'inset(0% 0% 0% 0%)'
            this.defaults.duration = 2
            this.defaults.ease = 'power4.inOut'


            // Defaults for animations

            if (activeAnimation[0] === 'slideLeft') {

                this.from.clipPath = 'inset(0% 0% 0% 100%)';

                this.defaults.clipPath = 'inset(0% 0% 0% 0%)';
                this.defaults.duration = 2;

                this.animOut ? this.out.clipPath = 'inset(0% 100% 0% 0%)' : '';

            }

            if (activeAnimation[0] === 'slideRight') {

                this.from.clipPath = 'inset(0% 100% 0% 0%)';

                this.defaults.clipPath = 'inset(0% 0% 0% 0%)';
                this.defaults.duration = 1.25;

                this.animOut ? this.out.clipPath = 'inset(0% 0% 0% 100%)' : '';

            }

            if (activeAnimation[0] === 'slideUp') {

                this.from.clipPath = 'inset(100% 0% 0% 0%)';

                this.defaults.clipPath = 'inset(0% 0% 0% 0%)';
                this.defaults.duration = 2;

                this.animOut ? this.out.clipPath = 'inset(0% 0% 100% 0%)' : '';

            }

            if (activeAnimation[0] === 'slideDown') {

                this.from.clipPath = 'inset(0% 0% 100% 0%)';

                this.defaults.clipPath = 'inset(0% 0% 0% 0%)';
                this.defaults.duration = 1.25;

                this.defaults.ease = 'power3.inOut';
                this.animOut ? this.out.clipPath = 'inset(100% 0% 0% 0%)' : '';
            }

            if ((activeAnimation[0] === 'blockUp') || (activeAnimation[0] === 'blockDown') || (activeAnimation[0] === 'blockLeft') || (activeAnimation[0] === 'blockRight')) {


                $(this.DOM.el).append('<span class="block-ov"></div>');
                this.target = $(this.DOM.el).find('.block-ov');

                let bg = $(this.DOM.el).data('block-color');

                if (bg === 'auto') {

                    let imgSrc = $(this.DOM.el).find('img').attr('src')

                    colorjs.average(imgSrc, {
                        amount: 1
                    }).then(imgColor => {

                        $(this.DOM.el).find('.block-ov').css('backgroundColor', "rgb" + "(" + imgColor + ")");

                    })

                } else {
                    $(this.DOM.el).find('.block-ov').css('backgroundColor', $(this.DOM.el).data('block-color'));
                }

                activeAnimation[0] === 'blockUp' ? this.from.height = '100%' : '';


                if ((activeAnimation[0] === 'blockUp') || (activeAnimation[0] === 'blockDown')) {
                    this.defaults.height = '0%';
                    this.animOut ? this.out.height = '100%' : '';

                }

                if ((activeAnimation[0] === 'blockLeft') || (activeAnimation[0] === 'blockRight')) {
                    this.defaults.width = '0%';

                    this.animOut ? this.out.width = '100%' : '';
                }


                this.defaults.duration = 1;
                this.defaults.ease = 'expo.inOut';

            }


            // Return default if data is null

            this.delay == null ? this.delay = this.defaults.delay : '';
            this.duration == null ? this.duration = this.defaults.duration : '';

            this.scrub == null ? this.scrub = false : '';


            // Asign options
            this.options = Object.assign(this.defaults, options);
            this.fromOptions = Object.assign(this.from, fromOptions);
            this.scroll = Object.assign(this.scroll, scroll);

            if (this.pin) {

                this.scrub = true

                this.scroll.scrollTrigger.pin = true;
                this.scroll.scrollTrigger.scrub = 1;
                this.scroll.scrollTrigger.start = 'center center';

                this.scroll.scrollTrigger.end = this.duration == null ? 'botom top' : 'bottom+=' + (this.duration * 1000) + ' top';
            }

            if ((this.scrub) && (!this.pin)) {

                this.scroll.scrollTrigger.scrub = 1;
                this.scroll.scrollTrigger.start = 'top bottom';
                this.scroll.scrollTrigger.end = 'bottom center'
            }

            if (this.animOut) {

                this.out.stagger = this.options.stagger;
                this.out.duration = this.options.duration;

                this.out = Object.assign(this.out, out);

            }

            this.options.delay = this.delay;
            this.options.duration = this.duration;
            this.scroll.scrollTrigger.scrub = this.scrub




            // If anim out

            if (this.animOut) {

                this.out.stagger = this.options.stagger;
                this.out.duration = this.options.duration;

                this.out = Object.assign(this.out, out);

            } else {

                this.out = null;
            }

            requestAnimationFrame(() => this.render());
        }

        render() {


            var tl = gsap.timeline(this.scroll)


            tl.fromTo(this.target, this.fromOptions, this.options);

            if (this.scaleimage) {

                tl.fromTo(this.img, {
                    scale: 1.2
                }, {
                    scale: 1,
                    duration: this.options.duration,
                    ease: this.options.ease,
                    delay: this.options.delay
                }, 0)

            }



            this.animOut == true ? tl.to(this.target, this.out) : '';

            tl.eventCallback("onStart", () => {

                $(this.DOM.el).addClass('anim_start')
            });




        }

    };


    function naylaImageAnims() {

        $('.has-anim-image').each(function () {


            let $this = $(this);
            new naylaImageAnimation($this);

        })
    }


    /////////////////////////////////
    //    Text Scroll Animations   //
    /////////////////////////////////

    class naylaTextAnimation {

        DOM = {
            el: null,
            chars: null,
            words: null,
            lines: null
        };

        animations = ['charsUp', 'charsDown', 'charsRight', 'charsLeft', 'wordsUp', 'wordsDown', 'linesUp', 'linesDown', 'charsFadeOn', 'wordsFadeOn', 'linesFadeOn', 'charsScaleUp', 'charsScaleDown', 'charsRotateIn', 'charsFlipUp', 'charsFlipDown', 'linesMask', 'wordsJustifyCollapse', 'wordsJustifyExpand', 'slideLeft', 'slideRight'];

        // Animation Defaults
        defaults = {
            yPercent: 0,
            duration: 1,
            delay: 0,
            stagger: 0,
            ease: 'expo.out',
            x: 0,
        };

        // Animation start stages
        from = {
            yPercent: 0,
            x: 0
        }

        // Scroll options
        scroll = {
            scrollTrigger: {
                trigger: null,
                scrub: null,
                pin: null,
                start: 'top bottom',
                onEnter: () => {

                    $(this.DOM.el).addClass('viewport-enter')

                }
            }
        }

        out = {
            yPercent: null,
            stagger: null,
            duration: null,
            ease: 'expo.in',
            delay: 0
        }

        constructor(DOM_el, options, fromOptions, scroll, out) {

            this.DOM.el = DOM_el;
            this.stagger = $(this.DOM.el).data('stagger');
            this.duration = $(this.DOM.el).data('duration');
            this.delay = $(this.DOM.el).data('delay');
            this.scrub = $(this.DOM.el).data('scrub');
            this.pin = $(this.DOM.el).data('pin');
            this.animOut = $(this.DOM.el).data('out');
            this.target = $(this.DOM.el).data('trigger');


            this.target == null ? this.scroll.scrollTrigger.trigger = this.DOM.el : this.scroll.scrollTrigger.trigger = $(this.target);

            this.progress = 0;

            // Set default inetraction settings
            this.pin == null ? this.pin = false : '';
            this.scrub == null ? this.scrub = false : '';

            this.animOut == null ? this.animOut = false : '';

            this.classes = this.DOM.el.attr('class').split(' ');

            let animations = this.animations,
                classes = this.classes;

            const activeAnimation = classes.filter(function (obj) {
                return animations.indexOf(obj) !== -1;
            });

            const isFade = classes.includes('fade'),
                isMask = classes.includes('mask'),
                noRevert = classes.includes('no-revert');

            isFade ? this.from.opacity = 0 : '';
            isFade ? this.defaults.opacity = 1 : '';

            noRevert ? this.noRevert = true : '';

            this.anim = activeAnimation[0];

            activeAnimation[0].includes('chars') ? this.type = 'chars, lines' : '';
            activeAnimation[0].includes('words') ? this.type = 'words' : '';
            activeAnimation[0].includes('lines') ? this.type = 'lines' : '';
            activeAnimation[0].includes('Justify') ? this.type = 'lines, words' : '';


            this.split = new SplitText(this.DOM.el, {
                type: this.type,
                charsClass: 'anim_char',
                linesClass: 'anim_line',
                wordsClass: 'anim_word',
                reduceWhiteSpace: true
            })


            // Set Animation Targets

            if (activeAnimation[0].includes('words')) {

                $(this.DOM.el).find('.anim_word').wrapInner('<span></span>')
                this.target = $(this.DOM.el).find('.anim_word').children('span');
            }

            if (activeAnimation[0].includes('chars')) {

                $(this.DOM.el).find('.anim_char').wrapInner('<span></span>')
                this.target = $(this.DOM.el).find('.anim_char').children('span');
            }

            if (activeAnimation[0].includes('lines')) {

                $(this.DOM.el).find('.anim_line').wrapInner('<span></span>')
                this.target = $(this.DOM.el).find('.anim_line').children('span');
            }

            // Defaults for animations

            if (activeAnimation[0] === 'charsUp') {

                this.from.yPercent = 100;

                this.defaults.yPercent = 0;
                this.defaults.stagger = 0.05;
                this.defaults.duration = 2;



                this.animOut ? this.out.yPercent = -100 : '';

            }

            if (activeAnimation[0] === 'charsDown') {

                this.from.yPercent = -100

                this.defaults.stagger = 0.035;
                this.defaults.duration = 2;

                this.animOut ? this.out.yPercent = 100 : '';
            }

            if (activeAnimation[0] === 'charsRight') {

                let arr = [];
                $(this.DOM.el).find('.anim_char').each(function () {
                    arr.push($(this).outerWidth())
                })

                this.from.x = -1 * Math.max(...arr)

                this.defaults.stagger = -0.035;
                this.defaults.duration = 1.5;

                this.animOut ? this.out.x = this.from.x * -1 : '';
            }

            if (activeAnimation[0] === 'charsLeft') {

                let arr = [];

                $(this.DOM.el).find('.anim_char').each(function () {
                    arr.push($(this).outerWidth())
                })

                this.from.x = Math.max(...arr)

                this.defaults.stagger = 0.035;
                this.defaults.duration = 1.5;

                this.animOut ? this.out.x = this.from.x * -1 : '';
            }

            if (activeAnimation[0] === 'wordsUp') {

                this.from.yPercent = 100

                this.defaults.stagger = 0.025;
                this.defaults.duration = 2;

                this.animOut ? this.out.yPercent = -100 : '';
            }

            if (activeAnimation[0] === 'wordsDown') {

                this.from.yPercent = -100

                this.defaults.stagger = -0.01;
                this.defaults.duration = 2;
            }

            if (activeAnimation[0] === 'linesUp') {

                this.from.yPercent = 100

                this.defaults.stagger = 0.15;
                this.defaults.duration = 2;
                this.defaults.ease = 'expo.out';
            }

            if (activeAnimation[0] === 'linesDown') {

                this.from.yPercent = -100

                this.defaults.stagger = -0.1;
                this.defaults.duration = 1.5;
            }

            if (activeAnimation[0] === 'charsFadeOn') {

                isMask ? this.from.opacity = 0.01 : this.from.opacity = 0;

                this.defaults.opacity = 1;

                this.defaults.stagger = 0.01;
                this.defaults.duration = 1.5;

                this.animOut ? this.out.opacity = 0 : '';
                this.animOut ? this.out.stagger = -0.01 : '';
                this.animOut ? this.out.ease = 'none' : '';
            }

            if (activeAnimation[0] === 'wordsFadeOn') {

                isMask ? this.from.opacity = 0.1 : this.from.opacity = 0;


                this.defaults.opacity = 1;

                this.defaults.stagger = 0.02;
                this.defaults.duration = 3;
            }

            if (activeAnimation[0] === 'linesFadeOn') {

                isMask ? this.from.opacity = 0.01 : this.from.opacity = 0;

                this.defaults.opacity = 1;

                this.defaults.stagger = 0.1;
                this.defaults.duration = 2;
            }

            if ((activeAnimation[0] === 'charsScaleUp') || (activeAnimation[0] === 'charsScaleDown')) {
                this.from.scaleY = 0

                this.defaults.scaleY = 1
                this.defaults.stagger = 0.05;
                this.defaults.duration = 2;
            }

            if (activeAnimation[0] === 'charsRotateIn') {

                this.from.rotateX = -90

                this.defaults.rotateX = 0;

                this.defaults.stagger = 0.03;
                this.defaults.duration = 2;

                this.animOut ? this.out.rotateX = 90 : '';



            }

            if (activeAnimation[0] === 'charsFlipUp') {

                this.from.x = -50
                this.from.yPercent = 50
                this.from.rotateY = 180
                this.from.opacity = 0

                this.defaults.x = 0
                this.defaults.yPercent = 0
                this.defaults.rotateY = 0
                this.defaults.opacity = 1

                this.defaults.stagger = -0.05;
                this.defaults.duration = 1;
            }

            if (activeAnimation[0] === 'charsFlipDown') {

                this.from.x = 50
                this.from.yPercent = -50
                this.from.rotateY = -180
                this.from.opacity = 0

                this.defaults.x = 0
                this.defaults.yPercent = 0
                this.defaults.rotateY = 0
                this.defaults.opacity = 1

                this.defaults.stagger = 0.05;
                this.defaults.duration = 1;
            }

            if (activeAnimation[0] === 'linesMask') {

                $(this.DOM.el).find('.anim_line').each(function () {

                    let $this = $(this),
                        span = $this.children('span');

                    span.clone().addClass('clone').appendTo($this);


                })


                this.from.width = '0%'

                this.defaults.width = '100%'
                this.defaults.stagger = 0.2;
                this.defaults.duration = 2;

                this.scrub == true ? this.defaults.ease = 'none' : '';

                this.scroll.scrollTrigger.start = 'top 70%'
                this.scroll.scrollTrigger.end = 'bottom center'

            }

            if (activeAnimation[0] === 'slideLeft') {

                this.target = $(this.DOM.el).find('.anim_line');
                this.from.x = -1 * this.target.outerWidth();

                if (this.target.outerWidth() > $(window).outerWidth()) {

                    this.defaults.x = 0
                } else {
                    this.defaults.x = 0;
                }

                this.animOut ? this.defaults.x = -1 * $(window).outerWidth() - 400 : '';
                this.animOut ? this.out.ease = 'none' : '';

                this.defaults.ease = 'none';

            }

            if (activeAnimation[0] === 'slideRight') {

                this.target = $(this.DOM.el).find('.anim_line');
                this.from.x = $(window).outerWidth();

                if (this.target.outerWidth() > $(window).outerWidth()) {

                    this.defaults.x = 0 - (this.target.outerWidth() - $(window).outerWidth() + 300)
                } else {
                    this.defaults.x = 0;
                }

                this.animOut ? this.defaults.x = -1 * $(window).outerWidth() - 400 : '';
                this.animOut ? this.out.ease = 'none' : '';

                this.defaults.ease = 'none';



            }

            // Return default if data is null
            this.stagger == null ? this.stagger = this.defaults.stagger : '';
            this.delay == null ? this.delay = this.defaults.delay : '';
            this.duration == null ? this.duration = this.defaults.duration : '';

            // Asign options
            this.options = Object.assign(this.defaults, options);
            this.fromOptions = Object.assign(this.from, fromOptions);
            this.scroll = Object.assign(this.scroll, scroll);

            this.options.stagger = this.stagger;
            this.options.delay = this.delay;
            this.options.duration = this.duration;

            if (this.pin) {

                this.scrub = true

                this.scroll.scrollTrigger.pin = true;
                this.scroll.scrollTrigger.scrub = 1;
                this.scroll.scrollTrigger.start = 'center center';

                this.scroll.scrollTrigger.end = this.duration == null ? 'botom top' : 'bottom+=' + (this.duration * 1000) + ' top';
            }

            if ((this.scrub) && (!this.pin)) {

                this.scroll.scrollTrigger.scrub = 1;
                this.scroll.scrollTrigger.start = 'top+=100 bottom';
                this.scroll.scrollTrigger.end = 'bottom center'
            }

            if (this.animOut) {

                this.out.stagger = this.options.stagger;
                this.out.duration = this.options.duration;

                this.out = Object.assign(this.out, out);

            }

            this.render();
        }

        render() {

            this.tl = gsap.timeline(this.scroll)

            this.tl.fromTo(this.target, this.fromOptions, this.options);

            this.animOut == true ? this.tl.to(this.target, this.out) : '';

            this.tl.eventCallback("onComplete", () => {

                let loader = gsap.getById("innerTl");

                $(this.DOM.el).addClass('is-inview')

                this.scrub != true && !this.noRevert && loader == null ? this.split.revert() : '';

                this.progress = 1;

            });

            this.tl.eventCallback("onStart", () => {

                $(this.DOM.el).addClass('anim_start')

            });


        }

    };

    function naylaTextAnims() {

        let hasAnim = $('.has-anim-text'),
            exclude = 'ul, li, a';

        hasAnim.not(exclude).each(function () {

            let $this = $(this)

            let textAnim = new naylaTextAnimation($this);


            matchMedia.add({
                isMobile: "(max-width: 450px)"

            }, (context) => {

                if (textAnim.progress == 0) {

                    textAnim.split.revert();
                    textAnim.tl.revert();

                    new naylaTextAnimation($this);

                }

                return () => {

                }
            });



            if ($this.hasClass('wordsJustifyCollapse') || $this.hasClass('wordsJustifyExpand')) {

                let words = $this.find('.anim_word'),
                    start = $this.offset().top < $(window).outerHeight() ? 0 : 'top bottom+=200',
                    scrub = $this.data('scrub')

                $this.hasClass('wordsJustifyExpand') ? $this.css('textAlignLast', 'justify') : $this.css('textAlignLast', 'auto');

                const state = Flip.getState(words);

                $this.hasClass('wordsJustifyExpand') ? $this.css('textAlignLast', 'auto') : $this.css('textAlignLast', 'justify');


                if (scrub) {

                    Flip.to(state, {
                        duration: 1,
                        ease: "none",
                        stagger: 0,
                        absolute: true,
                        absoluteOnLeave: true,
                        scrollTrigger: {
                            trigger: $this,
                            start: start,
                            end: 'top center',
                            scrub: 1.2,
                        }

                    });

                } else {

                    ScrollTrigger.create({
                        trigger: $this,
                        start: start,
                        end: 'bottom center',
                        onEnter: () => {
                            Flip.to(state, {
                                duration: 2,
                                ease: "expo.out",
                                stagger: 0,
                                absolute: true,
                                absoluteOnLeave: true,
                            });
                        }

                    })
                }

            }


        })


    }

    function naylaListAnimations() {

        let list = $('ul');

        list.each(function () {

            let $this = $(this),
                listItem = $this.find('li'),
                animation = $this.data('animation');

            if (animation) {


                listItem.addClass(animation);
                listItem.addClass('no-revert');

                listItem.each(function () {

                    let $this = $(this);

                    let anim = new naylaTextAnimation($this);


                })
            }


        })
    }

    function detectPov() {

        $('.detect-pov').each(function () {

            let $this = $(this);

            ScrollTrigger.create({
                trigger: $this,
                onEnter: () => {
                    $this.addClass('is-inview')
                }
            })

        })
    }

    function naylaTextWrapper() {

        var twrap = $('.text-wrapper');

        twrap.each(function () {

            let $scope = $(this);

            var bump = $scope.find('.bump'),
                turn = $scope.find('.turn'),
                rotateX = $scope.find('.rotateX'),
                rotateY = $scope.find('.rotateY');

            if (bump.length) {

                let tl = gsap.timeline({
                    repeat: -1,
                })

                tl.fromTo(bump, {
                    scale: 0.6

                }, {
                    scale: 1,
                    ease: 'power4.inOut'
                })

                tl.to(bump, {
                    scale: 0.6
                })

            }

            if ($scope.find('.turn').length) {

                let turn = $scope.find('.turn');

                let tl = gsap.timeline({
                    repeat: -1,
                    repeatDelay: 1
                });

                tl.to(turn, {
                    rotate: 360,
                    duration: 2,
                    ease: 'expo.inOut'
                })


            }

            if ($scope.find('.rotateY').length) {

                let rotateY = $scope.find('.rotateY');

                let tl = gsap.timeline({
                    repeat: -1,
                });

                tl.to(rotateY, {
                    rotateY: 360,
                    duration: 2,
                    ease: 'none'
                })


            }

            if ($scope.find('.rotateX').length) {

                let rotateX = $scope.find('.rotateX');

                let tl = gsap.timeline({
                    repeat: -1,
                });



                tl.to(rotateX, {
                    rotateX: 360,
                    duration: 2,
                    ease: 'none'
                })


            }

            if ($scope.find('.slide-right').length) {

                let sRight = $scope.find('.slide-right');

                sRight.wrapInner('<span><span>')

                let tl = gsap.timeline({
                    repeat: -1,
                });

                tl.fromTo(sRight.children('span'), {
                    xPercent: 0,
                }, {
                    xPercent: 100,
                    ease: 'power3.in',
                    duration: .75
                })

                tl.fromTo(sRight.children('span'), {
                    xPercent: -100
                }, {
                    xPercent: 0,
                    duration: .75,
                    ease: 'power3.out',
                })

            }

            if ($scope.find('.slide-left').length) {

                let sLeft = $scope.find('.slide-left');

                sLeft.wrapInner('<span><span>')

                let tl = gsap.timeline({
                    repeat: -1,
                });

                tl.fromTo(sLeft.children('span'), {
                    xPercent: 0,
                }, {
                    xPercent: -100,
                    ease: 'power3.in',
                    duration: .75
                })

                tl.fromTo(sLeft.children('span'), {
                    xPercent: 100
                }, {
                    xPercent: 0,
                    duration: .75,
                    ease: 'power3.out',
                })

            }

        })


    }


    /////////////////////////
    //    Pages            //
    /////////////////////////

    // Single Post Page

    function naylaSinglePostPage() {

        var singlePost = $('.single-post-page');

        singlePost.each(function () {

            let post = $(this),
                meta = post.find('.entry-meta'),
                metaWrap = post.find('.entry-meta-wrap'),
                trigEnd = "bottom bottom-=" + (metaWrap.outerHeight() / 2 - 75) + "'",
                content = post.find('.entry-content'),
                image = post.find('.post-featured-image'),
                title = post.find('.post-title-sub');

            new SplitText(title, {
                type: 'words, lines',
                wordsClass: 'pt-sub-word'
            })

            ScrollTrigger.create({
                trigger: content,
                start: 'top top+=50',
                end: trigEnd,

                pin: meta,
                onEnter: () => {

                    gsap.fromTo('.pt-sub-word', {
                        yPercent: 100
                    }, {
                        yPercent: 0,

                        stagger: 0.025,
                        duration: 1,
                        ease: 'expo.out'

                    })


                    gsap.to(image, {
                        scale: .8,
                        marginTop: '1em'
                    })

                },
                onLeaveBack: () => {
                    gsap.to(image, {
                        scale: 1,
                        marginTop: 0
                    })

                }
            })



        })



    }



    //    Product Pages

    function naylaProductPage() {


        var productPage = $('.product-page-content'),
            gallery = productPage.find('.product-gallery'),
            info = productPage.find('.product-info'),
            endo = gallery.outerHeight() - info.outerHeight();


        var galleryScroll = ScrollTrigger.create({
            trigger: gallery,
            pin: info,
            start: 'top top',
            end: endo,

        })

        function detailTabs() {

            let tabs = $('.tab-titles-wrap'),
                titles = tabs.find('.tab-title');



            titles.on('click', function () {

                let $this = $(this),
                    findContent = '.tab_' + $this.attr('data-tab');

                $('.tab-content').removeClass('active');
                $('.tab-title').removeClass('active');
                $(findContent).addClass('active')
                $this.addClass('active')


            })




        }
        detailTabs()


        matchMedia.add({
            isMobile: "(max-width: 450px)"

        }, (context) => {
            let {
                isMobile
            } = context.conditions;

            galleryScroll.kill()


            var galeryDrag = Draggable.create(gallery.find('.product-gallery-wrap'), {
                type: 'x',
                bounds: {
                    minX: 0,

                },
                lockAxis: true,
                dragResistance: 0.5,
                inertia: true,

                zIndexBoost: false,

            });


            return () => {


            }
        });



    }


    //    Project Pages

    function naylaProjectPages() {

        let $this = $('.project-page'),
            header = $this.find('.project-page-header'),
            wrapper = header.children('div'),
            image = $this.find('.project-image.featured'),
            title = $this.find('.project-title'),
            backButton = $this.find('.project-back-button');

        backButton.on('click', function () {

            history.back()

        })



        if (header.hasClass('fullscreen-image')) {

            gsap.to(title, {
                yPercent: 100,

                ease: 'none',
                scrollTrigger: {
                    trigger: header,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });

        }


        if (header.hasClass('creative')) {

            image.addClass('single-image parallax-image')

        }

        if (header.hasClass('tall')) {


            let rotate = header.find('.rotate-text-area');

            ScrollTrigger.create({
                trigger: rotate,
                pin: true,
                start: 1,
                endTrigger: header.find('.wrapper'),
                end: 'bottom+=100 bottom',
            })


        }

        if (header.hasClass('image-gallery')) {

            let hero = header.find('.project-hero'),
                images = header.find('.project-images'),
                slideButton = header.find('.project-slide-button'),
                slider = images.children('.project-images-slider'),
                speed = $(window).outerHeight() * images.data('speed'),
                vertical, horizontal,
                tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: header,
                        start: 'top top',
                        pin: true,
                        scrub: 1,
                        end: speed,
                        id: 'projectImagesScroll'
                    }
                }),
                heroTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: header,
                        start: 1,
                        scrub: 1,
                        end: 500

                    }
                });


            if (header.hasClass('vertical')) {
                vertical = true;
                horizontal = false;
            } else if (header.hasClass('horizontal')) {
                horizontal = true;
                vertical = false;
            }


            var sliderHeight, sliderTop, transVal, sliderWidth, sliderLeft;

            function initAnim() {

                sliderWidth = slider.outerWidth();
                sliderLeft = slider.offset().left;
                sliderHeight = slider.outerHeight();
                sliderTop = slider.offset().top;
                transVal = sliderHeight + sliderTop - $(window).outerHeight() + 50;

                tl.clear();

                if (horizontal) {
                    tl.to(slider, {
                        xPercent: -100,
                    }, 0)



                } else if (vertical) {
                    tl.to(slider, {
                        y: -1 * transVal,

                    }, 0)

                }

            }

            initAnim()

            if (horizontal) {

                let words = title.find('.anim_word'),
                    state = Flip.getState(words),
                    tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: header,
                            start: 0,
                            scrub: 1,
                            end: 250,
                        }
                    })

                title.css('text-align-last', 'unset');

                Flip.from(state, {
                    duration: 1,
                    absolute: true,
                    absoluteOnLeave: true,
                    scrollTrigger: {
                        trigger: header,
                        start: -1,
                        scrub: 1,
                        end: 500,
                    }
                });


                tl.to(slideButton, {
                    left: 0,

                }, 0)

                tl.to(slideButton.find('span'), {
                    rotate: -45,

                }, 0)

                tl.to(header.find('.project-category, .project-meta, .project-slide-button'), {
                    opacity: 0

                }, 0)

                slideButton.on('click', () => {
                    gsap.to(window, {
                        duration: .45,
                        scrollTo: 250,
                        ease: 'expo.inOut',

                    });
                })


            } else if (vertical) {

                slideButton.on('click', function () {

                    let scrollToo = 750 * Math.ceil(ScrollTrigger.getById('projectImagesScroll').progress * 10);

                    if (scrollToo > transVal) {
                        scrollToo = transVal;
                    }

                    if (slideButton.hasClass('return')) {

                        gsap.to(window, {
                            duration: .45,
                            scrollTo: 0,
                            ease: 'expo.inOut',
                            onComplete: () => {
                                slideButton.removeClass('return');
                            }
                        });

                    } else {

                        gsap.to(window, {
                            duration: .75,
                            scrollTo: scrollToo,
                            ease: 'expo.out',
                        });
                    }

                    if (transVal == scrollToo) {

                        slideButton.addClass('return');
                    }
                })


                matchMedia.add({
                    isMobile: "(max-width: 450px)"

                }, (context) => {
                    let {
                        isMobile
                    } = context.conditions;

                    initAnim()

                    heroTl.to(hero, {
                        opacity: 0,
                        y: -100
                    })

                    return () => {
                        heroTl.clear();
                        initAnim()

                    }
                });
            }

        }

        let nextProj = $('.nayla-next-project'),
            link = nextProj.find('a'),
            nextTitle = nextProj.find('.next-project-title'),
            nextImage = nextProj.find('.next-project-image');

        link.addClass('next-project-link')



    }


    function naylaPortfolio() {

        let portfolio = $('.portfolio-grid');

        portfolio.each(function () {

            let portfolio = $(this),
                controls = portfolio.children('.grid-controls'),
                projectsWrapper = portfolio.children('.grid-projects-wrapper'),
                padTop = parseInt(projectsWrapper.css('paddingTop'), 10),
                projects = projectsWrapper.find('.grid-project'),
                viewText = portfolio.data('view-text'),
                hovers = portfolio.data('hovers').split(' '),
                projectsLength = projects.length,
                lineCount = Math.floor(projectsLength / 2),
                projectsHeight = projects.outerHeight(),
                projectsWidth = projects.outerWidth(),
                gridGap = parseInt(projectsWrapper.css('gap'), 10),
                columns = 2,
                hoverImage, hoverCursor, hoverArrow;

            portfolio.hasClass('col-3') ? columns = 3 : '';
            portfolio.hasClass('col-4') ? columns = 4 : '';

            hovers.includes('imageMask') ? hoverImage = true : '';
            hovers.includes('cursor') ? hoverCursor = true : '';
            hovers.includes('imageMask') ? hoverArrow = true : '';
            projectHovers();

            // Hovers
            function projectHovers() {

                projects.each(function (i) {

                    i++
                    let $this = $(this),
                        image = $this.find('img'),
                        metas = $this.find('.grid-project-meta').children('div'),
                        title = $this.find('.grid-project-title'),
                        category = $this.find('.grid-project-category'),
                        titleText = title.text();

                    $this.find('a').addClass('grid-project-link');

                    $this.addClass('project_' + i);
                    $this.attr('data-index', i)

                    if (hovers.includes('classic')) {

                        portfolio.addClass('hover-classic')


                        metas.children('span').length ? '' : metas.wrapInner('<span></span>');

                        title.children('span').attr('data-hover', titleText)
                        category.children('span').attr('data-view-text', viewText)
                    }

                    if (hoverImage) {
                        portfolio.addClass('hover-imageMask');
                        image.clone().addClass('masked').insertAfter(image)
                    }

                    if (hoverCursor) {
                        portfolio.addClass('hover-cursor');

                        $this.addClass('cursor-icon');
                        $this.attr('data-cursor-icon', 'arrow_outward');

                    }

                    hoverArrow ? portfolio.addClass('hover-arrow') : '';


                    // Parallax Images 
                    if (portfolio.hasClass('parallax-on')) {

                        gsap.to(image.not('masked'), {
                            y: -100,

                            scrollTrigger: {
                                trigger: $this,
                                scrub: 2,
                            }
                        })

                    }

                })
            }
            // Create seperators
            function createSeperators(lengths) {

                portfolio.find('hr').remove();

                if (!portfolio.hasClass('masonry')) {

                    let line = '<hr></hr>',
                        i = 1;

                    projectsWrapper.find('.grid-project:visible').each(function (i) {
                        i++
                        $(this).attr('data-current-index', i)

                    })

                    for (i = 1; i < lengths; i++) {

                        i % columns == 0 ? $(line).insertAfter(projectsWrapper.find('.grid-project:visible[data-current-index="' + i + '"]')) : '';
                    }
                }
            }
            createSeperators(projectsLength);

            // Filtering
            if (portfolio.hasClass('filterable')) {

                let portfolioFilters = portfolio.find('.portfolio-filters'),
                    filterCats = portfolioFilters.find('li');

                filterCats.each(function () {

                    let $this = $(this),
                        id = $this.attr('id'),
                        length;

                    id == 'all' ? length = projectsLength : length = portfolio.find('.' + id).length;

                    $this.append('<span class="projects-length">(' + length + ')</span>');

                    $this.on('click', () => {
                        id == 'all' ? portfolio.removeClass('filtered') : portfolio.addClass('filtered');


                        filterCats.removeClass('active');
                        $this.addClass('active');

                        let state = Flip.getState(projects);

                        if (id === 'all') {
                            projects.show();
                            portfolio.hasClass('grid-list') ? '' : createSeperators(projectsLength);
                        } else {
                            projects.show();
                            projects.not('.' + id).hide();
                            let visibleLength = projectsLength - projects.not('.' + id).length;

                            portfolio.hasClass('grid-list') ? '' : createSeperators(visibleLength);
                        }

                        if (portfolio.hasClass('grid-list')) {

                            Flip.from(state, {
                                duration: 1,
                                scale: false,
                                ease: "expo.out",
                                stagger: 0,
                                absolute: true,
                                absoluteOnLeave: true,
                                onEnter: elements => gsap.fromTo(elements, {
                                    opacity: 0,
                                    x: 25
                                }, {
                                    opacity: 1,
                                    x: 0


                                }),
                                onLeave: elements => gsap.to(elements, {
                                    opacity: 0,
                                    x: -25


                                })
                            });


                        } else {

                            Flip.from(state, {
                                duration: 1,
                                scale: false,
                                ease: "expo.out",
                                stagger: 0,
                                absolute: true,
                                absoluteOnLeave: true,
                                onEnter: elements => gsap.fromTo(elements, {
                                    opacity: 0,
                                    scale: 0
                                }, {
                                    opacity: 1,
                                    scale: 1,

                                }),
                                onLeave: elements => gsap.to(elements, {
                                    opacity: 0,
                                    scale: 0,

                                })
                            });

                        }



                    })

                });

                function filtersVisible() {

                    let state = Flip.getState(filterCats);

                    portfolioFilters.toggleClass('hovered')

                    Flip.from(state, {
                        duration: 1,
                        ease: 'expo.out',
                        absolute: false,
                        absoluteOnLeave: true,
                        onEnter: elements => gsap.fromTo(elements, {
                            opacity: 0,

                        }, {
                            opacity: 0.5,
                            stagger: 0.05
                        }),
                        onLeave: elements => gsap.to(elements, {
                            opacity: 0,
                            stagger: -0.05
                        })
                    })
                }

                portfolioFilters.hover(
                    () => filtersVisible(),
                    () => filtersVisible()
                );
            }

            // Layout Switch 

            let switchGrid = portfolio.find('.switch-grid'),
                switchList = portfolio.find('.switch-list');

            // List
            switchList.on('click', () => {

                switchList.addClass('active');
                switchGrid.removeClass('active');

                gsap.to(portfolio.find('hr'), {
                    opacity: 0,
                })

                gsap.to(projects, {
                    clipPath: 'inset(0% 0% 100% 0%)',
                    y: -25,
                    duration: .75,
                    ease: 'circ.inOut',
                    onComplete: () => {
                        portfolio.removeClass('hover-arrow hover-imageMask hover-cursor');
                        portfolio.find('hr').remove();
                        portfolio.find('img.masked').remove();
                        portfolio.addClass('grid-list');
                        portfolio.find('.grid-project-meta > *');
                        $('<span class="g-list-arrow material-icons">arrow_outward</span>').insertBefore(projects.find('.grid-project-wrap .grid-project-meta > div:last-child'))

                        projects.each(function (i) {

                            let delay = 0 + (i / 8)

                            gsap.fromTo($(this).find('.grid-project-meta > *'), {
                                y: 50
                            }, {
                                y: 0,
                                duration: 1.5,
                                ease: 'expo.out',
                                delay: delay,
                                stagger: 0.04,
                                onStart: () => {

                                    portfolio.addClass('animating');
                                    $(this).addClass('gl-inview');

                                    gsap.set(projects, {
                                        clearProps: 'clipPath'
                                    })

                                },
                                onComplete: () => {
                                    portfolio.removeClass('animating');
                                    ScrollTrigger.refresh(true)
                                    ScrollTrigger.update(true)

                                }
                            })

                        })
                    }
                })

            });


            // Grid
            switchGrid.on('click', () => {

                switchGrid.addClass('active');
                switchList.removeClass('active');

                portfolio.addClass('animating');
                projects.removeClass('gl-inview');


                gsap.to(portfolio.find('.grid-project-meta > *'), {
                    opacity: 0,
                    duration: .75,
                    ease: 'expo.out',
                    onComplete: () => {

                        gsap.set('.grid-project-meta > *', {
                            clearProps: 'all'
                        })

                        let currLength = projectsWrapper.find('.grid-project:visible').length;
                        portfolio.removeClass('grid-list');

                        createSeperators(currLength);
                        portfolio.find('.g-list-arrow').remove();
                        portfolio.removeClass('animating');

                        gsap.fromTo(projects, {
                            clipPath: 'inset(100% 0% 0% 0%)',
                            y: 100
                        }, {
                            clipPath: 'inset(0% 0% 0% 0%)',
                            y: 0,
                            duration: 1.5,
                            ease: 'expo.out',
                            stagger: 0,

                        })
                        projectHovers();
                        ScrollTrigger.refresh(true)
                        ScrollTrigger.update(true)

                    }
                })

            })

        })

    }

    function naylaShopPage() {

        let products = $('.nayla-products-grid');

        products.each(function () {

            let products = $(this),
                grid = products.find('.grid--products'),
                product = grid.find('.grid--product'),
                controls = products.find('.product-grid-controls'),
                length = controls.find('.products--length'),
                switcher = controls.find('.grid--switcher'),
                switch4 = switcher.find('.switch-col-4'),
                switch2 = switcher.find('.switch-col-2');

            length.prepend('<span>' + product.length + ' </span>');

            switch2.on('click', function () {

                gsap.to(grid, {
                    opacity: 0,
                    onComplete: () => {
                        grid.addClass('col-2')
                        gsap.to(grid, {
                            opacity: 1
                        })
                    }
                })

            })

            switch4.on('click', function () {

                gsap.to(grid, {
                    opacity: 0,
                    onComplete: () => {
                        grid.removeClass('col-2')
                        gsap.to(grid, {
                            opacity: 1
                        })
                    }
                })
            })
        })

    }
    naylaShopPage()


    ///////////////////////////////
    //    Showcase Layouts      //
    ///////////////////////////////



    function slideNav(slider, parent) {

        let prev = parent.find('.slide-prev'),
            next = parent.find('.slide-next');

        next.on('click', function () {
            slider.slideNext();
        })

        prev.on('click', function () {
            slider.slidePrev();
        })

    }

    function showcaseWall() {

        var wallWrap = $('.showcase-wall');

        wallWrap.each(function () {

            let mainWrap = $(this),
                wrapper = mainWrap.find('.showcase-wall-wrap,  .showcase-footer'),
                overlay = mainWrap.find('.sw-overlay'),
                project = mainWrap.find('.showcase-project'),
                title = project.find('.project-title'),
                projectWraps = mainWrap.find('.sw-projects-wrap'),
                height = mainWrap.outerHeight(),
                speed = mainWrap.data('speed'),
                end = speed == null ? height + 1000 : height + speed,
                tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: mainWrap,
                        scrub: 1,
                        pin: true,
                        start: 'top top',
                        end: end,
                        id: 'showcaseWallScroll'
                    }
                });


            if (mainWrap.hasClass('animate-in')) {

                disableScroll();

                mainWrap.addClass('animating');

                new SplitText(title, {
                    type: 'chars',
                    charsClass: 'pt_char'
                })

                $('.sw-projects-wrap').each(function () {

                    let
                        $this = $(this),
                        char = $this.find('.pt_char'),
                        tl = gsap.timeline({
                            onComplete: function () {
                                mainWrap.removeClass('animating');
                                enableScroll();
                            }
                        });

                    tl.from($(this), {
                        x: 1000,
                        duration: 1.5,
                        ease: 'power2.out',
                    }, 0)

                    tl.fromTo(char, {
                        y: 200,
                    }, {
                        y: 0,
                        duration: 1.5,
                        ease: 'power2.out',
                        stagger: 0.02
                    }, 0)
                })
            }

            projectWraps.each(function () {

                let $this = $(this),
                    startPos = $this.data('start-pos'),
                    endPos = $this.data('end-pos');

                tl.fromTo($this, {
                    xPercent: startPos,
                }, {
                    xPercent: endPos
                }, 0)

            });



            var layoutReset = gsap.delayedCall(0.1, layoutChange, [overlay, false, wrapper], {
                oncomplete: () => {
                    wrapper.removeClass('dark light')
                }
            });
            layoutReset.kill();


            project.each(function (i) {

                i++
                let $this = $(this),
                    image = $this.find('.project-image'),
                    findImage = '.image_' + i,
                    img = image.find('img').attr('src'),
                    secondary = $this.find('a');

                secondary.addClass('sc-link')


                $this.attr('data-index', i);

                $this.prepend('<span class="project-index">' + i + '</span>')

                image.addClass('image_' + i)

                mainWrap.hasClass('animate-colors') ? projectColorSettings($this) : '';


                image.css('width', image.outerWidth())
                image.css('height', image.outerHeight())

                $this.attr('data-index', i);

                $this.on('mousemove', function (e) {

                    let mouseLeft = e.clientX,
                        mouseTop = e.clientY,
                        myLeft = mouseLeft - $this.offset().left,
                        myTop = mouseTop - $this.offset().top + $(window).scrollTop(),
                        movX = event.movementX < 0 ? event.movementX * -1 : event.movementX;

                    gsap.to(image, {
                        left: myLeft,
                        top: myTop,
                        rotate: gsap.utils.clamp(-10, 10, (event.movementX / 5)),
                        duration: 1,
                        ease: 'power3.out',
                    })

                })

                $this.find('a').on('mouseenter', function () {

                    layoutReset.kill();

                    mainWrap.addClass('hovered');
                    $this.addClass('current');

                    image.addClass('transition--media')

                    mainWrap.hasClass('animate-colors') ? layoutChange(overlay, $this, wrapper) : '';


                })

                $this.find('a').on('mouseleave', function () {

                    mainWrap.removeClass('hovered')
                    $this.removeClass('current')

                    image.removeClass('transition--media')

                    mainWrap.hasClass('animate-colors') ? layoutReset.restart(true) : '';

                })

                $this.find('a').on('click', function () {


                    $this.find('a').off('mouseleave')

                })

            })


            matchMedia.add({
                isMobile: "(max-width: 550px)"

            }, (context) => {
                let {
                    isMobile
                } = context.conditions;


                tl.revert()



                return () => {




                }
            });



        })


    }

    function showcase3dTitles() {

        let showcase3dTitles = $('.showcase-3d-titles');

        showcase3dTitles.each(function () {

            let $this = $(this),
                projectsWrap = $this.find('.s3t-projects-wrap'),
                project = $this.find('.showcase-project'),
                imagesWrap = $this.find('.s3t-images'),
                fontSize = parseInt($this.find('.project-title').css('font-size'));

            $this.on('mousemove', function (e) {

                let xTo = gsap.quickTo(imagesWrap, "left", {
                        duration: 0.6,
                        ease: "power3"
                    }),
                    yTo = gsap.quickTo(imagesWrap, "top", {
                        duration: 0.6,
                        ease: "power3"
                    });

                function icko(e) {
                    xTo(e.pageX);
                    yTo(e.pageY - $this.offset().top);
                }

                icko(e)

            });


            project.first().addClass('active');

            let projectLength = project.length,
                rotateX = 360 / projectLength;

            project.each(function (i) {
                let $this = $(this),
                    image = $this.find('.project-image');

                $this.find('a').addClass('sc-link')

                image.addClass('image_' + i)
                image.wrap('<div class="d-img"></div>')
                image.parent('.d-img').appendTo(imagesWrap)

                $this.data('index', i)

                $(this).css('--rotateX', -1 * rotateX * i + "deg")

                $(this).addClass('active-title_' + i)

                if (270 > rotateX * i && 90 < rotateX * i) {
                    gsap.set($(this), {
                        opacity: 0
                    })
                }

                let count = 0;

                $this.find('.project-title').on('mouseenter', () => {

                    imagesWrap.addClass('active');

                    if ($this.hasClass('active')) {

                        imagesWrap.addClass('active');

                        let activeImage = $('.image_' + i).parent('.d-img');
                        activeImage.addClass('active')
                        activeImage.addClass('transition--media')


                        gsap.set(activeImage, {
                            zIndex: 1
                        })

                        let tl = gsap.timeline();

                        tl.fromTo(activeImage, {

                            y: '100%'
                        }, {

                            y: '0%',
                            duration: 1.5,
                            ease: 'power3.inOut'
                        }, 0)

                        tl.fromTo(activeImage.children('div'), {

                            scale: 1.3,
                            y: '-100%'
                        }, {

                            y: '0%',
                            scale: 1,
                            duration: 1.5,
                            ease: 'power3.inOut'
                        }, 0)


                    }
                })

                $this.find('.project-title').on('mouseleave', () => {

                    imagesWrap.removeClass('active');

                    count++

                    let image = $('.image_' + $this.data('index')).parent('.d-img');

                    image.removeClass('active')
                    image.removeClass('transition--media')

                    gsap.set(image, {
                        zIndex: 0 - count
                    })

                    let tl = gsap.timeline();

                    tl.fromTo(image, {

                        y: '0%'
                    }, {

                        y: '-100%',
                        duration: 1.5,
                        ease: 'power3.inOut'
                    }, 0)

                    tl.fromTo(image.children('div'), {

                        y: '0%',
                        scale: 1
                    }, {

                        y: '100%',
                        scale: 1.3,
                        duration: 1.5,
                        ease: 'power3.inOut'
                    }, 0)
                })

                $this.find('a').on('click', () => {

                    $this.find('.project-title').off('mouseleave');

                })

            })


            $this.css('--transformZ', projectLength * fontSize / 6.4 + "px");

            let dsc = ScrollTrigger.create({
                trigger: $this,
                start: 'top top',
                end: 10000,
                pin: true,
                scrub: true,

            })

            matchMedia.add({
                isMobile: "(max-width: 550px)"

            }, (context) => {
                let {
                    isMobile
                } = context.conditions;


                $('.project-title span').off('mousemove')

                return () => {

                    $('.project-title span').on('mousemove')


                }
            });



            const lenis = new Lenis({
                infinite: true,
                smooth: true,
                infinite: true,
                smoothTouch: false,
                duration: 2
            });

            window.addEventListener('scroll', function () {
                gsap.set(projectsWrap, {
                    rotateX: this.scrollY / 10000 * 360
                })
                let activeIndex = Math.round(this.scrollY / 10000 * (project.length)),
                    rotateProgress = this.scrollY / 10000 * 360;
                let positive = rotateProgress + 90,
                    negative = rotateProgress + 270;


                if (positive > 360) {
                    positive = positive - 360
                }
                if (negative > 360) {
                    negative = negative - 360
                }

                $this.find('.active-title_' + activeIndex).addClass('active');

                $this.find('.active-title_' + activeIndex).nextAll().removeClass('active')
                $this.find('.active-title_' + activeIndex).prevAll().removeClass('active')


                imagesWrap.find('.image_' + activeIndex).addClass('active')
                imagesWrap.find('.image_' + activeIndex).prevAll().removeClass('active')
                imagesWrap.find('.image_' + activeIndex).nextAll().removeClass('active')


                project.each(function () {
                    let itemRotate = parseInt($(this).css('--rotateX')) * -1
                    if (negative - positive > 0) {
                        if (itemRotate > positive && itemRotate < negative) {
                            gsap.set($(this), {
                                opacity: 0
                            })
                        } else {
                            gsap.set($(this), {
                                opacity: 1
                            })
                        }
                    } else {
                        if (itemRotate < positive && itemRotate > negative) {
                            gsap.set($(this), {
                                opacity: 1
                            })
                        } else {
                            gsap.set($(this), {
                                opacity: 0
                            })
                        }
                    }
                })
            })


            function raf(time) {
                lenis.raf(time);
                ScrollTrigger.update(true);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);

            barba.hooks.beforeLeave(() => {

                lenis.destroy();
            });



        })
    }

    function showcaseFullscreenWall() {

        var main = $('.showcase-fullscreen-wall');

        main.each(function () {

            let parent = $(this),
                wrapper = parent.find('.sfw-projects-wrapper'),
                projects = wrapper.find('.showcase-project'),
                switcList = parent.find('.switch-titles'),
                switchImages = parent.find('.switch-images'),
                animation = parent.data('animation');


            projects.each(function (i) {
                i++

                let $this = $(this),
                    image = $this.find('.project-image'),
                    title = $this.find('.project-title');

                $this.find('a').addClass('sc-link')

                new SplitText(title, {
                    type: 'lines',
                    linesClass: 'title_line'
                })

                image.css('width', image.outerWidth())
                image.css('height', image.outerHeight())

                $this.attr('data-index', i);

                $this.on('mousemove', function (e) {

                    let mouseLeft = e.clientX,
                        mouseTop = e.clientY,
                        myLeft = mouseLeft - $this.offset().left,
                        myTop = mouseTop - $this.offset().top,
                        movX = event.movementX < 0 ? event.movementX * -1 : event.movementX;

                    gsap.to(image, {
                        left: myLeft,
                        top: myTop,
                        rotate: gsap.utils.clamp(-10, 10, (event.movementX / 5)),
                        duration: 1,
                        ease: 'power3.out',
                    })



                })

                $this.on('mouseenter', function () {

                    parent.addClass('hovered')
                    $this.addClass('current')
                    $this.find('.project-image').addClass('transition--media')

                })

                $this.on('mouseleave', function () {

                    parent.removeClass('hovered')
                    $this.removeClass('current')
                    $this.find('.project-image').removeClass('transition--media');

                })

                $this.find('a').on('click', function () {

                    $this.off('mouseleave');
                    gsap.to($this.find('img'), {
                        scale: 1
                    })
                })

                if (animation) {

                    title.find('.title_line').addClass('has-anim-text')
                    title.find('.title_line').addClass(animation)


                    title.find('.title_line').attr('data-delay', (i / 20))

                    $this.addClass('detect-pov')

                }

            });

        })




    }

    function showcaseList() {

        var sflWrap = $('.showcase-list');

        sflWrap.each(function () {

            let $this = $(this),
                projectsWrap = $this.find('.sfl-projects-wrap'),
                speed = $this.attr('data-speed'),
                wrapHeight = projectsWrap.outerHeight(),
                end = speed == null ? wrapHeight + 1000 : (wrapHeight + parseInt(speed)),
                transVal = $(window).outerHeight() - wrapHeight,
                project = $this.find('.showcase-project'),
                overlay = $this.find('.sc-overlay');


            project.each(function (i) {

                i++
                let $this = $(this),
                    image = $this.find('.project-image'),
                    img = image.find('img'),
                    findImage = '.image_' + i,
                    imgSrc = image.find('img').attr('src'),
                    secondary = $this.find('a');


                secondary.addClass('sc-link')
                i >= 10 ? $this.attr('data-index', i) : $this.attr('data-index', '0' + i);


                image.addClass('image_' + i);

                $this.on('mouseenter', function (e) {

                    let mouseLeft = e.clientX,
                        myLeft = mouseLeft - $this.offset().left;

                    project.not($this).addClass('op-down')
                    $this.addClass('hovered')
                    $this.find('.project-image').addClass('transition--media')

                    gsap.set($this, {
                        zIndex: 2
                    });

                    gsap.fromTo(image, {
                        scale: .5,
                        opacity: .5
                    }, {
                        scale: 1,
                        opacity: 1
                    })

                    gsap.set(image, {
                        left: myLeft,
                        rotate: event.movementX / 7,

                    })

                });

                $this.on('mousemove', function (e) {

                    let mouseLeft = e.clientX,
                        myLeft = mouseLeft - $this.offset().left,
                        bright = 'brightness(' + event.movementX + ')';

                    gsap.to(image, {
                        left: myLeft,
                        rotate: event.movementX / 7,
                        duration: 1,
                        ease: 'power3.out',
                    })



                })

                projectsWrap.on('mouseleave', function () {

                    gsap.to(overlay, {
                        backgroundColor: 'transparent',

                    })

                })



                $this.on('mouseleave', function () {

                    gsap.set($this, {
                        clearProps: 'all'
                    });

                    project.removeClass('op-down');
                    project.removeClass('hovered');
                    project.find('.project-image').removeClass('transition--media')

                })

                $this.find('a').on('click', () => {
                    $this.off('mouseleave')
                })




            })


            if ($this.hasClass('animate-in')) {

                $this.find('.project-title').addClass('has-anim-text charsScaleDown fade')
                $this.find('.project-title').attr('data-delay', .5)

            }


        })


    }

    function showcaseFullscreenSlideshow() {


        var fullscreenSlideshow = $('.showcase-fullscreen-slideshow');

        fullscreenSlideshow.each(function () {

            let fsSlideshow = $(this),
                projects = fsSlideshow.find('.showcase-project'),
                images = fsSlideshow.find('.fs-images-slider'),
                footer = fsSlideshow.find('.showcase-footer'),
                current = fsSlideshow.find('.sfs-current'),
                total = fsSlideshow.find('.sfs-total'),
                headerChange, footerChange;

            images.addClass('transition--media')

            current.html('01')
            total.html(projects.length < 10 ? '0' + projects.length : projects.length)

            headerChange = false;
            footerChange = false;


            if (fsSlideshow.hasClass('header-change')) {
                headerChange = true;
                siteHeader.addClass('mx-difference');
            }

            if (fsSlideshow.hasClass('footer-change')) {
                footerChange = true;
                footer.addClass('mx-difference');
            }

            projects.each(function (i) {


                let $this = $(this),
                    image = $this.find('.project-image'),
                    layout = $this.data('layout'),
                    elements = $this.find('.project-inner, .project-button a'),
                    title = $this.find('.project-title'),
                    cat = $this.find('.project-category'),
                    summary = $this.find('.project-summary');


                $this.addClass('wrapper');

                new SplitText([cat, summary], {
                    type: 'words',
                    wordsClass: 'pd_word'
                })

                $this.find('.pd_word').wrapInner('<span></span>')

                new SplitText(title, {
                    type: 'words, chars',
                    wordsClass: 'pt_word',
                    charsClass: 'pt_char'
                })

                $this.find('.pt_char').wrapInner('<span></span>')

                $this.addClass('project_' + i);
                $this.attr('data-index', i);

                image.addClass('swiper-slide image_' + i).wrapInner('<div class="fs-parallax-wrap"><div class="slide-bgimg"></div></div>').appendTo(images.find('.swiper-wrapper'));
            })


            let link = $('.project_0 a').attr('href');
            $('.project-button > a').attr('href', link);
            $('.project-button > a').addClass('sc-link');

            $('.project_0').addClass('active')


            function headerMainChange(color, delay1, delay2) {


                let hsl = gsap.utils.splitColor(color, true),
                    lightness = hsl[hsl.length - 1];

                setTimeout(function () {

                    if ((lightness > 50) && (lightness != 0)) {

                        fsSlideshow.removeClass('temp_dark')
                        fsSlideshow.addClass('temp_light')


                    } else if ((lightness < 50) && (lightness != 0)) {

                        fsSlideshow.removeClass('temp_light')
                        fsSlideshow.addClass('temp_dark');
                    }


                }, delay1)

                setTimeout(function () {

                    if ((lightness > 50) && (lightness != 0)) {

                        siteHeader.removeClass('temp_dark')
                        siteHeader.addClass('temp_light')

                    } else if ((lightness < 50) && (lightness != 0)) {

                        siteHeader.removeClass('temp_light')
                        siteHeader.addClass('temp_dark')
                    }

                }, delay2)

            }

            let firtsColor = fsSlideshow.find('.project_0').data('elements-color');
            headerMainChange(firtsColor, 0, 0)


            var interleaveOffset = 0.7,
                imagesSwiper = new Swiper(".fs-images-slider", {
                    //                    autoplay: true,
                    speed: 1000,
                    slidesPerView: 1,
                    //                    slidesPerGroupAuto: false,
                    navigaton: {
                        prevEl: '.fs-prev',
                        nextEl: '.fs-next'
                    },
                    init: false,
                    edgeSwipeDetection: true,
                    mousewheel: {
                        eventsTarget: '.showcase-fullscreen-slideshow',
                        //                        releaseOnEdges: true,
                    },
                    direction: 'vetical',
                    parallax: true,
                    //                    watchSlideProgress: true,
                    on: {
                        slideChange: function () {
                            let swiper = this,
                                projectIn = fsSlideshow.find('.project_' + swiper.activeIndex),
                                projectOut = fsSlideshow.find('.project_' + swiper.previousIndex),
                                outMetas = projectOut.find('.pd_word span'),
                                outTitle = projectOut.find('.pt_char span'),
                                outButton = projectOut.find('.project-button span'),
                                inButton = projectIn.find('.project-button span'),
                                inMetas = projectIn.find('.pd_word span'),
                                inTitle = projectIn.find('.pt_char span');

                            projectIn.addClass('active');
                            projectOut.removeClass('active');

                            let bgaColor = projectIn.data('elements-color');

                            if (swiper.activeIndex > swiper.previousIndex) {

                                headerMainChange(bgaColor, 350, 750)

                                gsap.set([outMetas, outTitle, inMetas, inTitle], {
                                    clearProps: 'all'
                                })

                                let metasOut = gsap.to(outMetas, {
                                    yPercent: -100,
                                    ease: 'power3.in',
                                    duration: .4,
                                    stagger: 0.01,

                                });
                                gsap.to(outTitle, {
                                    yPercent: -100,
                                    ease: 'power3.in',
                                    duration: .4,
                                    stagger: 0.01,
                                    onComplete: () => {
                                        projectOut.hide();
                                    }
                                })

                                gsap.from(inTitle, {
                                    yPercent: 100,
                                    ease: 'power3.out',
                                    duration: .6,
                                    stagger: 0.02,
                                    delay: .6,
                                    onStart: () => {
                                        projectIn.show();
                                    }
                                })


                                gsap.from(inMetas, {
                                    yPercent: 100,
                                    ease: 'power3.out',
                                    duration: .6,
                                    stagger: 0.03,
                                    delay: 1
                                })

                                gsap.from(inButton, {
                                    yPercent: 100,
                                    xPercent: -100,
                                    ease: 'power3.out',
                                    duration: .6,
                                    stagger: 0.03,
                                    delay: 1
                                })

                            } else {

                                //Prev Animation

                                headerMainChange(bgaColor, 750, 350)
                                gsap.set([outMetas, outTitle, inMetas, inTitle], {
                                    clearProps: 'all'
                                })

                                gsap.to(outMetas, {
                                    yPercent: 100,
                                    ease: 'power3.in',
                                    duration: .4,
                                    stagger: 0.01
                                });

                                gsap.to(outTitle, {
                                    yPercent: 100,
                                    ease: 'power3.in',
                                    duration: .4,
                                    stagger: 0.01,
                                    onComplete: () => {
                                        projectOut.hide();
                                    }
                                })

                                gsap.from(inTitle, {
                                    yPercent: -100,
                                    ease: 'power3.out',
                                    duration: .6,
                                    stagger: 0.02,
                                    delay: .6,
                                    onStart: () => {
                                        projectIn.show();
                                    }
                                })


                                gsap.from(inMetas, {
                                    yPercent: -100,
                                    ease: 'power3.out',
                                    duration: .6,
                                    stagger: -0.03,
                                    delay: 1
                                })

                                gsap.from(inButton, {
                                    yPercent: 100,
                                    xPercent: -100,
                                    ease: 'power3.out',
                                    duration: .6,
                                    stagger: 0.03,
                                    delay: 1
                                })



                            };

                            let activeProj = fsSlideshow.find('.showcase-project.active'),
                                bgColor = activeProj.data('background-color');

                        },
                        progress: function () {
                            let swiper = this;
                            for (let i = 0; i < swiper.slides.length; i++) {
                                let slideProgress = swiper.slides[i].progress,
                                    innerOffset = swiper.height * interleaveOffset,
                                    innerTranslate = slideProgress * innerOffset;

                                swiper.slides[i].querySelector(".slide-bgimg").style.transform =
                                    "translateY(" + innerTranslate + "px)";
                            }
                        },
                        setTransition: function (speed) {
                            let swiper = this;
                            for (let i = 0; i < swiper.slides.length; i++) {
                                swiper.slides[i].style.transition = speed + "ms";
                                swiper.slides[i].querySelector(".slide-bgimg").style.transition = 1000 + "ms";
                            }
                        },
                        slideChangeTransitionEnd: function () {

                            let swiper = this;

                            let link = $('.showcase-project.active a').attr('href');
                            $('.project-button > a').attr('href', link)


                            current.html($('.showcase-project.active').data('index') < 10 ? '0' + ($('.showcase-project.active').data('index') + 1) : ($('.showcase-project.active').data('index') + 1))


                            if (($('body').innerHeight()) > ($(window).outerHeight())) {

                                if (swiper.slides.length == (swiper.activeIndex + 1)) {

                                    swiper.mousewheel.disable();

                                    ScrollTrigger.create({
                                        trigger: fsSlideshow,
                                        start: 'top top',
                                        end: 'center top',
                                        onLeave: function () {

                                        },
                                        onLeaveBack: (self) => {

                                            setTimeout(function () {


                                                self.kill();
                                                swiper.mousewheel.enable();

                                            }, 1000)

                                        }
                                    })

                                }

                            }

                        }

                    }
                });

            slideNav(imagesSwiper, fsSlideshow)


            $(document).ready(function () {

                imagesSwiper.init();

            })

            // Intro Animation 

            if (fsSlideshow.hasClass('animate-in')) {

                let tl = gsap.timeline({
                    once: true,
                    delay: 1
                })

                tl.fromTo(fsSlideshow.find('.fs-images-slider'), {
                    clipPath: 'inset(0% 0% 0% 100%)'
                }, {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    duration: 1,
                    ease: 'power3.inOut',

                })

                tl.fromTo(fsSlideshow.find('.project_0 .pt_char span, .project-button a'), {
                    x: 100
                }, {
                    x: 0,
                    duration: 1,
                    ease: 'power3.out',
                    stagger: 0.01,

                })

                tl.fromTo(fsSlideshow.find('.showcase-footer'), {
                    y: 100
                }, {
                    y: 0,
                    duration: 1,
                    ease: 'power3.out'
                })


            }

        })

    }

    function layoutChange(target, project, parent) {

        if (project) {

            let primaryColor = project.data('primary-color'),
                secondaryColor = project.data('secondary-color'),
                tl = gsap.timeline();

            if (primaryColor) {

                tl.to(target, {
                    backgroundColor: primaryColor,
                    duration: .75,
                    ease: 'sine.out',
                    onStart: () => {
                        headerLayoutChange(false, primaryColor, false, false);
                        cursorLayoutChange(false, primaryColor, false);

                        let hsl = gsap.utils.splitColor(primaryColor, true),
                            lightness = hsl[hsl.length - 1];

                        if (parent) {
                            lightness < 50 ? parent.addClass('light') : parent.removeClass('light');
                            lightness > 50 ? parent.addClass('dark') : parent.removeClass('dark');

                        }

                    }
                }, 0)

            } else {

                tl.to(target, {
                    backgroundColor: 'transparent',
                    duration: .75,
                    ease: 'sine.out',
                    onStart: () => {
                        headerLayoutChange(false, false, false, true);
                        cursorLayoutChange(false, false, true)
                    }
                }, 0);

                parent ? parent.removeAttr('style') : '';

            }


            if (parent) {
                if (secondaryColor) {
                    parent.attr('style', '--mainColor: ' + secondaryColor + '')

                } else {

                    parent.removeAttr('style');
                    parent.removeClass('dark light')
                }


            }





        } else {

            gsap.to(target, {
                backgroundColor: 'transparent',
                duration: .75,
                ease: 'sine.out',
                onStart: () => {
                    headerLayoutChange(false, false, false, true);
                    cursorLayoutChange(false, false, true)
                }
            });

            parent.removeAttr('style');
            parent.removeClass('dark light')

        }
    }


    function projectColorSettings(project) {

        let $this = project,
            img = project.find('img'),
            imgSrc = img.attr('src'),
            bgColor = project.data('primary-color'),
            elementsColor = project.data('secondary-color');

        if ((bgColor == null) && (img.length)) {

            colorjs.average(imgSrc, {
                amount: 1
            }).then(imgColor => {

                let finalColor = "rgb" + "(" + imgColor + ")";
                $this.attr('data-primary-color', finalColor);

            })

        }

        if (((bgColor == null) && (!img.length))) {

            project.attr('data-primary-color', false)
        }


        if (elementsColor == null) {

            $this.attr('data-secondary-color', false)
        }

    }

    function changeHeaderStatus() {
        siteHeader.hasClass('dark') ? headerDark = true : headerDark = false;
        siteHeader.hasClass('light') ? headerLight = true : headerLight = false;
    }

    function showcaseMinimalList() {

        var mainWrap = $('.showcase-minimal-list');

        mainWrap.each(function () {

            var mainWrap = $(this),
                projectsWrap = mainWrap.find('.sml-projects-wrap'),
                pwHeight = projectsWrap.outerHeight(),
                project = projectsWrap.find('.showcase-project'),
                projectsLength = project.length,
                images = mainWrap.find('.sml-images'),
                overlay = mainWrap.find('.sfc-overlay'),
                animation = mainWrap.data('animation'),
                speed = mainWrap.data('speed'),
                colorAnim;

            let startY = 0;

            if (mainWrap.hasClass('infinity')) {

                project.clone().addClass('clone clone-next').appendTo(projectsWrap.find('.sml-wrap'))

                project.clone().addClass('clone clone-prev prev-el').prependTo(projectsWrap.find('.sml-wrap'))

                let prevHeight = mainWrap.find('.clone-prev').length * mainWrap.find('.clone-prev').innerHeight(),
                    cloneLength = (window.innerHeight / 2) / prevHeight;

                if (cloneLength >= 1) {

                    let e = 0

                    for (e = 1; e < cloneLength; e++) {

                        project.clone().addClass('clone clone-next').appendTo(projectsWrap.find('.sml-wrap'))

                        project.clone().addClass('clone clone-prev').prependTo(projectsWrap.find('.sml-wrap'))
                    }

                }

                startY = -1 * mainWrap.find('.clone-prev').innerHeight() * mainWrap.find('.clone-prev').length

                const lenis = new Lenis({
                    smooth: true,
                    infinite: true,
                    smoothTouch: true,
                    lerp: 0.001,
                });

                function raf(time) {

                    lenis.raf(time);

                    requestAnimationFrame(raf);
                }

                requestAnimationFrame(raf);

                barba.hooks.beforeLeave(() => {

                    lenis.destroy();

                });

            }


            project = projectsWrap.find('.showcase-project')
            colorAnim = true;

            if (!mainWrap.hasClass('animate-colors')) {

                colorAnim = false

            }
            project.each(function (i) {

                let $this = $(this),
                    title = $this.find('.project-title'),
                    image = $this.find('.project-image');



                $this.find('a').addClass('showcase-project-link');

                if (colorAnim == true) {

                    projectColorSettings($this);

                }

                if (!$this.hasClass('clone')) {

                    $this.attr('data-index', (i - mainWrap.find('.clone-prev').length))

                    image.addClass('image_' + (i - mainWrap.find('.clone-prev').length)).appendTo(images);


                    $this.addClass('project_' + (i - mainWrap.find('.clone-prev').length));
                }

            })

            gsap.set(projectsWrap, {
                y: startY
            })

            let sct = new ScrollTrigger.create({
                trigger: mainWrap,
                start: 'top top',
                end: speed,
                pin: true,
                scrub: true
            })

            mainWrap.find('.project_0').addClass('active')
            mainWrap.find('.image_0').addClass('active')
            mainWrap.find('.image_0').addClass('trans-media')
            mainWrap.find('.image_0').show();

            layoutChange(overlay, $('.project_0'), projectsWrap.find('a'))

            window.addEventListener('scroll', function () {
                let progY = (scrollY / speed) * (project.outerHeight(true) * projectsLength);
                gsap.set(projectsWrap, {
                    y: startY - progY
                })
                let activeIndex = Math.floor((scrollY / speed) * projectsLength),
                    activeProject = mainWrap.find('.project_' + activeIndex),
                    activeImage = images.find('.image_' + activeIndex),
                    path = activeProject.data('mask'),
                    bgColor = activeProject.data('background-color'),
                    elementsColor = activeProject.data('elements-color');

                activeProject.addClass('active')
                activeProject.nextAll().removeClass('active')
                activeProject.prevAll().removeClass('active');

                images.find('.project-image').hide();
                images.find('.project-image').removeClass('active');
                images.find('.project-image').removeClass('trans-media');

                $(activeImage).show();

                $(activeImage).addClass('active');
                $(activeImage).addClass('trans-media');


                layoutChange(overlay, activeProject, projectsWrap.find('a'))
                changeHeaderStatus()
            })
        })

    }

    function showcaseCarousel() {

        var mainWrap = $('.showcase-carousel');

        mainWrap.each(function () {

            let mainWrap = $(this),
                overlay = mainWrap.find('.sfc-overlay'),
                images = mainWrap.find('.sc-images'),
                scWrap = mainWrap.find('.sc-wrapper'),
                wrapperWidth = scWrap.outerWidth(),
                projectsWrap = mainWrap.find('.sc-projects-wrap'),
                projects = projectsWrap.find('.showcase-project'),
                wrapperHeight = mainWrap.outerHeight(),
                speed = wrapperHeight + mainWrap.data('speed'),
                frac = mainWrap.find('.slides-fraction'),
                curr = frac.find('.slide-current'),
                tot = frac.find('.slide-total'),
                colorAnim;


            curr.html('1')
            tot.html(projects.length)

            mainWrap.hasClass('animate-colors') ? colorAnim = true : colorAnim = false;

            images.addClass('swiper-container').wrapInner('<div class="swiper-wrapper"></div>');

            // Project Settings

            projects.each(function (i) {

                let $this = $(this),
                    image = $this.find('.project-image');

                $this.find('a').addClass('sc-link')


                $this.attr('data-index', i);
                $this.addClass('project_' + i);

                colorAnim ? projectColorSettings($this) : '';

                image.addClass('swiper-slide image_' + i).wrapInner('<div class="fs-parallax-wrap"><div class="slide-bgimg"></div></div>').appendTo(images.find('.swiper-wrapper'));

            })

            // Init first

            if (colorAnim) {

                let bgColor = $('.project_0').data('primary-color');

                gsap.set(overlay, {
                    backgroundColor: bgColor
                })


                layoutChange(overlay, $('.project_0'), $('.showcase-footer, .sc-wrapper'))

            }

            // Init Images Slider
            var interleaveOffset = 0.8,
                imagesSlider = new Swiper('.sc-images', {
                    slidesPerView: 1,
                    speed: 700,
                    // mousewheel: true,
                    parallax: true,
                    watchSlidesProgress: true,
                    on: {
                        progress: function () {
                            let swiper = this;
                            for (let i = 0; i < swiper.slides.length; i++) {
                                let slideProgress = swiper.slides[i].progress,
                                    innerOffset = swiper.width * interleaveOffset,
                                    innerTranslate = slideProgress * innerOffset;

                                swiper.slides[i].querySelector(".slide-bgimg").style.transform =
                                    "translateX(" + innerTranslate + "px)";
                            }
                        },
                        setTransition: function (speed) {
                            let swiper = this;
                            for (let i = 0; i < swiper.slides.length; i++) {
                                swiper.slides[i].style.transition = speed + "ms";
                                swiper.slides[i].querySelector(".slide-bgimg").style.transition = 700 + "ms";
                            }
                        },
                        slideChange: function () {

                            let activeProject = mainWrap.find('.showcase-project.active'),
                                bgColor = activeProject.data('primary-color'),
                                elementsColor = activeProject.data('secondary-color');

                            colorAnim ? layoutChange(overlay, activeProject, $('.showcase-footer, .sc-wrapper')) : '';

                        }

                    },

                })

            // Scroll

            var tl = gsap.timeline({
                scrollTrigger: {
                    trigger: mainWrap,
                    pin: true,
                    scrub: 1,
                    end: speed,

                    id: 'showcaseCarouselScroll',
                    onUpdate: (self) => {

                        if (self.progress <= 0.0001) {

                            projects.removeClass('active');

                            mainWrap.find('.project_0').addClass('active');

                        } else if (self.progress >= 0.0001) {

                            projects.each(function (i) {

                                let $this = $(this),
                                    ofLeft = $this.offset().left,
                                    windowWidth = $(window).outerWidth(),
                                    deadLine = (windowWidth / 2) - $this.outerWidth(),
                                    currentTransform = scWrap.css('transform');

                                if ((ofLeft < (windowWidth / 2)) && (ofLeft > deadLine)) {
                                    $this.addClass('active');
                                } else {
                                    $this.removeClass('active');
                                }

                            });

                        }

                        let activeProject = mainWrap.find('.showcase-project.active'),
                            slideGo = activeProject.data('index');

                        $('.project-image.swiper-slide').removeClass('transition--media');
                        $('.image_' + slideGo).addClass('transition--media');

                        curr.html(slideGo + 1)

                        imagesSlider.slideTo(slideGo, 700);


                    },

                }
            });


            let firstPos = ($(window).outerWidth() / 2) - ($('.project_0').outerWidth() / 2) + 75,
                fillLine = mainWrap.find('.sc-line-fill'),
                lastPos = (wrapperWidth * -1) + ($(window).outerWidth() / 2);

            tl.to(fillLine, {
                width: '100%'
            }, 0)

            tl.fromTo(scWrap, {
                x: firstPos
            }, {
                x: lastPos,
                ease: 'none',
                id: 'willUpdated'
            }, 0)

            // Mobile


            matchMedia.add({
                isMobile: "(max-width: 550px)"

            }, (context) => {
                let {
                    isMobile
                } = context.conditions;

                tl.revert();
                window.scrollTo(0, 0)

                let wrapperWidth = scWrap.outerWidth(),
                    firstPos = ($(window).outerWidth() / 2) - ($('.project_0').outerWidth() / 2) + 75,
                    fillLine = mainWrap.find('.sc-line-fill'),
                    lastPos = (wrapperWidth * -1) + ($(window).outerWidth() / 2),
                    proga = 0;

                projects.removeClass('active');

                mainWrap.find('.project_0').addClass('active');

                $('.project-image.swiper-slide').removeClass('transition--media');
                $('.image_0').addClass('transition--media');


                let scDrag = Draggable.create(scWrap, {
                    type: 'x',
                    bounds: {
                        minX: 0,
                        maxX: lastPos
                    },
                    lockAxis: true,
                    trigger: '.showcase-carousel',
                    dragResistance: 0.5,
                    inertia: true,
                    onThrowUpdate: () => {

                        let prog = Math.floor((scDrag[0].endX * 100) / lastPos) / 100;


                        if (prog <= 0) {
                            projects.removeClass('active');

                            mainWrap.find('.project_0').addClass('active');

                            let activeProject = mainWrap.find('.showcase-project.active'),
                                slideGo = activeProject.data('index');

                            $('.project-image.swiper-slide').removeClass('transition--media');
                            $('.image_' + slideGo).addClass('transition--media');


                        } else if (prog >= 0) {

                            projects.each(function (i) {

                                let $this = $(this),
                                    ofLeft = $this.offset().left,
                                    windowWidth = $(window).outerWidth(),
                                    deadLine = (windowWidth / 2) - $this.outerWidth(),
                                    currentTransform = scWrap.css('transform');


                                if ((ofLeft < (windowWidth / 2)) && (ofLeft > deadLine)) {
                                    $this.addClass('active');
                                } else {
                                    $this.removeClass('active');
                                }

                            });

                        }

                        let activeProject = mainWrap.find('.showcase-project.active'),
                            slideGo = activeProject.data('index');

                        $('.project-image.swiper-slide').removeClass('transition--media');
                        $('.image_' + slideGo).addClass('transition--media');


                        imagesSlider.slideTo(slideGo, 700);
                    },
                    zIndexBoost: false,
                    onDrag: () => {

                        let prog = Math.floor((scDrag[0].endX * 100) / lastPos) / 100;


                        if (prog <= 0.1) {
                            projects.removeClass('active');

                            mainWrap.find('.project_0').addClass('active');

                        } else if (prog >= 0) {

                            projects.each(function (i) {

                                let $this = $(this),
                                    ofLeft = $this.offset().left,
                                    windowWidth = $(window).outerWidth(),
                                    deadLine = (windowWidth / 2) - $this.outerWidth(),
                                    currentTransform = scWrap.css('transform');


                                if ((ofLeft < (windowWidth / 2)) && (ofLeft > deadLine)) {
                                    $this.addClass('active');
                                } else {
                                    $this.removeClass('active');
                                }

                            });

                        }

                        let activeProject = mainWrap.find('.showcase-project.active'),
                            slideGo = activeProject.data('index');

                        $('.project-image.swiper-slide').removeClass('transition--media');
                        $('.image_' + slideGo).addClass('transition--media');


                        curr.html(slideGo + 1)
                        imagesSlider.slideTo(slideGo, 700);

                    }
                });


                return () => {

                    let wrapperHeight = mainWrap.outerHeight(),
                        speed = wrapperHeight + mainWrap.data('speed'),
                        wrapperWidth = scWrap.outerWidth(),
                        firstPos = ($(window).outerWidth() / 2) - ($('.project_0').outerWidth() / 2) + 75,
                        fillLine = mainWrap.find('.sc-line-fill'),
                        lastPos = (wrapperWidth * -1) + ($(window).outerWidth() / 2);
                    tl.to(fillLine, {
                        width: '100%'
                    }, 0)

                    tl.fromTo(scWrap, {
                        x: firstPos
                    }, {
                        x: lastPos,
                        ease: 'none',
                    }, 0);

                    ScrollTrigger.getById('showcaseCarouselScroll').vars.end = lastPos * -1

                }
            });



            function scIntro() {

                let intro = gsap.timeline({
                    once: true,
                    scrollTrigger: {
                        start: 'top-=1 top'
                    }

                });

                projects.each(function () {

                    let $this = $(this),
                        title = $this.find('.project-title');

                    var splitTitle = new SplitText(title, {
                        type: 'lines, chars',
                        linesClass: 'pt_line',
                        charsClass: 'pt_char',
                        display: 'inline-block',
                        reduceWhiteSpace: false

                    })

                    let char = $this.find('.pt_char'),
                        line = $this.find('.pt_line');

                    char.wrapInner('<span></span>');

                    intro.from(line, {
                        x: 200,
                        duration: 1,
                        ease: 'power2.out',
                    }, .5)

                    intro.from(char.find('span'), {
                        x: 120,
                        stagger: 0.05,
                        ease: 'power1.out',
                        duration: 1,
                        onComplete: () => {

                            splitTitle.revert();
                        }
                    }, .5)

                    intro.fromTo(images, {
                        clipPath: 'inset(100% 0% 0% 0%)',
                    }, {
                        clipPath: 'inset(0% 0% 0% 0%)',
                        ease: 'expo.inOut',
                        duration: 1

                    }, 0)

                    intro.fromTo(mainWrap.find('.sc-line').first(), {
                        width: '0%'
                    }, {
                        width: '100%',
                        ease: 'power2.inOut',
                        duration: 1.6

                    }, .5)

                    intro.fromTo(mainWrap.find('.showcase-footer'), {
                        y: 100
                    }, {
                        y: 0,
                        duration: 1,
                        ease: 'power2.out'
                    }, .5)

                })



            }

            mainWrap.hasClass('animate-in') ? scIntro() : '';




        })


    }

    function showcaseFullscreenCarousel() {

        var showcaseFullscreenCarousel = $('.showcase-fullscreen-carousel');

        showcaseFullscreenCarousel.each(function (i) {
            i++

            let mainWrap = $(this),
                projectsWrap = mainWrap.find('.fc-slideshow-wrap'),
                projects = projectsWrap.find('.showcase-project'),
                imagesWrap = mainWrap.find('.fc-images-slider'),
                overlay = mainWrap.find('.sfc-overlay'),
                footer = mainWrap.find('.showcase-footer'),
                dragger = mainWrap.find('.dragging-class'),
                frac = mainWrap.find('.sfc-fraction'),
                curr = frac.find('.sfc-current'),
                tot = frac.find('.sfc-total'),
                cat = mainWrap.find('.sfc-categories'),
                headerChange, footerChange, colorAnim;


            curr.html('01')
            tot.html(projects.length > 9 ? projects.length : '0' + projects.length)


            colorAnim = false;

            if (mainWrap.hasClass('animate-colors')) {
                colorAnim = true
            }

            projectsWrap.addClass('swiper-container').wrapInner('<div class="swiper-wrapper"></div>')


            projects.each(function (i) {

                let $this = $(this),
                    title = $this.find('.project-title'),
                    image = $this.find('.project-image');


                colorAnim ? projectColorSettings($this) : '';

                $this.attr('data-index', i)
                title.attr('data-hover', title.find('*').text())
                $this.addClass('project_' + i)

                $this.find('a').addClass('sc-link');

                image.addClass('swiper-slide s-img_' + i).wrapInner('<div class="fs-parallax-wrap"><div class="slide-bgimg"></div></div>').appendTo(imagesWrap.find('.swiper-wrapper'));

                $this.addClass('swiper-slide');

            })

            imagesWrap.find('.nayla-video').each(function () {

                naylaVideo($(this))

            })


            colorAnim ? layoutChange(overlay, $('.project_0'), projectsWrap) : '';

            imagesWrap.find('.project-image').first().find('.fs-parallax-wrap').addClass('transition--media')

            var titlesSlider = new Swiper('.fc-slideshow-wrap', {
                    slidesPerView: 'auto',
                    centeredSlides: true,
                    speed: 1500,
                    noSwiping: true,
                    slideToClickedSlide: true,
                    allowTouchMove: false,
                    mousewheel: {
                        invert: false,
                        eventsTarget: '.dragging-class'

                    }
                }),
                interleaveOffset = 0.5,
                imagesSlider = new Swiper('.fc-images-slider', {
                    slidesPerView: 1,
                    speed: 1500,
                    parallax: true,
                    noSwiping: true,
                    watchSlideProgress: true,
                    on: {
                        slideChange: function () {

                            projects.removeClass('active');

                            gsap.set(dragger, {
                                x: (this.snapGrid[this.activeIndex - 1] * -1) / projLength
                            })

                            if (colorAnim == true) {

                                let act = projectsWrap.find('.project_' + this.activeIndex);
                                layoutChange(overlay, act, projectsWrap);

                                $('.fs-parallax-wrap').removeClass('transition--media');
                                $('.s-img_' + this.activeIndex).find('.fs-parallax-wrap').addClass('transition--media');

                                let category = act.find('.project-category').text();

                                gsap.to(cat, {
                                    duration: 1.5,
                                    text: {
                                        value: category,

                                    },
                                    ease: "expo.out"
                                });


                            }

                        },
                        slideChangeTransitionEnd: function () {

                            let index = $('.showcase-project.swiper-slide-active').data('index') + 1;



                            curr.html(index > 9 ? index : '0' + index)

                        },
                        progress: function () {
                            let swiper = this;
                            for (let i = 0; i < swiper.slides.length; i++) {
                                let slideProgress = swiper.slides[i].progress,
                                    innerOffset = swiper.width * interleaveOffset,
                                    innerTranslate = slideProgress * innerOffset;

                                swiper.slides[i].querySelector(".slide-bgimg").style.transform =
                                    "translateX(" + innerTranslate + "px)";
                            }
                        },
                        setTransition: function (speed) {
                            let swiper = this;
                            for (let i = 0; i < swiper.slides.length; i++) {
                                swiper.slides[i].style.transition = speed + "ms";
                                swiper.slides[i].querySelector(".slide-bgimg").style.transition = 1500 + "ms";
                            }
                        },
                    }

                });

            function checkActiveProject() {

                projects.each(function () {

                    let $this = $(this),
                        projWidth = Math.PI * $this.outerWidth(),
                        projLeft = Math.PI * $this.offset().left,
                        activeLine = (Math.PI * $(window).outerWidth()) / 2,
                        deadLine = activeLine - (projWidth * 0.5),
                        index = $this.data('index'),
                        bgColor = $this.data('background-color'),
                        elementsColor = $this.data('elements-color');

                    if ((projLeft < activeLine) && (projLeft > deadLine)) {

                        $this.addClass('active');

                        imagesSlider.slideTo(index, 1500);

                        $('.fs-parallax-wrap').removeClass('transition--media');
                        $('.s-img_' + this.activeIndex).find('.fs-parallax-wrap').addClass('transition--media');


                    } else {

                        $this.removeClass('active')
                    }
                })

            }

            checkActiveProject();

            let wrapWidth = mainWrap.find('.swiper-wrapper').outerWidth(),
                snapGrid = titlesSlider.snapGrid,
                draggerEnd = -1 * snapGrid[snapGrid.length - 1],
                firstTranslate = titlesSlider.getTranslate(),
                projLength = projects.length;

            dragger.css('width', wrapWidth)

            var titlesDrag = Draggable.create(dragger, {
                type: 'x',
                bounds: {
                    minX: 0,
                    //                    minX: titlesSlider.getTranslate(),
                    maxX: draggerEnd / projLength
                },
                lockAxis: true,
                inertia: false,
                zIndexBoost: false,
                dragResistence: 1,
                onPress: self => {

                    titlesSlider.disable();
                    mainWrap.addClass('dragging');
                    $('.swiper-slide-active').addClass('active');
                    gsap.set(projectsWrap.find('.swiper-wrapper'), {
                        clearProps: 'transition-duration'
                    });

                    if (colorAnim == true) {
                        let project = projectsWrap.find('.showcase-project.swiper-slide-active');
                        layoutChange(overlay, project, projectsWrap)
                    }

                    gsap.to([siteHeader, mainWrap.find('.showcase-footer, .sfc-fraction')], {
                        opacity: 0,
                        duration: .3
                    })

                },
                onDrag: self => {
                    let currentTransform = dragger.css('transform'),
                        gimmeThat = currentTransform.split(" ")[4].replace(/\,/g, ''),
                        myVal = gimmeThat * projLength;


                    gsap.to(projectsWrap.find('.swiper-wrapper'), {
                        x: myVal,

                    })

                    if (gimmeThat == 0) {
                        titlesDrag[0].applyBounds({
                            minX: firstTranslate,
                            maxX: draggerEnd / projLength
                        })
                    }
                    if (gimmeThat > 0) {
                        titlesDrag[0].applyBounds({
                            minX: firstTranslate / projLength,
                            maxX: draggerEnd / projLength
                        })
                    }
                    gsap.ticker.add(checkActiveProject);

                    if (colorAnim == true) {
                        let project = projectsWrap.find('.showcase-project.active');
                        layoutChange(overlay, project, projectsWrap)
                    }



                },
                onRelease: self => {

                    gsap.ticker.remove(checkActiveProject);
                    mainWrap.removeClass('dragging');

                    let activeProj = projectsWrap.find('.showcase-project.active').data('index');

                    gsap.to([siteHeader, mainWrap.find('.showcase-footer, .sfc-fraction')], {
                        opacity: 1,
                        duration: .5,
                        delay: .3
                    })

                    gsap.to(projectsWrap.find('.swiper-wrapper'), {
                        x: snapGrid[activeProj] * -1,

                        onComplete: () => {
                            projects.removeClass('active')
                            titlesSlider.enable();
                            titlesSlider.slideTo(activeProj, 1500);
                            titlesSlider.update();

                        }
                    })



                }

            });

            titlesSlider.controller.control = imagesSlider;

        })

    }

    function showcaseInfiniteGrid() {

        let fullscreenGrid = $('.showcase-infinite-grid');

        fullscreenGrid.each(function (i) {
            i++

            var mainWrap = $(this),
                id = 'grid_' + i,
                grid = mainWrap.find('.sfg-grid-wrapper'),
                cols = 2,
                projectImages = mainWrap.find('.project-image'),
                titlesWrap = mainWrap.find('.sfg-titles'),
                overlay = mainWrap.find('.sfg-overlay'),
                colorAnim, horizontal;

            if (!grid.find('.showcase-project').length % 2 === 0) {
                grid.append('<div class="showcase-project"></div>')
            }

            if (mainWrap.hasClass('col-3')) {

                cols = 3;
            }

            if (mainWrap.hasClass('horizontal')) {

                horizontal = true;

                grid.append('<div class="sfg_grid_row sfg_grid_row_top"></div>')
                grid.append('<div class="sfg_grid_row sfg_grid_row_bottom"></div>')

            }

            colorAnim = true;

            mainWrap.attr('id', id);

            let parent = document.getElementById(id);

            const repeatItems = (parentEl, total = 0) => {
                const items = [...parentEl.children];
                for (let i = 0; i <= total - 1; ++i) {
                    var cln = items[i].cloneNode(true);
                    parentEl.appendChild(cln);
                }
            };
            repeatItems(parent.querySelector('.sfg-grid-wrapper'), cols * 2);

            let projects = grid.find('.showcase-project');

            projects.each(function (i) {
                i++
                let $this = $(this),
                    image = $this.find('.project-image'),
                    img = $this.find('img');

                $this.find('a').addClass('inner-project-link');
                image.addClass('trans-media')

                if (horizontal && (i % 2 === 0)) {

                    $this.appendTo('.sfg_grid_row_bottom')

                } else {
                    $this.appendTo('.sfg_grid_row_top')
                }


                $this.attr('data-index', i)


                $this.find('a').on('mouseenter', () => {
                    grid.addClass('hovered')
                    $this.addClass('current');


                })

                $this.find('a').on('mouseleave', () => {
                    grid.removeClass('hovered');
                    $this.removeClass('current');

                })

                $this.find('a').on('click', () => {

                    $this.find('.project-image').find('img').not(':first-child').remove();

                    gsap.set($this.find('.project-image').find('img').first(), {
                        opacity: 1
                    })

                })



            })



            let direction = 'vertical';

            if (horizontal) {
                direction = 'horizontal'
            }

            const lenis = new Lenis({
                wrapper: parent.querySelector('.sfg-infinite-wrap'),
                content: parent.querySelector('.sfg-grid-wrapper'),
                smooth: true,
                infinite: true,
                smoothTouch: true,
                lerp: 0.001,
                direction: direction

            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }

            requestAnimationFrame(raf);

            lenis.on('scroll', (e) => {
                var bgMarquee = gsap.getById('nayla_marquee'),
                    velocity = e.velocity / 15

                if ((e.velocity < 5) && (e.velocity > -5)) {

                    mainWrap.removeClass('lenis-scrolling')

                } else {
                    mainWrap.addClass('lenis-scrolling')
                }

            })

        })

    }

    function showcaseInteractiveGrid() {

        let grid = $('.showcase-interactive-grid');

        grid.each(function () {

            let grid = $(this),
                wrapper = grid.children('.projects-wrapper'),
                projects = wrapper.find('.showcase-project'),
                animation = grid.data('animation'),
                positions = [];

            projects.each(function (i) {

                let $this = $(this),
                    left = $this.offset().left + ($this.offset().left > $(window).outerWidth() / 2 ? 75 : 0),
                    top = $this.offset().top > $(window).outerHeight() / 2 ? $this.offset().top + ($(window).outerHeight() / 4) : $this.offset().top,
                    title = $this.find('.project-title'),
                    details = $this.find('.project-details'),
                    singlePos = [];

                $this.find('a').addClass('inner-project-link')

                animation ? $this.addClass('has-anim ' + animation) : '';
                animation ? $this.attr('data-delay', (i / 15)) : '';
                animation ? $this.attr('data-duration', 1.5) : '';

                $this.attr('data-left', left)

                left > $(window).outerWidth() / 2 ? $this.addClass('project-right') : $this.addClass('project-left');

                $this.attr('data-index', i)

                singlePos.push(top, left)
                positions.push(singlePos);

                new SplitText(title, {
                    type: 'chars, lines',
                    linesClass: 'tit_line',
                    charsClass: 'tit_char',
                })

            })


            function zoomIn(active) {

                let state = Flip.getState(projects, {
                        props: 'opacity, filter'
                    }),
                    tl = gsap.timeline(),
                    left = positions[active.data('index')][1] - 25,
                    top = positions[active.data('index')][0] - 25;

                projects.removeClass('active');
                active.addClass('active');

                projects.find('.project-image').removeClass('trans-media');
                $('.showcase-project.active').find('.project-image').addClass('trans-media');

                if (!mobileQuery.matches) {
                    gsap.set(wrapper, {
                        x: -1 * left,
                        y: -1 * top
                    })

                }

                grid.addClass('scatter-active')

                wrapper.addClass('intro-grid--scatter')

                var flippo = Flip.from(state, {
                    duration: 1,
                    ease: 'expo.inOut',
                    absolute: true,

                    simple: true,
                    prune: true,
                });


                tl.add(flippo);


                tl.from(active.find('.tit_char'), {
                    yPercent: 100,
                    stagger: 0.025,
                    duration: 1,
                    ease: 'expo.out',

                }, 0.5)

                tl.from(active.find('.project-details'), {
                    y: 100,
                    opacity: 0,
                    duration: 1.5,
                    ease: 'expo.out',
                }, 1)


            }

            function zoomOut() {

                let state = Flip.getState(projects, {
                        props: 'opacity, filter'
                    }),
                    tl = gsap.timeline();

                projects.removeClass('active');



                gsap.set(wrapper, {
                    x: 0,
                    y: 0
                })



                grid.removeClass('scatter-active')

                wrapper.removeClass('intro-grid--scatter')

                var flippo = Flip.from(state, {
                    duration: 1,
                    ease: 'expo.inOut',
                    absolute: true,
                    simple: true,
                    prune: true,
                });


                tl.add(flippo);

            }


            projects.on('click', function () {

                let $this = $(this);

                zoomIn($this);



            })

            $('.scatter-close').on('click', () => {

                zoomOut()


            })

            if (grid.hasClass('animate-in')) {

                grid.addClass('will-animated')
                wrapper.addClass('intro-grid--scatter')

                gsap.set(wrapper, {
                    x: -500,
                    y: -500
                })



                ScrollTrigger.create({
                    trigger: 'body',
                    start: 'top-=1 top',
                    onEnter: () => {
                        zoomOut()

                        grid.removeClass('will-animated')
                    }


                })






            }


        })




    }

    function showcaseCards() {

        let showcaseCards = $('.showcase-cards');

        showcaseCards.each(function () {

            let cards = $(this),
                wrapper = cards.find('.ssv-projects-wrap'),
                item = cards.find('.showcase-project'),
                speed = cards.data('speed'),
                length = item.length,
                height = item.outerHeight(),
                scEnd = height * length;

            item.clone().addClass('clone').appendTo(wrapper)
            item.clone().appendTo(wrapper)

            item = cards.find('.showcase-project');

            item.each(function (i) {

                $(this).find('a').addClass('sc-link')

                $(this).addClass('anim-project')

                $(this).addClass('anim-project_' + i)

                gsap.set($(this), {
                    zIndex: 100 - i
                })
                gsap.set($(this), {
                    z: -i * 100,
                    y: -i * 30,

                })

                $(this).attr('data-z', -i * 100)
                $(this).attr('data-y', -i * 30);


                $(this).on('mouseenter', function () {


                    $(this).find('.project-image').addClass('transition--media')
                    $(this).addClass('active')

                })

                $(this).on('mouseleave', function () {

                    $(this).find('.project-image').removeClass('transition--media');
                    $(this).removeClass('active')

                })

                $(this).on('click', function () {

                    $(this).off('mouseleave');

                })

            })

            cards.find('.clone').each(function (i) {

                $(this).removeAttr('data-index')
                $(this).removeClass('anim-project');
                $(this).attr('data-index', i)
                $(this).addClass('clone-project_' + i)

            })

            cards.find('.anim-project').each(function (i) {

                $(this).attr('data-index', i)

            })

            let tl = gsap.timeline({
                ease: 'none',

            })

            let sct = new ScrollTrigger.create({
                animation: tl,
                trigger: cards,
                pin: true,
                start: 'top top',
                end: scEnd * 3,
                scrub: true,
            });

            cards.find('.anim-project').each(function (i) {

                tl.to($(this), {
                    ease: 'none',
                    y: $(this).data('y') + (cards.find('.clone').length * 30),
                    z: $(this).data('z') + (cards.find('.clone').length * 100),
                    onUpdate: () => {

                        let cloneItem = cards.find('.clone-project_' + $(this).data('index'))

                        gsap.set(cloneItem, {
                            ease: 'none',
                            y: $(this).css('transform').split(',')['13'] - (cards.find('.clone').length * 30),
                            z: $(this).css('transform').split(',')['14'] - (cards.find('.clone').length * 100),

                        })

                    },
                }, 0)


                let cardOut = gsap.timeline();

                cardOut.to($(this), {
                    ease: 'none',
                    bottom: '-100vh'
                })

                ScrollTrigger.create({
                    trigger: $(this),
                    start: i * (height * 3),
                    end: (i + 1) * (height * 3),
                    scrub: true,
                    animation: cardOut
                })

            })

            const lenis = new Lenis({

                infinite: true,
                smooth: true,
                infinite: true,
                smoothTouch: false,
                duration: 2

            });

            function raf(time) {
                lenis.raf(time);
                ScrollTrigger.update();
                requestAnimationFrame(raf);
            }

            requestAnimationFrame(raf);

            barba.hooks.beforeLeave(() => {

                lenis.destroy();
            });



        })

    }

    function horizontalList() {

        $('.showcase-horizontal-list').each(function () {

            let mainWrap = $(this),
                titlesWrap = mainWrap.find('.shl-wrapper'),
                projects = titlesWrap.find('.showcase-project'),
                imagesWrap = mainWrap.find('.shl-images'),
                projLength = projects.length,
                cat = mainWrap.find('.shl-cat'),
                fract = mainWrap.find('.shl-fraction'),
                curr = fract.children('.shl-curr'),
                tot = fract.children('.shl-tot');

            if (projLength < 10) {
                tot.html('0' + projLength)

            } else {
                tot.html(projLength)
            }

            projects.each(function (i) {
                i++

                let $this = $(this),
                    image = $this.find(('.project-image')),
                    link = $this.find('a');

                $this.addClass('project_' + i);
                $this.attr('data-index', i);
                image.wrapInner('<div class="image-wrap"></div>').addClass('project_image_' + i).appendTo(imagesWrap);

                link.on('mouseenter', function () {

                    let findImg = $('.project_image_' + i).find('.image-wrap');

                    gsap.to(findImg, {
                        filter: 'grayscale(0%)',
                        duration: .3,
                        opacity: 1
                    })

                })

                link.on('mouseleave', function () {

                    gsap.to(mainWrap.find('.image-wrap'), {
                        filter: 'grayscale(100%)',
                        duration: .3,
                        opacity: 0.5
                    })
                })

            })


            let x = 0,
                snapProg = [];

            for (x = 0; x <= projLength; x++) {
                snapProg.push(x / (projLength - 1))
            }

            imagesWrap.find('.project-image').first().addClass('active')

            gsap.to(titlesWrap, {
                xPercent: -100,
                ease: 'none',
                scrollTrigger: {
                    trigger: mainWrap,
                    scrub: 1,
                    //                    snap: {
                    //                        snapTo: snapProg,
                    //                        directional: false
                    //                    },
                    end: 'bottom+=5000 top',
                    pin: true,
                    onUpdate: self => {

                        let findProj = '.project_' + Math.ceil(self.progress * projLength),
                            findImage = '.project_image_' + Math.ceil(self.progress * projLength),
                            activeIndex = $(findProj).data('index'),
                            snapProg = self.progress * projLength;

                        if (activeIndex < 10) {
                            curr.html('0' + activeIndex)

                        } else {
                            curr.html(activeIndex)
                        }

                        cat.text($(findProj).find('.project-category').text())




                        imagesWrap.find('.project-image').removeClass('active');
                        projects.removeClass('active');
                        $(findProj).addClass('active');
                        $(findImage).addClass('active');


                        $(findProj).prevAll().each(function (i) {

                            let $this = $(this);

                            gsap.to($this, {
                                opacity: 0.1 - (i / 20),
                                duration: .2
                            })

                        })

                        $(findProj).nextAll().each(function (i) {

                            let $this = $(this);

                            gsap.to($this, {
                                opacity: 0.1 - (i / 20),
                                duration: .2

                            })

                        })

                    }
                }
            })






        })






    }



    ///////////////////////////////
    //    Page Build Elements    //
    ///////////////////////////////


    var switchedDark,
        switchedLight;

    function layoutSwitcher() {


        function logosSwitch() {

            let inverts = $('.ls-invert'),
                brights = $('.ls-bright');


            if (inverts.length) {
                inverts.find('img').toggleClass('inverted')

            }

            if (brights.length) {

                brights.find('img').toggleClass('brighted')

            }

        }



        let switcher = $('.nayla-layout-switcher'),
            switchDark = switcher.find('.switch-dark'),
            switchLight = switcher.find('.switch-light'),
            follower = switcher.find('.active-follower'),
            body = $('body');



        if (switcher.hasClass('ls_switcher')) {



            body.hasClass('light') ? switchLight.addClass('active') : switchLight.removeClass('active');
            body.hasClass('dark') ? switchDark.addClass('active') : switchDark.removeClass('active');


            barba.hooks.after((data) => {

                body.hasClass('light') ? switchLight.addClass('active') : switchLight.removeClass('active');
                body.hasClass('dark') ? switchDark.addClass('active') : switchDark.removeClass('active');


            });

            switchDark.on('click', function () {

                switchLight.removeClass('active');

                $(this).addClass('active')

                $('body').removeClass('light');

                $('body').addClass('dark')

                if (!$('.project-page-header.half-image').length && !$('.project-page-header.fullscreen-image').length && !$('.project-page-header.tall-image').length) {

                    if (!siteHeader.hasClass('blend')) {

                        if (siteHeader.hasClass('dark')) {

                            headerDark = false
                            headerLight = true


                            siteHeader.removeClass('dark')
                            siteHeader.addClass('light')

                        }

                    }


                }


                gsap.to(follower, {
                    left: '49%'
                })

                logosSwitch()

                switchedDark = true;
                switchedLight = false

            })

            switchLight.on('click', function () {

                switchDark.removeClass('active');

                $(this).addClass('active')

                $('body').removeClass('dark');

                $('body').addClass('light')

                if (!$('.project-page-header.half-image').length && !$('.project-page-header.fullscreen-image').length && !$('.project-page-header.tall-image').length) {


                    if (!siteHeader.hasClass('blend')) {

                        if (siteHeader.hasClass('light')) {

                            siteHeader.removeClass('light')
                            siteHeader.addClass('dark')

                            headerDark = true
                            headerLight = false


                        }
                    }

                }
                gsap.to(follower, {
                    left: '1%'
                })

                logosSwitch()

                switchedDark = false;
                switchedLight = true;




            })

        } else if (switcher.hasClass('ls_button')) {

            body.hasClass('light') ? switcher.addClass('light-active') : switcher.removeClass('light-active');

            body.hasClass('dark') ? switcher.addClass('dark-active') : switcher.removeClass('dark-active');

            barba.hooks.after((data) => {

                body.hasClass('light') ? switcher.addClass('light-active') : switcher.removeClass('light-active');

                body.hasClass('dark') ? switcher.addClass('dark-active') : switcher.removeClass('dark-active');


            });

            switcher.on('click', function () {

                logosSwitch()

                if (body.hasClass('light')) {

                    $('body').removeClass('light');

                    $('body').addClass('dark')

                    if (!$('.project-page-header.half-image').length && !$('.project-page-header.fullscreen-image').length && !$('.project-page-header.tall-image').length) {

                        if (!siteHeader.hasClass('blend')) {
                            headerDark = true
                            headerLight = false


                            siteHeader.removeClass('dark')
                            siteHeader.addClass('light')
                        }

                    }
                    switcher.removeClass('light-active');
                    switcher.addClass('dark-active');
                    
                       switchedDark = true;
                switchedLight = false;



                } else if (body.hasClass('dark')) {



                    $('body').removeClass('dark');

                    $('body').addClass('light')

                    if (!$('.project-page-header.half-image').length && !$('.project-page-header.fullscreen-image').length && !$('.project-page-header.tall-image').length) {

                        if (!siteHeader.hasClass('blend')) {

                            headerDark = false
                            headerLight = true


                            siteHeader.addClass('dark')
                            siteHeader.removeClass('light')
                        }
                    }
                    switcher.removeClass('dark-active');
                    switcher.addClass('light-active');
                    
                       switchedDark = false;
                switchedLight = true;

                }

            })

        }

    }

    function postsGrid() {

        var grid = $('.nayla-posts-grid');


        grid.each(function () {


            let grid = $(this),
                filters = grid.find('.grid--filters .filters-list > li'),
                posts = grid.find('.grid--post--item'),
                switcher = grid.find('.grid--switcher');


            filters.each(function () {

                let $this = $(this),
                    cat = $this.data('category');

                $this.on('click', function () {

                    filters.removeClass('active')
                    $this.addClass('active')


                    if (cat === 'all') {


                        let postsState = Flip.getState(posts);

                        posts.show();

                        Flip.from(postsState, {
                            duration: 1,
                            scale: false,
                            ease: "expo.out",
                            stagger: 0,
                            absolute: true,
                            absoluteOnLeave: true,
                            onEnter: elements => gsap.fromTo(elements, {
                                opacity: 0,
                                scale: 0
                            }, {
                                opacity: 1,
                                scale: 1,

                            }),
                            onLeave: elements => gsap.to(elements, {
                                opacity: 0,
                                scale: 0,

                            })
                        });


                    } else {


                        let findCat = '.cat_' + cat,
                            postsState = Flip.getState(posts);

                        posts.show();
                        posts.hide();
                        $(findCat).show();

                        Flip.from(postsState, {
                            duration: 1,
                            scale: false,
                            ease: "expo.out",
                            stagger: 0,
                            absolute: true,
                            absoluteOnLeave: true,
                            onEnter: elements => gsap.fromTo(elements, {
                                opacity: 0,
                                scale: grid.hasClass('grid-list') ? 1 : 0,
                            }, {
                                opacity: 1,
                                scale: 1,

                            }),
                            onLeave: elements => gsap.to(elements, {
                                opacity: 0,
                                scale: grid.hasClass('grid-list') ? 1 : 0,

                            })
                        });

                    }

                })



            })


            let switchCol = switcher.find('.switch-col'),
                switchList = switcher.find('.switch-list');


            switchCol.on('click', function () {

                if (grid.hasClass('grid-list')) {

                    gsap.to(grid, {
                        opacity: 0,
                        onComplete: () => {
                            grid.removeClass('grid-list');
                            grid.addClass('grid-col');

                            gsap.to(grid, {
                                opacity: 1
                            })
                        }

                    })


                }


            })

            switchList.on('click', function () {

                if (grid.hasClass('grid-col')) {

                    gsap.to(grid, {
                        opacity: 0,
                        onComplete: () => {
                            grid.removeClass('grid-col');
                            grid.addClass('grid-list');

                            gsap.to(grid, {
                                opacity: 1
                            })
                        }

                    })


                }


            })

        })


    }

    postsGrid()

    function naylaCartButton() {

        var button = $('.nayla-cart-button');

        button.wrapInner('<span></span>')



    }

    function naylaProductRatings() {

        var rating = $('.product-rating');

        rating.each(function () {

            let $this = $(this),
                stars = $this.find('.product-stars'),
                perc = $this.data('rating'),
                i = 1;

            for (i = 1; i <= 5; i++) {

                stars.append('<span class="material-icons">star</span>')
            }

            stars.clone().addClass('stars-fill').appendTo($this);

            gsap.set($this.find('.stars-fill'), {
                width: perc + '%'
            })


        })
    }
    naylaProductRatings()

    function naylaAddTocartButton() {

        var button = $('.product-add-to-cart');

        button.each(function () {

            let dcr = $('.count--decrease'),
                inc = $('.count--increase'),
                input = $('.current-quantity'),
                currVal = input.attr('value'),
                x = 1;

            dcr.on('click', () => {

                x--

                x < 1 ? x = 1 : '';


                input.attr('value', x)

            })

            inc.on('click', () => {
                x++

                input.attr('value', x);


            })


        })


    }

    naylaAddTocartButton()


     function naylaLightboxGallery(gallery, items) {

                let $items = $(items),
                    $gallery = $(gallery),
                    itemsLenght = $items.length,
                    thumbsDragger, thumbsWheeler;

                const $lightbox = $('<div>', {
                        class: 'nayla-lightbox-hold',
                        html: `
                    <div class="lightbox-overlay"></div>
                    <div class="lightbox-gal"></div>
                    <span class="active-hold"></span>
                    <div class="lightbox-close">CLOSE</div>
                    <div class="lightbox-fraction"><div class="lf-curr"></div><div class="lf-tot">${itemsLenght}</div></div>
                       `
                    }),
                    lightboxReset = $lightbox.html(),
                    itemsState = Flip.getState($items, {
                        props: 'padding , opacity, filter'
                    });




                function createNav(range, length, index) {

                    let wrap = $('.lightbox-convert'),
                        x = 0,
                        result = 0,
                        prevVal = [];


                    for (x = 0; x < index; x++) {
                        prevVal.push($('.thumb_' + x).outerWidth())
                    }

                    prevVal.length != 0 ? result = prevVal.reduce((a, b) => a + b, 0) : '';

                    let curr = $('.thumb_' + index).outerWidth() / 2,
                        currX = -result - curr;

                    gsap.to(wrap, {
                        x: currX,
                        duration: 2,
                        ease: 'expo.inOut',
                    })

                    const snaps = $items.map(function () {
                        return -($(this).position().left + ($(this).outerWidth() / 2));
                    }).get();

                    function detectActive() {

                        $items.each(function () {

                            let $this = $(this),
                                entrance = $this.offset().left,
                                deadLine = $this.offset().left + $this.outerWidth(),
                                center = $(window).outerWidth() / 2;

                            entrance < center && center < deadLine ? $this.addClass('active') : $this.removeClass('active');

                            let active = $('.grid--item.active').data('index');

                            $('.lightbox-gal img').removeClass('active')
                            $('.lb--img--' + active).addClass('active')

                        })

                        gsap.to('.active-hold', {
                            width: $('.lightbox-thumb.active').outerWidth() - 13,
                            duration: .35
                        })

                        // Update Fraction
                        $lightbox.find('.lf-curr').html($('.lightbox-thumb.active').data('index') + 1)

                    }



                    // NavbyDrag
                    thumbsDragger = Draggable.create(wrap, {
                        type: 'x',
                        bounds: {
                            minX: -$items.first().outerWidth() / 2,
                            maxX: -range + ($items.last().outerWidth() / 2)
                        },
                        lockAxis: true,
                        inertia: true,
                        zIndexBoost: false,
                        id: 'lightboxThumbs',
                        snap: snaps,
                        onDrag: () => detectActive(),
                        onThrowUpdate: () => detectActive()
                    });
                    thumbsDragger[0].disable();



                    //NavbyWheel
                    thumbsWheeler = Hamster(document.querySelector('.nayla-lightbox-hold'));
                    var xVal = currX;

                    thumbsWheeler.wheel(function (event, delta, deltaX, deltaY) {

                        detectActive();
                        thumbsDragger[0].update();

                        xVal += event.deltaY * 1.1;
                        xVal = Math.min(Math.max(-range + ($items.last().outerWidth() / 2), xVal), -$items.first().outerWidth() / 2);

                        gsap.to(wrap, {
                            x: xVal,
                            onComplete: () => {
                                gsap.to(wrap, {
                                    x: gsap.utils.snap(snaps, xVal),
                                })
                            }
                        })
                    });

                    //NavbyClick
                    //            $items.on('click', function () {
                    //
                    //                if ($gallery.hasClass('lightbox-active')) {
                    //                    
                    //                    
                    //                    gsap.to(wrap, {
                    //                        x: -($(this).position().left + ($(this).outerWidth() / 2)),
                    //                        duration: 1,
                    //                        ease: 'expo.inOut',
                    //                        onUpdate: () => {
                    //                            detectActive();
                    //                            thumbsDragger[0].update();
                    //                        }
                    //                    })
                    //
                    //                }
                    //
                    //            })


                }

                $(items).each(function (i) {

                    let $this = $(this),
                        img = $this.find('img'),
                        cl = $(items).find('img').clone();

                    $this.attr('data-index', i);
                    $this.addClass('thumb_' + i);


                    $this.on('click', () => {

                        if (!$gallery.hasClass('lightbox-active')) {
                            $this.addClass('active');
                            //Resets
                            disableScroll();
                            gsap.killTweensOf($items);
                            $('body').append($lightbox);
                            $gallery.addClass('lightbox-active');

                            setTimeout(function () {
                                cl.appendTo('.lightbox-gal');

                                $('.lightbox-gal').find('img').each(function (i) {
                                    $(this).addClass('lb--img--' + i);
                                });
                                $lightbox.find('.lf-curr').html(i + 1)

                            })

                            let itemIndex = $(this).data('index');

                            $gallery.addClass('lightbox-convert');

                            gsap.set($gallery.parents('.elementor-section'), {
                                zIndex: 999999,
                                pointerEvents: 'none'
                            })

                            $items.addClass('lightbox-thumb');

                            const result = $items.toArray().reduce((a, item) => a + Math.floor($(item).outerWidth()), 10);

                            gsap.to('.active-hold', {
                                width: $this.outerWidth() - 9,
                                duration: 1
                            })

                            createNav(result, 18, itemIndex)


                            lightboxAnim('in')

                            Flip.from(itemsState, {
                                duration: 2,
                                ease: 'expo.inOut',
                                absolute: true,
                                onStart: () => {
                                    setTimeout(function () {
                                        let activeImage = $('.lb--img--' + $this.data('index'));
                                        activeImage.addClass('active');

                                        gsap.fromTo(activeImage, {
                                            clipPath: 'inset(100% 0% 0% 0%)',
                                            scale: .5
                                        }, {
                                            clipPath: 'inset(0% 0% 0% 0%)',
                                            delay: 1.6,
                                            scale: .5,
                                            duration: 1.5,
                                            ease: 'expo.out',
                                            onComplete: () => {
                                                gsap.to(activeImage, {
                                                    scale: 1,
                                                    duration: 1,
                                                    ease: 'expo.inOut',
                                                    onComplete: () => {
                                                        gsap.set('body', {
                                                            clearProps: 'cursor'
                                                        })
                                                    }
                                                })
                                            }

                                        })

                                    })

                                },
                                onComplete: () => {
                                    $lightbox.find('.lightbox-close').on('click', () => closeLightBox())
                                }

                            });


                        }


                    })


                })


                function lightboxAnim(direction) {

                    let tl = gsap.timeline({
                            onStart: () => {
                                $('body').css('cursor', 'wait')
                            },
                        }),
                        lightbox = $lightbox,
                        overlay = lightbox.find('.lightbox-overlay');

                    if (direction === 'in') {

                        tl.to(overlay, {
                            height: '100%',
                            duration: 1.5,
                            ease: 'expo.out',
                            delay: 1,
                            onComplete: () => {
                                $lightbox.addClass('active');
                                thumbsDragger[0].enable();
                            }
                        })

                    } else if (direction === 'out') {

                        tl.to(lightbox, {
                            clipPath: 'inset(0% 0% 100% 0%)',
                            duration: 1,
                            ease: 'expo.inOut',
                            onStart: () => {
                                $gallery.css('zIndex', 9999999999999);
                                thumbsDragger[0].disable();

                            },
                            onComplete: () => {
                                gsap.set(lightbox, {
                                    clearProps: 'all'
                                })
                                lightbox.find('img').removeClass('active');
                                lightbox.html(lightboxReset)
                                lightbox.removeClass('active')
                                lightbox.remove();
                                gsap.set($gallery, {
                                    clearProps: 'all'
                                })

                            }
                        })


                    }


                }


                function closeLightBox() {


                    thumbsDragger[0].kill()
                    thumbsWheeler.unwheel();

                    enableScroll()
                    const itemsNewState = Flip.getState($items, {
                        props: 'padding , opacity, filter'
                    });

                    lightboxAnim('out')

                    $gallery.removeClass('lightbox-convert');
                    $gallery.removeClass('lightbox-active');
                    $items.removeClass('lightbox-thumb active');


                    gsap.to($gallery, {
                        x: 0,
                        duration: 2,
                        ease: 'expo.inOut',

                    })



                    Flip.from(itemsNewState, {
                        duration: 2,

                        ease: 'expo.inOut',
                        absolute: true,
                        onComplete: () => {
                            gsap.set('body', {
                                clearProps: 'cursor'
                            });

                            gsap.set($gallery.parents('.elementor-section'), {
                                clearProps: 'all'
                            })

                        }

                    });


                }


            }

    function naylaDynamicGrid() {

        const grid = $('.nayla-dynamic-grid');


        grid.each(function () {

            let grid = $(this),
                wrapper = grid.children('.grid--wrapper'),
                items = wrapper.children('.grid--item'),
                animation = grid.data('animation');


            grid.hasClass('lightbox-gallery') ? grid.css('height', grid.outerHeight()) : '';

            grid.hasClass('lightbox-gallery') ? naylaLightboxGallery(wrapper, items) : '';

            items.each(function (i) {

                i++

                let $this = $(this);

                $this.find('a').addClass('inner-project-link');
                $this.find('.single-project-image').addClass('trans-media');

                if (grid.hasClass('parallax-on') && $this.find('img').length) {

                    $this.find('img').wrap('<div class="parallax-wrap"></div>');

                    $this.find('.parallax-wrap').css('width', $this.outerWidth());
                    $this.find('img').css('height', 'calc(100% + 100px)');

                    gsap.to($this.find('img'), {
                        y: -100,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: $this,
                            scrub: 1,
                            start: 'top bottom',
                            emd: 'bottom top',
                        }
                    })

                    $(window).on('resize', () => {

                        gsap.set($this.find('.parallax-wrap'), {
                            clearProps: 'width'
                        })
                        $this.find('.parallax-wrap').css('width', $this.outerWidth());

                    })

                }

                if (animation != null) {

                    let stg = 0;

                    grid.attr('data-stagger') < 0 ? stg = -1 * (grid.attr('data-stagger') / i) : stg = grid.attr('data-stagger') * i;


                    $this.addClass(animation);
                    $this.attr('data-duration', grid.attr('data-duration'));
                    $this.attr('data-delay', stg)
                    $this.attr('data-block-color', grid.attr('data-block-color'))

                    grid.hasClass('image-grid') ? new naylaImageAnimation($this) : new naylaGeneralAnimations($this);

                }

            })


        })

    }

    function naylaFilterableGrid() {

        let $scope = $('.nayla-filterable-grid'),
            wrapper = $scope.find('.nfg--wrapper'),
            items = $scope.find('.nfg--item'),
            filtersWrapper = $scope.find('.nfg--filters--wrapper'),
            filters = $scope.find('.nfg--filters--wrapper li');

        items.each(function (i) {
            i++

            let $this = $(this),
                cats = $this.data('cats'),
                arr = cats.split(','),
                currCats = [];


            for (i = 0; i < arr.length; i++) {

                currCats.push(arr[i].split(' ').join('_').toLowerCase())
            }

            for (i = 0; i < currCats.length; i++) {

                $this.addClass('cat_' + currCats[i])
            };


        })

        filters.each(function () {

            let $this = $(this);

            $this.on('click', function () {

                filters.not($this).removeClass('active');
                $this.addClass('active');

                let state = Flip.getState(items);

                gsap.to(window, {
                    scrollTo: wrapper.offset().top - 100,
                    duration: .5
                })

                if ($this.hasClass('all')) {

                    items.show();

                } else {

                    let cat = $this.data('cat'),
                        findProjs = $('.cat_' + cat);

                    items.not(findProjs).hide();
                    findProjs.show();

                }


                Flip.from(state, {
                    duration: .75,
                    scale: false,
                    ease: "expo.inOut",
                    stagger: 0,
                    absolute: true,
                    absoluteOnLeave: true,
                    onEnter: elements => gsap.fromTo(elements, {
                        opacity: 0,
                        scale: 0
                    }, {
                        opacity: 1,
                        scale: 1,

                    }),
                    onLeave: elements => gsap.to(elements, {
                        opacity: 0,
                        scale: 0,

                    })
                });


            })

        })

        ScrollTrigger.create({
            trigger: wrapper,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => {
                filtersWrapper.addClass('active')
            },
            onEnterBack: () => {
                filtersWrapper.addClass('active')
            },
            onLeave: () => {
                filtersWrapper.removeClass('active')
            },
            onLeaveBack: () => {
                filtersWrapper.removeClass('active')
            }
        })

    }

    function naylaForms() {

        let form = $('.nayla-form');

        form.each(function () {

            let $this = $(this),
                inputs = $this.find('input, textarea');


            inputs.each(function () {

                let $this = $(this),
                    wrap = $this.parent('div'),
                    label = wrap.find('label');

                $this.on('focus', () => {

                    wrap.addClass('active');

                })

                $this.on('focusout', () => {

                    $this.val().length > 0 ? '' : wrap.removeClass('active');



                })




            })


        })


    }

    function naylaSingleProject() {


        $('.single-project').find('a').addClass('inner-project-link');
        $('.single-project').find('.single-project-image').addClass('trans-media');


    }

    function naylaDynamicCarousel() {
        const carousel = $('.nayla-dynamic-carousel');

        carousel.each(function () {

            let carousel = $(this),
                wrapper = carousel.children('.carousel--wrapper'),
                items = wrapper.children('.carousel--item'),
                end,
                length = items.length,
                parentLeft,
                next = carousel.find('.carousel--next'),
                prev = carousel.find('.carousel--prev'),
                animation = carousel.data('animation'),
                customPin = carousel.data('pin'),
                speed = carousel.data('scroll-speed'),
                carouselDrag,
                wrapScroll,
                val;


            val = 0;
            end = wrapper.outerWidth() - items.last().outerWidth() - (items.last().outerWidth() / 2);
            parentLeft = carousel.offset().left,

                carousel.find('.carousel--total').html(length);

            items.each(function (i) {

                let $this = $(this);

                $this.attr('data-index', i);
                $this.addClass('carousel--item--' + i);

                if (carousel.hasClass('parallax-on')) {

                    $this.find('img').wrap('<div class="parallax-wrap"></div>');
                    $this.find('.parallax-wrap').css('height', $this.find('img').outerHeight());
                    $this.find('.parallax-wrap').css('width', $this.find('img').outerWidth());

                    $this.find('img').css('width', mobileQuery.matches ? 'calc(100% + 50px)' : 'calc(100% + 100px)');

                    $(window).on('resize', () => {

                        $this.find('.parallax-wrap').css('width', $this.outerWidth());
                        $this.find('img').css('width', mobileQuery.matches ? 'calc(100% + 50px)' : 'calc(100% + 100px)');

                    })
                }

                if (animation != null) {

                    let stg = 0;

                    carousel.attr('data-stagger') < 0 ? stg = -1 * (carousel.attr('data-stagger') / i) : stg = carousel.attr('data-stagger') * i;


                    $this.addClass(animation);
                    $this.attr('data-duration', carousel.attr('data-duration'));
                    $this.attr('data-delay', stg)
                    $this.attr('data-block-color', carousel.attr('data-block-color'))

                    carousel.hasClass('image-carousel') ? new naylaImageAnimation($this) : new naylaGeneralAnimations($this);

                }

            })

            function getCurrentItem() {

                items.each(function () {

                    let $this = $(this),
                        pad = $this.css('paddingRight'),
                        entrance = $this.offset().left,
                        deadLine = $this.offset().left + $this.outerWidth(),
                        center = $(window).outerWidth() / 2;

                    entrance < center && center < deadLine ? $this.addClass('active') : $this.removeClass('active');

                    let activeItem = wrapper.find('.carousel--item.active');

                    items.removeClass('prev next');
                    prev.removeClass('disabled');
                    next.removeClass('disabled');

                    !activeItem.next().length ? next.addClass('disabled') : activeItem.next().addClass('next');
                    !activeItem.prev().length ? prev.addClass('disabled') : activeItem.prev().addClass('prev');


                    activeItem.data('index') == null ? '' : carousel.find('.carousel--current').html(activeItem.data('index') + 1);


                    if (carousel.hasClass('parallax-on')) {

                        let piv = ScrollTrigger.positionInViewport(this, 'right', true) * (mobileQuery.matches ? 50 : 100);

                        if ($this.find('img').length) {
                            gsap.to($this.find('img'), {
                                x: Math.floor(-piv)
                            })
                        }

                    }

                })


            }
            getCurrentItem();

            function navDrag() {

                wrapper.addClass('cursor-text');
                wrapper.attr('data-cursor-text', carousel.attr('data-drag-text'));

                carouselDrag = Draggable.create(wrapper, {
                    type: 'x',
                    bounds: {
                        minX: 0,
                        maxX: -end
                    },
                    lockAxis: true,
                    dragResistance: 0.5,
                    inertia: true,
                    onThrowUpdate: () => {
                        getCurrentItem();
                        val = carouselDrag[0].x * -1
                    },
                    zIndexBoost: false,
                    onDrag: () => {
                        getCurrentItem();
                        val = carouselDrag[0].x * -1
                    }
                });

            }

            function navScroll() {

                let endtrigger = speed == null ? 'bottom+=3000 bottom' : 'bottom+=' + speed + ' bottom',
                    start = customPin == null ? 'center center' : 'top top',
                    pinTarget = customPin == null ? carousel : customPin,
                    endNumber = speed == null ? 1000 : 1000 + speed;




                if (carousel.hasClass('items-bottom')) {

                    start = 'bottom bottom'

                }

                //                carousel.find('.carousel-controls') ? start = 'center center+=50' : '';

                wrapScroll = gsap.timeline({
                    scrollTrigger: {
                        trigger: pinTarget,
                        start: start,
                        end: carousel.offset().top < $(window).outerHeight() ? endNumber : endtrigger,
                        pin: true,
                        id: 'caroScroll',
                        scrub: 1,
                        pinReparent: $('body').hasClass('smooth-scroll') ? true : false,
                        onLeaveBack: () => getCurrentItem(),
                        onEnterBack: () => getCurrentItem(),
                        onScrubComplete: () => getCurrentItem(),
                        onEnter: () => getCurrentItem(),
                        onLeave: () => getCurrentItem(),
                        onUpdate: () => getCurrentItem()
                    }
                });



                wrapScroll.to(wrapper, {
                    x: -end,

                })

            }

            var snaps;

            function getSnaps() {

                snaps = items.map(function () {
                    if (mobileQuery.matches) {
                        return -($(this).position().left + ($(this).outerWidth()) + parentLeft);
                    } else {
                        return -($(this).position().left + ($(this).outerWidth() / 2) + parentLeft);
                    }
                }).get();



            }

            function navPrevNext() {

                next.on('click', function () {

                    getSnaps();
                    let nextProj = wrapper.find('.carousel--item.next'),
                        marg = parseInt(nextProj.css('marginRight')),
                        index = nextProj.data('index') - 1

                    gsap.to(wrapper, {
                        x: mobileQuery.matches ? snaps[index] : snaps[index] + marg,
                        duration: 1.5,
                        ease: 'expo.out',
                        onUpdate: () => {
                            getCurrentItem();
                            carouselDrag ? carouselDrag[0].update() : '';
                        }
                    })

                })

                prev.on('click', function () {

                    getSnaps();

                    let prevProj = wrapper.find('.carousel--item.prev'),
                        marg = parseInt(prevProj.css('marginRight')),
                        index = prevProj.data('index') - 1,
                        val = snaps[index];

                    val == null ? val = 0 : '';
                    gsap.to(wrapper, {
                        x: mobileQuery.matches ? val : val + marg,
                        duration: 1.5,
                        ease: 'expo.out',
                        onUpdate: () => {
                            getCurrentItem();
                            carouselDrag ? carouselDrag[0].update() : '';
                        }
                    })

                })
            }


            carousel.hasClass('navScroll') ? navScroll() : navDrag();

            carousel.find('.carousel--navigation').length ? navPrevNext() : '';




            matchMedia.add({
                isMobile: "(max-width: 450px)"

            }, (context) => {

                let {
                    isMobile
                } = context.conditions;

                gsap.set(wrapper, {
                    x: 0
                })

                gsap.set(wrapper.find('img'), {
                    clearProps: 'transform'
                })

                parentLeft = carousel.offset().left;

                gsap.set(items.find('img'), {
                    clearProps: 'transform'
                })

                end = wrapper.outerWidth() - items.last().outerWidth();

                if (carouselDrag) {

                    carouselDrag[0].applyBounds({
                        minX: 0,
                        maxX: -end
                    })

                    carouselDrag[0].update()
                }


                if (wrapScroll) {
                    wrapScroll.clear()

                    wrapScroll.to(wrapper, {
                        x: -end,

                    })

                }

                return () => {


                    gsap.set(wrapper.find('img'), {
                        clearProps: 'transform'
                    })

                    gsap.set(wrapper, {
                        x: 0
                    })
                    parentLeft = carousel.offset().left;

                    gsap.set(items.find('img'), {
                        clearProps: 'transform'
                    })

                    end = wrapper.outerWidth() - items.last().outerWidth() - (items.last().outerWidth() / 2);

                    if (carouselDrag) {
                        carouselDrag[0].applyBounds({
                            minX: 0,
                            maxX: -end
                        })
                        carouselDrag[0].update()
                    }

                    if (wrapScroll) {
                        wrapScroll.clear()

                        wrapScroll.to(wrapper, {
                            x: -end,

                        })

                    }




                }
            });


        })

    }

    function naylaParallax() {

        const item = $('.has-parallax');

        item.each(function () {

            let $this = $(this),
                tl = gsap.timeline({

                    scrollTrigger: {
                        trigger: $this,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                }),
                speed = $this.data('parallax-speed'),
                direction = $this.data('parallax-direction'),
                x = 0,
                y = 0;

            speed == null ? speed = 20 : '';
            direction == null ? direction = 'up' : '';

            direction == 'up' ? y = (speed * -1) : '';
            direction == 'down' ? y = speed : '';
            direction == 'left' ? x = (speed * -1) : '';
            direction == 'right' ? x = speed : '';

            tl.to($this, {
                yPercent: y,
                xPercent: x,

            });

            matchMedia.add({
                isMobile: "(max-width: 450px)"

            }, (context) => {
                let {
                    isMobile
                } = context.conditions;

                tl.clear();
                gsap.set($this, {
                    clearProps: 'all'
                })

                return () => {
                    tl.to($this, {
                        yPercent: y,
                        xPercent: x,

                    });

                }
            });

        })


    }

    function naylaIcons() {

        $('.nayla-icon').each(function () {

            let $this = $(this);


            if ($this.hasClass('animate')) {


                ScrollTrigger.create({
                    trigger: $this,
                    onEnter: () => {

                        $this.addClass('is_inview')

                    }
                })



            }




        })


    }

    function naylaImageCompare() {

        let imageCompare = $('.image-compare');


        imageCompare.each(function () {

            let $this = $(this),
                image1 = $this.find('.compare-image-1'),
                image2 = $this.find('.compare-image-2');

            gsap.to(image1, {
                clipPath: 'inset(0% 100% 0% 0%)',
                scrollTrigger: {
                    trigger: $this,
                    scrub: 1,
                    start: 'center center',
                    end: 'bottom+=1000 top',
                    pin: true

                }
            })



        })


    }

    function naylaLightbox() {

        let lightbox = $('.lightbox'),
            isSingle = true;

        lightbox.each(function () {

            let $this = $(this),
                imgSrc = $this.attr('src'),
                height = $this.outerHeight(),
                parent = $this.parent('div');
            parent.css('height', height)


            $this.on('click', () => {


                var clicks = $(this).data('clicks');
                if (clicks) {
                    enableScroll();
                } else {
                    $('body').append('<div class="lightbox-focus"></div>');
                    disableScroll()
                }

                $(this).data("clicks", !clicks);

                const state = Flip.getState($this, {
                    props: "transform"
                });

                $this.toggleClass('open');
                $('.lightbox-focus').toggleClass('open');

                let bac = Flip.from(state, {
                    duration: 1.25,
                    ease: "expo.inOut",
                    absolute: true,
                    absoluteOnLeave: true,
                    prune: true,
                    simple: true,
                    onComplete: () => {
                        $this.hasClass('open') ? $this.css('zIndex', 99999) : gsap.set($this, {
                            clearProps: 'all'
                        });

                        $this.hasClass('open') ? '' : $('.lightbox-focus').remove();


                    },

                });



            })


        })






    }

    function gridScroll() {


        let pinned = $('.pinned');

        pinned.each(function () {

            let $this = $(this),
                dataPin = $this.attr('data-pin'),
                height = $this.outerHeight();


            let pinnedScroll = ScrollTrigger.create({
                trigger: dataPin,
                pin: $this,
                pinSpacing: false,
                start: 'top top+=' + siteHeader.outerHeight() + '',
                end: 'bottom top+=' + (height + siteHeader.outerHeight()) + ''
            })

            matchMedia.add({
                isMobile: "(max-width: 450px)"

            }, (context) => {

                pinnedScroll.kill()

                return () => {

                }
            });



        })

    }

    function naylaSections() {

        var section = $('#content').find('.section'),
            page = $('body'),
            pageBg = $('#page').css('background-color'),
            pinned;

        function changeBg(section, color, leave) {

            gsap.to('#page', {
                backgroundColor: color,
                duration: .6,
                onComplete: () => {
                    if (leave) {
                        gsap.set('#page', {
                            clearProps: 'all'
                        })
                    }
                }
            });

            section.addClass('active')

            if ((siteHeader.hasClass('fixed')) && (!siteHeader.hasClass('blend'))) {

                headerLayoutChange(false, color, true, false);
                leave ? headerLayoutChange(false, false, true, true) : '';
            }

            cursorLayoutChange(false, color, false)

            leave ? cursorLayoutChange(false, false, true) : '';
            leave ? section.removeClass('active') : '';
        }

        section.each(function () {

            let $this = $(this),
                bgColor = $this.css('background-color'),
                bg = $this.find('.section-background'),
                sectionLayout,
                pinnedBg;

            $this.hasClass('light') ? sectionLayout = 'light' : '';
            $this.hasClass('dark') ? sectionLayout = 'dark' : '';

            // Cursor change

            $(window).on('scroll', function (e) {

                let topPos = $this.offset().top - $(window).scrollTop(),
                    height = $this.outerHeight(),
                    deadLine = topPos + height;


                if ((topPos < cursorY) && (cursorY < deadLine)) {

                    if (!$this.hasClass('anim-bg')) {

                        if (($this.css('background-color') === 'rgba(0, 0, 0, 0)') && (sectionLayout != null)) {

                            cursorLayoutChange(sectionLayout, false, false)

                        } else if (($this.css('background-color') !== 'rgba(0, 0, 0, 0)')) {

                            cursorLayoutChange(false, bgColor, false)
                        }

                    }

                } else if (cursorY > deadLine) {

                    $('.section.active').length ? '' : cursorLayoutChange(false, false, true);

                }
            })


            if (!$this.hasClass('anim-bg')) {

                $this.on('mouseenter', function () {

                    if (($this.css('background-color') === 'rgba(0, 0, 0, 0)') && (sectionLayout != null)) {

                        cursorLayoutChange(sectionLayout, false, false)

                    } else if (($this.css('background-color') !== 'rgba(0, 0, 0, 0)')) {

                        cursorLayoutChange(false, bgColor, false)
                    }

                })

                $this.on('mouseleave', function () {

                    $('.section.active').length ? '' : cursorLayoutChange(false, false, true);

                })

            }

            // Cursor change

            // Background Animations
            if ($this.hasClass('anim-bg')) {

                $this.css('background', 'transparent');

                ScrollTrigger.create({
                    trigger: $this,
                    start: 'top center',
                    end: 'bottom center',
                    onEnter: () => changeBg($this, bgColor, false),
                    onEnterBack: () => changeBg($this, bgColor, false),
                    onLeave: () => changeBg($this, pageBg, true),
                    onLeaveBack: () => changeBg($this, pageBg, true)
                });

            } else {

                if (siteHeader.hasClass('sticky') || siteHeader.hasClass('fixed')) {

                    if (($this.css('background-color') === 'rgba(0, 0, 0, 0)') && (sectionLayout != null)) {

                        ScrollTrigger.create({
                            trigger: $this,
                            start: 'top top+=50',
                            end: 'bottom top+=50',
                            onEnter: () => headerLayoutChange(sectionLayout, false, false, false),
                            onEnterBack: () => headerLayoutChange(sectionLayout, false, false, false),
                            onLeave: () => headerLayoutChange(false, false, false, true),
                            onLeave: () => headerLayoutChange(false, false, false, true),
                            onLeaveBack: () => headerLayoutChange(false, false, false, true)
                        });


                    } else if (($this.css('background-color') !== 'rgba(0, 0, 0, 0)') && ($this.offset().top > 0)) {


                        // If background not alpha
                        ScrollTrigger.create({
                            trigger: $this,
                            start: 'top top+=75',
                            end: 'bottom top+=75',
                            onEnter: () => headerLayoutChange(false, bgColor, false, false),
                            onEnterBack: () => headerLayoutChange(false, bgColor, false, false),
                            onLeave: () => headerLayoutChange(false, false, false, true),
                            onLeaveBack: () => headerLayoutChange(false, false, false, true)
                        });

                    }
                }
            }
            // Background Animations

            if (bg.hasClass('fixed-bg')) {

                ScrollTrigger.create({
                    trigger: $this,
                    pin: bg,
                    start: 'top top',
                    end: 'bottom bottom',
                    pinSpacing: false,

                });



            }

        })


    }

    function circleMaskBg() {

        $('.circle-mask-background').each(function () {

            let $this = $(this),
                img = $this.children('img'),
                url = img.attr('src');

            img.remove();

            $this.append('<svg class="mask-bg" width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ><defs><filter id="displacementFilter"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" /></filter><mask id="circleMask"><circle cx="50%" cy="50%" r="00" fill="white" class="mask" style="filter: url(#displacementFilter);" /></mask></defs><image xlink:href="' + url + '" x=0 y=0 width="100%" mask="url(#circleMask)" /></svg>');

            let circle = $this.find('#circleMask > circle');

            $(window).on('mousemove', function (e) {

                let top = e.clientY / ($this.outerHeight() / 100),
                    left = e.clientX / ($this.outerWidth() / 100);

                gsap.to(circle, {
                    cx: left,
                    cy: top,

                })
            })

            gsap.to(circle, {
                r: 350,
                scrollTrigger: {
                    trigger: $this,

                }
            })

        })

    }



    function naylaVideo(vid) {


        var video = $(vid),
            mouseCursor = $('#mouseCursor');

        if ((video.length) && (!video.hasClass('vid-ready'))) {

            video.each(function (i) {

                i++
                let $this = $(this),
                    video = $this.find('.n-video'),
                    playText = $this.data('play-text'),
                    pauseText = $this.data('pause-text'),
                    muteText = $this.data('mute-text'),
                    unmuteText = $this.data('unmute-text'),
                    nautoplay = $this.data('autoplay'),
                    nmuted = $this.data('muted'),
                    nloop = $this.data('loop'),
                    play = $this.data('play'),
                    controls;


                $this.data('controls') != false ? controls = $this.data('controls').split(" ") : '';


                playText == null ? playText = 'Play' : '';
                pauseText == null ? pauseText = 'Pause' : '';
                muteText == null ? muteText = 'Mute' : '';
                unmuteText == null ? unmuteText = 'Unmute' : '';


                const naylaVid = new Plyr(video, {
                    controls: controls,
                    clickToPlay: true,
                    autopause: false,
                    debug: false,
                    fullscreen: false,
                    storage: {
                        enabled: false
                    },
                    youtube: {
                        modestbranding: 1,
                        controls: 0,
                        rel: 0,
                        cc_load_policy: 0,
                        iv_load_policy: 3,
                        noCookie: true,
                        frameborder: 0,
                    },
                    vimeo: {
                        autopause: false,
                        controls: false,
                    }

                });

                if (!$this.hasClass('n-self')) {
                    naylaVid.autoplay = nautoplay
                    naylaVid.muted = nmuted
                    naylaVid.loop = nloop
                }



                naylaVid.on('ready', (event) => {

                    if ($this.find('video').attr('autoplay')) {

                        naylaVid.play()
                    }

                    $this.addClass('vid-ready');


                    $this.find('.plyr').addClass('nayla_video_' + i);
                    $this.addClass('nayla-fake-running');

                    let vid = $('.nayla_video_' + i);



                    vid.find('.plyr__video-wrapper').addClass('nayla-video-wrap');
                    vid.find('.plyr__controls').addClass('nayla-controls-wrap');

                    vid.find('.plyr__control[data-plyr="play"]').append('<span class="hover-default nayla-player-control nayla-play">' + playText + '</span><span class="hover-default nayla-player-control nayla-pause">' + pauseText + '</span>')

                    vid.find('.plyr__controls__item.plyr__volume button[data-plyr="mute"]').append('<span class="hover-default nayla-player-control nayla-mute">' + muteText + '</span><span class="hover-default nayla-player-control nayla-unmute">' + unmuteText + '</span>');

                    if ($this.hasClass('play-inner')) {

                        $this.find('.nayla-play-button').on('click', function () {


                            if ($this.hasClass('lightbox-play')) {

                                lightboxPlay();

                            } else {

                                naylaVid.muted = false;
                                naylaVid.restart();
                                naylaVid.play();
                                $this.addClass('nayla-running');
                                $this.removeClass('nayla-fake-running');

                            }


                        })
                    }

                    if ($this.hasClass('play-cursor')) {

                        $this.on('click', function () {

                            if ($this.hasClass('lightbox-play')) {

                                $this.removeClass('cursor-icon');
                                $this.removeClass('cursor-text');

                                mouseCursor.removeClass('hover-size')
                                mouseCursor.removeClass('hover-text')
                                mouseCursor.removeClass('hover-icon')
                                lightboxPlay();

                            } else {

                                if ($this.hasClass('nayla-fake-running')) {
                                    $this.removeClass('cursor-icon');
                                    $this.removeClass('cursor-text');

                                    mouseCursor.removeClass('hover-size')
                                    mouseCursor.removeClass('hover-text')
                                    mouseCursor.removeClass('hover-icon')

                                    naylaVid.muted = false;
                                    naylaVid.restart();
                                    naylaVid.play();
                                    $this.addClass('nayla-running');
                                    $this.removeClass('nayla-fake-running');
                                }
                            }


                        })

                        $this.on('mouseenter', function () {
                            if ($this.hasClass('nayla-running')) {

                                mouseCursor.removeClass('hover-size')
                                mouseCursor.removeClass('hover-text')
                                mouseCursor.removeClass('hover-icon')
                            }
                        })


                    }

                    function lightboxPlay() {


                        naylaVid.fullscreen = false

                        vid.append('<span class="lightbox-close">Close</span>')
                        vid.addClass('nlv').prependTo('#page');

                        $('.nlv').addClass('lightbox-open');

                        gsap.to('.nlv', {
                            opacity: 1,
                            duration: .3
                        })

                        vid.find('.plyr__video-wrapper').addClass('nayla-video-wrap');
                        vid.find('.plyr__controls').addClass('nayla-controls-wrap');

                        vid.addClass('lightbox-open');
                        naylaVid.muted = false;
                        naylaVid.restart();
                        naylaVid.play();

                        $this.addClass('nayla-running');
                        $this.removeClass('nayla-fake-running');

                        if ($this.hasClass('ratio-adjusted')) {

                            let $iframe = $('.nlv').find('.nayla-video-wrap');

                            gsap.set($iframe, {
                                clearProps: 'all'
                            });

                            gsap.set($('.nlv').find('.plyr__video-embed__container'), {
                                clearProps: 'all'
                            })

                        }



                        $('.lightbox-close').on('click', function () {

                            gsap.to('.nlv', {
                                opacity: 0,
                                duration: .3,
                                onComplete: () => {

                                    gsap.set(vid, {

                                        opacity: 1
                                    })

                                    vid.off('click');

                                    vid.removeClass('nlv lightbox-open');

                                    vid.find('.plyr__video-wrapper').removeClass('nayla-video-wrap');
                                    vid.find('.plyr__controls').removeClass('nayla-controls-wrap');

                                    naylaVid.muted = true;

                                    vid.prependTo($this);

                                    $this.removeClass('nayla-running');
                                    $this.addClass('nayla-fake-running');

                                }
                            })

                            if ($this.hasClass('ratio-adjusted')) {

                                let parent = $this.parent('div');

                                const targetHeight = parent.outerHeight(),
                                    parentWidth = parent.outerWidth(),
                                    parentHeight = parent.outerHeight();


                                $this.attr('ratio', naylaVid.ratio);

                                let rat = naylaVid.ratio.split(':')[0] / naylaVid.ratio.split(':')[1],
                                    parentRatio = parentWidth / parentHeight;

                                if (parentRatio < rat) {

                                    $this.addClass('ratio-adjusted');

                                    function adjustIframeSize() {

                                        const aspectRatio = rat;
                                        const $iframe = $this.find('.nayla-video-wrap');

                                        const targetWidth = targetHeight * aspectRatio;

                                        gsap.set($iframe, {
                                            width: targetWidth + 10,
                                            height: targetHeight + 10,
                                            x: -1 * (targetWidth - parentWidth) / 2
                                        })

                                        gsap.set($this.find('.plyr__video-embed__container'), {
                                            paddingBottom: 0,
                                            y: 0,
                                            yPercent: 0
                                        })

                                    }

                                    adjustIframeSize();

                                }


                            }


                        })


                    }

                    if ($this.hasClass('play-on-hover')) {

                        naylaVid.pause();

                        $this.on('mouseenter', () => {

                            naylaVid.play();
                        })

                        $this.on('mouseleave', () => {

                            naylaVid.pause();
                        })

                    }


                    if (naylaVid.autoplay == true) {

                        naylaVid.play();
                    }

                });

                if ($this.parents('.has-anim').length && $this.parents('.project-page').length) {

                    setTimeout(function () {

                        let anim = gsap.getTweensOf($this.parents('.has-anim'));

                        anim[0].parent.pause()
                        anim[0].parent.scrollTrigger !== null ? anim[0].parent.scrollTrigger.kill() : '';

                        naylaVid.once('playing', (event) => {
                            anim[0].parent.play();

                        });

                    }, 2)

                }


                naylaVid.once('playing', (event) => {


                    if (naylaVid.isEmbed) {

                        let parent = $this.parent('div');

                        const targetHeight = parent.outerHeight(),
                            parentWidth = parent.outerWidth(),
                            parentHeight = parent.outerHeight();


                        $this.attr('ratio', naylaVid.ratio);

                        let rat = naylaVid.ratio.split(':')[0] / naylaVid.ratio.split(':')[1],
                            parentRatio = parentWidth / parentHeight;

                        if (parentRatio < rat) {

                            $this.addClass('ratio-adjusted');

                            function adjustIframeSize() {

                                const aspectRatio = rat;
                                const $iframe = $this.find('.nayla-video-wrap');

                                const targetWidth = targetHeight * aspectRatio;

                                gsap.set($iframe, {
                                    width: targetWidth + 10,
                                    height: targetHeight + 10,
                                    x: -1 * (targetWidth - parentWidth) / 2
                                })

                                gsap.set($this.find('.plyr__video-embed__container'), {
                                    paddingBottom: 0,
                                    y: 0,
                                    yPercent: 0
                                })

                            }

                            adjustIframeSize();

                        }

                    }

                });


            })

        }

    }

    function naylaHeading() {


        let heading = $('.nayla-heading');

        heading.each(function () {

            let heading = $(this),
                text = heading.children('*'),
                icon = heading.data('icon');

            text.attr('data-icon', icon)



        })


    }

    function naylaCircleText() {

        let circularText = $(".nayla-circular-text");
        circularText.each(function (i) {

            let $this = $(this);

            $this.wrapInner("<div class='circular-text-wrap'></div>")
            let textWrap = $this.find('.circular-text-wrap');

            textWrap.wrapInner("<div class='circular-text-content'></div>")

            let circularContent = $this.find(".circular-text-content"),
                dataHeight = $this.data("height"),
                dataDuration = $this.data("duration"),
                dataTarget = $this.data('target'),
                circleSplit = new SplitText($this.find('.circle-text'), {
                    type: "words, chars",
                    charsClass: "circle-char",
                    wordsClass: "circle-word",
                    position: "absolute"
                }),
                fontSize = parseInt($this.find('.circle-char').css('font-size')),
                charLenght = $this.find('.circle-char').length,
                textLenght = (dataHeight / charLenght) / (fontSize / 1.75),
                circleChar = $this.find('.circle-char'),
                circleWord = $this.find('.circle-word'),
                snap = gsap.utils.snap(1),
                dataSeperator = $this.data('seperator'),
                dataIcon = $this.data('icon');


            if (dataIcon) {

                $this.append("<div class='circular-text-icon'><span class='material-icons'>" + dataIcon + "</span></div>")

            }

            if (dataSeperator) {
                circularContent.append('<h3 class="circle-seperator"></h3>')

                let seperator = $this.find('.circle-seperator');
                seperator.css('line-height', circleChar.css('line-height'))
                seperator.wrapInner('<span class="material-icons">' + dataSeperator + '</span>')

                seperator = $this.find('.circle-seperator'),
                    seperator.wrapInner("<div class='circle-char'></div>")
                seperator.addClass('circle-word')

            }

            for (i = 2; i <= snap(textLenght); i++) {
                circularContent.clone().appendTo(textWrap)
            }

            gsap.set($this.find(".circular-text-content"), {
                width: dataHeight,
                height: dataHeight
            })
            $this.find('.circle-word').append("<span class='circle-char'></span>")

            $this.find('.circle-word').each(function (i) {
                let $this = $(this)
                gsap.set($this, {
                    left: '50%',
                    top: 0,
                    height: "100%",
                    xPercent: -50
                })
            })
            let char = $this.find('.circle-char'),
                circleText = $this.find('.circle-text');
            char.each(function (i) {
                i++;
                let $this = $(this),
                    rotateMultiplier = 360 / (char.length);
                gsap.set($this, {
                    rotate: rotateMultiplier * i,
                    left: '50%',
                    xPercent: -50,
                    top: 0,
                    height: "50%"
                })
            })
            gsap.set(textWrap, {
                width: dataHeight,
                height: dataHeight
            })
            let tl = gsap.timeline()
            if ($this.hasClass('counter-clockwise')) {
                tl.to(textWrap, {
                    rotate: -360,
                    duration: dataDuration,
                    ease: "none",
                    repeat: -1
                })
            } else {
                tl.to(textWrap, {
                    rotate: 360,
                    duration: dataDuration,
                    ease: "none",
                    repeat: -1
                })
            }

            let whaler = Hamster(document.querySelector('body')),
                wheelDeltaY, currentDeltaY;

            function createWheelStopListener(element, callback, timeout) {
                var handle = null;
                var onScroll = function () {
                    if (handle) {
                        clearTimeout(handle);
                    }
                    handle = setTimeout(callback, timeout || 200); // default 200 ms
                };
                element.addEventListener('wheel', onScroll);
                return function () {
                    element.removeEventListener('wheel', onScroll);
                };
            }

            whaler.wheel(function (event, delta, deltaX, deltaY) {

                wheelDeltaY = event.deltaY;

                event.deltaY < 0 ? wheelDeltaY = -1 * event.deltaY : '';

                tl.timeScale(1 + (wheelDeltaY * 2))

            });

            createWheelStopListener(window, function () {

                tl.timeScale(1)

            });

            if (dataTarget) {

                $this.on('click', function () {
                    gsap.to(window, {
                        scrollTo: dataTarget,
                        ease: "power3.out",
                        duration: 3
                    })
                })

            }

        })
    }

    function naylaButtons() {

        var button = $('.nayla-button');

        button.each(function () {

            let button = $(this),
                $this = $(this).children('a'),
                icon = $this.find('.button-icon'),
                tl = gsap.timeline({
                    paused: true
                }),
                line,
                animation = $this.data('animation'),
                stagger = $this.data('stagger'),
                duration = $this.data('duration');

            if (animation) {

                $this.wrapInner('<span class="button-anim-holder has-anim-text ' + animation + '"></span>')

                $this.find('.button-anim-holder').attr('data-duration', duration)
                $this.find('.button-anim-holder').attr('data-stagger', stagger)

                $this.addClass('detect-pov')

                new naylaTextAnimation($this.find('.button-anim-holder'))

            }


            button.hasClass('underline') ? $this.append('<span class="button-line"></span>') : '';

        })



    }

    function naylaMarquee(i) {

        var velocity;
        let marquee = $('.nayla-marquee');


        marquee.each(function () {
            let $this = $(this),
                text = $this.children('*'),
                dataDuration = $this.data('duration'),
                seperator = $this.data('seperator');

            text.append('<span class="material-icons">' + seperator + '</span>')
            $this.wrapInner('<div class="marquee-wrap"></div>')

            let infItem = $this.find('.marquee-wrap'),
                infWidht = infItem.outerWidth(),
                infLenght = window.innerWidth / infWidht,
                gap = infItem.offset().left;




            function infinityOnResize() {
                for (i = 2; i < infLenght + 2; i++) {
                    infItem.clone().appendTo($this)
                }
                let infItemLenght = $this.find('.maruqee-wrap').length
                let parse = parseInt(infWidht)
                gsap.set(infItem, {
                    width: parse
                })

                gsap.set($this, {
                    width: infItemLenght * $this.find('.marquee-wrap').outerWidth(true),
                    display: 'flex'
                })
                let tl = gsap.timeline({
                    repeat: -1
                })
                if ($this.hasClass('left-to-right')) {
                    tl.fromTo($this, {
                        x: -1 * (parse + gap)
                    }, {
                        x: -1 * gap,
                        ease: 'none',
                        duration: parse / 1000 * dataDuration
                    })
                } else {
                    tl.fromTo($this, {
                        x: -1 * gap
                    }, {
                        x: -1 * (parse + gap),
                        ease: 'none',
                        duration: parse / 1000 * dataDuration
                    })
                }

                let whaler = Hamster(document.querySelector('body')),
                    wheelDeltaY, currentDeltaY;

                function createWheelStopListener(element, callback, timeout) {
                    var handle = null;
                    var onScroll = function () {
                        if (handle) {
                            clearTimeout(handle);
                        }
                        handle = setTimeout(callback, timeout || 200); // default 200 ms
                    };
                    element.addEventListener('wheel', onScroll);
                    return function () {
                        element.removeEventListener('wheel', onScroll);
                    };
                }

                whaler.wheel(function (event, delta, deltaX, deltaY) {

                    wheelDeltaY = event.deltaY;

                    event.deltaY < 0 ? wheelDeltaY = -1 * event.deltaY : '';

                    tl.timeScale(1 + (wheelDeltaY * 2))

                });

                createWheelStopListener(window, function () {

                    tl.timeScale(1)

                });
            }



            infinityOnResize();


            window.onresize = function () {
                $this.find('.nayla-marquee:first-child').nextAll().remove()
                let infItem = $this.find('.infinity-item'),
                    infWidht = infItem.outerWidth(),
                    infLenght = window.innerWidth / infWidht;
                infinityOnResize();
            }
        })



    }

    function naylaServices() {
        let naylaServices = $('.nayla-services');

        naylaServices.each(function () {

            let services = $(this),
                servicesItem = services.find('.nayla-service');

            servicesItem.append("<span class='services-item-bottom-line nayla-service-line'></span>")

            servicesItem.each(function (i) {

                i++;

                var $this = $(this),
                    titleWrap = $this.find(".service-title-wrap"),
                    contentWrap = $this.find(".service-content-wrap"),
                    titleHeight = titleWrap.outerHeight(),
                    calcEnd = siteHeader.hasClass('sticky') || siteHeader.hasClass('fixed') ? siteHeader.outerHeight() + 50 : 50,
                    start = siteHeader.hasClass('sticky') || siteHeader.hasClass('fixed') ? siteHeader.outerHeight() : 50;

                let index = i < 10 ? '0' + i : i;
                services.hasClass('ordered') ? titleWrap.attr('data-index', "(" + index + ")") : '';

                let mobileQuery = window.matchMedia('(max-width: 1112px)');

                if (services.hasClass('pin-titles')) {

                    if (mobileQuery.matches) {

                        ScrollTrigger.create({
                            trigger: $this,
                            pin: titleWrap,
                            start: "top top",
                            end: "bottom-=" + servicesItem.outerHeight(true) + "top",
                            pinSpacing: false
                        })

                    } else {

                        ScrollTrigger.create({
                            pin: titleWrap,
                            trigger: contentWrap,
                            start: 'top top+=' + start + '',
                            end: 'bottom top+=' + (titleHeight + 50) + ''

                        })
                    }
                }


            })
        })
    }

    function naylaAccordion() {
        let naylaAccordion = $('.nayla-accordion');

        naylaAccordion.each(function () {
            let $this = $(this),
                acrdTitle = $this.find('.accordion-title'),
                acrdContent = $this.find('.accordion-content'),
                activeContent = $this.find('.active > .accordion-content'),
                icon = $this.data('toggle-icon'),
                animation = $this.data('animation');

            if (animation) {

                acrdTitle.wrapInner('<span></span>')

                acrdTitle.addClass('detect-pov')
                acrdTitle.children('span').addClass('has-anim-text')
                acrdTitle.children('span').addClass(animation)

                new naylaTextAnimation(acrdTitle.children('span'))
            }

            acrdTitle.append('<span class="material-icons accordion-toggle">' + icon + '</span>')


            acrdContent.wrapInner("<div class='accordion-content-wrap'></div>")

            $this.find('.accordion-content-wrap').each(function () {
                $(this).css('height', $(this).outerHeight(true))
            })

            $this.find('.accordion-wrap').children().each(function (i) {
                i++;
                if (i < 10) {
                    $(this).attr('data-index', '0' + i)
                } else {
                    $(this).attr('data-index', i)
                }
            })

            acrdContent.css('height', 0)
            activeContent.css('height', activeContent.children().outerHeight(true))

            acrdTitle.on('click', function () {

                let acrdItem = $(this).parent()
                gsap.to(acrdContent, {
                    height: 0,
                    duration: .5,

                })

                if (acrdItem.hasClass('active')) {
                    acrdItem.removeClass('active')

                } else {

                    acrdTitle.parent().removeClass('active')
                    $(this).parent().addClass('active')
                    gsap.to($(this).next(), {
                        height: $(this).next().children().outerHeight(true),

                        onUpdate: () => {
                            ScrollTrigger.update()
                        }
                    })
                    //
                    //                    gsap.to(window, {
                    //                        scrollTo: $('li.active').offset().top - 200,
                    //                        delay: dataDuration,
                    //
                    //                    })
                }
            })
        })
    }

    function naylaClinetsCarousel() {

        let clientCarousel = $('.nayla-clients-carousel');

        clientCarousel.each(function () {

            let $this = $(this),
                clientWrap = $this.find('.clients-wrapper'),
                clientFullWidth = clientWrap.outerWidth(),
                dataDuration = $this.data('duration'),
                windowWidth = window.innerWidth,
                tl = gsap.timeline();

            if (clientFullWidth < windowWidth) {

                let i = 0,
                    clientLenght = Math.ceil(windowWidth * 2 / clientFullWidth);

                for (i = 1; i <= clientLenght; i++) {

                    clientWrap.clone().appendTo($this)
                }

                $this.css('width', (clientLenght + 1) * clientFullWidth)

            } else {

                clientWrap.clone().appendTo($this)
                $this.css('width', (clientFullWidth * 2))

            }

            function dragMove() {
                var x = parseInt($this.css('transform').split(',')[4]),
                    speed = clientFullWidth / dataDuration


                if ($this.hasClass('left-to-right')) {
                    gsap.fromTo($this, {
                        x: x
                    }, {
                        x: 0,
                        duration: (-1 * x) / speed,
                        ease: 'none',
                        onComplete: () => {
                            gsap.set($this, {
                                x: 0
                            })

                            tl.fromTo($this, {
                                x: -1 * clientFullWidth
                            }, {
                                x: 0,
                                duration: dataDuration,
                                ease: 'none',
                                repeat: -1
                            })
                        }
                    })

                } else {
                    gsap.fromTo($this, {
                        x: x
                    }, {
                        x: -1 * clientFullWidth,
                        ease: 'none',
                        duration: (clientFullWidth - (-1 * x)) / speed,
                        onComplete: () => {
                            gsap.set($this, {
                                x: 0
                            })
                            tl.to($this, {
                                x: -1 * clientFullWidth,
                                duration: dataDuration,
                                ease: 'none',
                                repeat: -1
                            })
                        }
                    })
                }

            }

            if ($this.hasClass('left-to-right')) {
                tl.fromTo($this, {
                    x: -1 * clientFullWidth
                }, {
                    x: 0,
                    duration: dataDuration,
                    ease: 'none',
                    repeat: -1,
                })
            } else {
                tl.to($this, {
                    x: -1 * clientFullWidth,
                    duration: dataDuration,
                    ease: 'none',
                    repeat: -1
                })
            }
            Draggable.create($this, {
                type: 'x',
                edgeResistance: 0.4,
                onDrag: (self) => {
                    var x = parseInt($this.css('transform').split(',')[4]);
                    if ($this.hasClass('left-to-right')) {
                        if (x > 0) {
                            gsap.set($this, {
                                x: (-1 * clientFullWidth) + x
                            })
                        } else if (x < -1 * clientFullWidth) {
                            gsap.set($this, {
                                x: x + (clientFullWidth)
                            })
                        }
                    } else {
                        if (-1 * x > clientFullWidth) {
                            gsap.set($this, {
                                x: x + clientFullWidth
                            })
                        } else if (x > 0) {
                            gsap.set($this, {
                                x: (-1 * clientFullWidth) + x
                            })
                        }
                    }
                },
                onUpdate: () => {
                    if (x > 0) {
                        gsap.set($this, {
                            x: (-1 * clientFullWidth) + x
                        })
                    } else if (x < -1 * clientFullWidth) {
                        gsap.set($this, {
                            x: x + (clientFullWidth)
                        })
                    }
                },
                onDragEnd: () => {
                    dragMove();
                }
            })
            $this.on('click', function () {
                dragMove()
            })
        })
    }

    function naylaInfiniteCarousel() {

        let clientCarousel = $('.nayla-infinite-carousel');

        clientCarousel.each(function () {

            let $this = $(this),
                clientWrap = $this.find('.carousel--wrapper'),
                clientFullWidth = clientWrap.outerWidth(),
                dataDuration = $this.data('duration'),
                windowWidth = window.innerWidth,
                tl = gsap.timeline();

            if (clientFullWidth < windowWidth) {

                let i = 0,
                    clientLenght = Math.ceil(windowWidth * 2 / clientFullWidth);

                for (i = 1; i <= clientLenght; i++) {

                    clientWrap.clone().appendTo($this)
                }

                $this.css('width', (clientLenght + 1) * clientFullWidth)

            } else {

                clientWrap.clone().appendTo($this)
                $this.css('width', (clientFullWidth * 2))

            }

            function dragMove() {
                var x = parseInt($this.css('transform').split(',')[4]),
                    speed = clientFullWidth / dataDuration


                if ($this.hasClass('left-to-right')) {
                    gsap.fromTo($this, {
                        x: x
                    }, {
                        x: 0,
                        duration: (-1 * x) / speed,
                        ease: 'none',
                        onComplete: () => {
                            gsap.set($this, {
                                x: 0
                            })

                            tl.fromTo($this, {
                                x: -1 * clientFullWidth
                            }, {
                                x: 0,
                                duration: dataDuration,
                                ease: 'none',
                                repeat: -1
                            })
                        }
                    })

                } else {
                    gsap.fromTo($this, {
                        x: x
                    }, {
                        x: -1 * clientFullWidth,
                        ease: 'none',
                        duration: (clientFullWidth - (-1 * x)) / speed,
                        onComplete: () => {
                            gsap.set($this, {
                                x: 0
                            })
                            tl.to($this, {
                                x: -1 * clientFullWidth,
                                duration: dataDuration,
                                ease: 'none',
                                repeat: -1
                            })
                        }
                    })
                }

            }

            if ($this.hasClass('left-to-right')) {
                tl.fromTo($this, {
                    x: -1 * clientFullWidth
                }, {
                    x: 0,
                    duration: dataDuration,
                    ease: 'none',
                    repeat: -1,
                })
            } else {
                tl.to($this, {
                    x: -1 * clientFullWidth,
                    duration: dataDuration,
                    ease: 'none',
                    repeat: -1
                })
            }
            Draggable.create($this, {
                type: 'x',
                edgeResistance: 0.4,
                onDrag: (self) => {
                    var x = parseInt($this.css('transform').split(',')[4]);
                    if ($this.hasClass('left-to-right')) {
                        if (x > 0) {
                            gsap.set($this, {
                                x: (-1 * clientFullWidth) + x
                            })
                        } else if (x < -1 * clientFullWidth) {
                            gsap.set($this, {
                                x: x + (clientFullWidth)
                            })
                        }
                    } else {
                        if (-1 * x > clientFullWidth) {
                            gsap.set($this, {
                                x: x + clientFullWidth
                            })
                        } else if (x > 0) {
                            gsap.set($this, {
                                x: (-1 * clientFullWidth) + x
                            })
                        }
                    }
                },
                onUpdate: () => {
                    if (x > 0) {
                        gsap.set($this, {
                            x: (-1 * clientFullWidth) + x
                        })
                    } else if (x < -1 * clientFullWidth) {
                        gsap.set($this, {
                            x: x + (clientFullWidth)
                        })
                    }
                },
                onDragEnd: () => {
                    dragMove();
                }
            })
            $this.on('click', function () {
                dragMove()
            })
        })
    }

    function naylaTestimonials() {

        let testimonials = $('.nayla-testimonials');

        testimonials.each(function () {

            let testimonials = $(this),
                wrap = testimonials.find('.testimonials-wrapper'),
                single = wrap.find('.testimonial'),
                nav = testimonials.find('.testimonials-nav'),
                avatars = single.find('.testimonial-avatar'),
                prev = testimonials.find('.test-prev'),
                next = testimonials.find('.test-next'),
                current = testimonials.find('.test_current'),
                total = testimonials.find('.test_total');

            current.html('01')
            total.html(single.length > 10 ? single.length : '0' + single.length)

            avatars.append('<svg height="100%" width="100%" viewbox="0 0 100 100"><circle cx="50" cy="50" r="40" /></svg>')

            wrap.css('height', single.first().outerHeight());
            single.first().addClass('active');


            let tl = gsap.timeline({
                repeat: -1
            });

            single.each(function (i) {

                let $this = $(this),
                    circle = $this.find('svg circle');

                $this.addClass('testimonial_' + i)

                $this.attr('data-index', i);

                tl.to($this, {
                    opacity: 0,
                    duration: 0.5,
                    delay: 5,
                    onComplete: () => {
                        $this.removeClass('active');
                        $this.next().addClass('active');
                    }
                }, 'label' + i)

                tl.from(circle, 5, {
                    duration: 2,
                    drawSVG: 0,
                    onComplete: () => {
                        gsap.set(circle, {
                            drawSVG: 0
                        })
                    }
                }, 'label' + i);

                if ($this.next().length) {

                    tl.to($this.next(), {
                        opacity: 1,
                        duration: 0.5,
                        delay: 6,
                        onStart: () => {
                            current.html($this.next().data('index') + 1 > 10 ? $this.next().data('index') + 1 : '0' + ($this.next().data('index') + 1))
                        }
                    }, 'label' + i)

                    tl.to(wrap, {
                        height: $this.next().outerHeight(),
                        duration: 0.5,
                        delay: 5.9,
                    }, 'label' + i)

                } else {


                    tl.to($('.testimonial_0'), {
                        opacity: 1,
                        duration: 0.5,
                        delay: 6,
                        onStart: () => {
                            current.html('01')
                        }
                    }, 'label' + i)


                }

            })



            nav.on('mouseenter', () => {
                tl.pause()
            })

            nav.on('mouseleave', () => {
                tl.resume()
            })


            let clicksForward = 0,
                clicksBackward = single.length;

            next.on('click', () => {

                clicksForward++

                if (clicksForward >= single.length) {
                    clicksForward = -1
                    clicksForward++
                }

                gsap.to(wrap, {
                    opacity: 0,
                    onComplete: () => {
                        let tlSeek = 'label' + clicksForward;
                        tl.seek(tlSeek)

                        gsap.to(wrap, {
                            opacity: 1
                        })

                    }
                })

            })

            prev.on('click', () => {

                clicksBackward--

                if (clicksBackward < 0) {

                    clicksBackward = single.length - 1
                    clicksBackward--
                }




                gsap.to(wrap, {
                    opacity: 0,
                    onComplete: () => {
                        let tlSeek = 'label' + clicksBackward;
                        tl.seek(tlSeek)

                        gsap.to(wrap, {
                            opacity: 1
                        })

                    }
                })

            })


        })



    }

    const noise = () => {
        let canvas, ctx;

        let wWidth, wHeight;

        let noiseData = [];
        let frame = 0;

        let loopTimeout;


        // Create Noise
        const createNoise = () => {
            const idata = ctx.createImageData(wWidth, wHeight);
            const buffer32 = new Uint32Array(idata.data.buffer);
            const len = buffer32.length;

            for (let i = 0; i < len; i++) {
                if (Math.random() < 0.5) {
                    buffer32[i] = 0xff000000;
                }
            }

            noiseData.push(idata);
        };


        // Play Noise
        const paintNoise = () => {
            if (frame === 9) {
                frame = 0;
            } else {
                frame++;
            }

            ctx.putImageData(noiseData[frame], 0, 0);
        };


        // Loop
        const loop = () => {
            paintNoise(frame);

            loopTimeout = window.setTimeout(() => {
                window.requestAnimationFrame(loop);
            }, (1000 / 25));
        };


        // Setup
        const setup = () => {
            wWidth = window.innerWidth;
            wHeight = window.innerHeight;

            canvas.width = wWidth;
            canvas.height = wHeight;

            for (let i = 0; i < 10; i++) {
                createNoise();
            }

            loop();
        };


        // Reset
        let resizeThrottle;
        const reset = () => {
            window.addEventListener('resize', () => {
                window.clearTimeout(resizeThrottle);

                resizeThrottle = window.setTimeout(() => {
                    window.clearTimeout(loopTimeout);
                    setup();
                }, 200);
            }, false);
        };


        // Init
        const init = (() => {
            canvas = document.getElementById('noised-bg');
            ctx = canvas.getContext('2d');

            setup();
        })();
    };

    $('#noised-bg').length ? noise() : '';



    function naylaScrollButtons() {

        let button = $('.nayla-scroll-button')

        button.each(function () {

            let $this = $(this),
                target = $this.data('scroll-to');

            $this.attr('href', '');

            $this.on('click', () => {

                disableScroll();

                setTimeout(function () {

                    enableScroll();

                    gsap.to(window, {
                        duration: 1,
                        scrollTo: isNaN(target) ? $(target).offset().top - 25 : target,
                        ease: 'expo.inOut',
                        onComplete: () => {

                        }
                    });

                }, 100)


            })


        })

    }

    function naylaNumberCounter() {

        let numberCt = $('.nayla-number-counter');

        numberCt.each(function () {

            let $this = $(this),
                ctNumberSplit = new SplitText($this.find('.ct-number'), {
                    type: 'words, chars',
                    charsClass: 'ct-number-char',
                    wordsClass: 'ct-number-word'
                }),
                ctChar = $this.find('.ct-number-char'),
                ctWord = $this.find('.ct-number-word'),
                dataCount = $this.data('count'),
                ctStart = $this.find('.count-start'),
                ctEnd = $this.find('.count-end');



            ctChar.each(function () {

                let $this = $(this);

                $this.wrapInner("<div class='value-loop-char'></div>")
                let valueLoop = $this.find('.value-loop-char'),
                    valueChar = parseInt($this.text()),
                    i = 0;

                for (i = valueChar + 1; i < valueChar + dataCount; i++) {
                    $this.prepend("<div class='value-loop-char'>" + i + "</div>")
                }

                gsap.set($this.find('.value-loop-char'), {
                    yPercent: '100'
                })

                $this.find('.value-loop-char').each(function () {
                    let $this = $(this),
                        valueNo = $this.text();

                    if (valueNo > 9) {
                        $this.html(parseInt(valueNo) - 10)
                    }
                })
            })

            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: $this,
                    start: 'top bottom',
                },
            })


            if (ctStart.length == 1) {
                tl.to(ctStart, {
                    y: 0,
                    duration: $this.data('duration') == null ? 2.5 : $this.data('duration'),
                    ease: 'expo.out',
                }, 0)

            }

            tl.to(ctChar, {
                yPercent: -100,
                duration: $this.data('duration') == null ? 2.5 : $this.data('duration'),
                stagger: $this.data('stagger') == null ? 0.1 : $this.data('stagger'),
                ease: 'expo.out',
            }, 0);


            if (ctEnd.length == 1) {
                tl.to(ctEnd, {
                    y: 0,
                    duration: $this.data('duration') == null ? 2.5 : $this.data('duration'),
                    ease: 'expo.out',
                }, 0.5)

            }




        })
    }

    function naylaTeamMember() {

        const member = $('.nayla-team-member');

        member.each(function () {

            let $this = $(this),
                cv = $this.find('.team-member-cv'),
                card = $this.find('.team-member-card'),
                image = $this.find('.team-member-image'),

                parentHeight = $this.outerHeight(),
                cardHeight = card.outerHeight(),
                cvHeight = cv.outerHeight();

            image.append('<div class="cv-toggle"><span class="material-icons">add</span></div>')


            let cvToggle = $this.find('.cv-toggle');

            cvToggle.on('click', function () {

                var clicks = $(this).data('clicks'),
                    tl = gsap.timeline();

                if (clicks) {

                    //Close

                    $this.removeClass('active');

                    tl.to(cv, {
                        opacity: 0,
                        duration: .5,
                        display: 'none',
                        onComplete: () => {
                            gsap.set(card, {
                                paddingBottom: cvHeight + 50,
                            })
                        }

                    })

                    if ($this.hasClass('overlay')) {

                        tl.to(card, {
                            paddingBottom: 0,

                        }, 0.5)

                    } else {

                        tl.to(image, {
                            height: 'auto',
                            duration: .75,
                            ease: 'expo.out'
                        }, 0.5)

                        tl.to(card, {
                            paddingBottom: 0,
                            duration: .75,
                            ease: 'expo.out'
                        }, 0.5)


                    }




                } else {

                    // Open

                    $this.addClass('active');

                    if ($this.hasClass('overlay')) {

                        tl.to(card, {
                            paddingBottom: cvHeight + 50,
                        })

                    } else {

                        tl.to(image, {
                            height: parentHeight - (cardHeight + cvHeight + 50 + 15),
                            duration: 1,
                            ease: 'expo.out'
                        })

                        tl.to(card, {
                            paddingBottom: cvHeight + 50,
                            duration: 1,
                            ease: 'expo.out'
                        }, 0)

                    }

                    tl.to(cv, {
                        opacity: 1,
                        duration: .5,
                        display: 'block',
                        onStart: () => {
                            gsap.set(card, {
                                paddingBottom: 0,
                            })
                        }

                    })

                }
                $(this).data("clicks", !clicks);

            })




        })


    }

    function naylaInfiniteTabs() {
        let naylaInfiniteTab = $('.nayla-infinite-tabs');

        naylaInfiniteTab.each(function () {
            let $this = $(this),
                tabTitleWrap = $this.find('.tab-title-wrap'),
                tabTitle = $this.find('.tab-title');

            $this.find('.tab-content').each(function (i) {
                i++;
                $(this).addClass('data-index_' + i)
            })

            tabTitle.each(function (i) {
                i++;
                $(this).attr('data-index', i)
            })

            tabTitle.on('click', function () {
                tabTitle.removeClass('active')
                $(this).addClass('active');

                let prevWidth = 0;

                $(this).prevAll().each(function (i) {
                    prevWidth += parseInt($(this).outerWidth(true), 10)
                })
                gsap.to(tabTitleWrap, {
                    x: -1 * prevWidth,
                    duration: 1.5,
                    ease: 'expo.out',
                    onStart: () => {

                        let tl = gsap.timeline()

                        tl.to($this.find('.tab-content'), {
                            opacity: 0,
                            duration: $this.data('duration') / 2,
                            onComplete: () => {
                                $this.find('.tab-content').hide()
                                $this.find('.tab-content.data-index_' + $(this).data('index')).show()
                            }
                        })

                        tl.to($this.find('.tab-content.data-index_' + $(this).data('index')), {
                            opacity: 1,
                            duration: $this.data('duration') / 2
                        })

                        gsap.to($this.find('.tab-contents-wrap'), {
                            height: $this.find('.tab-content.data-index_' + $(this).data('index')).outerHeight(true)
                        })

                    },
                    onComplete: () => {

                        $(this).prevAll().appendTo(tabTitleWrap)
                        gsap.set(tabTitleWrap, {
                            x: 0
                        })
                    }
                })
            })

        })

        //        function updateOnResize() {
        //            prevWidth = 0
        //            $(this).prevAll().each(function (i) {
        //                prevWidth += parseInt($(this).outerWidth(true), 10)
        //                $this.find('.tab-content.data-index_' + $(this).data('index')).outerHeight(true)
        //            })
        //        }
        //        matchMedia.add(isPhone, () => {
        //            updateOnResize()
        //        });
        //        matchMedia.add(isTablet, () => {
        //            updateOnResize()
        //        });
        //        matchMedia.add(isDesktop, () => {
        //            updateOnResize()
        //        });
    }

    function initPages() {
        $('.project-page').length ? naylaProjectPages() : '';
        naylaPortfolio();
        naylaProductPage();
        naylaSinglePostPage()

    }



    function initPageElements() {

        naylaIcons()
        naylaHeading()
        naylaCartButton()
        naylaTeamMember()
        naylaCircleText();
        naylaButtons();
        naylaMarquee()
        naylaServices()
        naylaNumberCounter();
        naylaAccordion();
        naylaInfiniteTabs();
        naylaClinetsCarousel();
        naylaInfiniteCarousel();
        naylaDynamicGrid();
        naylaFilterableGrid();
        naylaForms();
        gridScroll()
        naylaTestimonials()
        //                naylaImageCompare()

        naylaDynamicCarousel();
        naylaParallax();
        naylaLightbox()
        naylaDynamicList();
        detectPov()
        circleMaskBg();

        naylaSingleProject();
    }

    function initShowcases() {
        showcaseWall();
        showcaseList();
        showcaseFullscreenSlideshow();
        showcaseMinimalList();
        showcaseCarousel();
        showcaseInfiniteGrid();
        showcaseFullscreenCarousel();
        horizontalList();
        showcaseFullscreenWall();
        showcaseInteractiveGrid()
        showcaseCards();
        showcase3dTitles()
    }



    if (($('.page-loader').length) && (!sessionStorage.getItem('doNotShow'))) {
        sessionStorage.setItem('doNotShow', 'true');


        pageLoader()


    } else {
        $('.page-loader').remove()
    }

    naylaMouseCursor(true);
    smoothScroll();



    $(window).on('load', function () {

        winLoaded = true;

        window.scrollTo(0, 0);

        naylaVideo($('.nayla-video'));
        naylaGeneralAnims($('.has-anim'));
        naylaTextAnims();
        naylaTextWrapper();
        naylaListAnimations();
        naylaImageAnims()
        naylaParallaxImages();

        initShowcases();
        initPageElements();
        naylaSections();
        initPages();

        naylaHeader();
        siteNavigation();
        naylaScrollButtons();
        layoutSwitcher();
        
        ScrollTrigger.refresh(true); // <- This time is in seconds;

        let loader = gsap.getById("innerTl");

        if (loader != null) {

            setTimeout(function () {

                let instance = ScrollTrigger.getAll(),
                    i = 0;

                for (i = 0; i < instance.length; i++) {

                    instance[i].disable();

                }


            }, 3)

        }



    })



    //////////////////////////
    //   Page Transitions   //
    //////////////////////////



    let caption = $('.page-transition-caption');

    new SplitText(caption, {
        type: 'lines, chars, words',
        linesClass: 'capt_lines',
        wordsClass: 'capt_words',
        charsClass: 'capt_chars'
    })

    let chars = $('.capt_chars'),
        words = $('.capt_words'),
        lines = $('.capt_lines');

    chars.wrapInner('<span></span>');

    function transitionCaption(tl, intro, outro) {

        if (transitions.hasClass('default')) {

            if (intro) {

                tl.fromTo(chars.find('span'), {
                    y: 100
                }, {
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    stagger: 0.01,


                }, .3)


            }
            if (outro) {

                tl.to(chars.find('span'), {
                    y: -100,
                    duration: .6,
                    stagger: -0.01,
                    ease: 'power3.in',
                }, .3)

            }


        } else if (transitions.hasClass('offset-x')) {



            if (intro) {

                tl.fromTo(chars.find('span'), {
                    x: 50
                }, {
                    x: 0,
                    duration: .6,
                    ease: 'power3.out',
                    stagger: 0.02,


                }, .5)


            }
            if (outro) {

                tl.to(chars.find('span'), {
                    x: -50,
                    duration: .6,
                    stagger: 0.02,
                    ease: 'power3.in',
                }, .3)

            }



        } else if (transitions.hasClass('opacity')) {


            if (intro) {

                tl.fromTo(chars, {
                    opacity: 0
                }, {
                    opacity: 1,
                    duration: .6,
                    ease: 'power3.out',
                    stagger: 0.02,


                }, 0.3)


            }
            if (outro) {

                tl.to(chars, {
                    opacity: 0,
                    duration: .6,
                    stagger: 0.02,
                    ease: 'power3.in',
                }, .3)

            }

        }


    }


    let transitions = $('.nayla-page-transition'),
        block, paper, columns, overlay, up, down, left, right, opacity, pageOver;

    transitions.hasClass('up') ? up = true : transitions.hasClass('down') ? down = true : transitions.hasClass('left') ? left = true : transitions.hasClass('right') ? right = true : '';

    transitions.hasClass('block') ? block = true : transitions.hasClass('overlay') ? overlay = true : transitions.hasClass('opacity') ? opacity = true : transitions.hasClass('page-over') ? pageOver = true : transitions.hasClass('columns') ? columns = true : '';


    function blockTrans() {

        let blocksCount = 10,
            i = 0;

        for (i = 0; i <= blocksCount; i++) {

            transitions.append('<span class="transition-block"><span></span></span>')
        }
    }

    block ? blockTrans() : '';

    function columnsTrans() {

        let blocksCount = 4,
            i = 0;

        for (i = 0; i <= blocksCount; i++) {

            transitions.append('<span class="trans-col"></span>')
        }
    }

    columns ? columnsTrans() : '';


    function pageOverDef() {

        $('<span class="page-over-ovs"></span>').insertBefore(transitions)

    }

    pageOver ? pageOverDef() : '';

    function transOv() {

        transitions.append('<span class="transition-overlay"></span>')

    }

    overlay ? transOv() : '';


    function animateBlocks(time, intro, outro) {

        let stagger = up ? -0.04 : down ? 0.04 : left ? 0.04 : right ? -0.04 : '',
            ease = up ? 'power4.out' : down ? 'power4.out' : left ? 'power4.inOut' : right ? 'power4.inOut' : '',
            duration = up ? 1 : down ? 1 : left ? 1 : right ? 1 : '';

        if (intro) {

            transitions.css('visibility', 'visible');

            time.to('.transition-block span', {
                height: '100%',
                width: '100%',
                duration: duration,
                ease: ease,
                stagger: stagger,
                onComplete: () => {

                    transitions.addClass('half')

                }
            })

        } else if (outro) {

            time.to('.transition-block span', {
                height: up || down ? '0%' : '100%',
                width: left || right ? '0%' : '100%',
                duration: duration,
                ease: ease,
                stagger: stagger,
                delay: 1,
                onComplete: () => {

                    transitions.removeClass('half')

                }
            })
        }
    }

    function animateOverlay(time, intro, outro) {

        if (intro) {

            time.to(transitions.find('.transition-overlay'), {
                height: '100%',
                width: '100%',
                duration: 1,
                ease: 'expo.inOut',
                onComplete: () => {

                    transitions.addClass('half')

                }
            }, 0)

        }


        if (outro) {

            time.to(transitions.find('.transition-overlay'), {
                height: up || down ? '0%' : '100%',
                width: left || right ? '0%' : '100%',
                duration: 1,
                delay: .5,
                ease: 'expo.inOut',
                onComplete: () => {

                    transitions.removeClass('half')

                }
            }, 0)




        }

    }

    function animateColumns(time, intro, outro) {

        if (intro) {

            transitions.css('visibility', 'visible');

            if (left || right) {

                time.to('.trans-col', {
                    width: '100%',
                    stagger: {
                        grid: [1, 20],
                        from: "random",
                        amount: .3,

                    },
                    duration: .8,
                    ease: 'expo.out',
                    onComplete: () => {

                        transitions.addClass('half')

                    }
                })

            } else {

                time.to('.trans-col', {
                    height: '100%',
                    stagger: {
                        grid: [1, 20],
                        from: "random",
                        amount: .3,

                    },
                    duration: .8,
                    ease: 'expo.out',
                    onComplete: () => {

                        transitions.addClass('half')

                    }
                })

            }



        }


        if (outro) {


            if (left || right) {

                time.to('.trans-col', {
                    width: '0%',
                    delay: 1,
                    stagger: {
                        grid: [1, 20],
                        from: "random",
                        amount: .3,

                    },
                    duration: 1.2,
                    ease: 'expo.out',
                    onComplete: () => {

                        transitions.removeClass('half')

                    }

                })


            } else {

                time.to('.trans-col', {
                    height: '0%',
                    delay: 1,
                    stagger: {
                        grid: [1, 20],
                        from: "random",
                        amount: .3,

                    },
                    duration: 1.2,
                    ease: 'expo.out',
                    onComplete: () => {

                        transitions.removeClass('half')

                    }

                })

            }



        }

    }

    function animateOpacity(time, intro, outro) {

        if (intro) {

            time.to('#primary, .project-page-header', {
                y: up ? -100 : down ? 100 : 0,
                x: left ? 100 : right ? -100 : 0,
                opacity: 0,
                duration: 1,
                ease: 'power3.in',
            }, 0)

        }

        if (outro) {

            time.from('#primary, .project-page-header', {
                y: up ? 100 : down ? -100 : 0,
                x: left ? -100 : right ? 100 : 0,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            }, 0)

        }

    }

    function animatePageOver(time, intro, outro) {

        let origin = $(window).scrollTop(),
            brightOverlay = '<span class="bright-ov"></span>';

        gsap.set('#content , .project-page-header', {
            transformOrigin: 'center ' + origin
        })

        if (intro) {

            time.to(transitions, {
                height: '100vh',
                width: '100vw',
                duration: 1.5,
                ease: 'expo.inOut'

            }, 0)

            time.to('.page-over-ovs', {
                opacity: 1,
                scale: 1,
                duration: 1,

            }, 0)


        }


        if (outro) {

            gsap.set('.page-over-ovs', {
                clearProps: 'all'
            })

            time.to(transitions, {
                opacity: 0,

                duration: 1
            }, 0)

        }

    }



    // General Resets

    function getMediaToCenter(tl, duration) {

        var media = $('.transition--media');

        if (!media.find('.plyr__video-embed__container').length) {

            media.clone().addClass('clone').insertAfter(media);
        }



        media.addClass('animating');

        let state = Flip.getState(media, {
                props: 'top, left, right, bottom, x, y, maxWidth, maxHeight'
            }),
            height = media.outerHeight(),
            width = media.outerWidth();

        if (!media.find('.plyr__video-embed__container').length) {

            $('body').hasClass('smooth-scroll') ? media.insertBefore('#smooth-content') : media.insertBefore('main');

        }


        if (media.find('.plyr__video-embed__container').length) {

            gsap.set(media, {
                rotate: 0,
                position: 'fixed',
                height: height,
                width: width,
                top: 0,
                left: 0,
                right: 'unset',
                bottom: 'unset',
                xPercent: 0,
                yPercent: 0,
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 1,
                clipPath: 'inset(0%)',
                display: 'block',
                maxHeight: 'unset',
                maxWidth: 'unset',
                zIndex: 9999,
                mixBlendMode: 'unset'
            })

        } else {

            gsap.set(media, {
                rotate: 0,
                position: 'fixed',
                height: height,
                width: width,
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
                right: 'unset',
                bottom: 'unset',
                xPercent: -50,
                yPercent: -50,
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 1,
                clipPath: 'inset(0%)',
                display: 'block',
                maxHeight: 'unset',
                maxWidth: 'unset',
                zIndex: 9999,
                mixBlendMode: 'unset'
            })


        }



        let flip = Flip.from(state, {
            duration: duration,
            absolute: true,
            absoluteOnLeave: true,
            ease: 'expo.inOut',
            onStart: () => {

                gsap.set('.clone', {
                    visibility: 'hidden'
                })

            }
        });

        tl.add(flip, 0);


    }


    function animateMedia(tl, fullscreen, slide, mask, direction) {

        var media = document.querySelector('.transition--media');

        if (fullscreen) {

            tl.to(media, {
                width: '100vw',
                height: '100vh',
                duration: 1,
                ease: 'expo.inOut',
            })


        }

        if (mask) {

            tl.to(media, {
                clipPath: 'inset(0% 0% 100% 0%)',
                duration: 1,
                ease: 'expo.inOut',
            }, 1.5)


        }



    }

    function projectBackground(current, next, tl, delay, smooth) {


        if (current === next) {

        } else {

            let ov = document.createElement('span')
            ov.classList.add('project-trans-overlay');
            ov.style.backgroundColor = next;

            document.querySelector('#page').append(ov);

            if ($('.animating').find('.n-vimeo').length || $('.animating').find('.n-youtube').length) {

                ov.style.zIndex = 0;
            }

            tl.to(ov, {
                height: '100svh',
                duration: 1,
                ease: 'expo.inOut',
                onStart: () => {

                    if (smooth) {

                        setTimeout(function () {

                            gsap.to(siteHeader.children('div').children('section'), {
                                opacity: 0,
                                duration: .3

                            })
                        }, 650)

                        setTimeout(function () {


                            gsap.to(siteHeader.children('div').children('section'), {
                                opacity: 1,
                                duration: .3

                            })
                        }, 1200)

                    } else {

                        setTimeout(function () {

                            headerLayoutChange(false, next, false, false)

                        }, 650)


                    }




                }
            }, delay)

        }

    }

    // Showcase Animations

    function fullscreenCarouselOut(tl) {

        let slides = $('.showcase-fullscreen-carousel .showcase-project.swiper-slide').not('.swiper-slide-active'),
            title = $('.showcase-project.swiper-slide-active').find('.project-title');

        new SplitText(title, {
            type: 'chars',
            charsClass: 'fc_char'
        })

        tl.to([slides, '.sfc-fraction', '.showcase-footer', '.project-button'], {
                opacity: 0
            }, 0),

            tl.to('.fc_char', {
                yPercent: -100,
                duration: .5,
                stagger: 0.05,
                ease: 'power3.in'
            }, 0)

    }

    function fullscreenSlideshowOut(tl) {


        let active = $('.fs-slideshow-wrap .showcase-project.active');

        tl.to([active.find('.pt_char'), active.find('.pd_word span')], {
            yPercent: -100,
            duration: .75,
            ease: 'expo.in',
            stagger: 0.02
        }, 0)

        tl.to('.showcase-footer', {
            opacity: 0
        }, 0)

        tl.to('.project-button', {
            opacity: 0
        }, 0)

    }

    function showcaseListOut(tl) {

        tl.to('.sfl-projects .project-title, .sfl-projects .project-meta', {
            yPercent: -100,
            opacity: 0
        }, 0)


    }

    function outAnimShowcaseCarousel(time) {

        let carousel = $('.showcase-carousel'),
            project = carousel.find('.showcase-project.active'),
            title = carousel.find('.project-title');

        time.to(title, {
            yPercent: -100,
            duration: 1,
            ease: 'expo.inOut'
        }, 0)

        time.to([$('.showcase-footer'), $('.sc-lines')], {
            opacity: 0,
            duration: 1,
            ease: 'expo.inOut',
            onComplete: () => {

                carousel.addClass('animatingg');

            }
        }, 0)

    }

    function showcaseCardsOut(tl) {

        let items = $('.showcase-project'),
            active = $('.showcase-project.active');

        gsap.killTweensOf(items)

        tl.to(items.not(active), {
            opacity: 0,
            duration: .7,
            stagger: -0.1
        }, 0)

        tl.to(active, {
            y: '-50%',
            top: '50vh',
            bottom: 'unset',
            duration: 1,
            borderRadius: 0,
            z: 0,
        }, 0.5)

        tl.to(active.find('.project-meta'), {
            opacity: 0,
            duration: 1,

        }, 1)

    }

    function minimalListOut(tl) {

        tl.to('.sml-wrapper .project-title', {

            yPercent: -100,
            duration: 1,
            ease: 'power4.in',
            stagger: 0.025

        }, 0)

    }

    function fullscreenWallOut(tl) {

        let targets = $('main').find('*').not('trans-image');

        tl.to('.title_line', {
            yPercent: -25,
            rotateX: -90,
            duration: 1,
            ease: 'expo.in'
        }, 0)

        tl.to('.project-title, .project-category, .showcase-footer', {
            opacity: 0,
            duration: 1,
            ease: 'expo.in'
        }, 0)

    }

    function showcase3dTitlesOut(tl) {

        let currRot = $('.s3t-projects-wrap').css('transform');



        tl.to('.s3t-projects-wrap .project-title', {
            y: -200,
            duration: 1,
            ease: 'expo.in',
            opacity: 0,
            onComplete: () => {

                $('.showcase-3d-titles').addClass('animatingg');

            }
        }, 0)

        tl.to('.showcase-footer', {
            opacity: 0
        }, 0)



    }

    function showcaseImageLeave(tl, media) {


        let medTop = media.offset().top - $(window).scrollTop(),
            targets = $('main').find('.elementor-widget-container'),
            exclude = media.parents('.elementor-widget-container').first(),
            others = exclude.find('.single-project-meta'),
            wido = media.outerWidth(),
            height = media.outerHeight(),
            left = media.offset().left;

        if (media.find('.n-vimeo').length || media.find('.n-youtube').length) {


        } else {

            gsap.set(media, {
                top: medTop,
                width: wido,
                height: height,
                left: left,
                position: 'fixed',
                zIndex: 999
            })
            $('body').hasClass('smooth-scroll') ? media.insertBefore('#smooth-content') : media.insertBefore('main');

        }




        media.addClass('animating')

    }

    function projectImageLeave(tl, media) {


        let medTop = media.offset().top - $(window).scrollTop(),
            targets = $('main').find('.elementor-widget-container'),
            exclude = media.parents('.elementor-widget-container').first(),
            others = exclude.find('.single-project-meta'),
            wido = media.outerWidth(),
            height = media.outerHeight(),
            left = media.offset().left;

        let margTop = parseInt(media.parents('.elementor-section').last().css('marginTop'), 10),
            margBottom = parseInt(media.parents('.elementor-section').last().css('marginBottom'), 10);

        media.attr('data-margins', margTop)


        if (media.find('.n-vimeo').length || media.find('.n-youtube').length) {


        } else {
            media.clone().addClass('clone').insertAfter(media);

            gsap.set(media, {
                top: medTop,
                width: wido,
                height: height,
                left: left,
                position: 'fixed',
                zIndex: 999
            })

        }



        if (media.find('.n-vimeo').length || media.find('.n-youtube').length) {

            let targets = $('main').find('.elementor-widget-container'),
                exclude = media.parents('.elementor-widget-container').first();

            tl.to(targets.not(exclude), {

                opacity: 0,
                duration: .4
            })

            media.addClass('animating')

        } else {

            $('body').hasClass('smooth-scroll') ? media.insertBefore('#smooth-content') : media.insertBefore('main');

            media.addClass('animating')

            tl.to($('main').first(), {
                opacity: 0,
                duration: .4
            }, 0)
        }



    }


    function projectImageEnter(tl, response, targetBg) {

        let image = response.find('.project-page-header .project-image.featured'),
            height = image.outerHeight(),
            width = image.outerWidth(),
            left = image.offset().left,
            transImage = $('.animating'),
            top = image.offset().top - $('main').first().outerHeight() - $('main').first().offset().top;

        if (mobileQuery.matches) {

            let top = image.offset().top - $('main').first().outerHeight() - $('main').first().offset().top - (transImage.data('margins') != null ? transImage.data('margins') : 0);

        }

        image.hide();


        let next = targetBg,
            current = $('body').css('backgroundColor');

        projectBackground(current, next, tl, 0, true)

        if (transImage.find('.n-vimeo').length || transImage.find('.n-youtube').length) {

            tl.to(transImage, {
                clipPath: 'inset(0% 0% 100% 0%)',
                duration: 1,
                ease: 'expo.inOut',
            }, 1)

        } else {

            let state = Flip.getState(transImage);

            gsap.set(transImage, {
                position: 'fixed',
                top: top,
                height: height,
                width: width,
                left: left,
                y: 0,
                x: 0,
                yPercent: 0,
                xPercent: 0
            })


            let imgTo = Flip.from(state, {
                duration: 1,
                ease: 'expo.inOut',

            })

            tl.add(imgTo, 0);

        }

    }

    function showcaseImageEnter(tl, response, targetBg) {


        let image = response.find('.project-page-header .project-image.featured'),
            top = image.offset().top - $('main').first().outerHeight(),
            height = image.outerHeight(),
            width = image.outerWidth(),
            left = image.offset().left,
            transImage = $('.animating');

        image.hide();

        let next = targetBg,
            current = $('body').css('backgroundColor');

        projectBackground(current, next, tl, 0, true)


        if (transImage.find('.n-vimeo').length || transImage.find('.n-youtube').length) {

            tl.to(transImage, {
                clipPath: 'inset(0% 0% 100% 0%)',
                duration: 1,
                ease: 'expo.inOut',
            }, 1)

        } else {

            let state = Flip.getState(transImage);

            gsap.set(transImage, {
                position: 'fixed',
                top: top,
                height: height,
                width: width,
                left: left,
                x: 0,
                y: 0,
                xPercent: 0,
                yPercent: 0
            })

            let imgTo = Flip.from(state, {
                duration: 1.2,
                ease: 'expo.inOut',
            })

            tl.add(imgTo, 0);

        }

    }


    barba.init({
        debug: true,
        timeout: 30000,
        transitions: [
            {
                name: 'default-transition',
                leave() {

                    return new Promise(function (resolve, reject) {

                        transitions.addClass('running')

                        let tl = gsap.timeline({
                            onStart: () => {
                                gsap.set(transitions, {
                                    visibility: 'visible'
                                })
                            },

                            onComplete: () => {

                                resolve();
                            }
                        });

                        block ? animateBlocks(tl, true, false) : overlay ? animateOverlay(tl, true, false) : opacity ? animateOpacity(tl, true, false) : pageOver ? animatePageOver(tl, true, false) : columns ? animateColumns(tl, true, false) : '';

                        transitionCaption(tl, true, false)
                    })

                },
                beforeEnter() {

                    return new Promise(function (resolve, reject) {

                        let tl = gsap.timeline({
                            onStart: () => {
                                resolve();
                                transitions.removeClass('running');
                            },
                            onComplete: () => {

                                gsap.set(transitions, {
                                    clearProps: 'all'
                                })

                                if (block) {

                                    gsap.set('.transition-block', {
                                        clearProps: 'all'
                                    })

                                }

                            }
                        });


                        block ? animateBlocks(tl, false, true) : overlay ? animateOverlay(tl, false, true) : opacity ? animateOpacity(tl, false, true) : pageOver ? animatePageOver(tl, false, true) : columns ? animateColumns(tl, false, true) : '';


                        transitionCaption(tl, false, true)

                    })
                }

                }, {
                name: 'fullscreen-menu-transition',
                from: {
                    custom: ({
                        trigger
                    }) => {
                        return trigger.classList && trigger.classList.contains('menu-link');
                    },
                },
                leave() {

                    return new Promise(function (resolve, reject) {

                        transitions.addClass('running')

                        let tl = gsap.timeline({
                                onStart: () => {
                                    gsap.set(transitions, {
                                        visibility: 'visible'
                                    })
                                },

                                onComplete: () => {
                                    resolve();
                                }
                            }),
                            toggle = $('.menu-toggle');

                        toggle.trigger('click')

                        block ? animateBlocks(tl, true, false) : overlay ? animateOverlay(tl, true, false) : opacity ? animateOpacity(tl, true, false) : pageOver ? animatePageOver(tl, true, false) : columns ? animateColumns(tl, true, false) : '';

                        transitionCaption(tl, true, false)

                    })

                },
                beforeEnter() {

                    return new Promise(function (resolve, reject) {

                        let tl = gsap.timeline({
                            onStart: () => {
                                resolve();
                                transitions.removeClass('running')
                            },
                            onComplete: () => {
                                gsap.set(transitions, {
                                    clearProps: 'all'
                                })
                            }

                        });

                        block ? animateBlocks(tl, false, true) : overlay ? animateOverlay(tl, false, true) : opacity ? animateOpacity(tl, false, true) : pageOver ? animatePageOver(tl, false, true) : columns ? animateColumns(tl, false, true) : '';

                        transitionCaption(tl, false, true)

                    })
                }
            }, {
                name: 'media-center-to-image',
                from: {
                    custom: ({
                        trigger
                    }) => {
                        return trigger.classList && trigger.classList.contains('sc-link');
                    },
                },
                to: {
                    namespace: ['project-half-image', 'project-image-gallery-horizontal', 'project-no-image', 'project-image-gallery-vertical', 'project-video', 'project-creative', 'project-boxed-image', 'project-fullscreen-image', 'project-tall-image']
                },
                leave() {

                    return new Promise(function (resolve, reject) {

                        let tl = gsap.timeline({
                            onComplete: () => {
                                resolve();
                            }
                        })

                        if ($('div.showcase-carousel').length || $('div.showcase-fullscreen-carousel').length || $('div.showcase-fullscreen-slideshow').length || $('div.showcase-3d-titles').length || $('div.showcase-cards').length) {

                        } else {

                            getMediaToCenter(tl, 1.5);
                        }


                        $('div.showcase-cards').length ? showcaseCardsOut(tl) : $('div.showcase-carousel').length ? outAnimShowcaseCarousel(tl) : $('div.showcase-fullscreen-carousel').length ? fullscreenCarouselOut(tl) : $('div.showcase-fullscreen-slideshow').length ? fullscreenSlideshowOut(tl) : $('div.showcase-minimal-list').length ? minimalListOut(tl) : $('div.showcase-fullscreen-wall').length ? fullscreenWallOut(tl) : $('div.showcase-list').length ? showcaseListOut(tl) : $('div.showcase-3d-titles').length ? showcase3dTitlesOut(tl) : null;

                    })
                },
                afterLeave() {

                    return new Promise(function (resolve, reject) {

                        if ($('div.showcase-carousel').length || $('div.showcase-fullscreen-carousel').length || $('div.showcase-fullscreen-slideshow').length || $('div.showcase-3d-titles').length || $('div.showcase-cards').length) {

                            let tl = gsap.timeline({
                                onComplete: () => {
                                    resolve();
                                }
                            })

                            $('div.showcase-carousel').length ? getMediaToCenter(tl, 0) : $('div.showcase-cards').length ? getMediaToCenter(tl, 0) : getMediaToCenter(tl, 1.5);

                        } else {

                            resolve();
                        }

                    })

                },
                beforeEnter(data) {

                    return new Promise(function (resolve, reject) {

                        var response = data.next.html.replace(/(<\/?)body( .+?)?>/gi, '$1notbody$2>', data.next.html),
                            bodyClasses = $(response).filter('notbody').attr('class');

                        let styleSheet = $(response).filter('style#nayla-body-styles')[0];

                        var styleSheetContent = styleSheet.innerHTML;

                        var matches = styleSheetContent.match(/--mainBackground:\s(.*?);/g);

                        var mainBackgroundValues = [];

                        if (matches) {
                            matches.forEach(function (match) {
                                var valueMatch = match.match(/--mainBackground:\s(.*?);/);
                                if (valueMatch && valueMatch[1]) {
                                    var value = valueMatch[1].replace(/\s*!important/g, ''); // !important'ı kaldırın
                                    mainBackgroundValues.push(value);
                                }
                            });
                        }


                        var lightBg = mainBackgroundValues[0],
                            darkBg = mainBackgroundValues[1],
                            targetBg;


                        if (bodyClasses.includes("light")) {

                            targetBg = lightBg
                        }

                        if (bodyClasses.includes("dark")) {

                            targetBg = darkBg

                        }



                        let tl = gsap.timeline({
                            delay: 1.5,
                            onComplete: () => {

                                resolve();
                                setTimeout(function () {

                                    $('.project-trans-overlay').remove();
                                    $('.project-image.featured').show();
                                    $('.animating').remove();
                                }, $('body').hasClass('smooth-scroll') ? 300 : 100)
                            }
                        })

                        showcaseImageEnter(tl, $('main').last(), targetBg)
                    })

                }
                }, {
                name: 'inline-project-transition',
                from: {
                    custom: ({
                        trigger
                    }) => {
                        return trigger.classList && trigger.classList.contains('inner-project-link');
                    },
                },
                to: {
                    namespace: ['project-boxed-image', 'project-fullscreen-image', 'project-half-image', 'project-creative', 'project-tall-image', 'project-image-gallery-horizontal', 'project-image-gallery-vertical', 'project-video']
                },
                leave(trigger) {

                    return new Promise(function (resolve, reject) {

                        let clicked = $(trigger.trigger);

                        let tl = gsap.timeline({
                                onComplete: () => {

                                    resolve();
                                }
                            }),
                            media;

                        if (clicked.find('.trans-media').length) {

                            media = clicked.find('.trans-media');

                        } else {
                            media = $('.trans-media')
                        }

                        projectImageLeave(tl, media);

                    })
                },
                beforeEnter(data) {

                    return new Promise(function (resolve, reject) {


                        var response = data.next.html.replace(/(<\/?)body( .+?)?>/gi, '$1notbody$2>', data.next.html),
                            bodyClasses = $(response).filter('notbody').attr('class');

                        let styleSheet = $(response).filter('style#nayla-body-styles')[0];

                        var styleSheetContent = styleSheet.innerHTML;

                        var matches = styleSheetContent.match(/--mainBackground:\s(.*?);/g);

                        var mainBackgroundValues = [];

                        if (matches) {
                            matches.forEach(function (match) {
                                var valueMatch = match.match(/--mainBackground:\s(.*?);/);
                                if (valueMatch && valueMatch[1]) {
                                    var value = valueMatch[1].replace(/\s*!important/g, ''); // !important'ı kaldırın
                                    mainBackgroundValues.push(value);
                                }
                            });
                        }


                        var lightBg = mainBackgroundValues[0],
                            darkBg = mainBackgroundValues[1],
                            targetBg;


                        if (bodyClasses.includes("light")) {

                            targetBg = lightBg
                        }

                        if (bodyClasses.includes("dark")) {

                            targetBg = darkBg

                        }



                        let tl = gsap.timeline({
                            delay: 2,
                            onComplete: () => {

                                resolve();

                                setTimeout(function () {

                                    $('.project-trans-overlay').remove();
                                    $('.project-image.featured').show();
                                    $('.animating').remove();
                                }, $('body').hasClass('smooth-scroll') ? 300 : 100)

                            }

                        })

                        projectImageEnter(tl, $('main').last(), targetBg)

                    })

                },

                }, {
                name: 'showcase-project-transition',
                from: {
                    custom: ({
                        trigger
                    }) => {
                        return trigger.classList && trigger.classList.contains('showcase-project-link');
                    },
                },
                to: {
                    namespace: ['project-boxed-image', 'project-fullscreen-image', 'project-half-image', 'project-creative', 'project-tall-image', 'project-image-gallery-horizontal', 'project-image-gallery-vertical', 'project-video']
                },
                leave() {

                    return new Promise(function (resolve, reject) {

                        let tl = gsap.timeline({
                            onComplete: () => {
                                resolve();
                            }
                        })

                        showcaseImageLeave(tl, $('.trans-media'));

                        $('div.showcase-carousel').length ? outAnimShowcaseCarousel(tl) : $('div.showcase-fullscreen-carousel').length ? fullscreenCarouselOut(tl) : $('div.showcase-fullscreen-slideshow').length ? fullscreenSlideshowOut(tl) : $('div.showcase-minimal-list').length ? minimalListOut(tl) : $('div.showcase-fullscreen-wall').length ? fullscreenWallOut(tl) : $('div.showcase-list').length ? showcaseListOut(tl) : $('div.showcase-3d-titles').length ? showcase3dTitlesOut(tl) : null;



                    })
                },
                beforeEnter(data) {

                    return new Promise(function (resolve, reject) {

                        var response = data.next.html.replace(/(<\/?)body( .+?)?>/gi, '$1notbody$2>', data.next.html),
                            bodyClasses = $(response).filter('notbody').attr('class');

                        let styleSheet = $(response).filter('style#nayla-body-styles')[0];

                        var styleSheetContent = styleSheet.innerHTML;

                        var matches = styleSheetContent.match(/--mainBackground:\s(.*?);/g);

                        var mainBackgroundValues = [];

                        if (matches) {
                            matches.forEach(function (match) {
                                var valueMatch = match.match(/--mainBackground:\s(.*?);/);
                                if (valueMatch && valueMatch[1]) {
                                    var value = valueMatch[1].replace(/\s*!important/g, ''); // !important'ı kaldırın
                                    mainBackgroundValues.push(value);
                                }
                            });
                        }


                        var lightBg = mainBackgroundValues[0],
                            darkBg = mainBackgroundValues[1],
                            targetBg;


                        if (bodyClasses.includes("light")) {

                            targetBg = lightBg
                        }

                        if (bodyClasses.includes("dark")) {

                            targetBg = darkBg

                        }



                        let tl = gsap.timeline({
                            delay: 1.5,
                            onComplete: () => {

                                resolve();
                                setTimeout(function () {

                                    $('.project-trans-overlay').remove();
                                    $('.project-image.featured').show();
                                    $('.animating').remove();
                                }, $('body').hasClass('smooth-scroll') ? 300 : 100)

                            }

                        })

                        showcaseImageEnter(tl, $('main').last(), targetBg)

                    })

                }
                }, {
                name: 'projects-grid-transition',
                from: {
                    custom: ({
                        trigger
                    }) => {
                        return trigger.classList && trigger.classList.contains('grid-project-link');
                    },
                },
                to: {
                    namespace: ['project-boxed-image', 'project-fullscreen-image', 'project-half-image', 'project-creative', 'project-tall-image', 'project-image-gallery-horizontal', 'project-image-gallery-vertical', 'project-video']
                },
                leave(trigger) {

                    return new Promise(function (resolve, reject) {


                        let tl = gsap.timeline({
                            onComplete: () => {

                                resolve();
                            }
                        })

                        let clicked = $(trigger.trigger),
                            media = clicked.find('.grid-project-image'),
                            target;

                        if ($('body').hasClass('smooth-scroll')) {

                            let aliothSmoother = ScrollSmoother.get();
                            aliothSmoother.scrollTo(media.offset().top - ($(window).outerHeight() - media.outerHeight()) + (($(window).outerHeight() - media.outerHeight()) / 2), 2);

                        } else {

                            target = window
                        }

                        tl.to(window, {
                            scrollTo: media.offset().top - ($(window).outerHeight() - media.outerHeight()) + (($(window).outerHeight() - media.outerHeight()) / 2),
                            duration: 2,
                            ease: 'power3.out',
                            onComplete: () => {

                                let medTop = media.offset().top - $(window).scrollTop(),
                                    wido = media.outerWidth(),
                                    height = media.outerHeight(),
                                    left = media.offset().left;


                                if (media.find('.n-vimeo').length || media.find('.n-youtube').length) {


                                } else {

                                    $('body').hasClass('smooth-scroll') ? media.insertBefore('#smooth-content') : media.insertBefore('main');


                                    gsap.set(media, {
                                        top: medTop,
                                        width: wido,
                                        height: height,
                                        left: left,
                                        position: 'fixed',
                                        zIndex: 999,
                                    })

                                }

                                media.addClass('animating');

                            }
                        });

                        let otherProj = $('.grid-project').not(media.parents()),
                            targets = $('main').find('.elementor-widget-container'),
                            exclude = media.parents('.elementor-widget-container').first(),
                            lastTar;

                        if (targets.length > 1) {

                            lastTar = targets.not(exclude)
                        } else {

                            lastTar = null
                        }


                        if (media.find('.nayla-video').length) {

                            tl.to([otherProj, '.grid-controls', lastTar], {
                                opacity: 0
                            }, 0)



                        } else {

                            tl.to([otherProj, media.parent('div').find('.masked'), '.grid-controls', lastTar], {
                                opacity: 0
                            }, 0)

                        }


                        tl.to('hr', {
                            width: 0
                        }, 0)


                    })
                },
                beforeEnter(data) {

                    return new Promise(function (resolve, reject) {

                        var response = data.next.html.replace(/(<\/?)body( .+?)?>/gi, '$1notbody$2>', data.next.html),
                            bodyClasses = $(response).filter('notbody').attr('class');

                        let styleSheet = $(response).filter('style#nayla-body-styles')[0];

                        var styleSheetContent = styleSheet.innerHTML;

                        var matches = styleSheetContent.match(/--mainBackground:\s(.*?);/g);

                        var mainBackgroundValues = [];

                        if (matches) {
                            matches.forEach(function (match) {
                                var valueMatch = match.match(/--mainBackground:\s(.*?);/);
                                if (valueMatch && valueMatch[1]) {
                                    var value = valueMatch[1].replace(/\s*!important/g, ''); // !important'ı kaldırın
                                    mainBackgroundValues.push(value);
                                }
                            });
                        }


                        var lightBg = mainBackgroundValues[0],
                            darkBg = mainBackgroundValues[1],
                            targetBg;


                        if (bodyClasses.includes("light")) {

                            targetBg = lightBg
                        }

                        if (bodyClasses.includes("dark")) {

                            targetBg = darkBg

                        }

                        let tl = gsap.timeline({
                            onStart: () => {

                                gsap.set($('main').last(), {
                                    opacity: 0
                                })

                            },
                            onComplete: () => {

                                resolve();
                                gsap.set($('main').last(), {
                                    opacity: 1
                                })

                                setTimeout(function () {

                                    $('.project-trans-overlay').remove();
                                    $('.project-image.featured').show();
                                    $('.animating').remove();
                                }, $('body').hasClass('smooth-scroll') ? 300 : 100)

                            }

                        })

                        projectImageEnter(tl, $('main').last(), targetBg)

                    })

                }
                }, {
                name: 'next-project-transition',
                from: {
                    custom: ({
                        trigger
                    }) => {
                        return trigger.classList && trigger.classList.contains('next-project-link');
                    },
                },
                to: {
                    namespace: ['project-boxed-image', 'project-fullscreen-image', 'project-half-image', 'project-creative', 'project-tall-image', 'project-image-gallery-horizontal', 'project-image-gallery-vertical', 'project-video']
                },
                leave() {

                    return new Promise(function (resolve, reject) {


                        let tl = gsap.timeline({
                            onComplete: () => {

                                resolve();
                            }
                        })


                        let media = $('.next-project-image'),
                            parent = $('.nayla-next-project'),
                            targets = ['div.next-project-caption , .next-project-title, .next-project-metas'],
                            bg = parent.css('backgroundColor'),
                            target;

                        headerLayoutChange(false, bg, false, true)


                        tl.to(window, {
                            scrollTo: parent.offset().top,
                            duration: 1,
                            ease: 'power3.out',
                            onComplete: () => {

                                let medTop = media.offset().top - $(window).scrollTop(),
                                    wido = media.outerWidth(),
                                    height = media.outerHeight(),
                                    left = media.offset().left;

                                $('body').hasClass('smooth-scroll') ? media.insertBefore('#smooth-content') : media.insertBefore('main');;

                                gsap.set(media, {
                                    top: medTop,
                                    width: wido,
                                    height: height,
                                    left: left,
                                    xPercent: 0,
                                    yPercent: 0,
                                    x: 0,
                                    y: 0,
                                    position: 'fixed',
                                    zIndex: 999,
                                })
                                media.addClass('animating');

                            }
                        });

                        tl.to(targets, {
                            opacity: 0
                        })



                    })
                },
                beforeEnter(data) {

                    return new Promise(function (resolve, reject) {

                        let tl = gsap.timeline({
                            onStart: () => {

                                gsap.set($('main').last(), {
                                    opacity: 0
                                })

                            },
                            onComplete: () => {

                                resolve();
                                gsap.set($('main').last(), {
                                    opacity: 1
                                })

                                setTimeout(function () {

                                    $('.project-trans-overlay').remove();
                                    $('.project-image.featured').show();
                                    $('.animating').remove();
                                }, $('body').hasClass('smooth-scroll') ? 300 : 100)

                            }

                        })


                        let response = $('main').last();

                        let image = response.find('.project-page-header .project-image.featured'),
                            top = image.offset().top - $('main').first().outerHeight() - ($('main').first().find('.project-page').outerHeight()),
                            height = image.outerHeight(),
                            width = image.outerWidth(),
                            left = image.offset().left,
                            transImage = $('.animating');

                        image.hide();

                        let state = Flip.getState(transImage);

                        gsap.set(transImage, {
                            position: 'fixed',
                            top: top,
                            height: height,
                            width: width,
                            left: left,
                        })

                        let next = $('.project-page-header').css('backgroundColor'),
                            current = $('main').css('backgroundColor')



                        let imgTo = Flip.from(state, {
                            duration: 1,
                            ease: 'expo.inOut',

                        })

                        tl.add(imgTo, 0);


                    })

                }
                }

            ]
    })


    if (history.scrollRestoration) {
        history.scrollRestoration = "manual";
    }

    ScrollTrigger.clearScrollMemory('manual');

    function startLoading() {

        $('html').addClass('loading');

        disableScroll();

        $('#mouseCursor').removeClass('hover-size hover-text hover-icon')
    }

    $(document).ready(function () {

        $('.inner-project-link, .next-project-link, .grid-project-link, .menu-link, .sc-link, .showcase-project-link').on('click', () => {

            //            startLoading()

        })

    })


    barba.hooks.before((data) => {

        startLoading();

    });

    barba.hooks.enter((data) => {

        var response = data.next.html.replace(/(<\/?)body( .+?)?>/gi, '$1notbody$2>', data.next.html),
            bodyClasses = $(response).filter('notbody').attr('class'),
            bodyStyles = $(response).filter('notbody').attr('style'),
            headerClasses = $(response).filter('notbody').find('#header').attr('class'),
            headerInner = $(response).filter('notbody').find('#header').html();

        var $newPageHead = $('<head />').html(
            $.parseHTML(
                data.next.html.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0], // <- use data argument
                document,
                true
            )
        );


        var headTags = [
            			         'meta[name="keywords"]',
            			         'meta[name="description"]',
            			         'meta[property^="og"]',
            			         'meta[name^="twitter"]',
            			         'meta[itemprop]',
            			         'link[itemprop]',
            			         'link[rel="prev"]',
            			         'link[rel="next"]',
            			         'link[rel="canonical"]',
            			         'link[rel="alternate"]',
            			         'link[rel="shortlink"]',
								'link[id*="google-fonts"]',
                                'style[id*="nayla-body-styles"]'
            ].join(',');
        $(response).remove();

        $('head').find(headTags).remove();
        $newPageHead.find(headTags).appendTo('head');


        if ($('body').hasClass('smooth-scroll')) {

            let aliothSmoother = ScrollSmoother.get();
            aliothSmoother.scrollTo(0, false);
            window.scrollTo(0, 0);

        } else {

            window.scrollTo(0, 0);
        }

        gsap.set('#page', {
            clearProps: 'all'
        })

        $('body').attr('class', bodyClasses);


        if (switchedDark == true) {
            $('body').addClass('dark')
            $('body').removeClass('light')
        }

        if (switchedLight == true) {
            
            $('body').removeClass('dark')
            $('body').addClass('light')
        }

        naylaSmoother == true ? $('body').addClass('smooth-scroll') : '';

        $('body').attr('style', bodyStyles);

        $('.site-header').attr('class', headerClasses);
        
        if (!$('.site-header').hasClass('blend')) {
            
                    if (switchedDark == true) {

            headerLight = true;
            headerDark = false;

            $('.site-header').removeClass('dark')
            $('.site-header').addClass('light')

        } else if (switchedLight == true) {
            
               headerLight = false;
            headerDark = true;

            $('.site-header').removeClass('light')
            $('.site-header').addClass('dark')

        }
            
            
        }



        let Alltrigger = ScrollTrigger.getAll()

        for (let i = 0; i < Alltrigger.length; i++) {
            Alltrigger[i].kill(true)
        }

        gsap.set(siteHeader, {
            clearProps: 'all'
        })

    });

    barba.hooks.after((data) => {

        $('html').removeClass('loading')
        enableScroll();



        naylaTextAnims();
        naylaTextWrapper();
        naylaGeneralAnims($('main .has-anim'));

        naylaListAnimations();
        naylaImageAnims()
        naylaParallaxImages();

        initShowcases();
        initPageElements();
        naylaSections();
        initPages();
        naylaVideo($('#primary').find('.nayla-video'));

        ScrollTrigger.refresh(true);
        naylaMouseCursor(false);

        setTimeout(function () {

            let siteHeader = $('.site-header'),
                stickyTargets;

            ScrollTrigger.refresh()

            if (siteHeader.find('.hide-sticky').length) {

                stickyTargets = siteHeader.find('.hide-sticky');
            }

            siteHeader.removeClass('sticked');

            gsap.set([siteHeader, stickyTargets, siteHeader.children('div'), siteHeader.find('.site-logo'), siteHeader.find('.sticky-logo')], {
                clearProps: 'all'
            });


            naylaHeader();
            ScrollTrigger.refresh(true)


        }, 200)



    });


    $(document).ready(function () {

        $.getJSON('http://localhost/nayla-last/package.json', function (jd) {
            //            console.log(jd.colors.mainColor)
        });

    });




}(jQuery));
