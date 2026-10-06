// Conversación animada de la maqueta del hero. En bucle; se detiene fuera de pantalla y con la pestaña oculta.
import { heroChat } from './content.js';
import { reducedMotion } from './motion.js';

const ICONS = { bot: '#i-bot', user: '#i-user' };

function bubble({ from, text }) {
    const row = document.createElement('div');
    row.className = `msg msg-${from}`;
    row.innerHTML = `<span class="msg-avatar"><svg class="icon"><use href="${ICONS[from]}"/></svg></span><p class="bubble"></p>`;
    row.querySelector('.bubble').textContent = text;
    return row;
}

function typingRow() {
    const row = document.createElement('div');
    row.className = 'msg msg-bot';
    row.innerHTML = `<span class="msg-avatar"><svg class="icon"><use href="${ICONS.bot}"/></svg></span><p class="bubble typing"><i></i><i></i><i></i></p>`;
    return row;
}

export function initHeroChat() {
    const box = document.getElementById('hero-chat');
    if (!box) return;

    if (reducedMotion() || !('IntersectionObserver' in window)) {
        heroChat.forEach((m) => box.append(bubble(m)));
        return;
    }

    let run = 0;
    let timer;
    let inView = false;
    const wait = (ms) => new Promise((resolve) => { timer = setTimeout(resolve, ms); });

    async function play() {
        const id = ++run;
        const alive = () => id === run;
        box.classList.remove('is-fading');
        box.innerHTML = '';
        await wait(500);
        for (const message of heroChat) {
            if (!alive()) return;
            if (message.from === 'bot') {
                const typing = typingRow();
                box.append(typing);
                await wait(900);
                typing.remove();
            } else {
                await wait(700);
            }
            if (!alive()) return;
            box.append(bubble(message));
            await wait(1100);
        }
        await wait(4000);
        if (!alive()) return;
        box.classList.add('is-fading');
        await wait(400);
        if (alive()) play();
    }

    const stop = () => { run++; clearTimeout(timer); };
    const sync = () => { stop(); if (inView && !document.hidden) play(); };

    new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
        sync();
    }, { threshold: 0.2 }).observe(box);
    document.addEventListener('visibilitychange', sync);
}
