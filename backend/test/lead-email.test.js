const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const request = require('supertest');
const nodemailer = require('nodemailer');

let app;
let sent;

// Monta la ruta con una BD aislada y un transporte de correo falso que solo
// anota lo que se le pide enviar.
function montar() {
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'benia-email-'));
  process.env.EMAIL_USER = 'remitente@gmail.com';
  delete process.env.N8N_WEBHOOK_URL;
  for (const m of ['../db/storage', '../routes/leads']) {
    delete require.cache[require.resolve(m)];
  }
  sent = [];
  nodemailer.createTransport = () => ({ sendMail: async (opts) => { sent.push(opts); } });

  app = express();
  app.use(express.json());
  app.use('/api/leads', require('../routes/leads'));
}

beforeEach(() => {
  delete process.env.LEADS_EMAIL_TO;
});

const lead = { company: 'Clínica Test', email: 'test@clinica.com', phone: '+34 600 123 456', goal: 'Automatizar citas', privacy: true };

test('el aviso de lead nuevo llega a beniaagency98@gmail.com', async () => {
  montar();
  await request(app).post('/api/leads').send(lead).expect(200);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'beniaagency98@gmail.com');
  assert.match(sent[0].from, /remitente@gmail\.com/);
});

test('LEADS_EMAIL_TO cambia el destinatario del aviso', async () => {
  process.env.LEADS_EMAIL_TO = 'otro@ejemplo.com';
  montar();
  await request(app).post('/api/leads').send(lead).expect(200);
  assert.equal(sent[0].to, 'otro@ejemplo.com');
});
