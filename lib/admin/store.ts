/* Saves client projects as JSON files in /data/projects (kept out of git). */
import { promises as fs } from "fs";
import path from "path";
import type { Project, ProjectSummary } from "./types";

const DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "projects");
const safeId = (id: string) => /^[a-z0-9-]+$/.test(id);
const file = (id: string) => path.join(DIR, `${id}.json`);

export async function listProjects(): Promise<ProjectSummary[]> {
  await fs.mkdir(DIR, { recursive: true });
  const names = (await fs.readdir(DIR)).filter((f) => f.endsWith(".json"));
  const projects = await Promise.all(names.map((n) => getProject(n.replace(/\.json$/, ""))));
  return projects
    .filter((p): p is Project => !!p)
    .map((p) => ({
      id: p.id, name: p.name, url: p.url, createdAt: p.createdAt, updatedAt: p.updatedAt, aiFilledAt: p.aiFilledAt,
      logo: p.config.brand.logo, primary: p.config.colors.primary,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(id: string): Promise<Project | null> {
  if (!safeId(id)) return null;
  try {
    return JSON.parse(await fs.readFile(file(id), "utf8")) as Project;
  } catch {
    return null;
  }
}

export async function saveProject(p: Project): Promise<Project> {
  await fs.mkdir(DIR, { recursive: true });
  p.updatedAt = new Date().toISOString();
  await fs.writeFile(file(p.id), JSON.stringify(p, null, 2));
  return p;
}

export async function deleteProject(id: string) {
  if (safeId(id)) await fs.rm(file(id), { force: true });
}

export function newProjectId(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return `${host.slice(0, 40)}-${Math.random().toString(36).slice(2, 7)}`;
}
