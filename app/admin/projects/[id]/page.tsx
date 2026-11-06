import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Editor } from "@/components/admin/Editor";
import { getProject } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await getProject((await params).id);
  return { title: p ? `${p.config.brand.name} · Site Rebuilder` : "Site Rebuilder" };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const project = await getProject((await params).id);
  if (!project) notFound();
  return <Editor project={project} />;
}
