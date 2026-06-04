import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
dotenv.config()

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET ?? 'production',
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
      en: 'Independent fullstack developer with over a decade across product engineering, cloud infrastructure, and data tooling.\nI work end-to-end — from API and database design through to interface details — and prefer small, high-trust teams where I can stay close to the problem.',
      pl: 'Niezależny programista fullstack z ponad dziesięcioletnim doświadczeniem w inżynierii produktu, infrastrukturze chmurowej i narzędziach danych.\nPracuję od początku do końca — od projektowania API i baz danych po detale interfejsu — i wolę małe, zaufane zespoły, w których mogę być blisko problemu.',
    },
    location: { city: 'Kraków', countryCode: 'PL' },
    profiles: [
      { network: 'GitHub',   username: 'bartosz-grabski',          url: 'https://github.com/bartosz-grabski' },
      { network: 'LinkedIn', username: 'bartosz-grabski-b89a0738', url: 'https://www.linkedin.com/in/bartosz-grabski-b89a0738/' },
    ],
  },
  work: [
    {
      name: 'FQ Enterprises AS',
      location: 'Norway (Remote)',
      positions: [{
        position: { en: 'Full Stack Engineer', pl: 'Full Stack Engineer' },
        startDate: '2021-01',
        endDate: 'Present',
        summary: {
          en: 'End-to-end development of Layn, a queuing management system, using Flutter for client apps and Google Cloud (Firebase, Firestore, BigQuery, Data Studio) for backend and analytics.',
          pl: 'Kompleksowy rozwój Layn, systemu zarządzania kolejkami, z wykorzystaniem Flutter dla aplikacji klienckich i Google Cloud (Firebase, Firestore, BigQuery, Data Studio) dla backendu i analityki.',
        },
        highlights: [
          { text: { en: 'Built and maintained the Flutter frontend for Layn across multiple client deployments.', pl: 'Zbudowałem i utrzymywałem frontend Flutter dla Layn w wielu wdrożeniach klienckich.' } },
          { text: { en: 'Integrated Firestore for real-time data sync and built BigQuery/Data Studio pipelines for statistics and reporting.', pl: 'Zintegrowałem Firestore do synchronizacji danych w czasie rzeczywistym i zbudowałem pipelines BigQuery/Data Studio do statystyk i raportowania.' } },
        ],
      }],
    },
    {
      name: 'Voyantis',
      location: 'Tel Aviv, Israel (Remote)',
      positions: [{
        position: { en: 'Full Stack Engineer', pl: 'Full Stack Engineer' },
        startDate: '2022-01',
        endDate: '2026-03',
        summary: {
          en: 'Built internal tools for data scientists and customer success managers at an Israeli AI startup. Worked across the full stack — React frontends, FastAPI/Flask backends, AWS infrastructure, and dbt data pipelines.',
          pl: 'Budowałem narzędzia wewnętrzne dla data scientistów i customer success managerów w izraelskim startupie AI. Pracowałem na pełnym stosie — frontendy React, backendy FastAPI/Flask, infrastruktura AWS i pipelines dbt.',
        },
        highlights: [
          { text: { en: 'Foresight UI — React + NestJS/TypeORM/Postgres admin dashboard used by customer-facing teams, built in an NX monorepo.', pl: 'Foresight UI — panel administracyjny React + NestJS/TypeORM/Postgres używany przez zespoły klienckie, zbudowany w monorepo NX.' } },
          { text: { en: "Dexter's Lab — Dash/Plotly dashboard for monitoring, deploying and managing predictive models and data backfills.", pl: "Dexter's Lab — dashboard Dash/Plotly do monitorowania, wdrażania i zarządzania modelami predykcyjnymi i backfillem danych." } },
          { text: { en: 'Built data loading jobs, dbt transformation scripts, and MCP servers to streamline data analysis workflows.', pl: 'Zbudowałem zadania ładowania danych, skrypty transformacji dbt i serwery MCP do usprawnienia przepływów analizy danych.' } },
        ],
      }],
    },
    {
      name: 'IGT Poland',
      location: 'Warsaw, Poland',
      positions: [{
        position: { en: 'Senior Software Engineer', pl: 'Senior Software Engineer' },
        startDate: '2018-12',
        endDate: '2022-07',
        summary: {
          en: 'Development and maintenance of enterprise-scale gaming platforms powering national lotteries across multiple countries.',
          pl: 'Rozwój i utrzymanie platform gamingowych klasy enterprise obsługujących krajowe loterie w wielu krajach.',
        },
        highlights: [
          { text: { en: 'Developed and maintained complex lottery platform components used by national lottery operators worldwide.', pl: 'Rozwijałem i utrzymywałem złożone komponenty platformy loteryjnej używane przez operatorów loterii krajowych na całym świecie.' } },
          { text: { en: 'Technologies: Java/Spring, JBoss EAP, DB2, ActiveMQ Artemis, Apache Camel, JMX.', pl: 'Technologie: Java/Spring, JBoss EAP, DB2, ActiveMQ Artemis, Apache Camel, JMX.' } },
        ],
      }],
    },
    {
      name: 'HSBC Service Delivery',
      location: 'Kraków, Poland',
      positions: [
        {
          position: { en: 'Acting Tech Lead', pl: 'Acting Tech Lead' },
          startDate: '2018-08',
          endDate: '2018-12',
          summary: {
            en: 'Led Originations SSP — a programme migrating 150+ customer journeys (loans, cards, mortgages) to a cloud-hosted tech stack.',
            pl: 'Prowadziłem Originations SSP — program migrujący 150+ ścieżek klientów (pożyczki, karty, hipoteki) na stos technologiczny hostowany w chmurze.',
          },
          highlights: [],
        },
        {
          position: { en: 'Senior Fullstack Engineer', pl: 'Senior Fullstack Engineer' },
          startDate: '2018-02',
          endDate: '2018-08',
          summary: {
            en: 'End-to-end new-to-bank loan application journey; TypeScript/React/Redux frontend, Java/Spring Boot/Mongo backend, PCF DevOps.',
            pl: 'Kompleksowa ścieżka aplikacji kredytowej dla nowych klientów banku; frontend TypeScript/React/Redux, backend Java/Spring Boot/Mongo, DevOps na PCF.',
          },
          highlights: [],
        },
        {
          position: { en: 'Senior Software Engineer', pl: 'Senior Software Engineer' },
          startDate: '2017-07',
          endDate: '2018-02',
          summary: {
            en: 'Delivered RACoE — lifecycle management of customer retirement cases, reducing manual processing at the bank.',
            pl: 'Dostarczyłem RACoE — zarządzanie cyklem życia spraw emerytalnych klientów, redukując ręczne przetwarzanie w banku.',
          },
          highlights: [],
        },
      ],
    },
    {
      name: 'ReasonApps',
      location: 'Kraków, Poland',
      positions: [{
        position: { en: 'Freelance Web Developer', pl: 'Freelance Web Developer' },
        startDate: '2018-03',
        endDate: '2018-05',
        summary: {
          en: 'Short-term freelance React development engagement.',
          pl: 'Krótkoterminowe zlecenie freelance — rozwój w React.',
        },
        highlights: [],
      }],
    },
    {
      name: 'Leanle',
      location: 'Kraków, Poland',
      positions: [{
        position: { en: 'Freelance Web Developer', pl: 'Freelance Web Developer' },
        startDate: '2017-03',
        endDate: '2017-10',
        summary: {
          en: 'Freelance web development — React applications and WordPress sites.',
          pl: 'Freelance web development — aplikacje React i strony WordPress.',
        },
        highlights: [],
      }],
    },
    {
      name: 'Idium Polska',
      location: 'Kraków, Poland',
      positions: [{
        position: { en: 'Java Web Developer', pl: 'Java Web Developer' },
        startDate: '2014-07',
        endDate: '2017-07',
        summary: {
          en: "Subsidiary of Norway's leading media house. Developed and maintained Idium Web+ and Editap CMS platforms; launched Editap on the Norwegian market.",
          pl: 'Spółka zależna wiodącego norweskiego domu mediowego. Rozwijałem i utrzymywałem platformy CMS Idium Web+ i Editap; wdrożyłem Editap na rynek norweski.',
        },
        highlights: [
          { text: { en: 'Technologies: Java 8, OSGi (Apache Felix), Varnish, AWS, ELK Stack, Docker, Node.js, ES6, Dojo.', pl: 'Technologie: Java 8, OSGi (Apache Felix), Varnish, AWS, ELK Stack, Docker, Node.js, ES6, Dojo.' } },
        ],
      }],
    },
    {
      name: 'IBM Poland',
      location: 'Kraków, Poland',
      positions: [{
        position: { en: 'Software Engineer Intern', pl: 'Praktykant — Software Engineer' },
        startDate: '2013-05',
        endDate: '2014-07',
        summary: {
          en: 'Contributed to Eclipse Orion/JazzHub, an open-source web IDE and CI/CD platform, and IBM Maximo-based Smart Road Maintenance system.',
          pl: "Brałem udział w projekcie Eclipse Orion/JazzHub — open-source'owym IDE webowym i platformie CI/CD, oraz systemie Smart Road Maintenance opartym na IBM Maximo.",
        },
        highlights: [],
      }],
    },
  ],
  education: [
    {
      institution: 'AGH University of Science and Technology',
      area: { en: 'Computer Science', pl: 'Informatyka' },
      studyType: 'MSc',
      startDate: '2011-10',
      endDate: '2017-06',
    },
  ],
  skills: [
    { name: 'Languages',  keywords: ['TypeScript', 'Python', 'Java', 'SQL'] },
    { name: 'Frontend',   keywords: ['React', 'Flutter', 'Next.js'] },
    { name: 'Cloud',      keywords: ['GCP (Firebase · BigQuery · GCS)', 'AWS'] },
    { name: 'Backend',    keywords: ['FastAPI', 'Flask', 'NestJS', 'Node.js', 'PostgreSQL', 'DynamoDB'] },
    { name: 'AI Tools',   keywords: ['Cursor', 'Claude Code', 'Claude Design', 'Gemini', 'Google Stitch'] },
    { name: 'Approach',   keywords: ['Stack-agnostic', 'AI-augmented workflow', 'Process over tools'] },
  ],
  skillsNote: {
    en: 'Tech stacks come and go. With AI-augmented workflows the time to productivity in a new stack has shrunk dramatically — what matters is knowing how to learn, not what you currently know.',
    pl: 'Technologie przychodzą i odchodzą. Przy wsparciu AI czas potrzebny do produktywności w nowym stosie technologicznym drastycznie się skrócił — liczy się umiejętność uczenia się, nie to, co aktualnie znasz.',
  },
  languages: [
    { language: 'English', fluency: 'Fluent' },
    { language: 'Polish',  fluency: 'Native' },
  ],
  speaking: [],
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

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  availabilityLabel: {
    en: 'Open for work',
    pl: 'Otwarty na projekty',
  },
  contact: {
    heading: {
      en: "Let's *talk*.",
      pl: '*Porozmawiajmy*.',
    },
    availabilityLine: {
      en: "I'm currently {availability} — freelance, contract, or full-time.",
      pl: 'Aktualnie {availability} — freelance, kontrakt lub na pełen etat.',
    },
    bookingLine: {
      en: 'Best by email, or book a 30-minute intro call — whichever you prefer.',
      pl: 'Najlepiej mailem albo zarezerwuj 30-minutową rozmowę wstępną — jak wolisz.',
    },
    signature: {
      en: '— {name}',
      pl: '— {name}',
    },
  },
}

async function seed() {
  console.log('Seeding resume…')
  await client.createOrReplace(resume)
  console.log('Seeding now…')
  await client.createOrReplace(now)
  console.log('Seeding siteSettings…')
  await client.createOrReplace(siteSettings)
  console.log('Done.')
}

seed().catch(console.error)
