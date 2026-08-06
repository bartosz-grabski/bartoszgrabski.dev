export {}

declare global {
  interface Env {
    /** Turnstile secret key — set locally via `TURNSTILE_SECRET=...` in
     *  apps/web/.dev.vars, and in production via the Cloudflare Pages
     *  dashboard (Settings → Functions → Bindings → add a secret). Never
     *  committed. */
    TURNSTILE_SECRET: string
  }
}
