'use client'
import { useEffect } from 'react'

const THEME_SNIPPET = `(function(){var t=localStorage.getItem('portfolio-theme');if(t!=='dark'&&t!=='light')t='light';document.documentElement.setAttribute('data-theme',t)})()`

// Set once per full document load, after the first client render commits.
// Module scope (not component state) so it persists across the client-side
// route changes that remount the locale layout.
let documentLoaded = false

/**
 * Inlines the anti-flash theme script into the initial HTML so the saved theme
 * is applied before first paint. It must NOT re-render on client-side locale
 * navigation: the `[lang]` layout remounts on EN↔PL switches, and React's mount
 * path warns about any executable <script> element (Scripts inside React
 * components aren't executed on the client anyway — see isScriptDataBlock in
 * react-dom; only non-executable data blocks like application/ld+json are
 * exempt).
 *
 * So we emit the script only during the initial document load and hydration
 * (when `documentLoaded` is still false), and render nothing afterwards. On a
 * client navigation the layout remounts with `documentLoaded` already true, so
 * the script is never created on the client — no warning, and no need for it
 * (the theme is already on <html> and AppChrome owns it from there).
 */
export function ThemeScript() {
  // Read in render (pure); flip in an effect (side effect) to stay
  // Strict-Mode/concurrent-safe — never mutate module state during render.
  useEffect(() => {
    documentLoaded = true
  }, [])

  if (documentLoaded) return null
  return <script dangerouslySetInnerHTML={{ __html: THEME_SNIPPET }} />
}
