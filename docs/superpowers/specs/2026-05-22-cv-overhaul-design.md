# CV Overhaul Design — 2026-05-22

## Overview

Four independent changes to the personal website: mobile layout fix, work schema restructure for multi-role companies, real experience seed data, and skills section updates including AI tools and a philosophy note.

---

## 1. Mobile Layout Fix

**File:** `apps/web/styles/globals.css` ~line 300

In the `@media (max-width: 820px)` block, `.cv .meta-col` has `order: 2` and `.cv .main-col` has `order: 1`, which pushes the About section (with photo) below Experience on mobile. Swap them:

```css
.cv .meta-col { order: 1; }
.cv .main-col { order: 2; }
```

---

## 2. Work Schema — Nested Positions

HSBC had 3 roles under one company. The current flat `work[]` model cannot express this. Restructure to company-level entries containing a `positions[]` array.

### Schema change (`apps/studio/schemas/resume.ts`)

Replace the current flat `work` field with:

```
work[] → {
  name: string          // company name
  location: string      // "Kraków, Poland"
  positions[] → {
    position: Bilingual
    startDate: string
    endDate: string
    summary: Bilingual
    highlights[]: { text: Bilingual }
  }
}
```

Single-role companies have a `positions` array with one item. HSBC has three.

### Type change (`apps/web/lib/types.ts`)

```ts
export interface WorkPosition {
  position: Bilingual
  startDate: string
  endDate: string
  summary: Bilingual
  highlights: WorkHighlight[]
}

export interface Work {
  name: string
  location?: string
  positions: WorkPosition[]
}
```

Remove the old flat `Work` fields (`position`, `startDate`, `endDate`, `summary`, `highlights` at top level).

### GROQ query change (`apps/web/lib/queries.ts`)

```groq
work[] {
  name, location,
  positions[]{ position, startDate, endDate, summary, highlights[]{ text } }
}
```

### Component change (`apps/web/components/cv/ExperienceList.tsx`)

- For each company: render company name + location as header, and full date span (first position's startDate → last position's endDate)
- For single-position companies: render identically to the current layout (position title prominent)
- For multi-position companies (HSBC): render company as the primary header, then list each position as an indented sub-item with its own dates, summary, and highlights
- Add `.exp-loc` rendering (already has CSS class defined)

No new CSS classes needed — `.exp-loc` already exists in `globals.css:234`.

---

## 3. Skills Section Updates

### New `skillsNote` field

Add `skillsNote: Bilingual` to the resume schema (top-level, alongside `skills[]`). Render in `SkillsBlock` as a small muted paragraph below all skill rows.

**English text:**
> Tech stacks come and go. With AI-augmented workflows the time to productivity in a new stack has shrunk dramatically — what matters is knowing how to learn, not what you currently know.

**Polish text:**
> Technologie przychodzą i odchodzą. Przy wsparciu AI czas potrzebny do produktywności w nowym stosie technologicznym drastycznie się skrócił — liczy się umiejętność uczenia się, nie to, co aktualnie znasz.

### Updated skill categories

| Category | Keywords |
|---|---|
| Languages | TypeScript, Python, Java, SQL |
| Frontend | React, Flutter, Next.js |
| Cloud | GCP (Firebase · BigQuery · GCS), AWS |
| Backend | FastAPI, Flask, NestJS, Node.js, PostgreSQL, DynamoDB |
| AI Tools | Cursor, Claude Code, Claude Design, Gemini, Google Stitch |
| Approach | Stack-agnostic · AI-augmented workflow · process over tools |

---

## 4. Seed Data (`scripts/seed-sanity.ts`)

Full replacement of placeholder work entries with real data. Languages reduced to English (Fluent) + Polish (Native).

### Work entries

**FQ Enterprises AS** — Full Stack Engineer, Jan 2021 – Present, Norway (Remote)
- Summary: End-to-end development of Layn, a queuing management system, using Flutter for client apps and Google Cloud (Firebase, Firestore, BigQuery, Data Studio) for backend and analytics.
- Highlights:
  - Built and maintained the Flutter frontend for Layn across multiple client deployments
  - Integrated Firestore for real-time data sync and built BigQuery/Data Studio pipelines for statistics and reporting

**Voyantis** — Full Stack Engineer, Jan 2022 – Mar 2026, Tel Aviv (Remote)
- Summary: Built internal tools for data scientists and customer success managers at an Israeli AI startup. Worked across the full stack — React frontends, FastAPI/Flask backends, AWS infrastructure, and dbt data pipelines.
- Highlights:
  - Foresight UI — React + NestJS/TypeORM/Postgres admin dashboard used by customer-facing teams, built in an NX monorepo
  - Dexter's Lab — Dash/Plotly dashboard for monitoring, deploying and managing predictive models and data backfills
  - Built data loading jobs, dbt transformation scripts, and MCP servers to streamline data analysis workflows

**IGT Poland** — Senior Software Engineer, Dec 2018 – Jul 2022, Warsaw
- Summary: Development and maintenance of enterprise-scale gaming platforms powering national lotteries across multiple countries.
- Highlights:
  - Developed and maintained complex lottery platform components used by national lottery operators worldwide
  - Technologies: Java/Spring, JBoss EAP, DB2, ActiveMQ Artemis, Apache Camel, JMX

**HSBC Service Delivery** — 3 positions, Jul 2017 – Dec 2018, Kraków

| Role | Dates | Summary |
|---|---|---|
| Acting Tech Lead | Aug 2018 – Dec 2018 | Led Originations SSP — migrating 150+ customer journeys (loans, cards, mortgages) to a cloud-hosted tech stack |
| Senior Fullstack Engineer | Feb 2018 – Aug 2018 | End-to-end new-to-bank loan journey; TypeScript/React/Redux frontend, Java/Spring Boot/Mongo backend, PCF DevOps |
| Senior Software Engineer | Jul 2017 – Feb 2018 | Delivered RACoE — lifecycle management of customer retirement cases, reducing manual processing at the bank |

**ReasonApps** — Freelance Web Developer, Mar 2018 – May 2018, Kraków
- Summary: Short-term freelance React development engagement.

**Leanle** — Freelance Web Developer, Mar 2017 – Oct 2017, Kraków
- Summary: Freelance web development — React applications and WordPress sites.

**Idium Polska** — Java Web Developer, Jul 2014 – Jul 2017, Kraków
- Summary: Subsidiary of Norway's leading media house. Developed and maintained Idium Web+ and Editap CMS platforms; launched Editap on the Norwegian market.
- Highlights:
  - Technologies: Java 8, OSGi (Apache Felix), Varnish, AWS, ELK Stack, Docker, Node.js

**IBM Poland** — Software Engineer Intern, May 2013 – Jul 2014, Kraków
- Summary: Contributed to Eclipse Orion/JazzHub, an open-source web IDE and CI/CD platform, and IBM Maximo-based Smart Road Maintenance system.

### Languages

```
English — Fluent
Polish — Native
```

---

## Files Touched

| File | Change |
|---|---|
| `apps/web/styles/globals.css` | Swap order values in mobile media query |
| `apps/studio/schemas/resume.ts` | Restructure work field + add skillsNote |
| `apps/web/lib/types.ts` | New WorkPosition type, updated Work type, add skillsNote to Resume |
| `apps/web/lib/queries.ts` | Update GROQ for nested positions + skillsNote |
| `apps/web/components/cv/ExperienceList.tsx` | Render nested positions, location, grouped HSBC |
| `apps/web/components/cv/SkillsBlock.tsx` | Render skillsNote below skill rows |
| `scripts/seed-sanity.ts` | Full replacement with real data |
