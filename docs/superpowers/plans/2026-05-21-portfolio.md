# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual EN/PL personal portfolio site for Bartosz Grabski with a terminal aesthetic, powered by Sanity CMS, deployed as a static export to Cloudflare Pages.

**Architecture:** Next.js 15 App Router with `output: 'export'` (SSG). All CMS data fetched at build time from Sanity CDN via GROQ and passed as props to a Client Component shell that manages tab state, language, and theme client-side. Sanity Studio deployed separately to `sanity.studio` hosting.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Sanity v3, `@sanity/client` v6, `@sanity/image-url` v1, JetBrains Mono via `next/font/google`, Jest 29, React Testing Library 16, Node 22 LTS

---

## File map

```
bartoszgrabski.dev/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root layout, fonts, theme-init script
│   │   │   └── page.tsx                # Server Component — build-time data fetch
│   │   ├── components/
│   │   │   ├── Portfolio.tsx           # Client Component shell — tab/lang/theme state
│   │   │   ├── layout/
│   │   │   │   ├── Masthead.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── cv/
│   │   │   │   ├── CVView.tsx
│   │   │   │   ├── ExperienceList.tsx
│   │   │   │   ├── SkillsBlock.tsx
│   │   │   │   ├── EducationList.tsx
│   │   │   │   ├── SpeakingList.tsx
│   │   │   │   └── LanguageList.tsx
│   │   │   ├── now/
│   │   │   │   ├── NowView.tsx
│   │   │   │   └── GoodreadsBooks.tsx  # 'use client' — live-fetches on mount
│   │   │   ├── contact/
│   │   │   │   ├── ContactView.tsx
│   │   │   │   └── ContactForm.tsx     # 'use client' — toast-only submit
│   │   │   └── ui/
│   │   │       ├── Avatar.tsx
│   │   │       ├── Eyebrow.tsx
│   │   │       └── Toast.tsx
│   │   ├── lib/
│   │   │   ├── types.ts                # All TypeScript interfaces
│   │   │   ├── sanity.ts               # Sanity CDN client
│   │   │   ├── queries.ts              # fetchResume(), fetchNow()
│   │   │   ├── goodreads.ts            # fetchCurrentlyReading()
│   │   │   ├── translations.ts         # Static EN/PL UI strings
│   │   │   └── i18n.ts                 # LangContext, useLang(), LangProvider
│   │   ├── styles/
│   │   │   ├── globals.css             # Design tokens + layout (from styles.css)
│   │   │   └── terminal.css            # Terminal overrides (from terminal.css)
│   │   ├── __tests__/
│   │   │   ├── goodreads.test.ts
│   │   │   ├── i18n.test.tsx
│   │   │   └── ContactForm.test.tsx
│   │   ├── jest.config.ts
│   │   ├── jest.setup.ts
│   │   └── next.config.ts
│   └── studio/
│       ├── schemas/
│       │   ├── helpers.ts              # bilingualField(), bilingualText()
│       │   ├── resume.ts
│       │   ├── now.ts
│       │   └── index.ts
│       ├── sanity.config.ts
│       └── package.json
├── scripts/
│   └── seed-sanity.ts                  # One-time seed from design data
├── .nvmrc
├── .nvmrc.template
├── .env                                # gitignored
├── .env.template
├── .gitignore
└── package.json                        # npm workspaces root
```

---

## Task 1: Monorepo root scaffold

**Files:**
- Create: `package.json`
- Create: `.nvmrc`
- Create: `.nvmrc.template`
- Create: `.gitignore`
- Create: `.env.template`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "bartoszgrabski-dev",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev:web": "npm run dev --workspace=apps/web",
    "dev:studio": "npm run dev --workspace=apps/studio",
    "build:web": "npm run build --workspace=apps/web",
    "deploy:studio": "npm run deploy --workspace=apps/studio",
    "test": "npm run test --workspace=apps/web"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

- [ ] **Step 2: Create .nvmrc and .nvmrc.template**

```
22
```

Both files get the same content — `22` on a single line.

- [ ] **Step 3: Create .gitignore**

```
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.*.local

# Build outputs
apps/web/.next/
apps/web/out/
apps/studio/dist/

# OS
.DS_Store

# Sanity
apps/studio/.sanity/
```

- [ ] **Step 4: Create .env.template**

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=              # read-only CDN token for build-time fetches

# Goodreads proxy (optional — mock used when absent)
GOODREADS_PROXY_URL=           # server-side, build-time fetch
NEXT_PUBLIC_GOODREADS_PROXY_URL= # client-side, browser live-fetch

# Cloudflare Pages deploy hook (triggered by Sanity webhook on publish)
CLOUDFLARE_DEPLOY_HOOK_URL=
```

- [ ] **Step 5: Create .env by copying the template (fill in real values later)**

```bash
cp .env.template .env
```

- [ ] **Step 6: Commit**

```bash
git add package.json .nvmrc .nvmrc.template .gitignore .env.template
git commit -m "chore: monorepo root scaffold"
```

---

## Task 2: Sanity Studio scaffold

**Files:**
- Create: `apps/studio/package.json`
- Create: `apps/studio/tsconfig.json`
- Create: `apps/studio/sanity.config.ts`
- Create: `apps/studio/schemas/index.ts`

- [ ] **Step 1: Create apps/studio/package.json**

```json
{
  "name": "studio",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "sanity dev",
    "build": "sanity build",
    "deploy": "sanity deploy"
  },
  "dependencies": {
    "@sanity/vision": "^3.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "sanity": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

Note: Sanity Studio uses React 18 (separate from the web app which uses React 19 — workspaces keep them isolated).

- [ ] **Step 2: Create apps/studio/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "esModuleInterop": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create apps/studio/schemas/index.ts (empty for now)**

```typescript
export const schemaTypes: unknown[] = []
```

- [ ] **Step 4: Create apps/studio/sanity.config.ts**

```typescript
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'bartoszgrabski.dev',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
```

- [ ] **Step 5: Install Studio dependencies**

```bash
npm install --workspace=apps/studio
```

Expected: installs sanity, react 18, @sanity/vision into apps/studio/node_modules.

- [ ] **Step 6: Commit**

```bash
git add apps/studio/
git commit -m "chore: scaffold Sanity Studio"
```

---

## Task 3: Sanity schema helpers

**Files:**
- Create: `apps/studio/schemas/helpers.ts`

- [ ] **Step 1: Create apps/studio/schemas/helpers.ts**

```typescript
import { defineField } from 'sanity'

/** Inline object with `en` and `pl` string fields */
export function bilingualField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({ name: 'en', title: 'English', type: 'string', validation: r => r.required() }),
      defineField({ name: 'pl', title: 'Polski', type: 'string', validation: r => r.required() }),
    ],
  })
}

/** Same but multi-line text */
export function bilingualText(name: string, title: string) {
  return defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({ name: 'en', title: 'English', type: 'text', rows: 3 }),
      defineField({ name: 'pl', title: 'Polski', type: 'text', rows: 3 }),
    ],
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/studio/schemas/helpers.ts
git commit -m "feat(studio): add bilingual schema helpers"
```

---

## Task 4: Sanity `resume` schema

**Files:**
- Create: `apps/studio/schemas/resume.ts`
- Modify: `apps/studio/schemas/index.ts`

- [ ] **Step 1: Create apps/studio/schemas/resume.ts**

```typescript
import { defineField, defineType } from 'sanity'
import { bilingualField, bilingualText } from './helpers'

export const resumeSchema = defineType({
  name: 'resume',
  title: 'Resume',
  type: 'document',
  fields: [
    defineField({
      name: 'basics',
      title: 'Basics',
      type: 'object',
      fields: [
        defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
        defineField({ name: 'url', title: 'Website URL', type: 'url' }),
        bilingualText('summary', 'Summary'),
        defineField({ name: 'image', title: 'Portrait Photo', type: 'image', options: { hotspot: true } }),
        defineField({
          name: 'location',
          title: 'Location',
          type: 'object',
          fields: [
            defineField({ name: 'city', title: 'City', type: 'string' }),
            defineField({ name: 'countryCode', title: 'Country Code', type: 'string' }),
          ],
        }),
        defineField({
          name: 'profiles',
          title: 'Profiles',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'network', title: 'Network', type: 'string' }),
              defineField({ name: 'username', title: 'Username', type: 'string' }),
              defineField({ name: 'url', title: 'URL', type: 'url' }),
            ],
          }],
        }),
      ],
    }),
    defineField({
      name: 'work',
      title: 'Work Experience',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Company', type: 'string', validation: r => r.required() }),
          bilingualField('position', 'Position / Role'),
          defineField({ name: 'startDate', title: 'Start Date (YYYY or YYYY-MM)', type: 'string' }),
          defineField({ name: 'endDate', title: 'End Date (YYYY, YYYY-MM, or "Present")', type: 'string' }),
          bilingualText('summary', 'Summary'),
          defineField({
            name: 'highlights',
            title: 'Highlights',
            type: 'array',
            of: [{
              type: 'object',
              fields: [bilingualField('text', 'Bullet text')],
            }],
          }),
        ],
      }],
    }),
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'institution', title: 'Institution', type: 'string' }),
          bilingualField('area', 'Area / Degree title'),
          defineField({ name: 'studyType', title: 'Study Type (BSc / MSc)', type: 'string' }),
          defineField({ name: 'startDate', title: 'Start', type: 'string' }),
          defineField({ name: 'endDate', title: 'End', type: 'string' }),
        ],
      }],
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Category', type: 'string' }),
          defineField({ name: 'keywords', title: 'Keywords', type: 'array', of: [{ type: 'string' }] }),
        ],
      }],
    }),
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'language', title: 'Language', type: 'string' }),
          defineField({ name: 'fluency', title: 'Fluency', type: 'string' }),
        ],
      }],
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Name', type: 'string' }),
          bilingualText('description', 'Description'),
          defineField({ name: 'roles', title: 'Roles', type: 'array', of: [{ type: 'string' }] }),
          defineField({ name: 'keywords', title: 'Keywords', type: 'array', of: [{ type: 'string' }] }),
          defineField({ name: 'url', title: 'URL', type: 'url' }),
        ],
      }],
    }),
    defineField({
      name: 'speaking',
      title: 'Speaking',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          bilingualField('title', 'Talk Title'),
          defineField({ name: 'venue', title: 'Venue', type: 'string' }),
          defineField({ name: 'year', title: 'Year', type: 'string' }),
        ],
      }],
    }),
  ],
  preview: {
    select: { title: 'basics.name' },
  },
})
```

- [ ] **Step 2: Register schema in index.ts**

```typescript
import { resumeSchema } from './resume'

export const schemaTypes = [resumeSchema]
```

- [ ] **Step 3: Commit**

```bash
git add apps/studio/schemas/resume.ts apps/studio/schemas/index.ts
git commit -m "feat(studio): add resume schema"
```

---

## Task 5: Sanity `now` schema

**Files:**
- Create: `apps/studio/schemas/now.ts`
- Modify: `apps/studio/schemas/index.ts`

- [ ] **Step 1: Create apps/studio/schemas/now.ts**

```typescript
import { defineField, defineType } from 'sanity'
import { bilingualField, bilingualText } from './helpers'

export const nowSchema = defineType({
  name: 'now',
  title: 'Now',
  type: 'document',
  fields: [
    defineField({
      name: 'asOf',
      title: 'As of (display string, e.g. "May 2026")',
      type: 'object',
      fields: [
        defineField({ name: 'en', title: 'English', type: 'string' }),
        defineField({ name: 'pl', title: 'Polski', type: 'string' }),
      ],
    }),
    defineField({
      name: 'building',
      title: 'Building',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          bilingualField('title', 'Title'),
          bilingualText('blurb', 'Blurb'),
        ],
      }],
    }),
    defineField({
      name: 'learning',
      title: 'Learning',
      type: 'array',
      of: [{ type: 'object', fields: [bilingualField('item', 'Item')] }],
    }),
    defineField({
      name: 'reading',
      title: 'Reading (fallback when Goodreads proxy unavailable)',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Book Title', type: 'string' }),
          defineField({ name: 'author', title: 'Author', type: 'string' }),
        ],
      }],
    }),
    defineField({
      name: 'around',
      title: 'Around',
      type: 'array',
      of: [{ type: 'object', fields: [bilingualField('item', 'Item')] }],
    }),
  ],
})
```

- [ ] **Step 2: Register in index.ts**

```typescript
import { resumeSchema } from './resume'
import { nowSchema } from './now'

export const schemaTypes = [resumeSchema, nowSchema]
```

- [ ] **Step 3: Commit**

```bash
git add apps/studio/schemas/now.ts apps/studio/schemas/index.ts
git commit -m "feat(studio): add now schema"
```

---

## Task 6: Next.js web app scaffold

**Files:**
- Create: `apps/web/` (via create-next-app)
- Create: `apps/web/jest.config.ts`
- Create: `apps/web/jest.setup.ts`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd apps && npx create-next-app@latest web \
  --typescript \
  --no-tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

When prompted, accept defaults. This creates `apps/web/` with App Router, TypeScript, ESLint.

- [ ] **Step 2: Remove boilerplate**

Delete the generated placeholder files:
```bash
rm apps/web/app/page.tsx
rm apps/web/app/globals.css
rm -rf apps/web/public/*
```

- [ ] **Step 3: Install app dependencies**

```bash
npm install --workspace=apps/web \
  @sanity/client@^6 \
  @sanity/image-url@^1 \
  next-sanity@^9
```

- [ ] **Step 4: Install test dependencies**

```bash
npm install --workspace=apps/web --save-dev \
  jest@^29 \
  jest-environment-jsdom@^29 \
  @testing-library/react@^16 \
  @testing-library/jest-dom@^6 \
  @testing-library/user-event@^14 \
  @types/jest@^29 \
  ts-jest@^29
```

- [ ] **Step 5: Create apps/web/jest.config.ts**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 6: Create apps/web/jest.setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Add test script to apps/web/package.json**

Open `apps/web/package.json` and add to `"scripts"`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 8: Verify jest runs (no tests yet)**

```bash
npm test --workspace=apps/web
```

Expected: `No tests found, exiting with code 1` — that's fine, setup works.

- [ ] **Step 9: Commit**

```bash
git add apps/web/
git commit -m "chore(web): scaffold Next.js app with jest"
```

---

## Task 7: CSS — globals and terminal overrides

**Files:**
- Create: `apps/web/styles/globals.css`
- Create: `apps/web/styles/terminal.css`

- [ ] **Step 1: Create apps/web/styles/globals.css**

This is the base design system, ported verbatim from the design's `styles.css`:

```css
/* Portfolio — base design system */

:root {
  --bg: #f5f6f4;
  --bg-elev: #ffffff;
  --ink: #0f1115;
  --ink-soft: #404552;
  --ink-faint: #8a8f99;
  --rule: #0f111522;
  --rule-strong: #0f111540;
  --accent: oklch(56% 0.12 252);
  --accent-soft: oklch(56% 0.12 252 / 0.12);
  --font-display: var(--font-jetbrains), ui-monospace, monospace;
  --font-body: var(--font-jetbrains), ui-monospace, monospace;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;
  --pad-x: clamp(20px, 5vw, 64px);
  --col-gap: clamp(24px, 4vw, 80px);
  --row-gap: clamp(20px, 3vw, 40px);
  --section-gap: clamp(40px, 6vw, 96px);
}

:root[data-theme="dark"] {
  --bg: #0c0e12;
  --bg-elev: #14171d;
  --ink: #eef0f4;
  --ink-soft: #a8aeba;
  --ink-faint: #5e6470;
  --rule: #eef0f422;
  --rule-strong: #eef0f440;
  --accent: oklch(72% 0.11 252);
  --accent-soft: oklch(72% 0.11 252 / 0.16);
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
html { background: var(--bg); color: var(--ink); }
body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--ink);
  font-size: 16px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  transition: background-color 200ms ease, color 200ms ease;
}
a { color: inherit; }
button { font-family: inherit; }

.shell {
  max-width: 1240px;
  margin: 0 auto;
  padding: clamp(24px, 4vw, 56px) var(--pad-x) 96px;
}

.avatar-wrap {
  position: relative;
  isolation: isolate;
  display: block;
  margin: 0 0 28px;
  width: 100%;
  max-width: 220px;
}
.avatar-slot {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  background: var(--bg-elev);
  box-shadow: 0 0 0 1px var(--rule-strong);
  object-fit: cover;
}

.masthead {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px 32px;
  align-items: end;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--rule-strong);
}
.masthead .name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(36px, 5.8vw, 64px);
  line-height: 1;
  letter-spacing: -0.025em;
  margin: 0 0 6px;
}
.masthead .name em { font-style: normal; font-weight: 600; color: var(--accent); }
.masthead .role {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin: 0;
}
.masthead .right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
}
.masthead .right .avail { display: inline-flex; align-items: center; gap: 8px; }
.masthead .right .avail::before {
  content: "";
  width: 8px; height: 8px; border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.theme-toggle {
  margin-top: 8px;
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid var(--rule-strong);
  background: transparent;
  color: var(--ink);
  padding: 6px 10px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}
.theme-toggle:hover { background: var(--accent-soft); border-color: var(--accent); }
.header-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.header-actions .theme-toggle { margin-top: 0; }
.lang-pill { display: inline-flex; gap: 4px; align-items: center; font-family: var(--font-mono); letter-spacing: 0.06em; }
.lang-pill .on { color: var(--accent); }
.lang-pill .sep { color: var(--ink-faint); }

.tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 24px 0 var(--section-gap);
  flex-wrap: wrap;
}
.tabs nav { display: flex; gap: 4px; flex-wrap: wrap; }
.tab {
  background: transparent;
  border: none;
  padding: 10px 16px 10px 0;
  margin-right: 8px;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 18px;
  letter-spacing: -0.01em;
  color: var(--ink-faint);
  cursor: pointer;
  position: relative;
  transition: color 150ms ease;
  line-height: 1;
}
.tab:hover { color: var(--ink-soft); }
.tab[aria-current="page"] { color: var(--ink); }
.tab[aria-current="page"]::after {
  content: "";
  position: absolute;
  left: 0; right: 8px; bottom: -2px;
  height: 1px;
  background: var(--accent);
}
.cv-actions { display: flex; gap: 8px; }
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--rule-strong);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  text-decoration: none;
  transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
}
.btn:hover { background: var(--accent-soft); border-color: var(--accent); color: var(--ink); }
.btn.primary { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.btn.primary:hover { background: var(--accent); border-color: var(--accent); color: #fff; }

.cv {
  display: grid;
  grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
  gap: var(--col-gap);
}
.cv .meta-col > section + section { margin-top: var(--section-gap); }
.cv .main-col > section + section { margin-top: var(--section-gap); }

.eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin: 0 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--rule);
}

.bio p { font-size: 17px; line-height: 1.5; margin: 0 0 12px; color: var(--ink); text-wrap: pretty; letter-spacing: -0.005em; }
.bio p + p { color: var(--ink-soft); font-size: 15px; line-height: 1.55; }

.exp-item { padding: 22px 0; border-bottom: 1px solid var(--rule); }
.exp-item:first-child { padding-top: 0; }
.exp-item:last-child { border-bottom: none; }
.exp-head { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: baseline; }
.exp-head .role { font-family: var(--font-display); font-size: 22px; line-height: 1.2; margin: 0; font-weight: 600; letter-spacing: -0.01em; }
.exp-head .role .at { color: var(--ink-faint); font-weight: 400; }
.exp-head .role .co { color: var(--ink); }
.exp-head .role em { font-style: normal; color: var(--accent); }
.exp-head .dates { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--ink-soft); white-space: nowrap; }
.exp-loc { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; color: var(--ink-faint); text-transform: uppercase; margin: 4px 0 0; }
.exp-summary { margin: 10px 0 12px; color: var(--ink-soft); max-width: 60ch; }
.exp-bullets { margin: 0; padding: 0; list-style: none; }
.exp-bullets li { position: relative; padding: 6px 0 6px 22px; color: var(--ink); max-width: 65ch; }
.exp-bullets li::before { content: ""; position: absolute; left: 0; top: 15px; width: 10px; height: 1px; background: var(--accent); }

.skill-block + .skill-block { margin-top: 14px; }
.skill-block .label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faint); margin: 0 0 4px; }
.skill-block .items { color: var(--ink); line-height: 1.45; }

.edu-item, .talk-item, .lang-item { padding: 10px 0; border-bottom: 1px dashed var(--rule); }
.edu-item:last-child, .talk-item:last-child, .lang-item:last-child { border-bottom: none; }
.edu-item .school, .talk-item .title, .lang-item .name { font-family: var(--font-display); font-weight: 500; font-size: 15px; line-height: 1.3; margin: 0; letter-spacing: -0.005em; }
.edu-item .degree, .talk-item .venue, .lang-item .level { font-size: 13px; color: var(--ink-soft); margin: 2px 0 0; }
.edu-item .dates, .talk-item .year { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--ink-faint); margin-top: 2px; }

.now { --now-label-col: 160px; }
.now-head { display: grid; grid-template-columns: 1fr auto; gap: 16px 24px; align-items: end; margin-bottom: var(--section-gap); padding-bottom: 18px; border-bottom: 1px solid var(--rule-strong); }
.now-intro { font-size: 17px; line-height: 1.5; color: var(--ink-soft); margin: 10px 0 0; max-width: 60ch; text-wrap: pretty; }
.now-asof { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint); white-space: nowrap; }
.now-list { margin: 0; padding: 0; display: flex; flex-direction: column; }
.now-row { display: grid; grid-template-columns: var(--now-label-col) minmax(0, 1fr); gap: 24px; align-items: baseline; padding: 28px 0; border-top: 1px solid var(--rule); }
.now-row:last-child { border-bottom: 1px solid var(--rule); }
.now-row dt { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); margin: 0; }
.now-row dd { margin: 0; color: var(--ink); }
.now-item + .now-item { margin-top: 18px; }
.now-title { font-family: var(--font-display); font-weight: 600; font-size: clamp(20px, 2.4vw, 24px); line-height: 1.2; letter-spacing: -0.015em; margin: 0 0 4px; }
.now-blurb { color: var(--ink-soft); font-size: 15px; line-height: 1.55; margin: 0; max-width: 60ch; text-wrap: pretty; }
.now-inline { font-family: var(--font-display); font-weight: 500; font-size: 17px; line-height: 1.5; color: var(--ink); margin: 0; letter-spacing: -0.005em; }
.now-line { margin: 0; padding: 4px 0; font-size: 16px; line-height: 1.5; color: var(--ink); }
.now-line + .now-line { border-top: 1px dashed var(--rule); }
.book-title { font-family: var(--font-display); font-weight: 500; }
.book-author { color: var(--ink-faint); }

.contact { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--col-gap); align-items: start; }
.contact .statement h2 { font-family: var(--font-display); font-size: clamp(36px, 5.5vw, 64px); font-weight: 600; line-height: 1; letter-spacing: -0.03em; margin: 0 0 20px; }
.contact .statement h2 em { color: var(--accent); font-style: normal; }
.contact .statement p { font-size: 17px; line-height: 1.55; color: var(--ink-soft); margin: 0 0 14px; max-width: 40ch; text-wrap: pretty; }
.contact .statement .signed { font-family: var(--font-display); font-style: normal; font-weight: 500; font-size: 17px; color: var(--ink); margin-top: 32px; }
.contact-list { display: flex; flex-direction: column; }
.contact-row { display: grid; grid-template-columns: 110px 1fr auto; gap: 20px; align-items: center; padding: 22px 0; border-top: 1px solid var(--rule); text-decoration: none; color: inherit; transition: padding-left 220ms ease; }
.contact-list .contact-row:last-child { border-bottom: 1px solid var(--rule); }
.contact-row:hover { padding-left: 12px; }
.contact-row:hover .handle { color: var(--accent); }
.contact-row:hover .arrow { transform: translateX(4px); color: var(--accent); }
.contact-row .label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); }
.contact-row .handle { font-family: var(--font-display); font-weight: 500; font-size: clamp(17px, 2vw, 22px); letter-spacing: -0.01em; color: var(--ink); transition: color 200ms ease; word-break: break-word; }
.contact-row .arrow { font-size: 20px; color: var(--ink-faint); transition: transform 200ms ease, color 200ms ease; }
.form-section { margin-top: var(--section-gap); }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.field label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faint); }
.field input, .field textarea { background: transparent; border: none; border-bottom: 1px solid var(--rule-strong); color: var(--ink); font-family: var(--font-body); font-size: 17px; padding: 6px 0 8px; outline: none; transition: border-color 150ms ease; resize: vertical; }
.field input:focus, .field textarea:focus { border-color: var(--accent); }
.field textarea { min-height: 90px; font-size: 15px; line-height: 1.55; }

.footer { margin-top: 96px; padding-top: 18px; border-top: 1px solid var(--rule); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; color: var(--ink-faint); }

.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(16px); background: var(--ink); color: var(--bg); padding: 10px 16px; border-radius: 999px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0; pointer-events: none; transition: opacity 200ms ease, transform 200ms ease; z-index: 100; }
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

@media (max-width: 820px) {
  .avatar-wrap { max-width: 140px; margin: 0 auto 20px; }
  .masthead { grid-template-columns: 1fr; align-items: start; }
  .masthead .right { align-items: flex-start; text-align: left; }
  .header-actions { justify-content: flex-start; }
  .cv { grid-template-columns: 1fr; }
  .cv .meta-col { order: 2; }
  .cv .main-col { order: 1; }
  .now-row { grid-template-columns: 1fr; gap: 6px; padding: 22px 0; }
  .now { --now-label-col: 1fr; }
  .contact { grid-template-columns: 1fr; }
  .contact-row { grid-template-columns: 90px 1fr auto; gap: 14px; }
  .tab { font-size: 18px; padding-right: 4px; }
}
@media (max-width: 480px) {
  .contact-row { grid-template-columns: 1fr auto; }
  .contact-row .label { grid-column: 1 / -1; }
}

@media print {
  @page { size: A4; margin: 16mm 14mm; }
  body { background: #fff !important; color: #000 !important; font-size: 11pt; }
  .no-print, .theme-toggle, .footer, .cv-actions, .tabs { display: none !important; }
  .shell { padding: 0; max-width: none; }
  .masthead { border-bottom: 1px solid #000; padding-bottom: 10px; }
  .masthead .name { font-size: 32pt; }
  .masthead .name em { color: #000; }
  .cv { grid-template-columns: 220px 1fr; gap: 28px; }
  .exp-item { page-break-inside: avoid; padding: 14px 0; }
  .exp-bullets li::before { background: #000; }
  .eyebrow { color: #555; border-color: #ccc; }
  a { color: #000; text-decoration: none; }
}
```

- [ ] **Step 2: Create apps/web/styles/terminal.css**

```css
/* Terminal variant overrides — loaded after globals.css */

:root {
  --bg: #0a0f0c;
  --bg-elev: #0f1612;
  --ink: #c7e6c5;
  --ink-soft: #7fa37c;
  --ink-faint: #4a6648;
  --rule: #c7e6c526;
  --rule-strong: #c7e6c544;
  --accent: #6dff95;
  --accent-soft: #6dff9518;
}
:root[data-theme="light"] {
  --bg: #f1f4ef;
  --bg-elev: #ffffff;
  --ink: #1a2418;
  --ink-soft: #4a5e47;
  --ink-faint: #8a9a87;
  --rule: #1a241829;
  --rule-strong: #1a241852;
  --accent: #1f6b3a;
  --accent-soft: #1f6b3a18;
}

body { font-family: var(--font-body); font-size: 14px; letter-spacing: 0; }

.masthead { border-bottom: 1px dashed var(--rule-strong); }
.masthead .name { font-size: clamp(28px, 4.5vw, 44px); font-weight: 700; letter-spacing: -0.02em; text-transform: lowercase; }
.masthead .name::before { content: "$ "; color: var(--accent); font-weight: 400; }
.masthead .name em { font-style: normal; color: var(--accent); font-weight: 700; }
.masthead .role { text-transform: lowercase; letter-spacing: 0; color: var(--ink-soft); }
.masthead .role::before { content: "# "; color: var(--accent); }
.masthead .right .avail { text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); }
.masthead .right .avail::before { display: none; }
.masthead .right .avail::after { content: " ▮"; animation: blink 1.2s infinite step-end; }
@keyframes blink { 50% { opacity: 0; } }

.tab { font-family: var(--font-display); font-size: 14px; font-weight: 400; text-transform: lowercase; letter-spacing: 0; padding: 8px 12px 8px 0; }
.tab::before { content: "["; color: var(--ink-faint); margin-right: 2px; }
.tab::after { content: "]"; color: var(--ink-faint); margin-left: 2px; }
.tab[aria-current="page"] { color: var(--accent); }
.tab[aria-current="page"]::before, .tab[aria-current="page"]::after { color: var(--accent); }
.tab[aria-current="page"]::after { content: "]"; }

.eyebrow { font-family: var(--font-display); letter-spacing: 0.04em; text-transform: lowercase; color: var(--accent); border-bottom: 1px dashed var(--rule); }
.eyebrow::before { content: "// "; color: var(--ink-faint); }

.avatar-wrap { max-width: 200px; }
.avatar-slot { aspect-ratio: 1 / 1; background: var(--bg-elev); box-shadow: 0 0 0 1px var(--rule-strong); filter: grayscale(100%) contrast(1.4) brightness(0.85) sepia(40%) hue-rotate(60deg); }

.bio p { font-size: 14px; line-height: 1.6; }
.bio p + p { font-size: 13px; }
.exp-item { padding: 18px 0; border-bottom: 1px dashed var(--rule); }
.exp-head .role { font-family: var(--font-display); font-size: 16px; font-weight: 700; }
.exp-head .role em { font-style: normal; color: var(--accent); font-weight: 700; }
.exp-head .role .at { color: var(--ink-faint); }
.exp-bullets li::before { content: ">"; background: none; color: var(--accent); position: absolute; left: 0; top: 6px; width: auto; height: auto; font-family: var(--font-display); }
.exp-bullets li { padding-left: 18px; font-size: 14px; }

.now-row { border-top: 1px dashed var(--rule); }
.now-row dt { color: var(--accent); }
.now-row dt::before { content: "[ "; color: var(--ink-faint); }
.now-row dt::after { content: " ]"; color: var(--ink-faint); }
.now-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; }
.now-blurb, .now-line, .now-inline { font-family: var(--font-display); font-size: 14px; }
.book-title { font-family: var(--font-display); font-weight: 700; }

.contact .statement h2 { font-family: var(--font-display); font-size: clamp(28px, 4.5vw, 44px); text-transform: lowercase; font-weight: 700; }
.contact .statement h2 em { font-style: normal; color: var(--accent); }
.contact .statement p { font-family: var(--font-display); font-size: 14px; max-width: 50ch; }
.contact .statement .signed { font-family: var(--font-display); font-size: 16px; font-weight: 700; }
.contact-row .handle { font-family: var(--font-display); font-size: 16px; font-weight: 500; }
.contact-row .arrow::before { content: "→"; }

.btn { border-radius: 0; text-transform: lowercase; font-weight: 500; }
.btn::before { content: "["; margin-right: 4px; color: var(--ink-faint); }
.btn::after { content: "]"; margin-left: 4px; color: var(--ink-faint); }
.btn.primary { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.btn.primary::before, .btn.primary::after { color: var(--bg); opacity: 0.6; }

.theme-toggle { border-radius: 0; text-transform: lowercase; }
.footer { border-color: var(--rule); }
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/styles/
git commit -m "feat(web): add global and terminal CSS"
```

---

## Task 8: TypeScript types + Sanity client + GROQ queries

**Files:**
- Create: `apps/web/lib/types.ts`
- Create: `apps/web/lib/sanity.ts`
- Create: `apps/web/lib/queries.ts`

- [ ] **Step 1: Create apps/web/lib/types.ts**

```typescript
export interface Bilingual {
  en: string
  pl: string
}

export interface SanityImageAsset {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number }
}

export interface Profile {
  network: string
  username: string
  url: string
}

export interface Basics {
  name: string
  email: string
  phone?: string
  url?: string
  summary: Bilingual
  image: SanityImageAsset
  location: { city: string; countryCode: string }
  profiles: Profile[]
}

export interface WorkHighlight {
  text: Bilingual
}

export interface Work {
  name: string
  position: Bilingual
  startDate: string
  endDate: string
  summary: Bilingual
  highlights: WorkHighlight[]
}

export interface Education {
  institution: string
  area: Bilingual
  studyType: string
  startDate: string
  endDate: string
}

export interface Skill {
  name: string
  keywords: string[]
}

export interface Language {
  language: string
  fluency: string
}

export interface Project {
  name: string
  description: Bilingual
  roles: string[]
  keywords: string[]
  url?: string
}

export interface Speaking {
  title: Bilingual
  venue: string
  year: string
}

export interface Resume {
  basics: Basics
  work: Work[]
  education: Education[]
  skills: Skill[]
  languages: Language[]
  projects: Project[]
  speaking: Speaking[]
}

export interface NowBuilding {
  title: Bilingual
  blurb: Bilingual
}

export interface NowLearning {
  item: Bilingual
}

export interface NowBook {
  title: string
  author: string
}

export interface NowAround {
  item: Bilingual
}

export interface Now {
  asOf: Bilingual
  building: NowBuilding[]
  learning: NowLearning[]
  reading: NowBook[]
  around: NowAround[]
}
```

- [ ] **Step 2: Create apps/web/lib/sanity.ts**

```typescript
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
})
```

- [ ] **Step 3: Create apps/web/lib/queries.ts**

```typescript
import { client } from './sanity'
import type { Resume, Now } from './types'

export async function fetchResume(): Promise<Resume> {
  return client.fetch(`
    *[_type == "resume"][0]{
      basics {
        name, email, phone, url,
        summary, image, location, profiles
      },
      work[] {
        name, position, startDate, endDate, summary,
        highlights[]{ text }
      },
      education[]{ institution, area, studyType, startDate, endDate },
      skills[]{ name, keywords },
      languages[]{ language, fluency },
      projects[]{ name, description, roles, keywords, url },
      speaking[]{ title, venue, year }
    }
  `)
}

export async function fetchNow(): Promise<Now> {
  return client.fetch(`
    *[_type == "now"][0]{
      asOf,
      building[]{ title, blurb },
      learning[]{ item },
      reading[]{ title, author },
      around[]{ item }
    }
  `)
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/types.ts apps/web/lib/sanity.ts apps/web/lib/queries.ts
git commit -m "feat(web): add types, Sanity client, and GROQ queries"
```

---

## Task 9: i18n lib + translations

**Files:**
- Create: `apps/web/lib/translations.ts`
- Create: `apps/web/lib/i18n.ts`
- Create: `apps/web/__tests__/i18n.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/web/__tests__/i18n.test.tsx`:

```typescript
import { render, screen, act } from '@testing-library/react'
import { LangProvider, useLang } from '@/lib/i18n'

function TestConsumer() {
  const { lang, setLang } = useLang()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('pl')}>switch</button>
    </div>
  )
}

describe('useLang', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to en when no localStorage entry and navigator is not pl', () => {
    render(<LangProvider><TestConsumer /></LangProvider>)
    expect(screen.getByTestId('lang').textContent).toBe('en')
  })

  it('reads saved language from localStorage', () => {
    localStorage.setItem('portfolio-lang', 'pl')
    render(<LangProvider><TestConsumer /></LangProvider>)
    // initial render is 'en', then useEffect fires
    act(() => {})
    expect(screen.getByTestId('lang').textContent).toBe('pl')
  })

  it('persists language change to localStorage', () => {
    render(<LangProvider><TestConsumer /></LangProvider>)
    act(() => { screen.getByText('switch').click() })
    expect(localStorage.getItem('portfolio-lang')).toBe('pl')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test --workspace=apps/web -- --testPathPattern=i18n
```

Expected: `Cannot find module '@/lib/i18n'`

- [ ] **Step 3: Create apps/web/lib/translations.ts**

```typescript
export type Lang = 'en' | 'pl'

export const translations = {
  en: {
    role: 'Fullstack Developer',
    location: 'Kraków, Poland',
    available: 'Open for work',
    tabs: { cv: 'cv', now: 'now', contact: 'contact' },
    themeLight: '☀ light',
    themeDark: '☾ dark',
    sections: {
      about: 'about', skills: 'skills', education: 'education',
      speaking: 'speaking', languages: 'languages', experience: 'experience',
      now: 'now', building: 'building', learning: 'learning',
      reading: 'reading', around: 'around',
      channels: 'channels', note: 'or write a note',
    },
    nowIntro: "A snapshot of what I'm working on, learning, and reading. Updated when things change — inspired by Derek Sivers' 'now' idea.",
    nowAsOf: (date: string) => `As of ${date}`,
    contactHead: ["Let's", 'talk', '.'] as [string, string, string],
    contactSub1: (period: string) => `I'm currently ${period.toLowerCase()} — freelance, contract, or full-time.`,
    contactSub2: 'Best by email, or book a 20-minute intro call — whichever you prefer.',
    contactSign: (first: string) => `— ${first}`,
    channels: { email: 'Email', github: 'GitHub', linkedin: 'LinkedIn', calendar: 'Book a call' },
    form: {
      name: 'Name', namePh: 'Your name',
      email: 'Email', emailPh: 'you@company.com',
      message: 'Message', messagePh: 'A short note about the project, timeline, budget if you have one.',
      send: 'Send →', sent: '✓ Sent',
    },
    buttons: { json: '↓ json', pdf: '↓ pdf' },
    toasts: { json: 'CV downloaded as JSON', queued: "Message queued — I'll reply within 48h" },
    footer: {
      copy: (y: number, n: string) => `© ${y} ${n}`,
      built: 'Built by hand · Last updated May 2026',
    },
    atSep: ' at ',
    langLevels: { Native: 'Native', Fluent: 'Fluent', Intermediate: 'Intermediate' } as Record<string, string>,
  },
  pl: {
    role: 'Programista Fullstack',
    location: 'Kraków, Polska',
    available: 'Otwarty na projekty',
    tabs: { cv: 'CV', now: 'Teraz', contact: 'Kontakt' },
    themeLight: '☀ Jasny',
    themeDark: '☾ Ciemny',
    sections: {
      about: 'o mnie', skills: 'umiejętności', education: 'wykształcenie',
      speaking: 'wystąpienia', languages: 'języki', experience: 'doświadczenie',
      now: 'teraz', building: 'buduję', learning: 'uczę się',
      reading: 'czytam', around: 'wokół',
      channels: 'kanały', note: 'lub napisz wiadomość',
    },
    nowIntro: "Migawka tego, nad czym pracuję, czego się uczę i co czytam. Aktualizowane, gdy coś się zmienia — inspirowane stroną 'now' Dereka Siversa.",
    nowAsOf: (date: string) => `Stan na ${date}`,
    contactHead: ['', 'Porozmawiajmy', '.'] as [string, string, string],
    contactSub1: (period: string) => `Aktualnie ${period.toLowerCase()} — freelance, kontrakt lub na pełen etat.`,
    contactSub2: 'Najlepiej mailem albo zarezerwuj 20-minutową rozmowę wstępną — jak wolisz.',
    contactSign: (first: string) => `— ${first}`,
    channels: { email: 'E-mail', github: 'GitHub', linkedin: 'LinkedIn', calendar: 'Umów rozmowę' },
    form: {
      name: 'Imię', namePh: 'Twoje imię',
      email: 'E-mail', emailPh: 'ty@firma.com',
      message: 'Wiadomość', messagePh: 'Krótko o projekcie, terminie, budżecie jeśli już masz.',
      send: 'Wyślij →', sent: '✓ Wysłano',
    },
    buttons: { json: '↓ JSON', pdf: '↓ PDF' },
    toasts: { json: 'CV pobrane jako JSON', queued: 'Wiadomość zapisana — odpiszę w ciągu 48h' },
    footer: {
      copy: (y: number, n: string) => `© ${y} ${n}`,
      built: 'Wykonane ręcznie · Ostatnia aktualizacja: maj 2026',
    },
    atSep: ' w ',
    langLevels: { Native: 'ojczysty', Fluent: 'biegły', Intermediate: 'średniozaawansowany' } as Record<string, string>,
  },
} as const

export type Translations = typeof translations.en
```

- [ ] **Step 4: Create apps/web/lib/i18n.ts**

```typescript
'use client'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Lang, type Translations } from './translations'
import type { Bilingual } from './types'

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  T: Translations
  t: (field: Bilingual) => string
}

export const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  T: translations.en,
  t: (field) => field.en,
})

export function useLang() {
  return useContext(LangContext)
}

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const saved = localStorage.getItem('portfolio-lang')
  if (saved === 'en' || saved === 'pl') return saved
  return navigator.language.slice(0, 2).toLowerCase() === 'pl' ? 'pl' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    setLangState(detectLang())
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('portfolio-lang', l)
    document.documentElement.setAttribute('lang', l)
  }

  const T = translations[lang]
  const t = (field: Bilingual) => field[lang] ?? field.en

  return (
    <LangContext.Provider value={{ lang, setLang, T, t }}>
      {children}
    </LangContext.Provider>
  )
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test --workspace=apps/web -- --testPathPattern=i18n
```

Expected: 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/translations.ts apps/web/lib/i18n.ts apps/web/__tests__/i18n.test.tsx
git commit -m "feat(web): add i18n lib with EN/PL translations"
```

---

## Task 10: Goodreads lib

**Files:**
- Create: `apps/web/lib/goodreads.ts`
- Create: `apps/web/__tests__/goodreads.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/__tests__/goodreads.test.ts`:

```typescript
import { fetchCurrentlyReading, MOCK_BOOKS } from '@/lib/goodreads'

const fetchMock = jest.fn()
global.fetch = fetchMock

describe('fetchCurrentlyReading', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    delete process.env.GOODREADS_PROXY_URL
  })

  it('returns MOCK_BOOKS when GOODREADS_PROXY_URL is not set', async () => {
    const result = await fetchCurrentlyReading()
    expect(result).toEqual(MOCK_BOOKS)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches from proxy when GOODREADS_PROXY_URL is set', async () => {
    process.env.GOODREADS_PROXY_URL = 'https://proxy.example.com'
    const books = [{ title: 'Test Book', author: 'Test Author' }]
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => books })

    const result = await fetchCurrentlyReading()
    expect(fetchMock).toHaveBeenCalledWith('https://proxy.example.com')
    expect(result).toEqual(books)
  })

  it('falls back to MOCK_BOOKS when fetch fails', async () => {
    process.env.GOODREADS_PROXY_URL = 'https://proxy.example.com'
    fetchMock.mockRejectedValueOnce(new Error('network error'))

    const result = await fetchCurrentlyReading()
    expect(result).toEqual(MOCK_BOOKS)
  })

  it('falls back to MOCK_BOOKS when response is not ok', async () => {
    process.env.GOODREADS_PROXY_URL = 'https://proxy.example.com'
    fetchMock.mockResolvedValueOnce({ ok: false })

    const result = await fetchCurrentlyReading()
    expect(result).toEqual(MOCK_BOOKS)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test --workspace=apps/web -- --testPathPattern=goodreads
```

Expected: `Cannot find module '@/lib/goodreads'`

- [ ] **Step 3: Create apps/web/lib/goodreads.ts**

```typescript
export interface Book {
  title: string
  author: string
}

export const MOCK_BOOKS: Book[] = [
  { title: 'A Philosophy of Software Design', author: 'John Ousterhout' },
  { title: 'Working in Public', author: 'Nadia Eghbal' },
]

export async function fetchCurrentlyReading(): Promise<Book[]> {
  const url = process.env.GOODREADS_PROXY_URL
  if (!url) return MOCK_BOOKS
  try {
    const res = await fetch(url)
    if (!res.ok) return MOCK_BOOKS
    return res.json() as Promise<Book[]>
  } catch {
    return MOCK_BOOKS
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test --workspace=apps/web -- --testPathPattern=goodreads
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/goodreads.ts apps/web/__tests__/goodreads.test.ts
git commit -m "feat(web): add Goodreads integration with mock fallback"
```

---

## Task 11: UI primitives

**Files:**
- Create: `apps/web/components/ui/Eyebrow.tsx`
- Create: `apps/web/components/ui/Toast.tsx`
- Create: `apps/web/components/ui/Avatar.tsx`

- [ ] **Step 1: Create apps/web/components/ui/Eyebrow.tsx**

```typescript
interface EyebrowProps {
  children: React.ReactNode
  as?: 'h2' | 'h3' | 'h4' | 'p'
}

export function Eyebrow({ children, as: Tag = 'h3' }: EyebrowProps) {
  return <Tag className="eyebrow">{children}</Tag>
}
```

- [ ] **Step 2: Create apps/web/components/ui/Toast.tsx**

```typescript
interface ToastProps {
  message: string | null
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      className={`toast${message ? ' show' : ''}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}
```

- [ ] **Step 3: Create apps/web/components/ui/Avatar.tsx**

```typescript
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/lib/sanity'
import type { SanityImageAsset } from '@/lib/types'

const builder = imageUrlBuilder(client)

interface AvatarProps {
  image: SanityImageAsset | null | undefined
  name: string
}

export function Avatar({ image, name }: AvatarProps) {
  if (!image) {
    return <div className="avatar-slot" aria-label={name} />
  }
  const src = builder.image(image).width(440).height(550).url()
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="avatar-slot"
      width={220}
      height={275}
    />
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/ui/
git commit -m "feat(web): add UI primitives (Eyebrow, Toast, Avatar)"
```

---

## Task 12: Portfolio shell (Client Component)

**Files:**
- Create: `apps/web/components/Portfolio.tsx`

This is the root client component that owns tab state, theme, and language, and renders the correct view.

- [ ] **Step 1: Create apps/web/components/Portfolio.tsx**

```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import { LangProvider, useLang } from '@/lib/i18n'
import { Toast } from '@/components/ui/Toast'
import { Masthead } from '@/components/layout/Masthead'
import { Tabs } from '@/components/layout/Tabs'
import { Footer } from '@/components/layout/Footer'
import { CVView } from '@/components/cv/CVView'
import { NowView } from '@/components/now/NowView'
import { ContactView } from '@/components/contact/ContactView'
import type { Resume, Now } from '@/lib/types'
import type { Book } from '@/lib/goodreads'

type Tab = 'cv' | 'now' | 'contact'

interface PortfolioProps {
  resume: Resume
  now: Now
  initialBooks: Book[]
}

function PortfolioInner({ resume, now, initialBooks }: PortfolioProps) {
  const { T } = useLang()

  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'cv'
    const h = window.location.hash.replace('#', '') as Tab
    return ['cv', 'now', 'contact'].includes(h) ? h : 'cv'
  })

  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme')
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved)
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light')
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  useEffect(() => {
    if (window.location.hash !== `#${tab}`) {
      history.replaceState(null, '', `#${tab}`)
    }
  }, [tab])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [])

  const exportJSON = useCallback(() => {
    const data = JSON.stringify(resume, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bartosz-grabski-cv.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast(T.toasts.json)
  }, [resume, T, showToast])

  const printPDF = useCallback(() => {
    const prev = tab
    setTab('cv')
    setTimeout(() => { window.print(); setTab(prev) }, 120)
  }, [tab])

  return (
    <>
      <div className="shell">
        <Masthead
          resume={resume}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />
        <Tabs tab={tab} onTabChange={setTab} />
        <div>
          {tab === 'cv' && (
            <CVView resume={resume} onExportJSON={exportJSON} onPrint={printPDF} />
          )}
          {tab === 'now' && <NowView now={now} initialBooks={initialBooks} />}
          {tab === 'contact' && <ContactView resume={resume} showToast={showToast} />}
        </div>
        <Footer name={resume.basics.name} />
      </div>
      <Toast message={toast} />
    </>
  )
}

export function Portfolio(props: PortfolioProps) {
  return (
    <LangProvider>
      <PortfolioInner {...props} />
    </LangProvider>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/Portfolio.tsx
git commit -m "feat(web): add Portfolio client shell with tab/theme/lang state"
```

---

## Task 13: Layout components — Masthead, Tabs, Footer

**Files:**
- Create: `apps/web/components/layout/Masthead.tsx`
- Create: `apps/web/components/layout/Tabs.tsx`
- Create: `apps/web/components/layout/Footer.tsx`

- [ ] **Step 1: Create apps/web/components/layout/Masthead.tsx**

```typescript
import { useLang } from '@/lib/i18n'
import type { Resume } from '@/lib/types'

interface MastheadProps {
  resume: Resume
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export function Masthead({ resume, theme, onToggleTheme }: MastheadProps) {
  const { lang, setLang, T } = useLang()
  const [first, ...rest] = resume.basics.name.split(' ')
  const otherLang = lang === 'en' ? 'pl' : 'en'

  return (
    <header className="masthead">
      <div className="left">
        <h1 className="name">
          {first} <em>{rest.join(' ')}</em>
        </h1>
        <p className="role">{T.role} · {T.location}</p>
      </div>
      <div className="right">
        <span className="avail">{T.available}</span>
        <span>{resume.basics.url}</span>
        <div className="header-actions no-print">
          <button
            className="theme-toggle"
            onClick={() => setLang(otherLang)}
            aria-label={`Switch to ${otherLang.toUpperCase()}`}
          >
            <span className="lang-pill">
              <span className={lang === 'en' ? 'on' : ''}>EN</span>
              <span className="sep">/</span>
              <span className={lang === 'pl' ? 'on' : ''}>PL</span>
            </span>
          </button>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle colour theme"
          >
            {theme === 'dark' ? T.themeDark : T.themeLight}
          </button>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create apps/web/components/layout/Tabs.tsx**

```typescript
import { useLang } from '@/lib/i18n'

type Tab = 'cv' | 'now' | 'contact'

interface TabsProps {
  tab: Tab
  onTabChange: (tab: Tab) => void
}

export function Tabs({ tab, onTabChange }: TabsProps) {
  const { T } = useLang()

  const items: { id: Tab; label: string }[] = [
    { id: 'cv', label: T.tabs.cv },
    { id: 'now', label: T.tabs.now },
    { id: 'contact', label: T.tabs.contact },
  ]

  return (
    <div className="tabs no-print">
      <nav role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            className="tab"
            role="tab"
            aria-current={tab === item.id ? 'page' : undefined}
            onClick={() => onTabChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
```

- [ ] **Step 3: Create apps/web/components/layout/Footer.tsx**

```typescript
import { useLang } from '@/lib/i18n'

interface FooterProps {
  name: string
}

export function Footer({ name }: FooterProps) {
  const { T } = useLang()
  return (
    <footer className="footer">
      <span>{T.footer.copy(new Date().getFullYear(), name)}</span>
      <span>{T.footer.built}</span>
    </footer>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/layout/
git commit -m "feat(web): add Masthead, Tabs, Footer components"
```

---

## Task 14: CV view components

**Files:**
- Create: `apps/web/components/cv/CVView.tsx`
- Create: `apps/web/components/cv/ExperienceList.tsx`
- Create: `apps/web/components/cv/SkillsBlock.tsx`
- Create: `apps/web/components/cv/EducationList.tsx`
- Create: `apps/web/components/cv/SpeakingList.tsx`
- Create: `apps/web/components/cv/LanguageList.tsx`

- [ ] **Step 1: Create apps/web/components/cv/ExperienceList.tsx**

```typescript
import { useLang } from '@/lib/i18n'
import type { Work } from '@/lib/types'

export function ExperienceList({ work }: { work: Work[] }) {
  const { T, t } = useLang()
  return (
    <section>
      <h3 className="eyebrow">{T.sections.experience}</h3>
      {work.map((item, i) => (
        <article className="exp-item" key={i}>
          <header className="exp-head">
            <h4 className="role">
              <span className="co">{t(item.position)}</span>
              <span className="at">{T.atSep}</span>
              <em>{item.name}</em>
            </h4>
            <span className="dates">{item.startDate} — {item.endDate}</span>
          </header>
          <p className="exp-summary">{t(item.summary)}</p>
          {item.highlights.length > 0 && (
            <ul className="exp-bullets">
              {item.highlights.map((h, j) => (
                <li key={j}>{t(h.text)}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  )
}
```

- [ ] **Step 2: Create apps/web/components/cv/SkillsBlock.tsx**

```typescript
import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Skill } from '@/lib/types'

export function SkillsBlock({ skills }: { skills: Skill[] }) {
  const { T } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.skills}</Eyebrow>
      {skills.map((s, i) => (
        <div className="skill-block" key={i}>
          <p className="label">{s.name}</p>
          <p className="items">{s.keywords.join(' · ')}</p>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 3: Create apps/web/components/cv/EducationList.tsx**

```typescript
import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Education } from '@/lib/types'

export function EducationList({ education }: { education: Education[] }) {
  const { T, t } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.education}</Eyebrow>
      {education.map((e, i) => (
        <div className="edu-item" key={i}>
          <p className="school">{e.institution}</p>
          <p className="degree">{e.studyType} — {t(e.area)}</p>
          <p className="dates">{e.startDate} — {e.endDate}</p>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 4: Create apps/web/components/cv/SpeakingList.tsx**

```typescript
import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Speaking } from '@/lib/types'

export function SpeakingList({ speaking }: { speaking: Speaking[] }) {
  const { T, t } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.speaking}</Eyebrow>
      {speaking.map((s, i) => (
        <div className="talk-item" key={i}>
          <p className="title">{t(s.title)}</p>
          <p className="venue">{s.venue}</p>
          <p className="year">{s.year}</p>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 5: Create apps/web/components/cv/LanguageList.tsx**

```typescript
import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Language } from '@/lib/types'

export function LanguageList({ languages }: { languages: Language[] }) {
  const { T } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.languages}</Eyebrow>
      {languages.map((l, i) => (
        <div className="lang-item" key={i}>
          <p className="name">{l.language}</p>
          <p className="level">{T.langLevels[l.fluency] ?? l.fluency}</p>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 6: Create apps/web/components/cv/CVView.tsx**

```typescript
import { useLang } from '@/lib/i18n'
import { Avatar } from '@/components/ui/Avatar'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ExperienceList } from './ExperienceList'
import { SkillsBlock } from './SkillsBlock'
import { EducationList } from './EducationList'
import { SpeakingList } from './SpeakingList'
import { LanguageList } from './LanguageList'
import type { Resume } from '@/lib/types'

interface CVViewProps {
  resume: Resume
  onExportJSON: () => void
  onPrint: () => void
}

export function CVView({ resume, onExportJSON, onPrint }: CVViewProps) {
  const { T, t } = useLang()
  const { basics } = resume

  return (
    <div className="cv" data-view="cv">
      <aside className="meta-col">
        <div className="avatar-wrap no-print">
          <Avatar image={basics.image} name={basics.name} />
        </div>

        <section className="bio">
          <Eyebrow>{T.sections.about}</Eyebrow>
          {t(basics.summary).split('\n').filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <SkillsBlock skills={resume.skills} />
        <EducationList education={resume.education} />
        <SpeakingList speaking={resume.speaking} />
        <LanguageList languages={resume.languages} />
      </aside>

      <main className="main-col">
        <div className="cv-actions no-print" style={{ marginBottom: 28, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onExportJSON}>{T.buttons.json}</button>
          <button className="btn primary" onClick={onPrint}>{T.buttons.pdf}</button>
        </div>
        <ExperienceList work={resume.work} />
      </main>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/components/cv/
git commit -m "feat(web): add CV view components"
```

---

## Task 15: Now view + GoodreadsBooks

**Files:**
- Create: `apps/web/components/now/GoodreadsBooks.tsx`
- Create: `apps/web/components/now/NowView.tsx`

- [ ] **Step 1: Create apps/web/components/now/GoodreadsBooks.tsx**

```typescript
'use client'
import { useState, useEffect } from 'react'
import type { Book } from '@/lib/goodreads'

interface GoodreadsBooksProps {
  initialBooks: Book[]
}

export function GoodreadsBooks({ initialBooks }: GoodreadsBooksProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_GOODREADS_PROXY_URL
    if (!url) return
    fetch(url)
      .then(r => r.ok ? r.json() as Promise<Book[]> : null)
      .then(data => { if (data) setBooks(data) })
      .catch(() => {})
  }, [])

  return (
    <>
      {books.map((book, i) => (
        <p className="now-line" key={i}>
          <span className="book-title">{book.title}</span>
          <span className="book-author"> — {book.author}</span>
        </p>
      ))}
    </>
  )
}
```

- [ ] **Step 2: Create apps/web/components/now/NowView.tsx**

```typescript
import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { GoodreadsBooks } from './GoodreadsBooks'
import type { Now } from '@/lib/types'
import type { Book } from '@/lib/goodreads'

interface NowViewProps {
  now: Now
  initialBooks: Book[]
}

export function NowView({ now, initialBooks }: NowViewProps) {
  const { T, t } = useLang()

  return (
    <div className="now" data-view="now">
      <header className="now-head">
        <div>
          <Eyebrow>{T.sections.now}</Eyebrow>
          <p className="now-intro">{T.nowIntro}</p>
        </div>
        <span className="now-asof">{T.nowAsOf(t(now.asOf))}</span>
      </header>

      <dl className="now-list">
        <div className="now-row">
          <dt>{T.sections.building}</dt>
          <dd>
            {now.building.map((b, i) => (
              <div className="now-item" key={i}>
                <p className="now-title">{t(b.title)}</p>
                <p className="now-blurb">{t(b.blurb)}</p>
              </div>
            ))}
          </dd>
        </div>

        <div className="now-row">
          <dt>{T.sections.learning}</dt>
          <dd>
            <p className="now-inline">
              {now.learning.map(l => t(l.item)).join('  ·  ')}
            </p>
          </dd>
        </div>

        <div className="now-row">
          <dt>{T.sections.reading}</dt>
          <dd>
            <GoodreadsBooks initialBooks={initialBooks.length > 0 ? initialBooks : now.reading as Book[]} />
          </dd>
        </div>

        <div className="now-row">
          <dt>{T.sections.around}</dt>
          <dd>
            {now.around.map((a, i) => (
              <p className="now-line" key={i}>{t(a.item)}</p>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/now/
git commit -m "feat(web): add Now view with Goodreads integration"
```

---

## Task 16: Contact view + form + test

**Files:**
- Create: `apps/web/components/contact/ContactForm.tsx`
- Create: `apps/web/components/contact/ContactView.tsx`
- Create: `apps/web/__tests__/ContactForm.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/web/__tests__/ContactForm.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/contact/ContactForm'

const mockShowToast = jest.fn()

describe('ContactForm', () => {
  beforeEach(() => mockShowToast.mockReset())

  it('submit button is initially enabled', () => {
    render(<ContactForm showToast={mockShowToast} toastMessage="queued" />)
    expect(screen.getByRole('button', { name: /send/i })).not.toBeDisabled()
  })

  it('calls showToast on valid submit and resets form', async () => {
    render(<ContactForm showToast={mockShowToast} toastMessage="queued" />)
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com')
    await userEvent.type(screen.getByLabelText(/message/i), 'Hello there')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(mockShowToast).toHaveBeenCalledWith('queued')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test --workspace=apps/web -- --testPathPattern=ContactForm
```

Expected: `Cannot find module '@/components/contact/ContactForm'`

- [ ] **Step 3: Create apps/web/components/contact/ContactForm.tsx**

```typescript
'use client'
import { useState } from 'react'
import { useLang } from '@/lib/i18n'

interface ContactFormProps {
  showToast: (msg: string) => void
  toastMessage: string
}

export function ContactForm({ showToast, toastMessage }: ContactFormProps) {
  const { T } = useLang()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.message) return
    setSent(true)
    showToast(toastMessage)
    setTimeout(() => {
      setForm({ name: '', email: '', message: '' })
      setSent(false)
    }, 1500)
  }

  return (
    <form onSubmit={submit}>
      <div className="field">
        <label htmlFor="cname">{T.form.name}</label>
        <input
          id="cname"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder={T.form.namePh}
        />
      </div>
      <div className="field">
        <label htmlFor="cemail">{T.form.email}</label>
        <input
          id="cemail"
          type="email"
          required
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder={T.form.emailPh}
        />
      </div>
      <div className="field">
        <label htmlFor="cmsg">{T.form.message}</label>
        <textarea
          id="cmsg"
          required
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          placeholder={T.form.messagePh}
        />
      </div>
      <button
        type="submit"
        className="btn primary"
        disabled={sent}
        style={{ marginTop: 8 }}
      >
        {sent ? T.form.sent : T.form.send}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Create apps/web/components/contact/ContactView.tsx**

```typescript
import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ContactForm } from './ContactForm'
import type { Resume } from '@/lib/types'

const LINKS = {
  email: 'mailto:hello@bartoszgrabski.dev',
  github: 'https://github.com/bgrabski',
  linkedin: 'https://www.linkedin.com/in/bartosz-grabski-b89a0738/',
  calendar: 'https://cal.com/bgrabski/intro',
} as const

interface ContactViewProps {
  resume: Resume
  showToast: (msg: string) => void
}

export function ContactView({ resume, showToast }: ContactViewProps) {
  const { T } = useLang()
  const [pre, em, post] = T.contactHead
  const firstName = resume.basics.name.split(' ')[0]

  const rows = [
    { label: T.channels.email,    handle: resume.basics.email,          href: LINKS.email },
    { label: T.channels.github,   handle: 'github.com/bgrabski',        href: LINKS.github },
    { label: T.channels.linkedin, handle: 'in/bartosz-grabski',         href: LINKS.linkedin },
    { label: T.channels.calendar, handle: 'cal.com/bgrabski',           href: LINKS.calendar },
  ]

  return (
    <div className="contact" data-view="contact">
      <div className="statement">
        <h2>
          {pre}{pre && em ? ' ' : ''}
          {em && <em>{em}</em>}
          {post}
        </h2>
        <p>{T.contactSub1(T.available)}</p>
        <p>{T.contactSub2}</p>
        <p className="signed">{T.contactSign(firstName)}</p>
      </div>

      <div>
        <Eyebrow>{T.sections.channels}</Eyebrow>
        <div className="contact-list">
          {rows.map(r => (
            <a
              key={r.label}
              href={r.href}
              className="contact-row"
              target={r.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
            >
              <span className="label">{r.label}</span>
              <span className="handle">{r.handle}</span>
              <span className="arrow" aria-hidden="true" />
            </a>
          ))}
        </div>

        <section className="form-section">
          <Eyebrow as="h3">{T.sections.note}</Eyebrow>
          <ContactForm showToast={showToast} toastMessage={T.toasts.queued} />
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test --workspace=apps/web -- --testPathPattern=ContactForm
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/contact/ apps/web/__tests__/ContactForm.test.tsx
git commit -m "feat(web): add Contact view and form"
```

---

## Task 17: Root layout, page, and next.config

**Files:**
- Create: `apps/web/next.config.ts`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`

- [ ] **Step 1: Create apps/web/next.config.ts**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

- [ ] **Step 2: Create apps/web/app/layout.tsx**

```typescript
import { JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import '@/styles/terminal.css'
import type { Metadata } from 'next'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bartosz Grabski — Fullstack Developer',
  description: 'Independent fullstack developer based in Kraków, Poland.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('portfolio-theme');if(!t)t=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';document.documentElement.setAttribute('data-theme',t)})()`,
          }}
        />
      </head>
      <body className={jetbrainsMono.variable}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Create apps/web/app/page.tsx**

```typescript
import { fetchResume, fetchNow } from '@/lib/queries'
import { fetchCurrentlyReading } from '@/lib/goodreads'
import { Portfolio } from '@/components/Portfolio'

export default async function Page() {
  const [resume, now, initialBooks] = await Promise.all([
    fetchResume(),
    fetchNow(),
    fetchCurrentlyReading(),
  ])

  return <Portfolio resume={resume} now={now} initialBooks={initialBooks} />
}
```

- [ ] **Step 4: Run full test suite**

```bash
npm test --workspace=apps/web
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/next.config.ts apps/web/app/layout.tsx apps/web/app/page.tsx
git commit -m "feat(web): add root layout and page with build-time data fetching"
```

---

## Task 18: Sanity seed script

**Files:**
- Create: `scripts/seed-sanity.ts`
- Create: `scripts/tsconfig.json`

This script populates the Sanity dataset with the initial data from the design prototype. Run it once after creating the Sanity project and configuring `.env`.

- [ ] **Step 1: Create scripts/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

- [ ] **Step 2: Install seed script dependencies at root**

```bash
npm install --save-dev ts-node @types/node
npm install @sanity/client dotenv
```

- [ ] **Step 3: Create scripts/seed-sanity.ts**

```typescript
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
dotenv.config()

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
})

const resume = {
  _id: 'resume',
  _type: 'resume',
  basics: {
    name: 'Bartosz Grabski',
    email: 'hello@bartoszgrabski.dev',
    url: 'bartoszgrabski.dev',
    summary: {
      en: 'Independent fullstack developer with a decade across product engineering, infrastructure and design systems.\nI work end-to-end — from API and database design through to interface details — and prefer small, high-trust teams where I can stay close to the problem.',
      pl: 'Niezależny programista fullstack z dziesięcioletnim doświadczeniem w inżynierii produktu, infrastrukturze i systemach projektowych.\nPracuję od początku do końca — od projektowania API i baz danych po detale interfejsu — i wolę małe, zaufane zespoły, w których mogę być blisko problemu.',
    },
    location: { city: 'Kraków', countryCode: 'PL' },
    profiles: [
      { network: 'GitHub',   username: 'bgrabski',         url: 'https://github.com/bgrabski' },
      { network: 'LinkedIn', username: 'bartosz-grabski',  url: 'https://www.linkedin.com/in/bartosz-grabski-b89a0738/' },
    ],
  },
  work: [
    {
      name: 'Halo Labs', startDate: '2022', endDate: 'Present',
      position: { en: 'Tech Lead', pl: 'Tech Lead' },
      summary: {
        en: 'Lead engineer on a B2B scheduling product. Team of four; shipping on a six-week cycle.',
        pl: 'Lead inżynier w produkcie B2B do zarządzania harmonogramami. Zespół czteroosobowy; wydania w cyklach sześciotygodniowych.',
      },
      highlights: [
        { text: { en: 'Designed the data model, billing, and event pipeline; product now serves 140+ paying teams across Europe.', pl: 'Zaprojektowałem model danych, billing i potok zdarzeń; produkt obsługuje obecnie 140+ płacących zespołów w Europie.' } },
        { text: { en: 'Owned the React + TypeScript frontend, including a custom calendar primitive used across three surfaces.', pl: 'Prowadziłem frontend React + TypeScript, w tym własny komponent kalendarza używany w trzech miejscach produktu.' } },
        { text: { en: 'Set up CI/CD on Fly.io with preview environments per pull request; cut release cycle time from days to under an hour.', pl: 'Skonfigurowałem CI/CD na Fly.io z podglądem dla każdego pull requesta; czas wydania spadł z dni do godziny.' } },
      ],
    },
    {
      name: 'Estromark', startDate: '2019', endDate: '2022',
      position: { en: 'Senior Software Engineer', pl: 'Senior Software Engineer' },
      summary: {
        en: 'Product engineering across web, mobile, and backend at a consumer fintech.',
        pl: 'Inżynieria produktu — web, mobile i backend — w konsumenckim fintechu.',
      },
      highlights: [
        { text: { en: 'Led the rebuild of the onboarding flow, improving completion from 41% to 68% over two quarters.', pl: 'Prowadziłem przebudowę procesu onboardingu — ukończenie wzrosło z 41% do 68% w ciągu dwóch kwartałów.' } },
        { text: { en: 'Migrated the monolith\'s payment surface to a typed RPC layer; cut runtime errors in checkout by 80%.', pl: 'Zmigrowałem część płatności z monolitu do typowanej warstwy RPC; błędy w runtime w checkoucie spadły o 80%.' } },
        { text: { en: 'Mentored four engineers through promotion; ran the internal frontend guild.', pl: 'Mentorowałem czterech inżynierów do awansu; prowadziłem wewnętrzny frontend guild.' } },
      ],
    },
    {
      name: 'Krakatoa Studio', startDate: '2016', endDate: '2019',
      position: { en: 'Software Engineer', pl: 'Software Engineer' },
      summary: {
        en: 'Mid-level engineer at a digital product studio. Worked across client projects and internal tooling.',
        pl: 'Mid w studiu produktów cyfrowych. Praca przy projektach klienckich i narzędziach wewnętrznych.',
      },
      highlights: [
        { text: { en: 'Built and maintained six client web apps in React + Node, shipping on tight agency timelines.', pl: 'Zbudowałem i utrzymywałem sześć aplikacji webowych klientów w React + Node — wydania w napiętych terminach agencyjnych.' } },
        { text: { en: 'Wrote the internal admin tooling that the operations team still uses today.', pl: 'Napisałem wewnętrzne narzędzia administracyjne, z których zespół operacyjny korzysta do dziś.' } },
      ],
    },
    {
      name: 'Comarch', startDate: '2014', endDate: '2016',
      position: { en: 'Junior Developer', pl: 'Junior Developer' },
      summary: {
        en: 'First engineering role, on the customer service platform team.',
        pl: 'Pierwsza rola inżynierska — w zespole platformy obsługi klienta.',
      },
      highlights: [
        { text: { en: 'Built and maintained internal Angular dashboards used by 200+ support agents.', pl: 'Zbudowałem i utrzymywałem wewnętrzne dashboardy w Angularze używane przez 200+ agentów wsparcia.' } },
        { text: { en: 'Wrote integration tests and operator runbooks that reduced on-call escalations by half.', pl: 'Pisałem testy integracyjne i runbooki operacyjne — eskalacje on-call spadły o połowę.' } },
      ],
    },
  ],
  education: [
    { institution: 'AGH University of Science and Technology', area: { en: 'Computer Science — Distributed Systems', pl: 'Informatyka — Systemy Rozproszone' }, studyType: 'MSc', startDate: '2014', endDate: '2016' },
    { institution: 'AGH University of Science and Technology', area: { en: 'Computer Science', pl: 'Informatyka' }, studyType: 'BSc', startDate: '2010', endDate: '2014' },
  ],
  skills: [
    { name: 'Languages',  keywords: ['TypeScript', 'Python', 'Go', 'SQL', 'Rust (learning)'] },
    { name: 'Frontend',   keywords: ['React', 'Next.js', 'Tailwind', 'Web Components', 'Framer Motion'] },
    { name: 'Backend',    keywords: ['Node.js', 'PostgreSQL', 'Redis', 'tRPC', 'GraphQL'] },
    { name: 'Infra',      keywords: ['Fly.io', 'AWS', 'Terraform', 'GitHub Actions', 'Docker'] },
    { name: 'Practice',   keywords: ['Code review', 'Design systems', 'Accessibility (WCAG 2.2)', 'Mentoring'] },
  ],
  languages: [
    { language: 'Polish',  fluency: 'Native' },
    { language: 'English', fluency: 'Fluent' },
    { language: 'German',  fluency: 'Intermediate' },
  ],
  speaking: [
    { title: { en: 'Designing for the team that maintains it', pl: 'Projektowanie dla zespołu, który to utrzyma' }, venue: 'Code Europe, Kraków', year: '2024' },
    { title: { en: 'Small databases, big constraints', pl: 'Małe bazy danych, duże ograniczenia' }, venue: 'PolyConf, Poznań', year: '2023' },
  ],
  projects: [],
}

const now = {
  _id: 'now',
  _type: 'now',
  asOf: { en: 'May 2026', pl: 'maj 2026' },
  building: [
    {
      title: { en: 'Halo Labs internal tooling', pl: 'Halo Labs — narzędzia wewnętrzne' },
      blurb: { en: 'Lead engineering on the platform team — reworking how we deploy and observe services across regions.', pl: 'Lead inżynier w zespole platformowym — przebudowa sposobu wdrażania i obserwowania usług w wielu regionach.' },
    },
    {
      title: { en: 'A weekend SQLite tool', pl: 'Weekendowy tool do SQLite' },
      blurb: { en: 'A small CLI for snapshotting and diffing local SQLite databases. Started as a debugging aid; it might become a real thing.', pl: 'Małe CLI do robienia snapshotów i diffów lokalnych baz SQLite. Zaczęło się jako pomoc w debugowaniu; może wyrośnie z tego coś więcej.' },
    },
  ],
  learning: [
    { item: { en: 'Rust beyond hello world', pl: 'Rust dalej niż hello world' } },
    { item: { en: 'Postgres internals', pl: 'Wnętrzności Postgresa' } },
    { item: { en: 'Sketching with the iPad', pl: 'Szkicowanie na iPadzie' } },
  ],
  reading: [
    { title: 'A Philosophy of Software Design', author: 'John Ousterhout' },
    { title: 'Working in Public', author: 'Nadia Eghbal' },
  ],
  around: [
    { item: { en: 'Kraków — third year', pl: 'Kraków — trzeci rok' } },
    { item: { en: 'Cycling to the office most days', pl: 'Rowerem do biura większość dni' } },
    { item: { en: 'Open to occasional consulting from Q3', pl: 'Otwarty na konsulting od III kw.' } },
  ],
}

async function seed() {
  console.log('Seeding resume…')
  await client.createOrReplace(resume)
  console.log('Seeding now…')
  await client.createOrReplace(now)
  console.log('Done.')
}

seed().catch(console.error)
```

- [ ] **Step 4: Add seed script to root package.json scripts**

Add to `package.json`:
```json
"seed": "ts-node --project scripts/tsconfig.json scripts/seed-sanity.ts"
```

- [ ] **Step 5: Commit**

```bash
git add scripts/ package.json
git commit -m "chore: add Sanity seed script with initial CV data"
```

---

## Task 19: Cloudflare Pages config + deployment docs

**Files:**
- Create: `apps/web/public/_headers`
- Create: `DEPLOYMENT.md`

- [ ] **Step 1: Create apps/web/public/_headers**

```
/*
  Cache-Control: public, max-age=0, must-revalidate

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
```

- [ ] **Step 2: Create DEPLOYMENT.md**

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/public/_headers DEPLOYMENT.md
git commit -m "chore: add Cloudflare Pages config and deployment docs"
```

---

## Task 20: Run full test suite + verify build

- [ ] **Step 1: Run all tests**

```bash
npm test --workspace=apps/web
```

Expected: all tests in `__tests__/` pass (`goodreads`, `i18n`, `ContactForm`).

- [ ] **Step 2: Type-check the web app**

```bash
npm run --workspace=apps/web tsc --noEmit
```

Expected: no TypeScript errors.

- [ ] **Step 3: Verify build compiles (requires .env filled in)**

If Sanity is configured, run:
```bash
npm run build:web
```

Expected: `apps/web/out/` directory created with `index.html` and `_next/static/` assets.

If Sanity is not yet configured, verify next.config parses correctly:
```bash
npm run --workspace=apps/web next info
```

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: verify build and tests pass"
```
