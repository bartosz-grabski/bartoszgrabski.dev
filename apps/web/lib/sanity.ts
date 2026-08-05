import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  // Content is only ever fetched at build time (static export), not per-visitor,
  // so there's no traffic to save by using Sanity's CDN — only the risk of its
  // eventual-consistency window baking stale data into the static HTML right
  // after a publish-triggered rebuild. Always hit the live API instead.
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
