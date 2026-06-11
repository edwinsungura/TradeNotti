import type { Metadata, Viewport } from "next";
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
  title: "TradeNotti — Trade journaling & reviewing made simple",
  description:
    "A clean workspace for forex & crypto traders to capture, organize, and review every trade — with rules, a notebook, resources, and a daily AI insight.",
  applicationName: "TradeNotti",
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
  return (
    <html lang="en" data-theme="light" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
