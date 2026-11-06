import Link from "next/link";
import { NewProject, ProjectCard } from "@/components/admin/Dashboard";
import { listProjects } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const projects = await listProjects();
  return (
    <>
      <header className="a-top">
        <Link className="a-brand" href="/admin"><span>✦</span>Site Rebuilder</Link>
        <Link className="a-btn a-btn--ghost" href="/" target="_blank">View template ↗</Link>
      </header>
      <div className="a-wrap">
        <section className="a-hero">
          <h1>Rebuild a med spa website</h1>
          <p>Paste a client&apos;s current website. We&apos;ll pull their logo, photos, text and contact details into your template.</p>
          <NewProject />
        </section>

        <div className="a-section-title">
          <h2>Client sites</h2>
          <span className="a-muted">{projects.length} {projects.length === 1 ? "site" : "sites"}</span>
        </div>
        {projects.length === 0 ? (
          <div className="a-empty">No client sites yet. Paste a website address above to start your first one.</div>
        ) : (
          <div className="a-grid">{projects.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        )}
      </div>
    </>
  );
}
