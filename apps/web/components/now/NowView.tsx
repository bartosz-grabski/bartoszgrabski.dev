import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { GoodreadsBooks } from './GoodreadsBooks'
import type { Now } from '@/lib/types'
import type { Book } from '@/lib/goodreads'

interface NowViewProps {
  now: Now
  initialBooks: Book[]
}

export function NowView({ now, initialBooks }: NowViewProps) {
  const { T, t } = useLang()

  return (
    <div className="now" data-view="now">
      <header className="now-head">
        <div>
          <Eyebrow>{T.sections.now}</Eyebrow>
          <p className="now-intro">{T.nowIntro}</p>
        </div>
        <span className="now-asof">{T.nowAsOf(t(now.asOf))}</span>
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
            <GoodreadsBooks initialBooks={initialBooks.length > 0 ? initialBooks : now.reading as Book[]} />
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
