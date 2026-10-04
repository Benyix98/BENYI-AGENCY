const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const SECRET = 'secreto-n8n-de-prueba';
let db;
let app;
let fetchCalls;

beforeEach(() => {
  // BD aislada por test y módulos recargados (limitadores de peticiones a cero).
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'benia-clasif-'));
  process.env.JWT_SECRET = 'jwt-de-prueba';
  process.env.N8N_CALLBACK_SECRET = SECRET;
  process.env.N8N_WEBHOOK_URL = 'https://n8n.test/webhook/benia-lead';
  for (const m of ['../db/storage', '../routes/leads', '../routes/admin']) {
    delete require.cache[require.resolve(m)];
  }
  db = require('../db/storage');

  fetchCalls = [];
  global.fetch = async (url, opts) => { fetchCalls.push({ url, body: JSON.parse(opts.body) }); return { ok: true }; };

  app = express();
  app.use(express.json());
  app.use('/api/leads', require('../routes/leads'));
  app.use('/api/admin', require('../routes/admin'));
});

const adminToken = () => jwt.sign({ id: 1, username: 'admin' }, process.env.JWT_SECRET);
const nuevoLead = () => db.insertLead('Clínica Test', 'test@clinica.com', '+34600123456', 'Automatizar citas');

// ---------- almacenamiento ----------

test('un lead nuevo nace sin clasificar', () => {
  const lead = nuevoLead();
  assert.equal(lead.clasificacion, null);
});

test('updateLeadClassification guarda clasificación, servicio, necesidad y motivo', () => {
  const lead = nuevoLead();
  const actualizado = db.updateLeadClassification(lead.id, {
    clasificacion: 'caliente', servicio: 'automatizaciones', necesidad: 'Reducir ausencias', motivo: 'Pide presupuesto',
  });
  assert.equal(actualizado.clasificacion, 'caliente');
  const guardado = db.getLeads()[0];
  assert.equal(guardado.clasificacion, 'caliente');
  assert.equal(guardado.servicio, 'automatizaciones');
  assert.equal(guardado.necesidad, 'Reducir ausencias');
  assert.equal(guardado.motivo, 'Pide presupuesto');
  assert.ok(guardado.classified_at);
});

test('updateLeadClassification devuelve null si el lead no existe', () => {
  assert.equal(db.updateLeadClassification(999, { clasificacion: 'frio' }), null);
});

// ---------- envío a n8n ----------

test('el lead se reenvía a n8n con su id, para que n8n pueda devolver la clasificación', async () => {
  const res = await request(app).post('/api/leads').send({
    company: 'Clínica Test', email: 'test@clinica.com', phone: '+34 600 12 34 56', goal: 'Automatizar citas', privacy: true,
  });
  assert.equal(res.status, 200);
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].body.id, res.body.id);
});

// ---------- respuesta de n8n ----------

test('n8n clasifica un lead con el secreto correcto', async () => {
  const lead = nuevoLead();
  const res = await request(app).post(`/api/leads/${lead.id}/clasificacion`)
    .set('x-benia-secret', SECRET)
    .send({ clasificacion: 'tibio', servicio: 'automatizaciones', necesidad: 'Gestionar citas', motivo: 'Sin urgencia' });
  assert.equal(res.status, 200);
  assert.equal(db.getLeads()[0].clasificacion, 'tibio');
});

test('acepta la clasificación con mayúsculas y tilde (Frío → frio)', async () => {
  const lead = nuevoLead();
  const res = await request(app).post(`/api/leads/${lead.id}/clasificacion`)
    .set('x-benia-secret', SECRET).send({ clasificacion: 'Frío' });
  assert.equal(res.status, 200);
  assert.equal(db.getLeads()[0].clasificacion, 'frio');
});

test('sin secreto o con secreto incorrecto → 401 y no se guarda nada', async () => {
  const lead = nuevoLead();
  const sin = await request(app).post(`/api/leads/${lead.id}/clasificacion`).send({ clasificacion: 'caliente' });
  const mal = await request(app).post(`/api/leads/${lead.id}/clasificacion`)
    .set('x-benia-secret', 'otro').send({ clasificacion: 'caliente' });
  assert.equal(sin.status, 401);
  assert.equal(mal.status, 401);
  assert.equal(db.getLeads()[0].clasificacion, null);
});

test('clasificación no válida → 400', async () => {
  const lead = nuevoLead();
  const res = await request(app).post(`/api/leads/${lead.id}/clasificacion`)
    .set('x-benia-secret', SECRET).send({ clasificacion: 'ardiendo' });
  assert.equal(res.status, 400);
});

test('lead inexistente → 404, indicando el id recibido para poder diagnosticarlo', async () => {
  const res = await request(app).post('/api/leads/999/clasificacion')
    .set('x-benia-secret', SECRET).send({ clasificacion: 'frio' });
  assert.equal(res.status, 404);
  assert.equal(res.body.id_recibido, '999');

  const sinId = await request(app).post('/api/leads/undefined/clasificacion')
    .set('x-benia-secret', SECRET).send({ clasificacion: 'frio' });
  assert.equal(sinId.body.id_recibido, 'undefined');
});

test('un id que no es un número entero → 404 y no toca ningún lead (aunque empiece por un dígito)', async () => {
  const lead = nuevoLead(); // id 1
  // "1a0ce7e9" es el aspecto de un id de Gmail; parseInt lo leería como 1.
  for (const id of ['1a0ce7e9', 'undefined', '1.5', '%7B%7Bid%7D%7D']) {
    const res = await request(app).post(`/api/leads/${id}/clasificacion`)
      .set('x-benia-secret', SECRET).send({ clasificacion: 'caliente' });
    assert.equal(res.status, 404, `id "${id}"`);
  }
  assert.equal(db.getLeads().find(l => l.id === lead.id).clasificacion, null);
});

test('si no hay secreto configurado en el servidor, la ruta está desactivada (503)', async () => {
  delete process.env.N8N_CALLBACK_SECRET;
  const lead = nuevoLead();
  const res = await request(app).post(`/api/leads/${lead.id}/clasificacion`)
    .set('x-benia-secret', '').send({ clasificacion: 'frio' });
  assert.equal(res.status, 503);
});

// ---------- panel de admin ----------

test('el admin puede clasificar un lead a mano', async () => {
  const lead = nuevoLead();
  const res = await request(app).patch(`/api/admin/leads/${lead.id}`)
    .set('Authorization', `Bearer ${adminToken()}`).send({ clasificacion: 'caliente' });
  assert.equal(res.status, 200);
  assert.equal(db.getLeads()[0].clasificacion, 'caliente');
});

test('el admin puede quitar la clasificación (null)', async () => {
  const lead = nuevoLead();
  db.updateLeadClassification(lead.id, { clasificacion: 'frio' });
  const res = await request(app).patch(`/api/admin/leads/${lead.id}`)
    .set('Authorization', `Bearer ${adminToken()}`).send({ clasificacion: null });
  assert.equal(res.status, 200);
  assert.equal(db.getLeads()[0].clasificacion, null);
});

test('el admin sigue pudiendo cambiar el estado, y clasificación inválida → 400', async () => {
  const lead = nuevoLead();
  const ok = await request(app).patch(`/api/admin/leads/${lead.id}`)
    .set('Authorization', `Bearer ${adminToken()}`).send({ status: 'contactado' });
  const mal = await request(app).patch(`/api/admin/leads/${lead.id}`)
    .set('Authorization', `Bearer ${adminToken()}`).send({ clasificacion: 'ardiendo' });
  assert.equal(ok.status, 200);
  assert.equal(db.getLeads()[0].status, 'contactado');
  assert.equal(mal.status, 400);
});

test('sin token, el admin no puede clasificar (401)', async () => {
  const lead = nuevoLead();
  const res = await request(app).patch(`/api/admin/leads/${lead.id}`).send({ clasificacion: 'caliente' });
  assert.equal(res.status, 401);
});
