// Datos de las piezas dinámicas. Los textos estáticos están en index.html.

// DEMO = true: el formulario y el asistente no llaman al servidor (la demo se sirve sin backend).
// En producción, false: se usan /api/leads y /api/chat, igual que en la web actual.
export const DEMO = true;

// Conversación de la maqueta del hero. Compuesta con frases que ya existen en la web
// (respuestas rápidas del asistente, nombres de los servicios y la tarjeta de diagnóstico).
export const heroChat = [
    { from: 'user', text: '¿Qué servicios ofrecéis?' },
    { from: 'bot', text: 'Automatizaciones de IA, Landings Inteligentes, Solución de Problemas y Mentorías Especializadas.' },
    { from: 'user', text: 'Quiero agendar una llamada' },
    { from: 'bot', text: 'Diagnóstico Gratuito: 30 minutos de forma totalmente gratuita. ✅' },
];

// Detalle de cada servicio (mismo contenido que serviceContent en script.js).
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
    'soluciones-premium': {
        title: 'Soluciones de Problemas',
        price: '100€ (Pago Único)',
        achievements: [
            'Toma de decisiones basada en datos en tiempo real.',
            'Ejecución coordinada de tareas mediante sistemas multi-agente.',
            'Optimización algorítmica de inventarios y logística.',
        ],
        savings: {
            time: 'Reducción drástica en tiempos de gestión operativa',
            capital: '60% de ahorro en capital de gestión indirecta',
        },
        cta: 'Resolvamos los desafíos más complejos de tu negocio.',
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

// Asistente flotante (mismos textos que chatbot.js).
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
