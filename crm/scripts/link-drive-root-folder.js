#!/usr/bin/env node
/**
 * Validates a Google Drive root folder and saves drive_root_folder_id to app_settings.
 * Mirrors the Drive tab → Link Settings → Validate & Link flow.
 *
 * Usage:
 *   npm run drive:link-root
 *   npm run drive:link-root -- <folder-url-or-id>
 *
 * Defaults to GOOGLE_DRIVE_ROOT_FOLDER_ID from .env when no argument is passed.
 */
const path = require("path");

try {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env"), override: true });
} catch {
  // dotenv optional if vars are exported in shell
}

const { google } = require("googleapis");
const { createClient } = require("@supabase/supabase-js");

const FOLDER_MIME = "application/vnd.google-apps.folder";

function extractFolderId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : trimmed;
}

async function validateFolderAccess(drive, folderIdOrUrl) {
  const folderId = extractFolderId(folderIdOrUrl);
  if (!folderId) {
    throw new Error("Folder URL or ID is required");
  }

  const folder = await drive.files.get({
    fileId: folderId,
    fields: "id,name,mimeType,capabilities",
    supportsAllDrives: true,
  });

  if (folder.data.mimeType !== FOLDER_MIME) {
    throw new Error("The provided ID is not a folder");
  }

  if (folder.data.capabilities?.canListChildren === false) {
    throw new Error(
      "Access Denied — share this folder with the Storage Owner Gmail as Editor"
    );
  }

  return {
    folderId: folder.data.id,
    folderName: folder.data.name || "Root folder",
  };
}

async function main() {
  console.log("\n=== Link Drive root folder to app_settings ===\n");

  const rawInput = process.argv[2] || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!rawInput?.trim()) {
    console.error(
      "Missing folder ID. Set GOOGLE_DRIVE_ROOT_FOLDER_ID in .env or pass a folder URL/ID:\n" +
        "  npm run drive:link-root -- <folder-url-or-id>\n"
    );
    process.exit(1);
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error("Missing GOOGLE_OAUTH_* env vars. See GOOGLE_DRIVE_SETUP.md.");
    process.exit(1);
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  let validated;
  try {
    validated = await validateFolderAccess(drive, rawInput);
    console.log(`✓ Validated folder: "${validated.folderName}" (${validated.folderId})`);
  } catch (err) {
    console.error("✗ Validation failed:", err.message || err);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await supabase.from("app_settings").upsert(
    {
      key: "drive_root_folder_id",
      value: validated.folderId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    if (error.message?.includes("app_settings") || error.code === "42P01") {
      console.error(
        "✗ app_settings table missing. Run: npm run drive:migrate-settings\n" +
          `  (${error.message})`
      );
    } else {
      console.error("✗ Failed to save app_settings:", error.message);
    }
    process.exit(1);
  }

  console.log("✓ Saved drive_root_folder_id to app_settings");
  console.log("\nNext: restart the dev server and open the CRM Drive tab.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
