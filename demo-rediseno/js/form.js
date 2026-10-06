// Formulario de contacto: validación en el navegador y envío.
import { DEMO } from './content.js';

// Mensajes de validación (texto nuevo: la web actual usa los avisos nativos del navegador).
const MESSAGES = {
    required: 'Este campo es obligatorio.',
    email: 'Introduce un email válido.',
    phone: 'Introduce un teléfono válido (de 9 a 15 dígitos).',
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rules = {
    company: (v) => (v.trim() ? '' : MESSAGES.required),
    email: (v) => (!v.trim() ? MESSAGES.required : EMAIL_RE.test(v.trim()) ? '' : MESSAGES.email),
    phone: (v) => {
        if (!v.trim()) return MESSAGES.required;
        const digits = v.replace(/\D/g, '').length;
        return /^[\s\-.()+0-9]+$/.test(v) && digits >= 9 && digits <= 15 ? '' : MESSAGES.phone;
    },
    goal: (v) => (v.trim() ? '' : MESSAGES.required),
};

/** Único punto de conexión con el servidor. Mismo cuerpo que envía la web actual a /api/leads. */
async function sendLead(body) {
    if (DEMO) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return;
    }
    const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        // El backend devuelve { error } con el motivo (ej. "Teléfono no válido").
        const data = await res.json().catch(() => ({}));
        const serverErr = new Error(data.error || '');
        serverErr.fromServer = true;
        throw serverErr;
    }
}

export function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const submitBtn = form.querySelector('#form-submit-btn');
    const privacy = form.querySelector('#privacy');
    const inputs = Object.keys(rules).map((id) => form.querySelector(`#${id}`));

    const errorOf = (input) => rules[input.id](input.value);
    const show = (input) => {
        const message = errorOf(input);
        const box = form.querySelector(`#${input.id}-error`);
        input.setAttribute('aria-invalid', String(Boolean(message)));
        if (message) input.setAttribute('aria-describedby', box.id);
        else input.removeAttribute('aria-describedby');
        box.textContent = message;
        box.hidden = !message;
        return !message;
    };
    const refresh = () => { submitBtn.disabled = !(inputs.every((i) => !errorOf(i)) && privacy.checked); };

    inputs.forEach((input) => {
        input.addEventListener('blur', () => show(input));
        input.addEventListener('input', () => {
            if (input.getAttribute('aria-invalid') === 'true') show(input);
            refresh();
        });
    });
    privacy.addEventListener('change', refresh);
    refresh();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstInvalid = inputs.filter((input) => !show(input))[0];
        if (firstInvalid) { firstInvalid.focus(); return; }
        if (!privacy.checked) { privacy.focus(); return; }

        const originalHtml = submitBtn.innerHTML;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        const body = {
            company: form.querySelector('#company').value,
            email: form.querySelector('#email').value,
            phone: form.querySelector('#phone').value,
            goal: form.querySelector('#goal').value,
            privacy: privacy.checked,
            website: form.querySelector('#hp-website')?.value || '',
        };

        try {
            await sendLead(body);
            form.innerHTML = `
                <div class="form-success" role="status">
                    <div class="big" aria-hidden="true">✅</div>
                    <h3>¡Mensaje enviado!</h3>
                    <p>Hemos recibido tu propuesta. Nos pondremos en contacto contigo muy pronto.</p>
                </div>`;
        } catch (err) {
            const detail = err.fromServer && err.message ? `\n\nMotivo: ${err.message}` : '';
            alert(`Hubo un error al enviar el mensaje. Por favor inténtalo de nuevo.${detail}`);
            submitBtn.innerHTML = originalHtml;
            submitBtn.disabled = false;
        }
    });
}
