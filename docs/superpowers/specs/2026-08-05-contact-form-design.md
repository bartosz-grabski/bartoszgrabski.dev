# Contact form with Turnstile + Cloudflare Email

**Date:** 2026-08-05
**Status:** Approved

## Goal

Let visitors send a message from the Contact page instead of only offering a
`mailto:` link. Fields: name, email, phone (optional), message. Protect
against bots with Cloudflare Turnstile. Deliver the message to
`hello@bartoszgrabski.dev` via Cloudflare Email Sending. Disclose data use
per RODO/GDPR, briefly.

## Constraints & context

- `apps/web` builds via `output: 'export'` (static HTML in `./out`) and
  deploys as a Cloudflare Worker with static assets
  (`wrangler.jsonc` → `name: "bartoszgrabski-dev"`, `assets.directory: "./out"`).
  There is no server today — no API routes, no Server Actions (unsupported
  under static export).
- The site is bilingual (`en`/`pl`) via `apps/web/lib/i18n` +
  `apps/web/lib/translations.ts`; all copy goes through that system.
- `ContactView` (`apps/web/components/contact/ContactView.tsx`) currently
  renders a heading, a channel list (email / socials / calendar), all driven
  by Sanity content with hardcoded-translation fallback.
- Site styling uses CSS custom properties (`--accent`, `--ink-soft`, `--rule`,
  `--font-mono`, `--font-display`) in `apps/web/styles/globals.css`; no
  component library — hand-rolled markup/CSS throughout.
- Existing toast mechanism (`T.toasts`, used for the CV JSON download) is
  reused for submit feedback rather than inventing a new one.
- Decisions locked in during brainstorming:
  - Turnstile in **managed** mode (Cloudflare decides checkbox vs invisible).
  - Email delivery via the **Cloudflare Email Sending Workers binding**
    (`env.EMAIL.send()`), not Email Routing/`EmailMessage`/mimetext, and not
    a third-party provider.
  - Worker lives in the **same deploy** as the static site (hybrid
    worker+assets), not a separate Worker — same origin, no CORS.
  - RODO/GDPR disclosure is an **info note**, not a required checkbox
    (replying to an inquiry the visitor initiated is legitimate interest;
    data is never used for marketing/newsletter).
  - Include a **honeypot** field (hidden input; if filled, silently no-op)
    alongside Turnstile — negligible cost, extra bot-noise reduction.
- Prerequisites the site owner confirmed are already done: `hello@bartoszgrabski.dev`
  reachable, and a Turnstile widget (site key + secret key) created for the
  domain. Still to do before first deploy (not code): onboard a sender domain
  via `wrangler email sending enable bartoszgrabski.dev` if not already
  onboarded, and `wrangler secret put TURNSTILE_SECRET`.

## Scope

**In scope:** the contact form UI, the `/api/contact` Worker endpoint,
Turnstile verification, honeypot, email send, bilingual copy, RODO/GDPR note,
unit tests for the pure validation logic and the form component.

**Out of scope (YAGNI):** rate-limiting rules, consent checkbox, persisting
submissions (DB/KV), attachments, retry/queueing of failed sends, admin UI.

## Architecture

### Deploy shape — hybrid Worker + static assets

`apps/web/wrangler.jsonc` gains:

```jsonc
{
  "main": "worker/index.ts",
  "assets": {
    "directory": "./out",
    "not_found_handling": "404-page",
    "run_worker_first": ["/api/*"]
  },
  "send_email": [{ "name": "EMAIL" }]
}
```

Only requests under `/api/*` reach the Worker's `fetch` handler; everything
else is served from `./out` exactly as today. `npx wrangler types` regenerates
`Env` (including `EMAIL: SendEmail`) — always use the generated type, don't
hand-write it. `TURNSTILE_SECRET` is a Worker secret, not committed.

### Worker — `apps/web/worker/index.ts`

```
POST /api/contact
  body: { name, email, phone?, message, turnstileToken, website }
                                                          ^ honeypot
```

Handler steps, in order (fail fast, cheapest checks first):

1. Only handle `POST /api/contact`; anything else → `404` (belt-and-braces;
   `run_worker_first` already scopes requests to `/api/*`).
2. **Honeypot:** if `website` is non-empty, return `200 { ok: true }`
   immediately — no Turnstile call, no email send, no validation-error detail
   given to the caller (don't tip off bots).
3. **Validate shape** via `validateContactPayload()` (see below) — pure
   function, no I/O. On failure: `400 { ok: false, error: 'invalid_payload' }`.
4. **Verify Turnstile token** — POST to
   `https://challenges.cloudflare.com/turnstile/v0/siteverify` with
   `secret`, `response: turnstileToken`, and the connecting IP
   (`request.headers.get('CF-Connecting-IP')`). On failure:
   `400 { ok: false, error: 'turnstile_failed' }`.
5. **Send email** via `env.EMAIL.send()`:
   - `to: 'hello@bartoszgrabski.dev'`
   - `from: { email: <onboarded sender address>, name: 'bartoszgrabski.dev contact form' }`
   - `replyTo: <visitor email>` — so replying from the inbox goes straight to
     the visitor.
   - `subject`: e.g. `` `Wiadomość ze strony — ${name}` ``
   - `text`/`html`: name, email, phone (or "—" if omitted), message.
   - On thrown error (see the service's `E_*` codes): log via
     `console.error` (Workers logs), return
     `500 { ok: false, error: 'send_failed' }`.
6. Success: `200 { ok: true }`.

`validateContactPayload(body: unknown)` (co-located, exported separately for
testing): checks `name`/`email`/`message` are non-empty strings under sane
length caps (e.g. name ≤ 100, email ≤ 254, phone ≤ 30, message ≤ 5000),
`email` matches a basic email shape, `phone` if present is a string, and
`turnstileToken`/`website` are strings (the latter may be empty). Returns a
discriminated result (`{ ok: true, data }` / `{ ok: false, error }`) — no
throwing, so the Worker handler stays simple.

### Client — `apps/web/components/contact/ContactForm.tsx`

New client component, rendered inside `ContactView` below the existing
channel list, under an `Eyebrow` matching the section's visual style (e.g.
`T.sections.form` — "message" / "wiadomość").

- Fields: Name (`text`, required), Email (`email`, required), Phone (`tel`,
  optional), Message (`textarea`, required). Plus the hidden honeypot input
  (`website`) — visually hidden via an off-screen CSS technique (not
  `display:none`/`hidden`, which unsophisticated bots may still respect but
  is trivially detected by more careful ones; off-screen absolute positioning
  is the standard mitigation) and `tabIndex={-1}`/`autoComplete="off"` so
  real users never encounter or focus it.
- Turnstile: loaded via `next/script` pointing at
  `https://challenges.cloudflare.com/turnstile/v0/api.js`, rendered into a
  `<div className="cf-turnstile" data-sitekey={...}>` per Cloudflare's
  standard implicit-render integration. Site key comes from
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public — site keys are not secret).
- Client-side validation mirrors the server's required/format checks (fast
  feedback, not a security boundary — the server re-validates regardless).
- Submit: `fetch('/api/contact', { method: 'POST', body: JSON.stringify(...) })`;
  disable the submit button while in flight; on success show the existing
  toast (new `T.toasts.contactSent` string) and reset the form (including
  re-rendering the Turnstile widget, which is single-use per token); on
  failure show an inline error message (mapped from `error` code to a
  translated string) without losing the user's typed input.
- Styling: plain inputs matching the site's existing minimal aesthetic,
  reusing the CSS custom properties already defined in `globals.css` (new
  rules added there, following the existing `.contact*` naming, e.g.
  `.contact-form`, `.contact-form input`, `.contact-form textarea`).

### RODO/GDPR disclosure

Static, translated text rendered under the form (no checkbox, no separate
Sanity field — hardcoded like the rest of the fallback copy in
`translations.ts`):

- **pl:** "Administratorem danych jest Bartosz Grabski
  (hello@bartoszgrabski.dev). Dane z formularza wykorzystuję wyłącznie po to,
  by odpowiedzieć na Twoją wiadomość — nie służą do marketingu ani
  newslettera i nie są nikomu przekazywane. Podstawa: art. 6 ust. 1 lit. f
  RODO (prawnie uzasadniony interes). Możesz w każdej chwili poprosić o
  usunięcie danych, pisząc na powyższy adres."
- **en:** "Data controller: Bartosz Grabski (hello@bartoszgrabski.dev). Form
  data is used solely to reply to your message — never for marketing or a
  newsletter, and never shared with third parties. Legal basis: GDPR Art. 6
  (1)(f), legitimate interest. You can request deletion at any time by
  emailing the address above."

### i18n additions (`apps/web/lib/translations.ts`)

New keys under both `en` and `pl`: `sections.form` (eyebrow label), a
`contactForm` object with field labels/placeholders, submit button label,
validation error strings, `error` strings keyed by the Worker's error codes
(`invalid_payload`, `turnstile_failed`, `send_failed`), and the RODO/GDPR
note text. `T.toasts.contactSent` alongside the existing `json` toast.

## Testing

- **`validateContactPayload`** (Jest, no I/O): valid payload passes; each
  required-field-missing/too-long case fails with the right error; malformed
  email rejected; optional phone omitted is fine; honeypot field being
  present-but-empty doesn't affect validation (the honeypot check itself
  lives in the handler, ahead of validation, and is exercised separately).
- **`ContactForm`** (Jest + Testing Library): renders all fields; client-side
  required-field validation blocks submit; successful `fetch` mock shows the
  success toast and resets fields; failed `fetch` mock (each error code)
  shows the right inline message and preserves input; submit button disables
  while in flight. Turnstile's external script is mocked/stubbed — no real
  network call in tests.
- **Not covered by automated tests** (manual, post-deploy): real Turnstile
  challenge round-trip, real `env.EMAIL.send()` delivery to
  `hello@bartoszgrabski.dev`, `run_worker_first` routing in the actual
  Cloudflare deploy.

## Out of scope (YAGNI)

- Rate limiting (beyond what Turnstile itself provides).
- Required consent checkbox — info note only, per owner's decision.
- Persisting submissions anywhere (DB/KV) — email is the only record.
- Retry/queue on transient send failures — surfaced to the user to resubmit.
- Attachments, CC/BCC, multi-recipient support.
- Admin/moderation UI.
