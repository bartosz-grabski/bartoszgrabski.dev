export interface Bilingual {
  en: string
  pl: string
}

export interface SanityImageAsset {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number }
}

export interface Profile {
  network: string
  username: string
  url: string
}

export interface Basics {
  name: string
  label: Bilingual
  email: string
  phone?: string
  url?: string
  summary: Bilingual
  image: SanityImageAsset
  location: { city: string; countryCode: string }
  profiles: Profile[]
}

export interface WorkHighlight {
  text: Bilingual
}

export interface WorkPosition {
  position: Bilingual
  startDate: string
  endDate: string
  summary?: Bilingual
  highlights: WorkHighlight[]
}

export interface Work {
  name: string
  location?: string
  positions: WorkPosition[]
}

export interface Education {
  institution: string
  area: Bilingual
  studyType: string
  startDate: string
  endDate: string
}

export interface Skill {
  name: string
  keywords: string[]
}

export interface Language {
  language: string
  fluency: string
}

export interface Project {
  name: string
  description: Bilingual
  roles: string[]
  keywords: string[]
  url?: string
}

export interface Speaking {
  title: Bilingual
  venue: string
  year: string
}

export interface Resume {
  basics: Basics
  work: Work[]
  education: Education[]
  skills: Skill[]
  skillsNote?: Bilingual
  languages: Language[]
  projects: Project[]
  speaking: Speaking[]
}

export interface NowBuilding {
  title: Bilingual
  blurb: Bilingual
}

export interface NowLearning {
  item: Bilingual
}

export interface NowBook {
  title: string
  author: string
}

export interface NowAround {
  item: Bilingual
}

export type ChannelType = 'linkedin' | 'github'

export interface Channel {
  type: ChannelType
  url: string
}

export interface Contact {
  heading?: Bilingual
  availabilityLine?: Bilingual
  bookingLine?: Bilingual
  signature?: Bilingual
}

export interface ServiceBlock {
  cmd: string
  tag?: Bilingual
  blurb?: Bilingual
  bullets: { text: Bilingual }[]
}

export interface ServiceStep {
  title: Bilingual
  text?: Bilingual
}

export interface ServiceCtaLink {
  label: Bilingual
  /** Internal path ('/contact') or external URL ('https://…', 'mailto:…', 'tel:…'). */
  url: string
  style?: 'default' | 'light'
}

export interface Services {
  title?: Bilingual
  lede?: Bilingual
  blocks: ServiceBlock[]
  howHeading?: Bilingual
  steps: ServiceStep[]
  cta?: {
    line?: Bilingual
    blurb?: Bilingual
    links: ServiceCtaLink[]
  }
}

/**
 * Every UI label on the site, bilingual, managed in Sanity (uiStrings document).
 * Fields holding `{placeholders}` are templates resolved in lib/strings.ts.
 */
/** Pages a nav tab can point at; 'services' is the index route. */
export type NavSection = 'services' | 'cv' | 'now' | 'contact'

export interface UiStrings {
  /** Ordered — the Studio array order is the header order. */
  nav: { section: NavSection; label: Bilingual }[]
  theme: { light: Bilingual; dark: Bilingual }
  sections: {
    about: Bilingual; skills: Bilingual; education: Bilingual
    speaking: Bilingual; languages: Bilingual; experience: Bilingual
    now: Bilingual; building: Bilingual; learning: Bilingual
    reading: Bilingual; around: Bilingual
    channels: Bilingual; form: Bilingual
  }
  nowIntro: Bilingual
  nowAsOf: Bilingual // template: {date}
  channels: { email: Bilingual; github: Bilingual; linkedin: Bilingual; calendar: Bilingual }
  contactForm: {
    name: Bilingual; email: Bilingual; phone: Bilingual; message: Bilingual
    submit: Bilingual; sending: Bilingual; rodo: Bilingual; consent: Bilingual
    errors: {
      name: Bilingual; emailRequired: Bilingual; emailInvalid: Bilingual
      message: Bilingual; consent: Bilingual
      invalid_payload: Bilingual; turnstile_failed: Bilingual; send_failed: Bilingual
    }
  }
  buttons: { json: Bilingual; pdf: Bilingual }
  toasts: { json: Bilingual; contactSent: Bilingual }
  footer: { copy: Bilingual; built: Bilingual } // copy template: {year}, {name}
  atSep: Bilingual
  langLevels: { native: Bilingual; fluent: Bilingual; intermediate: Bilingual }
}

export interface Seo {
  title?: Bilingual
  description?: Bilingual
}

export interface SiteSettings {
  availabilityLabel: Bilingual
  calendarUrl?: string
  channels?: Channel[]
  contact?: Contact
  seo?: Seo
}

export interface Now {
  _updatedAt: string
  building: NowBuilding[]
  learning: NowLearning[]
  reading: NowBook[]
  around: NowAround[]
}
