import { buildLegacyTheme } from 'sanity'

/**
 * Mirrors the website's terminal palette (apps/web/styles/terminal.css, dark scheme).
 */
export const theme = buildLegacyTheme({
  '--font-family-base': '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  '--font-family-monospace': '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',

  '--black': '#0a0f0c',
  '--white': '#f1f4ef',
  '--gray-base': '#7fa37c',
  '--gray': '#7fa37c',

  '--component-bg': '#0f1612',
  '--component-text-color': '#c7e6c5',

  '--brand-primary': '#6dff95',
  '--focus-color': '#6dff95',
  '--default-button-primary-color': '#6dff95',
  '--default-button-color': '#4a6648',
  '--default-button-success-color': '#6dff95',
  '--default-button-warning-color': '#e6c86d',
  '--default-button-danger-color': '#ff6d6d',

  '--state-info-color': '#6dff95',
  '--state-success-color': '#6dff95',
  '--state-warning-color': '#e6c86d',
  '--state-danger-color': '#ff6d6d',

  '--main-navigation-color': '#0a0f0c',
  '--main-navigation-color--inverted': '#c7e6c5',
})
