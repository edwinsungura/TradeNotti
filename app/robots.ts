import type { MetadataRoute } from "next";

const BASE_URL = "https://tradenotti.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private/app surfaces out of the index. /status/* are per-member
      // pages; the rest are the gated app + auth routes.
      disallow: [
        "/status/",
        "/api/",
        "/today",
        "/journal",
        "/analytics",
        "/notebook",
        "/rules",
        "/resources",
        "/settings",
        "/partners",
        "/pinboard",
        "/login",
        "/signup",
        "/forgot-password",
        "/sso-callback",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
