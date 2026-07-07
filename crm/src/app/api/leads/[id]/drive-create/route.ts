import { NextRequest, NextResponse } from "next/server";
import { provisionLeadDriveFolder } from "@/lib/provisionLeadDriveFolder";
import {
  driveErrorResponse,
  requireLoggedIn,
  unauthorizedResponse,
} from "@/utils/driveAuth";

type Params = { params: Promise<{ id: string }> };

// POST /api/leads/:id/drive-create — provision per-lead Drive folder under Clients/
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await requireLoggedIn(req))) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const result = await provisionLeadDriveFolder(id);

    if (!result.ok) {
      if (result.code === "not_configured") {
        return NextResponse.json(
          {
            error:
              "Google Drive is not configured. Set GOOGLE_OAUTH_* env vars or GOOGLE_SERVICE_ACCOUNT_KEY.",
          },
          { status: 503 }
        );
      }
      if (result.code === "lead_not_found") {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to save drive folder on lead" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      driveFolderId: result.driveFolderId,
      folderName: result.folderName,
    });
  } catch (error) {
    return driveErrorResponse(error, "POST /api/leads/[id]/drive-create");
  }
}
