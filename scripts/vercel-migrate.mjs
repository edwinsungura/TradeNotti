// Run `prisma migrate deploy` only for real (production) deployments.
//
// The Vercel build runs this between `prisma generate` and `next build`.
//   - Preview deploys: never migrate. They shouldn't mutate any database (and
//     definitely not production, from an unmerged branch), and a missing/broken
//     preview DATABASE_URL must not fail the build. Always skip.
//   - Production deploys: migrate when DATABASE_URL is set, and fail loudly if
//     the migration itself fails — we don't want to ship against an unmigrated
//     schema.
//   - Anywhere else (local `vercel-build`, etc.): migrate iff DATABASE_URL is set.
import { execSync } from "node:child_process";

const isPreview = process.env.VERCEL_ENV === "preview";

if (isPreview) {
  console.log("Preview build — skipping `prisma migrate deploy` (previews never migrate).");
} else if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL set — running `prisma migrate deploy`…");
  execSync("prisma migrate deploy", { stdio: "inherit" });
} else {
  console.log("DATABASE_URL not set — skipping `prisma migrate deploy`.");
}
