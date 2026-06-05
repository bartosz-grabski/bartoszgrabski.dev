import { client } from './sanity'
import type { Resume, Now, SiteSettings } from './types'

// NOTE: GROQ returns `null` (not `[]`) for array fields that are absent on a
// document. The TS types below declare these as plain arrays, so every array
// projection is wrapped in `coalesce(..., [])` to keep the fetched shape honest
// and stop `.length`/`.map` from throwing during render (and SSR prerender).
export async function fetchResume(): Promise<Resume> {
  return client.fetch(`
    *[_type == "resume"][0]{
      basics {
        name, email, phone, url,
        summary, image, location,
        "profiles": coalesce(profiles, [])
      },
      "work": coalesce(work[] {
        name, location,
        "positions": coalesce(positions[]{
          position, startDate, endDate, summary,
          "highlights": coalesce(highlights[]{ text }, [])
        }, [])
      }, []),
      "education": coalesce(education[]{ institution, area, studyType, startDate, endDate }, []),
      "skills": coalesce(skills[]{ name, "keywords": coalesce(keywords, []) }, []),
      skillsNote,
      "languages": coalesce(languages[]{ language, fluency }, []),
      "projects": coalesce(projects[]{ name, description, "roles": coalesce(roles, []), "keywords": coalesce(keywords, []), url }, []),
      "speaking": coalesce(speaking[]{ title, venue, year }, [])
    }
  `)
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  return client.fetch(`*[_type == "siteSettings"][0]{
    availabilityLabel,
    calendarUrl,
    "channels": coalesce(channels[] { type, url }, []),
    contact { heading, availabilityLine, bookingLine, signature }
  }`)
}

export async function fetchNow(): Promise<Now> {
  return client.fetch(`
    *[_type == "now"][0]{
      _updatedAt,
      "building": coalesce(building[]{ title, blurb }, []),
      "learning": coalesce(learning[]{ item }, []),
      "reading": coalesce(reading[]{ title, author }, []),
      "around": coalesce(around[]{ item }, [])
    }
  `)
}
