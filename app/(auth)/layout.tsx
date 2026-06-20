import type { ReactNode } from "react";

// Auth pages depend on Clerk's runtime context, so they're rendered on demand
// rather than prerendered at build time. Prerendering them would require Clerk
// to be configured in every environment — including preview deploys that have
// no keys — and crash the build. Rendering on demand keeps the build green and
// defers Clerk to request time, where production has its keys.
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
