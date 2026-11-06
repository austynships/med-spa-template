/* Packages a client's site as a standalone Next.js project in a zip. */
import { promises as fs } from "fs";
import path from "path";
import JSZip from "jszip";
import type { SiteConfig } from "@/lib/site-types";
import type { Project } from "./types";

const ROOT = path.join(/* turbopackIgnore: true */ process.cwd());

// Everything the public website needs. Admin, scraper and preview code are left out.
const INCLUDE_DIRS = ["app", "components", "lib", "public"];
const EXCLUDE = [/^app[\\/](admin|api|preview)\b/, /^components[\\/]admin\b/, /^lib[\\/]admin\b/, /^public[\\/]img[\\/]logo\.svg$/];
const ROOT_FILES = ["next.config.ts", "tsconfig.json"];

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await fs.readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (EXCLUDE.some((re) => re.test(rel))) continue;
    if (entry.isDirectory()) out.push(...(await walk(rel)));
    else out.push(rel);
  }
  return out;
}

/** Writes settings as readable TypeScript (unquoted keys where possible). */
function toTs(value: unknown, indent = "  "): string {
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    const inner = value.map((v) => indent + "  " + toTs(v, indent + "  "));
    return `[\n${inner.join(",\n")},\n${indent}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (!entries.length) return "{}";
    const inner = entries.map(([k, v]) => `${indent}  ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${toTs(v, indent + "  ")}`);
    return `{\n${inner.join(",\n")},\n${indent}}`;
  }
  return JSON.stringify(value);
}

function configFile(c: SiteConfig): string {
  return `/* =====================================================================
   SITE SETTINGS  —  This is the only file you need to edit.
   ---------------------------------------------------------------------
   • Change text between the quotes "like this".
   • Colors are hex codes (pick one at https://htmlcolorcodes.com).
   • To hide a whole section, set  show: false.
   • To add/remove a service, testimonial, FAQ, etc., copy or delete
     one { ... } block (keep the commas between blocks).
   • Images live in /public/img. Write paths starting with a slash,
     e.g. "/img/hero.jpg". Leave "" for the built-in soft backdrop.
   • Service icons: syringe, drop, sparkle, sun, leaf, heart, star,
     shield, clock.
   ===================================================================== */
import type { SiteConfig } from "@/lib/site-types";

export const site: SiteConfig = ${toTs(c, "")};
`;
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
  "image/svg+xml": "svg", "image/avif": "avif", "image/x-icon": "ico", "image/vnd.microsoft.icon": "ico",
};

/** Downloads remote images into the zip and points the settings at the local copies. */
async function bundleImages(c: SiteConfig, zip: JSZip, base: string, notes: string[]) {
  const cache = new Map<string, string>();
  const grab = async (url: string, name: string): Promise<string> => {
    if (!/^https?:\/\//.test(url)) return url;
    if (cache.has(url)) return cache.get(url)!;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; MedSpaSiteBuilder/1.0)" }, signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(String(res.status));
      const type = (res.headers.get("content-type") || "").split(";")[0].trim();
      const ext = EXT[type] || url.split("?")[0].split(".").pop()?.toLowerCase().slice(0, 4) || "jpg";
      const file = `${name}.${ext}`;
      zip.file(`${base}/public/img/${file}`, Buffer.from(await res.arrayBuffer()));
      cache.set(url, `/img/${file}`);
      return `/img/${file}`;
    } catch {
      notes.push(`Couldn't download ${url}; the site links to it directly instead.`);
      cache.set(url, url);
      return url;
    }
  };
  c.brand.logo = await grab(c.brand.logo, "logo");
  c.brand.favicon = await grab(c.brand.favicon, "favicon");
  c.hero.image = await grab(c.hero.image, "hero");
  c.about.image = await grab(c.about.image, "about");
  for (const [i, m] of c.team.members.entries()) m.photo = await grab(m.photo, `team-${i + 1}`);
}

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "med-spa";

export async function exportProject(p: Project): Promise<{ zip: Buffer; filename: string }> {
  const slug = slugify(p.config.brand.name);
  const zip = new JSZip();
  const config: SiteConfig = structuredClone(p.config);
  const notes: string[] = [];

  for (const dir of INCLUDE_DIRS) {
    for (const rel of await walk(dir)) {
      if (rel.replace(/\\/g, "/") === "public/img/favicon.svg" && config.brand.favicon !== "/img/favicon.svg") continue;
      zip.file(`${slug}/${rel.replace(/\\/g, "/")}`, await fs.readFile(path.join(ROOT, rel)));
    }
  }
  for (const f of ROOT_FILES) zip.file(`${slug}/${f}`, await fs.readFile(path.join(ROOT, f)));
  zip.file(`${slug}/.gitignore`, ["node_modules", ".next", "out", "next-env.d.ts", "*.tsbuildinfo", ".env*.local", ""].join("\n"));
  // The README minus the admin-panel part.
  const readme = (await fs.readFile(path.join(ROOT, "README.md"), "utf8")).split("<!-- ADMIN -->")[0];
  zip.file(`${slug}/README.md`, readme.replace(/^# .*$/m, `# ${p.config.brand.name} website`).trimEnd() + "\n");

  // Only the packages the website itself needs.
  const pkg = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
  const keep = (deps: Record<string, string>, names: string[]) => Object.fromEntries(names.filter((n) => deps[n]).map((n) => [n, deps[n]]));
  zip.file(`${slug}/package.json`, JSON.stringify({
    name: slug, version: "1.0.0", private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start" },
    dependencies: keep(pkg.dependencies, ["next", "react", "react-dom"]),
    devDependencies: keep(pkg.devDependencies, ["typescript", "@types/node", "@types/react", "@types/react-dom"]),
  }, null, 2) + "\n");

  await bundleImages(config, zip, slug, notes);
  zip.file(`${slug}/site.config.ts`, configFile(config));
  if (notes.length) zip.file(`${slug}/EXPORT-NOTES.txt`, notes.join("\n") + "\n");

  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return { zip: buf, filename: `${slug}-site.zip` };
}
