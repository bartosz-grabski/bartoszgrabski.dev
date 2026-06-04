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
   - `GOODREADS_PROXY_URL` *(optional)* - https://goodreads-six.vercel.app/goodreads/json?user=<user_id>

### Sanity webhook (automatic deploys on content publish)

1. In Cloudflare Pages → your project → Settings → Deploy Hooks → Add deploy hook → copy the URL
2. In Sanity → your project → API → Webhooks → Add webhook:
   - **URL:** paste the deploy hook URL from Cloudflare
   - **Dataset:** production
   - **Trigger on:** Create, Update, Delete
3. Add the deploy hook URL to `.env` as `CLOUDFLARE_DEPLOY_HOOK_URL` (for reference only — it's not used in code)

### Daily Goodreads cron (Cloudflare Worker)

A Cloudflare Worker in `apps/deploy-trigger` fires the deploy hook daily at 06:00 UTC so the site rebuilds with any new Goodreads books.

**First-time setup:**

1. Authenticate with Cloudflare:
   ```bash
   npx wrangler login
   ```
2. Deploy the Worker (creates it in Cloudflare):
   ```bash
   npm run deploy:trigger
   ```
3. Set the deploy hook secret (get the URL from Cloudflare Pages → your project → Settings → Deploy Hooks):
   ```bash
   cd apps/deploy-trigger
   npx wrangler secret put DEPLOY_HOOK_URL
   ```

To change the schedule, edit `crons` in [`apps/deploy-trigger/wrangler.toml`](apps/deploy-trigger/wrangler.toml) and redeploy.

## Local development

```bash
# Start Next.js dev server
npm run dev:web

# Start Sanity Studio dev server
npm run dev:studio
```
