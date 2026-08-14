const { SERVICES, getPriceIds, normalizeMaintenance } = require('../config/services');
const defaultStripe = require('./stripe-client');

// Crea la intención de cobro en Stripe y devuelve el clientSecret para el
// Payment Element. Sin mantenimiento -> PaymentIntent por el importe base.
// Con mantenimiento -> Subscription con la base como add_invoice_items en la
// primera factura (un solo pago = base + primera cuota) y cuota mensual luego.
async function createCheckout({ serviceId, maintenance, name, email }, stripe = defaultStripe) {
  const svc = SERVICES[serviceId];
  if (!svc) {
    const err = new Error('Servicio no encontrado');
    err.status = 404;
    throw err;
  }

  const wantsMaintenance = normalizeMaintenance(serviceId, maintenance);
  const customer = await stripe.customers.create({ name, email });

  if (!wantsMaintenance) {
    const pi = await stripe.paymentIntents.create({
      amount: svc.baseCents,
      currency: 'eur',
      customer: customer.id,
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: { serviceId, maintenance: 'false', customerName: name, customerEmail: email },
    });
    return { clientSecret: pi.client_secret, amount: svc.baseCents, mode: 'payment' };
  }

  const prices = getPriceIds(serviceId);
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: prices.recurring }],
    add_invoice_items: [{ price: prices.base }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: { serviceId, maintenance: 'true' },
  });

  const pi = subscription.latest_invoice.payment_intent;
  return {
    clientSecret: pi.client_secret,
    amount: svc.baseCents + svc.recurringCents,
    mode: 'subscription',
  };
}

module.exports = { createCheckout };
