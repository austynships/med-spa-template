"use client";

/* A form that edits any part of the site settings, built from the settings' own shape. */
import { ICON_NAMES } from "@/components/Icon";

export type Path = (string | number)[];
export type Setter = (path: Path, value: unknown) => void;
export type PickImage = (opts: { logo?: boolean; onPick: (url: string) => void }) => void;

const LABELS: Record<string, string> = {
  primaryDark: "Primary (hover)", bookingUrl: "Booking link", mapLink: "Map link", formAction: "Form endpoint (e.g. Formspree)",
  invertLogoInFooter: "Make logo white in footer", logoHeight: "Logo height (px)", q: "Question", a: "Answer",
  linkText: "Link text", primaryButton: "Main button", secondaryButton: "Second button", submitText: "Submit button text",
  buttonText: "Button text", bookButtonText: "Header button text", favicon: "Browser tab icon", description: "Description",
  subheadline: "Subheadline", eyebrow: "Small label above title", badge: "Photo badge", perks: "Perks", featured: "Highlight this plan",
  paragraphs: "Paragraphs", checklist: "Checklist", detail: "Detail (e.g. treatment)", tiktok: "TikTok",
};
const humanize = (k: string) => LABELS[k] ?? k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
const LONG = /^(description|subheadline|text|quote|a|intro|blurb|legal|address|headline)$/;
const IMAGE = /^(logo|image|photo|favicon)$/;
const POPULAR_FONTS = ["Cormorant Garamond", "Playfair Display", "Lora", "Libre Baskerville", "DM Serif Display", "Marcellus", "Bodoni Moda", "Jost", "Montserrat", "Lato", "Raleway", "Poppins", "Inter", "Nunito Sans", "Work Sans", "Josefin Sans", "Mulish"];

const NEW_ITEMS: Record<string, unknown> = {
  "contact.hours": { days: "Mon – Fri", time: "9:00am – 5:00pm" },
  "stats.items": { number: "", label: "" },
  "services.items": { icon: "sparkle", name: "New treatment", description: "", price: "" },
  "team.members": { name: "New team member", role: "", photo: "" },
  "memberships.plans": { name: "New plan", price: "$", period: "/month", featured: false, badge: "", perks: [] },
  "testimonials.items": { quote: "", name: "", detail: "" },
  "faq.items": { q: "New question?", a: "" },
};
const pathKey = (p: Path) => p.filter((x) => typeof x === "string").join(".");

const itemLabel = (v: unknown, i: number) => {
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const s = o.name || o.label || o.q || o.days || o.quote || o.number;
    if (typeof s === "string" && s.trim()) return s;
  }
  return `Item ${i + 1}`;
};

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <span className="a-switch" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span />
    </span>
  );
}

export function ImageField({ label, value, onChange, pick, logo }: { label: string; value: string; onChange: (v: string) => void; pick: PickImage; logo?: boolean }) {
  return (
    <div className="a-field">
      <span className="a-label">{label}</span>
      <div className="a-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="a-thumb">{value ? <img src={value} alt="" /> : "None"}</div>
        <div className="a-image__controls">
          <input className="a-input" value={value} placeholder="Image URL or /img/file.jpg" onChange={(e) => onChange(e.target.value)} />
          <div className="a-row">
            <button type="button" className="a-btn a-btn--sm" onClick={() => pick({ logo, onPick: onChange })}>Choose from site</button>
            {value && <button type="button" className="a-btn a-btn--sm a-btn--ghost" onClick={() => onChange("")}>Remove</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TextField({ name, value, onChange, label }: { name: string; value: string; onChange: (v: string) => void; label?: string }) {
  const long = LONG.test(name) || value.length > 70;
  return (
    <div className="a-field">
      {label && <label>{label}</label>}
      {long ? (
        <textarea className="a-textarea" value={value} rows={Math.min(8, Math.max(2, Math.ceil(value.length / 52)))} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="a-input" value={value} onChange={(e) => onChange(e.target.value)} list={name === "heading" || name === "body" ? "a-fonts" : undefined} />
      )}
    </div>
  );
}

/** Renders the right input for any value in the settings. */
export function Field({ path, value, set, pick }: { path: Path; value: unknown; set: Setter; pick: PickImage }) {
  const key = String(path[path.length - 1]);
  const label = typeof path[path.length - 1] === "number" ? undefined : humanize(key);

  if (key === "show" || key === "nav") return null;
  if (value === undefined || value === null) return null;

  if (typeof value === "boolean") {
    return <label className="a-row" style={{ fontSize: 13 }}><Switch checked={value} onChange={(v) => set(path, v)} label={label || key} />{label}</label>;
  }
  if (typeof value === "number") {
    return <div className="a-field"><label>{label}</label><input className="a-input" type="number" value={value} onChange={(e) => set(path, Number(e.target.value))} /></div>;
  }
  if (typeof value === "string") {
    if (IMAGE.test(key)) return <ImageField label={label || "Image"} value={value} onChange={(v) => set(path, v)} pick={pick} logo={key === "logo" || key === "favicon"} />;
    if (key === "icon") {
      return (
        <div className="a-field"><label>Icon</label>
          <select className="a-select" value={value} onChange={(e) => set(path, e.target.value)}>
            {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      );
    }
    return <TextField name={key} label={label} value={value} onChange={(v) => set(path, v)} />;
  }
  if (Array.isArray(value)) return <ListField path={path} value={value} set={set} pick={pick} label={label} />;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const inner = entries.map(([k, v]) => <Field key={k} path={[...path, k]} value={v} set={set} pick={pick} />);
    if (typeof path[path.length - 1] === "number") return <>{inner}</>;
    return (
      <div className="a-field">
        <span className="a-label">{label}</span>
        <div style={{ display: "grid", gap: 10, paddingLeft: 10, borderLeft: "2px solid var(--a-line)" }}>{inner}</div>
      </div>
    );
  }
  return null;
}

function ListField({ path, value, set, pick, label }: { path: Path; value: unknown[]; set: Setter; pick: PickImage; label?: string }) {
  const primitive = value.length ? typeof value[0] !== "object" : !NEW_ITEMS[pathKey(path)];
  const add = () => {
    const template = primitive ? "" : structuredClone(NEW_ITEMS[pathKey(path)] ?? {});
    set(path, [...value, template]);
  };
  const remove = (i: number) => set(path, value.filter((_, j) => j !== i));
  const move = (i: number, d: number) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set(path, next);
  };

  return (
    <div className="a-field">
      <span className="a-label">{label} {value.length > 0 && <span style={{ fontWeight: 400 }}>({value.length})</span>}</span>
      <div className="a-list">
        {value.map((item, i) =>
          primitive ? (
            <div className="a-row" key={i} style={{ alignItems: "flex-start" }}>
              <textarea className="a-textarea" style={{ minHeight: 38 }} rows={Math.max(1, Math.ceil(String(item).length / 55))} value={String(item)} onChange={(e) => set([...path, i], e.target.value)} />
              <button type="button" className="a-icon-btn" onClick={() => remove(i)} aria-label="Remove">✕</button>
            </div>
          ) : (
            <details className="a-item" key={i}>
              <summary>
                <span className="a-item__name">{itemLabel(item, i)}</span>
                <button type="button" className="a-icon-btn" onClick={(e) => { e.preventDefault(); move(i, -1); }} aria-label="Move up">↑</button>
                <button type="button" className="a-icon-btn" onClick={(e) => { e.preventDefault(); move(i, 1); }} aria-label="Move down">↓</button>
                <button type="button" className="a-icon-btn" onClick={(e) => { e.preventDefault(); remove(i); }} aria-label="Remove">✕</button>
              </summary>
              <div className="a-item__body"><Field path={[...path, i]} value={item} set={set} pick={pick} /></div>
            </details>
          ),
        )}
        <button type="button" className="a-btn a-btn--sm" style={{ justifySelf: "start" }} onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

export function ColorFields({ colors, set }: { colors: Record<string, string>; set: Setter }) {
  return (
    <div className="a-colors">
      {Object.entries(colors).map(([k, v]) => (
        <label className="a-color" key={k} title={humanize(k)}>
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(v) ? v : "#000000"} onChange={(e) => set(["colors", k], e.target.value)} />
          <span style={{ display: "grid", minWidth: 0, flex: 1 }}>
            <span>{humanize(k)}</span>
            <input type="text" value={v} onChange={(e) => set(["colors", k], e.target.value)} />
          </span>
        </label>
      ))}
    </div>
  );
}

export function FontList() {
  return <datalist id="a-fonts">{POPULAR_FONTS.map((f) => <option key={f} value={f} />)}</datalist>;
}
