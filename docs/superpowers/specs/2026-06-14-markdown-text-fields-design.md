# Markdown formatting in Sanity text fields

**Date:** 2026-06-14
**Status:** Approved

## Goal

Let the site owner add inline formatting — links, bold, italic, inline code — to
editorial text managed in Sanity, without changing the content model. Motivating
example: adding a link inside a Now → Building blurb.

## Constraints & context

- All editorial text is stored in bilingual `{ en, pl }` objects as Sanity
  `string` / `text` fields and rendered directly via `t(field)` as React text
  nodes (see `apps/web/lib/i18n`).
- `ContactView` already hand-rolls a `parseHeading` mini-parser that turns
  `*word*` into `<em>` for the contact heading.
- The CV view (`CVView` / `ExperienceList` / `SkillsBlock`) is also printed to
  PDF, so any rendering must work in the print DOM.
- No markdown library is installed; the project favors lightweight hand-rolled
  solutions. Decision: dependency-free custom parser, **no** new dependency.
- Only the site owner edits content, so input is trusted — but href schemes are
  still whitelisted defensively.

## Scope

**In scope:** all editorial text fields.
**Features:** inline subset only — links, bold, italic, inline code. No
block-level markdown (lists/headings), which would not fit fields already
wrapped in specific elements.

## Architecture

### Core renderer — `apps/web/components/ui/RichText.tsx`

Two exports:

1. `parseInline(text: string): ReactNode[]` — pure, unit-testable function that
   tokenizes a constrained inline subset and returns an array of strings and
   React elements:
   - `[text](url)` → `<a>`. External `http(s)` URLs get
     `target="_blank" rel="noopener noreferrer"`; `mailto:` and relative URLs do
     not. **Href scheme whitelist:** only `http`, `https`, `mailto` (and
     relative paths) are allowed; anything else (e.g. `javascript:`) is rejected
     and the whole `[text](url)` is emitted as plain text.
   - `**bold**` → `<strong>`
   - `*italic*` → `<em>`
   - `` `code` `` → `<code>`
   - Unmatched text passes through verbatim.
   - Tokens may be adjacent/mixed within a line. Link label text is itself not
     recursively parsed (kept simple — labels are plain text).
2. `RichText({ text }: { text: string })` — thin wrapper returning
   `<>{parseInline(text)}</>`. Emits **inline** nodes only (no block wrappers),
   so it drops into existing `<p>`, `<li>`, `<dd>`, `<h2>` without restructuring.

### Integration points

Replace `{t(field)}` with `<RichText text={t(field)} />` at:

- **`NowView`** — building `blurb`; `around` items; `learning` items. The
  learning list currently does `now.learning.map(l => t(l.item)).join('  ·  ')`;
  since items become rich nodes, render each via `RichText` with `·` separators
  interleaved between items instead of string `.join`.
- **`ExperienceList`** — position `summary` and each `highlights` bullet
  (both the single-position and multi-position branches).
- **`CVView` / `SkillsBlock`** — `basics.summary`, project `description`,
  `skillsNote`.
- **`ContactView`** — remove the bespoke `parseHeading` function and render
  `heading`, `availabilityLine`, `bookingLine`, and `signature` via `RichText`.
  The heading's existing `*word*` convention maps onto the new `*italic*` rule
  (the emphasised word becomes `<em>`, matching today's behavior). Token
  replacement (`{name}`, `{availability}`) must run **before** `parseInline` so
  injected values are treated as plain text and cannot smuggle in markup.

### Sanity schema

No schema migration. Fields stay `string` / `text`; the bilingual helper model
is untouched; no data migration; no TS type changes (fields remain `string`).
Update field **descriptions** in `apps/studio/schemas/` to advertise supported
syntax, e.g. *"Supports `**bold**`, `*italic*`, `[links](url)`."* on the now
blurb, resume prose, contact lines, etc. The existing contact-heading
description already references asterisks and remains valid.

### Print / PDF

Output is plain `<a>` / `<strong>` / `<em>` / `<code>`, which existing print CSS
handles. Links degrade to styled text on paper (acceptable per owner). Verify
the CV print view after wiring.

## Testing

Jest unit tests for `parseInline`:

- Each token type individually: link (external + mailto + relative), bold,
  italic, code.
- Mixed and adjacent tokens within one string.
- Plain text passthrough (no tokens).
- Unsafe href rejection (`javascript:`) → emitted as plain text.
- External vs non-external link attributes (`target`/`rel`).

Plus a focused test for the Contact token-replacement ordering (token values
containing markup characters are not re-parsed as markup).

## Out of scope (YAGNI)

- Block-level markdown (lists, headings, paragraphs, blockquotes).
- Recursive parsing of link label text.
- Sanity Portable Text migration / rich-text editor.
- Any new runtime dependency.
