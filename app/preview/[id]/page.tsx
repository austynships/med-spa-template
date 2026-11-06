import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LivePreview } from "@/components/admin/LivePreview";
import { getProject } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await getProject((await params).id);
  return { title: p ? `Preview: ${p.config.brand.name}` : "Preview", robots: { index: false, follow: false } };
}

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await getProject((await params).id);
  if (!p) notFound();
  return <LivePreview initial={p.config} />;
}
