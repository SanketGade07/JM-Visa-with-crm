import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./session";

export async function getSessionRole(req: NextRequest): Promise<string | null> {
  const sessionToken = req.cookies.get("crm_session")?.value ?? "";
  const session = sessionToken ? await verifySession(sessionToken) : null;
  return session?.role ?? null;
}

export async function requireLoggedIn(req: NextRequest): Promise<string | null> {
  return getSessionRole(req);
}

export async function requireAdmin(req: NextRequest): Promise<string | null> {
  const role = await getSessionRole(req);
  if (role !== "ADMIN") return null;
  return role;
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse(): NextResponse {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function driveErrorResponse(error: unknown, context?: string): NextResponse {
  const raw = error instanceof Error ? error.message : String(error);
  console.error(context ? `${context}: ${raw}` : raw, error);

  if (raw.includes("invalid_grant")) {
    return NextResponse.json(
      { error: "Refresh token expired — regenerate GOOGLE_OAUTH_REFRESH_TOKEN" },
      { status: 401 }
    );
  }

  if (raw.includes("Access Denied") || raw.includes("Insufficient Permission")) {
    return NextResponse.json(
      {
        error:
          "Access Denied — share this folder with the Storage Owner Gmail as Editor",
      },
      { status: 403 }
    );
  }

  if (raw.includes("No Google credentials")) {
    return NextResponse.json({ error: raw }, { status: 503 });
  }

  if (raw.includes("File not found") || raw.includes("notFound")) {
    return NextResponse.json({ error: "File or folder not found" }, { status: 404 });
  }

  return NextResponse.json({ error: raw || "Drive operation failed" }, { status: 500 });
}
