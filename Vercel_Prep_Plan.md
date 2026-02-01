# Implementation Plan - Vercel Deployment Preparation

## Goal
Structure the project to ensure correct deployment on Vercel as a Next.js application, while preserving the existing static site architecture.

## Analysis
- **Project Type**: Hybrid. It uses Next.js infrastructure (`package.json`, `vercel.json`) but the content is purely static HTML/JS/CSS in the root directory.
- **Issue**: Next.js builds (and Vercel deployments) expect source code in `src/app` or `src/pages`. Files in the root are largely ignored/not served, leading to 404 errors.
- **Config**: `next.config.js` contains a deprecated setting `experimental.serverActions: true` which causes build warnings/errors.

## Proposed Changes

### 1. File Migration (Root -> `public/`)
Move all static assets to the `public/` directory so they are served directly by Next.js.
*   **HTML**: `index.html`, `login.html`, `organica.html`, `quimica-geral.html`, `physichem.html`
*   **CSS**: `styles.css`, `login-styles.css`, `organica-styles.css`, `education-styles.css`, `physichem-styles.css`
*   **JavaScript**: `script.js`, `login-script.js`, `organica-game.js`, `organic-tutor.js`, `organic-content.js`, `education-script.js`, `physichem-sim.js`
*   **Images**: Check for any loose image files (none found in root list, but will verify).

### 2. Configuration Fixes
*   **[MODIFY] `next.config.js`**: Remove `experimental.serverActions`.
*   **[MODIFY] `vercel.json`**: Ensure rewrites do not conflict with static files. (The current rewrite `/(.*) -> /` is typical for SPAs but might break multi-page static sites. I will review this).

## Verification Plan

### Automated
1.  **Build**: Run `npm run build` locally. It should complete without the `invalid-next-config` error.

### Manual
1.  **Serve**: Run `npm run start` (or `npx serve public` to test static serving).
2.  **Access**: Open `localhost:3000/organica.html` and verify it loads styles and scripts correctly.
