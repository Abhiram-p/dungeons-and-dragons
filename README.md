# The Realm Awaits — Dungeon Master portfolio and campaign prototype

A scroll-driven fantasy landing page built with React, Vite, Three.js / React Three Fiber, GSAP, and Kenney Fantasy Town Kit models. The project now also includes an interactive campaign directory and a DM console.

## Run locally

Requirements: Node.js 20.19+ (or a current compatible Node.js release) and npm.

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
npm run preview
```

Vite outputs production files to `dist/`.

## Included in this milestone

- Scroll-driven 3D gate, courtyard, animated guards and fantasy critters.
- Campaign directory with status filtering, open-seat counts, and seat-request forms.
- DM console for reviewing seat requests, approving or declining applicants, and creating, editing, pausing, reopening, or deleting campaign listings.
- Browser `localStorage` persistence for demo campaigns and requests.
- Responsive parchment-and-forest styling and the original notice-board entry point.

## Important prototype limits

This is not a live multi-user campaign-management service yet. Campaigns and applications are saved only in the current browser. There is no authentication, shared database, API, email/Discord notification, or secure DM-only authorization. The DM console is intentionally accessible as a demo screen and must not be treated as private. Do not enter sensitive player information.

The next backend milestone should add a Cloudflare Worker API, D1 persistence, authentication, server-side role checks, input validation, and migrations before the site is used with real players.

## Deployment notes

The current project keeps the relative Vite base (`base: './'`), relative entry script in `index.html`, and relative model URLs in `src/App.jsx` so assets can resolve when hosted beneath a path. Keep the build/deploy settings from the currently working Cloudflare project. This source bundle does not add or replace your Cloudflare Worker configuration; verify the existing deployment still builds `dist/` and serves its assets before publishing changes.

## Asset notes

- Environment models are in `public/models/`.
- The Kenney license is preserved at `public/models/LICENSE-KENNEY.txt`.
- The animated guards and creatures are procedural placeholder meshes.
- The sound control is a UI placeholder; no ambient audio file is bundled.

## Main files

- `src/App.jsx`: cinematic scene, navigation, and demo state management.
- `src/styles.css`: presentation and responsive styling.
- `src/components/CampaignDirectory.jsx`: public-facing campaign listings and seat-request forms.
- `src/components/DmDashboard.jsx`: demo DM console and application review.
- `src/components/CampaignForm.jsx`: campaign listing editor.
- `src/data/demoData.js`: sample campaigns and browser storage helpers.
- `GAME_PLAN.md`: phased implementation roadmap.
