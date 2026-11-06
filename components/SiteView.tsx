/* The whole website for one set of settings. To reorder sections, move the lines in <main>. */
import type { CSSProperties } from "react";
import type { SiteConfig } from "@/lib/site-types";
import { Header } from "./Header";
import { RevealOnScroll } from "./RevealOnScroll";
import { Announcement, Hero, Stats } from "./sections/Hero";
import { About, Services, Team } from "./sections/Services";
import { Cta, Faq, Memberships, Testimonials } from "./sections/Offers";
import { Contact, Footer } from "./sections/Contact";

export function SiteView({ site }: { site: SiteConfig }) {
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
    [...new Set([site.fonts.heading, site.fonts.body])]
      .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600`)
      .join("&") +
    "&display=swap";

  return (
    <div className="site" style={theme}>
      {/* React moves this stylesheet into <head>. */}
      <link rel="stylesheet" href={fontsUrl} precedence="default" />
      <Announcement site={site} />
      <Header site={site} />
      <main>
        <Hero site={site} />
        <Stats site={site} />
        <Services site={site} />
        <About site={site} />
        <Team site={site} />
        <Memberships site={site} />
        <Testimonials site={site} />
        <Faq site={site} />
        <Cta site={site} />
        <Contact site={site} />
      </main>
      <Footer site={site} />
      <RevealOnScroll />
    </div>
  );
}
