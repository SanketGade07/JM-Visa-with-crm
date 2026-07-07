import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/utils/session";

const PUBLIC_PATHS = ["/login", "/api/webhook", "/api/auth"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Retrieve and verify session token
  const sessionToken = req.cookies.get("crm_session")?.value ?? "";
  const session = sessionToken ? await verifySession(sessionToken) : null;
  const role = session?.role ?? null;

  // Block unauthenticated requests:
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based API guards (guide §8.9)
  if (pathname.startsWith("/api/expenses") || pathname.startsWith("/api/reports")) {
    if (role && !["ADMIN", "ACCOUNT TEAM"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Full-drive root discovery stays admin-only.
  if (pathname.startsWith("/api/drive/discover")) {
    if (!role || role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Browsing folder contents (GET) is open to any authenticated user: staff with a
  // Drive tab grant need the main Drive view, and counselors need to read their
  // assigned lead's folder even without a Drive grant. Mutations (create/upload/
  // rename/delete) remain admin-only — the Drive UIs only expose them to admins.
  if (pathname.startsWith("/api/drive/browse")) {
    if (req.method !== "GET" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Read-only endpoints — any authenticated user.
  if (
    pathname.startsWith("/api/drive/quota") ||
    pathname.startsWith("/api/drive/view")
  ) {
    if (!role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (pathname.startsWith("/api/settings") && req.method === "PATCH") {
    if (!role || role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, favicon, and any path with a file extension
  // (e.g. logo.webp, world-110m.json) so public static assets aren't redirected.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
