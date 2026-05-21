import { useLang } from '@/lib/i18n'

type Tab = 'cv' | 'now' | 'contact'

interface TabsProps {
  tab: Tab
  onTabChange: (tab: Tab) => void
}

export function Tabs({ tab, onTabChange }: TabsProps) {
  const { T } = useLang()

  const items: { id: Tab; label: string }[] = [
    { id: 'cv', label: T.tabs.cv },
    { id: 'now', label: T.tabs.now },
    { id: 'contact', label: T.tabs.contact },
  ]

  return (
    <div className="tabs no-print">
      <nav role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            className="tab"
            role="tab"
            aria-current={tab === item.id ? 'page' : undefined}
            onClick={() => onTabChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
