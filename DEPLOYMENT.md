# Deployment Guide

## Prerequisites

1. Create a Sanity project at https://sanity.io/manage
2. Copy `.env.template` → `.env` and fill in all values
3. Run the seed script: `npm run seed`
4. Upload a portrait photo via Sanity Studio to the `basics.image` field

## Sanity Studio

Deploy to Sanity's own hosting:

```bash
npm run deploy:studio
```

Studio will be available at `https://bartoszgrabski.sanity.studio`.

## Cloudflare Pages

### First-time setup

1. Go to https://dash.cloudflare.com → Pages → Create a project
2. Connect your GitHub repo
3. Set build settings:
   - **Build command:** `npm run build:web`
   - **Build output directory:** `apps/web/out`
   - **Node.js version:** 22
4. Add environment variables (mirror of `.env`):
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`
   - `GOODREADS_PROXY_URL` *(optional)*
   - `NEXT_PUBLIC_GOODREADS_PROXY_URL` *(optional)*

### Sanity webhook (automatic deploys on content publish)

1. In Cloudflare Pages → your project → Settings → Deploy Hooks → Add deploy hook → copy the URL
2. In Sanity → your project → API → Webhooks → Add webhook:
   - **URL:** paste the deploy hook URL from Cloudflare
   - **Dataset:** production
   - **Trigger on:** Create, Update, Delete
3. Add the deploy hook URL to `.env` as `CLOUDFLARE_DEPLOY_HOOK_URL` (for reference only — it's not used in code)

## Local development

```bash
# Start Next.js dev server
npm run dev:web

# Start Sanity Studio dev server
npm run dev:studio
```
