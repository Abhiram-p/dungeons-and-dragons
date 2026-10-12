# The Realm Awaits — scroll-driven fantasy website prototype

A Vite + React + Three.js / React Three Fiber prototype built around the uploaded Kenney Fantasy Town Kit. The scroll position drives the 3D camera through four beats: gate, sparring courtyard, curious fantasy creatures, and an interactive notice board.

## Run locally

Requirements: Node.js 20.19+ (or a current compatible Node.js release) and npm.

```bash
npm install
npm run dev
```

Build for deployment:

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Cloudflare Pages

- Framework preset: Vite (or React/Vite)
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 20 or newer

## GitHub deployment

Commit this folder into a new branch in your existing repo to review it separately before replacing your live site. If merging into an existing Vite app, don't overwrite existing content until you have backed it up.

## Asset notes

- Selected GLB models from the user-uploaded Kenney Fantasy Town Kit are in `public/models/`.
- Kenney's included license is `public/models/LICENSE-KENNEY.txt` and declares the pack CC0.
- The soldiers and small creatures are procedural placeholders built from simple Three.js meshes, not downloaded rigged character models. Replace them with suitable rigged GLBs later.
- The Sound button is currently a UI placeholder; no audio file is bundled.
- Campaign/profile text is illustrative and can be edited in `src/App.jsx`.

## Main files

- `src/App.jsx`: scene, scroll position, 3D assets and interactive notice board.
- `src/styles.css`: typography, cinematic overlays, responsive behaviour.
- `public/models/`: selected GLB environment assets and license.
