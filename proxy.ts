/* Locks the admin panel, its API and draft previews.
   - Running locally (npm run dev): open, no password.
   - Deployed: blocked unless ADMIN_PASSWORD is set, then it asks for that password. */
import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse("Not found", { status: 404 });
  }
  const auth = req.headers.get("authorization") || "";
  const given = auth.startsWith("Basic ") ? atob(auth.slice(6)).split(":").slice(1).join(":") : "";
  if (given === password) return NextResponse.next();
  return new NextResponse("Password required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Site Rebuilder"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/preview/:path*"],
};
