/* Crawls an existing website and pulls out everything useful for rebuilding it. */
import * as cheerio from "cheerio";
import { hsl } from "./color";
import type { Block, ScrapedImage, ScrapedPage, ScrapedReview, ScrapeResult } from "./types";

const UA = "Mozilla/5.0 (compatible; MedSpaSiteBuilder/1.0)";
const MAX_PAGES = 10;

// Inner pages worth visiting, best first.
const PAGE_PRIORITY = [
  /about|our-story|who-we-are/, /service|treatment|procedure|menu/, /team|staff|provider|meet/,
  /contact|location|visit/, /faq|question/, /pricing|price|membership|special|offer/,
  /review|testimonial/, /botox|filler|facial|laser|injectable|skin|body|wellness|iv/,
];

const BOOKING_HOSTS = /vagaro|boulevard|joinblvd|mindbodyonline|mindbody|janeapp|square\.site|squareup|booksy|zenoti|glossgenius|acuityscheduling|calendly|schedulicity|aestheticspro|joinmoxie|moxie|fresha|patientnow|nextech|aestheticrecord|myaestheticrecord/i;

const SOCIAL: Record<string, RegExp> = {
  instagram: /instagram\.com\/(?!p\/|reel\/|share|explore\/|stories\/)/i,
  facebook: /facebook\.com\/(?!sharer|share|dialog|tr\b|plugins)/i,
  tiktok: /tiktok\.com\/@/i,
  youtube: /youtube\.com\/(?:@|c\/|channel\/|user\/)/i,
  x: /(?:twitter|x)\.com\/(?!intent|share|home)/i,
  linkedin: /linkedin\.com\/(?:company|in)\//i,
  yelp: /yelp\.com\/biz\//i,
};

const PHONE_RE = /(?:\+?1[\s.-]?)?\(?([2-9]\d{2})\)?[\s.-]?(\d{3})[\s.-](\d{4})\b/g;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const ADDRESS_RE = /\b\d{1,6}\s+(?:[NSEW]\.?\s+)?[A-Za-z0-9.' -]{2,40}?\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Parkway|Pkwy|Court|Ct|Place|Pl|Highway|Hwy|Circle|Cir|Plaza|Square|Sq|Trail|Pike|Terrace)\b\.?(?:,?\s*(?:Suite|Ste|Unit|#)\.?\s*[\w-]+)?,?\s+[A-Z][A-Za-z .]{1,30},?\s+[A-Z]{2}\.?\s+\d{5}(?:-\d{4})?/g;
const DAY = "(?:Mon|Tue|Tues|Wed|Thu|Thur|Thurs|Fri|Sat|Sun)[a-z]*\\.?";
const TIME = "\\d{1,2}(?::\\d{2})?\\s*(?:am|pm|a\\.m\\.|p\\.m\\.)";
const HOURS_RE = new RegExp(`(${DAY}(?:\\s*(?:-|–|—|to|&|,)\\s*${DAY})*)\\s*:?\\s*(${TIME}\\s*(?:-|–|—|to)\\s*${TIME}|closed|by appointment(?: only)?)`, "gi");

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const formatPhone = (a: string, b: string, c: string) => `(${a}) ${b}-${c}`;

function absolute(href: string | undefined, base: string): string {
  if (!href) return "";
  const h = href.trim();
  if (!h || h.startsWith("data:") || h.startsWith("javascript:") || h.startsWith("#")) return "";
  try { return new URL(h, base).toString(); } catch { return ""; }
}

/** Only fetch public http(s) sites. */
export function validateUrl(input: string): string {
  let url: URL;
  try { url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`); } catch { throw new Error("That doesn't look like a web address."); }
  if (!/^https?:$/.test(url.protocol)) throw new Error("Only http and https sites can be scraped.");
  const h = url.hostname;
  if (h === "localhost" || h.endsWith(".local") || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(h) || h.includes(":")) {
    throw new Error("Local and private network addresses can't be scraped.");
  }
  url.hash = "";
  return url.toString();
}

async function fetchText(url: string, accept = "text/html"): Promise<{ text: string; finalUrl: string } | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: accept },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  const type = res.headers.get("content-type") || "";
  if (accept === "text/html" && !type.includes("html")) return null;
  const text = await res.text();
  return { text: text.slice(0, 3_000_000), finalUrl: res.url || url };
}

/* ---------- Colors ---------- */
// Preset colors that WordPress, Elementor and Bootstrap ship with every site.
const DEFAULT_PALETTES = new Set([
  "#0693e3", "#ff6900", "#00d084", "#cf2e2e", "#fcb900", "#7bdcb5", "#8ed1fc", "#9b51e0", "#f78da7", "#abb8c3",
  "#020381", "#2874fc", "#eee", "#6ec1e4", "#54595f", "#7a7a7a", "#61ce70", "#4054b2", "#23a455",
  "#0d6efd", "#6610f2", "#6f42c1", "#d63384", "#dc3545", "#fd7e14", "#ffc107", "#198754", "#20c997", "#0dcaf0",
  "#007bff", "#28a745", "#17a2b8", "#e83e8c",
]);
function toHex(c: string): string | null {
  c = c.trim().toLowerCase();
  let m = c.match(/^#([0-9a-f]{3})$/);
  if (m) return "#" + m[1].split("").map((x) => x + x).join("");
  m = c.match(/^#([0-9a-f]{6})$/);
  if (m) return "#" + m[1];
  m = c.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
  if (m) {
    if (m[4] && parseFloat(m[4]) < (m[4].endsWith("%") ? 60 : 0.6)) return null;
    return "#" + [m[1], m[2], m[3]].map((n) => Math.min(255, +n).toString(16).padStart(2, "0")).join("");
  }
  return null;
}

function brandColors(cssChunks: string[], themeColor: string): string[] {
  const counts = new Map<string, number>();
  const re = /#[0-9a-f]{6}\b|#[0-9a-f]{3}\b|rgba?\([^)]{5,40}\)/gi;
  for (const css of cssChunks) {
    for (const raw of css.match(re) || []) {
      const hex = toHex(raw);
      if (!hex) continue;
      const { s, l } = hsl(hex);
      if (s < 0.18 || l < 0.12 || l > 0.9) continue; // skip grays, near-black, near-white
      if (DEFAULT_PALETTES.has(hex)) continue; // theme/builder presets, not brand colors
      counts.set(hex, (counts.get(hex) || 0) + 1);
    }
  }
  const t = themeColor && toHex(themeColor);
  if (t) counts.set(t, (counts.get(t) || 0) + 1000);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c).slice(0, 8);
}

/* ---------- Structured data (schema.org JSON-LD) ---------- */
type Ld = Record<string, unknown>;
function walkLd(node: unknown, out: Ld[]) {
  if (Array.isArray(node)) return node.forEach((n) => walkLd(n, out));
  if (node && typeof node === "object") {
    out.push(node as Ld);
    for (const v of Object.values(node)) if (v && typeof v === "object") walkLd(v, out);
  }
}
const str = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
const DAY_NAMES: Record<string, string> = { mo: "Monday", tu: "Tuesday", we: "Wednesday", th: "Thursday", fr: "Friday", sa: "Saturday", su: "Sunday" };
const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  return `${((h + 11) % 12) + 1}${m ? ":" + String(m).padStart(2, "0") : ""}${h < 12 ? "am" : "pm"}`;
};

function readLd(nodes: Ld[], r: ScrapeResult) {
  for (const n of nodes) {
    const type = ([] as unknown[]).concat(n["@type"] ?? []).map(str).join(" ");
    if (n.telephone) r.phones.push(str(n.telephone));
    if (n.email) r.emails.push(str(n.email).replace(/^mailto:/, ""));
    if (/PostalAddress/.test(type) && n.streetAddress) {
      const city = [str(n.addressLocality), [str(n.addressRegion), str(n.postalCode)].filter(Boolean).join(" ")].filter(Boolean).join(", ");
      r.addresses.unshift(`${str(n.streetAddress)}\n${city}`.trim());
    }
    if (/LocalBusiness|MedicalBusiness|HealthAndBeautyBusiness|DaySpa|BeautySalon|Organization|MedicalClinic|Physician/.test(type)) {
      if (n.name && !r.siteName) r.siteName = str(n.name);
      const logo = typeof n.logo === "object" && n.logo ? str((n.logo as Ld).url) : str(n.logo);
      if (logo) r.logoCandidates.unshift(logo);
      for (const s of ([] as unknown[]).concat(n.sameAs ?? [])) {
        const url = str(s);
        for (const [k, re] of Object.entries(SOCIAL)) if (re.test(url) && !r.social[k]) r.social[k] = url;
      }
    }
    if (/AggregateRating/.test(type) && n.ratingValue) {
      r.rating = { value: str(n.ratingValue), count: str(n.reviewCount || n.ratingCount) };
    }
    if (/\bReview\b/.test(type) && n.reviewBody) {
      const author = typeof n.author === "object" && n.author ? str((n.author as Ld).name) : str(n.author);
      const rating = typeof n.reviewRating === "object" && n.reviewRating ? Number((n.reviewRating as Ld).ratingValue) : undefined;
      r.reviews.push({ quote: clean(str(n.reviewBody)), name: author || "Client", rating });
    }
    if (n.openingHoursSpecification) {
      for (const spec of ([] as unknown[]).concat(n.openingHoursSpecification) as Ld[]) {
        const days = ([] as unknown[]).concat(spec.dayOfWeek ?? []).map((d) => str(d).split("/").pop() || "");
        if (days.length && spec.opens) r.hours.push({ days: days.join(", "), time: `${fmtTime(str(spec.opens))} – ${fmtTime(str(spec.closes))}` });
      }
    }
    if (n.openingHours) {
      for (const line of ([] as unknown[]).concat(n.openingHours).map(str)) {
        const m = line.match(/^([A-Za-z,\- ]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
        if (m) {
          const days = m[1].replace(/[A-Za-z]{2}/g, (d) => DAY_NAMES[d.toLowerCase()] || d);
          r.hours.push({ days, time: `${fmtTime(m[2])} – ${fmtTime(m[3])}` });
        }
      }
    }
  }
}

/* ---------- One page ---------- */
function parsePage(html: string, pageUrl: string, r: ScrapeResult, cssChunks: string[], links: Set<string>, stylesheets: Set<string>) {
  const $ = cheerio.load(html);
  const origin = new URL(pageUrl).origin;

  // Structured data first; it's the most reliable.
  $('script[type="application/ld+json"]').each((_, el) => {
    try { const nodes: Ld[] = []; walkLd(JSON.parse($(el).text()), nodes); readLd(nodes, r); } catch { /* bad JSON-LD */ }
  });

  const meta = (sel: string) => clean($(sel).attr("content") || "");
  if (!r.siteName) r.siteName = meta('meta[property="og:site_name"]');
  const title = clean($("title").first().text());
  const description = meta('meta[name="description"]') || meta('meta[property="og:description"]');

  // Links: internal pages, phones, emails, social, booking.
  $("a[href]").each((_, el) => {
    const raw = $(el).attr("href") || "";
    if (/^tel:/i.test(raw)) {
      const d = raw.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
      if (d.length === 10) r.phones.push(formatPhone(d.slice(0, 3), d.slice(3, 6), d.slice(6)));
      return;
    }
    if (/^mailto:/i.test(raw)) { r.emails.push(decodeURIComponent(raw.slice(7).split("?")[0])); return; }
    const href = absolute(raw, pageUrl);
    if (!href) return;
    for (const [k, re] of Object.entries(SOCIAL)) if (re.test(href) && !r.social[k]) r.social[k] = href.split("?")[0];
    if (BOOKING_HOSTS.test(href)) r.bookingLinks.push(href);
    const u = new URL(href);
    if (u.origin === origin && !/\.(pdf|jpe?g|png|gif|webp|svg|zip|mp4)$/i.test(u.pathname)) {
      u.hash = ""; u.search = "";
      links.add(u.toString());
    }
  });

  // Logo & icons.
  const logoSel = 'img[src*="logo" i], img[alt*="logo" i], img[class*="logo" i], img[id*="logo" i], [class*="logo" i] > img, [id*="logo" i] > img, [class*="logo" i] > a > img, .site-branding img, header a[href="/"] img, header a[href="' + origin + '/"] img';
  $(logoSel).each((_, el) => {
    const src = absolute($(el).attr("src") || $(el).attr("data-src"), pageUrl);
    if (src && !/\.(mp4|webm|mov)(\?|$)/i.test(src)) r.logoCandidates.push(src);
  });
  if (!r.favicon) {
    r.favicon = absolute($('link[rel="apple-touch-icon"]').attr("href") || $('link[rel~="icon"]').attr("href"), pageUrl);
  }

  // Images.
  const addImg = (url: string, alt: string, source: ScrapedImage["source"]) => {
    if (!url || /\.svg(\?|$)/i.test(url) && source !== "logo") return;
    if (/\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url)) return;
    if (/facebook\.com\/tr|pixel|spacer|blank\.gif|gravatar|google-analytics|doubleclick/i.test(url)) return;
    if (!r.images.some((i) => i.url === url)) r.images.push({ url, alt: clean(alt), page: pageUrl, source });
  };
  addImg(absolute(meta('meta[property="og:image"]'), pageUrl), title, "og");
  $("img, source").each((_, el) => {
    const $el = $(el);
    const w = Number($el.attr("width")), h = Number($el.attr("height"));
    if ((w && w < 80) || (h && h < 80)) return;
    const srcset = $el.attr("srcset") || $el.attr("data-srcset") || "";
    const largest = srcset.split(",").map((s) => s.trim().split(/\s+/)).sort((a, b) => parseInt(b[1] || "0") - parseInt(a[1] || "0"))[0]?.[0];
    const src = $el.attr("data-src") || $el.attr("data-lazy-src") || $el.attr("data-original") || largest || $el.attr("src");
    addImg(absolute(src, pageUrl), $el.attr("alt") || "", "img");
  });
  $("[style*='background']").each((_, el) => {
    const m = ($(el).attr("style") || "").match(/url\((['"]?)(.+?)\1\)/);
    if (m) addImg(absolute(m[2], pageUrl), "", "background");
  });
  $("[data-bg], [data-background], [data-image]").each((_, el) => {
    addImg(absolute($(el).attr("data-bg") || $(el).attr("data-background") || $(el).attr("data-image"), pageUrl), "", "background");
  });

  // Colors.
  cssChunks.push(meta('meta[name="theme-color"]'));
  $("style").each((_, el) => { cssChunks.push($(el).text()); });
  $("[style]").each((_, el) => { cssChunks.push($(el).attr("style") || ""); });
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = absolute($(el).attr("href"), pageUrl);
    if (href && new URL(href).origin === origin) stylesheets.add(href);
  });

  // Text, in reading order. Contact details are often in the footer, so read those first.
  const bodyText = clean($("body").text());
  for (const m of bodyText.matchAll(PHONE_RE)) r.phones.push(formatPhone(m[1], m[2], m[3]));
  for (const m of bodyText.matchAll(EMAIL_RE)) r.emails.push(m[0]);
  for (const m of bodyText.matchAll(ADDRESS_RE)) r.addresses.push(clean(m[0]));
  for (const m of bodyText.matchAll(HOURS_RE)) r.hours.push({ days: clean(m[1]), time: clean(m[2]) });

  $("script, style, noscript, svg, iframe, form, nav").remove();
  const blocks: Block[] = [];
  const seen = new Set<string>();
  $("h1, h2, h3, h4, p, li, blockquote").each((_, el) => {
    const $el = $(el);
    if ($el.is("li") && $el.find("p, li").length) return; // the inner elements are read on their own
    const text = clean($el.text());
    const tag = el.tagName === "blockquote" ? "quote" : (el.tagName as Block["tag"]);
    const isHeading = /^h\d$/.test(tag);
    if (!text || seen.has(text)) return;
    if (isHeading ? text.length > 140 : text.length < (tag === "li" ? 3 : 25)) return;
    if (/cookie|privacy policy|all rights reserved|©/i.test(text) && text.length < 200) return;
    seen.add(text);
    blocks.push({ tag, text: text.slice(0, 1500) });
  });
  r.pages.push({ url: pageUrl, title, description, blocks: blocks.slice(0, 250) });
  if (!r.description && description) r.description = description;
  if (!r.siteName && title) r.siteName = title.split(/\s[|\-–—•:]\s/)[0];
}

function rankLinks(links: Set<string>, visited: Set<string>): string[] {
  const score = (u: string) => {
    const p = new URL(u).pathname.toLowerCase();
    const i = PAGE_PRIORITY.findIndex((re) => re.test(p));
    const depth = p.split("/").filter(Boolean).length;
    return (i === -1 ? 50 : i * 2) + depth * 3;
  };
  return [...links]
    .filter((u) => !visited.has(u) && !/blog|post|news|article|tag|category|cart|checkout|account|login|wp-|feed|privacy|terms/i.test(new URL(u).pathname))
    .sort((a, b) => score(a) - score(b));
}

const uniq = <T,>(arr: T[], key: (x: T) => string = (x) => String(x).toLowerCase()) => {
  const seen = new Set<string>();
  return arr.filter((x) => { const k = key(x); if (!k || seen.has(k)) return false; seen.add(k); return true; });
};
const byFrequency = (arr: string[]) => {
  const c = new Map<string, number>();
  arr.forEach((x) => c.set(x, (c.get(x) || 0) + 1));
  return [...c.entries()].sort((a, b) => b[1] - a[1]).map(([x]) => x);
};

export async function scrapeSite(input: string): Promise<ScrapeResult> {
  const start = validateUrl(input);
  const r: ScrapeResult = {
    url: start, fetchedAt: new Date().toISOString(), siteName: "", description: "", pages: [], images: [],
    logoCandidates: [], favicon: "", phones: [], emails: [], addresses: [], hours: [], social: {},
    bookingLinks: [], colors: [], reviews: [], errors: [],
  };
  const cssChunks: string[] = [];
  const links = new Set<string>();
  const stylesheets = new Set<string>();
  const visited = new Set<string>();

  const home = await fetchText(start).catch((e: Error) => { throw new Error(`Couldn't load the site: ${e.message}`); });
  if (!home) throw new Error("That address didn't return a web page.");
  visited.add(start).add(home.finalUrl);
  parsePage(home.text, home.finalUrl, r, cssChunks, links, stylesheets);
  if (home.text.length < 5000 && r.pages[0].blocks.length < 3) {
    r.errors.push("The homepage has very little text. It may be built with JavaScript, so some content might be missing.");
  }

  // Visit the most useful inner pages, a few at a time.
  const queue = rankLinks(links, visited).slice(0, MAX_PAGES - 1);
  for (let i = 0; i < queue.length; i += 4) {
    await Promise.all(queue.slice(i, i + 4).map(async (u) => {
      visited.add(u);
      try {
        const page = await fetchText(u);
        if (page) parsePage(page.text, page.finalUrl, r, cssChunks, links, stylesheets);
      } catch (e) { r.errors.push((e as Error).message); }
    }));
  }

  // A few of the site's own stylesheets, for brand colors.
  await Promise.all([...stylesheets].slice(0, 4).map(async (u) => {
    try { const css = await fetchText(u, "text/css,*/*"); if (css) cssChunks.push(css.text.slice(0, 400_000)); } catch { /* ignore */ }
  }));

  // Tidy up.
  const host = new URL(home.finalUrl).hostname.replace(/^www\./, "");
  r.phones = byFrequency(r.phones.map((p) => {
    const d = p.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
    return d.length === 10 ? formatPhone(d.slice(0, 3), d.slice(3, 6), d.slice(6)) : p;
  })).slice(0, 5);
  r.emails = byFrequency(r.emails.map((e) => e.toLowerCase().trim()))
    .filter((e) => !/\.(png|jpe?g|gif|webp|svg)$|sentry|wixpress|example\.|domain\.com|email\.com|yourname|@2x/.test(e))
    .sort((a, b) => Number(b.endsWith(host)) - Number(a.endsWith(host)))
    .slice(0, 5);
  r.addresses = uniq(r.addresses.map((a) => a.trim()), (a) => a.replace(/\W/g, "").toLowerCase()).slice(0, 4);
  r.hours = uniq(r.hours, (h) => h.days.toLowerCase().slice(0, 3) + h.time.toLowerCase()).slice(0, 10);
  r.bookingLinks = uniq(r.bookingLinks).slice(0, 5);
  r.logoCandidates = uniq(r.logoCandidates).slice(0, 8);
  r.reviews = uniq(r.reviews, (x) => x.quote.slice(0, 60)).slice(0, 12);
  r.colors = brandColors(cssChunks, "");
  // Logos first, then the rest; mark logo images.
  for (const l of r.logoCandidates) {
    const existing = r.images.find((i) => i.url === l);
    if (existing) existing.source = "logo";
    else r.images.unshift({ url: l, alt: "Logo", page: home.finalUrl, source: "logo" });
  }
  r.images = r.images.slice(0, 150);
  return r;
}
