const { SERVICES } = require('../config/services');

// Procesa un evento de Stripe ya verificado. Devuelve { received, handled }.
// Idempotente: usa el id de Stripe (pi_... o in_...) como referencia única del
// pedido para no duplicar ni reenviar emails si Stripe reintenta el webhook.
//
// Distingue los caminos para no crear pedidos duplicados:
//  - payment_intent.succeeded SIN invoice  -> pago único.
//  - payment_intent.succeeded CON invoice  -> parte de una suscripción; se
//    ignora aquí (lo maneja invoice.paid).
//  - invoice.paid con billing_reason 'subscription_create' -> alta con mantenimiento.
//  - invoice.paid en renovaciones (subscription_cycle) -> no crea pedido nuevo.
async function handleStripeEvent({ rawBody, signature, stripe, webhookSecret, db, notify }) {
  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    if (pi.invoice) return { received: true, handled: false }; // lo maneja invoice.paid
    if (db.getOrderByStripeRef(pi.id)) return { received: true, handled: true };

    const serviceId = pi.metadata && pi.metadata.serviceId;
    const svc = SERVICES[serviceId];
    const order = db.insertOrder({
      serviceId,
      amount: pi.amount,
      maintenance: false,
      customerName: (pi.metadata && pi.metadata.customerName) || null,
      customerEmail: pi.receipt_email || (pi.metadata && pi.metadata.customerEmail) || null,
      stripeCustomerId: pi.customer || null,
      stripePaymentIntentId: pi.id,
      stripeRefId: pi.id,
      status: 'paid',
    });
    try {
      await notify({ ...order, serviceName: svc ? svc.name : serviceId });
    } catch (err) {
      console.error('notify falló (pedido ya persistido):', err.message);
    }
    return { received: true, handled: true };
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object;
    if (invoice.billing_reason !== 'subscription_create') {
      return { received: true, handled: false }; // renovaciones u otras facturas
    }
    if (db.getOrderByStripeRef(invoice.id)) return { received: true, handled: true };

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const serviceId = subscription.metadata && subscription.metadata.serviceId;
    const svc = SERVICES[serviceId];
    const order = db.insertOrder({
      serviceId,
      amount: invoice.amount_paid,
      maintenance: true,
      customerName: invoice.customer_name || null,
      customerEmail: invoice.customer_email || null,
      stripeCustomerId: invoice.customer || null,
      stripeSubscriptionId: invoice.subscription || null,
      stripeRefId: invoice.id,
      status: 'paid',
    });
    try {
      await notify({ ...order, serviceName: svc ? svc.name : serviceId });
    } catch (err) {
      console.error('notify falló (pedido ya persistido):', err.message);
    }
    return { received: true, handled: true };
  }

  return { received: true, handled: false };
}

module.exports = { handleStripeEvent };
