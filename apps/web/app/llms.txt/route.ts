import { fetchResume, fetchSiteSettings } from '@/lib/queries'
import { localeUrl, siteUrl } from '@/lib/site'

// Static at build time (required by `output: 'export'`). Served at /llms.txt.
export const dynamic = 'force-static'

/**
 * llms.txt — a curated, plain-text brief for LLM crawlers and assistants,
 * following the structure at https://llmstxt.org. Built from the same Sanity
 * content as the site so it never drifts. The goal is a high-signal summary an
 * assistant can ingest without parsing the full HTML/JS app.
 */
export async function GET() {
  const [resume, siteSettings] = await Promise.all([fetchResume(), fetchSiteSettings()])
  const { basics } = resume

  const summary = basics.summary.en
  const location = `${basics.location.city}, ${basics.location.countryCode}`

  // Most recent experience, newest first as stored.
  const experience = resume.work
    .map((w) => {
      const roles = w.positions.map((p) => p.position.en).filter(Boolean).join(', ')
      const span = w.positions.length
        ? ` (${w.positions[w.positions.length - 1].startDate}–${w.positions[0].endDate || 'present'})`
        : ''
      return `- ${roles ? `${roles} — ` : ''}${w.name}${span}`
    })
    .join('\n')

  const skills = resume.skills
    .map((s) => `- **${s.name}:** ${(s.keywords ?? []).map((k) => k.trim()).join(', ')}`)
    .join('\n')

  const languages = resume.languages
    .map((l) => `- ${l.language} (${l.fluency})`)
    .join('\n')

  const projects = resume.projects
    .map((p) => {
      const link = p.url ? ` — ${p.url}` : ''
      return `- **${p.name}:** ${p.description.en}${link}`
    })
    .join('\n')

  // Profiles + channels overlap; dedupe by normalized URL (trailing slash) and
  // title-case the label so "linkedin"/"LinkedIn" collapse to one entry.
  const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const seenLinks = new Map<string, string>()
  for (const { label, url } of [
    ...(basics.profiles ?? []).map((p) => ({ label: p.network, url: p.url })),
    ...(siteSettings.channels ?? []).map((c) => ({ label: c.type, url: c.url })),
  ]) {
    const key = url.trim().replace(/\/$/, '').toLowerCase()
    if (!seenLinks.has(key)) seenLinks.set(key, `- [${titleCase(label)}](${url.trim()})`)
  }
  const profilesBlock = Array.from(seenLinks.values()).join('\n')

  const body = `# ${basics.name} — Fullstack Developer

> ${summary}

Personal site and CV of ${basics.name}, a fullstack developer based in ${location}. Available in English and Polish. Open to freelance and contract work.

## Pages

- [Home / CV (EN)](${localeUrl('en')}): full résumé — experience, skills, projects, education.
- [Home / CV (PL)](${localeUrl('pl')}): Polish version of the résumé.
- [Now (EN)](${localeUrl('en', 'now')}): what ${basics.name.split(' ')[0]} is currently building, learning, and reading.
- [Now (PL)](${localeUrl('pl', 'now')}): Polish version of the "now" page.
- [Contact (EN)](${localeUrl('en', 'contact')}): how to get in touch and book a call.
- [Contact (PL)](${localeUrl('pl', 'contact')}): Polish version of the contact page.

## Experience

${experience}

## Skills

${skills}

## Projects

${projects || '- (none listed)'}

## Languages

${languages}

## Links

${profilesBlock}

## Contact

- Email: ${basics.email}
- Location: ${location}
- Site: ${siteUrl}
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
