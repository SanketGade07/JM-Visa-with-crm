import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  requireLoggedIn,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/utils/driveAuth";
import { verifySession } from "@/utils/session";
import { restoreCrmSnapshot } from "@/utils/crmBackup";

// POST /api/admin/restore — restore a full CRM snapshot (admin only)
// Body: { id: number, confirm: "RESTORE" }
export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return (await requireLoggedIn(req)) ? forbiddenResponse() : unauthorizedResponse();
    }

    const body = await req.json();
    const snapshotId = Number(body?.id);
    const confirm = typeof body?.confirm === "string" ? body.confirm : "";

    if (!Number.isFinite(snapshotId) || snapshotId <= 0) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    if (confirm !== "RESTORE") {
      return NextResponse.json(
        { error: 'Type RESTORE in confirm to proceed' },
        { status: 400 }
      );
    }

    const token = req.cookies.get("crm_session")?.value ?? "";
    const session = token ? await verifySession(token) : null;

    const result = await restoreCrmSnapshot({
      snapshotId,
      confirm,
      restoredBy: session?.name || session?.email || "admin",
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("POST /api/admin/restore error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Restore failed" },
      { status: 500 }
    );
  }
}
