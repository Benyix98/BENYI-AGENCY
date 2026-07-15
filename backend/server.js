require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = require('./db/storage');
const leadsRouter = require('./routes/leads');
const chatRouter = require('./routes/chat');
const adminRouter = require('./routes/admin');

// Asegura el usuario admin en cada arranque a partir de las variables de
// entorno. Idempotente: crea el admin si no existe y actualiza su
// contraseña si cambió ADMIN_PASSWORD, así el panel siempre es accesible
// tras un deploy y cambiar la contraseña es solo editar la variable.
if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
  db.upsertAdmin(process.env.ADMIN_USERNAME, hash);
  console.log(`Admin "${process.env.ADMIN_USERNAME}" asegurado.`);
} else {
  console.warn('ADMIN_USERNAME/ADMIN_PASSWORD no definidos: el panel de admin no tendrá usuario.');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Detrás del proxy de EasyPanel (Traefik): confía en 1 salto para que el
// rate limiting lea la IP real del cliente (X-Forwarded-For) y no la del proxy.
app.set('trust proxy', 1);

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Servir frontend estático
app.use(express.static(path.join(__dirname, '..')));

// API routes
app.use('/api/leads', leadsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);

// Fallback — sirve index.html para cualquier ruta no encontrada
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Benia Agency backend corriendo en puerto ${PORT}`);
});
