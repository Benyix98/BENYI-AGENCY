# Spec: Caso de éxito TEF — Showcase en Benia Agency

## Goal
Añadir el proyecto TEF (Telecomunicaciones e Instalaciones Eléctricas — primer cliente de pago de Benia Agency) como caso de éxito en la landing de Benia Agency, con una card de preview en vivo (embed real de la web de TEF) y una página de detalle propia.

## Contexto
- La home de Benia Agency (`index.html`) no tiene sección de portfolio/casos hoy. El footer ya enlaza a `#showcase`, un ancla que no existe — hueco pensado y sin rellenar.
- El proyecto TEF vive en un repo aparte: `C:\Users\livef\.gemini\antigravity\scratch\Pagina-TEF`. Web pública: `https://tef-web-tef.lodgoa.easypanel.host`.
- El proyecto TEF sigue bloqueado esperando API keys del cliente (Resend, OpenAI) — no hay métricas reales de resultado todavía (leads generados, tiempos de respuesta, etc.).

## Proposed Changes

### 1. Modo "showcase" en la web de TEF (repo `Pagina-TEF`)
- **`index.html`**: sin cambios de estructura; se detecta el query param `?showcase=1` vía JS.
- **`script.js`**: nueva función `runShowcaseLoop()`, activada solo si `new URLSearchParams(location.search).has('showcase')`:
  1. Espera ~6s dejando correr el `hero-slogans-container` (rota sus 3 frases de forma nativa, sin tocar ese código).
  2. `scrollIntoView({ behavior: 'smooth' })` sobre `.cta-final` → dispara su `IntersectionObserver` existente (`runCtaAnimation()`), que ya hace el reveal palabra a palabra de "Sin excusas. Lo hacemos bien o no lo hacemos.".
  3. Mantiene 3s en esa posición.
  4. `window.scrollTo({ top: 0, behavior: 'smooth' })` y repite el ciclo indefinidamente (`setInterval` o recursión con `setTimeout`).
- Cambio puramente aditivo: sin el query param, el comportamiento de la web para visitantes normales no cambia en nada.
- No se modifica ningún estilo ni contenido existente de TEF.

### 2. Nueva sección "Casos de Éxito" en Benia Agency (`index.html`, `styles.css`)
- Nueva `<section id="casos" class="showcase-section">`, ubicada entre `#testimonios` y `#guia-ia`.
- Arregla el link roto del footer (`href="#showcase"` → `href="#casos"`).
- Añade link "Casos" al navbar (`#nav-links`), entre "Servicios" y "Guía IA".
- Grid preparado para escalar (misma lógica que `bento-grid`), con una única card por ahora:
  - **Card TEF** — `col-span-4`, `aspect-ratio: 1/1` (~380×380px desktop), envuelta en `glass-card`/`bento-shell` (radio 32px, glow verde de Benia al hover), consistente con el resto de cards de la home.
  - **Marco browser-chrome** dentro de la card: 3 puntos (rojo/ámbar/verde, estilo mockup de navegador) + barra pill con texto `tef-instalaciones.es`.
  - **`<iframe>`** debajo del marco, `src="https://tef-web-tef.lodgoa.easypanel.host/?showcase=1"`, `loading="lazy"`, `tabindex="-1"`, `pointer-events: none` (no interactivo, es un preview visual).
  - Viewport interno del iframe fijado a ancho tipo móvil (ej. `width: 390px` con `transform: scale()` para encajar en el cuadrado), porque la tipografía del slogan y del CTA final están pensadas para leerse a ese tamaño (media query mobile de TEF ya reduce el `font-size` del slogan).
  - Etiqueta corta bajo la card: nombre del cliente ("TEF · Telecomunicaciones e Instalaciones Eléctricas") + 1 línea de qué se hizo ("Web + chatbot + automatización de leads").
  - Toda la card es un link a `caso-tef.html`.

### 3. Página de detalle `caso-tef.html` (nuevo archivo, mismo patrón que `guia/*.html`)
Estructura (contenido centrado en lo construido, sin cifras de resultado no verificadas):
- **Header**: nombre del cliente, sector, año.
- **El reto**: empresa de instalaciones técnicas (fibra, eléctrico, domótica, antenas, obra nueva) sin presencia web ni sistema de captación de leads.
- **Qué se construyó**:
  - Web multi-página (hero, servicios, proyectos con filtro por categoría, testimonios, formulario de contacto/presupuesto).
  - Chatbot cotizador (`chat.html`) conectado a PocketBase para captura de leads.
  - Automatización n8n: pipeline Webhook → clasificación del lead con IA (Claude Haiku) → AI Agent (GPT) redacta respuesta personalizada → envío por email (Resend) + aviso a Telegram.
- **Stack usado**: HTML/CSS/JS estático + PocketBase + n8n (mención breve, tono cliente-friendly, no hace falta detalle técnico profundo).
- **Estado**: nota breve de que el proyecto sigue en marcha (pendiente de credenciales del cliente para el envío de emails en producción) — sin usar la palabra "bloqueado" de cara al público, mejor algo como "en fase de puesta en marcha".
- **CTA final**: mismo bloque de contacto/agenda que el resto de la web de Benia.

## Out of Scope
- No se toca el backend/chatbot de TEF pendiente de credenciales.
- No se generan imágenes o assets nuevos — el iframe en vivo hace de "imagen" del proyecto.
- No se añaden métricas de resultado (leads, ahorro de tiempo) hasta tener datos reales del cliente.
- No se reestructura el resto de la home de Benia más allá de insertar la nueva sección y el link de navbar/footer.

## Verification Plan
- Abrir `Pagina-TEF/index.html?showcase=1` en navegador: confirmar que el loop hero → CTA final → vuelta arriba se repite solo, y que sin el query param el comportamiento normal de scroll no cambia.
- Abrir `index.html` de Benia Agency: confirmar que la sección "Casos de Éxito" aparece entre Testimonios y Guía IA, que el link del footer y el del navbar apuntan a `#casos` y funcionan, y que la card muestra el iframe en vivo con el loop corriendo.
- Confirmar que la card es legible (texto del slogan y del CTA final se leen sin esfuerzo) en desktop y en mobile (breakpoints existentes de Benia).
- Click en la card → navega a `caso-tef.html`.
- Revisar `caso-tef.html`: contenido coincide con lo realmente construido, ninguna cifra de resultado inventada, tono consistente con el resto del site.
