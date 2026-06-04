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

export interface SiteSettings {
  availabilityLabel: Bilingual
  calendarUrl?: string
  channels?: Channel[]
}

export interface Now {
  _updatedAt: string
  building: NowBuilding[]
  learning: NowLearning[]
  reading: NowBook[]
  around: NowAround[]
}
