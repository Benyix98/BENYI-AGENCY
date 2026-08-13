const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const checkoutRouter = require('../routes/checkout');

function app() {
  const a = express();
  a.use(express.json());
  a.use('/api/checkout', checkoutRouter);
  return a;
}

test('GET /api/checkout/config devuelve la publishableKey', async () => {
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
  const res = await request(app()).get('/api/checkout/config');
  assert.equal(res.status, 200);
  assert.equal(res.body.publishableKey, 'pk_test_123');
});

test('POST /api/checkout sin campos → 400', async () => {
  const res = await request(app()).post('/api/checkout').send({});
  assert.equal(res.status, 400);
});

test('POST /api/checkout con email inválido → 400', async () => {
  const res = await request(app()).post('/api/checkout')
    .send({ serviceId: 'mentorias-1h', name: 'Ana', email: 'no-es-email' });
  assert.equal(res.status, 400);
});

test('POST /api/checkout con serviceId inexistente → 404', async () => {
  const res = await request(app()).post('/api/checkout')
    .send({ serviceId: 'no-existe', name: 'Ana', email: 'ana@x.com' });
  assert.equal(res.status, 404);
});
