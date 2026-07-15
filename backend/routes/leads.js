const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../db/storage');

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

router.post('/', async (req, res) => {
  let { company, email, goal } = req.body;

  if (typeof company !== 'string' || typeof email !== 'string' || typeof goal !== 'string') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  company = company.trim();
  email = email.trim();
  goal = goal.trim();

  if (!company || !email || !goal) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  if (company.length > 200 || email.length > 200 || goal.length > 5000) {
    return res.status(400).json({ error: 'Algún campo es demasiado largo' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Email no válido' });
  }

  try {
    const lead = db.insertLead(company, email, goal);

    transporter.sendMail({
      from: `"Benia Agency" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Nuevo lead: ${esc(company)}`,
      html: `
        <h2>Nuevo lead recibido</h2>
        <p><strong>Empresa:</strong> ${esc(company)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
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
