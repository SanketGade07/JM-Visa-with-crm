import {
  FaFolder,
  FaFile,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import {
  DRIVE_FOLDER_ICON_COLOR,
  DRIVE_ICON_DEFAULT,
  DRIVE_ICON_GOOGLE,
  DRIVE_ICON_IMAGE,
  DRIVE_ICON_PDF,
} from "./driveTheme";

export * from "./driveTheme";

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  isFolder: boolean;
  size: number | null;
  createdTime: string;
  webViewLink: string;
  webContentLink: string | null;
  previewUrl?: string | null;
}

export interface Breadcrumb {
  id: string;
  name: string;
}

export function extractFolderId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return trimmed;
}

export function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function isGoogleApp(mimeType: string): boolean {
  return mimeType.startsWith("application/vnd.google-apps.");
}

export function canInlinePreview(mimeType: string): boolean {
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
}

export function getFileIcon(item: DriveItem): IconType {
  if (item.isFolder) return FaFolder;
  if (item.mimeType === "application/pdf") return FaFilePdf;
  if (item.mimeType.startsWith("image/")) return FaFileImage;
  if (
    item.mimeType.includes("word") ||
    item.mimeType === "application/vnd.google-apps.document"
  )
    return FaFileWord;
  if (
    item.mimeType.includes("spreadsheet") ||
    item.mimeType === "application/vnd.google-apps.spreadsheet"
  )
    return FaFileExcel;
  return FaFile;
}

export function getFileIconColor(item: DriveItem): string {
  if (item.isFolder) return DRIVE_FOLDER_ICON_COLOR;
  if (isGoogleApp(item.mimeType)) return DRIVE_ICON_GOOGLE;
  if (item.mimeType === "application/pdf") return DRIVE_ICON_PDF;
  if (item.mimeType.startsWith("image/")) return DRIVE_ICON_IMAGE;
  return DRIVE_ICON_DEFAULT;
}

export function getFileTypeLabel(item: DriveItem): string {
  if (item.isFolder) return "DIR";

  const { mimeType, name } = item;

  if (mimeType === "application/vnd.google-apps.document") return "DOC";
  if (mimeType === "application/vnd.google-apps.spreadsheet") return "XLS";
  if (mimeType === "application/vnd.google-apps.presentation") return "PPT";
  if (mimeType === "application/vnd.google-apps.form") return "FORM";
  if (mimeType.startsWith("application/vnd.google-apps.")) return "GDoc";

  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) return "IMG";
  if (mimeType.includes("word") || mimeType.includes("document")) return "DOC";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "XLS";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "PPT";
  if (mimeType.startsWith("video/")) return "VID";
  if (mimeType.startsWith("audio/")) return "AUD";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "ZIP";

  const ext = name.split(".").pop()?.toUpperCase();
  if (ext && ext.length <= 4 && ext !== name.toUpperCase()) return ext;

  return "FILE";
}

export async function parseApiError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export type DriveTypeFilter =
  | "all"
  | "folders"
  | "google-docs"
  | "google-sheets"
  | "google-slides"
  | "images"
  | "pdfs";

export function filterDriveItemsByType(
  items: DriveItem[],
  filter: DriveTypeFilter
): DriveItem[] {
  if (filter === "all") return items;
  if (filter === "folders") return items.filter((item) => item.isFolder);
  if (filter === "google-docs") {
    return items.filter(
      (item) => item.mimeType === "application/vnd.google-apps.document"
    );
  }
  if (filter === "google-sheets") {
    return items.filter(
      (item) => item.mimeType === "application/vnd.google-apps.spreadsheet"
    );
  }
  if (filter === "google-slides") {
    return items.filter(
      (item) => item.mimeType === "application/vnd.google-apps.presentation"
    );
  }
  if (filter === "images") {
    return items.filter((item) => item.mimeType.startsWith("image/"));
  }
  if (filter === "pdfs") {
    return items.filter((item) => item.mimeType === "application/pdf");
  }
  return items;
}

export function filterDriveItems(items: DriveItem[], query: string): DriveItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.name.toLowerCase().includes(q));
}

export function computeDriveStats(items: DriveItem[]) {
  const folders = items.filter((i) => i.isFolder).length;
  const files = items.filter((i) => !i.isFolder).length;
  const totalBytes = items.reduce((acc, i) => acc + (i.size ?? 0), 0);
  return { folders, files, totalBytes };
}
