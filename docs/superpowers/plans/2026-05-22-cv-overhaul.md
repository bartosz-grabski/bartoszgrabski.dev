# CV Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix mobile layout, restructure work schema to support multi-role companies, update skills with AI tools + philosophy note, and replace all placeholder seed data with real content.

**Architecture:** Schema-first approach — update types and Sanity schema before touching components, so TypeScript catches mismatches during component work. Seed runs last after all rendering code is in place.

**Tech Stack:** Next.js 15 (App Router), Sanity v5, TypeScript, Jest + React Testing Library, `npm run seed` (ts-node)

---

## File Map

| File | Change |
|---|---|
| `apps/web/styles/globals.css` | Swap `order` values in mobile media query |
| `apps/web/lib/types.ts` | New `WorkPosition` type; `Work` becomes company wrapper; add `skillsNote` to `Resume` |
| `apps/studio/schemas/resume.ts` | Restructure `work[]` to nested positions; add `skillsNote` field |
| `apps/web/lib/queries.ts` | Update GROQ for nested positions + `skillsNote` |
| `apps/web/components/cv/ExperienceList.tsx` | Render nested positions; company header for multi-role |
| `apps/web/styles/globals.css` | Add `.exp-sub`, `.exp-sub-head`, `.skill-note` CSS |
| `apps/web/components/cv/SkillsBlock.tsx` | Accept + render `skillsNote` prop |
| `apps/web/components/cv/CVView.tsx` | Thread `resume.skillsNote` into `SkillsBlock` |
| `apps/web/__tests__/ExperienceList.test.tsx` | New — tests for single and multi-position rendering |
| `apps/web/__tests__/SkillsBlock.test.tsx` | New — tests for skills + note rendering |
| `scripts/seed-sanity.ts` | Full replacement with real work, skills, languages data |

---

## Task 1: Mobile Layout Fix

**Files:**
- Modify: `apps/web/styles/globals.css` (around line 299)

- [ ] **Step 1: Swap order values**

In the `@media (max-width: 820px)` block, find these two lines and swap their values:

```css
/* Before */
.cv .meta-col { order: 2; }
.cv .main-col { order: 1; }

/* After */
.cv .meta-col { order: 1; }
.cv .main-col { order: 2; }
```

- [ ] **Step 2: Verify visually**

Start dev server: `npm run dev:web`
Resize browser to < 820px. About section (with photo) should now appear above Experience.

- [ ] **Step 3: Commit**

```bash
git add apps/web/styles/globals.css
git commit -m "fix: about section first on mobile"
```

---

## Task 2: Update TypeScript Types

**Files:**
- Modify: `apps/web/lib/types.ts`

- [ ] **Step 1: Replace Work-related types and add skillsNote to Resume**

Replace the existing `Work` interface and add `WorkPosition`. Also add `skillsNote` to `Resume`:

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

And update `Resume` to add `skillsNote`:

```ts
export interface Resume {
  basics: Basics
  work: Work[]
  education: Education[]
  skills: Skill[]
  skillsNote?: Bilingual
  languages: Language[]
  projects: Project[]
  speaking: Speaking[]
}
```

- [ ] **Step 2: Verify TypeScript compiles (errors expected in components — that's fine)**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

Expected: errors in `ExperienceList.tsx` and `SkillsBlock.tsx` referencing old shape — this is correct, we'll fix them in subsequent tasks.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/types.ts
git commit -m "refactor: Work type supports nested positions, Resume adds skillsNote"
```

---

## Task 3: Update Sanity Schema and GROQ Query

**Files:**
- Modify: `apps/studio/schemas/resume.ts`
- Modify: `apps/web/lib/queries.ts`

- [ ] **Step 1: Restructure the `work` field in resume.ts**

Replace the existing `work` `defineField` block (lines 44–67) with:

```ts
defineField({
  name: 'work',
  title: 'Work Experience',
  type: 'array',
  of: [{
    type: 'object',
    fields: [
      defineField({ name: 'name', title: 'Company', type: 'string', validation: r => r.required() }),
      defineField({ name: 'location', title: 'Location', type: 'string' }),
      defineField({
        name: 'positions',
        title: 'Positions',
        type: 'array',
        of: [{
          type: 'object',
          fields: [
            bilingualField('position', 'Position / Role'),
            defineField({ name: 'startDate', title: 'Start Date (YYYY-MM)', type: 'string' }),
            defineField({ name: 'endDate', title: 'End Date (YYYY-MM or "Present")', type: 'string' }),
            bilingualText('summary', 'Summary'),
            defineField({
              name: 'highlights',
              title: 'Highlights',
              type: 'array',
              of: [{ type: 'object', fields: [bilingualField('text', 'Bullet text')] }],
            }),
          ],
        }],
      }),
    ],
  }],
}),
```

- [ ] **Step 2: Add `skillsNote` field after the `skills` field in resume.ts**

After the closing of the `skills` defineField block, add:

```ts
bilingualText('skillsNote', 'Skills Note'),
```

- [ ] **Step 3: Update the GROQ query in queries.ts**

Replace the `work[]` projection and add `skillsNote`:

```ts
export async function fetchResume(): Promise<Resume> {
  return client.fetch(`
    *[_type == "resume"][0]{
      basics {
        name, email, phone, url,
        summary, image, location, profiles
      },
      work[] {
        name, location,
        positions[]{ position, startDate, endDate, summary, highlights[]{ text } }
      },
      education[]{ institution, area, studyType, startDate, endDate },
      skills[]{ name, keywords },
      skillsNote,
      languages[]{ language, fluency },
      projects[]{ name, description, roles, keywords, url },
      speaking[]{ title, venue, year }
    }
  `)
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/studio/schemas/resume.ts apps/web/lib/queries.ts
git commit -m "feat: nested positions in work schema, add skillsNote"
```

---

## Task 4: ExperienceList Tests + Implementation + CSS

**Files:**
- Create: `apps/web/__tests__/ExperienceList.test.tsx`
- Modify: `apps/web/components/cv/ExperienceList.tsx`
- Modify: `apps/web/styles/globals.css`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/__tests__/ExperienceList.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { LangProvider } from '@/lib/i18n'
import { ExperienceList } from '@/components/cv/ExperienceList'
import type { Work } from '@/lib/types'

function renderWithLang(ui: React.ReactElement) {
  return render(<LangProvider>{ui}</LangProvider>)
}

const singleRoleWork: Work[] = [{
  name: 'Voyantis',
  location: 'Tel Aviv, Israel (Remote)',
  positions: [{
    position: { en: 'Full Stack Engineer', pl: 'Fullstack Developer' },
    startDate: '2022-01',
    endDate: '2026-03',
    summary: { en: 'Built internal tools at an AI startup.', pl: 'Budowałem narzędzia.' },
    highlights: [
      { text: { en: 'Foresight UI dashboard', pl: 'Dashboard Foresight UI' } },
    ],
  }],
}]

const multiRoleWork: Work[] = [{
  name: 'HSBC Service Delivery',
  location: 'Kraków, Poland',
  positions: [
    {
      position: { en: 'Acting Tech Lead', pl: 'Acting Tech Lead' },
      startDate: '2018-08',
      endDate: '2018-12',
      summary: { en: 'Led Originations SSP.', pl: 'Prowadziłem Originations SSP.' },
      highlights: [],
    },
    {
      position: { en: 'Senior Fullstack Engineer', pl: 'Senior Fullstack Engineer' },
      startDate: '2018-02',
      endDate: '2018-08',
      summary: { en: 'Loans NTB journey.', pl: 'Ścieżka kredytowa NTB.' },
      highlights: [],
    },
  ],
}]

describe('ExperienceList', () => {
  it('renders position and company for single-role entry', () => {
    renderWithLang(<ExperienceList work={singleRoleWork} />)
    expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument()
    expect(screen.getByText('Voyantis')).toBeInTheDocument()
  })

  it('renders location for single-role entry', () => {
    renderWithLang(<ExperienceList work={singleRoleWork} />)
    expect(screen.getByText('Tel Aviv, Israel (Remote)')).toBeInTheDocument()
  })

  it('renders highlights for single-role entry', () => {
    renderWithLang(<ExperienceList work={singleRoleWork} />)
    expect(screen.getByText('Foresight UI dashboard')).toBeInTheDocument()
  })

  it('renders company name as primary header for multi-role entry', () => {
    renderWithLang(<ExperienceList work={multiRoleWork} />)
    expect(screen.getByText('HSBC Service Delivery')).toBeInTheDocument()
  })

  it('renders all position titles for multi-role entry', () => {
    renderWithLang(<ExperienceList work={multiRoleWork} />)
    expect(screen.getByText('Acting Tech Lead')).toBeInTheDocument()
    expect(screen.getByText('Senior Fullstack Engineer')).toBeInTheDocument()
  })

  it('renders location for multi-role entry', () => {
    renderWithLang(<ExperienceList work={multiRoleWork} />)
    expect(screen.getByText('Kraków, Poland')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern=ExperienceList 2>&1 | tail -20
```

Expected: FAIL — `ExperienceList` uses old `Work` shape.

- [ ] **Step 3: Rewrite ExperienceList.tsx**

```tsx
import { useLang } from '@/lib/i18n'
import type { Work } from '@/lib/types'

export function ExperienceList({ work }: { work: Work[] }) {
  const { T, t } = useLang()
  return (
    <section>
      <h3 className="eyebrow">{T.sections.experience}</h3>
      {work.map((company, i) => {
        const isMulti = company.positions.length > 1
        const first = company.positions[0]
        const last = company.positions[company.positions.length - 1]
        return (
          <article className="exp-item" key={i}>
            {isMulti ? (
              <>
                <header className="exp-head">
                  <h4 className="role"><em>{company.name}</em></h4>
                  <span className="dates">{first.startDate} — {last.endDate}</span>
                </header>
                {company.location && <p className="exp-loc">{company.location}</p>}
                {company.positions.map((pos, j) => (
                  <div className="exp-sub" key={j}>
                    <div className="exp-sub-head">
                      <span className="co">{t(pos.position)}</span>
                      <span className="dates">{pos.startDate} — {pos.endDate}</span>
                    </div>
                    {pos.summary && <p className="exp-summary">{t(pos.summary)}</p>}
                    {pos.highlights.length > 0 && (
                      <ul className="exp-bullets">
                        {pos.highlights.map((h, k) => (
                          <li key={k}>{t(h.text)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <>
                <header className="exp-head">
                  <h4 className="role">
                    <span className="co">{t(first.position)}</span>
                    <span className="at">{T.atSep}</span>
                    <em>{company.name}</em>
                  </h4>
                  <span className="dates">{first.startDate} — {first.endDate}</span>
                </header>
                {company.location && <p className="exp-loc">{company.location}</p>}
                {first.summary && <p className="exp-summary">{t(first.summary)}</p>}
                {first.highlights.length > 0 && (
                  <ul className="exp-bullets">
                    {first.highlights.map((h, j) => (
                      <li key={j}>{t(h.text)}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </article>
        )
      })}
    </section>
  )
}
```

- [ ] **Step 4: Add CSS for sub-position elements**

In `apps/web/styles/globals.css`, add after the `.exp-bullets` block (around line 238):

```css
.exp-sub { margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--rule); }
.exp-sub:first-of-type { margin-top: 8px; }
.exp-sub-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 4px; }
.exp-sub-head .co { font-family: var(--font-display); font-weight: 500; font-size: 16px; letter-spacing: -0.005em; }
.exp-sub-head .dates { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--ink-soft); white-space: nowrap; }
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern=ExperienceList 2>&1 | tail -20
```

Expected: PASS — 6 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/web/__tests__/ExperienceList.test.tsx apps/web/components/cv/ExperienceList.tsx apps/web/styles/globals.css
git commit -m "feat: ExperienceList supports nested positions (HSBC multi-role)"
```

---

## Task 5: SkillsBlock Tests + Implementation + CVView

**Files:**
- Create: `apps/web/__tests__/SkillsBlock.test.tsx`
- Modify: `apps/web/components/cv/SkillsBlock.tsx`
- Modify: `apps/web/components/cv/CVView.tsx`
- Modify: `apps/web/styles/globals.css`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/__tests__/SkillsBlock.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { LangProvider } from '@/lib/i18n'
import { SkillsBlock } from '@/components/cv/SkillsBlock'
import type { Skill, Bilingual } from '@/lib/types'

function renderWithLang(ui: React.ReactElement) {
  return render(<LangProvider>{ui}</LangProvider>)
}

const skills: Skill[] = [
  { name: 'Frontend', keywords: ['React', 'Next.js'] },
  { name: 'AI Tools', keywords: ['Cursor', 'Claude Code'] },
]

const note: Bilingual = {
  en: 'Tech stacks come and go.',
  pl: 'Technologie przychodzą i odchodzą.',
}

describe('SkillsBlock', () => {
  it('renders skill category names', () => {
    renderWithLang(<SkillsBlock skills={skills} />)
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('AI Tools')).toBeInTheDocument()
  })

  it('renders keywords joined by ·', () => {
    renderWithLang(<SkillsBlock skills={skills} />)
    expect(screen.getByText('React · Next.js')).toBeInTheDocument()
  })

  it('renders skillsNote when provided', () => {
    renderWithLang(<SkillsBlock skills={skills} skillsNote={note} />)
    expect(screen.getByText('Tech stacks come and go.')).toBeInTheDocument()
  })

  it('does not render note element when skillsNote is absent', () => {
    const { container } = renderWithLang(<SkillsBlock skills={skills} />)
    expect(container.querySelector('.skill-note')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern=SkillsBlock 2>&1 | tail -20
```

Expected: FAIL — `SkillsBlock` doesn't accept `skillsNote` prop yet.

- [ ] **Step 3: Update SkillsBlock.tsx**

```tsx
import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Skill, Bilingual } from '@/lib/types'

interface SkillsBlockProps {
  skills: Skill[]
  skillsNote?: Bilingual
}

export function SkillsBlock({ skills, skillsNote }: SkillsBlockProps) {
  const { T, t } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.skills}</Eyebrow>
      {skills.map((s, i) => (
        <div className="skill-block" key={i}>
          <p className="label">{s.name}</p>
          <p className="items">{s.keywords.join(' · ')}</p>
        </div>
      ))}
      {skillsNote && <p className="skill-note">{t(skillsNote)}</p>}
    </section>
  )
}
```

- [ ] **Step 4: Thread skillsNote through CVView.tsx**

In `CVView.tsx`, update the `SkillsBlock` usage (line 35):

```tsx
<SkillsBlock skills={resume.skills} skillsNote={resume.skillsNote} />
```

- [ ] **Step 5: Add CSS for skill-note**

In `apps/web/styles/globals.css`, add after `.skill-block .items` (around line 242):

```css
.skill-note { font-size: 12px; line-height: 1.6; color: var(--ink-faint); margin: 16px 0 0; font-style: italic; }
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern=SkillsBlock 2>&1 | tail -20
```

Expected: PASS — 4 tests.

- [ ] **Step 7: Run full test suite**

```bash
npm test 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 8: Verify TypeScript compiles clean**

```bash
cd apps/web && npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add apps/web/__tests__/SkillsBlock.test.tsx apps/web/components/cv/SkillsBlock.tsx apps/web/components/cv/CVView.tsx apps/web/styles/globals.css
git commit -m "feat: SkillsBlock renders skillsNote philosophy footer"
```

---

## Task 6: Seed Data Replacement + Run

**Files:**
- Modify: `scripts/seed-sanity.ts`

- [ ] **Step 1: Replace the `resume` object in seed-sanity.ts**

Replace everything from `const resume = {` through the closing `}` before `const now` with:

```ts
const resume = {
  _id: 'resume',
  _type: 'resume',
  basics: {
    name: 'Bartosz Grabski',
    email: 'hello@bartoszgrabski.dev',
    url: 'bartoszgrabski.dev',
    summary: {
      en: 'Independent fullstack developer with over a decade across product engineering, cloud infrastructure, and data tooling.\nI work end-to-end — from API and database design through to interface details — and prefer small, high-trust teams where I can stay close to the problem.',
      pl: 'Niezależny programista fullstack z ponad dziesięcioletnim doświadczeniem w inżynierii produktu, infrastrukturze chmurowej i narzędziach danych.\nPracuję od początku do końca — od projektowania API i baz danych po detale interfejsu — i wolę małe, zaufane zespoły, w których mogę być blisko problemu.',
    },
    location: { city: 'Kraków', countryCode: 'PL' },
    profiles: [
      { network: 'GitHub',   username: 'bartosz-grabski',       url: 'https://github.com/bartosz-grabski' },
      { network: 'LinkedIn', username: 'bartosz-grabski-b89a0738', url: 'https://www.linkedin.com/in/bartosz-grabski-b89a0738/' },
    ],
  },
  work: [
    {
      name: 'FQ Enterprises AS',
      location: 'Norway (Remote)',
      positions: [{
        position: { en: 'Full Stack Engineer', pl: 'Full Stack Engineer' },
        startDate: '2021-01',
        endDate: 'Present',
        summary: {
          en: 'End-to-end development of Layn, a queuing management system, using Flutter for client apps and Google Cloud (Firebase, Firestore, BigQuery, Data Studio) for backend and analytics.',
          pl: 'Kompleksowy rozwój Layn, systemu zarządzania kolejkami, z wykorzystaniem Flutter dla aplikacji klienckich i Google Cloud (Firebase, Firestore, BigQuery, Data Studio) dla backendu i analityki.',
        },
        highlights: [
          { text: { en: 'Built and maintained the Flutter frontend for Layn across multiple client deployments.', pl: 'Zbudowałem i utrzymywałem frontend Flutter dla Layn w wielu wdrożeniach klienckich.' } },
          { text: { en: 'Integrated Firestore for real-time data sync and built BigQuery/Data Studio pipelines for statistics and reporting.', pl: 'Zintegrowałem Firestore do synchronizacji danych w czasie rzeczywistym i zbudowałem pipelines BigQuery/Data Studio do statystyk i raportowania.' } },
        ],
      }],
    },
    {
      name: 'Voyantis',
      location: 'Tel Aviv, Israel (Remote)',
      positions: [{
        position: { en: 'Full Stack Engineer', pl: 'Full Stack Engineer' },
        startDate: '2022-01',
        endDate: '2026-03',
        summary: {
          en: 'Built internal tools for data scientists and customer success managers at an Israeli AI startup. Worked across the full stack — React frontends, FastAPI/Flask backends, AWS infrastructure, and dbt data pipelines.',
          pl: 'Budowałem narzędzia wewnętrzne dla data scientistów i customer success managerów w izraelskim startupie AI. Pracowałem na pełnym stosie — frontendy React, backendy FastAPI/Flask, infrastruktura AWS i pipelines dbt.',
        },
        highlights: [
          { text: { en: 'Foresight UI — React + NestJS/TypeORM/Postgres admin dashboard used by customer-facing teams, built in an NX monorepo.', pl: 'Foresight UI — panel administracyjny React + NestJS/TypeORM/Postgres używany przez zespoły klienckie, zbudowany w monorepo NX.' } },
          { text: { en: "Dexter's Lab — Dash/Plotly dashboard for monitoring, deploying and managing predictive models and data backfills.", pl: "Dexter's Lab — dashboard Dash/Plotly do monitorowania, wdrażania i zarządzania modelami predykcyjnymi i backfillem danych." } },
          { text: { en: 'Built data loading jobs, dbt transformation scripts, and MCP servers to streamline data analysis workflows.', pl: 'Zbudowałem zadania ładowania danych, skrypty transformacji dbt i serwery MCP do usprawnienia przepływów analizy danych.' } },
        ],
      }],
    },
    {
      name: 'IGT Poland',
      location: 'Warsaw, Poland',
      positions: [{
        position: { en: 'Senior Software Engineer', pl: 'Senior Software Engineer' },
        startDate: '2018-12',
        endDate: '2022-07',
        summary: {
          en: 'Development and maintenance of enterprise-scale gaming platforms powering national lotteries across multiple countries.',
          pl: 'Rozwój i utrzymanie platform gamingowych klasy enterprise obsługujących krajowe loterie w wielu krajach.',
        },
        highlights: [
          { text: { en: 'Developed and maintained complex lottery platform components used by national lottery operators worldwide.', pl: 'Rozwijałem i utrzymywałem złożone komponenty platformy loteryjnej używane przez operatorów loterii krajowych na całym świecie.' } },
          { text: { en: 'Technologies: Java/Spring, JBoss EAP, DB2, ActiveMQ Artemis, Apache Camel, JMX.', pl: 'Technologie: Java/Spring, JBoss EAP, DB2, ActiveMQ Artemis, Apache Camel, JMX.' } },
        ],
      }],
    },
    {
      name: 'HSBC Service Delivery',
      location: 'Kraków, Poland',
      positions: [
        {
          position: { en: 'Acting Tech Lead', pl: 'Acting Tech Lead' },
          startDate: '2018-08',
          endDate: '2018-12',
          summary: {
            en: 'Led Originations SSP — a programme migrating 150+ customer journeys (loans, cards, mortgages) to a cloud-hosted tech stack.',
            pl: 'Prowadziłem Originations SSP — program migrujący 150+ ścieżek klientów (pożyczki, karty, hipoteki) na stos technologiczny hostowany w chmurze.',
          },
          highlights: [],
        },
        {
          position: { en: 'Senior Fullstack Engineer', pl: 'Senior Fullstack Engineer' },
          startDate: '2018-02',
          endDate: '2018-08',
          summary: {
            en: 'End-to-end new-to-bank loan application journey; TypeScript/React/Redux frontend, Java/Spring Boot/Mongo backend, PCF DevOps.',
            pl: 'Kompleksowa ścieżka aplikacji kredytowej dla nowych klientów banku; frontend TypeScript/React/Redux, backend Java/Spring Boot/Mongo, DevOps na PCF.',
          },
          highlights: [],
        },
        {
          position: { en: 'Senior Software Engineer', pl: 'Senior Software Engineer' },
          startDate: '2017-07',
          endDate: '2018-02',
          summary: {
            en: 'Delivered RACoE — lifecycle management of customer retirement cases, reducing manual processing at the bank.',
            pl: 'Dostarczyłem RACoE — zarządzanie cyklem życia spraw emerytalnych klientów, redukując ręczne przetwarzanie w banku.',
          },
          highlights: [],
        },
      ],
    },
    {
      name: 'ReasonApps',
      location: 'Kraków, Poland',
      positions: [{
        position: { en: 'Freelance Web Developer', pl: 'Freelance Web Developer' },
        startDate: '2018-03',
        endDate: '2018-05',
        summary: {
          en: 'Short-term freelance React development engagement.',
          pl: 'Krótkoterminowe zlecenie freelance — rozwój w React.',
        },
        highlights: [],
      }],
    },
    {
      name: 'Leanle',
      location: 'Kraków, Poland',
      positions: [{
        position: { en: 'Freelance Web Developer', pl: 'Freelance Web Developer' },
        startDate: '2017-03',
        endDate: '2017-10',
        summary: {
          en: 'Freelance web development — React applications and WordPress sites.',
          pl: 'Freelance web development — aplikacje React i strony WordPress.',
        },
        highlights: [],
      }],
    },
    {
      name: 'Idium Polska',
      location: 'Kraków, Poland',
      positions: [{
        position: { en: 'Java Web Developer', pl: 'Java Web Developer' },
        startDate: '2014-07',
        endDate: '2017-07',
        summary: {
          en: "Subsidiary of Norway's leading media house. Developed and maintained Idium Web+ and Editap CMS platforms; launched Editap on the Norwegian market.",
          pl: 'Spółka zależna wiodącego norweskiego domu mediowego. Rozwijałem i utrzymywałem platformy CMS Idium Web+ i Editap; wdrożyłem Editap na rynek norweski.',
        },
        highlights: [
          { text: { en: 'Technologies: Java 8, OSGi (Apache Felix), Varnish, AWS, ELK Stack, Docker, Node.js, ES6, Dojo.', pl: 'Technologie: Java 8, OSGi (Apache Felix), Varnish, AWS, ELK Stack, Docker, Node.js, ES6, Dojo.' } },
        ],
      }],
    },
    {
      name: 'IBM Poland',
      location: 'Kraków, Poland',
      positions: [{
        position: { en: 'Software Engineer Intern', pl: 'Praktykant — Software Engineer' },
        startDate: '2013-05',
        endDate: '2014-07',
        summary: {
          en: 'Contributed to Eclipse Orion/JazzHub, an open-source web IDE and CI/CD platform, and IBM Maximo-based Smart Road Maintenance system.',
          pl: 'Brałem udział w projekcie Eclipse Orion/JazzHub — open-source\'owym IDE webowym i platformie CI/CD, oraz systemie Smart Road Maintenance opartym na IBM Maximo.',
        },
        highlights: [],
      }],
    },
  ],
  education: [
    {
      institution: 'AGH University of Science and Technology',
      area: { en: 'Computer Science', pl: 'Informatyka' },
      studyType: 'MSc',
      startDate: '2011-10',
      endDate: '2017-06',
    },
  ],
  skills: [
    { name: 'Languages',  keywords: ['TypeScript', 'Python', 'Java', 'SQL'] },
    { name: 'Frontend',   keywords: ['React', 'Flutter', 'Next.js'] },
    { name: 'Cloud',      keywords: ['GCP (Firebase · BigQuery · GCS)', 'AWS'] },
    { name: 'Backend',    keywords: ['FastAPI', 'Flask', 'NestJS', 'Node.js', 'PostgreSQL', 'DynamoDB'] },
    { name: 'AI Tools',   keywords: ['Cursor', 'Claude Code', 'Claude Design', 'Gemini', 'Google Stitch'] },
    { name: 'Approach',   keywords: ['Stack-agnostic', 'AI-augmented workflow', 'Process over tools'] },
  ],
  skillsNote: {
    en: 'Tech stacks come and go. With AI-augmented workflows the time to productivity in a new stack has shrunk dramatically — what matters is knowing how to learn, not what you currently know.',
    pl: 'Technologie przychodzą i odchodzą. Przy wsparciu AI czas potrzebny do produktywności w nowym stosie technologicznym drastycznie się skrócił — liczy się umiejętność uczenia się, nie to, co aktualnie znasz.',
  },
  languages: [
    { language: 'English', fluency: 'Fluent' },
    { language: 'Polish',  fluency: 'Native' },
  ],
  speaking: [],
  projects: [],
}
```

- [ ] **Step 2: Commit the seed file before running**

```bash
git add scripts/seed-sanity.ts
git commit -m "feat: real experience data, updated skills + languages in seed"
```

- [ ] **Step 3: Run the seed**

From the repo root (requires `SANITY_PROJECT_ID`, `SANITY_API_TOKEN` in `.env` or environment):

```bash
npm run seed
```

Expected output:
```
Seeding resume…
Seeding now…
Done.
```

- [ ] **Step 4: Verify in browser**

Start the dev server: `npm run dev:web`

Check:
- Experience section shows all 8 companies in correct order
- HSBC shows company name as header with 3 nested positions
- Skills sidebar shows all 6 categories + philosophy note below
- Mobile view (< 820px): About/photo above Experience
