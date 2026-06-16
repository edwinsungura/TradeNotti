import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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

export default clerkMiddleware(async (auth, req) => {
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
