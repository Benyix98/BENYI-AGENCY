# Plan de Implementación: Rediseño Visual SaaS Premium

> **Para trabajadores agenticos:** REQUISITO SUB-HABILIDAD: Usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan paso a paso. Los pasos usan la sintaxis de casillas (`- [ ]`) para el seguimiento.

**Meta:** Transformar visual y estéticamente el sitio web de BENIA AGENCY para erradicar patrones tipo "plantilla de IA" (AI Slop), adoptando el enfoque SaaS Premium (Vercel Style) con tipografías geométricas, carga instantánea, copywriting persuasivo estático y micro-interfaces interactivas en CSS.

**Arquitectura:** Eliminación de scripts pesados y animaciones redundantes (preloader Matrix, partículas flotantes y carrusel de slogans por máquina de escribir) e inyección de layouts puramente CSS/HTML para representar las micro-interfaces (Micro-UIs) técnicas dentro del Bento Grid de servicios.

**Tech Stack:** HTML5, CSS3 vanilla (con Custom Properties y flexbox/grid), JavaScript moderno.

---

### Tarea 1: Limpieza del Marcado y Copywriting del Hero

**Archivos:**
* Modificar: `index.html`

- [ ] **Paso 1: Eliminar preloader Matrix, partículas flotantes y badge "SYS_ONLINE" de la Navbar**
  
  Buscar y eliminar el siguiente bloque de preloader en `index.html`:
  ```html
  <div id="welcome-screen">
      <canvas id="matrix-canvas"></canvas>
      <div class="welcome-content">
          <h1 id="typing-logo"></h1>
          <h2 id="welcome-text" class="hidden">WELCOME</h2>
      </div>
  </div>
  ```
  Eliminar la línea del particles container:
  ```html
  <div id="particles-container"></div>
  ```
  Eliminar el badge `"nav-status"` de la línea 41 a 44 en `index.html`:
  ```html
  <div class="nav-status">
      <span class="status-dot"></span>
      <span class="status-text">SYS_ONLINE // AGENTS ACTIVE</span>
  </div>
  ```

- [ ] **Paso 2: Inyectar el titular principal estático y subtítulo premium**
  
  Reemplazar el contenido del contenedor del Headline (líneas 73-76) en `index.html`:
  ```html
  <h1 class="hero-title-spotlight" id="hero-spotlight">
      Del trabajo manual a la <span class="gradient-text">automatización inteligente</span>
  </h1>
  <p class="hero-subtitle">Convertimos operaciones complejas y repetitivas en sistemas autónomos y estables de IA. Reducción inmediata de hasta el 80% en costes operativos con total transparencia y control.</p>
  ```

- [ ] **Paso 3: Validar que no existan contenedores huérfanos**
  Verificar que los elementos de botones CTA y cabecera del Hero carguen correctamente en el flujo HTML estático.

- [ ] **Paso 4: Confirmar estado del commit (auto_commit en .agent/config.yml)**
  Si `auto_commit: true`: realizar commit de los cambios en index.html.
  Si `auto_commit: false`: omitir commit (auto_commit es false).

---

### Tarea 2: Rediseño de las Tarjetas Bento en HTML (Micro-UIs)

**Archivos:**
* Modificar: `index.html`

- [ ] **Paso 1: Sustituir la imagen de la tarjeta "Automatizaciones de IA" por una Micro-UI de API**
  
  Buscar en `index.html` la tarjeta de Automatizaciones (`data-service="automatizacion"`) y reemplazar el bloque `<div class="bento-visual">` por:
  ```html
  <div class="bento-visual">
      <div class="micro-ui-container workflow-preview">
          <div class="flow-step">
              <span class="flow-icon dot-mint"></span>
              <span class="flow-txt">crm.lead_updated [API Webhook]</span>
          </div>
          <div class="flow-connector"></div>
          <div class="flow-step">
              <span class="flow-icon dot-blue"></span>
              <span class="flow-txt">Make Orquestador [n8n.workflow]</span>
          </div>
          <div class="flow-connector"></div>
          <div class="flow-step">
              <span class="flow-icon dot-check">✓</span>
              <span class="flow-txt">Datos Sincronizados [Google Sheets / ERP]</span>
          </div>
      </div>
  </div>
  ```

- [ ] **Paso 2: Sustituir la imagen de la tarjeta "Landings Inteligentes" por una Micro-UI de Conversión**
  
  Buscar la tarjeta de Landings (`data-service="landings"`) y reemplazar el bloque `<div class="bento-visual">` por:
  ```html
  <div class="bento-visual">
      <div class="micro-ui-container funnel-preview">
          <div class="micro-funnel-header">
              <span class="funnel-title">Conversión en Tiempo Real</span>
              <span class="funnel-stats">24.8% CRO</span>
          </div>
          <div class="micro-funnel-bar-container">
              <div class="funnel-bar bar-100"><span class="bar-lbl">Visitas (100%)</span></div>
              <div class="funnel-bar bar-45"><span class="bar-lbl">Leads IA (45%)</span></div>
              <div class="funnel-bar bar-24"><span class="bar-lbl">Cierres (24.8%)</span></div>
          </div>
      </div>
  </div>
  ```

- [ ] **Paso 3: Sustituir la imagen de la tarjeta "Solución de Problemas" por una Micro-UI de Consola Lógica**
  
  Buscar la tarjeta de Solución de Problemas (`data-service="soluciones-premium"`) y reemplazar el bloque `<div class="bento-visual">` por:
  ```html
  <div class="bento-visual">
      <div class="micro-ui-container console-preview">
          <div class="console-header">
              <span class="console-dot-btn red"></span>
              <span class="console-dot-btn yellow"></span>
              <span class="console-dot-btn green"></span>
              <span class="console-title">debugging_logic.py</span>
          </div>
          <div class="console-body">
              <div class="log-line text-comment"># Resolviendo problema en pasarela</div>
              <div class="log-line text-err">Error: 404 Token variable undefined</div>
              <div class="log-line text-info">Inyectando parche de contingencia...</div>
              <div class="log-line text-success">✓ Conexión establecida [200 OK]</div>
          </div>
      </div>
  </div>
  ```

- [ ] **Paso 4: Sustituir la imagen de la tarjeta "Mentorías Especializadas" por una Micro-UI de Calendario**
  
  Buscar la tarjeta de Mentorías (`data-service="mentorias"`) y reemplazar el bloque `<div class="bento-visual">` por:
  ```html
  <div class="bento-visual">
      <div class="micro-ui-container calendar-preview">
          <div class="micro-calendar-header">
              <span class="cal-title">Sesiones Reservadas</span>
              <span class="cal-month">Mayo 2026</span>
          </div>
          <div class="cal-grid">
              <div class="cal-day muted">27</div>
              <div class="cal-day active">28 <span class="cal-dot"></span></div>
              <div class="cal-day">29</div>
              <div class="cal-day">30</div>
              <div class="cal-day">31</div>
          </div>
          <div class="cal-footer">
              <span class="cal-time">Pack 1h: 17:30 - Mañana</span>
          </div>
      </div>
  </div>
  ```

- [ ] **Paso 5: Confirmar estado del commit (auto_commit en .agent/config.yml)**
  Si `auto_commit: true`: realizar commit de los cambios en index.html.
  Si `auto_commit: false`: omitir commit (auto_commit es false).

---

### Tarea 3: Eliminación de Lógica Animada Cíclica en JS

**Archivos:**
* Modificar: `script.js`

- [ ] **Paso 1: Eliminar preloader Matrix y particles animation scripts**
  
  Eliminar en `script.js` los siguientes bloques:
  * El código del Particle System (líneas 31-47).
  * La secuencia `initWelcomeScreen()` (líneas 113-215).

- [ ] **Paso 2: Eliminar el motor de slogans dinámicos del spotlight**
  
  Eliminar en `script.js` el bloque del carrusel de slogans tipográficos (líneas 410-474):
  * La variable `sloganPool`.
  * La inicialización y ciclo de `cycleSlogans()`.
  
  Asegurar que no queden referencias vacías a `hero-spotlight`.

- [ ] **Paso 3: Validar que el archivo compile y cargue sin errores sintácticos**
  Comprobar que no hay funciones huérfanas ni variables no definidas llamantes.

- [ ] **Paso 4: Confirmar estado del commit (auto_commit en .agent/config.yml)**
  Si `auto_commit: true`: realizar commit de los cambios en script.js.
  Si `auto_commit: false`: omitir commit (auto_commit es false).

---

### Tarea 4: Maquetación y Suavizado del Estilo CSS

**Archivos:**
* Modificar: `styles.css`

- [ ] **Paso 1: Suavizar brillo de ratón (Mouse Glow) y tipografías**
  
  Buscar y ajustar `#global-mouse-glow` y `#hero-mouse-glow` en `styles.css`.
  * Reducir opacidad máxima del background a `0.15` (15%).
  * Aumentar el `blur` radial de `120px` a `250px` para una transición extremadamente fina.
  
  Cambiar estilos de botones CTA para adaptarlos a esquinas SaaS rectangulares (`border-radius: 8px` en lugar de `100px`).

- [ ] **Paso 2: Estilar las nuevas clases de Micro-UIs**
  
  Inyectar en `styles.css` las clases de maquetación de las Micro-UIs dentro de las tarjetas Bento:
  ```css
  /* Micro-UIs Bento Redesign */
  .micro-ui-container {
      width: 100%;
      height: 140px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      overflow: hidden;
      box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.8);
  }
  
  .dot-mint { background: #14F195; box-shadow: 0 0 6px #14F195; }
  .dot-blue { background: #3b82f6; box-shadow: 0 0 6px #3b82f6; }
  .dot-check { color: #14F195; font-weight: bold; }
  
  .flow-step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
  }
  
  .flow-icon {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
  }
  
  .flow-connector {
      width: 1px;
      height: 12px;
      background: rgba(255, 255, 255, 0.08);
      margin-left: 2px;
  }
  
  /* Funnel CRO */
  .funnel-preview {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
  }
  
  .micro-funnel-header {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--text-tertiary);
  }
  
  .funnel-stats {
      color: #14F195;
      font-weight: 600;
  }
  
  .micro-funnel-bar-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 4px;
  }
  
  .funnel-bar {
      height: 16px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      display: flex;
      align-items: center;
      padding: 0 0.5rem;
      font-size: 9px;
      color: var(--text-secondary);
  }
  
  .bar-100 { width: 100%; }
  .bar-45 { width: 65%; border-color: rgba(59, 130, 246, 0.2); background: rgba(59, 130, 246, 0.02); }
  .bar-24 { width: 35%; border-color: rgba(20, 241, 149, 0.2); background: rgba(20, 241, 149, 0.02); }
  
  /* Consola Debugger */
  .console-header {
      display: flex;
      align-items: center;
      gap: 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      padding-bottom: 4px;
  }
  
  .console-dot-btn {
      width: 5px;
      height: 5px;
      border-radius: 50%;
  }
  
  .console-dot-btn.red { background: #ef4444; }
  .console-dot-btn.yellow { background: #eab308; }
  .console-dot-btn.green { background: #22c55e; }
  
  .console-title {
      font-size: 9px;
      color: var(--text-tertiary);
      margin-left: 4px;
  }
  
  .console-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 4px;
      font-size: 9px;
  }
  
  .log-line.text-comment { color: var(--text-quaternary); }
  .log-line.text-err { color: #f87171; }
  .log-line.text-info { color: #60a5fa; }
  .log-line.text-success { color: #4ade80; }
  
  /* Calendario */
  .micro-calendar-header {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--text-tertiary);
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      padding-bottom: 4px;
  }
  
  .cal-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      text-align: center;
      font-size: 10px;
      margin-top: 4px;
      color: var(--text-secondary);
  }
  
  .cal-day.muted { color: var(--text-quaternary); }
  .cal-day.active {
      color: #14F195;
      font-weight: bold;
      position: relative;
  }
  
  .cal-dot {
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 2px;
      background: #14F195;
      border-radius: 50%;
  }
  
  .cal-footer {
      font-size: 9px;
      color: var(--text-tertiary);
      margin-top: auto;
      text-align: right;
  }
  ```

- [ ] **Paso 3: Validar que el espaciado de secciones sea amplio y asimétrico**
  Comprobar que todas las tarjetas Bento cargan la Micro-UI a la perfección sin desbordamientos de layout.

- [ ] **Paso 4: Confirmar estado del commit (auto_commit en .agent/config.yml)**
  Si `auto_commit: true`: realizar commit de los cambios en styles.css.
  Si `auto_commit: false`: omitir commit (auto_commit es false).
