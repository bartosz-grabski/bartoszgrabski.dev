import { client } from './sanity'
import type { Resume, Now, SiteSettings } from './types'

export async function fetchResume(): Promise<Resume> {
  return client.fetch(`
    *[_type == "resume"][0]{
      basics {
        name, email, phone, url,
        summary, image, location, profiles
      },
      work[] {
        name, location,
        positions[]{ position, startDate, endDate, summary, highlights[]{ text } }
      },
      education[]{ institution, area, studyType, startDate, endDate },
      skills[]{ name, keywords },
      skillsNote,
      languages[]{ language, fluency },
      projects[]{ name, description, roles, keywords, url },
      speaking[]{ title, venue, year }
    }
  `)
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  return client.fetch(`*[_type == "siteSettings"][0]{ availabilityLabel, calendarUrl, channels[] { type, url } }`)
}

export async function fetchNow(): Promise<Now> {
  return client.fetch(`
    *[_type == "now"][0]{
      _updatedAt,
      building[]{ title, blurb },
      learning[]{ item },
      reading[]{ title, author },
      around[]{ item }
    }
  `)
}
