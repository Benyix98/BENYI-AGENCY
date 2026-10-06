// Detalle de servicio (diálogo) y reserva en Calendly.
import { services } from './content.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * URL de Calendly según la rotación semanal de turnos, igual que en la web actual.
 * Semana del 9 de marzo de 2026 = tardes.
 */
export function getCalendlyUrl() {
    const baseDate = new Date('2026-03-09T00:00:00Z');
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksElapsed = Math.floor((new Date() - baseDate) / msPerWeek);
    const isMornings = Math.abs(weeksElapsed) % 2 !== 0;
    return isMornings
        ? 'https://calendly.com/livefordea4/30min' // Mañanas
        : 'https://calendly.com/livefordea4/new-meeting'; // Tardes
}

export function openCalendly() {
    const url = getCalendlyUrl();
    if (typeof Calendly !== 'undefined') Calendly.initPopupWidget({ url });
    else window.open(url, '_blank', 'noopener');
}

function render(content, serviceId) {
    return `
        <div class="modal-hero">
            <h2 id="modal-title">${esc(content.title)}</h2>
            <div class="modal-price">Inversión: ${esc(content.price)}</div>
        </div>
        <div class="modal-grid">
            <div>
                <h3>Lo que se consigue</h3>
                <ul class="detail-list">
                    ${content.achievements.map((a) => `<li><svg class="icon"><use href="#i-check"/></svg><span>${esc(a)}</span></li>`).join('')}
                </ul>
            </div>
            <div>
                <h3>Ahorro Estimado</h3>
                <div class="savings-card">
                    <span class="savings-val">${esc(content.savings.time)}</span>
                    <p>Ahorro de tiempo estimado respecto a gestión humana.</p>
                </div>
                <div class="savings-card">
                    <span class="savings-val">${esc(content.savings.capital)}</span>
                    <p>Optimización de capital y ROI directo sobre inversión.</p>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <p>${esc(content.cta)}</p>
            <div class="modal-actions">
                <a href="#" class="btn btn-secondary btn-lg" data-calendly>Diagnóstico Gratuito</a>
                <a href="../checkout.html?service=${encodeURIComponent(serviceId)}" class="btn btn-primary btn-lg">Contratar Ahora (Pago Seguro)</a>
            </div>
        </div>`;
}

export function initModal() {
    const dialog = document.getElementById('service-modal');
    const body = document.getElementById('modal-body');
    if (!dialog || !body) return;

    document.addEventListener('click', (e) => {
        const calendly = e.target.closest('[data-calendly]');
        if (calendly) {
            e.preventDefault();
            if (dialog.open) dialog.close();
            openCalendly();
            return;
        }
        const opener = e.target.closest('[data-open-service]');
        if (opener) {
            const id = opener.dataset.openService;
            if (!services[id]) return;
            body.innerHTML = render(services[id], id);
            dialog.showModal();
            dialog.scrollTop = 0;
            return;
        }
        if (e.target.closest('[data-close-modal]')) { dialog.close(); return; }
        // Clic en el fondo oscuro: el evento llega al propio <dialog>, fuera de su caja.
        if (e.target === dialog) {
            const r = dialog.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
        }
    });
}
