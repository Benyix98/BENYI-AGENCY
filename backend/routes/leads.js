const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const db = require('../db/storage');

// Anti-spam: un negocio no recibe muchos leads legítimos desde la misma IP en
// poco tiempo. Máx. 8 envíos por hora por IP.
const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados envíos, inténtalo de nuevo más tarde.' },
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Escapa HTML para el correo de aviso (los campos vienen del formulario
// público y no son de confianza).
function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Teléfono: al escribirlo se aceptan espacios, guiones, puntos y paréntesis,
// pero se guarda normalizado (solo dígitos y "+" inicial) para poder llamar
// o usarlo directamente en n8n. 9-15 dígitos cubre España e internacional (E.164).
const PHONE_RE = /^\+?\d{9,15}$/;
function normalizePhone(v) {
  return v.replace(/[\s\-.()]/g, '');
}

router.post('/', leadLimiter, async (req, res) => {
  // Honeypot: campo señuelo que un humano nunca rellena (oculto en el form).
  // Si llega con valor es un bot; respondemos "ok" sin guardar ni avisar para
  // no darle pistas de que lo hemos detectado.
  if (req.body.website) {
    return res.json({ ok: true });
  }

  let { company, email, phone, goal } = req.body;

  if (typeof company !== 'string' || typeof email !== 'string' ||
      typeof phone !== 'string' || typeof goal !== 'string') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  company = company.trim();
  email = email.trim();
  phone = normalizePhone(phone.trim());
  goal = goal.trim();

  if (!company || !email || !phone || !goal) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  if (company.length > 200 || email.length > 200 || goal.length > 5000) {
    return res.status(400).json({ error: 'Algún campo es demasiado largo' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Email no válido' });
  }
  if (!PHONE_RE.test(phone)) {
    return res.status(400).json({ error: 'Teléfono no válido' });
  }
  // RGPD: sin aceptación expresa de la política de privacidad no se guarda nada.
  if (req.body.privacy !== true) {
    return res.status(400).json({ error: 'Debes aceptar la política de privacidad' });
  }

  try {
    const lead = db.insertLead(company, email, phone, goal);

    // Reenvía el lead al workflow de n8n (best-effort: si falla, se registra y
    // ya está; nunca rompe la respuesta al usuario ni el guardado del lead).
    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, email, phone, goal, created_at: lead.created_at }),
      }).catch(err => console.error('No se pudo notificar a n8n:', err.message));
    }

    transporter.sendMail({
      from: `"Benia Agency" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Nuevo lead: ${esc(company)}`,
      html: `
        <h2>Nuevo lead recibido</h2>
        <p><strong>Empresa:</strong> ${esc(company)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Teléfono:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>
        <p><strong>Objetivo:</strong> ${esc(goal)}</p>
      `,
    }).catch(err => console.error('Email no enviado:', err.message));

    res.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar el lead' });
  }
});

module.exports = router;
