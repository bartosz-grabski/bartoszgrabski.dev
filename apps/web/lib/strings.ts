import type { Bilingual, UiStrings } from './types'

export type Lang = 'en' | 'pl'

/**
 * The per-language, render-ready shape components consume as `T`. All values
 * come from the Sanity uiStrings document — nothing is hardcoded here; a
 * missing document resolves to empty strings so rendering never throws.
 */
export interface Translations {
  tabs: { services: string; cv: string; now: string; contact: string }
  themeLight: string
  themeDark: string
  sections: {
    about: string; skills: string; education: string
    speaking: string; languages: string; experience: string
    now: string; building: string; learning: string
    reading: string; around: string
    channels: string; form: string
  }
  nowIntro: string
  nowAsOf: (date: string) => string
  channels: { email: string; github: string; linkedin: string; calendar: string }
  contactForm: {
    name: string; email: string; phone: string; message: string
    submit: string; sending: string; rodo: string; consent: string
    errors: {
      name: string; emailRequired: string; emailInvalid: string
      message: string; consent: string
      invalid_payload: string; turnstile_failed: string; send_failed: string
    }
  }
  buttons: { json: string; pdf: string }
  toasts: { json: string; contactSent: string }
  footer: { copy: (year: number, name: string) => string; built: string }
  atSep: string
  langLevels: Record<string, string>
}

/** Flatten the bilingual uiStrings document into the given language. */
export function resolveStrings(ui: UiStrings | null | undefined, lang: Lang): Translations {
  const s = (field?: Bilingual | null) => (field ? field[lang] ?? field.en ?? '' : '')
  return {
    tabs: {
      services: s(ui?.tabs?.services),
      cv: s(ui?.tabs?.cv),
      now: s(ui?.tabs?.now),
      contact: s(ui?.tabs?.contact),
    },
    themeLight: s(ui?.theme?.light),
    themeDark: s(ui?.theme?.dark),
    sections: {
      about: s(ui?.sections?.about),
      skills: s(ui?.sections?.skills),
      education: s(ui?.sections?.education),
      speaking: s(ui?.sections?.speaking),
      languages: s(ui?.sections?.languages),
      experience: s(ui?.sections?.experience),
      now: s(ui?.sections?.now),
      building: s(ui?.sections?.building),
      learning: s(ui?.sections?.learning),
      reading: s(ui?.sections?.reading),
      around: s(ui?.sections?.around),
      channels: s(ui?.sections?.channels),
      form: s(ui?.sections?.form),
    },
    nowIntro: s(ui?.nowIntro),
    nowAsOf: (date) => s(ui?.nowAsOf).replace('{date}', date),
    channels: {
      email: s(ui?.channels?.email),
      github: s(ui?.channels?.github),
      linkedin: s(ui?.channels?.linkedin),
      calendar: s(ui?.channels?.calendar),
    },
    contactForm: {
      name: s(ui?.contactForm?.name),
      email: s(ui?.contactForm?.email),
      phone: s(ui?.contactForm?.phone),
      message: s(ui?.contactForm?.message),
      submit: s(ui?.contactForm?.submit),
      sending: s(ui?.contactForm?.sending),
      rodo: s(ui?.contactForm?.rodo),
      consent: s(ui?.contactForm?.consent),
      errors: {
        name: s(ui?.contactForm?.errors?.name),
        emailRequired: s(ui?.contactForm?.errors?.emailRequired),
        emailInvalid: s(ui?.contactForm?.errors?.emailInvalid),
        message: s(ui?.contactForm?.errors?.message),
        consent: s(ui?.contactForm?.errors?.consent),
        invalid_payload: s(ui?.contactForm?.errors?.invalid_payload),
        turnstile_failed: s(ui?.contactForm?.errors?.turnstile_failed),
        send_failed: s(ui?.contactForm?.errors?.send_failed),
      },
    },
    buttons: { json: s(ui?.buttons?.json), pdf: s(ui?.buttons?.pdf) },
    toasts: { json: s(ui?.toasts?.json), contactSent: s(ui?.toasts?.contactSent) },
    footer: {
      copy: (year, name) =>
        s(ui?.footer?.copy).replace('{year}', String(year)).replace('{name}', name),
      built: s(ui?.footer?.built),
    },
    atSep: s(ui?.atSep),
    langLevels: {
      Native: s(ui?.langLevels?.native),
      Fluent: s(ui?.langLevels?.fluent),
      Intermediate: s(ui?.langLevels?.intermediate),
    },
  }
}
