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

router.post('/', async (req, res) => {
  const { company, email, goal } = req.body;

  if (!company || !email || !goal) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const lead = db.insertLead(company, email, goal);

    transporter.sendMail({
      from: `"Benia Agency" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Nuevo lead: ${company}`,
      html: `
        <h2>Nuevo lead recibido</h2>
        <p><strong>Empresa:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Objetivo:</strong> ${goal}</p>
      `,
    }).catch(err => console.error('Email no enviado:', err.message));

    res.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar el lead' });
  }
});

module.exports = router;
