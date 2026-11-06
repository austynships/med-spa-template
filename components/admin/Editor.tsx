"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/admin/types";
import { navFor } from "@/lib/nav";
import type { SiteConfig } from "@/lib/site-types";
import { ColorFields, Field, FontList, type Path, type PickImage, Switch } from "./Fields";
import { ScrapedPanel } from "./ScrapedPanel";

type SectionKey = keyof SiteConfig;
const GROUPS: { key: SectionKey; title: string; anchor?: string; toggle?: boolean }[] = [
  { key: "brand", title: "Brand & logo" },
  { key: "colors", title: "Colors" },
  { key: "fonts", title: "Fonts" },
  { key: "contact", title: "Contact, hours & booking" },
  { key: "announcement", title: "Announcement bar", toggle: true },
  { key: "bookButtonText", title: "Header button" },
  { key: "hero", title: "Hero", anchor: "hero" },
  { key: "stats", title: "Stats bar", anchor: "stats", toggle: true },
  { key: "services", title: "Services", anchor: "services", toggle: true },
  { key: "about", title: "About", anchor: "about", toggle: true },
  { key: "team", title: "Team", anchor: "team", toggle: true },
  { key: "memberships", title: "Memberships", anchor: "memberships", toggle: true },
  { key: "testimonials", title: "Testimonials", anchor: "reviews", toggle: true },
  { key: "faq", title: "FAQ", anchor: "faq", toggle: true },
  { key: "cta", title: "Bottom call-to-action", anchor: "cta", toggle: true },
  { key: "contactSection", title: "Contact section", anchor: "contact", toggle: true },
  { key: "footer", title: "Footer" },
];

function setIn<T>(obj: T, path: Path, value: unknown): T {
  const copy = structuredClone(obj) as Record<string | number, unknown>;
  let cur = copy;
  path.slice(0, -1).forEach((k) => { cur = cur[k] as Record<string | number, unknown>; });
  cur[path[path.length - 1]] = value;
  return copy as T;
}

type SaveState = "saved" | "saving" | "unsaved" | "error";
const DEVICES = { desktop: "Desktop", tablet: "Tablet", mobile: "Phone" } as const;

export function Editor({ project }: { project: Project }) {
  const [config, setConfig] = useState(project.config);
  const [scrape, setScrape] = useState(project.scrape);
  const [aiFilledAt, setAiFilledAt] = useState(project.aiFilledAt);
  const [save, setSave] = useState<SaveState>("saved");
  const [tab, setTab] = useState<"content" | "scraped">("content");
  const [device, setDevice] = useState<keyof typeof DEVICES>("desktop");
  const [busy, setBusy] = useState<"" | "ai" | "rescrape">("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [picker, setPicker] = useState<{ logo?: boolean; onPick: (url: string) => void } | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSaved = useRef(JSON.stringify(project.config));

  const notify = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); }, []);
  const send = useCallback((msg: unknown) => frame.current?.contentWindow?.postMessage(msg, window.location.origin), []);

  // Live preview + autosave on every change.
  useEffect(() => {
    send({ type: "site-config", config });
    const json = JSON.stringify(config);
    if (json === lastSaved.current) return;
    setSave("unsaved");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSave("saving");
      try {
        const res = await fetch(`/api/admin/projects/${project.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config }) });
        if (res.ok) lastSaved.current = json;
        setSave(res.ok ? "saved" : "error");
      } catch { setSave("error"); }
    }, 700);
  }, [config, project.id, send]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => { if (e.origin === window.location.origin && e.data?.type === "preview-ready") send({ type: "site-config", config }); };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [config, send]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (save === "unsaved" || save === "saving") e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save]);

  const update = useCallback((next: SiteConfig) => setConfig({ ...next, nav: navFor(next) }), []);
  const set = useCallback((path: Path, value: unknown) => setConfig((c) => { const n = setIn(c, path, value); return { ...n, nav: navFor(n) }; }), []);
  const apply = (fn: (c: SiteConfig) => void, message: string) => { const n = structuredClone(config); fn(n); update(n); notify(message); };
  const pick: PickImage = (opts) => setPicker(opts);

  const runAi = async () => {
    if (aiFilledAt && !confirm("Run Claude again? This replaces the current text with a fresh version. Colors and contact details are kept.")) return;
    setBusy("ai"); setError("");
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/ai`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      lastSaved.current = JSON.stringify(data.config);
      setConfig(data.config); setAiFilledAt(data.aiFilledAt); setSave("saved");
      notify("Claude filled in the site");
    } catch (e) { setError((e as Error).message); } finally { setBusy(""); }
  };

  const rescrape = async (rebuild: boolean) => {
    if (rebuild && !confirm("Start the draft over from the scraped data? Your edits will be replaced.")) return;
    setBusy("rescrape"); setError("");
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/rescrape`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rebuild }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScrape(data.scrape);
      if (rebuild) { lastSaved.current = JSON.stringify(data.config); setConfig(data.config); setAiFilledAt(undefined); setSave("saved"); }
      notify(rebuild ? "Draft rebuilt" : "Scraped data refreshed");
    } catch (e) { setError((e as Error).message); } finally { setBusy(""); }
  };

  const saveLabel = { saved: "All changes saved", saving: "Saving…", unsaved: "Unsaved changes", error: "Couldn't save. Retrying on next edit." }[save];
  const pickerImages = picker?.logo
    ? [...scrape.images.filter((i) => i.source === "logo"), ...scrape.images.filter((i) => i.source !== "logo")]
    : scrape.images.filter((i) => i.source !== "logo");

  return (
    <div className="a-editor">
      <div className="a-bar">
        <Link className="a-btn a-btn--ghost" href="/admin">← Sites</Link>
        <div className="a-bar__title">
          <strong>{config.brand.name}</strong>
          <a href={project.url} target="_blank" rel="noopener">{project.url.replace(/^https?:\/\/(www\.)?/, "")} ↗</a>
        </div>
        <span className="a-save">{saveLabel}</span>
        <button className="a-btn" onClick={() => rescrape(false)} disabled={!!busy}>{busy === "rescrape" ? "Scraping…" : "Re-scrape"}</button>
        <button className="a-btn a-btn--ai" onClick={runAi} disabled={!!busy}>{busy === "ai" ? "Claude is writing…" : aiFilledAt ? "✦ Re-run Claude" : "✦ Auto-fill with Claude"}</button>
        <a className="a-btn a-btn--primary" href={`/api/admin/projects/${project.id}/export`} onClick={() => notify("Preparing zip… photos are being downloaded")}>Download site</a>
      </div>

      <div className="a-body">
        <aside className="a-side">
          <div className="a-tabs" role="tablist">
            <button className="a-tab" role="tab" aria-selected={tab === "content"} onClick={() => setTab("content")}>Content</button>
            <button className="a-tab" role="tab" aria-selected={tab === "scraped"} onClick={() => setTab("scraped")}>Scraped data</button>
          </div>
          <div className="a-scroll">
            {busy === "ai" && <div className="a-note"><div className="a-row"><div className="a-spinner" />Claude is reading {scrape.pages.length} pages and writing the copy. This takes about 1–2 minutes.</div></div>}
            {error && <div className="a-error">{error}</div>}
            {!aiFilledAt && tab === "content" && !busy && (
              <div className="a-note">This draft was filled by simple rules. Click <b>✦ Auto-fill with Claude</b> to sort all the scraped text into sections and polish it.</div>
            )}

            {tab === "content" ? (
              <>
                <FontList />
                {GROUPS.map((g) => {
                  const value = config[g.key] as unknown;
                  const sec = value as { show?: boolean };
                  const on = !g.toggle || sec.show !== false;
                  return (
                    <details className={`a-group${on ? "" : " a-group--off"}`} key={g.key}
                      onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open && g.anchor) send({ type: "scroll-to", id: g.anchor }); }}>
                      <summary>
                        {g.toggle && <Switch checked={on} onChange={(v) => set([g.key, "show"], v)} label={`Show ${g.title}`} />}
                        {g.title}
                        <span className="a-chev">›</span>
                      </summary>
                      <div className="a-group__body">
                        {g.key === "colors"
                          ? <ColorFields colors={config.colors as unknown as Record<string, string>} set={set} />
                          : typeof value === "string"
                            ? <Field path={[g.key]} value={value} set={set} pick={pick} />
                            : Object.entries(value as Record<string, unknown>).map(([k, v]) => <Field key={k} path={[g.key, k]} value={v} set={set} pick={pick} />)}
                      </div>
                    </details>
                  );
                })}
              </>
            ) : (
              <ScrapedPanel scrape={scrape} config={config} apply={apply} notify={notify} onRebuild={() => rescrape(true)} busy={!!busy} />
            )}
          </div>
        </aside>

        <section className="a-stage">
          <div className="a-stage__bar">
            <div className="a-seg">
              {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((d) => (
                <button key={d} aria-pressed={device === d} onClick={() => setDevice(d)}>{DEVICES[d]}</button>
              ))}
            </div>
            <span className="a-muted" style={{ marginLeft: "auto", fontSize: 12.5 }}>Live preview</span>
            <a className="a-btn a-btn--sm" href={`/preview/${project.id}`} target="_blank" rel="noopener">Open in new tab ↗</a>
          </div>
          <div className="a-frame-wrap">
            <iframe
              ref={frame}
              src={`/preview/${project.id}`}
              title="Site preview"
              className={`a-frame${device !== "desktop" ? " a-frame--mobile" : ""}`}
              style={device === "tablet" ? { width: 800 } : undefined}
            />
          </div>
        </section>
      </div>

      {picker && (
        <div className="a-modal" onClick={() => setPicker(null)}>
          <div className="a-modal__box" onClick={(e) => e.stopPropagation()}>
            <div className="a-modal__head">
              <strong>Choose an image from {project.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</strong>
              <button className="a-btn a-btn--sm" onClick={() => setPicker(null)}>Close</button>
            </div>
            <div className="a-modal__grid">
              {pickerImages.length === 0 && <span className="a-muted">No images were found on this site.</span>}
              {pickerImages.map((img) => (
                <button key={img.url} className={`a-pick${img.source === "logo" ? " a-pick--logo" : ""}`} onClick={() => { picker.onPick(img.url); setPicker(null); }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} loading="lazy" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
                  <span>{img.alt || img.url.split("/").pop()?.split("?")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {toast && <div className="a-toast">{toast}</div>}
    </div>
  );
}
