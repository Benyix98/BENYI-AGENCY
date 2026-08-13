// Instancia única del SDK de Stripe. La clave secreta vive solo en el backend
// (variable de entorno), nunca en git ni en el frontend.
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
module.exports = stripe;
