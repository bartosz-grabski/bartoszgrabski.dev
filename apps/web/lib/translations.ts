export type Lang = 'en' | 'pl'

export const translations = {
  en: {
    role: 'Fullstack Developer',
    location: 'Kraków, Poland',
    tabs: { cv: 'cv', now: 'now', contact: 'contact' },
    themeLight: '☀ light',
    themeDark: '☾ dark',
    sections: {
      about: 'about', skills: 'skills', education: 'education',
      speaking: 'speaking', languages: 'languages', experience: 'experience',
      now: 'now', building: 'building', learning: 'learning',
      reading: 'reading', around: 'around',
      channels: 'channels',
    },
    nowIntro: "A snapshot of what I'm working on, learning, and reading. Updated when things change — inspired by Derek Sivers' 'now' idea.",
    nowAsOf: (date: string) => `As of ${date}`,
    contactHead: ["Let's", 'talk', '.'] as [string, string, string],
    contactSub1: (period: string) => `I'm currently ${period.toLowerCase()} — freelance, contract, or full-time.`,
    contactSub2: 'Best by email, or book a 30-minute intro call — whichever you prefer.',
    contactSign: (first: string) => `— ${first}`,
    channels: { email: 'Email', github: 'GitHub', linkedin: 'LinkedIn', calendar: 'Book a call' },
    buttons: { json: '↓ json', pdf: '↓ pdf' },
    toasts: { json: 'CV downloaded as JSON' },
    footer: {
      copy: (y: number, n: string) => `© ${y} ${n}`,
      built: 'Built by hand · Last updated May 2026',
    },
    atSep: ' at ',
    langLevels: { Native: 'Native', Fluent: 'Fluent', Intermediate: 'Intermediate' } as Record<string, string>,
  },
  pl: {
    role: 'Programista Fullstack',
    location: 'Kraków, Polska',
    tabs: { cv: 'CV', now: 'Teraz', contact: 'Kontakt' },
    themeLight: '☀ Jasny',
    themeDark: '☾ Ciemny',
    sections: {
      about: 'o mnie', skills: 'umiejętności', education: 'wykształcenie',
      speaking: 'wystąpienia', languages: 'języki', experience: 'doświadczenie',
      now: 'teraz', building: 'buduję', learning: 'uczę się',
      reading: 'czytam', around: 'wokół',
      channels: 'kanały',
    },
    nowIntro: "Migawka tego, nad czym pracuję, czego się uczę i co czytam. Aktualizowane, gdy coś się zmienia — inspirowane stroną 'now' Dereka Siversa.",
    nowAsOf: (date: string) => `Stan na ${date}`,
    contactHead: ['', 'Porozmawiajmy', '.'] as [string, string, string],
    contactSub1: (period: string) => `Aktualnie ${period.toLowerCase()} — freelance, kontrakt lub na pełen etat.`,
    contactSub2: 'Najlepiej mailem albo zarezerwuj 30-minutową rozmowę wstępną — jak wolisz.',
    contactSign: (first: string) => `— ${first}`,
    channels: { email: 'E-mail', github: 'GitHub', linkedin: 'LinkedIn', calendar: 'Umów rozmowę' },
    buttons: { json: '↓ JSON', pdf: '↓ PDF' },
    toasts: { json: 'CV pobrane jako JSON' },
    footer: {
      copy: (y: number, n: string) => `© ${y} ${n}`,
      built: 'Wykonane ręcznie · Ostatnia aktualizacja: maj 2026',
    },
    atSep: ' w ',
    langLevels: { Native: 'ojczysty', Fluent: 'biegły', Intermediate: 'średniozaawansowany' } as Record<string, string>,
  },
} as const

export type Translations = typeof translations.en
