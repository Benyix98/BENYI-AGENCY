document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('open');
        });

        // Close mobile drawer when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('open');
            });
        });
    }



    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.hero-content, .section-header, .bento-card, .newsletter-item, .case-card, .about-content, .contact-cta-card, .testimonial-wrapper').forEach(el => {
        el.classList.add('reveal-hidden');
        observer.observe(el);
    });

    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            setTimeout(() => {
                alert('¡Gracias! Hemos recibido tu propuesta. Nos pondremos en contacto contigo pronto.');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // Stats Counter
    const stats = document.querySelectorAll('.metric-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 1 });

    stats.forEach(stat => statsObserver.observe(stat));

    function animateCounter(el, target) {
        let current = 0;
        const duration = 2000;
        const stepTime = Math.abs(Math.floor(duration / target));
        const timer = setInterval(() => {
            current += 1;
            el.textContent = current;
            if (current == target) {
                clearInterval(timer);
            }
        }, stepTime);
    }



    // --- Calendly & Modal Logic ---
    const serviceModal = document.getElementById('service-modal');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    const serviceContent = {
        'automatizacion': {
            title: 'Automatizaciones de IA',
            price: '350€ Base (variable por tokens) + 30€/mes Mantenimiento',
            achievements: [
                'Reducción de errores operativos en un 95%.',
                'Disponibilidad total 24/7 sin supervisión humana.',
                'Sincronización instantánea entre +10 herramientas (CRM, ERP, Web).'
            ],
            savings: {
                time: '+40 horas semanales',
                capital: 'Sueldo junior por cada 3 procesos automatizados'
            },
            cta: '¿Listo para liberar a tu equipo de la carga operativa?'
        },
        'landings': {
            title: 'Landings Inteligentes',
            price: '200€ + 20€/mes Mantenimiento',
            achievements: [
                'Tasa de captura de leads duplicada mediante IA.',
                'Cualificación automática de prospectos en tiempo real.',
                'Personalización dinámica según el comportamiento del usuario.'
            ],
            savings: {
                time: '70% menos tiempo en prospección',
                capital: 'Ahorro de 2 sueldos SDR en triaje inicial'
            },
            cta: 'Maximiza tus conversiones con una web que piensa por ti.'
        },
        'soluciones-premium': {
            title: 'Soluciones de Problemas',
            price: '100€ (Pago Único)',
            achievements: [
                'Toma de decisiones basada en datos en tiempo real.',
                'Ejecución coordinada de tareas mediante sistemas multi-agente.',
                'Optimización algorítmica de inventarios y logística.'
            ],
            savings: {
                time: 'Reducción drástica en tiempos de gestión operativa',
                capital: '60% de ahorro en capital de gestión indirecta'
            },
            cta: 'Resolvamos los desafíos más complejos de tu negocio.'
        },
        'mentorias': {
            title: 'Mentorías Especializadas',
            price: 'Pack 1h: 65€ | Pack 2h: 125€ | Pack 3h: 170€',
            achievements: [
                'Autonomía total del equipo interno en herramientas IA.',
                'Implementación de cultura de automatización escalable.',
                'Dominio de prompts avanzados y flujos de trabajo eficientes.'
            ],
            savings: {
                time: 'Aprendizaje acelerado (meses reducidos a semanas)',
                capital: 'Eliminación de dependencia de agencias externas'
            },
            cta: 'Crea un equipo imparable con el dominio de la IA.'
        }
    };

    /**
     * Calcula la URL de Calendly basada en la rotación semanal de turnos.
     * Semana del 9 de marzo de 2026 = TARDES.
     */
    function getCalendlyUrl() {
        // Fecha base: Lunes 9 de marzo de 2026 (Semana de Tardes)
        const baseDate = new Date('2026-03-09T00:00:00Z');
        const now = new Date();
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const diffMs = now - baseDate;
        const weeksElapsed = Math.floor(diffMs / msPerWeek);
        const isMornings = Math.abs(weeksElapsed) % 2 !== 0;

        if (isMornings) {
            return 'https://calendly.com/livefordea4/30min'; // Mañanas
        } else {
            return 'https://calendly.com/livefordea4/new-meeting'; // Tardes
        }
    }

    function openCalendly(e) {
        if (e) e.preventDefault();
        const url = getCalendlyUrl();
        if (typeof Calendly !== 'undefined') {
            Calendly.initPopupWidget({ url: url });
        } else {
            window.open(url, '_blank');
        }
    }

    // Exponer globalmente
    window.openCalendly = openCalendly;

    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevenir abrir modal si es la tarjeta de CTA
            if (card.classList.contains('cta-bento-card')) return;
            
            const serviceId = card.getAttribute('data-service');
            if (!serviceId) return;
            const content = serviceContent[serviceId];
            if (content) {
                openServiceModal(content, serviceId);
            }
        });
    });

    function openServiceModal(content, serviceId) {
        modalBody.innerHTML = `
            <div class="modal-hero" style="margin-bottom: 2rem; text-align: center;">
                <h2 class="modal-title" style="margin-bottom: 0.5rem;">${content.title}</h2>
                <div class="modal-price-badge" style="display: inline-block; background: rgba(20, 241, 149, 0.08); border: 1px solid rgba(20, 241, 149, 0.3); color: var(--primary-500); padding: 0.5rem 1.25rem; border-radius: 100px; font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 600; letter-spacing: 0.03em; margin-top: 0.5rem;">
                    Inversión: ${content.price}
                </div>
            </div>
            <div class="modal-grid">
                <div class="modal-column">
                    <h3 class="modal-section-title">Lo que se consigue</h3>
                    <ul class="detail-list">
                        ${content.achievements.map(a => `
                            <li class="detail-item">
                                <span class="detail-icon">✓</span>
                                <span>${a}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="modal-column">
                    <h3 class="modal-section-title">Ahorro Estimado</h3>
                    <div class="savings-card">
                        <span class="savings-val">${content.savings.time}</span>
                        <p class="savings-desc">Ahorro de tiempo estimado respecto a gestión humana.</p>
                    </div>
                    <div class="savings-card" style="margin-top: 1.5rem;">
                        <span class="savings-val">${content.savings.capital}</span>
                        <p class="savings-desc">Optimización de capital y ROI directo sobre inversión.</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="display: flex; flex-direction: column; gap: 1rem; align-items: center; width: 100%;">
                <p class="modal-cta-text">${content.cta}</p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; width: 100%;">
                    <a href="#" class="btn-secondary btn-large" onclick="openCalendly(event); closeServiceModal();" style="padding: 0.85rem 1.75rem; border-radius: 100px;">
                        Diagnóstico Gratuito
                    </a>
                    <a href="checkout.html?service=${serviceId}" class="btn-primary btn-large" style="padding: 0.85rem 1.75rem; border-radius: 100px;">
                        Contratar Ahora (Pago Seguro)
                    </a>
                </div>
            </div>
        `;
        serviceModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }

    function closeServiceModal() {
        serviceModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closeServiceModal);
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.addEventListener('click', closeServiceModal);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeServiceModal();
    });

    // --- Mouse Tracking Cyber Glow (Local Hero & Global Page-wide) ---
    const heroSection = document.querySelector('.hero-section');
    const globalGlow = document.getElementById('global-mouse-glow');
    
    window.addEventListener('mousemove', (e) => {
        // 1. Efecto local para el grid de fondo del Hero
        if (heroSection) {
            const rect = heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            heroSection.style.setProperty('--mouse-x', `${x}px`);
            heroSection.style.setProperty('--mouse-y', `${y}px`);
        }
        
        // 2. Efecto global fijo de fondo para toda la página
        if (globalGlow) {
            globalGlow.style.setProperty('--mouse-x', `${e.clientX}px`);
            globalGlow.style.setProperty('--mouse-y', `${e.clientY}px`);
        }
    });


});
