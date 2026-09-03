# Astro Blog Studio

Private Cloudflare Worker editor for the Astro blog in this repository.

## Local development

1. Copy `.dev.vars.example` to `.dev.vars` and set local-only values.
2. Run `pnpm install`.
3. Run `pnpm worker:dev` for the API and `pnpm dev` for the Vite client.

## Deployment

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
