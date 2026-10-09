// Cabecera: estado al hacer scroll, menú móvil y enlace activo según la sección visible.
export function initHeader() {
    const header = document.getElementById('site-header');
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!header || !toggle || !menu) return;

    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // El HTML lo trae con hidden para quien no tenga JS; aquí se oculta con CSS para poder animar la entrada y la salida.
    menu.hidden = false;
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    const setOpen = (open) => {
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        header.classList.toggle('menu-open', open);
        document.body.classList.toggle('no-scroll', open);
    };
    toggle.addEventListener('click', () => setOpen(!isOpen()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });

    const links = [...document.querySelectorAll('.main-nav a[href^="#"]')];
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    if (!('IntersectionObserver' in window)) return;
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((a) => a.classList.remove('is-active'));
            byId.get(entry.target.id)?.classList.add('is-active');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    // Se observan todas las secciones: al entrar en una sin enlace propio (contacto) no queda ninguno marcado.
    document.querySelectorAll('main > section[id]').forEach((section) => spy.observe(section));
}
