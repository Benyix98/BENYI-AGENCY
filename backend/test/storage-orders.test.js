const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

let db;
beforeEach(() => {
  // Aísla la BD en un directorio temporal por test.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'benia-orders-'));
  process.env.DATA_DIR = dir;
  delete require.cache[require.resolve('../db/storage')];
  db = require('../db/storage');
});

test('insertOrder guarda y asigna id incremental', () => {
  const o = db.insertOrder({
    serviceId: 'automatizacion', amount: 38000, maintenance: true,
    customerName: 'Ana', customerEmail: 'ana@x.com',
    stripeCustomerId: 'cus_1', stripeSubscriptionId: 'sub_1',
    stripeRefId: 'in_1', status: 'paid',
  });
  assert.equal(o.id, 1);
  assert.equal(o.serviceId, 'automatizacion');
  assert.equal(o.status, 'paid');
  assert.ok(o.created_at);
});

test('getOrderByStripeRef encuentra por referencia y devuelve null si no existe', () => {
  db.insertOrder({ serviceId: 'landings', amount: 20000, maintenance: false,
    customerName: 'B', customerEmail: 'b@x.com', stripeCustomerId: 'cus_2',
    stripePaymentIntentId: 'pi_2', stripeRefId: 'pi_2', status: 'paid' });
  assert.equal(db.getOrderByStripeRef('pi_2').customerEmail, 'b@x.com');
  assert.equal(db.getOrderByStripeRef('nope'), null);
});

test('getOrders devuelve los pedidos más recientes primero', () => {
  db.insertOrder({ serviceId: 'mentorias-1h', amount: 6500, maintenance: false,
    customerName: 'C', customerEmail: 'c@x.com', stripeCustomerId: 'cus_3',
    stripePaymentIntentId: 'pi_3', stripeRefId: 'pi_3', status: 'paid' });
  db.insertOrder({ serviceId: 'mentorias-2h', amount: 12500, maintenance: false,
    customerName: 'D', customerEmail: 'd@x.com', stripeCustomerId: 'cus_4',
    stripePaymentIntentId: 'pi_4', stripeRefId: 'pi_4', status: 'paid' });
  const list = db.getOrders();
  assert.equal(list.length, 2);
  assert.equal(list[0].stripeRefId, 'pi_4');
});
