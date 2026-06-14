# Markdown Text Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Sanity-managed editorial text render inline markdown — links, bold, italic, inline code — across the whole site.

**Architecture:** A dependency-free `parseInline` function tokenizes a constrained inline-markdown subset into React nodes, wrapped by a `<RichText>` component that emits inline-only output. Every `{t(field)}` editorial render site is swapped to `<RichText text={t(field)} />`. Content model is unchanged (fields stay bilingual `string`/`text`); only Sanity field descriptions are updated to advertise the syntax.

**Tech Stack:** Next.js 16 / React 19 / TypeScript, Jest + Testing Library, Sanity Studio schemas.

---

## File structure

- **Create** `apps/web/components/ui/RichText.tsx` — `parseInline()` + `<RichText>`. Single responsibility: inline-markdown → React nodes.
- **Create** `apps/web/__tests__/RichText.test.tsx` — unit tests for the parser.
- **Modify** `apps/web/components/now/NowView.tsx` — blurb, learning, around.
- **Modify** `apps/web/components/cv/ExperienceList.tsx` — summary + highlights.
- **Modify** `apps/web/components/cv/CVView.tsx` — basics.summary paragraphs.
- **Modify** `apps/web/components/cv/SkillsBlock.tsx` — skillsNote.
- **Modify** `apps/web/components/contact/ContactView.tsx` — heading/lines/signature; drop `parseHeading`.
- **Modify** `apps/studio/schemas/now.ts`, `resume.ts`, `siteSettings.ts`, `helpers.ts` — field descriptions.

---

## Task 1: The `parseInline` core + `RichText` component

**Files:**
- Create: `apps/web/components/ui/RichText.tsx`
- Test: `apps/web/__tests__/RichText.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// apps/web/__tests__/RichText.test.tsx
import { render } from '@testing-library/react'
import { parseInline, RichText } from '@/components/ui/RichText'

function html(text: string): string {
  const { container } = render(<RichText text={text} />)
  return container.innerHTML
}

describe('parseInline', () => {
  it('returns plain text unchanged', () => {
    expect(html('just words')).toBe('just words')
  })

  it('renders **bold** as <strong>', () => {
    expect(html('a **b** c')).toBe('a <strong>b</strong> c')
  })

  it('renders *italic* as <em>', () => {
    expect(html('a *b* c')).toBe('a <em>b</em> c')
  })

  it('renders `code` as <code>', () => {
    expect(html('a `b` c')).toBe('a <code>b</code> c')
  })

  it('renders an external link with target+rel', () => {
    expect(html('see [site](https://x.com)')).toBe(
      'see <a href="https://x.com" target="_blank" rel="noopener noreferrer">site</a>',
    )
  })

  it('renders a mailto link without target', () => {
    expect(html('[mail](mailto:a@b.com)')).toBe(
      '<a href="mailto:a@b.com">mail</a>',
    )
  })

  it('renders a relative link without target', () => {
    expect(html('[now](/now)')).toBe('<a href="/now">now</a>')
  })

  it('rejects unsafe href schemes and emits plain text', () => {
    expect(html('[x](javascript:alert(1))')).toBe('[x](javascript:alert(1))')
  })

  it('handles multiple/adjacent tokens in one string', () => {
    expect(html('**a***b*')).toBe('<strong>a</strong><em>b</em>')
  })

  it('exposes parseInline returning an array of nodes', () => {
    expect(Array.isArray(parseInline('hi'))).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/web && npx jest RichText -t parseInline`
Expected: FAIL — cannot find module `@/components/ui/RichText`.

- [ ] **Step 3: Implement `RichText.tsx`**

```tsx
// apps/web/components/ui/RichText.tsx
import { Fragment, type ReactNode } from 'react'

// Inline-markdown subset. Order matters: ** before *, link before everything.
// Tokens are matched non-greedily within a single string. Link labels are NOT
// recursively parsed (kept as plain text by design).
const TOKEN = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g

const SAFE_HREF = /^(https?:|mailto:|\/|#)/i
const EXTERNAL = /^https?:/i

export function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0
  for (const m of text.matchAll(TOKEN)) {
    const index = m.index ?? 0
    if (index > last) nodes.push(text.slice(last, index))

    if (m[1] !== undefined) {
      // [label](href)
      const label = m[2]
      const href = m[3]
      if (SAFE_HREF.test(href)) {
        const ext = EXTERNAL.test(href)
        nodes.push(
          <a
            key={key++}
            href={href}
            {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {label}
          </a>,
        )
      } else {
        nodes.push(m[0]) // unsafe scheme → emit raw
      }
    } else if (m[4] !== undefined) {
      nodes.push(<strong key={key++}>{m[5]}</strong>)
    } else if (m[6] !== undefined) {
      nodes.push(<em key={key++}>{m[7]}</em>)
    } else if (m[8] !== undefined) {
      nodes.push(<code key={key++}>{m[9]}</code>)
    }

    last = index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function RichText({ text }: { text: string }) {
  return <Fragment>{parseInline(text)}</Fragment>
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && npx jest RichText`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/ui/RichText.tsx apps/web/__tests__/RichText.test.tsx
git commit -m "feat: add inline-markdown RichText renderer"
```

---

## Task 2: Wire RichText into NowView

**Files:**
- Modify: `apps/web/components/now/NowView.tsx:33-38` (building), `:45-47` (learning), `:61-63` (around)

- [ ] **Step 1: Add the import**

At the top of `apps/web/components/now/NowView.tsx`, after the existing `Eyebrow` import:

```tsx
import { RichText } from '@/components/ui/RichText'
```

- [ ] **Step 2: Render building title + blurb via RichText**

Replace:

```tsx
                <p className="now-title">{t(b.title)}</p>
                <p className="now-blurb">{t(b.blurb)}</p>
```

with:

```tsx
                <p className="now-title"><RichText text={t(b.title)} /></p>
                <p className="now-blurb"><RichText text={t(b.blurb)} /></p>
```

- [ ] **Step 3: Render learning items with `·` separators (no string join)**

Replace:

```tsx
            <p className="now-inline">
              {now.learning.map(l => t(l.item)).join('  ·  ')}
            </p>
```

with:

```tsx
            <p className="now-inline">
              {now.learning.map((l, i) => (
                <span key={i}>
                  {i > 0 && '  ·  '}
                  <RichText text={t(l.item)} />
                </span>
              ))}
            </p>
```

- [ ] **Step 4: Render around items via RichText**

Replace:

```tsx
              <p className="now-line" key={i}>{t(a.item)}</p>
```

with:

```tsx
              <p className="now-line" key={i}><RichText text={t(a.item)} /></p>
```

- [ ] **Step 5: Verify the suite still passes**

Run: `cd apps/web && npx jest`
Expected: PASS (no NowView test exists; nothing should break).

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/now/NowView.tsx
git commit -m "feat: render Now text fields with markdown"
```

---

## Task 3: Wire RichText into ExperienceList

**Files:**
- Modify: `apps/web/components/cv/ExperienceList.tsx`
- Test: `apps/web/__tests__/ExperienceList.test.tsx` (extend)

- [ ] **Step 1: Add a failing test for a link in a highlight**

Open `apps/web/__tests__/ExperienceList.test.tsx`. Add this test inside the existing top-level `describe` block (reuse the file's existing `renderWithLang` helper and `Work` fixture shape — model the new fixture on whatever the file already defines):

```tsx
  it('renders markdown links inside highlights', () => {
    const work = [
      {
        name: 'Acme',
        positions: [
          {
            position: { en: 'Engineer', pl: 'Inżynier' },
            startDate: '2020-01',
            endDate: 'Present',
            summary: { en: '', pl: '' },
            highlights: [
              { text: { en: 'Shipped [docs](https://acme.dev)', pl: 'x' } },
            ],
          },
        ],
      },
    ]
    const { container } = renderWithLang(<ExperienceList work={work} />)
    const link = container.querySelector('a[href="https://acme.dev"]')
    expect(link).not.toBeNull()
    expect(link?.textContent).toBe('docs')
  })
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd apps/web && npx jest ExperienceList -t "markdown links"`
Expected: FAIL — no `<a>` rendered (text is literal).

- [ ] **Step 3: Add import + swap the four render sites**

Add at top of `apps/web/components/cv/ExperienceList.tsx`:

```tsx
import { RichText } from '@/components/ui/RichText'
```

In the **multi-position** branch replace:

```tsx
                      {pos.summary && <p className="exp-summary">{t(pos.summary)}</p>}
```
```tsx
                            <li key={k}>{t(h.text)}</li>
```

with:

```tsx
                      {pos.summary && <p className="exp-summary"><RichText text={t(pos.summary)} /></p>}
```
```tsx
                            <li key={k}><RichText text={t(h.text)} /></li>
```

In the **single-position** branch replace:

```tsx
                {first.summary && <p className="exp-summary">{t(first.summary)}</p>}
```
```tsx
                      <li key={j}>{t(h.text)}</li>
```

with:

```tsx
                {first.summary && <p className="exp-summary"><RichText text={t(first.summary)} /></p>}
```
```tsx
                      <li key={j}><RichText text={t(h.text)} /></li>
```

- [ ] **Step 4: Run the file's tests to verify pass**

Run: `cd apps/web && npx jest ExperienceList`
Expected: PASS (new test + all existing ones).

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/cv/ExperienceList.tsx apps/web/__tests__/ExperienceList.test.tsx
git commit -m "feat: render experience summaries and highlights with markdown"
```

---

## Task 4: Wire RichText into CVView (summary paragraphs) and SkillsBlock

**Files:**
- Modify: `apps/web/components/cv/CVView.tsx:35-37`
- Modify: `apps/web/components/cv/SkillsBlock.tsx:21`
- Test: `apps/web/__tests__/SkillsBlock.test.tsx` (extend)

- [ ] **Step 1: Add a failing test for markdown in skillsNote**

In `apps/web/__tests__/SkillsBlock.test.tsx`, add inside the `describe('SkillsBlock', ...)` block:

```tsx
  it('renders markdown in skillsNote', () => {
    const rich: Bilingual = { en: 'Tools **change**.', pl: 'x' }
    const { container } = renderWithLang(<SkillsBlock skills={skills} skillsNote={rich} />)
    expect(container.querySelector('.skill-note strong')?.textContent).toBe('change')
  })
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd apps/web && npx jest SkillsBlock -t "markdown in skillsNote"`
Expected: FAIL — no `<strong>` (literal `**change**`).

- [ ] **Step 3: Swap SkillsBlock render site**

Add import at top of `apps/web/components/cv/SkillsBlock.tsx`:

```tsx
import { RichText } from '@/components/ui/RichText'
```

Replace:

```tsx
      {skillsNote && <p className="skill-note">{t(skillsNote)}</p>}
```

with:

```tsx
      {skillsNote && <p className="skill-note"><RichText text={t(skillsNote)} /></p>}
```

- [ ] **Step 4: Swap CVView summary paragraphs**

Add import at top of `apps/web/components/cv/CVView.tsx`:

```tsx
import { RichText } from '@/components/ui/RichText'
```

Replace:

```tsx
          {t(basics.summary).split('\n').filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
```

with:

```tsx
          {t(basics.summary).split('\n').filter(Boolean).map((p, i) => (
            <p key={i}><RichText text={p} /></p>
          ))}
```

- [ ] **Step 5: Run tests to verify pass**

Run: `cd apps/web && npx jest SkillsBlock`
Expected: PASS (new + existing).

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/cv/CVView.tsx apps/web/components/cv/SkillsBlock.tsx apps/web/__tests__/SkillsBlock.test.tsx
git commit -m "feat: render CV summary and skills note with markdown"
```

---

## Task 5: Wire RichText into ContactView and remove parseHeading

**Files:**
- Modify: `apps/web/components/contact/ContactView.tsx`

- [ ] **Step 1: Replace the heading parser with RichText rendering**

Remove the `parseHeading` function (lines 10-15) and its usage. Add the import at the top:

```tsx
import { RichText } from '@/components/ui/RichText'
```

Replace the heading derivation block:

```tsx
  // Prefer Sanity-managed copy; fall back to the hardcoded translations.
  const [pre, em, post] = contact
    ? parseHeading(t(contact.heading))
    : T.contactHead
  const availabilityText = contact
    ? t(contact.availabilityLine).replace('{availability}', period)
    : T.contactSub1(t(availabilityLabel))
  const bookingText = contact ? t(contact.bookingLine) : T.contactSub2
  const signText = contact
    ? t(contact.signature).replace('{name}', firstName)
    : T.contactSign(firstName)
```

with (token replacement runs before markdown parsing; the fallback path keeps its existing structured shape):

```tsx
  // Prefer Sanity-managed copy; fall back to the hardcoded translations.
  const headingText = contact ? t(contact.heading) : null
  const availabilityText = contact
    ? t(contact.availabilityLine).replace('{availability}', period)
    : T.contactSub1(t(availabilityLabel))
  const bookingText = contact ? t(contact.bookingLine) : T.contactSub2
  const signText = contact
    ? t(contact.signature).replace('{name}', firstName)
    : T.contactSign(firstName)
```

- [ ] **Step 2: Update the JSX to render heading + lines via RichText**

Replace the statement block:

```tsx
        <h2>
          {pre}{pre && em ? ' ' : ''}
          {em && <em>{em}</em>}
          {post}
        </h2>
        <p>{availabilityText}</p>
        <p>{bookingText}</p>
        <p className="signed">{signText}</p>
```

with (when Sanity copy exists, render markdown; otherwise keep the legacy `[pre, em, post]` tuple):

```tsx
        <h2>
          {headingText !== null ? (
            <RichText text={headingText} />
          ) : (
            <>
              {T.contactHead[0]}
              {T.contactHead[0] && T.contactHead[1] ? ' ' : ''}
              {T.contactHead[1] && <em>{T.contactHead[1]}</em>}
              {T.contactHead[2]}
            </>
          )}
        </h2>
        <p><RichText text={availabilityText} /></p>
        <p><RichText text={bookingText} /></p>
        <p className="signed"><RichText text={signText} /></p>
```

- [ ] **Step 3: Run the full suite**

Run: `cd apps/web && npx jest`
Expected: PASS. (No ContactView test exists; ensure nothing else breaks.)

- [ ] **Step 4: Lint to confirm no unused vars (`pre`/`em`/`post` removed)**

Run: `cd apps/web && npx eslint components/contact/ContactView.tsx`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/contact/ContactView.tsx
git commit -m "feat: render contact copy with markdown, drop bespoke heading parser"
```

---

## Task 6: Advertise markdown support in Sanity field descriptions

**Files:**
- Modify: `apps/studio/schemas/helpers.ts`, `now.ts`, `resume.ts`, `siteSettings.ts`

- [ ] **Step 1: Add an optional description to the bilingual helpers**

In `apps/studio/schemas/helpers.ts`, extend both helpers to accept an optional `description` and pass it through. Replace `bilingualField`:

```ts
export function bilingualField(name: string, title: string, description?: string) {
  return defineField({
    name,
    title,
    description,
    type: 'object',
    fields: [
      defineField({ name: 'en', title: 'English', type: 'string', validation: r => r.required() }),
      defineField({ name: 'pl', title: 'Polski', type: 'string', validation: r => r.required() }),
    ],
  })
}
```

and `bilingualText`:

```ts
export function bilingualText(name: string, title: string, description?: string) {
  return defineField({
    name,
    title,
    description,
    type: 'object',
    fields: [
      defineField({ name: 'en', title: 'English', type: 'text', rows: 3 }),
      defineField({ name: 'pl', title: 'Polski', type: 'text', rows: 3 }),
    ],
  })
}
```

- [ ] **Step 2: Add descriptions on the Now prose fields**

In `apps/studio/schemas/now.ts`, replace:

```ts
          bilingualField('title', 'Title'),
          bilingualText('blurb', 'Blurb'),
```

with:

```ts
          bilingualField('title', 'Title'),
          bilingualText('blurb', 'Blurb', MARKDOWN_HINT),
```

and replace both learning/around lines:

```ts
      of: [{ type: 'object', fields: [bilingualField('item', 'Item')] }],
```

with:

```ts
      of: [{ type: 'object', fields: [bilingualField('item', 'Item', MARKDOWN_HINT)] }],
```

Then add this constant near the top of the file (after the imports):

```ts
const MARKDOWN_HINT = 'Supports markdown: **bold**, *italic*, `code`, [links](https://example.com).'
```

- [ ] **Step 3: Add descriptions on the Resume prose fields**

In `apps/studio/schemas/resume.ts`, add the same constant after the imports:

```ts
const MARKDOWN_HINT = 'Supports markdown: **bold**, *italic*, `code`, [links](https://example.com).'
```

Then add `MARKDOWN_HINT` as the third arg on these calls (leave non-prose fields untouched):

- `bilingualText('summary', 'Summary')` → `bilingualText('summary', 'Summary', MARKDOWN_HINT)` (basics)
- `bilingualText('summary', 'Summary')` → `bilingualText('summary', 'Summary', MARKDOWN_HINT)` (work position)
- `bilingualField('text', 'Bullet text')` → `bilingualField('text', 'Bullet text', MARKDOWN_HINT)`
- `bilingualText('skillsNote', 'Skills Note')` → `bilingualText('skillsNote', 'Skills Note', MARKDOWN_HINT)`
- `bilingualText('description', 'Description')` → `bilingualText('description', 'Description', MARKDOWN_HINT)` (projects)

- [ ] **Step 4: Add descriptions on the Contact fields**

In `apps/studio/schemas/siteSettings.ts`, add the constant after the imports:

```ts
const MARKDOWN_HINT = 'Supports markdown: **bold**, *italic*, `code`, [links](https://example.com).'
```

Then update the contact lines to pass it through:

```ts
        bilingualText('availabilityLine', 'Availability line — use {availability} where the availability label should appear', MARKDOWN_HINT),
        bilingualText('bookingLine', 'Booking line', MARKDOWN_HINT),
```

(Leave the `heading` and `signature` descriptions as-is — they already document their `*asterisk*`/`{token}` conventions.)

- [ ] **Step 5: Type-check the studio**

Run: `cd apps/studio && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/studio/schemas/helpers.ts apps/studio/schemas/now.ts apps/studio/schemas/resume.ts apps/studio/schemas/siteSettings.ts
git commit -m "docs: advertise markdown support in Sanity field descriptions"
```

---

## Task 7: Full verification

- [ ] **Step 1: Run the entire web test suite**

Run: `cd apps/web && npx jest`
Expected: all suites PASS.

- [ ] **Step 2: Lint the web app**

Run: `cd apps/web && npx eslint .`
Expected: no errors.

- [ ] **Step 3: Manual preview check (browser)**

Start the dev server, open the Now page, and confirm a `[label](url)` in a Building blurb renders as a clickable link; confirm `**bold**`/`*italic*` render in the CV summary. Then open the CV print preview and confirm links appear as styled text and nothing is clipped. Capture a screenshot as proof.

---

## Self-review notes

- **Spec coverage:** core renderer (Task 1) ✓; all editorial sites — Now (T2), Experience (T3), CV summary + skills (T4), Contact (T5) ✓; href whitelist + token-before-parse ordering (T1 test + T5 step 1) ✓; no schema migration, descriptions only (T6) ✓; print verification (T7) ✓.
- **No placeholders:** every code step shows full code.
- **Type consistency:** `parseInline`/`RichText` names and `RichText({ text })` prop shape are identical across all tasks.
