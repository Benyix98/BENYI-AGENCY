// Entrada al hacer scroll, contadores y vídeos que solo se reproducen cuando se ven.
import { reducedMotion } from './motion.js';

export function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (reducedMotion() || !('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('is-in'));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const delay = Number(el.dataset.delay) || 0;
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add('is-in');
            // El retardo solo vale para la entrada: después estorbaría en los hover.
            setTimeout(() => { el.style.transitionDelay = ''; }, delay + 900);
            observer.unobserve(el);
        });
    }, { threshold: 0.15 });
    items.forEach((el) => observer.observe(el));
}

export function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const render = (el, value) => { el.textContent = `${el.dataset.prefix || ''}${value}${el.dataset.suffix || ''}`; };
    if (reducedMotion() || !('IntersectionObserver' in window)) return;

    const run = (el) => {
        const target = Number(el.dataset.count);
        const duration = 1200;
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            render(el, Math.round(target * (1 - Math.pow(1 - t, 3))));
            if (t < 1) requestAnimationFrame(tick);
        };
        render(el, 0);
        requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            run(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.6 });
    counters.forEach((el) => observer.observe(el));
}

export function initVideos() {
    const videos = document.querySelectorAll('video[data-autoplay]');
    if (!videos.length || !('IntersectionObserver' in window)) return;
    if (reducedMotion()) { videos.forEach((v) => { v.controls = true; }); return; }
    // El observador no distingue una diapositiva oculta del carrusel (ocupa el mismo hueco), así que se comprueba aparte.
    const inView = new WeakSet();
    const sync = (v) => {
        if (inView.has(v) && !v.closest('.slide[inert]')) v.play().catch(() => {});
        else v.pause();
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) inView.add(entry.target);
            else inView.delete(entry.target);
            sync(entry.target);
        });
    }, { threshold: 0.4 });
    videos.forEach((v) => observer.observe(v));
    document.addEventListener('carousel:change', () => videos.forEach(sync));
}
