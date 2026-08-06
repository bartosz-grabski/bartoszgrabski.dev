export {}

declare global {
  interface Env {
    /** Turnstile secret key — set via `wrangler secret put TURNSTILE_SECRET`
     *  in production, and `TURNSTILE_SECRET=...` in `apps/web/.dev.vars` for
     *  local `wrangler dev`. Never committed. */
    TURNSTILE_SECRET: string
  }
}
