const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const stripe = require('../payments/stripe-client');
const db = require('../db/storage');
const { handleStripeEvent } = require('../payments/webhook');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Email de aviso de venta al propio Benia (no falla el webhook si el email
// falla: se registra y ya está).
async function notify(order) {
  const euros = (order.amount / 100).toFixed(2);
  await transporter.sendMail({
    from: `"Benia Agency" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `Nueva venta: ${esc(order.serviceName)} (${euros} €)`,
    html: `
      <h2>Nueva venta 🎉</h2>
      <p><strong>Servicio:</strong> ${esc(order.serviceName)}</p>
      <p><strong>Importe:</strong> ${euros} €</p>
      <p><strong>Mantenimiento:</strong> ${order.maintenance ? 'Sí (suscripción)' : 'No'}</p>
      <p><strong>Cliente:</strong> ${esc(order.customerName)} — ${esc(order.customerEmail)}</p>
    `,
  }).catch(err => console.error('Email de venta no enviado:', err.message));
}

// El raw body lo aporta el montaje en server.js con express.raw().
router.post('/', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  try {
    const result = await handleStripeEvent({
      rawBody: req.body, // Buffer (raw)
      signature,
      stripe,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      db,
      notify,
    });
    res.json(result);
  } catch (err) {
    console.error('Webhook Stripe rechazado:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
