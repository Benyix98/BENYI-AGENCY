const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/storage');
const auth = require('../middleware/auth');

// Frena la fuerza bruta contra el login: máx. 10 intentos fallidos cada 15 min
// por IP. Los logins correctos no cuentan, así que el admin legítimo no se
// autobloquea.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, inténtalo de nuevo en unos minutos.' },
});

router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;

  const admin = db.getAdmin(username);
  if (!admin) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const valid = bcrypt.compareSync(password, admin.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token });
});

router.get('/leads', auth, (req, res) => {
  res.json(db.getLeads());
});

router.patch('/leads/:id', auth, (req, res) => {
  const { status } = req.body;
  const allowed = ['pendiente', 'contactado', 'cerrado'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  db.updateLeadStatus(req.params.id, status);
  res.json({ ok: true });
});

router.delete('/leads/:id', auth, (req, res) => {
  db.deleteLead(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
