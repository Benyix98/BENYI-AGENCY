const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createCheckout } = require('../payments/checkout');

// Límite anti-abuso: crear intenciones de pago no debería dispararse desde una
// misma IP. Máx. 20 por 10 minutos.
const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, inténtalo más tarde.' },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// El frontend necesita la clave publicable para inicializar Stripe.js. Es
// pública por diseño (no es secreta), así que se puede servir sin problema.
router.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' });
});

router.post('/', checkoutLimiter, async (req, res) => {
  let { serviceId, maintenance, name, email } = req.body;

  if (typeof serviceId !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  name = name.trim();
  email = email.trim();
  if (!serviceId || !name || !email) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  if (name.length > 200 || email.length > 200) {
    return res.status(400).json({ error: 'Algún campo es demasiado largo' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Email no válido' });
  }

  try {
    const result = await createCheckout({ serviceId, maintenance: Boolean(maintenance), name, email });
    res.json(result);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: err.message });
    console.error('Error en /api/checkout:', err.message);
    res.status(500).json({ error: 'No se pudo iniciar el pago' });
  }
});

module.exports = router;
