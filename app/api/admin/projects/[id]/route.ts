import { NextResponse } from "next/server";
import { deleteProject, getProject, saveProject } from "@/lib/admin/store";
import type { SiteConfig } from "@/lib/site-types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const p = await getProject((await params).id);
  return p ? NextResponse.json(p) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

/** Save edited settings. */
export async function PUT(req: Request, { params }: Ctx) {
  const p = await getProject((await params).id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { config } = (await req.json()) as { config: SiteConfig };
  p.config = config;
  p.name = config.brand.name || p.name;
  await saveProject(p);
  return NextResponse.json({ ok: true, updatedAt: p.updatedAt });
}

export async function DELETE(_: Request, { params }: Ctx) {
  await deleteProject((await params).id);
  return NextResponse.json({ ok: true });
}
