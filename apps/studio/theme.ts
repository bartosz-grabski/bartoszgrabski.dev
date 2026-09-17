import { buildLegacyTheme } from 'sanity'

/**
 * Mirrors the website's dark theme (apps/web/styles/globals.css, `[data-theme="dark"]`).
 * oklch accents converted to hex: accent oklch(72% 0.11 252) → #70a9e8, danger oklch(68% 0.18 25) → #f3625d.
 */
export const theme = buildLegacyTheme({
  '--font-family-base': '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  '--font-family-monospace': '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',

  '--black': '#0c0e12',
  '--white': '#eef0f4',
  '--gray-base': '#5e6470',
  '--gray': '#a8aeba',

  '--component-bg': '#14171d',
  '--component-text-color': '#eef0f4',

  '--brand-primary': '#70a9e8',
  '--focus-color': '#70a9e8',
  '--default-button-primary-color': '#70a9e8',
  '--default-button-color': '#5e6470',
  '--default-button-success-color': '#5fcf8a',
  '--default-button-warning-color': '#e6c86d',
  '--default-button-danger-color': '#f3625d',

  '--state-info-color': '#70a9e8',
  '--state-success-color': '#5fcf8a',
  '--state-warning-color': '#e6c86d',
  '--state-danger-color': '#f3625d',

  '--main-navigation-color': '#0c0e12',
  '--main-navigation-color--inverted': '#eef0f4',
})
