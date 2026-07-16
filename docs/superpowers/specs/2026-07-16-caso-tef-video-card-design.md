# Spec: Tarjeta de caso TEF con vídeo en bucle

## Goal
Sustituir el iframe embebido (preview en vivo de la web de TEF) de la tarjeta de "Casos de Éxito" por un **vídeo en bucle** dentro del mismo marco de navegador, en formato horizontal, manteniendo la tarjeta como enlace a `caso-tef.html`.

## Contexto
La sección `#casos` de la home (`index.html`) tiene hoy una tarjeta vertical (3:4) con un marco de navegador (chrome-bar) y un `<iframe>` que muestra en bucle el CTA de la web de TEF vía `?showcase=1`. El iframe se escala por JS (`fitPreviewIframes` en `script.js`). Se quiere cambiar a un vídeo grabado por su naturaleza más controlable y fluida.

## Decisiones (cerradas en brainstorming)
- **Orientación:** horizontal 16:9 (el vídeo se graba en desktop).
- **Layout:** mínimo cambio — el vídeo reemplaza al iframe dentro del mismo marco de navegador; toda la tarjeta sigue enlazando a `caso-tef.html`.
- **Punto "En vivo":** se elimina (ya no es un embed en directo).
- **Rótulo hover:** se añade un "Ver caso →" que aparece solo al pasar el ratón (con degradado), para indicar que la tarjeta es clicable.

## Cambios

### `index.html` (sección `#casos`)
- Quitar el `<div class="live-dot">` del chrome-bar.
- Reemplazar `<div class="preview-viewport">...<iframe.../></div>` por un `<div class="preview-viewport">` que contiene:
  - `<video src="videos/tef-showcase.mp4" autoplay loop muted playsinline preload="metadata">` sin controles.
  - Un `<div class="case-hover-label">Ver caso →</div>` (overlay oculto por defecto).
- El `chrome-url` sigue mostrando `tefmultiservicios.com`. Toda la tarjeta sigue envuelta en `<a href="caso-tef.html" class="case-link-wrapper">`.

### `styles.css`
- `.case-card.bento-shell`: `aspect-ratio: 3 / 4` → `16 / 9`.
- `.cases-grid`: pasar de columnas estrechas (minmax 300–340px) a una sola tarjeta centrada más ancha (`max-width: 680px`, `margin: 3rem auto 0`).
- `.preview-viewport video`: `width/height: 100%`, `object-fit: cover`, `pointer-events: none` (para que el clic navegue vía el `<a>` envolvente).
- `.case-hover-label`: posicionado abajo, degradado de fondo, `opacity: 0` por defecto → `opacity: 1` en `.case-link-wrapper:hover`.
- Eliminar reglas ya sin uso: `.live-dot`, `@keyframes pulse-live-dot`, `.preview-viewport iframe`, y el `@media (max-width:480px)` de `.cases-grid` (ajustar a la tarjeta ancha).
- Mantener: el marco de navegador (`.chrome-bar`, `.chrome-dots`, `.chrome-url`), el doble bisel (`bento-shell`/`bento-core`), y el hover (elevación + glow verde).

### Asset
- Nuevo archivo `videos/tef-showcase.mp4` — clip de ~20s del recorrido por la web de TEF (grabado por Beñat con Xbox Game Bar / AMD ReLive). Objetivo de peso: < ~5–8 MB (comprimir si hace falta).

### `script.js` (sin tocar)
- `fitPreviewIframes()` queda como código muerto inofensivo (su `querySelectorAll('.preview-viewport iframe')` ya no encontrará nada). No se toca `script.js` porque tiene cambios sin commitear (WIP) no relacionados; limpiar esa función es una mejora opcional futura.

## Out of Scope
- No se toca la página de detalle `caso-tef.html`.
- No se toca el modo `?showcase=1` de la web de TEF (queda inservible para esta tarjeta pero no molesta).
- No se comprime/optimiza el vídeo automáticamente; si pesa demasiado, se comprime como paso aparte.

## Verificación
- La tarjeta aparece en formato ancho (16:9), centrada, con el marco de navegador y `tefmultiservicios.com`, sin el punto "En vivo".
- El vídeo reproduce en bucle, silenciado y automáticamente, llenando el marco sin deformarse.
- Al pasar el ratón: la tarjeta se eleva con glow verde y aparece el rótulo "Ver caso →".
- Un clic en cualquier parte de la tarjeta (incluido sobre el vídeo) navega a `caso-tef.html`.
- El resto de la home (y el WIP sin commitear de `index.html`/`styles.css`) queda intacto.
