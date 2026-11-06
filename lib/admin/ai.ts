/* Uses Claude to sort scraped text into the template's sections and polish the copy. */
import Anthropic from "@anthropic-ai/sdk";
import { ICON_NAMES } from "@/components/Icon";
import type { SiteConfig } from "@/lib/site-types";
import { navFor } from "@/lib/nav";
import type { ScrapeResult } from "./types";

const MODEL = "claude-opus-5-5";
const MAX_TEXT_CHARS = 90_000;

const SYSTEM = `You rebuild websites for medical spas. You receive text, contact details and an image list scraped from a med spa's current website. Fill a modern one-page website template with this business's real content.

Rules:
- Use only facts found in the scraped content. Never invent reviews, testimonials, staff names, credentials, awards, statistics, prices, promotions, membership plans or years in business.
- Rewrite and tighten wording so it sounds polished, warm and professional, but keep every claim true to the source. Fix typos and awkward phrasing.
- If the site has no real content for a section, set that section's "show" to false and leave its lists empty. Team, memberships, stats, testimonials and announcement are usually missing; hide them unless the site clearly provides that content.
- Testimonials must be real quotes from the site (light trimming allowed, no rewording of meaning) with the reviewer name as given.
- Services: up to 6 of the business's main treatment categories, each with a one or two sentence description. Include a price only if the site states it.
- FAQ: real questions the site answers, up to 6. Answers may be shortened.
- Headline: short and memorable (under 8 words). You may put one line break in it with "\\n".
- Keep the business name exactly as the business writes it.
- For images, pick by number from the image list, or -1 if none fits. Logo: the business's own logo. Hero: an attractive photo suitable as a large banner (not a logo, icon or before/after collage). About: a photo of the space, team or a treatment. Team member photos: a headshot of that person, or -1.
- Hours: parse into rows like {"days": "Mon – Fri", "time": "9:00am – 6:00pm"}; empty list if not found.`;

const str = { type: "string" } as const;
const bool = { type: "boolean" } as const;
const int = { type: "integer" } as const;
const obj = (properties: Record<string, unknown>) => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
const arr = (items: unknown) => ({ type: "array", items });
const head = { show: bool, eyebrow: str, title: str };

const SCHEMA = obj({
  brand: obj({ name: str, tagline: str, description: str }),
  announcement: obj({ show: bool, text: str, linkText: str }),
  hero: obj({ eyebrow: str, headline: str, subheadline: str, primaryButtonText: str, secondaryButtonText: str, badge: str }),
  stats: obj({ show: bool, items: arr(obj({ number: str, label: str })) }),
  services: obj({ ...head, intro: str, items: arr(obj({ icon: { type: "string", enum: ICON_NAMES }, name: str, description: str, price: str })) }),
  about: obj({ ...head, paragraphs: arr(str), checklist: arr(str) }),
  team: obj({ ...head, members: arr(obj({ name: str, role: str, photoImage: int })) }),
  memberships: obj({ ...head, intro: str, buttonText: str, plans: arr(obj({ name: str, price: str, period: str, featured: bool, badge: str, perks: arr(str) })) }),
  testimonials: obj({ ...head, items: arr(obj({ quote: str, name: str, detail: str })) }),
  faq: obj({ ...head, items: arr(obj({ q: str, a: str })) }),
  cta: obj({ title: str, text: str, buttonText: str }),
  contactSection: obj({ eyebrow: str, title: str, intro: str }),
  footer: obj({ blurb: str }),
  hours: arr(obj({ days: str, time: str })),
  images: obj({ logo: int, hero: int, about: int }),
});

type AiTeam = { name: string; role: string; photoImage: number };
type AiResult = {
  brand: SiteConfig["brand"];
  announcement: { show: boolean; text: string; linkText: string };
  hero: { eyebrow: string; headline: string; subheadline: string; primaryButtonText: string; secondaryButtonText: string; badge: string };
  stats: SiteConfig["stats"];
  services: SiteConfig["services"];
  about: { show: boolean; eyebrow: string; title: string; paragraphs: string[]; checklist: string[] };
  team: { show: boolean; eyebrow: string; title: string; members: AiTeam[] };
  memberships: SiteConfig["memberships"];
  testimonials: SiteConfig["testimonials"];
  faq: SiteConfig["faq"];
  cta: { title: string; text: string; buttonText: string };
  contactSection: { eyebrow: string; title: string; intro: string };
  footer: { blurb: string };
  hours: { days: string; time: string }[];
  images: { logo: number; hero: number; about: number };
};

function describeScrape(s: ScrapeResult, images: ScrapeResult["images"]): string {
  const facts = [
    `Website: ${s.url}`,
    `Business name (from site): ${s.siteName}`,
    `Meta description: ${s.description}`,
    `Phones: ${s.phones.join(", ") || "none found"}`,
    `Emails: ${s.emails.join(", ") || "none found"}`,
    `Addresses: ${s.addresses.map((a) => a.replace(/\n/g, ", ")).join(" | ") || "none found"}`,
    `Hours found: ${s.hours.map((h) => `${h.days}: ${h.time}`).join("; ") || "none found"}`,
    s.rating ? `Google/structured rating: ${s.rating.value} from ${s.rating.count} reviews` : "",
    s.reviews.length ? `Structured reviews:\n${s.reviews.map((r) => `- "${r.quote}" — ${r.name}`).join("\n")}` : "",
  ].filter(Boolean).join("\n");

  const imageList = images
    .map((img, i) => `${i}. [${img.source}] ${img.url.split("/").pop()?.split("?")[0]} | alt: "${img.alt}" | on page ${new URL(img.page).pathname}`)
    .join("\n");

  let text = "";
  for (const p of s.pages) {
    let page = `\n\n=== Page ${new URL(p.url).pathname} | ${p.title} ===\n`;
    for (const b of p.blocks) page += b.tag.startsWith("h") ? `\n${"#".repeat(Number(b.tag[1]))} ${b.text}\n` : b.tag === "li" ? `- ${b.text}\n` : `${b.text}\n`;
    if (text.length + page.length > MAX_TEXT_CHARS) { text += "\n\n[Further pages omitted for length.]"; break; }
    text += page;
  }
  return `<facts>\n${facts}\n</facts>\n\n<images>\n${imageList}\n</images>\n\n<page_text>${text}\n</page_text>\n\nFill the template from this content.`;
}

export async function aiFill(scrape: ScrapeResult, current: SiteConfig): Promise<SiteConfig> {
  const images = scrape.images.slice(0, 80);
  const client = new Anthropic();

  let message;
  try {
    message = await client.beta.messages.stream({
      model: MODEL,
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: "user", content: describeScrape(scrape, images) }],
    }).finalMessage();
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error("Claude API key is missing or invalid. Add ANTHROPIC_API_KEY to the .env.local file and restart the dev server.");
    if (e instanceof Anthropic.RateLimitError) throw new Error("Claude is rate limited right now. Try again in a minute.");
    if (e instanceof Anthropic.APIError) throw new Error(`Claude API error (${e.status}): ${e.message}`);
    if (e instanceof Error && /api key|authentication/i.test(e.message)) throw new Error("No Claude API key found. Add ANTHROPIC_API_KEY to the .env.local file and restart the dev server.");
    throw e;
  }

  if (message.stop_reason === "refusal") throw new Error("Claude declined to process this site's content.");
  if (message.stop_reason === "max_tokens") throw new Error("Claude's answer was cut off. Try again.");
  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("Claude returned no content.");
  const ai = JSON.parse(block.text) as AiResult;
  return applyAi(current, ai, scrape, images);
}

function applyAi(current: SiteConfig, ai: AiResult, s: ScrapeResult, images: ScrapeResult["images"]): SiteConfig {
  const c: SiteConfig = structuredClone(current);
  const pick = (i: number, fallback: string) => (i >= 0 && images[i] ? images[i].url : fallback);
  const book = c.contact.bookingUrl;

  c.brand = { ...c.brand, name: ai.brand.name || c.brand.name, tagline: ai.brand.tagline, description: ai.brand.description, logo: pick(ai.images.logo, c.brand.logo) };
  c.announcement = { show: ai.announcement.show && !!ai.announcement.text, text: ai.announcement.text, linkText: ai.announcement.linkText, link: book };
  c.hero = {
    ...c.hero,
    eyebrow: ai.hero.eyebrow,
    headline: ai.hero.headline.replace(/\\n/g, "\n"),
    subheadline: ai.hero.subheadline,
    primaryButton: { text: ai.hero.primaryButtonText || "Book a Consultation", link: book },
    secondaryButton: { text: ai.hero.secondaryButtonText || "Explore Treatments", link: "#services" },
    badge: ai.hero.badge,
    image: pick(ai.images.hero, c.hero.image),
  };
  c.stats = { show: ai.stats.show && ai.stats.items.length > 0, items: ai.stats.items.slice(0, 4) };
  c.services = { ...ai.services, items: ai.services.items.slice(0, 6) };
  c.about = { ...c.about, ...ai.about, image: pick(ai.images.about, c.about.image), button: { text: "Book a Consultation", link: book } };
  c.team = {
    show: ai.team.show && ai.team.members.length > 0, eyebrow: ai.team.eyebrow, title: ai.team.title,
    members: ai.team.members.map((m) => ({ name: m.name, role: m.role, photo: pick(m.photoImage, "") })),
  };
  c.memberships = { ...ai.memberships, show: ai.memberships.show && ai.memberships.plans.length > 0 };
  c.testimonials = { ...ai.testimonials, show: ai.testimonials.show && ai.testimonials.items.length > 0 };
  c.faq = { ...ai.faq, show: ai.faq.show && ai.faq.items.length > 0 };
  c.cta = { show: true, title: ai.cta.title, text: ai.cta.text, button: { text: ai.cta.buttonText || "Book Your Visit", link: book } };
  c.contactSection = { ...c.contactSection, ...ai.contactSection };
  c.footer = { ...c.footer, blurb: ai.footer.blurb };
  if (ai.hours.length) c.contact.hours = ai.hours.slice(0, 7);
  if (s.rating && !c.hero.rating) c.hero.rating = { score: s.rating.value, label: `from ${s.rating.count} reviews` };
  c.nav = navFor(c);
  return c;
}
