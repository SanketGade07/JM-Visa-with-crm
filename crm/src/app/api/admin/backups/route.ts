import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  requireLoggedIn,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/utils/driveAuth";
import { listCrmSnapshots, maybeCreateDailySnapshot } from "@/utils/crmBackup";
import { verifySession } from "@/utils/session";

// GET /api/admin/backups — list CRM snapshots (admin only)
// Optional ?ensureDaily=1 triggers a daily snapshot when the newest is older than 20 hours.
export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return (await requireLoggedIn(req)) ? forbiddenResponse() : unauthorizedResponse();
    }

    const ensureDaily = req.nextUrl.searchParams.get("ensureDaily") === "1";
    let daily: { created: boolean; snapshotId?: number } | undefined;

    if (ensureDaily) {
      const token = req.cookies.get("crm_session")?.value ?? "";
      const session = token ? await verifySession(token) : null;
      const result = await maybeCreateDailySnapshot(session?.name || session?.email || "admin");
      daily = {
        created: result.created,
        snapshotId: result.snapshot?.id,
      };
    }

    const snapshots = await listCrmSnapshots(50);
    return NextResponse.json({ snapshots, daily });
  } catch (error) {
    console.error("GET /api/admin/backups error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list backups" },
      { status: 500 }
    );
  }
}
