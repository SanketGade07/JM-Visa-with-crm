import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import { getFile, isGoogleDriveConfigured } from "@/lib/googleDrive";
import {
  driveErrorResponse,
  requireLoggedIn,
  unauthorizedResponse,
} from "@/utils/driveAuth";

// GET /api/drive/view?fileId= — stream file for in-app preview
export async function GET(req: NextRequest) {
  if (!requireLoggedIn(req)) {
    return unauthorizedResponse();
  }

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
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ error: "fileId query parameter is required" }, { status: 400 });
    }

    const { data, mimeType, name } = await getFile(fileId);
    const webStream = Readable.toWeb(data as Readable) as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(name)}"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    return driveErrorResponse(error, "GET /api/drive/view");
  }
}
