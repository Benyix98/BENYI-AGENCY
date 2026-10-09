// Carrusel de servicios: botones, paginación, teclado y gesto táctil. Sin autoplay.
export function initCarousel(root) {
    if (!root) return;
    const slides = [...root.querySelectorAll('.slide')];
    const dots = [...root.querySelectorAll('.carousel-dot')];
    const status = root.querySelector('.carousel-status');
    if (!slides.length) return;
    let index = 0;

    const go = (next, announce = true) => {
        const total = slides.length;
        const target = (next + total) % total;
        const dir = next >= index ? 1 : -1;
        // El que entra se coloca sin animación en el lado hacia el que se avanza; el que sale se va al contrario.
        const incoming = slides[target];
        if (target !== index) {
            incoming.style.transition = 'none';
            incoming.style.setProperty('--dir', dir);
            void incoming.offsetWidth;
            incoming.style.transition = '';
        }
        slides.forEach((slide, i) => {
            const active = i === target;
            if (!active) slide.style.setProperty('--dir', -dir);
            slide.classList.toggle('is-active', active);
            slide.toggleAttribute('inert', !active);
            slide.setAttribute('aria-hidden', String(!active));
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === target);
            dot.setAttribute('aria-current', i === target ? 'true' : 'false');
        });
        const changed = target !== index;
        index = target;
        if (announce && status) status.textContent = `Diapositiva ${index + 1} de ${total}`;
        if (changed) root.dispatchEvent(new CustomEvent('carousel:change', { bubbles: true }));
    };

    root.querySelector('.carousel-prev')?.addEventListener('click', () => go(index - 1));
    root.querySelector('.carousel-next')?.addEventListener('click', () => go(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));

    root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    });

    let startX = null;
    let startY = 0;
    const viewport = root.querySelector('.carousel-viewport');
    viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        startX = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? index + 1 : index - 1);
    }, { passive: true });

    go(0, false);
}
