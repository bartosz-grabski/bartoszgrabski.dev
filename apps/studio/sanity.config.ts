import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'
import { Logo } from './components/Logo'
import { theme } from './theme'

export default defineConfig({
  name: 'default',
  title: 'bartoszgrabski.dev',
  subtitle: 'Content admin',
  icon: Logo,
  theme,
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
