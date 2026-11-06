import { NextResponse } from "next/server";
import { configFromScrape } from "@/lib/admin/autofill";
import { scrapeSite } from "@/lib/admin/scrape";
import { getProject, saveProject } from "@/lib/admin/store";

export const maxDuration = 120;

/** Scrape the site again. With { rebuild: true }, also redo the draft from scratch. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await getProject((await params).id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { rebuild } = (await req.json().catch(() => ({}))) as { rebuild?: boolean };
  try {
    p.scrape = await scrapeSite(p.url);
    if (rebuild) { p.config = configFromScrape(p.scrape); p.aiFilledAt = undefined; }
    await saveProject(p);
    return NextResponse.json(p);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
}
