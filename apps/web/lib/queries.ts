import { cache } from 'react'
import { client } from './sanity'
import type { Resume, Now, Services, SiteSettings, UiStrings } from './types'

// Next.js persists its fetch cache in .next/cache across builds, keyed by the
// request — so a content-only change in Sanity would otherwise keep serving the
// previously cached response (same query text = same key). A 1-second
// revalidate keeps pages statically renderable (cache: 'no-store' would force
// dynamic rendering, which `output: 'export'` forbids) while guaranteeing any
// cache entry left over from a previous build is treated as stale.
function fetchFresh<T>(query: string): Promise<T> {
  return client.fetch<T>(query, {}, { next: { revalidate: 1 } })
}

// NOTE: GROQ returns `null` (not `[]`) for array fields that are absent on a
// document. The TS types below declare these as plain arrays, so every array
// projection is wrapped in `coalesce(..., [])` to keep the fetched shape honest
// and stop `.length`/`.map` from throwing during render (and SSR prerender).
//
// Each fetcher is wrapped in React `cache()` so that when both the locale
// layout and a page request the same document during one render pass, Sanity
// is hit only once.
export const fetchResume = cache(async function fetchResume(): Promise<Resume> {
  return fetchFresh(`
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
  return fetchFresh(`*[_type == "siteSettings"][0]{
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
  return fetchFresh(`
    *[_type == "uiStrings"][0]{
      "nav": coalesce(nav[]{ section, label }, []),
      theme, sections, nowIntro, nowAsOf, channels,
      contactForm, buttons, toasts, footer, atSep, langLevels
    }
  `)
})

// `null` until the services document is seeded.
export const fetchServices = cache(async function fetchServices(): Promise<Services | null> {
  return fetchFresh(`
    *[_type == "services"][0]{
      title, lede,
      "blocks": coalesce(blocks[]{
        cmd, tag, blurb,
        "bullets": coalesce(bullets[]{ text }, [])
      }, []),
      howHeading,
      "steps": coalesce(steps[]{ title, text }, []),
      cta { line, blurb, "links": coalesce(links[]{ label, url, style }, []) }
    }
  `)
})

export const fetchNow = cache(async function fetchNow(): Promise<Now> {
  return fetchFresh(`
    *[_type == "now"][0]{
      _updatedAt,
      "building": coalesce(building[]{ title, blurb }, []),
      "learning": coalesce(learning[]{ item }, []),
      "reading": coalesce(reading[]{ title, author }, []),
      "around": coalesce(around[]{ item }, [])
    }
  `)
})
