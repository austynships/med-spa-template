"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ProjectSummary } from "@/lib/admin/types";

const STEPS = ["Loading the homepage", "Finding inner pages", "Collecting photos and text", "Reading contact details", "Picking brand colors"];

export function NewProject() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 3500);
    return () => clearInterval(t);
  }, [busy]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setStep(0); setError("");
    try {
      const res = await fetch("/api/admin/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      router.push(`/admin/projects/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="a-new">
      <form onSubmit={submit}>
        <input className="a-input" placeholder="https://their-current-website.com" value={url} onChange={(e) => setUrl(e.target.value)} disabled={busy} autoFocus />
        <button className="a-btn a-btn--primary" disabled={busy || !url.trim()}>{busy ? "Scraping…" : "Scrape site"}</button>
      </form>
      {busy ? (
        <div className="a-progress"><div className="a-spinner" />{STEPS[step]}… this takes 10–40 seconds.</div>
      ) : (
        <div className="a-steps">
          <span><b>1.</b> Scrape their site</span>
          <span><b>2.</b> Auto-fill with Claude</span>
          <span><b>3.</b> Tweak in the live editor</span>
          <span><b>4.</b> Download a ready-to-deploy zip</span>
        </div>
      )}
      {error && <div className="a-error" style={{ marginTop: 12 }}>{error}</div>}
    </div>
  );
}

export function ProjectCard({ project: p }: { project: ProjectSummary }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    if (!confirm(`Delete "${p.name}"? This removes the draft from the admin panel.`)) return;
    setDeleting(true);
    await fetch(`/api/admin/projects/${p.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="a-card">
      <div className="a-card__head" style={{ background: `color-mix(in srgb, ${p.primary} 14%, white)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.logo ? <img src={p.logo} alt="" /> : <div className="a-card__initial" style={{ background: p.primary, width: 56, height: 56, borderRadius: 14, display: "grid", placeItems: "center" }}>{p.name[0]}</div>}
        {p.aiFilledAt && <span className="a-badge" style={{ position: "absolute", top: 10, right: 10 }}>✦ AI filled</span>}
      </div>
      <div className="a-card__body">
        <h3>{p.name}</h3>
        <a href={p.url} target="_blank" rel="noopener">{p.url.replace(/^https?:\/\/(www\.)?/, "")}</a>
        <span className="a-muted" style={{ fontSize: 12 }}>Edited {new Date(p.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
      </div>
      <div className="a-card__foot">
        <Link className="a-btn a-btn--primary" href={`/admin/projects/${p.id}`}>Open editor</Link>
        <a className="a-btn" href={`/api/admin/projects/${p.id}/export`}>Download</a>
        <button className="a-btn a-btn--danger" onClick={remove} disabled={deleting} aria-label="Delete">✕</button>
      </div>
    </div>
  );
}
