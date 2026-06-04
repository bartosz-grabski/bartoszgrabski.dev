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
npm run seed         # Seed Sanity with initial data (scripts/seed-sanity.ts)
```

## Notes

- Read `apps/web/AGENTS.md` before writing Next.js code — this version has breaking API changes.
- GitHub write operations: use the GitHub MCP server, not `gh` CLI (not installed).
