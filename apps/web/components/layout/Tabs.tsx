'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/i18n'
import { localePath, sectionFromPath } from '@/lib/site'

export function Tabs() {
  const { T, lang } = useLang()
  const active = sectionFromPath(usePathname())

  // Order and labels come from the Sanity uiStrings nav array.
  const items = T.nav

  return (
    <div className="tabs no-print">
      <nav>
        {items.map((item) => (
          <Link
            key={item.section || 'services'}
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
