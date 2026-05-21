# Portfolio Site — Design Spec
**Date:** 2026-05-21  
**Project:** bartoszgrabski.dev  
**Design source:** Claude Design handoff — `variants/terminal.html`

---

## Overview

Personal portfolio and CV site for Bartosz Grabski. Terminal variant design: dark phosphor-green aesthetic, JetBrains Mono throughout, ASCII UI cues. Content managed in Sanity CMS. Deployed as a static site to Cloudflare Pages, with Sanity Studio deployed separately to Sanity's own hosting.

---

## Decisions log

| Question | Decision |
|---|---|
| Single owner or multi-user? | Single — Bartosz Grabski only |
| Contact form email delivery? | Toast-only for now; email (Resend) added later |
| "Now" section source? | Fully editable in Sanity |
| Portrait photo? | Managed as Sanity image asset |
| Data fetching strategy? | SSG (static export) + Cloudflare Pages + Sanity webhook rebuild |
| Studio deployment? | Sanity's own hosting (`bartoszgrabski.sanity.studio`) |
| Goodreads integration? | Mocked at build time; real Cloudflare proxy wired via env var |

---

## Section 1 — Monorepo structure & tooling

```
bartoszgrabski.dev/
├── apps/
│   ├── web/                    # Next.js 15, output: 'export' → Cloudflare Pages
│   └── studio/                 # Sanity Studio v3 → sanity.studio hosting
├── .nvmrc                      # Node 22 (LTS)
├── .nvmrc.template             # Same content, committed as reference
├── .env                        # gitignored — all secrets
├── .env.template               # committed — documents every key, no values
├── .gitignore
└── package.json                # npm workspaces root
```

**Node version:** 22 LTS — highest common denominator for Next.js 15 (requires ≥18.18), Cloudflare Pages build environment, and Sanity v3.

**Package manager:** npm workspaces — no Turborepo or pnpm. Each `apps/*` has its own `package.json` and scripts. Root orchestrates via `--workspace` flag.

**Deployments:**
- `apps/web` → Cloudflare Pages (static export)
- `apps/studio` → `bartoszgrabski.sanity.studio` via `sanity deploy`

---

## Section 2 — Sanity schema

Two singleton documents. Bilingual fields use `{ en: string, pl: string }` objects — no plugin needed.

### `resume` document

```
basics
  name            string
  email           string
  phone           string
  url             string
  summary         { en, pl }
  image           image (Sanity asset) — portrait photo
  location        { city: string, countryCode: string }
  profiles[]      { network, username, url }

work[]
  name            string            — company name
  position        { en, pl }
  startDate       string            — YYYY or YYYY-MM
  endDate         string            — YYYY, YYYY-MM, or "Present"
  summary         { en, pl }
  highlights[]    { text: { en, pl } }

education[]
  institution     string
  area            { en, pl }        — field of study
  studyType       string            — BSc / MSc
  startDate       string
  endDate         string

skills[]
  name            string            — category label (Languages, Frontend, etc.)
  keywords[]      string

languages[]
  language        string            — Polish, English, German
  fluency         string            — Native / Fluent / Intermediate

projects[]
  name            string
  description     { en, pl }
  roles[]         string
  keywords[]      string
  url             string

speaking[]                          — custom, not in JSON Resume spec
  title           { en, pl }
  venue           string
  year            string

meta
  version         string
  lastModified    datetime
```

### `now` document

```
asOf            string              — "May 2026" / "maj 2026"
building[]      { title: { en, pl }, blurb: { en, pl } }
learning[]      { item: { en, pl } }
reading[]       { title: string, author: string }   — fallback when proxy unavailable
around[]        { item: { en, pl } }
```

---

## Section 3 — Next.js app architecture

### Routing

Single page, hash-based tab navigation (`#cv`, `#now`, `#contact`). Language toggled client-side, persisted in `localStorage`. No Next.js i18n routing (incompatible with `output: 'export'`).

### File structure

```
apps/web/
├── app/
│   ├── layout.tsx              # Root layout — fonts, metadata
│   └── page.tsx                # Server Component — fetches all Sanity data at build time
├── components/
│   ├── layout/
│   │   ├── Masthead.tsx        # Name, role, availability, theme/lang toggles
│   │   ├── Tabs.tsx            # [cv] [now] [contact] tab bar
│   │   └── Footer.tsx
│   ├── cv/
│   │   ├── CVView.tsx          # Two-column layout
│   │   ├── ExperienceList.tsx
│   │   ├── SkillsBlock.tsx
│   │   ├── EducationList.tsx
│   │   ├── SpeakingList.tsx
│   │   └── LanguageList.tsx
│   ├── now/
│   │   ├── NowView.tsx
│   │   └── GoodreadsBooks.tsx  # Client component — live fetch or fallback
│   ├── contact/
│   │   ├── ContactView.tsx
│   │   └── ContactForm.tsx     # Toast-only submit
│   └── ui/
│       ├── Avatar.tsx          # Sanity image + phosphor filter
│       ├── Toast.tsx
│       └── Eyebrow.tsx         # "// section" heading pattern
├── lib/
│   ├── sanity.ts               # Sanity client (read-only CDN)
│   ├── queries.ts              # GROQ queries — fetchResume(), fetchNow()
│   ├── goodreads.ts            # fetchCurrentlyReading() — mock or proxy
│   └── i18n.ts                 # useLang hook, LangContext, EN/PL translation maps
├── styles/
│   ├── globals.css             # Base tokens — ported from design styles.css
│   └── terminal.css            # Terminal overrides — ported from design terminal.css
└── next.config.ts              # output: 'export', images: { unoptimized: true }
```

### Build-time data flow

```
next build
  └── page.tsx (Server Component)
        ├── fetchResume()              → Sanity CDN GROQ
        ├── fetchNow()                 → Sanity CDN GROQ
        └── fetchCurrentlyReading()   → GOODREADS_PROXY_URL env var, or MOCK_BOOKS
              ↓
        All data passed as props to a Client Component shell
              ↓
        Tab state (hash), language toggle, theme toggle — all client-side React state
```

### i18n

`useLang()` hook reads `localStorage('portfolio-lang')`, falling back to `navigator.language`. Returns `lang: 'en' | 'pl'` and `setLang`. All bilingual Sanity fields exposed as `field.en` / `field.pl` — components read `field[lang]`.

---

## Section 4 — Terminal design

CSS custom properties from the design are ported verbatim. No CSS-in-JS.

### Colour tokens (dark mode — default)

| Token | Value |
|---|---|
| `--bg` | `#0a0f0c` |
| `--bg-elev` | `#0f1612` |
| `--ink` | `#c7e6c5` |
| `--ink-soft` | `#7fa37c` |
| `--ink-faint` | `#4a6648` |
| `--accent` | `#6dff95` |
| `--rule` | `#c7e6c526` |
| `--rule-strong` | `#c7e6c544` |

Light mode overrides are defined on `:root[data-theme="light"]`. Accent is always locked to phosphor green in the terminal variant (no accent picker in production).

### Key UI patterns

| Element | CSS rule |
|---|---|
| Name | `.masthead .name::before { content: "$ " }` — accent coloured |
| Role | `.masthead .role::before { content: "# " }` |
| Availability | `::after { content: " ▮" }` with `blink` keyframe |
| Section headers | `.eyebrow::before { content: "// " }` |
| Tabs | `::before { content: "[" }` / `::after { content: "]" }` |
| Bullets | `::before { content: ">" }` replacing the dash |
| Buttons | `[↓ json]` / `[↓ pdf]` — same bracket pattern, `border-radius: 0` |
| Borders | `1px dashed` throughout |
| Font | JetBrains Mono via `next/font/google` — display, body, mono all same |

### Photo treatment

```css
filter: grayscale(100%) contrast(1.4) brightness(0.85) sepia(40%) hue-rotate(60deg);
```
Gives the phosphor-tinted monochrome effect matching the terminal theme.

### Print

Hides tabs, nav, footer, terminal decorations. Forces CV view. A4 layout. Clean output for PDF export via `window.print()`.

---

## Section 5 — Goodreads integration

### `lib/goodreads.ts`

```typescript
export interface Book { title: string; author: string }

const MOCK_BOOKS: Book[] = [
  { title: "A Philosophy of Software Design", author: "John Ousterhout" },
  { title: "Working in Public", author: "Nadia Eghbal" },
]

// Called at build time in page.tsx
export async function fetchCurrentlyReading(): Promise<Book[]> {
  const url = process.env.GOODREADS_PROXY_URL
  if (!url) return MOCK_BOOKS
  try {
    const res = await fetch(url)
    if (!res.ok) return MOCK_BOOKS
    return res.json()
  } catch {
    return MOCK_BOOKS
  }
}
```

### `GoodreadsBooks` client component

Receives `initialBooks` (baked in at build time). On mount, if `NEXT_PUBLIC_GOODREADS_PROXY_URL` is set, attempts a live fetch and replaces the displayed list. Falls back silently to `initialBooks` on any error. No loading spinner — content always visible immediately.

---

## Section 6 — Deployment & environment variables

### `.env.template`

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=                        # read-only CDN token for build-time fetches

# Goodreads proxy (optional — mock used when absent)
GOODREADS_PROXY_URL=                     # server-side, build-time fetch
NEXT_PUBLIC_GOODREADS_PROXY_URL=         # client-side, browser live-fetch

# Cloudflare Pages deploy hook (triggered by Sanity webhook on publish)
CLOUDFLARE_DEPLOY_HOOK_URL=
```

### Cloudflare Pages config

| Setting | Value |
|---|---|
| Build command | `npm run build --workspace=apps/web` |
| Output directory | `apps/web/out` |
| Node version | 22 |
| Env vars | Mirror of `.env` — set in Cloudflare Pages dashboard |

### Sanity webhook

Configured in Sanity project settings: on document publish → POST to `CLOUDFLARE_DEPLOY_HOOK_URL`. Triggers a full static rebuild and deploy (~1–2 min).

### Sanity Studio

```bash
cd apps/studio && sanity deploy
# → https://bartoszgrabski.sanity.studio
```

---

## Out of scope (for later)

- Contact form email delivery (Resend)
- Real Goodreads Cloudflare proxy wiring (swap `GOODREADS_PROXY_URL` env var)
- Analytics
- OG image generation
