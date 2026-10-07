// Asistente flotante. Con DEMO = false habla con /api/chat.
import { DEMO, assistant } from './content.js';

const conversationHistory = [];

/** Único punto de conexión con el servidor. */
export async function sendToAssistant(message) {
    conversationHistory.push({ role: 'user', content: message });
    if (DEMO) {
        await new Promise((resolve) => setTimeout(resolve, 900));
        return assistant.demoReply;
    }
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversationHistory }),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const reply = data.reply || assistant.errorReply;
        conversationHistory.push({ role: 'assistant', content: reply });
        return reply;
    } catch {
        conversationHistory.pop();
        return assistant.connectionError;
    }
}

export function initAssistant() {
    const root = document.getElementById('assistant');
    if (!root) return;
    const toggle = root.querySelector('#assistant-toggle');
    const panel = root.querySelector('#assistant-panel');
    const closeBtn = root.querySelector('#assistant-close');
    const list = root.querySelector('#assistant-messages');
    const quick = root.querySelector('#assistant-quick');
    const form = root.querySelector('#assistant-form');
    const input = root.querySelector('#assistant-input');
    let busy = false;
    let greeted = false;

    const add = (from, content, asHtml = false) => {
        const row = document.createElement('div');
        row.className = `msg msg-${from}`;
        const p = document.createElement('p');
        p.className = 'bubble';
        if (asHtml) p.innerHTML = content; // solo para el saludo, que es un texto fijo propio
        else p.textContent = content;
        row.append(p);
        list.append(row);
        list.scrollTop = list.scrollHeight;
        return row;
    };

    const send = async (text) => {
        const message = text.trim();
        if (!message || busy) return;
        busy = true;
        quick.hidden = true;
        add('user', message);
        const typing = add('bot', '');
        typing.querySelector('.bubble').classList.add('typing');
        typing.querySelector('.bubble').innerHTML = '<i></i><i></i><i></i>';
        const reply = await sendToAssistant(message);
        typing.remove();
        add('bot', reply);
        busy = false;
    };

    const isOpen = () => !panel.hidden;
    const open = () => {
        panel.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Cerrar chat');
        if (!greeted) {
            greeted = true;
            add('bot', assistant.greeting, true);
            assistant.quickReplies.forEach(({ label, msg }) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.textContent = label;
                b.addEventListener('click', () => send(msg));
                quick.append(b);
            });
        }
        input.focus();
    };
    const close = () => {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir chat con BENIA');
        toggle.focus();
    };

    toggle.addEventListener('click', () => (isOpen() ? close() : open()));
    closeBtn.addEventListener('click', close);
    form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); input.value = ''; input.style.height = ''; });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
    });
    input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 96)}px`; });

    // Escape cierra; Tab no sale del panel mientras está abierto.
    panel.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
        if (e.key !== 'Tab') return;
        const focusables = [...panel.querySelectorAll('button, textarea')].filter((el) => !el.closest('[hidden]'));
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
}
