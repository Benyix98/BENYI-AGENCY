// ============================================================
//  BENIA AGENCY — Chatbot Profesional con Base de Conocimiento
// ============================================================

(function () {
  "use strict";

  // ─── BASE DE CONOCIMIENTO ────────────────────────────────────
  const KB = {
    empresa: {
      nombre: "BENIA AGENCY",
      mision:
        "Cerrar la brecha entre empresas tradicionales y la automatización inteligente mediante sistemas autónomos, orquestación de APIs y optimización continua.",
      propuesta:
        "Convertimos negocios manuales en ecosistemas autónomos impulsados por IA que reducen costes, aceleran resultados y escalan ingresos sin ampliar plantilla.",
      experiencia: "Más de 2 años de experiencia en IA aplicada al mundo empresarial.",
      eslogan: "Automatiza el caos. Escala el negocio.",
    },
    servicios: {
      automatizaciones: {
        nombre: "Automatizaciones de IA",
        precio: "350€ Base (variable por tokens) + 30€/mes Mantenimiento",
        ahorroTiempo: "+40 horas semanales",
        ahorroCapital: "Sueldo junior por cada 3 procesos automatizados",
        descripcionSimple:
          "Creamos flujos de trabajo automáticos que hacen las tareas repetitivas de tu empresa sin que tengas que levantar un dedo. Conectamos tus herramientas (CRM, ERP, emails) para que compartan datos al instante sin errores y funcionen las 24 horas.",
        descripcionTecnica:
          "Diseño e implementación de workflows autónomos avanzados con Make y n8n para la orquestación e integración de APIs. Ofrecemos conexión nativa de sistemas sin fricción, gestión de bases de datos y monitorización/mantenimiento mensual continuo.",
        beneficios: [
          "Reducción de errores operativos en un 95%",
          "Disponibilidad total 24/7 sin supervisión humana",
          "Sincronización instantánea entre +10 herramientas (CRM, ERP, Web)",
          "Ahorro drástico de tiempo operativo (más de 40 horas semanales)"
        ],
        tags: ["Make", "n8n", "Workflows", "APIs", "ROI"],
        resultados: "Eliminación del 95% de errores y ahorro del coste de un sueldo junior por cada 3 procesos.",
      },
      landings: {
        nombre: "Landings Inteligentes",
        precio: "200€ + 20€/mes Mantenimiento",
        ahorroTiempo: "70% menos tiempo en prospección",
        ahorroCapital: "Ahorro de 2 sueldos SDR en triaje inicial",
        descripcionSimple:
          "Diseñamos páginas web y funnels automatizados que no solo se ven espectaculares, sino que consiguen clientes por ti las 24 horas. Incluyen un chat inteligente que atiende y califica a las visitas de forma automática.",
        descripcionTecnica:
          "Funnels de conversión premium con chats de IA embebidos con capacidad contextual, técnicas CRO (Conversion Rate Optimization) y diseño web responsive de alta fidelidad. Optimización continua para maximizar leads.",
        beneficios: [
          "Tasa de captura de leads duplicada mediante IA",
          "Cualificación automática de prospectos en tiempo real",
          "Personalización dinámica según el comportamiento del usuario",
          "Ahorro de 2 sueldos SDR en triaje y prospección inicial"
        ],
        tags: ["UX/UI", "CRO", "IA Chats", "Conversión", "Funnels"],
        resultados: "Tasa de conversión y captura de leads duplicada con cualificación automatizada.",
      },
      soluciones: {
        nombre: "Solución de Problemas",
        precio: "100€ (Pago Único)",
        ahorroTiempo: "Reducción drástica en tiempos de gestión operativa",
        ahorroCapital: "60% de ahorro en capital de gestión indirecta",
        descripcionSimple:
          "Si tienes un reto tecnológico o un problema específico en tu negocio (en atención al cliente, marketing o procesos internos), lo analizamos a fondo y lo resolvemos aplicando lógica inteligente a medida.",
        descripcionTecnica:
          "Diagnóstico técnico y ejecución experta para desafíos lógicos complejos de automatización interna, visión artificial, procesamiento de datos complejos e integraciones a medida de alto impacto y ROI inmediato.",
        beneficios: [
          "Toma de decisiones basada en datos en tiempo real",
          "Ejecución coordinada mediante sistemas multi-agente a medida",
          "Optimización algorítmica de flujos, inventarios o logística",
          "60% de ahorro directo en capital de gestión operativa indirecta"
        ],
        tags: ["Algoritmos", "Lógica Compleja", "Integración", "Custom"],
        resultados: "Resolución de problemas críticos de negocio con impacto medible inmediato.",
      },
      mentorias: {
        nombre: "Mentorías Especializadas",
        precio: "Pack 1h: 65€ | Pack 2h: 125€ | Pack 3h: 170€",
        ahorroTiempo: "Aprendizaje acelerado (meses reducidos a semanas)",
        ahorroCapital: "Eliminación de la dependencia de agencias externas",
        descripcionSimple:
          "Sesiones individuales intensivas en las que enseñamos a tu equipo a dominar herramientas de IA y automatizaciones paso a paso, de forma totalmente práctica y adaptada a vuestro nivel.",
        descripcionTecnica:
          "Programa de mentorías 1:1 especializadas para la adopción técnica y estratégica de IA. Cubre prompts avanzados, automatizaciones eficientes y creación de cultura interna escalable de automatización.",
        beneficios: [
          "Autonomía total del equipo interno en herramientas de IA",
          "Implementación de cultura de automatización escalable",
          "Dominio práctico de prompts avanzados y flujos eficientes",
          "Eliminación de costes y dependencias de desarrolladores externos"
        ],
        tags: ["Capacitación", "1:1 Sessions", "Prompts Avanzados", "Autonomía"],
        resultados: "Transferencia de conocimiento y autonomía técnica completa de tu equipo en semanas.",
      },
    },
    faqs: [
      {
        keywords: ["precio", "coste", "cuanto", "cost", "caro", "barato", "tarifa", "presupuesto", "valor", "pagar", "suscripcion", "mensual"],
        respuesta:
          "Nuestras tarifas son claras y competitivas para maximizar tu ROI:\n\n" +
          "1. 🤖 **Automatizaciones de IA**: 350€ Base (según tokens) + 30€/mes de Mantenimiento opcional para soporte continuo.\n" +
          "2. 🌐 **Landings Inteligentes**: 200€ de pago inicial + 20€/mes de Mantenimiento opcional (con chat IA integrado).\n" +
          "3. 🧠 **Solución de Problemas**: 100€ (Pago Único por resolver tu reto técnico específico).\n" +
          "4. 📚 **Mentorías Especializadas**: Packs individuales adaptados:\n" +
          "   • Pack 1 Hora: 65€\n" +
          "   • Pack 2 Horas: 125€\n" +
          "   • Pack 3 Horas: 170€\n\n" +
          "¡Recuerda que en Automatizaciones y Landings el primer mes incluye el pago base y si marcas la casilla de mantenimiento se le suma este mensual! Todos los mantenimientos se pueden cancelar cuando quieras. ¿Te gustaría agendar una llamada gratuita para hablar de tu caso?",
      },
      {
        keywords: ["tiempo", "plazo", "cuando", "entrega", "tardar", "duracion", "semanas", "meses"],
        respuesta:
          "El tiempo de desarrollo está optimizado para darte resultados rápidos:\n\n" +
          "• **Mentorías y Soluciones**: Inmediato o en cuestión de pocos días.\n" +
          "• **Landings Inteligentes**: Listas en 1-2 semanas con chat IA fully functional.\n" +
          "• **Automatizaciones**: Depende del flujo, pero las básicas se entregan en 1-2 semanas y sistemas complejos orquestados en 3-4 semanas.\n\n" +
          "Siempre acordamos un calendario riguroso desde el primer día.",
      },
      {
        keywords: ["contacto", "llamada", "hablar", "reunion", "calendly", "agendar", "cita", "gratis", "gratuito", "estrategia"],
        respuesta:
          "¡Excelente! Ofrecemos una **sesión estratégica de diagnóstico de 30 minutos 100% gratuita**. En ella analizamos tu negocio y diseñamos tu plan de IA.\n\n" +
          "Puedes agendar directamente haciendo clic en **'Agendar llamada'** en las respuestas rápidas, o usar el botón de contacto de la cabecera. ¿Quieres que te envíe los detalles?",
      },
      {
        keywords: ["hoja de ruta", "metodologia", "fases", "pasos", "como trabajais", "proceso", "auditoria", "friccion", "orquestacion"],
        respuesta:
          "Nuestra **Hoja de Ruta Táctica** consta de 3 fases rigurosas:\n\n" +
          "1. 🔍 **Diagnóstico de Fricción**: Realizamos una auditoría interna exhaustiva para mapear y documentar las tareas manuales repetitivas en soporte, ventas o administración.\n" +
          "2. 🔌 **Integración Silenciosa**: Conectamos de forma nativa tus sistemas mediante APIs usando Make o n8n, sin interrumpir ni alterar las dinámicas actuales de tu equipo.\n" +
          "3. 🤖 **Orquestación Multiagente**: Desplegamos agentes autónomos y especialistas configurados a la perfección para ejecutar procesos complejos las 24 horas sin fatiga.\n\n" +
          "Este método garantiza un acople perfecto e inmediato del sistema.",
      },
      {
        keywords: ["pilares", "impacto", "costes", "precision", "escalabilidad", "errores", "omnicanal", "whatsapp", "email", "crm"],
        respuesta:
          "Nuestra tecnología se asienta sobre 3 **Pilares de Impacto Operativo**:\n\n" +
          "• 💸 **Reducción de Costes (Hasta -80%)**: Al automatizar el triaje y las tareas básicas de soporte, liberamos a tu equipo humano para enfocarse en tareas complejas de alto valor.\n" +
          "• 🎯 **Precisión Libre de Errores**: La IA procesa y responde basándose estrictamente en tus datos de negocio, eliminando olvidos, demoras o información errónea.\n" +
          "• 📈 **Escalabilidad Omnicanal**: Sistema elástico capaz de procesar miles de interacciones simultáneas en WhatsApp, Email y tu CRM sin necesidad de aumentar plantilla.",
      },
      {
        keywords: ["modelos", "llm", "claude", "gemini", "gpt", "llama", "openai", "anthropic", "google", "meta", "atlas"],
        respuesta:
          "Implementamos una arquitectura multi-modelo llamada **El Atlas de LLMs**, donde seleccionamos la tecnología óptima para cada caso de uso:\n\n" +
          "• 🪶 **Claude 3.5 Sonnet (Anthropic)**: El líder indiscutible en razonamiento lógico complejo, redacción ultra-natural y generación de código limpio. Ideal para flujos de agentes conversacionales.\n" +
          "• ♊ **Gemini 1.5 Pro & Flash (Google)**: El campeón del contexto masivo (2M+ tokens). Increíble para digerir bases enteras de documentación, vídeos e históricos pesados de golpe.\n" +
          "• ⚡ **GPT-4o (OpenAI)**: Optimizado para velocidad relámpago, APIs eficientes y voz multimodal interactiva.\n" +
          "• 🦙 **Llama 3 / 3.1 (Meta)**: La frontera del código abierto. Perfecto para instalaciones locales de alta seguridad y total privacidad/soberanía de datos empresariales.\n\n" +
          "¡No te atamos a un solo proveedor; usamos lo mejor de cada uno!",
      },
      {
        keywords: ["garantia", "reembolso", "devolucion", "seguro", "riesgo", "satisfaccion", "cancelar", "cancelacion"],
        respuesta:
          "Para tu total tranquilidad, ofrecemos una **Garantía de Satisfacción del 100%**:\n\n" +
          "Si tras nuestra primera reunión técnica de definición consideras que la solución no se adapta a tus expectativas, te devolvemos el **100% de tu dinero de forma inmediata y sin preguntas**.\n\n" +
          "Además, nuestros servicios de mantenimiento mensual no tienen permanencia: puedes cancelarlos en cualquier momento de manera automática y sin penalizaciones. Cero riesgo para ti.",
      },
      {
        keywords: ["testimonio", "opinion", "clientes", "caso de exito", "nexus", "nexus-tech", "alejandro", "referencia"],
        respuesta:
          "Estamos muy orgullosos de las opiniones de quienes confían en nosotros. Por ejemplo, **Alejandro Ruiz (CEO de NexusTech)** nos comparte:\n\n" +
          "> *'La automatización de nuestros embudos de ventas con agentes IA redujo nuestro tiempo de respuesta inicial de 4 horas a menos de 2 minutos. El impacto en la tasa de cierre fue inmediato.'*\n\n" +
          "Como él, ayudamos a decenas de fundadores a erradicar el trabajo manual y multiplicar su eficiencia operativa.",
      },
    ],
  };

  // ─── ESTADO DEL CHAT ─────────────────────────────────────────
  let userLevel = null; // 'tecnico' | 'basico'
  let isOpen = false;
  let isTyping = false;
  let awaitingLevelAnswer = true;

  // ─── UTILIDADES ───────────────────────────────────────────────
  function normalize(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[¿?¡!.,;:]/g, "");
  }

  function contains(text, keywords) {
    const n = normalize(text);
    return keywords.some((k) => n.includes(normalize(k)));
  }

  function getServiceMatch(text) {
    const map = {
      automatizaciones: ["automatiz", "workflow", "make", "n8n", "repetitiv", "flujo"],
      landings: ["landing", "pagina", "web", "funnel", "conversion", "leads", "cro"],
      soluciones: ["solucion", "problema", "diagnos", "atención", "marketing"],
      mentorias: ["mentoria", "aprender", "formacion", "sesion", "enseñar", "curso"],
    };
    const n = normalize(text);
    for (const [key, keywords] of Object.entries(map)) {
      if (keywords.some((k) => n.includes(k))) return key;
    }
    return null;
  }

  // ─── GENERADOR DE RESPUESTAS ──────────────────────────────────
  function generateResponse(userInput) {
    const input = normalize(userInput);

    // Saludo
    if (contains(input, ["hola", "buenas", "hey", "buenos dias", "buenas tardes", "buenas noches", "hi"])) {
      return userLevel === "tecnico"
        ? "¡Hola! Encantado de seguir. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre cualquier servicio, arquitectura o caso de uso específico."
        : "¡Hola de nuevo! 😊 ¿En qué te puedo ayudar hoy? Pregúntame lo que quieras sobre nuestros servicios o sobre qué puede hacer la IA por tu negocio.";
    }

    // Sobre BENIA
    if (contains(input, ["quien", "que es benia", "sobre", "empresa", "agencia", "benia"])) {
      const e = KB.empresa;
      return userLevel === "tecnico"
        ? `**BENIA AGENCY** es una agencia especializada en IA aplicada. Nuestra misión: ${e.mision}\n\n📊 Enfoque: ${e.experiencia} | Propuesta: ${e.propuesta}`
        : `**BENIA AGENCY** somos una agencia de inteligencia artificial. En pocas palabras: ayudamos a empresas como la tuya a que muchas cosas que ahora haces a mano, las haga la tecnología por ti, ahorrándote tiempo y dinero. ✨\n\n¡Llevamos más de 2 años de experiencia aplicándola con éxito!`;
    }

    // Preguntas sobre servicios genéricas
    if (contains(input, ["servicios", "que ofrecen", "que hacen", "que haceis", "que vendeis", "oferta"])) {
      return userLevel === "tecnico"
        ? `Ofrecemos 4 líneas de servicio de alto impacto:\n\n1. 🤖 **Automatizaciones de IA** (Make/n8n): Workflows autónomos y APIs. Desde 350€ + 30€/mes mant.\n2. 🌐 **Landings Inteligentes** (CRO + Chats IA): Embudos de venta integrados. 200€ + 20€/mes mant.\n3. 🧠 **Solución de Problemas**: Diagnóstico y ejecución técnica experta. 100€ pago único.\n4. 📚 **Mentorías Especializadas**: Sesiones técnicas 1:1. Pack 1h: 65€ | 2h: 125€ | 3h: 170€.\n\n¿En cuál de estos servicios estás interesado para profundizar?`
        : `¡Tenemos 4 servicios diseñados para que tu negocio crezca con IA! 🚀\n\n1. 🤖 **Automatizaciones de IA** — para que las tareas repetitivas se hagan solas. Desde 350€ (con opción de mantenimiento por 30€/mes).\n2. 🌐 **Landings Inteligentes** — webs de alto impacto que consiguen clientes por ti. Solo 200€ (+20€/mes si quieres mantenimiento).\n3. 🧠 **Solución de Problemas** — resolvemos cualquier reto tecnológico específico de tu negocio. Pago único de 100€.\n4. 📚 **Mentorías Especializadas** — te enseñamos a ti y a tu equipo a dominar la IA paso a paso. Desde 65€.\n\n¿Cuál te llama más la atención? 😊`;
    }

    // Servicio específico detectado
    const serviceKey = getServiceMatch(userInput);
    if (serviceKey && KB.servicios[serviceKey]) {
      const s = KB.servicios[serviceKey];
      const desc = userLevel === "tecnico" ? s.descripcionTecnica : s.descripcionSimple;
      const beneficiosList = s.beneficios.map((b) => `• ${b}`).join("\n");
      const precioInfo = `💰 **Inversión:** ${s.precio}\n⏳ **Ahorro de Tiempo:** ${s.ahorroTiempo}\n💼 **Optimización de Capital:** ${s.ahorroCapital}`;
      return `**${s.nombre}**\n\n${desc}\n\n✅ **Lo que consigues:**\n${beneficiosList}\n\n${precioInfo}\n\n📈 **Resultados:** ${s.resultados}\n\n¿Te gustaría contratarlo ahora o prefieres agendar una llamada de 30m gratuita para adaptarlo a tu negocio?`;
    }

    // FAQs
    for (const faq of KB.faqs) {
      if (contains(userInput, faq.keywords)) {
        return faq.respuesta;
      }
    }

    // Despedida
    if (contains(input, ["adios", "bye", "hasta luego", "chao", "gracias", "ok gracias"])) {
      return userLevel === "tecnico"
        ? "¡Hasta pronto! Ha sido un placer. Si necesitas retomar la conversación o tienes nuevos requerimientos, aquí estaré. 🚀"
        : "¡Hasta luego! Ha sido un placer hablar contigo 😊 Si tienes cualquier duda en el futuro, no dudes en escribirnos. ¡Mucho éxito con tu negocio! 🌟";
    }

    // Respuesta por defecto
    return userLevel === "tecnico"
      ? "Entendido. No tengo información específica sobre eso en mi base de datos, pero puedes consultarlo directamente con nuestro equipo. ¿Te genero un resumen de nuestros servicios o prefieres que te ayude a agendar una llamada?"
      : "¡Buena pregunta! 😊 Para eso lo mejor es que hablemos directamente con nuestro equipo, que podrá darte toda la información con detalle. ¿Quieres que te ayude a agendar una llamada gratuita?";
  }

  // ─── DOM HELPERS ─────────────────────────────────────────────
  function createMarkup(text) {
    // Soporta **negrita**, saltos de línea y listas
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

  function botReply(text, delay = 900) {
    showTyping();
    setTimeout(() => {
      hideTyping();
      appendMessage("bot", text);
    }, delay);
  }

  // ─── LÓGICA DEL NIVEL DEL USUARIO ────────────────────────────
  function handleLevelAnswer(text) {
    const n = normalize(text);
    const yesWords = ["si", "sí", "yes", "claro", "algo", "bastante", "mucho", "tengo", "trabajado", "conozco", "exacto", "por supuesto"];
    const noWords = ["no", "poco", "nada", "nunca", "cero", "ninguno", "basico", "principiante", "nuevo"];

    if (yesWords.some((w) => n.includes(w))) {
      userLevel = "tecnico";
      awaitingLevelAnswer = false;
      botReply(
        "¡Perfecto! 🔥 Gran base para trabajar. Entonces podemos hablar con propiedad sobre arquitecturas, integraciones y métricas reales.\n\n¿En qué puedo ayudarte? Pregúntame sobre cualquiera de nuestros servicios, resultados o casos de uso."
      );
    } else if (noWords.some((w) => n.includes(w))) {
      userLevel = "basico";
      awaitingLevelAnswer = false;
      botReply(
        "¡No te preocupes para nada! 😊 La IA es mucho más sencilla de entender de lo que parece, y estoy aquí para explicarte todo de forma clara y sin tecnicismos.\n\n¿Qué es lo que te gustaría mejorar en tu negocio? Cuéntame y te digo exactamente cómo podemos ayudarte."
      );
    } else {
      botReply(
        "Perdona, no he entendido bien tu respuesta 😊 ¿Tienes conocimientos previos sobre inteligencia artificial? Un simple **sí** o **no** es suficiente."
      );
    }
  }

  // ─── EVENTO ENVIAR ────────────────────────────────────────────
  function handleSend() {
    const input = document.getElementById("benia-chat-input");
    const text = input.value.trim();
    if (!text || isTyping) return;

    appendMessage("user", text);
    input.value = "";
    input.style.height = "auto";

    if (awaitingLevelAnswer) {
      handleLevelAnswer(text);
    } else {
      const response = generateResponse(text);
      botReply(response);
    }
  }

  // ─── CONSTRUIR UI ─────────────────────────────────────────────
  function buildChatWidget() {
    // CSS inline para máxima compatibilidad sin fichero externo
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

    // ── HTML del widget ──
    const container = document.createElement("div");
    container.id = "benia-chatbot-root";
    container.innerHTML = `
      <!-- Botón flotante -->
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

      <!-- Ventana chat -->
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

    sendBtn.addEventListener("click", handleSend);
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

    // Quick replies
    document.querySelectorAll(".benia-quick-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (isTyping) return;
        const msg = btn.dataset.msg;
        appendMessage("user", msg);
        if (awaitingLevelAnswer) {
          handleLevelAnswer(msg);
        } else {
          const response = generateResponse(msg);
          botReply(response);
        }
      });
    });

    // ─── MENSAJE INICIAL ──────────────────────────────────────
    setTimeout(() => {
      appendMessage(
        "bot",
        "¡Hola! 👋 Soy el asistente virtual de **BENIA AGENCY**, tu experto en inteligencia artificial y automatización empresarial.\n\nAntes de empezar, tengo una pregunta para darte la mejor experiencia posible:\n\n**¿Tienes conocimientos previos sobre inteligencia artificial?**",
        false
      );
      // Mostrar badge si el chat está cerrado
      if (!isOpen) {
        badge.style.display = "block";
      }
    }, 800);
  }

  // ─── INICIALIZACIÓN ───────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildChatWidget);
  } else {
    buildChatWidget();
  }
})();
