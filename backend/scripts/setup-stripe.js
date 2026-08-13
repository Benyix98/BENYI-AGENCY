require('dotenv').config();
const stripe = require('../payments/stripe-client');
const { SERVICES } = require('../config/services');

// Crea (idempotente vía lookup_key) los precios necesarios para las
// suscripciones de mantenimiento. Los servicios de pago único no necesitan
// precios en Stripe: usan el importe directo en el PaymentIntent.
const MAINTENANCE_SERVICES = ['automatizacion', 'landings'];

async function ensureProduct(id, name) {
  const existing = await stripe.products.search({ query: `metadata['benia_id']:'${id}'` });
  if (existing.data.length) return existing.data[0];
  return stripe.products.create({ name, metadata: { benia_id: id } });
}

async function ensurePrice(lookupKey, params) {
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  if (existing.data.length) return existing.data[0];
  return stripe.prices.create({ ...params, lookup_key: lookupKey });
}

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Falta STRIPE_SECRET_KEY en .env');
    process.exit(1);
  }
  const out = {};
  for (const id of MAINTENANCE_SERVICES) {
    const svc = SERVICES[id];
    const product = await ensureProduct(id, `Benia · ${svc.name}`);

    const base = await ensurePrice(`benia_${id}_base`, {
      product: product.id, currency: 'eur', unit_amount: svc.baseCents,
    });
    const recurring = await ensurePrice(`benia_${id}_recurring`, {
      product: product.id, currency: 'eur', unit_amount: svc.recurringCents,
      recurring: { interval: 'month' },
    });

    out[`STRIPE_PRICE_${id.toUpperCase()}_BASE`] = base.id;
    out[`STRIPE_PRICE_${id.toUpperCase()}_RECURRING`] = recurring.id;
  }

  console.log('\n# Copia estas líneas en tu .env (y en EasyPanel → Entorno):\n');
  for (const [k, v] of Object.entries(out)) console.log(`${k}=${v}`);
  console.log('');
}

main().catch((err) => { console.error(err); process.exit(1); });
