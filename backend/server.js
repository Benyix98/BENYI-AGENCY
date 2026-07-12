require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const leadsRouter = require('./routes/leads');
const chatRouter = require('./routes/chat');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

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
