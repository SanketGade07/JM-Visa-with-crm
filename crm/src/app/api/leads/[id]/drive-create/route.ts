import { NextRequest, NextResponse } from "next/server";
import { Activity } from "@/context/CrmContext";
import {
  ensureLeadClientFolder,
  isGoogleDriveConfigured,
  validateFolderAccess,
} from "@/lib/googleDrive";
import { appendActivity, readLeads, updateLeadDriveFolderId } from "@/utils/db";
import {
  driveErrorResponse,
  forbiddenResponse,
  getSessionRole,
  requireAdmin,
  unauthorizedResponse,
} from "@/utils/driveAuth";

type Params = { params: Promise<{ id: string }> };

function assertAdmin(req: NextRequest): NextResponse | null {
  const role = requireAdmin(req);
  if (!role) {
    return getSessionRole(req) ? forbiddenResponse() : unauthorizedResponse();
  }
  return null;
}

// POST /api/leads/:id/drive-create — provision per-lead Drive folder under Clients/
export async function POST(req: NextRequest, { params }: Params) {
  const authError = assertAdmin(req);
  if (authError) return authError;

  if (!isGoogleDriveConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google Drive is not configured. Set GOOGLE_OAUTH_* env vars or GOOGLE_SERVICE_ACCOUNT_KEY.",
      },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const leads = await readLeads();
    const lead = leads.find((l) => l.id === id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.driveFolderId) {
      const existing = await validateFolderAccess(lead.driveFolderId);
      return NextResponse.json({
        success: true,
        driveFolderId: existing.folderId,
        folderName: existing.folderName,
      });
    }

    const { folderId, folderName } = await ensureLeadClientFolder(lead.name);

    const ok = await updateLeadDriveFolderId(id, folderId);
    if (!ok) {
      return NextResponse.json({ error: "Failed to save drive folder on lead" }, { status: 500 });
    }

    const activity: Activity = {
      id: `act-${Date.now()}`,
      leadId: id,
      type: "note",
      content: "Drive folder created for lead",
      createdAt: new Date().toISOString(),
      createdBy: "ADMIN",
    };
    await appendActivity(activity);

    return NextResponse.json({
      success: true,
      driveFolderId: folderId,
      folderName,
    });
  } catch (error) {
    return driveErrorResponse(error, "POST /api/leads/[id]/drive-create");
  }
}
