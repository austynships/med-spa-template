import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${site.brand.name} | ${site.brand.tagline}`,
  description: site.brand.description,
  icons: { icon: site.brand.favicon },
  openGraph: { title: site.brand.name, description: site.brand.description, type: "website" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <noscript><style>{".reveal{opacity:1!important;transform:none!important}"}</style></noscript>
      </head>
      <body id="top">{children}</body>
    </html>
  );
}
