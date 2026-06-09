import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeNotti — Trade journaling & reviewing made simple",
  description:
    "A clean workspace for forex & crypto traders to capture, organize, and review every trade — with rules, a notebook, resources, and a daily AI insight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
