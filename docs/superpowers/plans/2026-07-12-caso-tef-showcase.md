# Caso de Éxito TEF — Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add TEF as a case study on the Benia Agency landing page — a live-embed preview card in a new "Casos de Éxito" section, plus a dedicated `caso-tef.html` detail page.

**Architecture:** Two static sites are touched. (1) `Pagina-TEF` gets an additive, query-param-gated "showcase mode" that auto-loops its own hero slogan slider into its real CTA-final reveal animation — no new UI, just a scripted auto-scroll of existing behavior. (2) `BENYI-AGENCY-main` gets a new home-page section whose card embeds that live TEF URL in a scaled, non-interactive iframe inside a browser-chrome frame, plus a static detail page describing what was built.

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES6+). No build step, no test runner, no framework — verification is manual, in a browser, matching the existing convention in both repos.

## Global Constraints

- `Pagina-TEF` changes must be **purely additive**: normal visitors (no `?showcase=1` in the URL) must see zero behavior change.
- `caso-tef.html` content must **not include any fabricated result metrics** (no lead counts, no time-saved figures) — the project is still waiting on client API keys. Describe what was built, not unverified outcomes.
- The embedded iframe must be **non-interactive** (`pointer-events: none`, `tabindex="-1"`) — it is a visual preview, not a live sub-app.
- `BENYI-AGENCY-main` has `auto_commit: false` in `.agent/config.yml` — every task in that repo skips git add/commit and leaves files modified, per that repo's convention (see `docs/superpowers/plans/2026-06-04-navbar-improvement.md` for precedent).
- `Pagina-TEF` has no `.agent/config.yml`, so the documented default (`auto_commit: true`) applies — tasks in that repo commit their own changes, staging **only** the files each task touches (the TEF working tree already has unrelated uncommitted deletions of logo images — do not stage or touch those).

---

### Task 1: Add "showcase mode" auto-loop to the TEF site

**Files:**
- Modify: [Pagina-TEF/script.js](file:///C:/Users/livef/.gemini/antigravity/scratch/Pagina-TEF/script.js) (insert before the closing `});` at line 405)

**Interfaces:**
- Consumes: existing in-scope variables from the same `DOMContentLoaded` closure — `ctaStarted` (let, line ~265), `ctaWords` (NodeList, line ~261), `ctaEyebrow` (Element|null, line ~262), `ctaFinalSub` (Element|null, line ~263), `ctaFinalBtn` (Element|null, line ~264), and the existing `.cta-final` section/`.hero-slogan` elements already in the DOM. Does not modify any of their existing behavior for normal page loads.
- Produces: nothing consumed by later tasks in this repo — Task 2 just deploys this file as-is.

- [ ] **Step 1: Add the showcase loop function**

  Open `script.js` and find the end of the `startCtaRotator` function definition, right before the final closing `});` of the file (currently lines 403-405):
  ```javascript
        }, 3500);
    }

  });
  ```
  Replace it with:
  ```javascript
        }, 3500);
    }

    // =========================================================================
    // SHOWCASE MODE — loop automático del CTA final, activado con ?showcase=1
    // Usado únicamente para el preview embebido en la web de Benia Agency.
    // Sin el query param, el comportamiento normal de la página no cambia.
    // Encuadra el CTA arriba del todo (scroll fijo, una sola vez) para que en
    // el mismo recuadro se vea también el arranque de la sección de Proyectos
    // que va justo debajo, y repite el reveal de palabras en loop sin depender
    // del IntersectionObserver de scroll (llama a runCtaAnimation directamente).
    // =========================================================================
    function runShowcaseLoop() {
        const ctaFinalSection = document.querySelector('.cta-final');
        if (!ctaFinalSection) return;

        ctaFinalSection.scrollIntoView({ behavior: 'auto', block: 'start' });

        function cycle() {
            ctaStarted = false;
            ctaEyebrow?.classList.remove('cta-lit');
            ctaWords.forEach(w => w.classList.remove('cta-lit'));
            ctaFinalSub?.classList.remove('cta-lit');
            ctaFinalBtn?.classList.remove('cta-lit');
            runCtaAnimation();
        }

        cycle();
        setInterval(cycle, 6000);
    }

    if (new URLSearchParams(window.location.search).has('showcase')) {
        runShowcaseLoop();
    }

  });
  ```
  Revision note (post-implementation, per live feedback from Beñat testing the embed): the original hero→scroll→CTA choreography was replaced with this simpler version — no hero phase, no scrolling away and back. It scrolls once to pin `.cta-final` to the top of the viewport (so the `.projects` section's cards, which start immediately below `.cta-final` in the DOM, are visible in the same frame beneath it), then calls `runCtaAnimation()` directly on a 6000ms interval after resetting the `cta-lit` classes — bypassing the scroll-triggered `IntersectionObserver` entirely, since there's no more scroll-away/scroll-back to make it refire naturally. The reveal itself (`runCtaAnimation`, unchanged) takes `500 + 7*320 + 500` ≈ 3240ms to finish lighting up all 8 words, leaving ~2.76s holding before the next cycle.

- [ ] **Step 2: Verify locally without the showcase param**

  Serve the site locally (or open `index.html` directly) and confirm:
  1. The hero slogan slider still rotates normally.
  2. Scrolling manually to the CTA-final section still triggers its reveal exactly once, as before.
  3. No console errors.

- [ ] **Step 3: Verify the showcase loop**

  Load the site with `?showcase=1` appended to the URL (e.g. `index.html?showcase=1`) and confirm:
  1. The page immediately scrolls once so the CTA-final section ("Sin excusas. Lo hacemos bien o no lo hacemos.") sits at the top of the viewport, with the start of the Projects section's cards visible underneath it in the same frame — no hero phase.
  2. The CTA words reveal word-by-word, hold briefly, then reset and replay every ~6s, in a continuous loop (not stuck lit from the first pass).
  3. No console errors.

- [ ] **Step 4: Commit**
  ```bash
  git add script.js
  git commit -m "feat: add showcase-mode auto-loop for Benia Agency embed preview"
  ```

---

### Task 2: Deploy the updated TEF script to the VPS

**Files:** none (deployment step, no local file changes)

**Interfaces:**
- Consumes: the `script.js` committed in Task 1.
- Produces: the live URL `https://tef-web-tef.lodgoa.easypanel.host` serving the showcase-mode code — required before Task 5's embedded iframe (in the Benia repo) will show anything working.

- [ ] **Step 1: Copy the file to the VPS host**
  ```bash
  scp script.js root@187.124.219.156:/tmp/
  ```
  This prompts for the VPS root password (kept in the Hostinger panel — run interactively, do not hardcode it anywhere).

- [ ] **Step 2: Copy the file into the running nginx container**
  ```bash
  ssh root@187.124.219.156 "docker ps --format '{{.Names}}' | grep web-tef | xargs -I{} docker cp /tmp/script.js {}:/usr/share/nginx/html/"
  ```

- [ ] **Step 3: Verify the live deploy**
  Open `https://tef-web-tef.lodgoa.easypanel.host/?showcase=1` in a browser and confirm the same loop behavior verified in Task 1, Step 3, now on the live URL.

---

### Task 3: Fix the footer link and add the "Casos" nav link (Benia Agency)

**Files:**
- Modify: [BENYI-AGENCY-main/index.html](file:///C:/Users/livef/.gemini/antigravity/scratch/BENYI-AGENCY-main/index.html)

- [ ] **Step 1: Add "Casos" to the navbar**

  Find (around line 33-39):
  ```html
            <div class="nav-links" id="nav-links">
                <a href="#hero" class="nav-link">Inicio</a>
                <a href="#servicios" class="nav-link">Servicios</a>
                <a href="#guia-ia" class="nav-link">Guía IA</a>
                <a href="#about" class="nav-link">Nosotros</a>
                <a href="#contacto" class="nav-link nav-btn mobile-only-btn">Contacto</a>
            </div>
  ```
  Replace with:
  ```html
            <div class="nav-links" id="nav-links">
                <a href="#hero" class="nav-link">Inicio</a>
                <a href="#servicios" class="nav-link">Servicios</a>
                <a href="#casos" class="nav-link">Casos</a>
                <a href="#guia-ia" class="nav-link">Guía IA</a>
                <a href="#about" class="nav-link">Nosotros</a>
                <a href="#contacto" class="nav-link nav-btn mobile-only-btn">Contacto</a>
            </div>
  ```

- [ ] **Step 2: Fix the broken footer link**

  Find (around line 544):
  ```html
                    <li><a href="#showcase">Showcase</a></li>
  ```
  Replace with:
  ```html
                    <li><a href="#casos">Casos de Éxito</a></li>
  ```

- [ ] **Step 3: Verify in browser**

  Open `index.html`, confirm "Casos" now appears in the navbar between "Servicios" and "Guía IA" (desktop and mobile hamburger menu), and the footer "Casos de Éxito" link no longer points to a dead `#showcase` anchor (it will 404 to nothing visible until Task 4 adds the `#casos` section — that's expected at this point).

- [ ] **Step 4: Commit/Save changes (Check auto_commit config)**

  Check `.agent/config.yml`: `auto_commit: false` → skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 4: Add the "Casos de Éxito" section markup

**Files:**
- Modify: [BENYI-AGENCY-main/index.html](file:///C:/Users/livef/.gemini/antigravity/scratch/BENYI-AGENCY-main/index.html) (insert between the Testimonials section and the AI Guide section)

**Interfaces:**
- Produces: `#casos` section containing `.case-link-wrapper > .case-card.bento-shell > .bento-core > (.chrome-bar, .preview-viewport#tefPreviewViewport > iframe#tefPreviewFrame, .case-label)` — Task 5 (CSS) and Task 6 (JS) target these exact class/id names.

- [ ] **Step 1: Insert the new section**

  Find the end of the Testimonials section and the start of the AI Guide section (around line 256-259):
  ```html
        </section>

        <!-- AI Guide & Newsletter Section -->
        <section id="guia-ia" class="newsletter-section">
  ```
  Insert a new section between them:
  ```html
        </section>

        <!-- Cases / Showcase Section -->
        <section id="casos" class="showcase-section">
            <div class="container">
                <div class="section-header text-center">
                    <div class="label-reveal" style="display: flex; justify-content: center; margin-bottom: 1rem;">
                        <span class="label-pill">📁 Trabajo Real</span>
                    </div>
                    <h2 class="section-title">Casos de <span class="gradient-text">Éxito</span></h2>
                    <p class="section-subtitle">Proyectos entregados a clientes reales, con automatización de principio a fin.</p>
                </div>
                <div class="cases-grid">
                    <a href="caso-tef.html" class="case-link-wrapper">
                        <div class="case-card bento-shell reveal-hidden">
                            <div class="bento-core">
                                <div class="chrome-bar">
                                    <div class="chrome-dots"><span></span><span></span><span></span></div>
                                    <div class="chrome-url">tef-instalaciones.es</div>
                                    <div class="live-dot" title="En vivo"></div>
                                </div>
                                <div class="preview-viewport" id="tefPreviewViewport">
                                    <iframe id="tefPreviewFrame"
                                        src="https://tef-web-tef.lodgoa.easypanel.host/?showcase=1"
                                        title="Preview en vivo de la web de TEF" loading="lazy"
                                        tabindex="-1"></iframe>
                                </div>
                                <div class="case-label">
                                    <div class="case-label-top">
                                        <span class="case-client">TEF</span>
                                        <span class="case-arrow">
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="12" height="12">
                                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </span>
                                    </div>
                                    <p class="case-desc">Telecomunicaciones e instalaciones eléctricas — web, chatbot y automatización de leads con n8n.</p>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </section>

        <!-- AI Guide & Newsletter Section -->
        <section id="guia-ia" class="newsletter-section">
  ```

- [ ] **Step 2: Verify in browser (unstyled)**

  Open `index.html` and confirm the new "Casos de Éxito" heading and an (unstyled, until Task 5) TEF block appear between Testimonios and Guía IA, and clicking it attempts to navigate to `caso-tef.html` (404 expected until Task 7).

- [ ] **Step 3: Commit/Save changes (Check auto_commit config)**

  `auto_commit: false` → skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 5: Style the "Casos de Éxito" section and card

**Files:**
- Modify: [BENYI-AGENCY-main/styles.css](file:///C:/Users/livef/.gemini/antigravity/scratch/BENYI-AGENCY-main/styles.css) (append new rules; suggested insertion point: end of file)

**Interfaces:**
- Consumes: class/id names produced by Task 4 (`.showcase-section`, `.cases-grid`, `.case-link-wrapper`, `.case-card`, `.chrome-bar`, `.chrome-dots`, `.chrome-url`, `.live-dot`, `.preview-viewport`, `.case-label`, `.case-label-top`, `.case-client`, `.case-arrow`, `.case-desc`) and existing tokens already defined in `:root` (`--primary-rgb`, `--primary-500`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--border-glass`, `--bg-primary`).

- [ ] **Step 1: Append the new CSS block**

  Add at the end of `styles.css`:
  ```css
  /* ============================================================= */
  /* Casos de Éxito (Showcase)                                     */
  /* ============================================================= */
  .showcase-section {
      position: relative;
      padding: 8rem 0;
      background-image: radial-gradient(ellipse 60% 45% at 50% 0%, rgba(var(--primary-rgb), 0.05) 0%, transparent 70%);
  }

  .cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 340px));
      justify-content: center;
      gap: 1.75rem;
      margin-top: 3rem;
  }

  .case-link-wrapper {
      display: block;
      text-decoration: none;
      color: inherit;
  }

  .case-card.bento-shell {
      aspect-ratio: 1 / 1;
      cursor: pointer;
  }

  .case-card .bento-core {
      padding: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
  }

  .case-link-wrapper:hover .case-card.bento-shell {
      background: rgba(var(--primary-rgb), 0.02);
      border-color: rgba(var(--primary-rgb), 0.15);
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  }

  .chrome-bar {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.7rem 0.9rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      flex-shrink: 0;
  }

  .chrome-dots { display: flex; gap: 0.32rem; }
  .chrome-dots span { width: 7px; height: 7px; border-radius: 50%; display: block; }
  .chrome-dots span:nth-child(1) { background: #FF5F57; }
  .chrome-dots span:nth-child(2) { background: #FEBC2E; }
  .chrome-dots span:nth-child(3) { background: #28C840; }

  .chrome-url {
      flex: 1;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 100px;
      padding: 0.2rem 0.7rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      color: var(--text-tertiary);
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
  }

  .live-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--primary-500);
      box-shadow: 0 0 6px var(--primary-500);
      flex-shrink: 0;
      animation: pulse-live-dot 1.8s ease-in-out infinite;
  }

  @keyframes pulse-live-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
  }

  .preview-viewport {
      position: relative;
      flex: 1;
      background: #000000;
      overflow: hidden;
  }

  .preview-viewport iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 390px;
      height: 844px;
      border: 0;
      pointer-events: none;
      transform-origin: top left;
  }

  .case-label {
      padding: 1rem 1.1rem 1.15rem;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      flex-shrink: 0;
  }

  .case-label-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.3rem;
  }

  .case-client {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--text-primary);
  }

  .case-arrow {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-glass);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1);
      flex-shrink: 0;
  }

  .case-link-wrapper:hover .case-arrow {
      background: var(--primary-500);
      border-color: var(--primary-500);
      color: var(--bg-primary);
      transform: rotate(45deg);
  }

  .case-desc {
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.45;
  }

  @media (max-width: 480px) {
      .cases-grid { grid-template-columns: minmax(0, 320px); }
  }
  ```

- [ ] **Step 2: Verify in browser**

  Reload `index.html` and confirm:
  1. The card renders as a rounded square (~340px) with the double-bezel look matching the Services cards.
  2. The top bar shows 3 colored dots, a "tef-instalaciones.es" pill, and a pulsing green dot.
  3. Hovering the card lifts it slightly and the corner arrow turns green and rotates 45°.
  4. The preview area below the chrome bar is solid black (iframe not wired to scale yet — that's Task 6).
  5. On a narrow mobile viewport (< 480px), the card still renders as a legible square, not clipped or overflowing horizontally.

- [ ] **Step 3: Commit/Save changes (Check auto_commit config)**

  `auto_commit: false` → skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 6: Wire up the iframe scaling and the scroll-reveal animation

**Files:**
- Modify: [BENYI-AGENCY-main/script.js](file:///C:/Users/livef/.gemini/antigravity/scratch/BENYI-AGENCY-main/script.js)

**Interfaces:**
- Consumes: `#tefPreviewFrame` and `.preview-viewport` (Task 4), `.case-card` (Task 4) for the reveal-on-scroll observer already defined in this file.
- Produces: `fitPreviewIframes()` — recomputes and applies the iframe's `transform: scale(...)` so its fixed 390px-wide mobile layout fills whatever width the card renders at.

- [ ] **Step 1: Register `.case-card` with the existing scroll-reveal observer**

  Find (around line 48):
  ```javascript
      document.querySelectorAll('.hero-content, .section-header, .bento-card, .newsletter-item, .about-content, .contact-cta-card, .testimonial-wrapper').forEach(el => {
  ```
  Replace with:
  ```javascript
      document.querySelectorAll('.hero-content, .section-header, .bento-card, .newsletter-item, .case-card, .about-content, .contact-cta-card, .testimonial-wrapper').forEach(el => {
  ```

- [ ] **Step 2: Add the iframe auto-scale function**

  Add this block inside the existing `DOMContentLoaded` callback, after the scroll-reveal `observer`/`querySelectorAll` block added in Step 1 (roughly line 52 onward):
  ```javascript

      // Casos de Éxito — escala el iframe de preview (390px mobile) al ancho real de la card
      function fitPreviewIframes() {
          document.querySelectorAll('.preview-viewport iframe').forEach(frame => {
              const viewport = frame.parentElement;
              if (!viewport) return;
              const scale = viewport.clientWidth / 390;
              frame.style.transform = `scale(${scale})`;
          });
      }
      fitPreviewIframes();
      window.addEventListener('resize', fitPreviewIframes);
  ```

- [ ] **Step 3: Verify in browser**

  Reload `index.html` (served over `http://` or `https://`, not `file://`, since the iframe loads a cross-origin URL and some browsers restrict cross-origin iframes on `file://`) and confirm:
  1. The "Sin excusas..." CTA preview appears inside the card, pinned at the top with the Projects cards visible underneath, scaled to fill the width, legible.
  2. The reveal plays, holds briefly, then resets and replays every ~6s, matching Task 1's verified behavior.
  3. Resizing the browser window keeps the preview filling the card width (no gaps, no overflow) at both desktop and mobile widths.
  4. Scrolling the card into view triggers its fade-in (same reveal animation as the other bento cards on the page).
  5. Clicking anywhere on the card navigates to `caso-tef.html` (mouse/keyboard interaction is *not* captured by the iframe, since it's `pointer-events: none`).

- [ ] **Step 4: Commit/Save changes (Check auto_commit config)**

  `auto_commit: false` → skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 7: Build the `caso-tef.html` detail page

**Files:**
- Create: [BENYI-AGENCY-main/caso-tef.html](file:///C:/Users/livef/.gemini/antigravity/scratch/BENYI-AGENCY-main/caso-tef.html)

**Interfaces:**
- Consumes: shared subpage classes already defined in `styles.css` and used by `guia/*.html` — `.subpage-container`, `.subpage-header`, `.breadcrumbs`, `.breadcrumb-separator`, `.breadcrumb-current`, `.subpage-title`, `.subpage-intro`, `.subpage-content`, `.interactive-card`, `.back-btn-wrapper`, `.btn-primary`, `.btn-secondary`, `.gradient-text`. No new CSS needed.

- [ ] **Step 1: Create the file**

  This page lives at the repo root (next to `index.html`, not inside `guia/`), so asset paths are unprefixed (`images/...`, `styles.css`), matching `index.html`'s own paths rather than `guia/*.html`'s `../` paths.

  ```html
  <!DOCTYPE html>
  <html lang="es">

  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Caso de Éxito: TEF — Web, Chatbot y Automatización de Leads | BENIA AGENCY</title>
      <meta name="description"
          content="Cómo diseñamos la web, el chatbot cotizador y la automatización de leads con n8n para TEF, empresa de telecomunicaciones e instalaciones eléctricas.">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet">
      <link rel="stylesheet" href="styles.css">
  </head>

  <body class="dark-mode" style="overflow-y: auto !important;">
      <div id="particles-container"></div>
      <div class="glow-ambient"></div>
      <div class="glow-ambient-left"></div>

      <nav class="navbar" id="navbar">
          <div class="nav-container">
              <div class="nav-left">
                  <a href="index.html" class="logo-link">
                      <img src="images/logo.png" alt="BENIA Logo" class="nav-logo">
                  </a>
                  <div class="nav-status">
                      <span class="status-dot"></span>
                      <span class="status-text">SYS_ONLINE // CASO_TEF</span>
                  </div>
              </div>
              <div class="nav-links" id="nav-links">
                  <a href="index.html" class="nav-link">Inicio</a>
                  <a href="index.html#casos" class="nav-link active">Casos</a>
                  <a href="index.html#contacto" class="nav-link nav-btn">Contacto</a>
              </div>
          </div>
      </nav>

      <main class="subpage-container">
          <header class="subpage-header">
              <div class="breadcrumbs">
                  <a href="index.html">Inicio</a>
                  <span class="breadcrumb-separator">//</span>
                  <a href="index.html#casos">Casos</a>
                  <span class="breadcrumb-separator">//</span>
                  <span class="breadcrumb-current">TEF</span>
              </div>
              <h1 class="subpage-title">TEF — Web, chatbot y <span class="gradient-text">automatización de leads</span></h1>
              <p class="subpage-intro">Telecomunicaciones e Instalaciones Eléctricas · Madrid. Empresa técnica especializada en fibra óptica, instalaciones eléctricas, domótica, antenas y obra nueva, sin presencia web ni sistema de captación de leads antes de este proyecto.</p>
          </header>

          <article class="subpage-content">
              <h2>El reto</h2>
              <p>TEF lleva años trabajando con clientes particulares y constructoras en Madrid, pero dependía por completo del boca a boca. No tenía web, ni un sitio donde un cliente potencial pudiera pedir presupuesto fuera del horario de llamadas, ni ningún sistema para no perder esos contactos entre WhatsApp, llamadas y visitas.</p>

              <h2>Qué se construyó</h2>
              <p>El proyecto se dividió en tres piezas que trabajan juntas:</p>

              <div class="interactive-card">
                  <h3>🌐 Web multi-página</h3>
                  <p>Sitio con hero, sección de servicios (fibra, eléctrico, domótica, antenas, obra nueva), galería de proyectos con filtro por categoría, testimonios y formulario de contacto/presupuesto.</p>
              </div>

              <div class="interactive-card">
                  <h3>💬 Chatbot cotizador</h3>
                  <p>Chat conversacional donde un visitante puede describir lo que necesita y dejar sus datos, conectado directamente a PocketBase para que ningún lead se pierda.</p>
              </div>

              <div class="interactive-card">
                  <h3>⚙️ Automatización de leads con n8n</h3>
                  <p>Pipeline automático: un nuevo lead dispara un webhook → un modelo de IA (Claude Haiku) clasifica la petición → un AI Agent (GPT) redacta una respuesta personalizada → se envía por email y se avisa por Telegram, todo sin intervención manual.</p>
              </div>

              <h2>Stack</h2>
              <p>Web estática (HTML/CSS/JS) + PocketBase como base de datos de leads + n8n para la orquestación de la automatización.</p>

              <h2>Estado actual</h2>
              <p>El proyecto está en fase de puesta en marcha: la web, el chatbot y el pipeline de automatización ya están construidos y probados; queda pendiente la activación final de las credenciales de envío de email del propio cliente antes de pasar a producción completa.</p>

              <div class="back-btn-wrapper" style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                  <a href="index.html#casos" class="btn-secondary">
                      <span>← Ver más casos</span>
                  </a>
                  <a href="index.html#contacto" class="btn-primary">
                      <span>¿Quieres algo similar? Hablemos</span>
                  </a>
              </div>
          </article>
      </main>

      <footer style="padding: 4rem 0; border-top: 1px solid var(--border-glass); margin-top: 5rem; text-align: center; font-size: 0.9rem; color: var(--text-tertiary);">
          <p>&copy; 2026 BENIA AGENCY. Todos los derechos reservados.</p>
      </footer>

      <script>
          document.addEventListener('DOMContentLoaded', () => {
              const particlesContainer = document.getElementById('particles-container');
              if (particlesContainer) {
                  const particleCount = 25;
                  for (let i = 0; i < particleCount; i++) {
                      const particle = document.createElement('div');
                      particle.className = 'particle';
                      const size = Math.random() * 4 + 1;
                      particle.style.width = `${size}px`;
                      particle.style.height = `${size}px`;
                      particle.style.left = Math.random() * 100 + '%';
                      particle.style.top = Math.random() * 100 + '%';
                      particle.style.animationDelay = Math.random() * 20 + 's';
                      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
                      particlesContainer.appendChild(particle);
                  }
              }
          });
      </script>
  </body>

  </html>
  ```

  Note: this reuses `index.html#contacto` (the existing contact form already on the home page) via the final CTA button rather than duplicating the contact form's markup and `/api/leads` fetch logic on this page — matching how `guia/*.html` pages link back rather than re-embedding home-page functionality.

- [ ] **Step 2: Verify in browser**

  Open `caso-tef.html` directly and confirm:
  1. Navbar, breadcrumbs, particles background, and footer render consistently with the `guia/*.html` pages.
  2. All three "Qué se construyó" cards are readable and the "Estado actual" paragraph does not claim any results/metrics.
  3. "← Ver más casos" returns to `index.html#casos`; "¿Quieres algo similar? Hablemos" jumps to `index.html#contacto`.
  4. From `index.html`, clicking the TEF card (added in Task 4) lands here correctly.

- [ ] **Step 3: Commit/Save changes (Check auto_commit config)**

  `auto_commit: false` → skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 8: Final cross-check

**Files:** none (verification only)

- [ ] **Step 1: Full-flow browser pass**

  Starting from `index.html` served over `http`/`https`:
  1. Navbar "Casos" link scrolls to the new section.
  2. The TEF card shows the live embedded preview looping (pinned "Sin excusas..." CTA reveal, Projects cards visible underneath → reset → repeat).
  3. Footer "Casos de Éxito" link works.
  4. Card click → `caso-tef.html` → back link → `index.html#casos`.
  5. Resize to a mobile width (375px) and repeat 1-4; confirm the card stays square and legible, and the navbar's mobile hamburger menu includes "Casos".
  6. Open browser devtools console throughout — zero errors on either page.

- [ ] **Step 2: Confirm TEF's normal (non-showcase) behavior is untouched**

  Visit `https://tef-web-tef.lodgoa.easypanel.host` (no query param) and confirm the hero slogan slider and the CTA-final scroll-triggered reveal behave exactly as before this change (reveal fires once on scroll, not looping).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-12-caso-tef-showcase.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
