// Carrusel de reseñas: una a la vez; la siguiente entra desde la derecha hasta el centro.
const INTERVAL = 7000;
const SLIDE_MS = 700;

export function initTestimonials(root) {
    if (!root) return;
    const viewport = root.querySelector('.t-viewport');
    const slides = [...root.querySelectorAll('.testimonial')];
    if (!viewport || slides.length < 2) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let timer = null;
    let busy = false;

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Opinión ' + (i + 1) + ' de ' + slides.length);
        dot.addEventListener('click', () => { go(i); restart(); });
        dots.appendChild(dot);
    });
    root.appendChild(dots);
    const dotEls = [...dots.children];

    function go(next) {
        if (next === current || busy) return;
        busy = true;
        const out = slides[current];
        const into = slides[next];
        into.classList.add('is-ready');
        void into.offsetWidth;
        into.classList.remove('is-ready');
        out.classList.remove('is-active');
        out.classList.add('is-leaving');
        into.classList.add('is-active');
        dotEls[current].classList.remove('is-active');
        dotEls[next].classList.add('is-active');
        current = next;
        window.setTimeout(() => {
            out.classList.add('is-ready');
            out.classList.remove('is-leaving');
            void out.offsetWidth;
            out.classList.remove('is-ready');
            busy = false;
        }, reduced.matches ? 0 : SLIDE_MS + 50);
    }

    const next = () => go((current + 1) % slides.length);
    function start() { if (!timer && !reduced.matches) timer = window.setInterval(next, INTERVAL); }
    function stop() { window.clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    reduced.addEventListener('change', () => (reduced.matches ? stop() : start()));

    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())), { threshold: 0.4 }).observe(root);
    } else {
        start();
    }
}
