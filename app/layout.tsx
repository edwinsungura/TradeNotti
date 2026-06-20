import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Prototype type system: Bricolage Grotesque (display) + Hanken Grotesk (body)
// + JetBrains Mono (figures). Loaded via next/font and wired to the CSS vars
// the design system reads (--font-bricolage / --font-hanken / --font-jetbrains).
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TradeNotti",
  description:
    "A clean trading journal for forex & crypto traders — capture, organize, and review every trade.",
  applicationName: "TradeNotti",
  openGraph: {
    title: "TradeNotti",
    description:
      "A clean trading journal for forex & crypto traders — capture, organize, and review every trade.",
    siteName: "TradeNotti",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "TradeNotti",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#5347F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tree = (
    <html lang="en" data-theme="light" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );

  // Clerk needs a publishable key at prerender time. On deploys where it isn't
  // configured (e.g. preview builds without Clerk env), skip the provider so the
  // public waitlist still builds and serves; production sets the key, so auth is
  // wrapped as normal.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return tree;
  }

  return (
    <ClerkProvider
      appearance={{ variables: { colorPrimary: "#5347F0" } }}
      signInUrl="/login"
      signUpUrl="/signup"
    >
      {tree}
    </ClerkProvider>
  );
}
