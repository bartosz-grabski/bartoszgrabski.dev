import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
dotenv.config()

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
})

const resume = {
  _id: 'resume',
  _type: 'resume',
  basics: {
    name: 'Bartosz Grabski',
    email: 'hello@bartoszgrabski.dev',
    url: 'bartoszgrabski.dev',
    summary: {
      en: 'Independent fullstack developer with a decade across product engineering, infrastructure and design systems.\nI work end-to-end — from API and database design through to interface details — and prefer small, high-trust teams where I can stay close to the problem.',
      pl: 'Niezależny programista fullstack z dziesięcioletnim doświadczeniem w inżynierii produktu, infrastrukturze i systemach projektowych.\nPracuję od początku do końca — od projektowania API i baz danych po detale interfejsu — i wolę małe, zaufane zespoły, w których mogę być blisko problemu.',
    },
    location: { city: 'Kraków', countryCode: 'PL' },
    profiles: [
      { network: 'GitHub',   username: 'bgrabski',         url: 'https://github.com/bgrabski' },
      { network: 'LinkedIn', username: 'bartosz-grabski',  url: 'https://www.linkedin.com/in/bartosz-grabski-b89a0738/' },
    ],
  },
  work: [
    {
      name: 'Halo Labs', startDate: '2022', endDate: 'Present',
      position: { en: 'Tech Lead', pl: 'Tech Lead' },
      summary: {
        en: 'Lead engineer on a B2B scheduling product. Team of four; shipping on a six-week cycle.',
        pl: 'Lead inżynier w produkcie B2B do zarządzania harmonogramami. Zespół czteroosobowy; wydania w cyklach sześciotygodniowych.',
      },
      highlights: [
        { text: { en: 'Designed the data model, billing, and event pipeline; product now serves 140+ paying teams across Europe.', pl: 'Zaprojektowałem model danych, billing i potok zdarzeń; produkt obsługuje obecnie 140+ płacących zespołów w Europie.' } },
        { text: { en: 'Owned the React + TypeScript frontend, including a custom calendar primitive used across three surfaces.', pl: 'Prowadziłem frontend React + TypeScript, w tym własny komponent kalendarza używany w trzech miejscach produktu.' } },
        { text: { en: 'Set up CI/CD on Fly.io with preview environments per pull request; cut release cycle time from days to under an hour.', pl: 'Skonfigurowałem CI/CD na Fly.io z podglądem dla każdego pull requesta; czas wydania spadł z dni do godziny.' } },
      ],
    },
    {
      name: 'Estromark', startDate: '2019', endDate: '2022',
      position: { en: 'Senior Software Engineer', pl: 'Senior Software Engineer' },
      summary: {
        en: 'Product engineering across web, mobile, and backend at a consumer fintech.',
        pl: 'Inżynieria produktu — web, mobile i backend — w konsumenckim fintechu.',
      },
      highlights: [
        { text: { en: 'Led the rebuild of the onboarding flow, improving completion from 41% to 68% over two quarters.', pl: 'Prowadziłem przebudowę procesu onboardingu — ukończenie wzrosło z 41% do 68% w ciągu dwóch kwartałów.' } },
        { text: { en: "Migrated the monolith's payment surface to a typed RPC layer; cut runtime errors in checkout by 80%.", pl: 'Zmigrowałem część płatności z monolitu do typowanej warstwy RPC; błędy w runtime w checkoucie spadły o 80%.' } },
        { text: { en: 'Mentored four engineers through promotion; ran the internal frontend guild.', pl: 'Mentorowałem czterech inżynierów do awansu; prowadziłem wewnętrzny frontend guild.' } },
      ],
    },
    {
      name: 'Krakatoa Studio', startDate: '2016', endDate: '2019',
      position: { en: 'Software Engineer', pl: 'Software Engineer' },
      summary: {
        en: 'Mid-level engineer at a digital product studio. Worked across client projects and internal tooling.',
        pl: 'Mid w studiu produktów cyfrowych. Praca przy projektach klienckich i narzędziach wewnętrznych.',
      },
      highlights: [
        { text: { en: 'Built and maintained six client web apps in React + Node, shipping on tight agency timelines.', pl: 'Zbudowałem i utrzymywałem sześć aplikacji webowych klientów w React + Node — wydania w napiętych terminach agencyjnych.' } },
        { text: { en: 'Wrote the internal admin tooling that the operations team still uses today.', pl: 'Napisałem wewnętrzne narzędzia administracyjne, z których zespół operacyjny korzysta do dziś.' } },
      ],
    },
    {
      name: 'Comarch', startDate: '2014', endDate: '2016',
      position: { en: 'Junior Developer', pl: 'Junior Developer' },
      summary: {
        en: 'First engineering role, on the customer service platform team.',
        pl: 'Pierwsza rola inżynierska — w zespole platformy obsługi klienta.',
      },
      highlights: [
        { text: { en: 'Built and maintained internal Angular dashboards used by 200+ support agents.', pl: 'Zbudowałem i utrzymywałem wewnętrzne dashboardy w Angularze używane przez 200+ agentów wsparcia.' } },
        { text: { en: 'Wrote integration tests and operator runbooks that reduced on-call escalations by half.', pl: 'Pisałem testy integracyjne i runbooki operacyjne — eskalacje on-call spadły o połowę.' } },
      ],
    },
  ],
  education: [
    { institution: 'AGH University of Science and Technology', area: { en: 'Computer Science — Distributed Systems', pl: 'Informatyka — Systemy Rozproszone' }, studyType: 'MSc', startDate: '2014', endDate: '2016' },
    { institution: 'AGH University of Science and Technology', area: { en: 'Computer Science', pl: 'Informatyka' }, studyType: 'BSc', startDate: '2010', endDate: '2014' },
  ],
  skills: [
    { name: 'Languages',  keywords: ['TypeScript', 'Python', 'Go', 'SQL', 'Rust (learning)'] },
    { name: 'Frontend',   keywords: ['React', 'Next.js', 'Tailwind', 'Web Components', 'Framer Motion'] },
    { name: 'Backend',    keywords: ['Node.js', 'PostgreSQL', 'Redis', 'tRPC', 'GraphQL'] },
    { name: 'Infra',      keywords: ['Fly.io', 'AWS', 'Terraform', 'GitHub Actions', 'Docker'] },
    { name: 'Practice',   keywords: ['Code review', 'Design systems', 'Accessibility (WCAG 2.2)', 'Mentoring'] },
  ],
  languages: [
    { language: 'Polish',  fluency: 'Native' },
    { language: 'English', fluency: 'Fluent' },
    { language: 'German',  fluency: 'Intermediate' },
  ],
  speaking: [
    { title: { en: 'Designing for the team that maintains it', pl: 'Projektowanie dla zespołu, który to utrzyma' }, venue: 'Code Europe, Kraków', year: '2024' },
    { title: { en: 'Small databases, big constraints', pl: 'Małe bazy danych, duże ograniczenia' }, venue: 'PolyConf, Poznań', year: '2023' },
  ],
  projects: [],
}

const now = {
  _id: 'now',
  _type: 'now',
  asOf: { en: 'May 2026', pl: 'maj 2026' },
  building: [
    {
      title: { en: 'Halo Labs internal tooling', pl: 'Halo Labs — narzędzia wewnętrzne' },
      blurb: { en: 'Lead engineering on the platform team — reworking how we deploy and observe services across regions.', pl: 'Lead inżynier w zespole platformowym — przebudowa sposobu wdrażania i obserwowania usług w wielu regionach.' },
    },
    {
      title: { en: 'A weekend SQLite tool', pl: 'Weekendowy tool do SQLite' },
      blurb: { en: 'A small CLI for snapshotting and diffing local SQLite databases. Started as a debugging aid; it might become a real thing.', pl: 'Małe CLI do robienia snapshotów i diffów lokalnych baz SQLite. Zaczęło się jako pomoc w debugowaniu; może wyrośnie z tego coś więcej.' },
    },
  ],
  learning: [
    { item: { en: 'Rust beyond hello world', pl: 'Rust dalej niż hello world' } },
    { item: { en: 'Postgres internals', pl: 'Wnętrzności Postgresa' } },
    { item: { en: 'Sketching with the iPad', pl: 'Szkicowanie na iPadzie' } },
  ],
  reading: [
    { title: 'A Philosophy of Software Design', author: 'John Ousterhout' },
    { title: 'Working in Public', author: 'Nadia Eghbal' },
  ],
  around: [
    { item: { en: 'Kraków — third year', pl: 'Kraków — trzeci rok' } },
    { item: { en: 'Cycling to the office most days', pl: 'Rowerem do biura większość dni' } },
    { item: { en: 'Open to occasional consulting from Q3', pl: 'Otwarty na konsulting od III kw.' } },
  ],
}

async function seed() {
  console.log('Seeding resume…')
  await client.createOrReplace(resume)
  console.log('Seeding now…')
  await client.createOrReplace(now)
  console.log('Done.')
}

seed().catch(console.error)
