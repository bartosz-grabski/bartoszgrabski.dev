'use client'
import { useState } from 'react'

interface ContactFormProps {
  showToast: (msg: string) => void
  toastMessage: string
}

export function ContactForm({ showToast, toastMessage }: ContactFormProps) {
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
        <label htmlFor="cname">Name</label>
        <input
          id="cname"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
        />
      </div>
      <div className="field">
        <label htmlFor="cemail">Email</label>
        <input
          id="cemail"
          type="email"
          required
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="you@company.com"
        />
      </div>
      <div className="field">
        <label htmlFor="cmsg">Message</label>
        <textarea
          id="cmsg"
          required
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          placeholder="A short note about the project."
        />
      </div>
      <button
        type="submit"
        className="btn primary"
        disabled={sent}
        style={{ marginTop: 8 }}
      >
        {sent ? '✓ Sent' : 'Send →'}
      </button>
    </form>
  )
}
