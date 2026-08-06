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
  // Reject control characters (including CR/LF) so `name` can't be used for
  // header injection when it's interpolated into the email `subject`.
  if (/[\x00-\x1f\x7f]/.test(b.name.trim())) {
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
