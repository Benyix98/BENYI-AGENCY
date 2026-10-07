// Datos de las piezas dinámicas. Los textos estáticos están en index.html.

// DEMO = false: el formulario y el asistente usan /api/leads y /api/chat.
// Con true no llaman al servidor (para ver la web sin backend).
export const DEMO = false;

// Conversación de la maqueta del hero. Compuesta con frases que ya existen en la web
// (respuestas rápidas del asistente, nombres de los servicios y la tarjeta de diagnóstico).
export const heroChat = [
    { from: 'user', text: '¿Qué servicios ofrecéis?' },
    { from: 'bot', text: 'Automatizaciones de IA, Landings Inteligentes, Agentes de IA Personalizados y Mentorías Especializadas.' },
    { from: 'user', text: 'Quiero agendar una llamada' },
    { from: 'bot', text: 'Diagnóstico Gratuito: 30 minutos de forma totalmente gratuita. ✅' },
];

// Detalle de cada servicio.
export const services = {
    'automatizacion': {
        title: 'Automatizaciones de IA',
        price: '350€ Base (variable por tokens) + 30€/mes Mantenimiento',
        achievements: [
            'Reducción de errores operativos en un 95%.',
            'Disponibilidad total 24/7 sin supervisión humana.',
            'Sincronización instantánea entre +10 herramientas (CRM, ERP, Web).',
        ],
        savings: {
            time: '+40 horas semanales',
            capital: 'Sueldo junior por cada 3 procesos automatizados',
        },
        cta: '¿Listo para liberar a tu equipo de la carga operativa?',
    },
    'landings': {
        title: 'Landings Inteligentes',
        price: '200€ + 20€/mes Mantenimiento',
        achievements: [
            'Tasa de captura de leads duplicada mediante IA.',
            'Cualificación automática de prospectos en tiempo real.',
            'Personalización dinámica según el comportamiento del usuario.',
        ],
        savings: {
            time: '70% menos tiempo en prospección',
            capital: 'Ahorro de 2 sueldos SDR en triaje inicial',
        },
        cta: 'Maximiza tus conversiones con una web que piensa por ti.',
    },
    'agentes-ia': {
        title: 'Agentes de IA Personalizados',
        price: 'A medida, con presupuesto cerrado tras el diagnóstico gratuito',
        achievements: [
            'Atención a tus clientes 24/7 por chat web, WhatsApp o teléfono.',
            'Respuestas basadas en la información real de tu negocio.',
            'Agenda citas y registra cada contacto en tus herramientas (calendario, CRM).',
        ],
        savings: {
            time: 'Menos llamadas y mensajes repetitivos para tu equipo',
            capital: 'Ningún contacto sin respuesta fuera de horario',
        },
        cta: 'Diseñemos el agente que tu negocio necesita.',
        // Sin precio fijo: no se contrata desde la pasarela, solo se pide el diagnóstico.
        checkout: false,
    },
    'mentorias': {
        title: 'Mentorías Especializadas',
        price: 'Pack 1h: 65€ | Pack 2h: 125€ | Pack 3h: 170€',
        achievements: [
            'Autonomía total del equipo interno en herramientas IA.',
            'Implementación de cultura de automatización escalable.',
            'Dominio de prompts avanzados y flujos de trabajo eficientes.',
        ],
        savings: {
            time: 'Aprendizaje acelerado (meses reducidos a semanas)',
            capital: 'Eliminación de dependencia de agencias externas',
        },
        cta: 'Crea un equipo imparable con el dominio de la IA.',
    },
};

// Asistente flotante.
export const assistant = {
    greeting: '¡Hola! 👋 Soy el asistente virtual de <strong>BENIA AGENCY</strong>, especialistas en automatizaciones e inteligencia artificial. ¿En qué puedo ayudarte hoy? Pregúntame sobre nuestros servicios, precios o agenda una llamada gratuita.',
    quickReplies: [
        { label: 'Servicios', msg: '¿Qué servicios ofrecéis?' },
        { label: 'Sobre BENIA', msg: '¿Qué es BENIA?' },
        { label: 'Agendar llamada', msg: 'Quiero agendar una llamada' },
        { label: 'Precios', msg: '¿Cuánto cuesta?' },
    ],
    errorReply: 'Lo siento, ha ocurrido un error. Inténtalo de nuevo.',
    connectionError: 'Ha ocurrido un error de conexión. Por favor, inténtalo de nuevo en unos segundos.',
    // Solo se usa con DEMO = true.
    demoReply: 'Esta es una demo local sin servidor. En la web publicada aquí responde el asistente real.',
};
