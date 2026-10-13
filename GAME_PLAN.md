# The Realm — Website Game Plan

## Product goal

Build a living, illustrated D&D sourcebook that works as both a Dungeon Master portfolio and a practical campaign hub. The cinematic 3D gate remains the welcome experience; the rest of the site must be useful even for visitors who do not want to scroll through the full animation.

## Product decisions

- **Two ways to join:** public campaign listings accept seat requests for DM approval. Private invitation links will later let invited players join after signing in. An invite must not bypass server-side authentication or role checks.
- **One DM-owned account:** the account owner can manage all campaigns and content. Players can only see campaigns they belong to, plus public listings.
- **Sourcebook visual language:** ink-dark forest, aged parchment, brass/gold details, readable serif typography, restrained page transitions, and reduced-motion support.
- **Keep the current Worker deployment:** the project is already deployed as a Cloudflare Worker serving a Vite-built SPA. Do not migrate to Pages just to add the next features.
- **Never fake production functionality:** the first release uses browser-local demo data. It must be replaced with authenticated API calls and D1 before real players rely on it.

## Architecture target

```text
Browser (React + Vite + Three.js + GSAP)
                 |
          same-origin /api/*
                 |
        Cloudflare Worker API
          |              |
      D1 database     R2 objects
   users, campaigns,   maps, portraits,
   memberships,       handouts, uploads
   applications,
   sessions, lore
```

### Stack

- **Frontend:** keep React + Vite. Keep Three.js / React Three Fiber / GSAP for the cinematic landing page; lazy-load or avoid the 3D scene outside the landing page so dashboard work remains responsive.
- **API/runtime:** Cloudflare Worker, same origin as the frontend.
- **Database:** Cloudflare D1 for structured content; add migrations to version the schema.
- **Media:** Cloudflare R2 for uploaded campaign art, maps, and handouts. Keep public sample assets in `public/`.
- **Authentication:** introduce a Cloudflare-compatible session/auth library (evaluate Better Auth against the required email/social login flow) once D1 is ready. Store secrets as Worker secrets, never in Vite-exposed variables.
- **Deployments:** use GitHub as the source of truth and Cloudflare Workers Builds for push-to-deploy. Keep preview and production configuration separate.

## Core roles and permissions

| Role | Permissions |
|---|---|
| Visitor | View public DM profile, open campaigns, published lore, schedules, and links |
| Player | View joined campaigns, sessions, recaps, roster, handouts, and personal character notes; request a seat |
| DM / owner | Create and edit campaigns, review applications, manage memberships, publish lore and announcements, upload assets |

All permissions must be checked in the Worker/API. Hiding a button in React is not authorization.

## Data model (initial)

- `users`: id, display name, email, role, created timestamp
- `campaigns`: id, owner id, slug, title, system, description, level range, schedule, capacity, visibility, status, created/updated timestamps
- `memberships`: id, campaign id, user id, membership role, status, joined timestamp
- `applications`: id, campaign id, applicant user id, message, status, created/updated timestamps
- `sessions`: id, campaign id, title, starts at, recap, status
- `world_entries`: id, campaign id, type, title, slug, content, visibility, updated timestamp
- `announcements`: id, campaign id, title, content, published timestamp
- `assets`: id, owner id, campaign id, R2 object key, media type, alt text, created timestamp
- Later: `characters`, `invite_tokens`, audit log, notifications.

## Implementation sequence

### Milestone 1 — Usable front end (now)
- Preserve the immersive landing page and make the rest of the site directly navigable.
- Add a campaign directory with clear demo-data labelling.
- Add a request-a-seat form and an application review flow.
- Add a DM console for creating, editing, pausing, and deleting campaign listings.
- Persist prototype changes in browser storage and display an unmistakable demo-only notice.
- Verify the Vite production build and document how to run the app.

### Milestone 2 — Cloudflare backend
- Commit/confirm the Worker build configuration in the repository.
- Create a D1 database and a tracked SQL migration for the initial schema.
- Add typed same-origin `/api` routes for public campaigns and DM operations.
- Validate all input, return useful error states, add rate limits to public application endpoints, and enforce permissions server-side.
- Replace local demo storage only after the API and database have been tested locally and in a preview deployment.

### Milestone 3 — Authentication and player portal
- Add secure sign-in, verified account identity, session handling, and role checks.
- Support application approval and invite-token membership.
- Build player dashboard: joined campaigns, session schedule/recaps, announcements, character notes, and handouts.
- Add safe invite expiry/revocation and capacity checks.

### Milestone 4 — Worldbuilding and quality
- Build editable lore pages, NPC/faction entries, maps, and private/public visibility.
- Add R2 media uploads, file validation, alt text, and upload-size limits.
- Add backups, migrations runbook, error monitoring, accessibility pass, mobile testing, and performance checks.
- Consider heavier animation, audio, or 3D character assets only after the core workflows are dependable.

## Acceptance criteria for Milestone 1

- Visitors can navigate between the landing page, campaign directory, and DM console.
- A visitor can submit a demo seat request and see it in the console.
- The DM can approve or decline a request and see seats update.
- The DM can create, edit, pause/reopen, and delete demo campaign listings.
- Refreshing the same browser retains demo changes.
- Pages explicitly warn that demo data is local to one browser and is not sent to the DM.
- `npm run build` completes successfully.

## Not yet production-ready

Milestone 1 has no real user accounts, no server-side persistence, no email/Discord notifications, no secure invitation links, and no authorization boundary. Browser storage is easy to edit and does not sync between visitors or devices. Do not use this prototype to collect real applications or private player data.

## Execution status — 13 October 2026

- Implemented the Milestone 1 navigation, campaign directory, local demo seat-request flow, DM request review, and campaign CRUD UI.
- Added sourcebook-themed responsive styling and a repeated demo-only notice.
- Static checks passed for JS/JSX syntax, relative imports, CSS brace balance, HTML entry wiring, and sample campaign data.
- **Production build is not yet verified in this environment.** `npm install` failed with `EAI_AGAIN` resolving `registry.npmjs.org`, so dependencies could not be downloaded. Run `npm install` and `npm run build` in the repository or Cloudflare's build environment before deployment.
- The project files are packaged for review. They have not been pushed to GitHub or deployed to Cloudflare from this environment.
