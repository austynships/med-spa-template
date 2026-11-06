import { exportProject } from "@/lib/admin/export";
import { getProject } from "@/lib/admin/store";

export const maxDuration = 120;

/** Download the client's site as a ready-to-deploy zip. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await getProject((await params).id);
  if (!p) return new Response("Not found", { status: 404 });
  const { zip, filename } = await exportProject(p);
  return new Response(new Uint8Array(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
