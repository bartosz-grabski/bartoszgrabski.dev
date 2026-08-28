import { cache } from 'react'
import { client } from './sanity'
import type { Resume, Now, Services, SiteSettings, UiStrings } from './types'

// NOTE: GROQ returns `null` (not `[]`) for array fields that are absent on a
// document. The TS types below declare these as plain arrays, so every array
// projection is wrapped in `coalesce(..., [])` to keep the fetched shape honest
// and stop `.length`/`.map` from throwing during render (and SSR prerender).
//
// Each fetcher is wrapped in React `cache()` so that when both the locale
// layout and a page request the same document during one render pass, Sanity
// is hit only once.
export const fetchResume = cache(async function fetchResume(): Promise<Resume> {
  return client.fetch(`
    *[_type == "resume"][0]{
      basics {
        name, label, email, phone, url,
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
})

export const fetchSiteSettings = cache(async function fetchSiteSettings(): Promise<SiteSettings> {
  return client.fetch(`*[_type == "siteSettings"][0]{
    availabilityLabel,
    calendarUrl,
    "channels": coalesce(channels[] { type, url }, []),
    contact { heading, availabilityLine, bookingLine, signature },
    seo { title, description }
  }`)
})

// Every UI label on the site, bilingual. `null` until the uiStrings document
// is seeded — labels then resolve to empty strings (see lib/strings.ts).
export const fetchUiStrings = cache(async function fetchUiStrings(): Promise<UiStrings | null> {
  return client.fetch(`
    *[_type == "uiStrings"][0]{
      tabs, theme, sections, nowIntro, nowAsOf, channels,
      contactForm, buttons, toasts, footer, atSep, langLevels
    }
  `)
})

// `null` until the services document is seeded.
export const fetchServices = cache(async function fetchServices(): Promise<Services | null> {
  return client.fetch(`
    *[_type == "services"][0]{
      title, lede,
      "blocks": coalesce(blocks[]{
        cmd, tag, blurb,
        "bullets": coalesce(bullets[]{ text }, []),
        "stack": coalesce(stack[]{ en, pl }, []),
        note
      }, []),
      howHeading,
      "steps": coalesce(steps[]{ title, text }, []),
      cta { line, blurb, book }
    }
  `)
})

export const fetchNow = cache(async function fetchNow(): Promise<Now> {
  return client.fetch(`
    *[_type == "now"][0]{
      _updatedAt,
      "building": coalesce(building[]{ title, blurb }, []),
      "learning": coalesce(learning[]{ item }, []),
      "reading": coalesce(reading[]{ title, author }, []),
      "around": coalesce(around[]{ item }, [])
    }
  `)
})
