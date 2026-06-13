import { NextRequest, NextResponse } from "next/server";
import { getDriveStorageQuota, isGoogleDriveConfigured } from "@/lib/googleDrive";
import {
  driveErrorResponse,
  forbiddenResponse,
  getSessionRole,
  requireAdmin,
  unauthorizedResponse,
} from "@/utils/driveAuth";

function formatStorageLabel(bytes: number): string {
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) {
    return `${gb >= 10 ? Math.round(gb) : gb.toFixed(1)} GB`;
  }
  const mb = bytes / 1024 ** 2;
  if (mb >= 1) {
    return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

// GET /api/drive/quota — Google Drive storage usage for the connected account
export async function GET(req: NextRequest) {
  const role = requireAdmin(req);
  if (!role) {
    return getSessionRole(req) ? forbiddenResponse() : unauthorizedResponse();
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
    const { usageBytes, limitBytes } = await getDriveStorageQuota();
    const percent =
      limitBytes > 0 ? Math.min(100, Math.round((usageBytes / limitBytes) * 100)) : 0;

    return NextResponse.json({
      usedBytes: usageBytes,
      limitBytes,
      usedLabel: formatStorageLabel(usageBytes),
      limitLabel: limitBytes > 0 ? formatStorageLabel(limitBytes) : "Unlimited",
      percent,
    });
  } catch (error) {
    return driveErrorResponse(error, "GET /api/drive/quota");
  }
}
