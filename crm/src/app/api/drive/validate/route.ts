import { NextRequest, NextResponse } from "next/server";
import { isGoogleDriveConfigured, validateFolderAccess } from "@/lib/googleDrive";
import { driveErrorResponse } from "@/utils/driveAuth";

// POST /api/drive/validate — validate folder URL/ID using server credentials
export async function POST(req: NextRequest) {
  try {
    if (!isGoogleDriveConfigured()) {
      return NextResponse.json(
        {
          error:
            "Google Drive is not configured. Set GOOGLE_OAUTH_* env vars or GOOGLE_SERVICE_ACCOUNT_KEY.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const folderId = body.folderId as string | undefined;

    if (!folderId?.trim()) {
      return NextResponse.json({ error: "folderId is required" }, { status: 400 });
    }

    const result = await validateFolderAccess(folderId);
    return NextResponse.json(result);
  } catch (error) {
    return driveErrorResponse(error, "POST /api/drive/validate");
  }
}
