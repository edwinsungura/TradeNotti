// Run `prisma migrate deploy` only when a database is actually configured.
//
// The Vercel build runs this between `prisma generate` and `next build`.
// Preview deployments have no DATABASE_URL, so attempting to migrate there
// fails the whole build (Prisma P1012) — and we wouldn't *want* a preview of
// an unmerged branch migrating the production database anyway. So: migrate
// when DATABASE_URL is present (production), skip cleanly when it isn't.
import { execSync } from "node:child_process";

if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL set — running `prisma migrate deploy`…");
  execSync("prisma migrate deploy", { stdio: "inherit" });
} else {
  console.log(
    "DATABASE_URL not set — skipping `prisma migrate deploy` (e.g. a preview build with no database).",
  );
}
