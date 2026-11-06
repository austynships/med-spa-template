/* Builds a first draft of a client's settings from a scrape, using simple rules (no AI). */
import type { IconName } from "@/components/Icon";
import type { SiteConfig } from "@/lib/site-types";
import { site as template } from "@/site.config";
import { navFor } from "@/lib/nav";
import { paletteFrom } from "./color";
import type { Block, ScrapeResult } from "./types";

/* ---------- Treatments ---------- */
const TREATMENTS: { re: RegExp; icon: IconName; name: string }[] = [
  { re: /botox|neurotox|dysport|xeomin|daxxify|jeuveau|wrinkle relax/i, icon: "syringe", name: "Botox & Neurotoxins" },
  { re: /filler|juvederm|juvéderm|restylane|rha\b|lip (?:aug|enhan)|sculptra|radiesse/i, icon: "drop", name: "Dermal Fillers" },
  { re: /hydrafacial|facial|chemical peel|dermaplan/i, icon: "sparkle", name: "Facials & Peels" },
  { re: /laser|ipl|bbl|photofacial|moxi|halo|hair removal|resurfac/i, icon: "sun", name: "Laser & IPL" },
  { re: /microneedl|prp|prf|morpheus|radiofrequency|\brf\b|skinpen/i, icon: "leaf", name: "Microneedling" },
  { re: /\biv\b|vitamin|drip|weight loss|semaglutide|tirzepatide|glp-?1|hormone|wellness/i, icon: "heart", name: "Wellness & IV Therapy" },
  { re: /coolsculpt|emsculpt|body contour|cellulite|body sculpt/i, icon: "star", name: "Body Contouring" },
  { re: /skin tighten|thread lift|pdo|ultherapy|sofwave/i, icon: "shield", name: "Skin Tightening" },
];

const allBlocks = (s: ScrapeResult) => s.pages.flatMap((p) => p.blocks.map((b, i) => ({ ...b, page: p, i })));
const isHeading = (b: Block) => /^h\d$/.test(b.tag);
const nextParagraph = (blocks: Block[], i: number) => blocks.slice(i + 1, i + 6).find((b) => b.tag === "p" && b.text.length > 40)?.text || "";
const sentence = (t: string, max = 180) => {
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "));
  return end > 60 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "") + "…";
};

function findServices(s: ScrapeResult): SiteConfig["services"]["items"] {
  const found: SiteConfig["services"]["items"] = [];
  for (const t of TREATMENTS) {
    let matched = false;
    for (const page of s.pages) {
      const i = page.blocks.findIndex((b) => isHeading(b) && t.re.test(b.text) && b.text.length <= 50);
      if (i >= 0) {
        const heading = page.blocks[i].text.replace(/[:|].*$/, "").trim();
        found.push({ icon: t.icon, name: heading, description: sentence(nextParagraph(page.blocks, i) || ""), price: "" });
        matched = true;
        break;
      }
    }
    // Mentioned somewhere, but no heading of its own: use a generic name.
    if (!matched && allBlocks(s).some((b) => t.re.test(b.text))) {
      found.push({ icon: t.icon, name: t.name, description: "", price: "" });
    }
  }
  return found.slice(0, 6);
}

function findFaq(s: ScrapeResult): SiteConfig["faq"]["items"] {
  const items: SiteConfig["faq"]["items"] = [];
  for (const page of s.pages) {
    page.blocks.forEach((b, i) => {
      // Real questions only, not sales headings like "Ready for softer lines?"
      const question = /^(how|what|is|are|can|do|does|will|when|who|should|which|where|am|why(?! choose))\b/i.test(b.text);
      if ((isHeading(b) || b.tag === "p" || b.tag === "li") && question && b.text.endsWith("?") && b.text.length < 140) {
        const a = page.blocks[i + 1];
        if (a && !a.text.endsWith("?") && a.text.length > 40 && !isHeading(a) && !items.some((x) => x.q === b.text)) items.push({ q: b.text, a: a.text });
      }
    });
  }
  return items.slice(0, 8);
}

const pageMatching = (s: ScrapeResult, re: RegExp) => s.pages.find((p) => re.test(new URL(p.url).pathname));

const STREET_END = /^(.*\b(?:Suite|Ste|Unit|#)\.?\s*[\w-]+|.*\b(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Parkway|Pkwy|Court|Ct|Place|Pl|Highway|Hwy|Circle|Cir|Plaza|Trail|Pike|Terrace)\b\.?)\s*,?\s*(.*)$/;

/** Puts "City, ST 12345" on its own line. */
export function splitAddress(a: string): string {
  if (!a || a.includes("\n")) return a;
  const m = a.match(/^(.*?),?\s+([A-Z][A-Za-z .]+,?\s+[A-Z]{2}\.?\s+\d{5}(?:-\d{4})?)$/);
  if (!m) return a;
  // The lazy match can leave the city glued to the street; split after the last street word or suite.
  const street = m[1].match(STREET_END);
  if (street && street[2]) return `${street[1]}\n${street[2]} ${m[2]}`;
  return `${m[1]}\n${m[2]}`;
}

export function configFromScrape(s: ScrapeResult): SiteConfig {
  const c: SiteConfig = structuredClone(template);
  const home = s.pages[0];
  const name = s.siteName || new URL(s.url).hostname.replace(/^www\./, "").split(".")[0];

  // Brand
  c.brand.name = name;
  c.brand.tagline = "Medical Spa";
  c.brand.description = s.description || `${name} medical spa.`;
  c.brand.logo = s.logoCandidates[0] || "";
  c.brand.invertLogoInFooter = false;
  if (s.favicon) c.brand.favicon = s.favicon;
  if (s.colors.length) c.colors = paletteFrom(s.colors[0], s.colors[1]);

  // Contact
  const address = s.addresses[0] || "";
  c.contact = {
    phone: s.phones[0] || "",
    email: s.emails[0] || "",
    address: splitAddress(address),
    mapLink: address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.replace(/\n/g, ", "))}` : "",
    bookingUrl: s.bookingLinks[0] || "#contact",
    hours: s.hours.slice(0, 7),
    social: { instagram: s.social.instagram || "", facebook: s.social.facebook || "", tiktok: s.social.tiktok || "" },
  };

  // Hero
  const h1 = home?.blocks.find((b) => b.tag === "h1")?.text || "";
  // Photos only: no logos, icons or badges in the hero/about spots.
  const photos = s.images.filter((i) => i.source !== "logo" && !/logo|icon|badge|award|seal|avatar/i.test(i.url + i.alt));
  c.announcement = { show: false, text: "", linkText: "", link: "#contact" };
  c.hero = {
    eyebrow: c.contact.address ? c.contact.address.split("\n").pop()?.replace(/\s+\d{5}.*$/, "") || "" : "",
    headline: h1 && h1.length <= 70 ? h1 : name,
    subheadline: sentence(s.description || home?.blocks.find((b) => b.tag === "p" && b.text.length > 60)?.text || "", 200),
    primaryButton: { text: "Book a Consultation", link: c.contact.bookingUrl },
    secondaryButton: { text: "Explore Treatments", link: "#services" },
    image: photos.find((i) => i.source === "og")?.url || photos[0]?.url || "",
    badge: "",
    rating: s.rating ? { score: s.rating.value, label: s.rating.count ? `from ${s.rating.count} reviews` : "average rating" } : undefined,
  };
  c.stats = { show: false, items: [] };

  // Services
  c.services.items = findServices(s);
  c.services.show = c.services.items.length > 0;

  // About
  const about = pageMatching(s, /about|story|who-we-are/) || home;
  const aboutParas = (about?.blocks || []).filter((b) => b.tag === "p" && b.text.length > 80).slice(0, 2).map((b) => b.text);
  c.about = {
    show: aboutParas.length > 0,
    eyebrow: "About Us",
    title: about && about !== home ? about.blocks.find((b) => b.tag === "h1" || b.tag === "h2")?.text || `About ${name}` : `About ${name}`,
    paragraphs: aboutParas,
    checklist: [],
    image: photos.find((i) => i.page === about?.url && i.url !== c.hero.image)?.url || photos.find((i) => i.url !== c.hero.image)?.url || "",
    button: { text: "Book a Consultation", link: c.contact.bookingUrl },
  };

  // Things we can't know without AI or real data stay hidden.
  c.team = { ...c.team, show: false, members: [] };
  c.memberships = { ...c.memberships, show: false, plans: [] };
  c.testimonials = {
    ...c.testimonials,
    show: s.reviews.length > 0,
    items: s.reviews.slice(0, 3).map((r) => ({ quote: sentence(r.quote, 260), name: r.name, detail: "" })),
  };
  c.faq.items = findFaq(s);
  c.faq.show = c.faq.items.length > 0;

  c.cta = {
    show: true,
    title: "Ready to begin?",
    text: `Book your consultation with ${name} today.`,
    button: { text: "Book Your Visit", link: c.contact.bookingUrl },
  };
  c.contactSection = { ...c.contactSection, show: true, eyebrow: "Visit Us", title: "Get in touch", intro: "Send us a note and we'll get back to you soon.", formAction: "" };
  c.footer = { blurb: sentence(s.description || "", 140), legal: "Results vary by individual." };
  c.nav = navFor(c);
  return c;
}
