import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Authenticated app surfaces. Everything else (landing, /login, /signup,
// /forgot-password, /sso-callback, static assets) stays public.
const isProtected = createRouteMatcher([
  "/today(.*)",
  "/journal(.*)",
  "/analytics(.*)",
  "/notebook(.*)",
  "/rules(.*)",
  "/resources(.*)",
  "/settings(.*)",
  "/partners(.*)",
  "/pinboard(.*)",
]);

// Auth pages live on the app host alongside the protected surfaces.
const isAuthRoute = createRouteMatcher([
  "/login(.*)",
  "/signup(.*)",
  "/forgot-password(.*)",
  "/sso-callback(.*)",
]);

// Hostname split is opt-in: only active when BOTH hosts are configured
// (production). Unset in local dev / preview, so everything is served on one
// host exactly as before.
const MARKETING_HOST = process.env.NEXT_PUBLIC_MARKETING_HOST?.toLowerCase();
const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST?.toLowerCase();

// Pre-launch: when on, the app + auth surface is sealed and every door leads
// back to the waitlist at "/". Flip off on launch day to reopen the app.
const WAITLIST_MODE = ["1", "true", "on"].includes(
  (process.env.WAITLIST_MODE ?? "").toLowerCase(),
);

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get("host")?.toLowerCase().split(":")[0] ?? "";
  const url = req.nextUrl;

  // Seal the app while the waitlist is live: app routes and auth pages bounce
  // to the waitlist. The landing, /preview, and /api stay open.
  if (WAITLIST_MODE && (isProtected(req) || isAuthRoute(req))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const splitHosts = Boolean(MARKETING_HOST && APP_HOST);

  const onMarketing =
    splitHosts && (host === MARKETING_HOST || host === `www.${MARKETING_HOST}`);
  const onApp = splitHosts && host === APP_HOST;

  // Marketing domain (tradenotti.com): only the landing page. Anything that
  // belongs to the app — app routes or auth pages — is sent to the app host.
  if (onMarketing) {
    if (isProtected(req) || isAuthRoute(req)) {
      return NextResponse.redirect(new URL(url.pathname + url.search, `https://${APP_HOST}`));
    }
    return NextResponse.next();
  }

  // App domain (app.tradenotti.com): the landing page isn't served here, so the
  // root goes straight to the dashboard (which bounces to /login if signed out).
  if (onApp) {
    if (url.pathname === "/") {
      return NextResponse.redirect(new URL("/today", `https://${APP_HOST}`));
    }
    if (isProtected(req)) {
      await auth.protect();
    }
    return NextResponse.next();
  }

  // Local dev / preview / single-host: original behavior.
  if (isProtected(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next internals and static files, run on everything else
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
