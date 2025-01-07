// Mobile menu functionality
const burgerMenu = document.querySelector('.burger-menu');
const navLinks = document.querySelector('.nav-links');

function toggleMobileMenu() {
    navLinks.classList.toggle('active');
    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('hidden');
    } else {
        setTimeout(() => {
            navLinks.classList.add('hidden');
        }, 300); // Match this with CSS transition if you add one
    }
}

burgerMenu.addEventListener('click', toggleMobileMenu);

// Close mobile menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            toggleMobileMenu();
        }
    });
});

// Close burger menu on resize if window width exceeds 768px
function closeBurgerMenuOnResize() {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        burgerMenu.classList.remove('active');
    }
}

// Call the functions on window resize
window.addEventListener('resize', () => {
    closeBurgerMenuOnResize();
});

// Call the functions on initial load
closeBurgerMenuOnResize();

// Cursor functionality
const cursor = document.querySelector('.cursor');
const links = document.querySelectorAll('a');
const logo = document.querySelector('.btn-slide-logo');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursor.classList.add('link-hover');
    });

    link.addEventListener('mouseleave', () => {
        cursor.classList.remove('link-hover');
    });
});

logo.addEventListener('mouseenter', () => {
    cursor.classList.add('logo-hover');
});

logo.addEventListener('mouseleave', () => {
    cursor.classList.remove('logo-hover');
});

// Lottie Animation Setup
let animation = lottie.loadAnimation({
    container: document.getElementById('lottie-container'),
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: 'stage.json', // Make sure this file exists in your project directory
    rendererSettings: {
        progressiveLoad: true,
        preserveAspectRatio: 'xMidYMid slice',
        clearCanvas: false // Changed to false
    }
});

// Add error handling
animation.addEventListener('error', function (error) {
    console.error('Lottie animation error:', error);
});

// Add load confirmation
animation.addEventListener('DOMLoaded', function () {
    console.log('Lottie animation loaded');
    updateAnimationSize();
});

// Handle responsive scaling
function updateAnimationSize() {
    const container = document.getElementById('lottie-container');
    const wrapper = document.getElementById('lottie-wrapper');
    animation.resize();
}

window.addEventListener('resize', updateAnimationSize);
animation.addEventListener('DOMLoaded', updateAnimationSize);

let totalScrollHeight = document.body.scrollHeight - window.innerHeight;
let isAnimationComplete = false;
let lastScrollPosition = 0;
let scrollTimeout;
let currentFrame = 0;
let targetFrame = 0;
let isScrolling = false;

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function smoothAnimation() {
    if (!isScrolling) {
        currentFrame = lerp(currentFrame, targetFrame, 0.1);
        if (Math.abs(currentFrame - targetFrame) > 0.01) {
            animation.goToAndStop(currentFrame, true);
            requestAnimationFrame(smoothAnimation);
        }
    }
}

let lastScrollY = window.scrollY;
let scrollingDown = true;

const completionFrame = 20; // Set the specific frame number after which the completion text should appear

window.addEventListener('scroll', () => {
    scrollingDown = window.scrollY > lastScrollY;
    lastScrollY = window.scrollY;

    if (!scrollingDown && isAnimationComplete) {
        isAnimationComplete = false;
        document.getElementById('completion-text').style.opacity = '0';
    }

    isScrolling = true;
    clearTimeout(scrollTimeout);

    let scrollProgress = window.scrollY / totalScrollHeight;
    targetFrame = Math.floor(scrollProgress * animation.totalFrames * 2); // Play 2x as fast
    currentFrame = animation.currentFrame;
    animation.goToAndStop(currentFrame, true);

    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        requestAnimationFrame(smoothAnimation);
    }, 50);

    if (scrollingDown && targetFrame >= completionFrame) {
        isAnimationComplete = true;
        document.getElementById('completion-text').style.opacity = '1';
    }
});

animation.addEventListener('DOMLoaded', () => {
    totalScrollHeight = document.body.scrollHeight - window.innerHeight;
});

// Smooth scroll functionality
const scrollIndicator = document.querySelector('.scroll-indicator');
scrollIndicator.querySelector('a').addEventListener('click', function (event) {
    event.preventDefault();

    // Fade out the scroll indicator
    scrollIndicator.style.opacity = '0';
});

// Hide scroll indicator when the user starts scrolling
window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
        scrollIndicator.style.opacity = '0';
    } else {
        scrollIndicator.style.opacity = '1';
    }
});

// Smooth scroll with jQuery animate and Lottie animation update
$('a').click(function () {
    const target = $($(this).attr('href'));
    const targetOffset = target.offset().top;

    $('html, body').animate({
        scrollTop: targetOffset
    }, {
        duration: 2000,
        easing: 'easeInOutExpo',
        step: function (now) {
            let scrollProgress = now / totalScrollHeight;
            targetFrame = Math.floor(scrollProgress * animation.totalFrames * 2);
            animation.goToAndStop(targetFrame, true);
        }
    });

    return false;
});





