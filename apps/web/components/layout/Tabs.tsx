'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/i18n'
import { localePath, sectionFromPath, type Section } from '@/lib/site'

export function Tabs() {
  const { T, lang } = useLang()
  const active = sectionFromPath(usePathname())

  const items: { section: Section; label: string }[] = [
    { section: '', label: T.tabs.cv },
    { section: 'now', label: T.tabs.now },
    { section: 'contact', label: T.tabs.contact },
  ]

  return (
    <div className="tabs no-print">
      <nav>
        {items.map((item) => (
          <Link
            key={item.section || 'cv'}
            href={localePath(lang, item.section)}
            className="tab"
            aria-current={active === item.section ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
