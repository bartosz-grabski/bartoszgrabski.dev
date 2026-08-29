import { createClient, type IdentifiedSanityDocumentStub } from '@sanity/client'
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
    label: { en: 'Fullstack Developer', pl: 'Programista Fullstack' },
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

const services = {
  _id: 'services',
  _type: 'services',
  title: { en: 'services', pl: 'usługi' },
  lede: {
    en: 'Three things I do, end to end: the site people land on, the product they use, and the AI that makes it faster. Design, build and deploy handled in one place.',
    pl: 'Trzy rzeczy, które robię od początku do końca: strona, na którą trafiają ludzie, produkt, z którego korzystają, i AI, które przyspiesza ich pracę. Projekt, budowa i wdrożenie — wszystko w jednym miejscu.',
  },
  blocks: [
    {
      _key: 'web',
      cmd: 'web',
      tag: { en: 'Websites & landing pages', pl: 'Strony i landing page' },
      blurb: {
        en: 'Fast, well-made sites that look right on a phone and a laptop. Built to load quickly, rank well, and be editable without calling me every time.',
        pl: 'Szybkie, dopracowane strony, które dobrze wyglądają na telefonie i na laptopie. Zbudowane tak, by szybko się ładowały, dobrze pozycjonowały i dały się edytować bez dzwonienia do mnie za każdym razem.',
      },
      bullets: [
        { _key: 'web-1', text: { en: 'Marketing sites, landing pages, portfolios', pl: 'Strony marketingowe, landing page, portfolio' } },
        { _key: 'web-2', text: { en: 'CMS setup so your team edits content themselves', pl: 'Konfiguracja CMS — treści edytuje Twój zespół' } },
        { _key: 'web-3', text: { en: 'Core Web Vitals, SEO basics and analytics wired in', pl: 'Core Web Vitals, podstawy SEO i analityka w standardzie' } },
        { _key: 'web-4', text: { en: 'Accessibility to WCAG 2.2 AA', pl: 'Dostępność zgodna z WCAG 2.2 AA' } },
      ],
    },
    {
      _key: 'apps',
      cmd: 'apps',
      tag: { en: 'Web & mobile applications', pl: 'Aplikacje webowe i mobilne' },
      blurb: {
        en: 'Web and mobile apps from the first sketch to a working release. I design the data model first, so the thing still holds together after the third round of new requirements.',
        pl: 'Aplikacje webowe i mobilne — od pierwszego szkicu do działającego wydania. Zaczynam od modelu danych, żeby całość trzymała się kupy także po trzeciej rundzie nowych wymagań.',
      },
      bullets: [
        { _key: 'apps-1', text: { en: 'Internal tools, dashboards, client portals', pl: 'Narzędzia wewnętrzne, dashboardy, portale klienckie' } },
        { _key: 'apps-2', text: { en: 'Mobile apps for iOS and Android from one codebase', pl: 'Aplikacje mobilne na iOS i Androida z jednej bazy kodu' } },
        { _key: 'apps-3', text: { en: 'Auth, billing, roles and permissions', pl: 'Logowanie, płatności, role i uprawnienia' } },
        { _key: 'apps-4', text: { en: 'CI/CD with preview environments per change', pl: 'CI/CD ze środowiskami preview dla każdej zmiany' } },
      ],
    },
    {
      _key: 'ai',
      cmd: 'ai',
      tag: { en: 'AI integrations & automation', pl: 'Integracje AI i automatyzacja' },
      blurb: {
        en: 'AI that saves real hours, not a chatbot bolted onto a homepage. Usually it starts with one repetitive task and grows from there.',
        pl: 'AI, które oszczędza realne godziny — a nie chatbot doklejony do strony głównej. Zwykle zaczyna się od jednego powtarzalnego zadania i rośnie od tego miejsca.',
      },
      bullets: [
        { _key: 'ai-1', text: { en: 'Assistants and chat grounded in your own documents (RAG)', pl: 'Asystenci i czat oparte na Twoich dokumentach (RAG)' } },
        { _key: 'ai-2', text: { en: 'Document and email processing — extract, classify, route', pl: 'Przetwarzanie dokumentów i maili — ekstrakcja, klasyfikacja, routing' } },
        { _key: 'ai-3', text: { en: 'Workflow automation between the tools you already pay for', pl: 'Automatyzacja przepływów między narzędziami, za które już płacisz' } },
        { _key: 'ai-4', text: { en: 'Evaluation and cost controls, so quality and spend stay predictable', pl: 'Ewaluacja i kontrola kosztów, by jakość i wydatki były przewidywalne' } },
      ],
    },
  ],
  howHeading: { en: 'how it runs', pl: 'jak to przebiega' },
  steps: [
    {
      _key: 'call',
      title: { en: 'Call', pl: 'Rozmowa' },
      text: {
        en: "30 minutes on what you need and whether I'm the right fit.",
        pl: '30 minut o tym, czego potrzebujesz i czy jestem właściwą osobą.',
      },
    },
    {
      _key: 'scope',
      title: { en: 'Scope', pl: 'Zakres' },
      text: {
        en: 'Fixed written scope, timeline and price before anything starts.',
        pl: 'Spisany zakres, harmonogram i cena — zanim cokolwiek się zacznie.',
      },
    },
    {
      _key: 'handover',
      title: { en: 'Handover', pl: 'Przekazanie' },
      text: {
        en: 'Deployed, documented, yours. Support afterwards if you want it.',
        pl: 'Wdrożone, udokumentowane, Twoje. Potem wsparcie, jeśli chcesz.',
      },
    },
  ],
  cta: {
    line: { en: 'get in touch', pl: 'odezwij się' },
    blurb: {
      en: 'Send a couple of lines about the project, or book a 30-minute intro call. I reply within 48 hours.',
      pl: 'Napisz kilka zdań o projekcie albo zarezerwuj 30-minutową rozmowę wstępną. Odpowiadam w ciągu 48 godzin.',
    },
    links: [
      {
        _key: 'book',
        label: { en: 'book a call', pl: 'umów rozmowę' },
        url: 'https://cal.com/bartosz-grabski',
        style: 'light',
      },
      {
        _key: 'contact',
        label: { en: 'contact', pl: 'kontakt' },
        url: '/contact',
        style: 'default',
      },
      {
        _key: 'email',
        label: { en: 'hello@bartoszgrabski.dev', pl: 'hello@bartoszgrabski.dev' },
        url: 'mailto:hello@bartoszgrabski.dev',
        style: 'default',
      },
    ],
  },
}

const uiStrings = {
  _id: 'uiStrings',
  _type: 'uiStrings',
  nav: [
    { _key: 'services', section: 'services', label: { en: 'services', pl: 'Usługi' } },
    { _key: 'cv', section: 'cv', label: { en: 'cv', pl: 'CV' } },
    { _key: 'now', section: 'now', label: { en: 'now', pl: 'Teraz' } },
    { _key: 'contact', section: 'contact', label: { en: 'contact', pl: 'Kontakt' } },
  ],
  theme: {
    light: { en: '☀ light', pl: '☀ Jasny' },
    dark: { en: '☾ dark', pl: '☾ Ciemny' },
  },
  sections: {
    about: { en: 'about', pl: 'o mnie' },
    skills: { en: 'skills', pl: 'umiejętności' },
    education: { en: 'education', pl: 'wykształcenie' },
    speaking: { en: 'speaking', pl: 'wystąpienia' },
    languages: { en: 'languages', pl: 'języki' },
    experience: { en: 'experience', pl: 'doświadczenie' },
    now: { en: 'now', pl: 'teraz' },
    building: { en: 'building', pl: 'buduję' },
    learning: { en: 'learning', pl: 'uczę się' },
    reading: { en: 'reading', pl: 'czytam' },
    around: { en: 'around', pl: 'wokół' },
    channels: { en: 'channels', pl: 'kanały' },
    form: { en: 'message', pl: 'wiadomość' },
  },
  nowIntro: {
    en: "A snapshot of what I'm working on, learning, and reading. Updated when things change — inspired by Derek Sivers' 'now' idea.",
    pl: "Migawka tego, nad czym pracuję, czego się uczę i co czytam. Aktualizowane, gdy coś się zmienia — inspirowane stroną 'now' Dereka Siversa.",
  },
  nowAsOf: { en: 'As of {date}', pl: 'Stan na {date}' },
  channels: {
    email: { en: 'Email', pl: 'E-mail' },
    github: { en: 'GitHub', pl: 'GitHub' },
    linkedin: { en: 'LinkedIn', pl: 'LinkedIn' },
    calendar: { en: 'Book a call', pl: 'Umów rozmowę' },
  },
  contactForm: {
    name: { en: 'Name', pl: 'Imię' },
    email: { en: 'Email', pl: 'Email' },
    phone: { en: 'Phone (optional)', pl: 'Telefon (opcjonalnie)' },
    message: { en: 'Message', pl: 'Wiadomość' },
    submit: { en: 'Send message', pl: 'Wyślij wiadomość' },
    sending: { en: 'Sending…', pl: 'Wysyłanie…' },
    rodo: {
      en: 'Your data is used solely to reply to your message — never for marketing or a newsletter, and never shared with third parties.',
      pl: 'Twoje dane wykorzystuję wyłącznie po to, by odpowiedzieć na Twoją wiadomość — nie służą do marketingu ani newslettera i nie są nikomu przekazywane.',
    },
    consent: {
      en: 'I agree to my data being used to reply to this message.',
      pl: 'Zgadzam się na wykorzystanie moich danych w celu odpowiedzi na tę wiadomość.',
    },
    errors: {
      name: { en: 'Please enter your name.', pl: 'Podaj swoje imię.' },
      emailRequired: { en: 'Please enter your email.', pl: 'Podaj adres e-mail.' },
      emailInvalid: { en: 'Please enter a valid email address.', pl: 'Podaj prawidłowy adres e-mail.' },
      message: { en: 'Please enter a message.', pl: 'Wpisz treść wiadomości.' },
      consent: { en: 'Please confirm consent before sending.', pl: 'Potwierdź zgodę przed wysłaniem.' },
      invalid_payload: { en: 'Please check the form and try again.', pl: 'Sprawdź formularz i spróbuj ponownie.' },
      turnstile_failed: { en: 'Verification failed — please try again.', pl: 'Weryfikacja nie powiodła się — spróbuj ponownie.' },
      send_failed: {
        en: 'Something went wrong sending your message. Please try again or email hello@bartoszgrabski.dev directly.',
        pl: 'Coś poszło nie tak przy wysyłaniu wiadomości. Spróbuj ponownie albo napisz bezpośrednio na hello@bartoszgrabski.dev.',
      },
    },
  },
  buttons: {
    json: { en: '↓ json', pl: '↓ JSON' },
    pdf: { en: '↓ pdf', pl: '↓ PDF' },
  },
  toasts: {
    json: { en: 'CV downloaded as JSON', pl: 'CV pobrane jako JSON' },
    contactSent: { en: 'Message sent', pl: 'Wiadomość wysłana' },
  },
  footer: {
    copy: { en: '© {year} {name}', pl: '© {year} {name}' },
    built: { en: 'Built by hand · Last updated {date}', pl: 'Wykonane ręcznie · Ostatnia aktualizacja: {date}' },
  },
  atSep: { en: ' at ', pl: ' w ' },
  langLevels: {
    native: { en: 'Native', pl: 'ojczysty' },
    fluent: { en: 'Fluent', pl: 'biegły' },
    intermediate: { en: 'Intermediate', pl: 'średniozaawansowany' },
  },
}

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  availabilityLabel: {
    en: 'Open for work',
    pl: 'Otwarty na projekty',
  },
  seo: {
    title: {
      en: 'Bartosz Grabski — Fullstack Developer',
      pl: 'Bartosz Grabski — Programista Fullstack',
    },
    description: {
      en: 'Bartosz Grabski — fullstack developer in Kraków, Poland. I build web apps end to end with TypeScript, React, Next.js and Node. Open to freelance and contract work.',
      pl: 'Bartosz Grabski — programista fullstack z Krakowa. Tworzę aplikacje webowe od początku do końca w TypeScript, React, Next.js i Node. Otwarty na współpracę freelance i kontraktową.',
    },
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

const documents: Record<string, IdentifiedSanityDocumentStub> = { resume, now, services, siteSettings, uiStrings }

// Seed everything, or only the documents named on the command line, e.g.
//   npm run seed              → all documents
//   npm run seed -- services  → just the services document
async function seed() {
  const requested = process.argv.slice(2)
  const unknown = requested.filter((name) => !(name in documents))
  if (unknown.length) {
    console.error(`Unknown document(s): ${unknown.join(', ')}. Known: ${Object.keys(documents).join(', ')}`)
    process.exit(1)
  }
  const names = requested.length
    ? (requested as (keyof typeof documents)[])
    : (Object.keys(documents) as (keyof typeof documents)[])

  for (const name of names) {
    console.log(`Seeding ${name}…`)
    await client.createOrReplace(documents[name])
  }
  console.log('Done.')
}

seed().catch(console.error)
