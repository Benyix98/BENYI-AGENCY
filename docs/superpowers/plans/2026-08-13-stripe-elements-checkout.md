# Pasarela Stripe (Elements) — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir el checkout de PayPal por Stripe Elements (Payment Element) que cobra pago único, y opcionalmente pago único + suscripción mensual de mantenimiento.

**Architecture:** Backend Express (CommonJS) calcula importes desde un mapa fijo y crea en Stripe un PaymentIntent (pago único) o una Subscription con la base en `add_invoice_items` (con mantenimiento); devuelve un `clientSecret`. El frontend monta el Payment Element con ese secret y confirma el pago. Un webhook con firma verificada persiste el pedido y envía el email de confirmación.

**Tech Stack:** Node.js, Express (CJS), `stripe` SDK, `express-rate-limit`, `nodemailer` (ya presente), `node:test` + `supertest` para pruebas, Stripe.js v3 en el frontend.

## Global Constraints

- **CommonJS** en todo el backend (`require` / `module.exports`), como el resto del repo. NO ESM.
- **Importes = fuente de verdad en el servidor.** El frontend solo envía `serviceId` + `maintenance` (bool) + `name` + `email`. Nunca importes.
- **Moneda:** EUR. Importes en **céntimos** en el código.
- **Claves Stripe** solo por variables de entorno; nunca en git. En producción van en la pestaña Entorno de EasyPanel.
- **Webhook necesita el raw body**: se monta con `express.raw({ type: 'application/json' })` ANTES del `express.json()` global.
- El servidor sirve frontend + backend desde el mismo origen. El middleware que bloquea `/backend` etc. ya existe en `server.js`; no romperlo.
- Mapa de precios (céntimos): `automatizacion` 35000 + 3000/mes · `landings` 20000 + 2000/mes · `soluciones-premium` 10000 · `mentorias-1h` 6500 · `mentorias-2h` 12500 · `mentorias-3h` 17000. Solo `automatizacion` y `landings` tienen cuota.
- Si llega `maintenance:true` para un servicio sin cuota, el backend lo ignora (pago único), no da error.

## File Structure

**Backend (crear):**
- `backend/config/services.js` — mapa `SERVICES` (importes + cuota) y `PRICE_IDS` (de env). Helper `normalizeMaintenance`.
- `backend/payments/stripe-client.js` — instancia del SDK de Stripe desde `STRIPE_SECRET_KEY`.
- `backend/payments/checkout.js` — `createCheckout()` (lógica de dominio, stripe inyectable).
- `backend/payments/webhook.js` — `handleStripeEvent()` (verifica firma, persiste, notifica; stripe/db/notify inyectables).
- `backend/routes/checkout.js` — `POST /api/checkout` + `GET /api/checkout/config`.
- `backend/routes/stripe-webhook.js` — `POST /` (raw body) → `handleStripeEvent`.
- `backend/scripts/setup-stripe.js` — crea productos/precios en Stripe (idempotente) e imprime las env vars.
- `backend/test/checkout.test.js`, `backend/test/webhook.test.js`, `backend/test/storage-orders.test.js`, `backend/test/checkout.route.test.js`.

**Backend (modificar):**
- `backend/db/storage.js` — colección `orders` + métodos.
- `backend/server.js` — montar webhook (raw) y checkout; nada más.
- `backend/package.json` — dep `stripe`, devDep `supertest`, script `test`.
- `backend/.env.example` — variables Stripe.

**Frontend (modificar):**
- `checkout.html` — quitar PayPal, añadir Payment Element + zona de éxito.
- `checkout.js` — flujo Stripe.js.

---

### Task 1: Config de servicios y normalización de mantenimiento

**Files:**
- Create: `backend/config/services.js`
- Test: `backend/test/services.test.js`
- Modify: `backend/package.json` (script `test`)

**Interfaces:**
- Produces:
  - `SERVICES`: objeto `{ [serviceId]: { name: string, baseCents: number, recurringCents: number|null } }`
  - `PRICE_IDS`: objeto `{ [serviceId]: { base: string, recurring: string } }` (solo `automatizacion`, `landings`)
  - `normalizeMaintenance(serviceId, maintenance) -> boolean` (true solo si el servicio tiene cuota y `maintenance` es truthy)

- [ ] **Step 1: Añadir el script de test a package.json**

En `backend/package.json`, dentro de `"scripts"`, añade:

```json
    "test": "node --test"
```

- [ ] **Step 2: Escribir el test que falla**

Crea `backend/test/services.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { SERVICES, normalizeMaintenance } = require('../config/services');

test('SERVICES tiene los 6 servicios con importes correctos', () => {
  assert.equal(SERVICES['automatizacion'].baseCents, 35000);
  assert.equal(SERVICES['automatizacion'].recurringCents, 3000);
  assert.equal(SERVICES['landings'].baseCents, 20000);
  assert.equal(SERVICES['landings'].recurringCents, 2000);
  assert.equal(SERVICES['soluciones-premium'].baseCents, 10000);
  assert.equal(SERVICES['soluciones-premium'].recurringCents, null);
  assert.equal(SERVICES['mentorias-1h'].baseCents, 6500);
  assert.equal(SERVICES['mentorias-3h'].baseCents, 17000);
});

test('normalizeMaintenance true solo si el servicio tiene cuota', () => {
  assert.equal(normalizeMaintenance('automatizacion', true), true);
  assert.equal(normalizeMaintenance('automatizacion', false), false);
  assert.equal(normalizeMaintenance('landings', 'on'), true);
  // servicio sin cuota: se ignora aunque venga true
  assert.equal(normalizeMaintenance('mentorias-1h', true), false);
  assert.equal(normalizeMaintenance('soluciones-premium', true), false);
});

test('normalizeMaintenance con servicio inexistente devuelve false', () => {
  assert.equal(normalizeMaintenance('no-existe', true), false);
});
```

- [ ] **Step 3: Ejecutar el test y verificar que falla**

Run: `cd backend && npm test`
Expected: FAIL (`Cannot find module '../config/services'`).

- [ ] **Step 4: Implementar la config**

Crea `backend/config/services.js`:

```js
// Mapa de servicios. Los importes (en céntimos, EUR) son la fuente de verdad:
// el frontend nunca envía importes, solo el serviceId.
const SERVICES = {
  'automatizacion':     { name: 'Automatizaciones de IA',    baseCents: 35000, recurringCents: 3000 },
  'landings':           { name: 'Landings Inteligentes',     baseCents: 20000, recurringCents: 2000 },
  'soluciones-premium': { name: 'Solución de Problemas',     baseCents: 10000, recurringCents: null },
  'mentorias-1h':       { name: 'Mentoría Especializada 1h', baseCents: 6500,  recurringCents: null },
  'mentorias-2h':       { name: 'Mentoría Especializada 2h', baseCents: 12500, recurringCents: null },
  'mentorias-3h':       { name: 'Mentoría Especializada 3h', baseCents: 17000, recurringCents: null },
};

// IDs de precio de Stripe (creados por scripts/setup-stripe.js). Solo los
// servicios con cuota necesitan precios en Stripe (para la suscripción); los
// de pago único usan el importe directo en el PaymentIntent.
const PRICE_IDS = {
  'automatizacion': {
    base: process.env.STRIPE_PRICE_AUTOMATIZACION_BASE,
    recurring: process.env.STRIPE_PRICE_AUTOMATIZACION_RECURRING,
  },
  'landings': {
    base: process.env.STRIPE_PRICE_LANDINGS_BASE,
    recurring: process.env.STRIPE_PRICE_LANDINGS_RECURRING,
  },
};

// El mantenimiento solo aplica si el servicio existe y tiene cuota mensual.
// Salvaguarda del backend: aunque el frontend no muestre el checkbox para
// servicios sin cuota, si llegara maintenance:true lo ignoramos.
function normalizeMaintenance(serviceId, maintenance) {
  const svc = SERVICES[serviceId];
  if (!svc || svc.recurringCents == null) return false;
  return Boolean(maintenance);
}

module.exports = { SERVICES, PRICE_IDS, normalizeMaintenance };
```

- [ ] **Step 5: Ejecutar el test y verificar que pasa**

Run: `cd backend && npm test`
Expected: PASS (los 3 tests de services).

- [ ] **Step 6: Commit**

```bash
git add backend/config/services.js backend/test/services.test.js backend/package.json
git commit -m "feat(pagos): config de servicios y normalización de mantenimiento"
```

---

### Task 2: Persistencia de pedidos en storage.js

**Files:**
- Modify: `backend/db/storage.js`
- Test: `backend/test/storage-orders.test.js`

**Interfaces:**
- Consumes: nada.
- Produces (métodos nuevos en el objeto `db` exportado):
  - `insertOrder({ serviceId, amount, maintenance, customerName, customerEmail, stripeCustomerId, stripePaymentIntentId, stripeSubscriptionId, stripeRefId, status }) -> order`
  - `getOrderByStripeRef(stripeRefId) -> order | null` (idempotencia)
  - `getOrders() -> order[]` (más recientes primero)

- [ ] **Step 1: Escribir el test que falla**

Crea `backend/test/storage-orders.test.js`:

```js
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

let db;
beforeEach(() => {
  // Aísla la BD en un directorio temporal por test.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'benia-orders-'));
  process.env.DATA_DIR = dir;
  delete require.cache[require.resolve('../db/storage')];
  db = require('../db/storage');
});

test('insertOrder guarda y asigna id incremental', () => {
  const o = db.insertOrder({
    serviceId: 'automatizacion', amount: 38000, maintenance: true,
    customerName: 'Ana', customerEmail: 'ana@x.com',
    stripeCustomerId: 'cus_1', stripeSubscriptionId: 'sub_1',
    stripeRefId: 'in_1', status: 'paid',
  });
  assert.equal(o.id, 1);
  assert.equal(o.serviceId, 'automatizacion');
  assert.equal(o.status, 'paid');
  assert.ok(o.created_at);
});

test('getOrderByStripeRef encuentra por referencia y devuelve null si no existe', () => {
  db.insertOrder({ serviceId: 'landings', amount: 20000, maintenance: false,
    customerName: 'B', customerEmail: 'b@x.com', stripeCustomerId: 'cus_2',
    stripePaymentIntentId: 'pi_2', stripeRefId: 'pi_2', status: 'paid' });
  assert.equal(db.getOrderByStripeRef('pi_2').customerEmail, 'b@x.com');
  assert.equal(db.getOrderByStripeRef('nope'), null);
});

test('getOrders devuelve los pedidos más recientes primero', () => {
  db.insertOrder({ serviceId: 'mentorias-1h', amount: 6500, maintenance: false,
    customerName: 'C', customerEmail: 'c@x.com', stripeCustomerId: 'cus_3',
    stripePaymentIntentId: 'pi_3', stripeRefId: 'pi_3', status: 'paid' });
  db.insertOrder({ serviceId: 'mentorias-2h', amount: 12500, maintenance: false,
    customerName: 'D', customerEmail: 'd@x.com', stripeCustomerId: 'cus_4',
    stripePaymentIntentId: 'pi_4', stripeRefId: 'pi_4', status: 'paid' });
  const list = db.getOrders();
  assert.equal(list.length, 2);
  assert.equal(list[0].stripeRefId, 'pi_4');
});
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `cd backend && npm test -- test/storage-orders.test.js`
Expected: FAIL (`db.insertOrder is not a function`).

- [ ] **Step 3: Implementar los métodos de pedidos**

En `backend/db/storage.js`:

1. En `load()`, amplía el objeto inicial para incluir pedidos:

```js
    const initial = { leads: [], admins: [], orders: [], nextLeadId: 1, nextAdminId: 1, nextOrderId: 1 };
```

2. En `load()`, tras `JSON.parse(...)`, garantiza retrocompatibilidad con BDs antiguas sin `orders`. Reemplaza `return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));` por:

```js
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    if (!data.orders) data.orders = [];
    if (!data.nextOrderId) data.nextOrderId = 1;
    return data;
```

3. Dentro del objeto `db`, añade estos métodos (antes del `getAdmin`):

```js
  insertOrder({ serviceId, amount, maintenance, customerName, customerEmail,
                stripeCustomerId, stripePaymentIntentId, stripeSubscriptionId,
                stripeRefId, status }) {
    const data = load();
    const order = {
      id: data.nextOrderId++,
      serviceId, amount, maintenance: Boolean(maintenance),
      customerName, customerEmail,
      stripeCustomerId: stripeCustomerId || null,
      stripePaymentIntentId: stripePaymentIntentId || null,
      stripeSubscriptionId: stripeSubscriptionId || null,
      stripeRefId, // referencia única para idempotencia (pi_... o in_...)
      status: status || 'paid',
      created_at: new Date().toISOString(),
    };
    data.orders.push(order);
    save(data);
    return order;
  },

  getOrderByStripeRef(stripeRefId) {
    const data = load();
    return data.orders.find(o => o.stripeRefId === stripeRefId) || null;
  },

  getOrders() {
    const data = load();
    return data.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

Run: `cd backend && npm test -- test/storage-orders.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/db/storage.js backend/test/storage-orders.test.js
git commit -m "feat(pagos): persistencia de pedidos en storage"
```

---

### Task 3: Cliente Stripe + lógica createCheckout

**Files:**
- Create: `backend/payments/stripe-client.js`
- Create: `backend/payments/checkout.js`
- Test: `backend/test/checkout.test.js`
- Modify: `backend/package.json` (dep `stripe`)

**Interfaces:**
- Consumes: `SERVICES`, `PRICE_IDS`, `normalizeMaintenance` de `config/services.js`.
- Produces:
  - `stripe-client.js` exporta la instancia del SDK (`module.exports = stripe`).
  - `checkout.js` exporta `createCheckout({ serviceId, maintenance, name, email }, stripe) -> Promise<{ clientSecret, amount, mode }>` donde `mode` es `'payment'` o `'subscription'`. El parámetro `stripe` es inyectable (por defecto el cliente real) para poder testear.

- [ ] **Step 1: Instalar el SDK de Stripe**

Run: `cd backend && npm install stripe@^16`
(Esto añade `stripe` a `dependencies` en package.json.)

- [ ] **Step 2: Escribir el test que falla**

Crea `backend/test/checkout.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCheckout } = require('../payments/checkout');

// Doble de prueba del SDK de Stripe: registra las llamadas y devuelve
// objetos con la forma mínima que usa createCheckout.
function fakeStripe() {
  const calls = { customers: [], paymentIntents: [], subscriptions: [] };
  return {
    calls,
    customers: {
      create: async (args) => { calls.customers.push(args); return { id: 'cus_test' }; },
    },
    paymentIntents: {
      create: async (args) => { calls.paymentIntents.push(args); return { id: 'pi_test', client_secret: 'pi_test_secret' }; },
    },
    subscriptions: {
      create: async (args) => {
        calls.subscriptions.push(args);
        return { id: 'sub_test', latest_invoice: { payment_intent: { id: 'pi_sub', client_secret: 'sub_secret' } } };
      },
    },
  };
}

test('pago único: crea PaymentIntent con el importe base', async () => {
  const stripe = fakeStripe();
  const res = await createCheckout(
    { serviceId: 'mentorias-1h', maintenance: false, name: 'Ana', email: 'ana@x.com' }, stripe);
  assert.equal(res.mode, 'payment');
  assert.equal(res.amount, 6500);
  assert.equal(res.clientSecret, 'pi_test_secret');
  assert.equal(stripe.calls.paymentIntents[0].amount, 6500);
  assert.equal(stripe.calls.paymentIntents[0].currency, 'eur');
  assert.equal(stripe.calls.subscriptions.length, 0);
});

test('con mantenimiento: crea Subscription con base en add_invoice_items', async () => {
  process.env.STRIPE_PRICE_AUTOMATIZACION_BASE = 'price_base';
  process.env.STRIPE_PRICE_AUTOMATIZACION_RECURRING = 'price_rec';
  const stripe = fakeStripe();
  const res = await createCheckout(
    { serviceId: 'automatizacion', maintenance: true, name: 'Ana', email: 'ana@x.com' }, stripe);
  assert.equal(res.mode, 'subscription');
  assert.equal(res.amount, 38000); // 35000 base + 3000 primera cuota
  assert.equal(res.clientSecret, 'sub_secret');
  const sub = stripe.calls.subscriptions[0];
  assert.equal(sub.items[0].price, 'price_rec');
  assert.equal(sub.add_invoice_items[0].price, 'price_base');
  assert.equal(sub.payment_behavior, 'default_incomplete');
  assert.equal(stripe.calls.paymentIntents.length, 0);
});

test('servicio sin cuota + maintenance:true → pago único (se ignora)', async () => {
  const stripe = fakeStripe();
  const res = await createCheckout(
    { serviceId: 'soluciones-premium', maintenance: true, name: 'B', email: 'b@x.com' }, stripe);
  assert.equal(res.mode, 'payment');
  assert.equal(res.amount, 10000);
  assert.equal(stripe.calls.subscriptions.length, 0);
});

test('servicio inexistente lanza error 404', async () => {
  const stripe = fakeStripe();
  await assert.rejects(
    () => createCheckout({ serviceId: 'nope', maintenance: false, name: 'B', email: 'b@x.com' }, stripe),
    (err) => err.status === 404);
});
```

- [ ] **Step 3: Ejecutar el test y verificar que falla**

Run: `cd backend && npm test -- test/checkout.test.js`
Expected: FAIL (`Cannot find module '../payments/checkout'`).

- [ ] **Step 4: Implementar el cliente y la lógica**

Crea `backend/payments/stripe-client.js`:

```js
// Instancia única del SDK de Stripe. La clave secreta vive solo en el backend
// (variable de entorno), nunca en git ni en el frontend.
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
module.exports = stripe;
```

Crea `backend/payments/checkout.js`:

```js
const { SERVICES, PRICE_IDS, normalizeMaintenance } = require('../config/services');
const defaultStripe = require('./stripe-client');

// Crea la intención de cobro en Stripe y devuelve el clientSecret para el
// Payment Element. Sin mantenimiento -> PaymentIntent por el importe base.
// Con mantenimiento -> Subscription con la base como add_invoice_items en la
// primera factura (un solo pago = base + primera cuota) y cuota mensual luego.
async function createCheckout({ serviceId, maintenance, name, email }, stripe = defaultStripe) {
  const svc = SERVICES[serviceId];
  if (!svc) {
    const err = new Error('Servicio no encontrado');
    err.status = 404;
    throw err;
  }

  const wantsMaintenance = normalizeMaintenance(serviceId, maintenance);
  const customer = await stripe.customers.create({ name, email });

  if (!wantsMaintenance) {
    const pi = await stripe.paymentIntents.create({
      amount: svc.baseCents,
      currency: 'eur',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: { serviceId, maintenance: 'false' },
    });
    return { clientSecret: pi.client_secret, amount: svc.baseCents, mode: 'payment' };
  }

  const prices = PRICE_IDS[serviceId];
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: prices.recurring }],
    add_invoice_items: [{ price: prices.base }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: { serviceId, maintenance: 'true' },
  });

  const pi = subscription.latest_invoice.payment_intent;
  return {
    clientSecret: pi.client_secret,
    amount: svc.baseCents + svc.recurringCents,
    mode: 'subscription',
  };
}

module.exports = { createCheckout };
```

- [ ] **Step 5: Ejecutar el test y verificar que pasa**

Run: `cd backend && npm test -- test/checkout.test.js`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add backend/payments/stripe-client.js backend/payments/checkout.js backend/test/checkout.test.js backend/package.json backend/package-lock.json
git commit -m "feat(pagos): cliente Stripe y lógica createCheckout"
```

---

### Task 4: Manejo del webhook (persistencia + notificación)

**Files:**
- Create: `backend/payments/webhook.js`
- Test: `backend/test/webhook.test.js`

**Interfaces:**
- Consumes: `SERVICES` (para el importe/nombre en el email).
- Produces:
  - `handleStripeEvent({ rawBody, signature, stripe, webhookSecret, db, notify }) -> Promise<{ received: true, handled: boolean }>`
  - Lanza el error de `stripe.webhooks.constructEvent` si la firma es inválida (el router lo traduce a 400).
  - `notify(order)` es una función inyectable que envía el email (por defecto la real); en tests se pasa un doble.

- [ ] **Step 1: Escribir el test que falla**

Crea `backend/test/webhook.test.js`:

```js
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { handleStripeEvent } = require('../payments/webhook');

let db;
beforeEach(() => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'benia-wh-'));
  process.env.DATA_DIR = dir;
  delete require.cache[require.resolve('../db/storage')];
  db = require('../db/storage');
});

// stripe.webhooks.constructEvent devuelve el evento ya "verificado".
function stripeReturning(event) {
  return {
    webhooks: { constructEvent: () => event },
    subscriptions: { retrieve: async () => ({ metadata: { serviceId: 'automatizacion' } }) },
  };
}

test('firma inválida propaga el error', async () => {
  const stripe = { webhooks: { constructEvent: () => { throw new Error('bad sig'); } } };
  await assert.rejects(() => handleStripeEvent({
    rawBody: Buffer.from('{}'), signature: 'x', stripe, webhookSecret: 'whsec', db, notify: async () => {},
  }));
});

test('payment_intent.succeeded de pago único crea pedido y notifica una vez', async () => {
  const notified = [];
  const event = { id: 'evt_1', type: 'payment_intent.succeeded', data: { object: {
    id: 'pi_1', invoice: null, amount: 6500, customer: 'cus_1',
    metadata: { serviceId: 'mentorias-1h', maintenance: 'false' },
    receipt_email: null,
  } } };
  const stripe = stripeReturning(event);
  const args = { rawBody: Buffer.from('{}'), signature: 'x', stripe, webhookSecret: 'whsec', db, notify: async (o) => notified.push(o) };

  const r1 = await handleStripeEvent(args);
  assert.equal(r1.handled, true);
  assert.equal(db.getOrders().length, 1);
  assert.equal(db.getOrderByStripeRef('pi_1').serviceId, 'mentorias-1h');
  assert.equal(notified.length, 1);

  // Idempotencia: reprocesar el mismo evento no duplica.
  await handleStripeEvent(args);
  assert.equal(db.getOrders().length, 1);
  assert.equal(notified.length, 1);
});

test('payment_intent.succeeded ligado a factura (suscripción) se ignora aquí', async () => {
  const event = { id: 'evt_2', type: 'payment_intent.succeeded', data: { object: {
    id: 'pi_2', invoice: 'in_2', amount: 38000, customer: 'cus_2', metadata: {},
  } } };
  const stripe = stripeReturning(event);
  const r = await handleStripeEvent({ rawBody: Buffer.from('{}'), signature: 'x', stripe, webhookSecret: 'whsec', db, notify: async () => {} });
  assert.equal(r.handled, false);
  assert.equal(db.getOrders().length, 0);
});

test('invoice.paid de creación de suscripción crea pedido', async () => {
  const event = { id: 'evt_3', type: 'invoice.paid', data: { object: {
    id: 'in_3', billing_reason: 'subscription_create', subscription: 'sub_3',
    customer: 'cus_3', amount_paid: 38000, customer_name: 'Ana', customer_email: 'ana@x.com',
  } } };
  const stripe = stripeReturning(event);
  await handleStripeEvent({ rawBody: Buffer.from('{}'), signature: 'x', stripe, webhookSecret: 'whsec', db, notify: async () => {} });
  const order = db.getOrderByStripeRef('in_3');
  assert.equal(order.serviceId, 'automatizacion');
  assert.equal(order.maintenance, true);
  assert.equal(order.stripeSubscriptionId, 'sub_3');
});

test('renovación mensual (billing_reason subscription_cycle) no crea pedido', async () => {
  const event = { id: 'evt_4', type: 'invoice.paid', data: { object: {
    id: 'in_4', billing_reason: 'subscription_cycle', subscription: 'sub_4', customer: 'cus_4', amount_paid: 3000,
  } } };
  const stripe = stripeReturning(event);
  const r = await handleStripeEvent({ rawBody: Buffer.from('{}'), signature: 'x', stripe, webhookSecret: 'whsec', db, notify: async () => {} });
  assert.equal(r.handled, false);
  assert.equal(db.getOrders().length, 0);
});
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `cd backend && npm test -- test/webhook.test.js`
Expected: FAIL (`Cannot find module '../payments/webhook'`).

- [ ] **Step 3: Implementar el manejador**

Crea `backend/payments/webhook.js`:

```js
const { SERVICES } = require('../config/services');

// Procesa un evento de Stripe ya verificado. Devuelve { received, handled }.
// Idempotente: usa el id de Stripe (pi_... o in_...) como referencia única del
// pedido para no duplicar ni reenviar emails si Stripe reintenta el webhook.
//
// Distingue los caminos para no crear pedidos duplicados:
//  - payment_intent.succeeded SIN invoice  -> pago único.
//  - payment_intent.succeeded CON invoice  -> parte de una suscripción; se
//    ignora aquí (lo maneja invoice.paid).
//  - invoice.paid con billing_reason 'subscription_create' -> alta con mantenimiento.
//  - invoice.paid en renovaciones (subscription_cycle) -> no crea pedido nuevo.
async function handleStripeEvent({ rawBody, signature, stripe, webhookSecret, db, notify }) {
  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    if (pi.invoice) return { received: true, handled: false }; // lo maneja invoice.paid
    if (db.getOrderByStripeRef(pi.id)) return { received: true, handled: true };

    const serviceId = pi.metadata && pi.metadata.serviceId;
    const svc = SERVICES[serviceId];
    const order = db.insertOrder({
      serviceId,
      amount: pi.amount,
      maintenance: false,
      customerName: (pi.metadata && pi.metadata.customerName) || null,
      customerEmail: pi.receipt_email || (pi.metadata && pi.metadata.customerEmail) || null,
      stripeCustomerId: pi.customer || null,
      stripePaymentIntentId: pi.id,
      stripeRefId: pi.id,
      status: 'paid',
    });
    await notify({ ...order, serviceName: svc ? svc.name : serviceId });
    return { received: true, handled: true };
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object;
    if (invoice.billing_reason !== 'subscription_create') {
      return { received: true, handled: false }; // renovaciones u otras facturas
    }
    if (db.getOrderByStripeRef(invoice.id)) return { received: true, handled: true };

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const serviceId = subscription.metadata && subscription.metadata.serviceId;
    const svc = SERVICES[serviceId];
    const order = db.insertOrder({
      serviceId,
      amount: invoice.amount_paid,
      maintenance: true,
      customerName: invoice.customer_name || null,
      customerEmail: invoice.customer_email || null,
      stripeCustomerId: invoice.customer || null,
      stripeSubscriptionId: invoice.subscription || null,
      stripeRefId: invoice.id,
      status: 'paid',
    });
    await notify({ ...order, serviceName: svc ? svc.name : serviceId });
    return { received: true, handled: true };
  }

  return { received: true, handled: false };
}

module.exports = { handleStripeEvent };
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

Run: `cd backend && npm test -- test/webhook.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/payments/webhook.js backend/test/webhook.test.js
git commit -m "feat(pagos): manejo idempotente del webhook de Stripe"
```

---

### Task 5: Rutas HTTP (checkout + config)

**Files:**
- Create: `backend/routes/checkout.js`
- Create: `backend/routes/stripe-webhook.js`
- Test: `backend/test/checkout.route.test.js`
- Modify: `backend/package.json` (devDep `supertest`)

**Interfaces:**
- Consumes: `createCheckout` (checkout.js), `handleStripeEvent` (webhook.js), `db` (storage), `nodemailer`.
- Produces:
  - `routes/checkout.js` → router con `POST /` (crea checkout) y `GET /config` (devuelve `{ publishableKey }`). Se montará en `/api/checkout`.
  - `routes/stripe-webhook.js` → router con `POST /` (raw body). Se montará en `/api/stripe/webhook`.

- [ ] **Step 1: Instalar supertest**

Run: `cd backend && npm install --save-dev supertest`

- [ ] **Step 2: Escribir el test de ruta que falla**

Crea `backend/test/checkout.route.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

// Monta solo el router de checkout con un createCheckout inyectado por env-free
// stubbing: el router usa el módulo real, así que probamos validación y forma
// de respuesta con datos que no llegan a Stripe (serviceId inválido = 400/404
// sin llamar a Stripe) y el endpoint de config.
const checkoutRouter = require('../routes/checkout');

function app() {
  const a = express();
  a.use(express.json());
  a.use('/api/checkout', checkoutRouter);
  return a;
}

test('GET /api/checkout/config devuelve la publishableKey', async () => {
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
  const res = await request(app()).get('/api/checkout/config');
  assert.equal(res.status, 200);
  assert.equal(res.body.publishableKey, 'pk_test_123');
});

test('POST /api/checkout sin campos → 400', async () => {
  const res = await request(app()).post('/api/checkout').send({});
  assert.equal(res.status, 400);
});

test('POST /api/checkout con email inválido → 400', async () => {
  const res = await request(app()).post('/api/checkout')
    .send({ serviceId: 'mentorias-1h', name: 'Ana', email: 'no-es-email' });
  assert.equal(res.status, 400);
});

test('POST /api/checkout con serviceId inexistente → 404', async () => {
  const res = await request(app()).post('/api/checkout')
    .send({ serviceId: 'no-existe', name: 'Ana', email: 'ana@x.com' });
  assert.equal(res.status, 404);
});
```

- [ ] **Step 3: Ejecutar el test y verificar que falla**

Run: `cd backend && npm test -- test/checkout.route.test.js`
Expected: FAIL (`Cannot find module '../routes/checkout'`).

- [ ] **Step 4: Implementar los routers**

Crea `backend/routes/checkout.js`:

```js
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
```

Crea `backend/routes/stripe-webhook.js`:

```js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const stripe = require('../payments/stripe-client');
const db = require('../db/storage');
const { handleStripeEvent } = require('../payments/webhook');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Email de aviso de venta al propio Benia (no falla el webhook si el email
// falla: se registra y ya está).
async function notify(order) {
  const euros = (order.amount / 100).toFixed(2);
  await transporter.sendMail({
    from: `"Benia Agency" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `Nueva venta: ${esc(order.serviceName)} (${euros} €)`,
    html: `
      <h2>Nueva venta 🎉</h2>
      <p><strong>Servicio:</strong> ${esc(order.serviceName)}</p>
      <p><strong>Importe:</strong> ${euros} €</p>
      <p><strong>Mantenimiento:</strong> ${order.maintenance ? 'Sí (suscripción)' : 'No'}</p>
      <p><strong>Cliente:</strong> ${esc(order.customerName)} — ${esc(order.customerEmail)}</p>
    `,
  }).catch(err => console.error('Email de venta no enviado:', err.message));
}

// El raw body lo aporta el montaje en server.js con express.raw().
router.post('/', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  try {
    const result = await handleStripeEvent({
      rawBody: req.body, // Buffer (raw)
      signature,
      stripe,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      db,
      notify,
    });
    res.json(result);
  } catch (err) {
    console.error('Webhook Stripe rechazado:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
```

- [ ] **Step 5: Ejecutar el test y verificar que pasa**

Run: `cd backend && npm test -- test/checkout.route.test.js`
Expected: PASS (4 tests).

- [ ] **Step 6: Ejecutar TODA la suite (no romper nada)**

Run: `cd backend && npm test`
Expected: PASS (todos los tests de services, storage-orders, checkout, webhook, checkout.route).

- [ ] **Step 7: Commit**

```bash
git add backend/routes/checkout.js backend/routes/stripe-webhook.js backend/test/checkout.route.test.js backend/package.json backend/package-lock.json
git commit -m "feat(pagos): rutas /api/checkout y /api/stripe/webhook"
```

---

### Task 6: Cablear rutas en server.js

**Files:**
- Modify: `backend/server.js`

**Interfaces:**
- Consumes: `routes/checkout.js`, `routes/stripe-webhook.js`.
- Produces: rutas activas en el servidor. Sin tests automáticos; verificación manual arrancando el servidor.

- [ ] **Step 1: Requerir los routers nuevos**

En `backend/server.js`, junto a los otros `require` de routers, añade:

```js
const checkoutRouter = require('./routes/checkout');
const stripeWebhookRouter = require('./routes/stripe-webhook');
```

- [ ] **Step 2: Montar el webhook con raw body ANTES de express.json()**

En `backend/server.js`, localiza la línea `app.use(express.json());`. **Justo antes** de ella, añade:

```js
// El webhook de Stripe necesita el cuerpo crudo (Buffer) para verificar la
// firma, así que se monta antes del express.json() global.
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookRouter);
```

- [ ] **Step 3: Montar el router de checkout con el resto de la API**

En `backend/server.js`, junto a las otras líneas `app.use('/api/...')`, añade:

```js
app.use('/api/checkout', checkoutRouter);
```

- [ ] **Step 4: Verificación manual — arrancar el servidor**

Run: `cd backend && node server.js`
Expected: arranca sin errores en el puerto configurado (log "Benia Agency backend corriendo...").

En otra terminal:

```bash
curl -s http://localhost:3000/api/checkout/config
```

Expected: `{"publishableKey":"..."}` (vacío si aún no hay env var, pero responde 200 JSON).
Para el `POST` real hace falta `STRIPE_SECRET_KEY`; se prueba de verdad en la Task 9. Detén el servidor (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add backend/server.js
git commit -m "feat(pagos): montar rutas de Stripe en server.js (webhook con raw body)"
```

---

### Task 7: Script de alta de productos/precios en Stripe

**Files:**
- Create: `backend/scripts/setup-stripe.js`
- Modify: `backend/.env.example`

**Interfaces:**
- Consumes: `stripe-client.js`, `SERVICES`.
- Produces: crea en Stripe (idempotente por `lookup_key`) los precios base y recurrentes de `automatizacion` y `landings`; imprime las 4 variables de entorno con sus price IDs. Sin test automático (efecto externo); se ejecuta contra el sandbox.

- [ ] **Step 1: Documentar las variables en .env.example**

Añade al final de `backend/.env.example`:

```
# Stripe (modo test: claves que empiezan por sk_test_ / pk_test_)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
# Price IDs generados por: node scripts/setup-stripe.js
STRIPE_PRICE_AUTOMATIZACION_BASE=
STRIPE_PRICE_AUTOMATIZACION_RECURRING=
STRIPE_PRICE_LANDINGS_BASE=
STRIPE_PRICE_LANDINGS_RECURRING=
```

- [ ] **Step 2: Escribir el script**

Crea `backend/scripts/setup-stripe.js`:

```js
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
```

- [ ] **Step 3: Verificación manual — ejecutar contra el sandbox**

Requisito: `backend/.env` con `STRIPE_SECRET_KEY=sk_test_...` (la clave de test del sandbox).

Run: `cd backend && node scripts/setup-stripe.js`
Expected: imprime 4 líneas `STRIPE_PRICE_...=price_...`. Cópialas al `.env`. Ejecutarlo dos veces NO crea duplicados (idempotente).

- [ ] **Step 4: Commit**

```bash
git add backend/scripts/setup-stripe.js backend/.env.example
git commit -m "feat(pagos): script idempotente de alta de precios en Stripe"
```

---

### Task 8: Frontend — checkout.html con Payment Element

**Files:**
- Modify: `checkout.html`

**Interfaces:**
- Consumes: (en la Task 9) `checkout.js`.
- Produces: el marcado del Payment Element y la zona de éxito; se elimina el de PayPal. Verificación visual.

- [ ] **Step 1: Cargar Stripe.js y quitar el SDK de PayPal**

En `checkout.html`, elimina cualquier `<script src="https://www.paypal.com/sdk/js...">` si estuviera embebido en el HTML (el SDK actual se carga desde `checkout.js`; asegúrate de que no quede ningún `<div id="paypal-button-container">` ni spinner de PayPal en el marcado). Antes de `checkout.js`, añade en el `<head>` o antes del cierre de `<body>`:

```html
<script src="https://js.stripe.com/v3/"></script>
```

- [ ] **Step 2: Sustituir el contenedor de pago**

Localiza el bloque donde estaba el botón/campos de PayPal (columna derecha de la pasarela) y reemplázalo por el contenedor del Payment Element y el botón de pago:

```html
<div id="payment-section">
  <div id="payment-element"><!-- Stripe monta aquí el formulario --></div>
  <button id="submit-payment" class="btn-primary btn-large" style="width:100%; margin-top:1.25rem;">
    <span id="pay-button-text">Pagar</span>
    <span id="pay-spinner" style="display:none;">Procesando…</span>
  </button>
  <div id="payment-error" role="alert" style="color:#ef4444; margin-top:0.75rem; min-height:1.2em;"></div>
</div>
```

- [ ] **Step 3: Añadir la zona de éxito (si no existe ya una reutilizable)**

Asegúrate de que existe un contenedor de éxito ocultable (reutiliza `checkout-success-section` si ya está en el HTML; si no, añádelo):

```html
<div id="checkout-success-section" style="display:none; text-align:center; padding:2rem;">
  <div style="font-size:3rem;">✅</div>
  <h3 style="color:#22c55e;">¡Pago completado!</h3>
  <p style="color:#9ca3af;">Gracias por confiar en Benia Agency. Te contactaremos muy pronto.</p>
</div>
```

- [ ] **Step 4: Verificación visual**

Abre `checkout.html` en el navegador (o vía el servidor). Expected: no aparecen errores de PayPal en consola; se ve el contenedor `#payment-element` vacío (aún sin JS de la Task 9) y el botón "Pagar".

- [ ] **Step 5: Commit**

```bash
git add checkout.html
git commit -m "feat(pagos): checkout.html con Payment Element (quita PayPal)"
```

---

### Task 9: Frontend — checkout.js (flujo Stripe.js)

**Files:**
- Modify: `checkout.js`

**Interfaces:**
- Consumes: `GET /api/checkout/config`, `POST /api/checkout`, Stripe.js (`window.Stripe`).
- Produces: flujo completo de pago en el navegador. Verificación manual con tarjetas de test.

- [ ] **Step 1: Reemplazar la lógica de PayPal por Stripe**

En `checkout.js`, elimina la carga del SDK de PayPal, `renderPayPalButton`, `paypal.Buttons(...)` y helpers asociados. Añade (adaptando los IDs a los reales del selector de servicio y del checkbox de mantenimiento ya existentes en el HTML) el flujo Stripe:

```js
// --- Stripe Payment Element ---
let stripe, elements;

async function initStripe() {
  const { publishableKey } = await fetch('/api/checkout/config').then(r => r.json());
  stripe = Stripe(publishableKey);
}

// Devuelve serviceId + si el checkbox de mantenimiento está marcado.
function readSelection() {
  const serviceId = document.getElementById('service-selector').value;
  const maintenanceEl = document.getElementById('maintenance-optin'); // checkbox existente
  const maintenance = Boolean(maintenanceEl && maintenanceEl.checked && !maintenanceEl.disabled);
  return { serviceId, maintenance };
}

async function startPayment() {
  const { serviceId, maintenance } = readSelection();
  const name = document.getElementById('buyer-name').value.trim();
  const email = document.getElementById('buyer-email').value.trim();

  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceId, maintenance, name, email }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    document.getElementById('payment-error').textContent = error || 'No se pudo iniciar el pago.';
    return;
  }
  const { clientSecret } = await res.json();
  elements = stripe.elements({ clientSecret, appearance: { theme: 'night' } });
  const paymentElement = elements.create('payment');
  paymentElement.mount('#payment-element');
}

async function confirmPayment() {
  const btn = document.getElementById('submit-payment');
  document.getElementById('pay-button-text').style.display = 'none';
  document.getElementById('pay-spinner').style.display = 'inline';
  btn.disabled = true;

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: { return_url: 'https://beniaagency.com/checkout.html?paid=1' },
  });

  if (error) {
    document.getElementById('payment-error').textContent = error.message || 'El pago no se pudo completar.';
    document.getElementById('pay-button-text').style.display = 'inline';
    document.getElementById('pay-spinner').style.display = 'none';
    btn.disabled = false;
  }
  // Si no hay error, Stripe redirige al return_url.
}
```

- [ ] **Step 2: Cablear los eventos y el arranque**

Dentro del `DOMContentLoaded` de `checkout.js`, añade:

```js
  initStripe();

  // El botón: si el Payment Element aún no está montado, lo monta (startPayment);
  // si ya está, confirma el pago.
  const payBtn = document.getElementById('submit-payment');
  if (payBtn) {
    payBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!elements) { await startPayment(); }
      else { await confirmPayment(); }
    });
  }

  // Al volver del pago (return_url con ?paid=1), muestra la pantalla de éxito.
  if (new URLSearchParams(location.search).get('paid') === '1') {
    const pay = document.getElementById('payment-section');
    const ok = document.getElementById('checkout-success-section');
    if (pay) pay.style.display = 'none';
    if (ok) ok.style.display = 'block';
  }
```

- [ ] **Step 3: Mostrar/ocultar el checkbox de mantenimiento según el servicio**

Asegúrate de que el listener del selector de servicio oculta el checkbox de mantenimiento para servicios sin cuota. Añade/ajusta:

```js
  const SERVICES_CON_CUOTA = ['automatizacion', 'landings'];
  const serviceSel = document.getElementById('service-selector');
  const maintenanceRow = document.getElementById('maintenance-row'); // contenedor del checkbox
  function toggleMaintenance() {
    const con = SERVICES_CON_CUOTA.includes(serviceSel.value);
    if (maintenanceRow) maintenanceRow.style.display = con ? 'flex' : 'none';
    const cb = document.getElementById('maintenance-optin');
    if (cb && !con) cb.checked = false;
  }
  if (serviceSel) { serviceSel.addEventListener('change', toggleMaintenance); toggleMaintenance(); }
```

> Nota: usa los IDs reales del HTML actual (`service-selector`, y los del checkbox/fila de mantenimiento que ya existían para el "maintenance optin"). Si difieren, ajústalos en los tres steps.

- [ ] **Step 4: Verificación manual end-to-end en sandbox**

Requisitos: `backend/.env` con `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` y los 4 price IDs; servidor arrancado (`node server.js`).

1. Abre `http://localhost:3000/checkout.html?service=mentorias-1h`.
2. Rellena nombre/email, pulsa "Pagar" → se monta el Payment Element.
3. Tarjeta de test `4242 4242 4242 4242`, fecha futura, CVC cualquiera → confirma.
4. Expected: redirige a `?paid=1` y se ve la pantalla de éxito.
5. Repite con `?service=automatizacion` marcando mantenimiento; usa `4242...`.
6. Expected: en el Dashboard de Stripe (test) aparece un pago y una **suscripción** activa.

- [ ] **Step 5: Commit**

```bash
git add checkout.js
git commit -m "feat(pagos): flujo de pago con Stripe.js en checkout.js"
```

---

### Task 10: Verificación del webhook end-to-end y notas de despliegue

**Files:**
- Ninguno (verificación). Opcional: `docs/superpowers/specs/2026-08-13-stripe-elements-checkout-design.md` (marcar estado).

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: confirmación de que los pedidos se persisten vía webhook y checklist de despliegue.

- [ ] **Step 1: Probar el webhook en local con Stripe CLI**

Instala Stripe CLI (si no está) y ejecuta:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copia el `whsec_...` que imprime a `backend/.env` como `STRIPE_WEBHOOK_SECRET` y reinicia el servidor.

- [ ] **Step 2: Disparar un pago y verificar persistencia**

Repite un pago de test (Task 9). Con `stripe listen` activo, el evento `payment_intent.succeeded` (o `invoice.paid`) llega al backend.
Expected: aparece una entrada en `backend/db/benia.json` dentro de `orders`, y llega el email de venta a `EMAIL_USER`.

- [ ] **Step 3: Verificar idempotencia**

En el dashboard de Stripe (test) → Desarrolladores → Webhooks → reenvía el mismo evento.
Expected: NO se crea un segundo pedido ni un segundo email para la misma referencia.

- [ ] **Step 4: Checklist de despliegue (EasyPanel)**

Documenta/ejecuta (no en git):
- En EasyPanel → servicio `benia_agency` → **Entorno**, añade: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` (el de producción, ver step 5) y los 4 `STRIPE_PRICE_*`.
- Actualiza `FRONTEND_URL=https://beniaagency.com` (pendiente de antes).
- Implementar.

- [ ] **Step 5: Alta del webhook de producción en Stripe**

En el Dashboard de Stripe → Desarrolladores → Webhooks → Añadir endpoint:
- URL: `https://beniaagency.com/api/stripe/webhook`
- Eventos: `payment_intent.succeeded`, `invoice.paid`.
- Copia el `whsec_...` de producción a EasyPanel → Entorno (`STRIPE_WEBHOOK_SECRET`) e Implementar.

- [ ] **Step 6: Commit (si se actualizó el estado de la spec)**

```bash
git add docs/superpowers/specs/2026-08-13-stripe-elements-checkout-design.md
git commit -m "docs(pagos): marcar spec de Stripe como implementada"
```

---

## Self-Review

**Spec coverage:**
- Dos métodos de pago (único / único+suscripción) → Task 3 (createCheckout).
- Mantenimiento opcional solo en servicios con cuota → Task 1 (normalizeMaintenance) + Task 9 (UI).
- Importes en servidor → Task 1 + Task 3.
- Webhook con firma + persistencia + email + idempotencia → Task 4, 5, 10.
- Productos/precios en Stripe → Task 7.
- Sustituir PayPal → Task 8, 9.
- Persistencia de pedidos → Task 2.
- Seguridad (rate-limit, claves en env, raw body) → Task 5, 6, Global Constraints.
- Pruebas (unit + manual sandbox) → Tasks 1-5 (unit), 9-10 (manual).
- Fuera de alcance (admin de pedidos, portal cliente, Tax, live) → no se implementa, coherente con la spec.

**Placeholders:** ninguno pendiente; los IDs del HTML frontend se marcan explícitamente como "ajustar a los reales" porque dependen del marcado existente de checkout.html.

**Type consistency:** `createCheckout` devuelve `{ clientSecret, amount, mode }` (usado igual en Task 3, 5, 9). `insertOrder`/`getOrderByStripeRef`/`getOrders` con las mismas firmas en Task 2, 4. `handleStripeEvent({ rawBody, signature, stripe, webhookSecret, db, notify })` idéntico en Task 4 y 5.
