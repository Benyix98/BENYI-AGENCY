# Pasarela de pago Stripe (Elements) — Benia Agency

**Fecha:** 2026-08-13
**Estado:** Diseño aprobado, pendiente de plan de implementación
**Repo:** BENYI-AGENCY (rama `main`)

## Objetivo

Sustituir el checkout actual (PayPal sandbox, solo frontend) por una pasarela de pago propia con **Stripe Elements embebido**, que permita cobrar los servicios de Benia con dos métodos:

1. **Pago único** — solo el importe base del servicio.
2. **Pago único + mensualidad de mantenimiento** — el importe base ahora + una suscripción mensual que cobra la cuota automáticamente cada mes.

El método 2 es **opcional** (checkbox) y **solo aplica a los servicios con cuota** (Automatizaciones y Landings). El resto son solo pago único.

## Decisiones tomadas (brainstorming)

- **Integración:** Stripe **Elements embebido** (concretamente el **Payment Element**, el moderno, que soporta pago único y suscripción, tarjeta + Apple/Google Pay y 3D Secure automático). No se usa Stripe Checkout hosted.
- **Modelo de cobro:** pago único + suscripción **desde el inicio** (no diferido).
- **Mantenimiento:** **opcional** vía checkbox; solo se crea suscripción si el cliente lo marca.
- **Se elimina PayPal** del checkout.
- **Modo:** se desarrolla y prueba en **sandbox/test**; el modo live se activa después (verificación de negocio con DNI + IBAN pendiente).

## Mapa de precios

| Servicio (id interno)      | Base (pago único) | Cuota mensual (opcional) |
|----------------------------|-------------------|--------------------------|
| `automatizacion`           | 350 €             | 30 €/mes                 |
| `landings`                 | 200 €             | 20 €/mes                 |
| `soluciones-premium`       | 100 €             | — (sin cuota)            |
| `mentorias-1h`             | 65 €              | — (sin cuota)            |
| `mentorias-2h`             | 125 €             | — (sin cuota)            |
| `mentorias-3h`             | 170 €             | — (sin cuota)            |

- Solo `automatizacion` y `landings` ofrecen el checkbox de mantenimiento.
- Los importes son la **fuente de verdad en el servidor**. El frontend nunca envía importes.
- **Regla de mantenimiento inválido:** si llega `maintenance: true` para un servicio sin cuota mensual, el servidor **lo ignora** y lo trata como pago único (no da error). El checkbox no se muestra para esos servicios, así que en la práctica no debería ocurrir; es una salvaguarda del backend.

## Arquitectura

Frontend estático + backend Express (ya existente) sirviendo ambos desde el mismo origen (`https://beniaagency.com`). Stripe se integra en el backend (clave secreta) y en el frontend (clave publicable).

### Flujo de datos

```text
Cliente (checkout.html)
  │  elige servicio + (opcional) marca mantenimiento + nombre/email
  ▼
POST /api/checkout   { serviceId, maintenance: bool, name, email }
  │  el servidor calcula el importe desde el mapa de precios (no se fía del cliente)
  │  crea/recupera Customer en Stripe
  │  ├─ sin mantenimiento → crea PaymentIntent(base)
  │  └─ con mantenimiento → crea Subscription (item recurrente + base como
  │                          add_invoice_items en la 1ª factura),
  │                          payment_behavior: default_incomplete
  ▼  devuelve { clientSecret, amount, mode }
Payment Element (frontend)
  │  confirma el pago (stripe.confirmPayment, return_url a página de éxito)
  ▼
Stripe  ──(evento)──►  POST /api/stripe/webhook  (firma verificada)
                          │  guarda el pedido en `orders`
                          │  envía email de confirmación (nodemailer)
```

### Componentes (backend)

- **`backend/payments/stripe.js`** — cliente de Stripe + lógica de dominio:
  - `createCheckout({ serviceId, maintenance, name, email })` → decide PaymentIntent vs Subscription y devuelve `{ clientSecret, amount, mode }`.
  - Encapsula el mapa de precios → IDs de precio de Stripe.
- **`backend/routes/checkout.js`** — rutas HTTP:
  - `POST /api/checkout` — valida entrada (zod o validación manual, siguiendo el patrón del repo), rate-limit, llama a `createCheckout`.
  - `POST /api/stripe/webhook` — **antes** del `express.json()` global (necesita el raw body para verificar firma); verifica firma, procesa `payment_intent.succeeded` / `invoice.paid`, persiste el pedido, dispara email.
- **`backend/db/`** — nueva colección/tabla `orders`: `{ id, serviceId, amount, maintenance, customerName, customerEmail, stripeCustomerId, stripePaymentIntentId, stripeSubscriptionId, status, createdAt }`. Sigue el patrón de `storage.js` (JSON) ya usado para leads.
- **`backend/scripts/setup-stripe.js`** — crea de forma **idempotente** en la cuenta de Stripe los productos y precios (6 pagos únicos + 2 recurrentes) y escribe/imprime los price IDs para la config. Reutilizable en live.
- **Config/env** (`.env`, nunca en git → EasyPanel Entorno):
  - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Los price IDs (en un mapa en config, generados por el script).

### Componentes (frontend)

- **`checkout.html`** — eliminar el contenedor y SDK de PayPal; añadir el `<div id="payment-element">` y la zona de éxito. Mantener el selector de servicio y el checkbox de mantenimiento (que ya existía en forma de "maintenance optin").
- **`checkout.js`** — reescribir la parte de pago:
  - Cargar Stripe.js con la clave publicable (servida por el backend en un endpoint de config, o inyectada, para no hardcodearla).
  - Al confirmar datos → `POST /api/checkout` → montar Payment Element con el `clientSecret`.
  - `stripe.confirmPayment` con `return_url` a la página de éxito en `https://beniaagency.com`.
  - Mostrar/ocultar el checkbox de mantenimiento según el servicio elegido.

## Seguridad

- **Importes calculados en el servidor** desde un mapa fijo; el cliente solo manda `serviceId` + `maintenance`.
- **Verificación de firma** del webhook (`STRIPE_WEBHOOK_SECRET`) con el raw body.
- **Clave secreta** solo en el backend (`.env`, gitignored; en producción en EasyPanel Entorno). La clave publicable es la única que llega al navegador.
- **Rate-limit** en `POST /api/checkout` (patrón `express-rate-limit` ya usado en el repo).
- Reutiliza `helmet` ya presente. **Ojo CSP:** está desactivada a propósito; si se activara en el futuro habría que permitir `js.stripe.com` y los frames de Stripe.

## Manejo de errores

- `/api/checkout`: 400 si faltan datos o `serviceId` inválido; 404 si el servicio no existe; 500 controlado si Stripe falla (log + mensaje genérico al cliente).
- Frontend: mostrar errores de `confirmPayment` (tarjeta rechazada, 3DS fallido) sin romper el flujo; permitir reintento.
- Webhook: responder 200 rápido; si el procesamiento interno falla, loguear y confiar en el reintento de Stripe. Idempotencia por `event.id` / IDs de Stripe para no duplicar pedidos ni emails.

## Pruebas

- **Unit/integración backend** (patrón `node:test` como en OptixLab si aplica, o el que tenga el repo):
  - `createCheckout` sin mantenimiento → PaymentIntent con importe base correcto.
  - `createCheckout` con mantenimiento → Subscription con base en `add_invoice_items` + item recurrente.
  - Servicio sin cuota + `maintenance:true` → se ignora el mantenimiento (o 400), a definir en el plan.
  - Webhook con firma inválida → 400; con firma válida → persiste pedido una sola vez (idempotencia).
- **Manual en sandbox** con tarjetas de test (`4242 4242 4242 4242`, y una 3DS `4000 0025 0000 3155`): probar los dos caminos de principio a fin y verificar el pedido guardado + email.

## Fuera de alcance (por ahora)

- Activación del modo **live** (verificación de negocio, DNI/IBAN) — se hace aparte.
- Panel de admin para ver pedidos (los pedidos se guardan; visualizarlos en el admin puede ser una mejora posterior).
- Facturación fiscal / Stripe Tax.
- Cancelación/gestión de suscripciones por parte del cliente (portal de cliente de Stripe) — mejora posterior.

## Riesgos / notas

- El **webhook necesita el raw body**: hay que montarlo antes del `express.json()` global o con un parser específico para esa ruta. Es el error más típico.
- El **`return_url`** debe apuntar al dominio real (`https://beniaagency.com`), no al subdominio de EasyPanel.
- Recordar que `FRONTEND_URL` en producción aún apunta al subdominio viejo (pendiente de actualizar en EasyPanel); afecta a CORS y a URLs.
