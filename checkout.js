document.addEventListener('DOMContentLoaded', () => {
    const serviceSelector = document.getElementById('service-selector');
    const selectedServiceName = document.getElementById('selected-service-name');
    const subtotalAmount = document.getElementById('subtotal-amount');
    const totalAmount = document.getElementById('total-amount');

    // Elementos de secciones y pasos
    const checkoutPaymentSection = document.getElementById('checkout-payment-section');
    const checkoutSuccessSection = document.getElementById('checkout-success-section');
    const step1Indicator = document.getElementById('step-1-indicator');
    const step2Indicator = document.getElementById('step-2-indicator');
    const stepConnector = document.getElementById('step-connector');

    // Mapeo de precios e información del servicio para fallback rápido
    const servicesData = {
        'automatizacion': { name: 'Automatizaciones de IA', price: '350.00' },
        'landings': { name: 'Landings Inteligentes', price: '200.00' },
        'soluciones-premium': { name: 'Solución de Problemas', price: '100.00' },
        'mentorias-1h': { name: 'Mentoría Especializada (1 Hora)', price: '65.00' },
        'mentorias-2h': { name: 'Mentoría Especializada (2 Horas)', price: '125.00' },
        'mentorias-3h': { name: 'Mentoría Especializada (3 Horas)', price: '170.00' }
    };

    let currentTotalPayable = 350.00;

    // --- 1. Inicialización y Lectura de Parámetros URL ---
    function initCheckout() {
        const urlParams = new URLSearchParams(window.location.search);
        const serviceParam = urlParams.get('service');

        if (serviceParam) {
            // Mapear mentorias general al pack predeterminado de 1 hora
            const targetService = serviceParam === 'mentorias' ? 'mentorias-1h' : serviceParam;
            if (servicesData[targetService]) {
                serviceSelector.value = targetService;
            }
        }
        
        setupMaintenanceOptinListener();
        
        updateSummaryDisplay();
        initStripe();
        setupPaymentButton();
        serviceSelector.addEventListener('change', resetPaymentElement);
        const _maintCb = document.getElementById('maintenance-checkbox');
        if (_maintCb) _maintCb.addEventListener('change', resetPaymentElement);
    }

    // --- 1.2. Configurar Checkbox de Opción de Mantenimiento ---
    function setupMaintenanceOptinListener() {
        const optinContainer = document.getElementById('maintenance-optin-container');
        const optinCheckbox = document.getElementById('maintenance-checkbox');
        
        if (optinContainer && optinCheckbox) {
            // Permitir hacer clic en toda la tarjeta para alternar el checkbox
            optinContainer.addEventListener('click', (e) => {
                if (e.target !== optinCheckbox && e.target.tagName !== 'LABEL' && e.target.id !== 'maintenance-optin-title' && e.target.id !== 'maintenance-optin-desc') {
                    optinCheckbox.checked = !optinCheckbox.checked;
                    optinCheckbox.dispatchEvent(new Event('change'));
                }
            });
            
            optinCheckbox.addEventListener('change', () => {
                updateSummaryDisplay();
                // Actualizar los estilos visuales de la tarjeta según su estado
                if (optinCheckbox.checked) {
                    optinContainer.style.borderColor = 'rgba(20, 241, 149, 0.4)';
                    optinContainer.style.background = 'rgba(20, 241, 149, 0.04)';
                } else {
                    optinContainer.style.borderColor = 'var(--border-glass)';
                    optinContainer.style.background = 'rgba(255, 255, 255, 0.01)';
                }
            });
        }
    }

    // --- Mapeo de descripciones estáticas para la tarjeta visual del pedido ---
    const staticCardDescriptions = {
        'automatizacion': {
            subtitle: 'Workflows autónomos con Make/n8n para sincronizar tus sistemas y erradicar tareas repetitivas.',
            period: '+ 30€/mes mant.'
        },
        'landings': {
            subtitle: 'Funnels automatizados de alto impacto con chats IA embebidos y optimización continua de conversión (CRO).',
            period: '+ 20€/mes mant.'
        },
        'soluciones-premium': {
            subtitle: 'Diagnóstico técnico y ejecución experta para desafíos lógicos complejos de automatización y procesamiento.',
            period: 'Pago único'
        },
        'mentorias-1h': {
            subtitle: 'Sesión técnica individual intensiva para transferir el conocimiento clave en IA a tu equipo.',
            period: 'Pago único'
        },
        'mentorias-2h': {
            subtitle: 'Sesión doble intensiva técnica e individual para acelerar los flujos de IA de tu negocio.',
            period: 'Pago único'
        },
        'mentorias-3h': {
            subtitle: 'Sesiones técnica intensivas individuales completas con soporte extendido para dominio de IA.',
            period: 'Pago único'
        }
    };

    // --- 2. Actualizar Interfaz del Resumen de Compra ---
    function updateSummaryDisplay() {
        const selectedOption = serviceSelector.options[serviceSelector.selectedIndex];
        if (!selectedOption) return;
        const price = selectedOption.getAttribute('data-price');
        const name = selectedOption.getAttribute('data-name');
        const serviceValue = serviceSelector.value;
        
        let calculatedTotal = parseFloat(price);

        selectedServiceName.textContent = name;
        subtotalAmount.textContent = `${parseFloat(price).toFixed(2).replace('.', ',')} €`;
        
        // Actualizar tarjeta estática del servicio seleccionado
        const staticTitle = document.getElementById('static-service-title');
        const staticSubtitle = document.getElementById('static-service-subtitle');
        const staticPrice = document.getElementById('static-service-price');
        const staticPeriod = document.getElementById('static-service-period');
        
        if (staticTitle) staticTitle.textContent = name;
        if (staticPrice) staticPrice.textContent = `${parseFloat(price).toFixed(0)} €`;
        
        const descData = staticCardDescriptions[serviceValue];
        if (descData) {
            if (staticSubtitle) staticSubtitle.textContent = descData.subtitle;
            if (staticPeriod) staticPeriod.textContent = descData.period;
        }
        
        // Controlar checkbox de contratación y fila de mantenimiento dinámicamente
        const optinContainer = document.getElementById('maintenance-optin-container');
        const optinCheckbox = document.getElementById('maintenance-checkbox');
        const optinTitle = document.getElementById('maintenance-optin-title');
        const optinDesc = document.getElementById('maintenance-optin-desc');
        
        const maintenanceRow = document.getElementById('maintenance-row');
        const maintenanceAmount = document.getElementById('maintenance-amount');
        
        // Elementos de la columna derecha para el calendario de facturación
        const scheduleContainer = document.getElementById('subscription-payment-schedule');
        const scheduleInitial = document.getElementById('schedule-initial-charge');
        const scheduleRecurring = document.getElementById('schedule-recurring-charge');
        
        if (serviceValue === 'automatizacion' || serviceValue === 'landings') {
            if (optinContainer) optinContainer.style.display = 'flex';
            
            // Rellenar textos del opt-in
            if (serviceValue === 'automatizacion') {
                if (optinTitle) optinTitle.textContent = 'Contratar Mantenimiento de la IA';
                if (optinDesc) optinDesc.textContent = '+ 30,00 € al mes';
            } else {
                if (optinTitle) optinTitle.textContent = 'Contratar Mantenimiento de Página Web';
                if (optinDesc) optinDesc.textContent = '+ 20,00 € al mes';
            }
            
            // Sincronizar fila de mantenimiento según checkbox
            if (optinCheckbox && optinCheckbox.checked) {
                const maintFeeVal = serviceValue === 'automatizacion' ? 30.00 : 20.00;
                const maintFeeStr = serviceValue === 'automatizacion' ? '+ 30,00 €/mes' : '+ 20,00 €/mes';
                
                // Sumar el primer mes de mantenimiento al total a cobrar hoy
                calculatedTotal += maintFeeVal;
                
                if (maintenanceRow) maintenanceRow.style.display = 'flex';
                if (maintenanceAmount) {
                    maintenanceAmount.textContent = maintFeeStr;
                }
                if (staticPeriod && descData) staticPeriod.textContent = descData.period;
                
                // Mostrar el calendario de facturación en la pasarela de pago (columna derecha)
                if (scheduleContainer) scheduleContainer.style.display = 'flex';
                if (scheduleInitial) scheduleInitial.textContent = `${calculatedTotal.toFixed(2).replace('.', ',')} €`;
                if (scheduleRecurring) scheduleRecurring.textContent = maintFeeStr;
            } else {
                if (maintenanceRow) maintenanceRow.style.display = 'none';
                if (staticPeriod) staticPeriod.textContent = 'Pago único (sin mant.)';
                
                // Ocultar calendario de facturación si no está contratado
                if (scheduleContainer) scheduleContainer.style.display = 'none';
            }
        } else {
            // Ocultar todo el flujo de mantenimiento para servicios sin cuota mensual
            if (optinContainer) optinContainer.style.display = 'none';
            if (maintenanceRow) maintenanceRow.style.display = 'none';
            if (scheduleContainer) scheduleContainer.style.display = 'none';
        }
        
        // Guardar el total calculado final en la variable global para la pasarela de pago
        currentTotalPayable = calculatedTotal;
        
        totalAmount.textContent = `${calculatedTotal.toFixed(2).replace('.', ',')} €`;
    }

    // Escuchar cambios en la selección de servicio
    serviceSelector.addEventListener('change', updateSummaryDisplay);

    // --- Stripe Payment Element ---
    let stripe = null;
    let elements = null;
    let paymentMounted = false;
    const CHECKOUT_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    async function initStripe() {
        try {
            const resp = await fetch('/api/checkout/config');
            const { publishableKey } = await resp.json();
            if (publishableKey && typeof Stripe !== 'undefined') {
                stripe = Stripe(publishableKey);
            } else {
                console.error('Stripe no disponible (sin publishableKey o SDK no cargado).');
            }
        } catch (err) {
            console.error('No se pudo inicializar Stripe:', err);
        }
    }

    function showPaymentError(msg) {
        const box = document.getElementById('payment-error');
        if (box) box.textContent = msg || '';
    }

    // maintenance cuenta solo si su fila está visible (servicio con cuota) y el checkbox está marcado.
    function readSelection() {
        const serviceId = serviceSelector.value;
        const cb = document.getElementById('maintenance-checkbox');
        const row = document.getElementById('maintenance-row');
        const maintenanceApplies = !!(row && row.style.display !== 'none');
        const maintenance = !!(cb && cb.checked && maintenanceApplies);
        return { serviceId, maintenance };
    }

    // Si cambia servicio o mantenimiento, el importe cambia y el clientSecret
    // anterior queda obsoleto: desmontamos el Payment Element y volvemos al paso 1.
    function resetPaymentElement() {
        if (!paymentMounted) return;
        const container = document.getElementById('payment-element');
        if (container) container.innerHTML = '';
        elements = null;
        paymentMounted = false;
        const txt = document.getElementById('pay-button-text');
        if (txt) txt.textContent = 'Continuar al pago';
        showPaymentError('');
    }

    // Paso 1: valida datos, pide el clientSecret al backend y monta el Payment Element.
    async function startPayment() {
        showPaymentError('');
        const name = document.getElementById('buyer-name').value.trim();
        const email = document.getElementById('buyer-email').value.trim();
        if (!name || !email) { showPaymentError('Introduce tu nombre y tu email.'); return; }
        if (!CHECKOUT_EMAIL_RE.test(email)) { showPaymentError('El email no es válido.'); return; }
        if (!stripe) { showPaymentError('El sistema de pago no está disponible. Recarga la página.'); return; }

        const { serviceId, maintenance } = readSelection();
        let res;
        try {
            res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceId, maintenance, name, email }),
            });
        } catch (err) {
            showPaymentError('No se pudo conectar con el servidor. Inténtalo de nuevo.'); return;
        }
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showPaymentError(data.error || 'No se pudo iniciar el pago.'); return;
        }
        const { clientSecret } = await res.json();
        elements = stripe.elements({ clientSecret, appearance: { theme: 'night' } });
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
        paymentMounted = true;
        const txt = document.getElementById('pay-button-text');
        if (txt) txt.textContent = 'Pagar ahora';
    }

    // Paso 2: confirma el pago sin salir de la página; en éxito reutiliza el
    // flujo de éxito existente (transición + confetti + Calendly prerelleno).
    async function confirmPayment() {
        const name = document.getElementById('buyer-name').value.trim();
        const email = document.getElementById('buyer-email').value.trim();
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });
        if (error) {
            showPaymentError(error.message || 'El pago no se pudo completar.'); return;
        }
        if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
            handleSuccessfulPayment({
                id: paymentIntent.id,
                payer: { name: { given_name: name, surname: '' }, email_address: email },
            });
        }
    }

    function setupPaymentButton() {
        const btn = document.getElementById('submit-payment');
        if (!btn) return;
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const txt = document.getElementById('pay-button-text');
            const spin = document.getElementById('pay-spinner');
            btn.disabled = true;
            if (txt) txt.style.display = 'none';
            if (spin) spin.style.display = 'inline';
            try {
                if (!paymentMounted) { await startPayment(); }
                else { await confirmPayment(); }
            } finally {
                btn.disabled = false;
                if (txt) txt.style.display = 'inline';
                if (spin) spin.style.display = 'none';
            }
        });
    }

    // --- 5. URL de Calendly de Destino ---
    function getCalendlyUrl() {
        return 'https://calendly.com/livefordea4/new-meeting';
    }

    // --- 6. Manejo de Pago Exitoso, Transiciones y Calendly ---
    function handleSuccessfulPayment(details) {
        // 1. Extraer datos del comprador entregados por Stripe
        const payerGivenName = details.payer.name.given_name || '';
        const payerSurname = details.payer.name.surname || '';
        const buyerName = `${payerGivenName} ${payerSurname}`.trim();
        const buyerEmail = details.payer.email_address || '';

        // 2. Transición visual elegante de checkout a éxito
        checkoutPaymentSection.style.opacity = '0';
        
        setTimeout(() => {
            // Intercambiar pantallas
            checkoutPaymentSection.style.display = 'none';
            checkoutSuccessSection.style.display = 'block';
            checkoutSuccessSection.style.opacity = '0';
            
            // Fade-in suave de la pantalla de éxito
            setTimeout(() => {
                checkoutSuccessSection.style.opacity = '1';
                checkoutSuccessSection.style.transition = 'opacity 0.8s ease-in-out';
                
                // Actualizar los indicadores de paso superior
                step1Indicator.classList.remove('active');
                step1Indicator.classList.add('completed');
                stepConnector.classList.add('completed');
                step2Indicator.classList.add('active');
                
                // Lanzar celebración con confetti
                triggerConfettiCelebration();

                // Inicializar Calendly Inline pre-rellenando datos
                embedCalendlyInline(buyerName, buyerEmail);
            }, 50);
        }, 500);

        // Guardar respaldo local de la transacción por seguridad en el navegador del cliente
        const backupData = {
            orderId: details.id,
            buyerName: buyerName,
            buyerEmail: buyerEmail,
            service: serviceSelector.value,
            amount: totalAmount.textContent,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('benia_latest_checkout', JSON.stringify(backupData));
    }

    // --- 7. Efecto de Confetti de Celebración ---
    function triggerConfettiCelebration() {
        if (typeof confetti !== 'undefined') {
            const duration = 4 * 1000;
            const end = Date.now() + duration;

            (function frame() {
                // Confetti desde la izquierda
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 },
                    colors: ['#14F195', '#0DF273', '#ffffff', '#000000']
                });
                // Confetti desde la derecha
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 },
                    colors: ['#14F195', '#0DF273', '#ffffff', '#000000']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }

    // --- 8. Incrustar e Inicializar Calendly Inline con Pre-relleno ---
    function embedCalendlyInline(name, email) {
        const calendlyUrl = getCalendlyUrl();
        const targetContainer = document.getElementById('calendly-inline-widget-target');
        
        // Limpiar spinner y cargar Calendly Inline Widget
        targetContainer.innerHTML = '';

        if (typeof Calendly !== 'undefined') {
            // El SDK de Calendly está cargado, inicializamos widget inline
            Calendly.initInlineWidget({
                url: calendlyUrl,
                parentElement: targetContainer,
                prefill: {
                    name: name,
                    email: email
                },
                utm: {
                    utmSource: 'StripeCheckout',
                    utmMedium: 'AutoEmbed',
                    utmCampaign: 'FirstMeeting'
                }
            });
        } else {
            // Fallback en caso de que Calendly falle en cargar (ej. bloqueadores de scripts)
            targetContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; height: 100%; justify-content: center;">
                    <span style="font-size: 3rem;">📅</span>
                    <h3 style="color: white; font-size: 1.25rem;">Por favor, agenda tu llamada manualmente</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 500px;">
                        Detectamos restricciones en la carga directa del calendario. Haz clic en el botón de abajo para reservar tu llamada estratégica de forma directa e independiente.
                    </p>
                    <a href="${calendlyUrl}?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}" target="_blank" class="btn-primary btn-large">
                        <span>Abrir Calendario de Reservas</span>
                    </a>
                </div>
            `;
        }
    }

    // --- Global Mouse Cyber Glow Effect ---
    const globalGlow = document.getElementById('global-mouse-glow');
    if (globalGlow) {
        window.addEventListener('mousemove', (e) => {
            globalGlow.style.setProperty('--mouse-x', `${e.clientX}px`);
            globalGlow.style.setProperty('--mouse-y', `${e.clientY}px`);
        });
    }

    // --- Iniciar Ejecución ---
    initCheckout();
});
