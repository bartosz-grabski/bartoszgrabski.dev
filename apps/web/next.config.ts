import type { NextConfig } from 'next'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Monorepo: Next.js only loads .env from apps/web/ by default.
// Load the workspace-root .env so NEXT_PUBLIC_* vars are available
// in Server Components and at build time — no per-app .env symlinks needed.
const rootEnvPath = resolve(process.cwd(), '../../.env')
try {
  for (const line of readFileSync(rootEnvPath, 'utf8').split('\n')) {
    const stripped = line.replace(/#.*$/, '').trim()
    const eq = stripped.indexOf('=')
    if (eq < 1) continue
    const key = stripped.slice(0, eq).trim()
    const val = stripped.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] === undefined) process.env[key] = val
  }
} catch { /* .env absent — fall through to platform env */ }

// Allow a single set of Sanity vars: if SANITY_STUDIO_* are set but
// NEXT_PUBLIC_SANITY_* are not, alias them so the web app picks them up.
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.SANITY_STUDIO_PROJECT_ID) {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID
}
if (!process.env.NEXT_PUBLIC_SANITY_DATASET && process.env.SANITY_STUDIO_DATASET) {
  process.env.NEXT_PUBLIC_SANITY_DATASET = process.env.SANITY_STUDIO_DATASET
}

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Silence Turbopack's "multiple lockfiles" warning that fires because the
  // worktree lives inside the main repo's directory tree.
  turbopack: {
    root: resolve(process.cwd(), '../..'),
  },
}

export default nextConfig
