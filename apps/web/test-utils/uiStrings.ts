import type { Bilingual, UiStrings } from '@/lib/types'

const b = (en: string, pl: string = en): Bilingual => ({ en, pl })

/** Test stand-in for the Sanity uiStrings document (EN values mirror production copy). */
export const uiStringsFixture: UiStrings = {
  nav: [
    { section: 'services', label: b('services', 'Usługi') },
    { section: 'cv', label: b('cv', 'CV') },
    { section: 'now', label: b('now', 'Teraz') },
    { section: 'contact', label: b('contact', 'Kontakt') },
  ],
  theme: { light: b('☀ light'), dark: b('☾ dark') },
  sections: {
    about: b('about'), skills: b('skills'), education: b('education'),
    speaking: b('speaking'), languages: b('languages'), experience: b('experience'),
    now: b('now'), building: b('building'), learning: b('learning'),
    reading: b('reading'), around: b('around'),
    channels: b('channels'), form: b('message'),
  },
  nowIntro: b('A snapshot of what I am working on.'),
  nowAsOf: b('As of {date}', 'Stan na {date}'),
  channels: { email: b('Email', 'E-mail'), github: b('GitHub'), linkedin: b('LinkedIn'), calendar: b('Book a call', 'Umów rozmowę') },
  contactForm: {
    name: b('Name', 'Imię'),
    email: b('Email'),
    phone: b('Phone (optional)', 'Telefon (opcjonalnie)'),
    message: b('Message', 'Wiadomość'),
    submit: b('Send message', 'Wyślij wiadomość'),
    sending: b('Sending…', 'Wysyłanie…'),
    rodo: b('Your data is used solely to reply to your message — never for marketing or a newsletter, and never shared with third parties.'),
    consent: b('I agree to my data being used to reply to this message.'),
    errors: {
      name: b('Please enter your name.'),
      emailRequired: b('Please enter your email.'),
      emailInvalid: b('Please enter a valid email address.'),
      message: b('Please enter a message.'),
      consent: b('Please confirm consent before sending.'),
      invalid_payload: b('Please check the form and try again.'),
      turnstile_failed: b('Verification failed — please try again.'),
      send_failed: b('Something went wrong sending your message. Please try again or email hello@bartoszgrabski.dev directly.'),
    },
  },
  buttons: { json: b('↓ json'), pdf: b('↓ pdf') },
  toasts: { json: b('CV downloaded as JSON'), contactSent: b('Message sent') },
  footer: { copy: b('© {year} {name}'), built: b('Built by hand · Last updated {date}') },
  atSep: b(' at ', ' w '),
  langLevels: { native: b('Native', 'ojczysty'), fluent: b('Fluent', 'biegły'), intermediate: b('Intermediate', 'średniozaawansowany') },
}
