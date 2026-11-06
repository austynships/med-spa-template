import { NextResponse } from "next/server";
import { configFromScrape } from "@/lib/admin/autofill";
import { scrapeSite } from "@/lib/admin/scrape";
import { listProjects, newProjectId, saveProject } from "@/lib/admin/store";

export const maxDuration = 120;

export async function GET() {
  return NextResponse.json(await listProjects());
}

/** Scrape a site and start a new project from it. */
export async function POST(req: Request) {
  const { url } = (await req.json()) as { url?: string };
  if (!url?.trim()) return NextResponse.json({ error: "Enter a website address." }, { status: 400 });
  try {
    const scrape = await scrapeSite(url.trim());
    const config = configFromScrape(scrape);
    const now = new Date().toISOString();
    const project = await saveProject({
      id: newProjectId(scrape.url), name: config.brand.name, url: scrape.url,
      createdAt: now, updatedAt: now, scrape, config,
    });
    return NextResponse.json({ id: project.id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
}
