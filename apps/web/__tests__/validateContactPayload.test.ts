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
