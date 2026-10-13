# Deployment checklist

This update adds frontend prototype screens only. It does not contain a Worker API or D1 database, and it must not be described as a production-ready multi-user service.

1. Keep the working Cloudflare deployment configuration unchanged for this first frontend test.
2. On a local machine with dependencies available, run `npm install`, then `npm run build`.
3. Confirm the build creates `dist/` and verify the site loads from its deployed URL, including 3D assets under `models/`.
4. Test the Campaigns and DM Console navigation, seat request, approve/decline actions, campaign create/edit/pause/reopen/delete, browser refresh, and mobile layout.
5. Before using this with real players, implement backend persistence, authentication, authorization, and server-side validation. Browser localStorage is not shared across players and can be edited by the person using the browser.

## Rollback

Commit the changes on a separate branch or retain a copy of the current working source before publishing. Since this archive excludes the original Git metadata, apply its files over a separate Git branch or a fresh working copy; do not replace the `.git` directory of the existing repository.
