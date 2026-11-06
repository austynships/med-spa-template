import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { site } from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${site.brand.name} | ${site.brand.tagline}`,
  description: site.brand.description,
  icons: { icon: site.brand.favicon },
  openGraph: { title: site.brand.name, description: site.brand.description, type: "website" },
};

// Colors and fonts from site.config.ts become CSS variables used by globals.css.
const c = site.colors;
const theme = {
  "--primary": c.primary,
  "--primary-dark": c.primaryDark,
  "--accent": c.accent,
  "--bg": c.background,
  "--surface": c.surface,
  "--soft": c.soft,
  "--text": c.text,
  "--muted": c.muted,
  "--dark": c.dark,
  "--font-heading": `"${site.fonts.heading}", Georgia, serif`,
  "--font-body": `"${site.fonts.body}", system-ui, sans-serif`,
} as CSSProperties;

const fontsUrl =
  "https://fonts.googleapis.com/css2?" +
  [site.fonts.heading, site.fonts.body]
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600`)
    .join("&") +
  "&display=swap";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={theme}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={fontsUrl} />
        <noscript><style>{".reveal{opacity:1!important;transform:none!important}"}</style></noscript>
      </head>
      <body id="top">{children}</body>
    </html>
  );
}
