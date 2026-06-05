import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/webhook", "/api/auth"];

// Reads a lightweight session cookie set after login.
// Replace this with NextAuth `auth()` once NextAuth is wired up (guide §7).
function getSessionRole(req: NextRequest): string | null {
  return req.cookies.get("crm_role")?.value ?? null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const role = getSessionRole(req);

  // Unauthenticated — redirect to login for dashboard pages
  if (!role && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based API guards (guide §8.9)
  if (pathname.startsWith("/api/expenses") || pathname.startsWith("/api/reports")) {
    if (role && !["ADMIN", "MANAGER", "ACCOUNT TEAM"].includes(role)) {
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
