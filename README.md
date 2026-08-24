# Sela

A mobile-first personal finance tracker — income, expenses, budgets, bills, loans,
savings/tax set-asides, and reports — built as an installable PWA.

A product of **Ratel Systems**.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui (Base UI)
- Supabase (Postgres + Auth + Row-Level Security)
- Recharts for charts
- Web Push (VAPID) for notifications, via Vercel Cron for scheduled reminders/reports
- Hand-rolled service worker for PWA installability + offline app shell

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase dashboard → Settings → API
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — generate with `npx web-push generate-vapid-keys`
   - `VAPID_SUBJECT` — a `mailto:` address
   - `CRON_SECRET` — any random string (used to authenticate Vercel Cron requests)
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase dashboard → Settings → API → service_role key
     (server-only; required for the cron routes to read across all users — never expose this
     to the client or commit it)
3. Run the SQL migrations in `supabase/migrations/` **in filename order** via the Supabase
   SQL Editor (or `supabase db push` if you have the CLI linked to your project).
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected.
3. Add all the environment variables above in the Vercel project's
   **Settings → Environment Variables**.
4. Deploy. `vercel.json` already defines the two scheduled cron jobs
   (daily bill reminders, weekly report) — Vercel picks these up automatically.
5. Back in Supabase, add your production domain to
   **Authentication → URL Configuration** (Site URL + Redirect URLs, including
   `https://your-domain/auth/callback`) or sign-in will fail in production.

## Project structure

- `src/app/(auth)` — login/signup
- `src/app/(app)` — the authenticated app shell and all feature pages
- `src/app/api/cron` — scheduled jobs (bill reminders, weekly report), protected by `CRON_SECRET`
- `src/lib/data` — server-side data-fetching/aggregation per feature
- `src/lib/supabase` — browser/server/service Supabase clients + hand-authored DB types
- `supabase/migrations` — SQL migrations, applied in order
- `public/sw.js` — service worker (offline app shell + push notifications)

## Out of scope for v1

Public multi-tenant signup UX, multi-currency conversion, bank/MoMo API auto-import,
full offline transaction entry with background sync, and CSV/PDF export. The schema
allows these later without a rework.
