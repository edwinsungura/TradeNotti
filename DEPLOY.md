# Deploying TradeNotti to a shareable URL (Vercel + Neon)

This gets you a public `https://...vercel.app` URL. ~10 minutes, all free tier.

## 1. Create a Postgres database (Neon — free)
1. Go to https://neon.tech → sign up → **Create project**.
2. Copy the **connection string** (looks like
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).
   Keep this — it's your `DATABASE_URL`.

## 2. Import the repo into Vercel
1. Go to https://vercel.com → sign up with GitHub.
2. **Add New… → Project** → import **`edwinsungura/TradeNotti`**.
3. When asked which branch, deploy `claude/vibrant-allen-j54g5r` (or merge PR #1 to `main` first
   and deploy `main`).
4. Framework preset: **Next.js** (auto-detected). Leave build settings default — the repo's
   `vercel-build` script runs `prisma generate && prisma migrate deploy && next build`, so your
   database tables are created automatically on first deploy.

## 3. Add Environment Variables (Vercel → Project → Settings → Environment Variables)
| Name | Value |
|---|---|
| `DATABASE_URL` | your Neon connection string |
| `AUTH_SECRET` | run `openssl rand -base64 32` and paste the result |
| `NEXTAUTH_URL` | your Vercel URL, e.g. `https://tradenotti.vercel.app` |
| `CRON_SECRET` | any long random string |
| `OPENAI_API_KEY` | *(optional)* your OpenAI key — without it, insights use a computed fallback |
| `OPENAI_MODEL` | *(optional)* `gpt-4o` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | *(optional)* for Google sign-in |

Then **Deploy**.

## 4. (Optional) Seed demo data
The deploy creates empty tables. To load the demo trader so the app looks alive:

```bash
# locally, pointed at the Neon DB:
DATABASE_URL="<your neon url>" pnpm db:seed
# demo login: edwin@tradenotti.app / tradenotti
```

Otherwise just **sign up** in the app and onboard fresh.

## Notes
- **Daily AI insight:** `vercel.json` schedules `/api/cron/daily-insight` at 06:00 UTC daily.
  Vercel automatically sends `Authorization: Bearer $CRON_SECRET`, which the route verifies.
- **Google OAuth:** add `https://<your-domain>/api/auth/callback/google` as an authorized
  redirect URI in Google Cloud Console.
