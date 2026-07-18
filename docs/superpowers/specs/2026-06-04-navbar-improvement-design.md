# Spec: Navbar Improvement & Section Wording Update

## Goal
Improve the navbar visually by implementing subtle micro-interactions and smoother transitions, and change the "Sobre Mí" menu wording to "Nosotros" to align with an agency-centric model.

## Proposed Changes

### Wording Changes
- **Navbar Links (`index.html`)**:
  - Change link text from "Sobre Mí" to "Nosotros" (Line 37).
- **Footer Links (`index.html`)**:
  - Change link text from "Sobre Mí" to "Nosotros" (Line 505).

### Visual Polish
- **Hover Micro-interaction (`styles.css`)**:
  - Add a subtle `transform: translateY(-1.5px)` on `.nav-link:hover` to make links feel interactive and tactile.
  - Update `.nav-link` transition property to include `transform`.
- **Navbar transition (`styles.css`)**:
  - Fine-tune transition settings to ensure switching to the scrolled state is highly fluid.

## Verification Plan
- Load `index.html` in a web browser.
- Verify navbar text shows "Nosotros".
- Verify footer text shows "Nosotros".
- Verify that hover effect on links works correctly (text moves up slightly, green underline expands).
- Verify mobile hamburger menu still works perfectly.
