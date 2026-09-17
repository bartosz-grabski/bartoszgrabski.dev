# CLAUDE.md

Personal website for Bartosz Grabski — a monorepo with two apps:

- `apps/web` — Next.js frontend (React 19, TypeScript)
- `apps/studio` — Sanity Studio (CMS for content editing)

## Content & Integrations

**Sanity** is the CMS. All content (resume, "now" page, site settings, social channels) is defined as schemas in `apps/studio/schemas/` and fetched in the frontend via GROQ queries in `apps/web/lib/queries.ts`. The Sanity client is in `apps/web/lib/sanity.ts`.

**Goodreads** — currently-reading books are fetched from a proxy URL (`GOODREADS_PROXY_URL` env var) in `apps/web/lib/goodreads.ts`. Falls back to mock data if unavailable.

## Dev

```bash
npm run dev:web      # Next.js on localhost:3000
npm run dev:studio   # Sanity Studio
npm run deploy:studio # Build Studio + deploy to Cloudflare (admin.bartoszgrabski.dev)
npm run seed         # Seed Sanity with initial data (scripts/seed-sanity.ts)
```
### Node.js Environment
This project requires a specific Node.js version defined in `.nvmrc`. Always ensure your environment is synced before installing dependencies or running scripts:

```bash
nvm use                     # Switch to the Node version defined in .nvmrc
# If the version is not installed locally, run: nvm install
```

## Deploy

- **Studio** is self-hosted on Cloudflare Workers (static assets) at https://admin.bartoszgrabski.dev. Config: `apps/studio/wrangler.jsonc`. Deploy with `npm run deploy:studio` (Node 22, wrangler logged in). The old Sanity-hosted deploy is still available as `npm run deploy:sanity --workspace=apps/studio`.
- New Studio origins must be added to Sanity CORS: `sanity cors add <origin> --credentials`.

## Notes

- Read `apps/web/AGENTS.md` before writing Next.js code — this version has breaking API changes.
- GitHub write operations: use the GitHub MCP server, not `gh` CLI (not installed).
