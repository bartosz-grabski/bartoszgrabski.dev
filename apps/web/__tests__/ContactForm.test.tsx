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
