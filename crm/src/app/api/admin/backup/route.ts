import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  requireLoggedIn,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/utils/driveAuth";
import { verifySession } from "@/utils/session";
import { createCrmSnapshot } from "@/utils/crmBackup";

async function getAdminIdentity(req: NextRequest): Promise<{ name: string } | null> {
  if (!(await requireAdmin(req))) return null;
  const token = req.cookies.get("crm_session")?.value ?? "";
  const session = token ? await verifySession(token) : null;
  return { name: session?.name || session?.email || "admin" };
}

// POST /api/admin/backup — create a full CRM snapshot (admin only)
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminIdentity(req);
    if (!admin) {
      return (await requireLoggedIn(req)) ? forbiddenResponse() : unauthorizedResponse();
    }

    let reason: "manual" | "daily" = "manual";
    try {
      const body = await req.json();
      if (body?.reason === "daily") reason = "daily";
    } catch {
      // empty body is fine — default manual
    }

    const snapshot = await createCrmSnapshot({
      reason,
      createdBy: admin.name,
    });

    return NextResponse.json({ success: true, snapshot });
  } catch (error) {
    console.error("POST /api/admin/backup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Backup failed" },
      { status: 500 }
    );
  }
}
