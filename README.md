# TradeNotti

A trading journal, review & accountability web app for **forex and crypto** traders. Capture,
organize and review every trade in one clean workspace — with a rulebook, a Notion-style notebook,
an editable resources library, performance analytics, and a once-per-day **AI insight**.

Built from the approved Claude design prototype — the design system (colors, type, components) is
ported verbatim into `app/globals.css`.

## Stack
- **Next.js 16 (App Router) + TypeScript**
- **PostgreSQL + Prisma**
- **Auth.js (NextAuth v5)** — email/password + Google
- **OpenAI** (`gpt-4o`) for the daily insight (graceful deterministic fallback without a key)
- Ported `oa-*` / `pp-*` CSS design system; `lucide-react` icons; Tiptap (planned for rich editing)

## Getting started

```bash
pnpm install

# 1. Start Postgres (Docker)
docker compose up -d

# 2. Configure env
cp .env.example .env        # then fill in secrets (see below)

# 3. Create the schema + demo data
pnpm db:migrate             # applies prisma/migrations
pnpm db:seed                # seeds a demo user with prototype data

# 4. Run
pnpm dev                    # http://localhost:3000
```

**Demo login:** `edwin@tradenotti.app` / `tradenotti`

## Environment variables (`.env`)
| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Auth.js session secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (optional in dev) |
| `OPENAI_API_KEY` | OpenAI key for daily insights (optional — falls back to a computed insight) |
| `OPENAI_MODEL` | Defaults to `gpt-4o` |
| `CRON_SECRET` | Protects `/api/cron/daily-insight` |

## Scripts
- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm test` — unit tests (stats engine)
- `pnpm db:migrate` / `pnpm db:seed` / `pnpm db:studio`

## Daily AI insight
`/api/cron/daily-insight` generates one insight per user per day (idempotent — enforced by a
`(userId, date)` unique constraint). Protect it with `CRON_SECRET` and schedule it daily
(e.g. Vercel Cron):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/daily-insight
```

Users can also generate today's insight on demand from the **Today** screen.

## Features
- **Today** — greeting, today's P&L, the daily AI insight, today's trades, your active rules
- **Journal** — Trades / Missed / Backtests with a Log-Trade modal; trade detail with tags,
  grade, notes & screenshots
- **Analytics** — net P&L, avg R, profit factor, max drawdown, equity curve, win-rate ring,
  P&L by pair
- **Notebook** — month calendar coloured by daily P&L; click any day to write a page
- **Rules** — your rulebook (add / pause / delete, categorised)
- **Resources** — editable document library with reusable templates
- **Partners** — read-only accountability sharing (scaffolded)
- **Pinboard**, **Settings** (profile, theme, accent, accounts), 3-step **Onboarding**

## Roadmap (not yet implemented)
- MT4/MT5 auto-sync and CSV import with column mapping
- Block-based (Tiptap) editor for Notebook & Resources (currently rich-text)
- Notion-style stacked filter engine on the Journal
- Screenshot uploads (Vercel Blob / S3) and Stripe billing for trial → Pro
