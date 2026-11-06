import Image from "next/image";
import type { SiteConfig } from "@/lib/site-types";

/** A photo, or a soft color backdrop when no image is set. Parent must be position: relative. */
export function Photo({ src, alt, label, sizes, priority }: { src: string; alt: string; label: string; sizes: string; priority?: boolean }) {
  if (!src) return <div className="placeholder"><span>{label}</span></div>;
  // Images from other websites (e.g. while previewing a scraped site) skip Next's optimizer.
  const remote = /^https?:\/\//.test(src);
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={remote} style={{ objectFit: "cover" }} />;
}

export function SectionHead({ eyebrow, title, intro, center = true }: { eyebrow?: string; title: string; intro?: string; center?: boolean }) {
  return (
    <div className={center ? "section-head" : undefined}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="section-title">{title}</h2>
      {intro && <p>{intro}</p>}
    </div>
  );
}

export function Logo({ site, where }: { site: SiteConfig; where: "header" | "footer" }) {
  const b = site.brand;
  if (!b.logo) return <a className="logo" href="#top"><span className="logo__text">{b.name}</span></a>;
  return (
    <a className="logo" href="#top" aria-label={`${b.name} home`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- logos can be any file type or shape */}
      <img className={where === "footer" && b.invertLogoInFooter ? "invert" : undefined} src={b.logo} alt={b.name} style={{ height: b.logoHeight }} />
    </a>
  );
}

export const tel = (p: string) => "tel:" + p.replace(/[^\d+]/g, "");
