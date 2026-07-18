# Navbar Wording & Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the navbar/footer link "Sobre Mí" to "Nosotros", and improve the links' hover tactile response.

**Architecture:** Change references in the static HTML file and add a micro-interaction using CSS transitions to translate links slightly upwards on hover.

**Tech Stack:** HTML5, Vanilla CSS

---

### Task 1: Update Wording in index.html

**Files:**
- Modify: [index.html](file:///c:/Users/livef/.gemini/antigravity/scratch/BENYI-AGENCY-main/index.html)

- [ ] **Step 1: Modify Navbar Link Wording**
  Change the link text on line 37 from:
  ```html
  <a href="#about" class="nav-link">Sobre Mí</a>
  ```
  to:
  ```html
  <a href="#about" class="nav-link">Nosotros</a>
  ```

- [ ] **Step 2: Modify Footer Link Wording**
  Change the link text on line 505 from:
  ```html
  <li><a href="#about">Sobre Mí</a></li>
  ```
  to:
  ```html
  <li><a href="#about">Nosotros</a></li>
  ```

- [ ] **Step 3: Verify wording changes visually**
  Open `index.html` in a web browser and confirm the main navbar and the footer both display "Nosotros" instead of "Sobre Mí".

- [ ] **Step 4: Commit/Save changes (Check auto_commit config)**
  Check `.agent/config.yml` for the `auto_commit` setting.
  Since `auto_commit: false`, skip commit. Print: "Skipping commit (auto_commit: false)."

---

### Task 2: Polish Hover Interactions in styles.css

**Files:**
- Modify: [styles.css](file:///c:/Users/livef/.gemini/antigravity/scratch/BENYI-AGENCY-main/styles.css)

- [ ] **Step 1: Enhance .nav-link hover styling**
  Find the `.nav-link` block at line 221-234:
  ```css
  .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: color 0.4s cubic-bezier(0.32, 0.72, 0, 1);
      position: relative;
      padding: 0.5rem 0;
      white-space: nowrap;
  }

  .nav-link:hover {
      color: var(--text-primary);
  }
  ```
  And update it to:
  ```css
  .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: color 0.4s cubic-bezier(0.32, 0.72, 0, 1), transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
      position: relative;
      padding: 0.5rem 0;
      white-space: nowrap;
      display: inline-block;
  }

  .nav-link:hover {
      color: var(--text-primary);
      transform: translateY(-1.5px);
  }
  ```

- [ ] **Step 2: Verify micro-interactions in a browser**
  Load the site, hover over navbar links, and verify:
  1. The text moves up by 1.5px smoothly.
  2. The cyber-green underline expands under the link as expected.
  3. No layout shifting or text wrapping occurs.

- [ ] **Step 3: Commit/Save changes (Check auto_commit config)**
  Check `.agent/config.yml` for the `auto_commit` setting.
  Since `auto_commit: false`, skip commit. Print: "Skipping commit (auto_commit: false)."
