import { JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import '@/styles/terminal.css'
import type { Metadata } from 'next'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bartosz Grabski — Fullstack Developer',
  description: 'Independent fullstack developer based in Kraków, Poland.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('portfolio-theme');if(!t)t=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';document.documentElement.setAttribute('data-theme',t)})()`,
          }}
        />
      </head>
      <body className={jetbrainsMono.variable}>{children}</body>
    </html>
  )
}
