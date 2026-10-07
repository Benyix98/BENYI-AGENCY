// ¿Hay que evitar las animaciones? Se respeta la preferencia del sistema ("reducir movimiento").
// Abrir la página con ?motion=1 las fuerza aunque el sistema las tenga desactivadas.
export const reducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && !document.documentElement.classList.contains('force-motion');
