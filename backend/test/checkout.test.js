const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCheckout } = require('../payments/checkout');

// Doble de prueba del SDK de Stripe: registra las llamadas y devuelve
// objetos con la forma mínima que usa createCheckout.
function fakeStripe() {
  const calls = { customers: [], paymentIntents: [], subscriptions: [] };
  return {
    calls,
    customers: {
      create: async (args) => { calls.customers.push(args); return { id: 'cus_test' }; },
    },
    paymentIntents: {
      create: async (args) => { calls.paymentIntents.push(args); return { id: 'pi_test', client_secret: 'pi_test_secret' }; },
    },
    subscriptions: {
      create: async (args) => {
        calls.subscriptions.push(args);
        return { id: 'sub_test', latest_invoice: { payment_intent: { id: 'pi_sub', client_secret: 'sub_secret' } } };
      },
    },
  };
}

test('pago único: crea PaymentIntent con el importe base', async () => {
  const stripe = fakeStripe();
  const res = await createCheckout(
    { serviceId: 'mentorias-1h', maintenance: false, name: 'Ana', email: 'ana@x.com' }, stripe);
  assert.equal(res.mode, 'payment');
  assert.equal(res.amount, 6500);
  assert.equal(res.clientSecret, 'pi_test_secret');
  assert.equal(stripe.calls.paymentIntents[0].amount, 6500);
  assert.equal(stripe.calls.paymentIntents[0].currency, 'eur');
  assert.equal(stripe.calls.subscriptions.length, 0);
});

test('con mantenimiento: crea Subscription con base en add_invoice_items', async () => {
  process.env.STRIPE_PRICE_AUTOMATIZACION_BASE = 'price_base';
  process.env.STRIPE_PRICE_AUTOMATIZACION_RECURRING = 'price_rec';
  const stripe = fakeStripe();
  const res = await createCheckout(
    { serviceId: 'automatizacion', maintenance: true, name: 'Ana', email: 'ana@x.com' }, stripe);
  assert.equal(res.mode, 'subscription');
  assert.equal(res.amount, 38000); // 35000 base + 3000 primera cuota
  assert.equal(res.clientSecret, 'sub_secret');
  const sub = stripe.calls.subscriptions[0];
  assert.equal(sub.items[0].price, 'price_rec');
  assert.equal(sub.add_invoice_items[0].price, 'price_base');
  assert.equal(sub.payment_behavior, 'default_incomplete');
  assert.equal(stripe.calls.paymentIntents.length, 0);
});

test('servicio sin cuota + maintenance:true → pago único (se ignora)', async () => {
  const stripe = fakeStripe();
  const res = await createCheckout(
    { serviceId: 'soluciones-premium', maintenance: true, name: 'B', email: 'b@x.com' }, stripe);
  assert.equal(res.mode, 'payment');
  assert.equal(res.amount, 10000);
  assert.equal(stripe.calls.subscriptions.length, 0);
});

test('servicio inexistente lanza error 404', async () => {
  const stripe = fakeStripe();
  await assert.rejects(
    () => createCheckout({ serviceId: 'nope', maintenance: false, name: 'B', email: 'b@x.com' }, stripe),
    (err) => err.status === 404);
});
