# Contact Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a working contact form to the Contact page that verifies visitors with Cloudflare Turnstile, blocks bots with a honeypot, and emails submissions to `hello@bartoszgrabski.dev` via the Cloudflare Email Sending Workers binding, with a bilingual RODO/GDPR disclosure.

**Architecture:** Turn the existing assets-only Cloudflare Worker deploy (`apps/web`, static export in `./out`) into a worker+assets hybrid: a new `POST /api/contact` Worker endpoint (`apps/web/worker/index.ts`) intercepts only `/api/*` via `assets.run_worker_first`, everything else still serves as static assets exactly as today. The endpoint honeypot-checks, validates the payload with a pure function, verifies the Turnstile token against Cloudflare's siteverify endpoint, then sends the email with `env.EMAIL.send()`. A new client component (`ContactForm.tsx`) renders the form inside the existing `ContactView`, reusing the site's `.field`/`.form-section`/`.btn` CSS and the existing toast/i18n systems.

**Tech Stack:** Next.js 16 (App Router, static export), React 19, TypeScript (strict), Jest + Testing Library, Cloudflare Workers (wrangler), Cloudflare Turnstile, Cloudflare Email Sending.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-05-contact-form-design.md` — read it before starting; every task below implements part of it.
- Static export (`output: 'export'`) — no Next.js API routes, no Server Actions. The `/api/contact` endpoint is a hand-written Cloudflare Worker fetch handler, not a Next.js route.
- All user-facing copy goes through `apps/web/lib/translations.ts` (`en`/`pl`), consumed via `useLang()` from `apps/web/lib/i18n.tsx`. Never hardcode English/Polish strings directly in components.
- Styling uses existing CSS custom properties in `apps/web/styles/globals.css` (`--accent`, `--ink`, `--ink-soft`, `--ink-faint`, `--rule`, `--rule-strong`, `--font-mono`, `--font-display`, `--font-body`). The form must reuse the already-defined (currently unused) `.form-section` and `.field` rules and the existing `.btn`/`.btn.primary` button style — do not reinvent form field styling.
- Toast feedback reuses the existing `useToast()` / `ToastProvider` from `apps/web/lib/toast.tsx` — do not add a second notification mechanism.
- Turnstile runs in **managed** mode. Email is sent via the **Cloudflare Email Sending Workers binding** (`env.EMAIL.send()`), never Email Routing/`EmailMessage`/mimetext, never a third-party provider.
- The Worker is added to the **same** `apps/web` deploy (hybrid worker+assets via `run_worker_first`), not a separate Worker project.
- RODO/GDPR disclosure is a **static info note**, not a required checkbox.
- Include a hidden **honeypot** field (`website`); if filled, the Worker returns a fake success with no side effects.
- No new npm dependencies. Everything needed (Fetch API globals, wrangler's built-in TS bundling) is already available.
- TypeScript strict mode (`tsconfig.json`) — all new code must typecheck cleanly.
- Test runner: `npm run test` (Jest, `jest.config.ts`, `testEnvironment: 'jsdom'`, path alias `@/*` → `apps/web/*`). New tests go in `apps/web/__tests__/`.
- Node version pinned via `.nvmrc` (22.22) — run `nvm use` if unsure which Node is active.

---

### Task 1: Contact payload validation

**Files:**
- Create: `apps/web/worker/validateContactPayload.ts`
- Test: `apps/web/__tests__/validateContactPayload.test.ts`

**Interfaces:**
- Produces: `ContactPayload` (`{ name: string; email: string; phone?: string; message: string }`), `ValidationResult` (`{ ok: true; data: ContactPayload } | { ok: false; error: 'invalid_payload' }`), and `validateContactPayload(body: unknown): ValidationResult` — a pure function, no I/O, importable from both the Worker (Task 2) and this test file.

- [ ] **Step 1: Write the failing tests**

Create `apps/web/__tests__/validateContactPayload.test.ts`:

```typescript
import { validateContactPayload } from '@/worker/validateContactPayload'

describe('validateContactPayload', () => {
  const valid = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello, I would like to get in touch.',
  }

  it('accepts a valid payload without phone', () => {
    const result = validateContactPayload(valid)
    expect(result).toEqual({ ok: true, data: valid })
  })

  it('accepts a valid payload with phone', () => {
    const result = validateContactPayload({ ...valid, phone: '+48 600 000 000' })
    expect(result).toEqual({
      ok: true,
      data: { ...valid, phone: '+48 600 000 000' },
    })
  })

  it('trims whitespace from all fields', () => {
    const result = validateContactPayload({
      name: '  Jane Doe  ',
      email: '  jane@example.com  ',
      message: '  Hello  ',
      phone: '  123  ',
    })
    expect(result).toEqual({
      ok: true,
      data: { name: 'Jane Doe', email: 'jane@example.com', message: 'Hello', phone: '123' },
    })
  })

  it('rejects a missing name', () => {
    const { name, ...rest } = valid
    expect(validateContactPayload(rest)).toEqual({ ok: false, error: 'invalid_payload' })
  })

  it('rejects a blank name', () => {
    expect(validateContactPayload({ ...valid, name: '   ' })).toEqual({ ok: false, error: 'invalid_payload' })
  })

  it('rejects a name over 100 characters', () => {
    expect(validateContactPayload({ ...valid, name: 'a'.repeat(101) })).toEqual({ ok: false, error: 'invalid_payload' })
  })

  it('rejects a missing email', () => {
    const { email, ...rest } = valid
    expect(validateContactPayload(rest)).toEqual({ ok: false, error: 'invalid_payload' })
  })

  it('rejects a malformed email', () => {
    expect(validateContactPayload({ ...valid, email: 'not-an-email' })).toEqual({ ok: false, error: 'invalid_payload' })
  })

  it('rejects a missing message', () => {
    const { message, ...rest } = valid
    expect(validateContactPayload(rest)).toEqual({ ok: false, error: 'invalid_payload' })
  })

  it('rejects a message over 5000 characters', () => {
    expect(validateContactPayload({ ...valid, message: 'a'.repeat(5001) })).toEqual({ ok: false, error: 'invalid_payload' })
  })

  it('rejects a non-string phone', () => {
    expect(validateContactPayload({ ...valid, phone: 12345 })).toEqual({ ok: false, error: 'invalid_payload' })
  })

  it('rejects a phone over 30 characters', () => {
    expect(validateContactPayload({ ...valid, phone: '1'.repeat(31) })).toEqual({ ok: false, error: 'invalid_payload' })
  })

  it('rejects a non-object body', () => {
    expect(validateContactPayload('nope')).toEqual({ ok: false, error: 'invalid_payload' })
    expect(validateContactPayload(null)).toEqual({ ok: false, error: 'invalid_payload' })
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/web && npx jest validateContactPayload -v`
Expected: FAIL — `Cannot find module '@/worker/validateContactPayload'`.

- [ ] **Step 3: Write the implementation**

Create `apps/web/worker/validateContactPayload.ts`:

```typescript
export interface ContactPayload {
  name: string
  email: string
  phone?: string
  message: string
}

export type ValidationResult =
  | { ok: true; data: ContactPayload }
  | { ok: false; error: 'invalid_payload' }

const MAX_LENGTHS = { name: 100, email: 254, phone: 30, message: 5000 } as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isNonEmptyString(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max
}

/**
 * Pure validation for a contact form submission. No I/O — safe to call from
 * the Worker handler and to unit test directly.
 */
export function validateContactPayload(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'invalid_payload' }
  }
  const b = body as Record<string, unknown>

  if (!isNonEmptyString(b.name, MAX_LENGTHS.name)) {
    return { ok: false, error: 'invalid_payload' }
  }
  if (!isNonEmptyString(b.email, MAX_LENGTHS.email) || !EMAIL_RE.test(b.email.trim())) {
    return { ok: false, error: 'invalid_payload' }
  }
  if (!isNonEmptyString(b.message, MAX_LENGTHS.message)) {
    return { ok: false, error: 'invalid_payload' }
  }

  let phone: string | undefined
  if (b.phone !== undefined && b.phone !== null && b.phone !== '') {
    if (typeof b.phone !== 'string' || b.phone.length > MAX_LENGTHS.phone) {
      return { ok: false, error: 'invalid_payload' }
    }
    phone = b.phone.trim()
  }

  return {
    ok: true,
    data: {
      name: b.name.trim(),
      email: b.email.trim(),
      message: b.message.trim(),
      ...(phone ? { phone } : {}),
    },
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/web && npx jest validateContactPayload -v`
Expected: PASS — all 13 tests green.

- [ ] **Step 5: Commit**

```bash
git add apps/web/worker/validateContactPayload.ts apps/web/__tests__/validateContactPayload.test.ts
git commit -m "feat(web): add contact form payload validation"
```

---

### Task 2: Worker endpoint + hybrid worker/assets deploy config

**Files:**
- Modify: `apps/web/wrangler.jsonc`
- Modify: `apps/web/.gitignore`
- Create: `apps/web/worker/env.d.ts`
- Create: `apps/web/worker/index.ts`

**Interfaces:**
- Consumes: `validateContactPayload` from `apps/web/worker/validateContactPayload.ts` (Task 1) — `(body: unknown) => ValidationResult`.
- Produces: a deployed `POST /api/contact` endpoint accepting
  `{ name, email, phone?, message, turnstileToken, website }` (JSON) and
  responding `{ ok: true }` (200) or `{ ok: false, error: 'invalid_payload' | 'turnstile_failed' | 'send_failed' }`
  (400 or 500). These `error` codes are consumed by `ContactForm` in Task 4 to
  pick a translated message.

This task has no automated test (per spec: real Turnstile/email delivery and
`run_worker_first` routing are verified manually post-deploy, not in Jest).
Its "deliverable" is verified by typechecking and by `npx wrangler types`
succeeding.

- [ ] **Step 1: Add the Worker + bindings to `wrangler.jsonc`**

Edit `apps/web/wrangler.jsonc` to:

```jsonc
{
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "bartoszgrabski-dev",
    "compatibility_date": "2026-05-22",
    "main": "worker/index.ts",
    "assets": {
      "directory": "./out",
      "not_found_handling": "404-page",
      "run_worker_first": ["/api/*"]
    },
    "send_email": [
      { "name": "EMAIL" }
    ]
}
```

Only `/api/*` requests reach the Worker; every other request is still served
directly from `./out` as static assets, unchanged from today.

- [ ] **Step 2: Ignore generated/local Worker files**

Edit `apps/web/.gitignore`, appending:

```
.wrangler/
worker-configuration.d.ts
```

(`.dev.vars` and `.env*` are already ignored at the repo root.)

- [ ] **Step 3: Generate the Worker's `Env` type**

Run: `cd apps/web && npx wrangler types`
Expected: creates `apps/web/worker-configuration.d.ts` with a global `Env`
interface that includes `EMAIL: SendEmail` (from the `send_email` binding).
Open the generated file briefly to confirm the `EMAIL` field is present and
note the exact interface name (`Env`) before continuing.

- [ ] **Step 4: Declare the Turnstile secret on `Env`**

Secrets set via `wrangler secret put` (production) or `.dev.vars` (local)
aren't picked up by `wrangler types` since they're not declared in
`wrangler.jsonc`. Add the missing field via declaration merging.

Create `apps/web/worker/env.d.ts`:

```typescript
export {}

declare global {
  interface Env {
    /** Turnstile secret key — set via `wrangler secret put TURNSTILE_SECRET`
     *  in production, and `TURNSTILE_SECRET=...` in `apps/web/.dev.vars` for
     *  local `wrangler dev`. Never committed. */
    TURNSTILE_SECRET: string
  }
}
```

- [ ] **Step 5: Write the Worker fetch handler**

Create `apps/web/worker/index.ts`:

```typescript
import { validateContactPayload } from './validateContactPayload'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const CONTACT_TO = 'hello@bartoszgrabski.dev'
const CONTACT_FROM = {
  email: 'hello@bartoszgrabski.dev',
  name: 'bartoszgrabski.dev — formularz kontaktowy',
}

interface IncomingBody {
  website?: unknown
  turnstileToken?: unknown
  [key: string]: unknown
}

async function verifyTurnstile(token: unknown, secret: string, ip: string | null): Promise<boolean> {
  if (typeof token !== 'string' || token.length === 0) return false

  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (ip) form.append('remoteip', ip)

  const res = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: form })
  const data = (await res.json()) as { success: boolean }
  return data.success === true
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method !== 'POST' || url.pathname !== '/api/contact') {
      return new Response('Not found', { status: 404 })
    }

    let body: IncomingBody
    try {
      body = (await request.json()) as IncomingBody
    } catch {
      return json({ ok: false, error: 'invalid_payload' }, 400)
    }

    // Honeypot: real visitors never see or fill this field. A bot that fills
    // every input gets a fake success with no email sent and no Turnstile
    // check spent on it.
    if (typeof body.website === 'string' && body.website.trim().length > 0) {
      return json({ ok: true })
    }

    const validation = validateContactPayload(body)
    if (!validation.ok) {
      return json({ ok: false, error: validation.error }, 400)
    }

    const verified = await verifyTurnstile(
      body.turnstileToken,
      env.TURNSTILE_SECRET,
      request.headers.get('CF-Connecting-IP'),
    )
    if (!verified) {
      return json({ ok: false, error: 'turnstile_failed' }, 400)
    }

    const { name, email, phone, message } = validation.data
    const lines = [
      `Imię / Name: ${name}`,
      `Email: ${email}`,
      `Telefon / Phone: ${phone ?? '—'}`,
      '',
      message,
    ]

    try {
      await env.EMAIL.send({
        to: CONTACT_TO,
        from: CONTACT_FROM,
        replyTo: email,
        subject: `Wiadomość ze strony — ${name}`,
        text: lines.join('\n'),
        html: lines.map((line) => `<p>${line}</p>`).join(''),
      })
    } catch (err) {
      console.error('contact form: email send failed', err)
      return json({ ok: false, error: 'send_failed' }, 500)
    }

    return json({ ok: true })
  },
}
```

- [ ] **Step 6: Typecheck**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors. If `Env` or `SendEmail` aren't found, re-run
`npx wrangler types` (Step 3) — the `main` field must be set in
`wrangler.jsonc` before generating types for some wrangler versions.

- [ ] **Step 7: Commit**

```bash
git add apps/web/wrangler.jsonc apps/web/.gitignore apps/web/worker/env.d.ts apps/web/worker/index.ts
git commit -m "feat(web): add /api/contact Worker endpoint with Turnstile + Email Sending"
```

Note: `worker-configuration.d.ts` is generated and gitignored — don't add it.

---

### Task 3: Bilingual copy + form styles

**Files:**
- Modify: `apps/web/lib/translations.ts`
- Modify: `apps/web/styles/globals.css`

**Interfaces:**
- Produces: `T.sections.form`, `T.contactForm.{name,email,phone,message,submit,sending,rodo}`,
  `T.contactForm.errors.{name,emailRequired,emailInvalid,message,invalid_payload,turnstile_failed,send_failed}`,
  `T.toasts.contactSent` — all consumed by `ContactForm` in Task 4. New CSS
  classes `.visually-hidden`, `.field-error`, `.form-note` — consumed by
  `ContactForm` in Task 4.

No dedicated test file for this task — correctness is verified by the
`ContactForm` tests in Task 4, which render real translated text.

- [ ] **Step 1: Add translation keys**

Edit `apps/web/lib/translations.ts`. In the `en` object, add `form` to
`sections`:

```typescript
    sections: {
      about: 'about', skills: 'skills', education: 'education',
      speaking: 'speaking', languages: 'languages', experience: 'experience',
      now: 'now', building: 'building', learning: 'learning',
      reading: 'reading', around: 'around',
      channels: 'channels', form: 'message',
    },
```

and, alongside `toasts`, add `contactSent`:

```typescript
    toasts: { json: 'CV downloaded as JSON', contactSent: 'Message sent' },
```

and a new top-level `contactForm` key in the `en` object (place it after
`channels`):

```typescript
    contactForm: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone (optional)',
      message: 'Message',
      submit: 'Send message',
      sending: 'Sending…',
      rodo: 'Data controller: Bartosz Grabski (hello@bartoszgrabski.dev). Form data is used solely to reply to your message — never for marketing or a newsletter, and never shared with third parties. Legal basis: GDPR Art. 6(1)(f), legitimate interest. You can request deletion at any time by emailing the address above.',
      errors: {
        name: 'Please enter your name.',
        emailRequired: 'Please enter your email.',
        emailInvalid: 'Please enter a valid email address.',
        message: 'Please enter a message.',
        invalid_payload: 'Please check the form and try again.',
        turnstile_failed: 'Verification failed — please try again.',
        send_failed: 'Something went wrong sending your message. Please try again or email hello@bartoszgrabski.dev directly.',
      },
    },
```

Mirror the same shape in the `pl` object — `sections.form`:

```typescript
      channels: 'kanały', form: 'wiadomość',
```

`toasts`:

```typescript
    toasts: { json: 'CV pobrane jako JSON', contactSent: 'Wiadomość wysłana' },
```

and `contactForm`:

```typescript
    contactForm: {
      name: 'Imię',
      email: 'Email',
      phone: 'Telefon (opcjonalnie)',
      message: 'Wiadomość',
      submit: 'Wyślij wiadomość',
      sending: 'Wysyłanie…',
      rodo: 'Administratorem danych jest Bartosz Grabski (hello@bartoszgrabski.dev). Dane z formularza wykorzystuję wyłącznie po to, by odpowiedzieć na Twoją wiadomość — nie służą do marketingu ani newslettera i nie są nikomu przekazywane. Podstawa: art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes). Możesz w każdej chwili poprosić o usunięcie danych, pisząc na powyższy adres.',
      errors: {
        name: 'Podaj swoje imię.',
        emailRequired: 'Podaj adres e-mail.',
        emailInvalid: 'Podaj prawidłowy adres e-mail.',
        message: 'Wpisz treść wiadomości.',
        invalid_payload: 'Sprawdź formularz i spróbuj ponownie.',
        turnstile_failed: 'Weryfikacja nie powiodła się — spróbuj ponownie.',
        send_failed: 'Coś poszło nie tak przy wysyłaniu wiadomości. Spróbuj ponownie albo napisz bezpośrednio na hello@bartoszgrabski.dev.',
      },
    },
```

Place the `pl` block's `contactForm` after `pl.channels`, mirroring the `en`
layout.

- [ ] **Step 2: Add supporting CSS**

Edit `apps/web/styles/globals.css`, adding these rules directly after the
existing `.field textarea { ... }` rule (inside the same form section
introduced by `.form-section`):

```css
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.field-error { font-size: 12px; color: var(--accent); margin: 4px 0 0; }
.form-note { font-size: 12px; line-height: 1.5; color: var(--ink-faint); margin: 20px 0 0; max-width: 52ch; }
```

- [ ] **Step 3: Typecheck**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors (translations file still matches the `Translations` type
inferred from `typeof translations.en`, since both `en` and `pl` gained the
same new keys).

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/translations.ts apps/web/styles/globals.css
git commit -m "feat(web): add contact form copy and styles"
```

---

### Task 4: `ContactForm` component

**Files:**
- Create: `apps/web/components/contact/ContactForm.tsx`
- Test: `apps/web/__tests__/ContactForm.test.tsx`

**Interfaces:**
- Consumes: `useLang()` from `apps/web/lib/i18n.tsx` (`{ T: Translations }`,
  using `T.sections.form`, `T.contactForm.*`, `T.toasts.contactSent` from
  Task 3); `useToast()` from `apps/web/lib/toast.tsx` (`(message: string) => void`);
  fetches `POST /api/contact` per the contract produced in Task 2
  (`{ name, email, phone?, message, turnstileToken, website }` →
  `{ ok: boolean; error?: 'invalid_payload' | 'turnstile_failed' | 'send_failed' }`).
- Produces: `ContactForm` — a default-export-free named component,
  `export function ContactForm(): JSX.Element`, with no props, consumed by
  `ContactView` in Task 5.

- [ ] **Step 1: Write the failing tests**

Create `apps/web/__tests__/ContactForm.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ToastProvider } from '@/lib/toast'
import { ContactForm } from '@/components/contact/ContactForm'

jest.mock('next/script', () => {
  const React = require('react')
  return function MockScript({ onLoad }: { onLoad?: () => void }) {
    React.useEffect(() => {
      onLoad?.()
    }, [onLoad])
    return null
  }
})

function renderForm() {
  return render(
    <ToastProvider>
      <ContactForm />
    </ToastProvider>,
  )
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } })
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello there.' } })
}

beforeEach(() => {
  window.turnstile = {
    render: jest.fn((_container: HTMLElement, options: { callback: (token: string) => void }) => {
      options.callback('test-token')
      return 'widget-1'
    }),
    reset: jest.fn(),
  }
  global.fetch = jest.fn()
})

describe('ContactForm', () => {
  it('renders all fields and the RODO note', () => {
    renderForm()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone (optional)')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
    expect(screen.getByText(/Data controller: Bartosz Grabski/)).toBeInTheDocument()
  })

  it('shows validation errors and does not submit when required fields are empty', () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(screen.getByText('Please enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your email.')).toBeInTheDocument()
    expect(screen.getByText('Please enter a message.')).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits the Turnstile token and form data, shows a toast, and resets on success', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })
    renderForm()
    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe('/api/contact')
    const body = JSON.parse(options.body)
    expect(body).toMatchObject({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello there.',
      turnstileToken: 'test-token',
    })

    expect(await screen.findByText('Message sent')).toBeInTheDocument()
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('')
  })

  it('shows a translated error and keeps the input on server failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: 'send_failed' }),
    })
    renderForm()
    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(
      await screen.findByText(/Something went wrong sending your message/),
    ).toBeInTheDocument()
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Jane Doe')
  })

  it('disables the submit button while the request is in flight', async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    ;(global.fetch as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )
    renderForm()
    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('button', { name: 'Sending…' })).toBeDisabled()

    resolveFetch({ ok: true, json: async () => ({ ok: true }) })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Send message' })).not.toBeDisabled(),
    )
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/web && npx jest ContactForm -v`
Expected: FAIL — `Cannot find module '@/components/contact/ContactForm'`.

- [ ] **Step 3: Write the implementation**

Create `apps/web/components/contact/ContactForm.tsx`:

```tsx
'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Script from 'next/script'
import { useLang } from '@/lib/i18n'
import { useToast } from '@/lib/toast'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void },
      ) => string
      reset: (widgetId?: string) => void
    }
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldName = 'name' | 'email' | 'message'
type FieldErrors = Partial<Record<FieldName, string>>
type SubmitState = 'idle' | 'sending'

export function ContactForm() {
  const { T } = useLang()
  const showToast = useToast()
  const widgetContainerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const turnstileTokenRef = useRef('')
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [state, setState] = useState<SubmitState>('idle')

  useEffect(() => {
    if (scriptLoaded && window.turnstile && widgetContainerRef.current && widgetIdRef.current === null) {
      widgetIdRef.current = window.turnstile.render(widgetContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => {
          turnstileTokenRef.current = token
        },
      })
    }
  }, [scriptLoaded])

  function validate(fd: FormData): FieldErrors {
    const errors: FieldErrors = {}
    if (!String(fd.get('name') ?? '').trim()) errors.name = T.contactForm.errors.name

    const email = String(fd.get('email') ?? '').trim()
    if (!email) errors.email = T.contactForm.errors.emailRequired
    else if (!EMAIL_RE.test(email)) errors.email = T.contactForm.errors.emailInvalid

    if (!String(fd.get('message') ?? '').trim()) errors.message = T.contactForm.errors.message

    return errors
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fd = new FormData(form)

    const errors = validate(fd)
    setFieldErrors(errors)
    setServerError(null)
    if (Object.keys(errors).length > 0) return

    setState('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          phone: fd.get('phone') || undefined,
          message: fd.get('message'),
          turnstileToken: turnstileTokenRef.current,
          website: fd.get('website'),
        }),
      })
      const data: { ok: boolean; error?: keyof typeof T.contactForm.errors } = await res.json()

      if (!res.ok || !data.ok) {
        setServerError(T.contactForm.errors[data.error ?? 'send_failed'])
        setState('idle')
        return
      }

      showToast(T.toasts.contactSent)
      form.reset()
      turnstileTokenRef.current = ''
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current)
      }
      setState('idle')
    } catch {
      setServerError(T.contactForm.errors.send_failed)
      setState('idle')
    }
  }

  return (
    <div className="form-section">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer onLoad={() => setScriptLoaded(true)} />
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="contact-name">{T.contactForm.name}</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" />
          {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
        </div>

        <div className="field">
          <label htmlFor="contact-email">{T.contactForm.email}</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="contact-phone">{T.contactForm.phone}</label>
          <input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
        </div>

        <div className="field">
          <label htmlFor="contact-message">{T.contactForm.message}</label>
          <textarea id="contact-message" name="message" rows={5} />
          {fieldErrors.message && <p className="field-error">{fieldErrors.message}</p>}
        </div>

        {/* Honeypot: hidden from sighted users and assistive tech, and out of
            tab order. Real visitors never fill it; bots that autofill every
            input do, and the Worker silently no-ops on a non-empty value. */}
        <div className="visually-hidden" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div ref={widgetContainerRef} className="cf-turnstile" />

        {serverError && <p className="field-error">{serverError}</p>}

        <button type="submit" className="btn primary" disabled={state === 'sending'}>
          {state === 'sending' ? T.contactForm.sending : T.contactForm.submit}
        </button>

        <p className="form-note">{T.contactForm.rodo}</p>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/web && npx jest ContactForm -v`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Typecheck**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/contact/ContactForm.tsx apps/web/__tests__/ContactForm.test.tsx
git commit -m "feat(web): add ContactForm component"
```

---

### Task 5: Wire `ContactForm` into the Contact page

**Files:**
- Modify: `apps/web/components/contact/ContactView.tsx`

**Interfaces:**
- Consumes: `ContactForm` from `apps/web/components/contact/ContactForm.tsx` (Task 4).

- [ ] **Step 1: Render `ContactForm` below the channel list**

Edit `apps/web/components/contact/ContactView.tsx`. Add the import:

```typescript
import { ContactForm } from '@/components/contact/ContactForm'
```

And render it after the existing `contact-list` block, still inside the
second grid column `<div>` (the one currently holding the `Eyebrow` +
`contact-list`):

```tsx
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

        <Eyebrow>{T.sections.form}</Eyebrow>
        <ContactForm />
      </div>
```

(Replace the existing `<Eyebrow>{T.sections.channels}</Eyebrow>` block and
the trailing empty line exactly as shown — the only changes are the new
import and the two new lines before the closing `</div>`.)

- [ ] **Step 2: Run the full test suite**

Run: `cd apps/web && npm run test`
Expected: PASS — no existing test touches `ContactView`, so nothing else
should be affected.

- [ ] **Step 3: Typecheck and build**

Run: `cd apps/web && npx tsc --noEmit && npm run build`
Expected: both succeed. The build step confirms the static export still
completes with the new client component and `next/script` tag included.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/contact/ContactView.tsx
git commit -m "feat(web): render the contact form on the Contact page"
```

---

## Manual steps before first deploy (not code, do not automate)

These were confirmed already done during brainstorming, but double-check
before shipping:

1. `hello@bartoszgrabski.dev`'s domain is onboarded for Cloudflare Email
   Sending: `cd apps/web && npx wrangler email sending list` should show
   `bartoszgrabski.dev`. If not: `npx wrangler email sending enable bartoszgrabski.dev`.
2. A Turnstile widget exists for the domain (Cloudflare dashboard → Turnstile).
   Set its **site key** as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in the repo root
   `.env` (read by `apps/web/next.config.ts`), and its **secret key**:
   - Locally: `TURNSTILE_SECRET=...` in `apps/web/.dev.vars` (gitignored).
   - In production: `cd apps/web && npx wrangler secret put TURNSTILE_SECRET`.
3. After deploying, submit the live form once for real to confirm an email
   arrives at `hello@bartoszgrabski.dev` with `Reply-To` set to the sender.
