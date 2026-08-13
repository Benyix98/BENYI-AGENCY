// Mapa de servicios. Los importes (en céntimos, EUR) son la fuente de verdad:
// el frontend nunca envía importes, solo el serviceId.
const SERVICES = {
  'automatizacion':     { name: 'Automatizaciones de IA',    baseCents: 35000, recurringCents: 3000 },
  'landings':           { name: 'Landings Inteligentes',     baseCents: 20000, recurringCents: 2000 },
  'soluciones-premium': { name: 'Solución de Problemas',     baseCents: 10000, recurringCents: null },
  'mentorias-1h':       { name: 'Mentoría Especializada 1h', baseCents: 6500,  recurringCents: null },
  'mentorias-2h':       { name: 'Mentoría Especializada 2h', baseCents: 12500, recurringCents: null },
  'mentorias-3h':       { name: 'Mentoría Especializada 3h', baseCents: 17000, recurringCents: null },
};

// Lee los price IDs de Stripe en el momento de la llamada (no en la carga del
// módulo) para que reflejen el entorno actual. Solo los servicios con cuota
// tienen precios en Stripe (para la suscripción); los de pago único usan el
// importe directo en el PaymentIntent.
function getPriceIds(serviceId) {
  const map = {
    'automatizacion': {
      base: process.env.STRIPE_PRICE_AUTOMATIZACION_BASE,
      recurring: process.env.STRIPE_PRICE_AUTOMATIZACION_RECURRING,
    },
    'landings': {
      base: process.env.STRIPE_PRICE_LANDINGS_BASE,
      recurring: process.env.STRIPE_PRICE_LANDINGS_RECURRING,
    },
  };
  return map[serviceId] || null;
}

// El mantenimiento solo aplica si el servicio existe y tiene cuota mensual.
// Salvaguarda del backend: aunque el frontend no muestre el checkbox para
// servicios sin cuota, si llegara maintenance:true lo ignoramos.
function normalizeMaintenance(serviceId, maintenance) {
  const svc = SERVICES[serviceId];
  if (!svc || svc.recurringCents == null) return false;
  return Boolean(maintenance);
}

module.exports = { SERVICES, getPriceIds, normalizeMaintenance };
