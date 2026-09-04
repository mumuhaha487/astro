# Astro Blog Studio

Private editor for the Astro blog in this repository. It can run on EdgeOne
Makers or Cloudflare Workers.

## Local development

1. Copy `.dev.vars.example` to `.dev.vars` and set local-only values.
2. Run `pnpm install`.
3. Run `pnpm worker:dev` for the API and `pnpm dev` for the Vite client.

## Deployment

### EdgeOne Makers

Create a Git-connected Makers project with these settings:

- Root directory: `studio`
- Installation command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `dist`
- Node.js: `22.11.0` or newer

Configure `EDITOR_PASSWORD` and `SESSION_SECRET` for the production and preview
environments. `GITHUB_OWNER`, `GITHUB_REPO`, and `GITHUB_BRANCH` default to this
repository. EdgeOne Blob is created automatically on first use and replaces the
Cloudflare R2 binding for drafts, settings, caches, and schedules. The backend
runs in Node.js Cloud Functions so the existing 5 MB image upload limit remains
supported.

### Cloudflare Workers

Create the R2 bucket once, configure Worker secrets, then deploy:

```sh
pnpm wrangler r2 bucket create astro-blog-studio
pnpm wrangler secret put EDITOR_PASSWORD
pnpm wrangler secret put SESSION_SECRET
pnpm deploy
```

The GitHub token is not committed or exposed to the browser bundle. Connect a
fine-grained token with Contents read/write access from the Studio settings. It
is encrypted before being stored in R2.
