import { RootRedirect } from './RootRedirect'
import { localePath, defaultLocale } from '@/lib/site'

// Static '/' entry point. Renders nothing visible — RootRedirect performs a
// client-side redirect to the browser-preferred locale; the <meta refresh> in
// the layout covers the no-JS case.
export default function RootPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <RootRedirect />
      <noscript>
        <a href={localePath(defaultLocale)}>Continue to bartoszgrabski.dev</a>
      </noscript>
    </main>
  )
}
