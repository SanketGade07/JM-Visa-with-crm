import { PassThrough } from "stream";
import { google, drive_v3 } from "googleapis";
import { getSupabase, isSupabaseConfigured } from "@/utils/supabase";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const CACHE_TTL_MS = 60_000;
const LIST_FIELDS =
  "files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink),nextPageToken";
const COUNT_FIELDS = "files(id),nextPageToken";

const GOOGLE_APP_MIME: Record<GoogleFileType, string> = {
  document: "application/vnd.google-apps.document",
  spreadsheet: "application/vnd.google-apps.spreadsheet",
  presentation: "application/vnd.google-apps.presentation",
  form: "application/vnd.google-apps.form",
};

const GOOGLE_EXPORT_MIME: Record<string, string> = {
  "application/vnd.google-apps.document": "application/pdf",
  "application/vnd.google-apps.spreadsheet": "application/pdf",
  "application/vnd.google-apps.presentation": "application/pdf",
  "application/vnd.google-apps.drawing": "image/png",
};

export type GoogleFileType = "document" | "spreadsheet" | "presentation" | "form";
export type DrivePathFolder = "production" | "distributed";

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  isFolder: boolean;
  size: number | null;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink: string | null;
  itemCount?: number | null;
}

export interface ValidateFolderResult {
  valid: true;
  folderId: string;
  folderName: string;
  subFolders: Array<{ id: string; name: string }>;
}

interface FolderCacheEntry {
  data: DriveFileItem[];
  expiresAt: number;
}

let driveClient: drive_v3.Drive | null = null;
const folderCache = new Map<string, FolderCacheEntry>();

export function isGoogleDriveConfigured(): boolean {
  return Boolean(
    (process.env.GOOGLE_OAUTH_CLIENT_ID &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
      process.env.GOOGLE_OAUTH_REFRESH_TOKEN) ||
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  );
}

export function extractFolderId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return trimmed;
}

function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function normalizeFolderName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mapDriveFile(file: drive_v3.Schema$File): DriveFileItem {
  const mimeType = file.mimeType || "application/octet-stream";
  const createdTime = file.createdTime || new Date().toISOString();
  return {
    id: file.id || "",
    name: file.name || "Untitled",
    mimeType,
    isFolder: mimeType === FOLDER_MIME,
    size: file.size ? Number(file.size) : null,
    createdTime,
    modifiedTime: file.modifiedTime || createdTime,
    webViewLink: file.webViewLink || "",
    webContentLink: file.webContentLink || null,
  };
}

async function countFolderItems(folderId: string): Promise<number> {
  const drive = getDriveClient();
  let count = 0;
  let pageToken: string | undefined;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: COUNT_FIELDS,
      pageSize: 100,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    count += (response.data.files || []).length;
    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);

  return count;
}

async function enrichFolderItemCounts(items: DriveFileItem[]): Promise<void> {
  const folders = items.filter((item) => item.isFolder);
  await Promise.all(
    folders.map(async (folder) => {
      folder.itemCount = await countFolderItems(folder.id);
    })
  );
}

function getGoogleAuth() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    return oauth2;
  }

  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    const credentials = JSON.parse(serviceAccountKey) as {
      client_email: string;
      private_key: string;
    };
    return new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [DRIVE_SCOPE],
    });
  }

  throw new Error(
    "No Google credentials found. Set GOOGLE_OAUTH_* env vars or GOOGLE_SERVICE_ACCOUNT_KEY."
  );
}

export function getDriveClient(): drive_v3.Drive {
  if (!driveClient) {
    driveClient = google.drive({ version: "v3", auth: getGoogleAuth() });
  }
  return driveClient;
}

export function clearDriveCache(folderId?: string): void {
  if (folderId) {
    folderCache.delete(folderId);
    return;
  }
  folderCache.clear();
}

export async function getRootFolderId(): Promise<string | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "drive_root_folder_id")
      .maybeSingle();

    if (!error && data?.value && data.value !== "YOUR_ROOT_FOLDER_ID") {
      return extractFolderId(data.value);
    }
  }

  const envRoot = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (envRoot) {
    return extractFolderId(envRoot);
  }

  return null;
}

export async function validateFolderAccess(
  folderIdOrUrl: string
): Promise<ValidateFolderResult> {
  const folderId = extractFolderId(folderIdOrUrl);
  const drive = getDriveClient();

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

  const subFolders = await listSubFolders(folderId);

  return {
    valid: true,
    folderId,
    folderName: folder.data.name || folderId,
    subFolders: subFolders
      .filter((item) => item.id && item.name)
      .map((item) => ({ id: item.id!, name: item.name! })),
  };
}

export async function listSubFolders(folderId: string): Promise<drive_v3.Schema$File[]> {
  const drive = getDriveClient();
  const folders: drive_v3.Schema$File[] = [];
  let pageToken: string | undefined;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`,
      fields: "files(id,name),nextPageToken",
      pageSize: 100,
      pageToken,
      orderBy: "name",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    folders.push(...(response.data.files || []));
    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);

  return folders;
}

export async function listFolderContents(folderId: string): Promise<DriveFileItem[]> {
  const cached = folderCache.get(folderId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const drive = getDriveClient();
  const items: DriveFileItem[] = [];
  let pageToken: string | undefined;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: LIST_FIELDS,
      pageSize: 100,
      pageToken,
      orderBy: "folder,name",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    for (const file of response.data.files || []) {
      items.push(mapDriveFile(file));
    }

    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);

  await enrichFolderItemCounts(items);

  folderCache.set(folderId, {
    data: items,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return items;
}

export async function findFolder(parentId: string, name: string): Promise<string | null> {
  const drive = getDriveClient();
  const response = await drive.files.list({
    q: `'${parentId}' in parents and mimeType='${FOLDER_MIME}' and name='${escapeDriveQueryValue(name)}' and trashed=false`,
    fields: "files(id)",
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return response.data.files?.[0]?.id || null;
}

export async function findFolderFuzzy(parentId: string, name: string): Promise<string | null> {
  const subfolders = await listSubFolders(parentId);
  const normalizedTarget = normalizeFolderName(name);

  const exact = subfolders.find((folder) => folder.name === name);
  if (exact?.id) return exact.id;

  const normalizedMatch = subfolders.find(
    (folder) => normalizeFolderName(folder.name || "") === normalizedTarget
  );
  if (normalizedMatch?.id) return normalizedMatch.id;

  const partialMatch = subfolders.find((folder) => {
    const normalizedName = normalizeFolderName(folder.name || "");
    return (
      normalizedName.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedName)
    );
  });

  return partialMatch?.id || null;
}

export async function createFolder(parentId: string, name: string): Promise<string> {
  const drive = getDriveClient();
  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: FOLDER_MIME,
      parents: [parentId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  clearDriveCache(parentId);

  if (!response.data.id) {
    throw new Error("Failed to create folder in Google Drive");
  }

  return response.data.id;
}

export async function getOrCreateFolder(parentId: string, name: string): Promise<string> {
  const existingId = await findFolder(parentId, name);
  if (existingId) return existingId;
  return createFolder(parentId, name);
}

export async function ensureFolderPath(
  clientName: string,
  requestTitle: string,
  folder: DrivePathFolder,
  clientFolderId?: string | null
): Promise<string> {
  let baseId: string;

  if (clientFolderId) {
    baseId = clientFolderId;
  } else {
    const rootId = await getRootFolderId();
    if (!rootId) {
      throw new Error("Drive root folder is not configured");
    }
    baseId = await getOrCreateFolder(rootId, clientName);
  }

  const requestFolderId = await getOrCreateFolder(baseId, requestTitle);
  return getOrCreateFolder(requestFolderId, folder);
}

export function inferBlankFileMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "txt":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
}

export async function createBlankFile(
  parentId: string,
  fileName: string
): Promise<{ id: string; webViewLink: string; webContentLink: string | null }> {
  const mimeType = inferBlankFileMimeType(fileName);
  return uploadFileToDrive(parentId, fileName, Buffer.alloc(0), mimeType);
}

export async function uploadFileToDrive(
  folderId: string,
  name: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ id: string; webViewLink: string; webContentLink: string | null }> {
  const drive = getDriveClient();
  const body = new PassThrough();
  body.end(buffer);

  const response = await drive.files.create({
    requestBody: {
      name,
      parents: [folderId],
    },
    media: {
      mimeType,
      body,
    },
    fields: "id,webViewLink,webContentLink",
    supportsAllDrives: true,
  });

  const fileId = response.data.id;
  if (!fileId) {
    throw new Error("Failed to upload file to Google Drive");
  }

  try {
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
      supportsAllDrives: true,
    });
  } catch (error) {
    console.warn("Failed to set public read permission on Drive file:", error);
  }

  clearDriveCache(folderId);

  return {
    id: fileId,
    webViewLink: response.data.webViewLink || "",
    webContentLink: response.data.webContentLink || null,
  };
}

export async function renameFileInDrive(fileId: string, newName: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.update({
    fileId,
    requestBody: { name: newName },
    supportsAllDrives: true,
  });
  clearDriveCache();
}

export async function renameFolderInDrive(folderId: string, newName: string): Promise<void> {
  await renameFileInDrive(folderId, newName);
}

export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.update({
    fileId,
    requestBody: { trashed: true },
    supportsAllDrives: true,
  });
  clearDriveCache();
}

export async function deleteFolderFromDrive(folderId: string): Promise<void> {
  await deleteFileFromDrive(folderId);
}

export async function createGoogleFile(
  parentId: string,
  name: string,
  type: GoogleFileType
): Promise<{ id: string; webViewLink: string }> {
  const drive = getDriveClient();
  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: GOOGLE_APP_MIME[type],
      parents: [parentId],
    },
    fields: "id,webViewLink",
    supportsAllDrives: true,
  });

  clearDriveCache(parentId);

  if (!response.data.id) {
    throw new Error("Failed to create Google Workspace file");
  }

  return {
    id: response.data.id,
    webViewLink: response.data.webViewLink || "",
  };
}

export async function getDriveStorageQuota(): Promise<{
  usageBytes: number;
  limitBytes: number;
}> {
  const drive = getDriveClient();
  const response = await drive.about.get({ fields: "storageQuota" });
  const quota = response.data.storageQuota;

  const usageBytes = Number(quota?.usageInDrive ?? quota?.usage ?? 0);
  const limitBytes = Number(quota?.limit ?? 0);

  return { usageBytes, limitBytes };
}

export async function getFile(fileId: string): Promise<{
  data: NodeJS.ReadableStream;
  mimeType: string;
  name: string;
}> {
  const drive = getDriveClient();

  const meta = await drive.files.get({
    fileId,
    fields: "id,name,mimeType",
    supportsAllDrives: true,
  });

  const mimeType = meta.data.mimeType || "application/octet-stream";
  const name = meta.data.name || fileId;

  if (mimeType.startsWith("application/vnd.google-apps.")) {
    const exportMime = GOOGLE_EXPORT_MIME[mimeType] || "application/pdf";
    const exported = await drive.files.export(
      { fileId, mimeType: exportMime },
      { responseType: "stream" }
    );

    return {
      data: exported.data as NodeJS.ReadableStream,
      mimeType: exportMime,
      name: exportMime === "application/pdf" ? `${name}.pdf` : name,
    };
  }

  const downloaded = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    { responseType: "stream" }
  );

  return {
    data: downloaded.data as NodeJS.ReadableStream,
    mimeType,
    name,
  };
}
