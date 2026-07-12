const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/storage');
const auth = require('../middleware/auth');

router.post('/login', (req, res) => {
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
