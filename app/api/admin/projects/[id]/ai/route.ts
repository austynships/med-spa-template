import { NextResponse } from "next/server";
import { aiFill } from "@/lib/admin/ai";
import { getProject, saveProject } from "@/lib/admin/store";

export const maxDuration = 300;

/** Let Claude fill in all the copy from the scraped content. */
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await getProject((await params).id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    p.config = await aiFill(p.scrape, p.config);
    p.name = p.config.brand.name || p.name;
    p.aiFilledAt = new Date().toISOString();
    await saveProject(p);
    return NextResponse.json(p);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
