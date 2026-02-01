# Implementation Plan - Cloudflare Pages Compatibility

## Goal
Configure the project to be fully compatible with Cloudflare Pages (and other static hosts) by enabling Next.js Static HTML Export.

## Why?
The current project relies on static HTML files (`public/*.html`). Utilizing `output: 'export'` in Next.js offers several benefits:
- **Zero Configuration**: Cloudflare Pages can simply serve the `out/` folder.
- **Performance**: Pure static assets are faster and cheaper than SSR functions.
- **Compatibility**: Works seamlessly on Vercel, Netlify, and Cloudflare.

## Proposed Changes

### Configuration
#### [MODIFY] `next.config.js`
- Add `output: 'export'`.
- Add `images: { unoptimized: true }` (Required for static export, even if not explicitly used, to prevent build errors).

### Documentation
- Update `README.md` (if exists) or create a note about deployment settings.

## Verification Plan

### Manual Verification
1.  **Build**: Run `npm run build`.
2.  **Verify Output**: Check if an `out/` directory is created containing `index.html`, `organica.html`, etc.
3.  **Deployment Settings**: Instruct user to set "Build Command: `npm run build`" and "Output Directory: `out`" on Cloudflare.
