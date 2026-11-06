"use client";

/* Everything pulled from the client's current site, with one-click "use this" buttons. */
import { paletteFrom } from "@/lib/admin/color";
import type { ScrapeResult } from "@/lib/admin/types";
import type { SiteConfig } from "@/lib/site-types";

type Props = {
  scrape: ScrapeResult;
  config: SiteConfig;
  apply: (fn: (c: SiteConfig) => void, message: string) => void;
  notify: (m: string) => void;
  onRebuild: () => void;
  busy: boolean;
};

function Chips({ title, items, onUse }: { title: string; items: string[]; onUse: (v: string) => void }) {
  return (
    <div className="a-card-s">
      <h3>{title}</h3>
      {items.length === 0 ? <span className="a-muted">None found</span> : (
        <div className="a-chips">
          {items.map((v) => (
            <div className="a-chip" key={v}><span>{v}</span><button className="a-btn a-btn--sm" onClick={() => onUse(v)}>Use</button></div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScrapedPanel({ scrape: s, config, apply, notify, onRebuild, busy }: Props) {
  const copy = (t: string) => { navigator.clipboard.writeText(t); notify("Copied"); };
  const images = s.images;

  return (
    <>
      <div className="a-card-s">
        <h3>
          <span>Scraped {new Date(s.fetchedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
          <span className="a-muted" style={{ fontWeight: 400 }}>{s.pages.length} pages · {images.length} images</span>
        </h3>
        {s.errors.length > 0 && <div className="a-note">{s.errors.slice(0, 3).join(" ")}{s.errors.length > 3 && ` (+${s.errors.length - 3} more)`}</div>}
        <button className="a-btn a-btn--sm" style={{ justifySelf: "start" }} disabled={busy} onClick={onRebuild}>Start the draft over from this data</button>
      </div>

      <Chips title="Business name" items={s.siteName ? [s.siteName] : []} onUse={(v) => apply((c) => { c.brand.name = v; }, "Business name updated")} />
      <Chips title="Phone numbers" items={s.phones} onUse={(v) => apply((c) => { c.contact.phone = v; }, "Phone updated")} />
      <Chips title="Emails" items={s.emails} onUse={(v) => apply((c) => { c.contact.email = v; }, "Email updated")} />
      <Chips title="Addresses" items={s.addresses} onUse={(v) => apply((c) => {
        c.contact.address = v;
        c.contact.mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.replace(/\n/g, ", "))}`;
      }, "Address updated")} />
      <Chips title="Booking links" items={s.bookingLinks} onUse={(v) => apply((c) => {
        const old = c.contact.bookingUrl;
        c.contact.bookingUrl = v;
        for (const b of [c.hero.primaryButton, c.about.button, c.cta.button]) if (b && b.link === old) b.link = v;
      }, "Booking link updated")} />

      <div className="a-card-s">
        <h3>Social profiles</h3>
        {Object.keys(s.social).length === 0 ? <span className="a-muted">None found</span> : (
          <div className="a-chips">
            {Object.entries(s.social).map(([k, url]) => (
              <div className="a-chip" key={k}><span><b style={{ textTransform: "capitalize" }}>{k}</b> {url.replace(/^https?:\/\/(www\.)?/, "")}</span>
                {["instagram", "facebook", "tiktok"].includes(k)
                  ? <button className="a-btn a-btn--sm" onClick={() => apply((c) => { (c.contact.social as Record<string, string>)[k] = url; }, `${k} link added`)}>Use</button>
                  : <button className="a-btn a-btn--sm" onClick={() => copy(url)}>Copy</button>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="a-card-s">
        <h3>Hours {s.hours.length > 0 && <button className="a-btn a-btn--sm" onClick={() => apply((c) => { c.contact.hours = s.hours.slice(0, 7); }, "Hours updated")}>Use all</button>}</h3>
        {s.hours.length === 0 ? <span className="a-muted">None found</span> : s.hours.map((h, i) => <div key={i} style={{ fontSize: 13 }}>{h.days}: {h.time}</div>)}
      </div>

      <div className="a-card-s">
        <h3>Brand colors</h3>
        {s.colors.length === 0 ? <span className="a-muted">None found</span> : (
          <>
            <div className="a-swatches">
              {s.colors.map((col) => (
                <div className="a-swatch" key={col}>
                  <button style={{ background: col }} title={`Build palette from ${col}`} onClick={() => apply((c) => { c.colors = paletteFrom(col, c.colors.accent); }, "Palette built from " + col)} />
                  <span>{col}</span>
                  <button className="a-btn a-btn--sm" style={{ height: 22, padding: 0, fontSize: 10.5 }} onClick={() => apply((c) => { c.colors.accent = col; }, "Accent updated")}>Accent</button>
                </div>
              ))}
            </div>
            <span className="a-muted" style={{ fontSize: 12 }}>Click a swatch to build the whole palette from it.</span>
          </>
        )}
      </div>

      {(s.reviews.length > 0 || s.rating) && (
        <div className="a-card-s">
          <h3>Reviews published on the site</h3>
          {s.rating && <div style={{ fontSize: 13 }}>Rating {s.rating.value} from {s.rating.count || "?"} reviews
            <button className="a-btn a-btn--sm" style={{ marginLeft: 8 }} onClick={() => apply((c) => { c.hero.rating = { score: s.rating!.value, label: `from ${s.rating!.count} reviews` }; }, "Rating added to hero")}>Show in hero</button></div>}
          {s.reviews.map((r, i) => (
            <div className="a-chip" key={i}><span>“{r.quote.slice(0, 160)}{r.quote.length > 160 ? "…" : ""}” — {r.name}</span>
              <button className="a-btn a-btn--sm" onClick={() => apply((c) => { c.testimonials.items.push({ quote: r.quote, name: r.name, detail: "" }); c.testimonials.show = true; }, "Review added")}>Add</button>
            </div>
          ))}
        </div>
      )}

      <div className="a-card-s">
        <h3>Images <span className="a-muted" style={{ fontWeight: 400 }}>hover to use</span></h3>
        {images.length === 0 ? <span className="a-muted">None found</span> : (
          <div className="a-imgs">
            {images.map((img) => (
              <div className={`a-img${img.source === "logo" ? " a-img--logo" : ""}`} key={img.url} title={img.alt || img.url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} loading="lazy" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
                <div className="a-img__menu">
                  <button onClick={() => apply((c) => { c.brand.logo = img.url; }, "Logo updated")}>Logo</button>
                  <button onClick={() => apply((c) => { c.hero.image = img.url; }, "Hero photo updated")}>Hero</button>
                  <button onClick={() => apply((c) => { c.about.image = img.url; }, "About photo updated")}>About</button>
                  <button onClick={() => copy(img.url)}>Copy</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="a-card-s">
        <h3>Page text <span className="a-muted" style={{ fontWeight: 400 }}>click ⧉ to copy</span></h3>
        {s.pages.map((p) => (
          <details key={p.url} className="a-item">
            <summary><span className="a-item__name">{new URL(p.url).pathname === "/" ? "Homepage" : new URL(p.url).pathname}</span><span className="a-muted" style={{ fontSize: 12 }}>{p.blocks.length}</span></summary>
            <div style={{ padding: "0 6px 8px", display: "grid" }}>
              {p.blocks.map((b, i) => (
                <div key={i} className={`a-text-block${b.tag.startsWith("h") ? " a-text-block--h" : ""}`}>
                  <p>{b.tag === "li" ? "• " : ""}{b.text}</p>
                  <button className="a-icon-btn" onClick={() => copy(b.text)} aria-label="Copy">⧉</button>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
      <span className="a-muted" style={{ fontSize: 12, padding: "0 4px" }}>Current logo: {config.brand.logo ? config.brand.logo.split("/").pop() : "text only"}</span>
    </>
  );
}
