import { NextRequest, NextResponse } from "next/server";
import {
  extractFolderId,
  getRootFolderId,
  isGoogleDriveConfigured,
  validateFolderAccess,
} from "@/lib/googleDrive";
import {
  driveErrorResponse,
  forbiddenResponse,
  requireAdmin,
  requireLoggedIn,
  unauthorizedResponse,
} from "@/utils/driveAuth";
import { getSupabase, isSupabaseConfigured } from "@/utils/supabase";

async function readAllSettings(): Promise<Record<string, string>> {
  const settings: Record<string, string> = {};

  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("app_settings").select("key, value");

    if (error) {
      throw new Error(`Failed to read app settings: ${error.message}`);
    }

    for (const row of data || []) {
      if (row.key && row.value != null) {
        settings[row.key] = row.value;
      }
    }
  }

  const envRoot = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!settings.drive_root_folder_id && envRoot) {
    settings.drive_root_folder_id = extractFolderId(envRoot);
  }

  return settings;
}

// GET /api/settings — read app_settings key-value map
export async function GET(req: NextRequest) {
  if (!requireLoggedIn(req)) {
    return unauthorizedResponse();
  }

  try {
    const settings = await readAllSettings();
    const rootFolderId = await getRootFolderId();

    return NextResponse.json({
      settings,
      drive_root_folder_id: rootFolderId,
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    const message = error instanceof Error ? error.message : "Failed to read settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/settings — validate and save drive_root_folder_id (ADMIN only)
export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return requireLoggedIn(req) ? forbiddenResponse() : unauthorizedResponse();
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const key = body.key as string | undefined;
    const value = body.value as string | undefined;

    if (key !== "drive_root_folder_id") {
      return NextResponse.json(
        { error: 'Only "drive_root_folder_id" can be updated via this endpoint' },
        { status: 400 }
      );
    }

    const isUnlink =
      value == null || (typeof value === "string" && !value.trim());

    if (isUnlink) {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("app_settings")
        .delete()
        .eq("key", "drive_root_folder_id");

      if (error) {
        return NextResponse.json(
          { error: `Failed to clear settings: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        key: "drive_root_folder_id",
        value: null,
      });
    }

    if (!isGoogleDriveConfigured()) {
      return NextResponse.json(
        {
          error:
            "Google Drive is not configured. Set GOOGLE_OAUTH_* env vars before linking a root folder.",
        },
        { status: 503 }
      );
    }

    const validated = await validateFolderAccess(value);
    const cleanId = validated.folderId;

    const supabase = getSupabase();
    const { error } = await supabase.from("app_settings").upsert(
      {
        key: "drive_root_folder_id",
        value: cleanId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      return NextResponse.json(
        { error: `Failed to save settings: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      key: "drive_root_folder_id",
      value: cleanId,
      folderName: validated.folderName,
    });
  } catch (error) {
    return driveErrorResponse(error, "PATCH /api/settings");
  }
}
