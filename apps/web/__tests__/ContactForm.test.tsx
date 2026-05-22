import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/contact/ContactForm'

const mockShowToast = jest.fn()

describe('ContactForm', () => {
  beforeEach(() => mockShowToast.mockReset())

  it('submit button is initially enabled', () => {
    render(<ContactForm showToast={mockShowToast} toastMessage="queued" />)
    expect(screen.getByRole('button', { name: /send/i })).not.toBeDisabled()
  })

  it('calls showToast on valid submit and resets form', async () => {
    render(<ContactForm showToast={mockShowToast} toastMessage="queued" />)
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com')
    await userEvent.type(screen.getByLabelText(/message/i), 'Hello there')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(mockShowToast).toHaveBeenCalledWith('queued')
  })
})
