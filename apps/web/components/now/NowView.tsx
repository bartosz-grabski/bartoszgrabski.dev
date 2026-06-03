import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { GoodreadsBooks } from './GoodreadsBooks'
import type { Now } from '@/lib/types'
import type { Book } from '@/lib/goodreads'

interface NowViewProps {
  now: Now
  books: Book[]
  asOf: string
}

export function NowView({ now, books, asOf }: NowViewProps) {
  const { T, t, lang } = useLang()
  const asOfFormatted = new Intl.DateTimeFormat(lang === 'pl' ? 'pl-PL' : 'en-US', {
    month: 'long', year: 'numeric',
  }).format(new Date(asOf))

  return (
    <div className="now" data-view="now">
      <header className="now-head">
        <div>
          <Eyebrow>{T.sections.now}</Eyebrow>
          <p className="now-intro">{T.nowIntro}</p>
        </div>
        <span className="now-asof">{T.nowAsOf(asOfFormatted)}</span>
      </header>

      <dl className="now-list">
        <div className="now-row">
          <dt>{T.sections.building}</dt>
          <dd>
            {now.building.map((b, i) => (
              <div className="now-item" key={i}>
                <p className="now-title">{t(b.title)}</p>
                <p className="now-blurb">{t(b.blurb)}</p>
              </div>
            ))}
          </dd>
        </div>

        <div className="now-row">
          <dt>{T.sections.learning}</dt>
          <dd>
            <p className="now-inline">
              {now.learning.map(l => t(l.item)).join('  ·  ')}
            </p>
          </dd>
        </div>

        <div className="now-row">
          <dt>{T.sections.reading}</dt>
          <dd>
            <GoodreadsBooks books={books.length > 0 ? books : now.reading as Book[]} />
          </dd>
        </div>

        <div className="now-row">
          <dt>{T.sections.around}</dt>
          <dd>
            {now.around.map((a, i) => (
              <p className="now-line" key={i}>{t(a.item)}</p>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  )
}
