const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { handleStripeEvent } = require('../payments/webhook');

let db;
beforeEach(() => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'benia-wh-'));
  process.env.DATA_DIR = dir;
  delete require.cache[require.resolve('../db/storage')];
  db = require('../db/storage');
});

// stripe.webhooks.constructEvent devuelve el evento ya "verificado".
function stripeReturning(event) {
  return {
    webhooks: { constructEvent: () => event },
    subscriptions: { retrieve: async () => ({ metadata: { serviceId: 'automatizacion' } }) },
  };
}

test('firma inválida propaga el error', async () => {
  const stripe = { webhooks: { constructEvent: () => { throw new Error('bad sig'); } } };
  await assert.rejects(() => handleStripeEvent({
    rawBody: Buffer.from('{}'), signature: 'x', stripe, webhookSecret: 'whsec', db, notify: async () => {},
  }));
});

test('payment_intent.succeeded de pago único crea pedido y notifica una vez', async () => {
  const notified = [];
  const event = { id: 'evt_1', type: 'payment_intent.succeeded', data: { object: {
    id: 'pi_1', invoice: null, amount: 6500, customer: 'cus_1',
    metadata: { serviceId: 'mentorias-1h', maintenance: 'false' },
    receipt_email: null,
  } } };
  const stripe = stripeReturning(event);
  const args = { rawBody: Buffer.from('{}'), signature: 'x', stripe, webhookSecret: 'whsec', db, notify: async (o) => notified.push(o) };

  const r1 = await handleStripeEvent(args);
  assert.equal(r1.handled, true);
  assert.equal(db.getOrders().length, 1);
  assert.equal(db.getOrderByStripeRef('pi_1').serviceId, 'mentorias-1h');
  assert.equal(notified.length, 1);

  // Idempotencia: reprocesar el mismo evento no duplica.
  await handleStripeEvent(args);
  assert.equal(db.getOrders().length, 1);
  assert.equal(notified.length, 1);
});

test('payment_intent.succeeded ligado a factura (suscripción) se ignora aquí', async () => {
  const event = { id: 'evt_2', type: 'payment_intent.succeeded', data: { object: {
    id: 'pi_2', invoice: 'in_2', amount: 38000, customer: 'cus_2', metadata: {},
  } } };
  const stripe = stripeReturning(event);
  const r = await handleStripeEvent({ rawBody: Buffer.from('{}'), signature: 'x', stripe, webhookSecret: 'whsec', db, notify: async () => {} });
  assert.equal(r.handled, false);
  assert.equal(db.getOrders().length, 0);
});

test('invoice.paid de creación de suscripción crea pedido', async () => {
  const event = { id: 'evt_3', type: 'invoice.paid', data: { object: {
    id: 'in_3', billing_reason: 'subscription_create', subscription: 'sub_3',
    customer: 'cus_3', amount_paid: 38000, customer_name: 'Ana', customer_email: 'ana@x.com',
  } } };
  const stripe = stripeReturning(event);
  await handleStripeEvent({ rawBody: Buffer.from('{}'), signature: 'x', stripe, webhookSecret: 'whsec', db, notify: async () => {} });
  const order = db.getOrderByStripeRef('in_3');
  assert.equal(order.serviceId, 'automatizacion');
  assert.equal(order.maintenance, true);
  assert.equal(order.stripeSubscriptionId, 'sub_3');
});

test('renovación mensual (billing_reason subscription_cycle) no crea pedido', async () => {
  const event = { id: 'evt_4', type: 'invoice.paid', data: { object: {
    id: 'in_4', billing_reason: 'subscription_cycle', subscription: 'sub_4', customer: 'cus_4', amount_paid: 3000,
  } } };
  const stripe = stripeReturning(event);
  const r = await handleStripeEvent({ rawBody: Buffer.from('{}'), signature: 'x', stripe, webhookSecret: 'whsec', db, notify: async () => {} });
  assert.equal(r.handled, false);
  assert.equal(db.getOrders().length, 0);
});
