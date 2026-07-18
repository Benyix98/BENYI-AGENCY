// ============================================================
//  BENIA AGENCY — Chatbot conectado a GPT via /api/chat
// ============================================================

(function () {
  "use strict";

  // ─── ESTADO ───────────────────────────────────────────────────
  let isOpen = false;
  let isTyping = false;
  const conversationHistory = [];

  // ─── GPT API ──────────────────────────────────────────────────
  async function fetchGPTReply(userText) {
    conversationHistory.push({ role: 'user', content: userText });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      const reply = data.reply || 'Lo siento, ha ocurrido un error. Inténtalo de nuevo.';
      conversationHistory.push({ role: 'assistant', content: reply });
      return reply;
    } catch {
      conversationHistory.pop();
      return 'Ha ocurrido un error de conexión. Por favor, inténtalo de nuevo en unos segundos.';
    }
  }

  // ─── DOM HELPERS ──────────────────────────────────────────────
  function createMarkup(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  function appendMessage(role, text, animate = true) {
    const messages = document.getElementById("benia-chat-messages");
    const wrapper = document.createElement("div");
    wrapper.className = `benia-msg benia-msg-${role}${animate ? " benia-msg-enter" : ""}`;

    const bubble = document.createElement("div");
    bubble.className = "benia-bubble";
    bubble.innerHTML = createMarkup(text);

    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
    return wrapper;
  }

  function showTyping() {
    isTyping = true;
    const messages = document.getElementById("benia-chat-messages");
    const wrapper = document.createElement("div");
    wrapper.className = "benia-msg benia-msg-bot benia-msg-enter";
    wrapper.id = "benia-typing-indicator";
    wrapper.innerHTML = `<div class="benia-bubble benia-typing-bubble">
      <span class="benia-dot"></span>
      <span class="benia-dot"></span>
      <span class="benia-dot"></span>
    </div>`;
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById("benia-typing-indicator");
    if (el) el.remove();
    isTyping = false;
  }

  // ─── EVENTO ENVIAR ────────────────────────────────────────────
  async function handleSend(text) {
    const input = document.getElementById("benia-chat-input");
    const userText = text || input.value.trim();
    if (!userText || isTyping) return;

    appendMessage("user", userText);
    if (!text) {
      input.value = "";
      input.style.height = "auto";
    }

    showTyping();
    const reply = await fetchGPTReply(userText);
    hideTyping();
    appendMessage("bot", reply);
  }

  // ─── CONSTRUIR UI ─────────────────────────────────────────────
  function buildChatWidget() {
    const style = document.createElement("style");
    style.textContent = `
      /* ── Botón flotante ── */
      #benia-chat-toggle {
        position: fixed;
        bottom: 28px;
        right: 28px;
        width: 62px;
        height: 62px;
        border-radius: 50%;
        background: linear-gradient(135deg, #16a34a, #22C55E);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        box-shadow: 0 0 24px rgba(34,197,94,0.55), 0 4px 16px rgba(0,0,0,0.5);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        animation: benia-pulse 2.5s ease-in-out infinite;
      }
      #benia-chat-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 0 40px rgba(34,197,94,0.8), 0 6px 24px rgba(0,0,0,0.6);
      }
      #benia-chat-toggle svg { width: 30px; height: 30px; color: #fff; fill: none; }
      @keyframes benia-pulse {
        0%, 100% { box-shadow: 0 0 24px rgba(34,197,94,0.55), 0 4px 16px rgba(0,0,0,0.5); }
        50%       { box-shadow: 0 0 44px rgba(74,222,128,0.85), 0 4px 20px rgba(0,0,0,0.6); }
      }

      /* ── Notificación badge ── */
      #benia-badge {
        position: absolute;
        top: -4px; right: -4px;
        width: 18px; height: 18px;
        background: #f43f5e;
        border-radius: 50%;
        border: 2px solid #000000;
        animation: benia-badge-pop 0.4s ease;
      }
      @keyframes benia-badge-pop {
        0%   { transform: scale(0); }
        70%  { transform: scale(1.2); }
        100% { transform: scale(1); }
      }

      /* ── Ventana del chat ── */
      #benia-chat-window {
        position: fixed;
        bottom: 104px;
        right: 28px;
        width: 380px;
        max-width: calc(100vw - 40px);
        height: 560px;
        max-height: calc(100vh - 130px);
        background: rgba(0,0,0,0.97);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(34,197,94,0.25);
        border-radius: 20px;
        box-shadow: 0 8px 60px rgba(34,197,94,0.18), 0 2px 20px rgba(0,0,0,0.7);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 9998;
        transform: scale(0.92) translateY(20px);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease;
      }
      #benia-chat-window.benia-open {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: all;
      }

      /* ── Header ── */
      #benia-chat-header {
        background: linear-gradient(135deg, rgba(22,163,74,0.9), rgba(34,197,94,0.6));
        padding: 16px 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid rgba(34,197,94,0.2);
        flex-shrink: 0;
      }
      .benia-avatar {
        width: 42px; height: 42px;
        border-radius: 50%;
        background: rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 20px;
        border: 2px solid rgba(255,255,255,0.4);
        flex-shrink: 0;
      }
      .benia-header-info { flex: 1; }
      .benia-header-name {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 700;
        font-size: 15px;
        color: #fff;
        line-height: 1.2;
      }
      .benia-header-status {
        font-size: 12px;
        color: rgba(255,255,255,0.85);
        display: flex; align-items: center; gap: 5px;
      }
      .benia-status-dot {
        width: 7px; height: 7px;
        background: #ffffff;
        border-radius: 50%;
        animation: benia-blink 1.8s ease-in-out infinite;
      }
      @keyframes benia-blink {
        0%,100% { opacity: 1; } 50% { opacity: 0.3; }
      }
      #benia-chat-close {
        background: none; border: none; cursor: pointer;
        color: rgba(255,255,255,0.8); font-size: 22px; line-height: 1;
        padding: 4px; border-radius: 6px; transition: color 0.2s, background 0.2s;
      }
      #benia-chat-close:hover { color: #fff; background: rgba(0,0,0,0.2); }

      /* ── Mensajes ── */
      #benia-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 18px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        scrollbar-width: thin;
        scrollbar-color: rgba(34,197,94,0.35) transparent;
      }
      #benia-chat-messages::-webkit-scrollbar { width: 4px; }
      #benia-chat-messages::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.35); border-radius: 4px; }

      .benia-msg { display: flex; max-width: 100%; }
      .benia-msg-bot { justify-content: flex-start; }
      .benia-msg-user { justify-content: flex-end; }
      .benia-msg-enter { animation: benia-slide-in 0.3s ease forwards; }
      @keyframes benia-slide-in {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .benia-bubble {
        max-width: 85%;
        padding: 11px 15px;
        border-radius: 16px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        line-height: 1.55;
        word-break: break-word;
      }
      .benia-msg-bot .benia-bubble {
        background: rgba(34,197,94,0.08);
        border: 1px solid rgba(34,197,94,0.22);
        color: #E4E4E7;
        border-bottom-left-radius: 4px;
      }
      .benia-msg-user .benia-bubble {
        background: linear-gradient(135deg, #16a34a, #22C55E);
        color: #fff;
        border-bottom-right-radius: 4px;
      }
      .benia-bubble strong { color: #4ade80; }
      .benia-msg-user .benia-bubble strong { color: #fff; }

      /* ── Typing indicator ── */
      .benia-typing-bubble {
        display: flex; align-items: center; gap: 5px;
        padding: 14px 18px !important;
      }
      .benia-dot {
        width: 7px; height: 7px;
        background: rgba(34,197,94,0.8);
        border-radius: 50%;
        animation: benia-bounce 1.2s ease-in-out infinite;
      }
      .benia-dot:nth-child(2) { animation-delay: 0.2s; }
      .benia-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes benia-bounce {
        0%,80%,100% { transform: translateY(0); opacity: 0.5; }
        40% { transform: translateY(-7px); opacity: 1; }
      }

      /* ── Quick replies ── */
      #benia-quick-replies {
        padding: 8px 16px 10px;
        display: flex;
        gap: 7px;
        flex-wrap: wrap;
        border-top: 1px solid rgba(34,197,94,0.12);
        flex-shrink: 0;
      }
      .benia-quick-btn {
        background: rgba(34,197,94,0.08);
        border: 1px solid rgba(34,197,94,0.28);
        color: #4ade80;
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        padding: 5px 11px;
        border-radius: 20px;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s, color 0.2s;
        white-space: nowrap;
      }
      .benia-quick-btn:hover {
        background: rgba(34,197,94,0.22);
        border-color: rgba(34,197,94,0.65);
        color: #fff;
      }

      /* ── Input area ── */
      #benia-chat-footer {
        padding: 12px 14px;
        border-top: 1px solid rgba(34,197,94,0.1);
        display: flex;
        gap: 10px;
        align-items: flex-end;
        background: rgba(0,0,0,0.85);
        flex-shrink: 0;
      }
      #benia-chat-input {
        flex: 1;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(34,197,94,0.25);
        border-radius: 12px;
        padding: 10px 14px;
        color: #E4E4E7;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        resize: none;
        outline: none;
        min-height: 42px;
        max-height: 100px;
        line-height: 1.4;
        transition: border-color 0.2s;
        overflow-y: auto;
      }
      #benia-chat-input::placeholder { color: rgba(255,255,255,0.3); }
      #benia-chat-input:focus { border-color: rgba(34,197,94,0.65); box-shadow: 0 0 12px rgba(34,197,94,0.12); }
      #benia-send-btn {
        width: 42px; height: 42px;
        border-radius: 50%;
        background: linear-gradient(135deg, #16a34a, #22C55E);
        border: none;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 0 12px rgba(34,197,94,0.4);
      }
      #benia-send-btn:hover { transform: scale(1.08); box-shadow: 0 0 22px rgba(34,197,94,0.7); }
      #benia-send-btn svg { width: 18px; height: 18px; fill: #fff; }

      /* ── Responsive ── */
      @media (max-width: 420px) {
        #benia-chat-window { right: 12px; bottom: 90px; width: calc(100vw - 24px); }
        #benia-chat-toggle { right: 16px; bottom: 16px; }
      }
    `;
    document.head.appendChild(style);

    const container = document.createElement("div");
    container.id = "benia-chatbot-root";
    container.innerHTML = `
      <button id="benia-chat-toggle" aria-label="Abrir chat con BENIA">
        <span id="benia-badge"></span>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="1.5" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9V11C5 12.1 5.9 13 7 13H17C18.1 13 19 12.1 19 11V9C19 5.13 15.87 2 12 2Z" stroke-linejoin="round"/>
          <circle cx="9" cy="8.5" r="0.8" fill="white" stroke="none"/>
          <circle cx="15" cy="8.5" r="0.8" fill="white" stroke="none"/>
          <path d="M10 11H14" stroke-linecap="round"/>
          <path d="M5 10H3" stroke-linecap="round"/>
          <path d="M19 10H21" stroke-linecap="round"/>
          <path d="M7 13V15C7 16.1 7.9 17 9 17H15C16.1 17 17 16.1 17 15V13" stroke-linejoin="round"/>
          <path d="M10 20L12 17L14 20" stroke-linejoin="round"/>
        </svg>
      </button>

      <div id="benia-chat-window" role="dialog" aria-label="Chat BENIA AGENCY">
        <div id="benia-chat-header">
          <div class="benia-avatar">🤖</div>
          <div class="benia-header-info">
            <div class="benia-header-name">BENIA Asistente IA</div>
            <div class="benia-header-status"><span class="benia-status-dot"></span>Disponible ahora</div>
          </div>
          <button id="benia-chat-close" aria-label="Cerrar chat">✕</button>
        </div>

        <div id="benia-chat-messages" aria-live="polite"></div>

        <div id="benia-quick-replies">
          <button class="benia-quick-btn" data-msg="¿Qué servicios ofrecéis?">Servicios</button>
          <button class="benia-quick-btn" data-msg="¿Qué es BENIA?">Sobre BENIA</button>
          <button class="benia-quick-btn" data-msg="Quiero agendar una llamada">Agendar llamada</button>
          <button class="benia-quick-btn" data-msg="¿Cuánto cuesta?">Precios</button>
        </div>

        <div id="benia-chat-footer">
          <textarea id="benia-chat-input" placeholder="Escribe tu mensaje…" rows="1" aria-label="Mensaje al chat"></textarea>
          <button id="benia-send-btn" aria-label="Enviar mensaje">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    // ─── EVENTOS ──────────────────────────────────────────────
    const toggle = document.getElementById("benia-chat-toggle");
    const win = document.getElementById("benia-chat-window");
    const closeBtn = document.getElementById("benia-chat-close");
    const sendBtn = document.getElementById("benia-send-btn");
    const inputEl = document.getElementById("benia-chat-input");
    const badge = document.getElementById("benia-badge");

    function openChat() {
      isOpen = true;
      win.classList.add("benia-open");
      badge.style.display = "none";
      setTimeout(() => inputEl.focus(), 300);
    }

    function closeChat() {
      isOpen = false;
      win.classList.remove("benia-open");
    }

    toggle.addEventListener("click", () => (isOpen ? closeChat() : openChat()));
    closeBtn.addEventListener("click", closeChat);
    sendBtn.addEventListener("click", () => handleSend());

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    inputEl.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 100) + "px";
    });

    document.querySelectorAll(".benia-quick-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (isTyping) return;
        handleSend(btn.dataset.msg);
      });
    });

    // ─── MENSAJE INICIAL ──────────────────────────────────────
    setTimeout(() => {
      appendMessage(
        "bot",
        "¡Hola! 👋 Soy el asistente virtual de **BENIA AGENCY**, especialistas en automatizaciones e inteligencia artificial.\n\n¿En qué puedo ayudarte hoy? Pregúntame sobre nuestros servicios, precios o agenda una llamada gratuita.",
        false
      );
      if (!isOpen) badge.style.display = "block";
    }, 800);
  }

  // ─── INICIALIZACIÓN ───────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildChatWidget);
  } else {
    buildChatWidget();
  }
})();
