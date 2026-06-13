import type { ComponentType } from "react";
import {
  FluentArchiveIcon,
  FluentAudioIcon,
  FluentExcelIcon,
  FluentFolderIcon,
  FluentGenericFileIcon,
  FluentImageIcon,
  FluentPdfIcon,
  FluentPowerPointIcon,
  FluentTextIcon,
  FluentVideoIcon,
  FluentWordIcon,
  type FluentFolderIconProps,
  type FluentIconProps,
} from "./icons";

export * from "./driveTheme";

export interface DriveItem {
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

const INVALID_FILE_NAME_CHARS = /[/\\:*?"<>|]/;

export function validateNewFileName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Enter a file name";
  if (INVALID_FILE_NAME_CHARS.test(trimmed)) {
    return 'Name cannot contain / \\ : * ? " < > |';
  }
  const dotIndex = trimmed.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === trimmed.length - 1) {
    return "Include an extension (e.g. document.pdf)";
  }
  return null;
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

export function sortDriveItems(items: DriveItem[]): DriveItem[] {
  return [...items].sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatFileSizeCompact(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round(bytes / (1024 * 1024))} MB`;
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

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatDriveDateTime(iso: string): string {
  try {
    const date = new Date(iso);
    const datePart = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart}, ${timePart}`;
  } catch {
    return iso;
  }
}

function formatRelativeTimeWithLabel(
  iso: string,
  label: "Updated" | "Modified"
): string {
  try {
    const date = new Date(iso);
    const now = Date.now();
    const diffMs = now - date.getTime();
    if (diffMs < 0) return `${label} just now`;

    const diffMin = Math.floor(diffMs / 60_000);
    const diffHr = Math.floor(diffMs / 3_600_000);
    const diffDay = Math.floor(diffMs / 86_400_000);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffMin < 1) return `${label} just now`;
    if (diffMin < 60) return `${label} ${diffMin}m ago`;
    if (diffHr < 24) return `${label} ${diffHr}h ago`;
    if (diffDay === 1) return `${label} yesterday`;
    if (diffDay < 7) return `${label} ${diffDay}d ago`;
    if (diffWeek < 4) return `${label} ${diffWeek}w ago`;
    if (diffMonth < 12) return `${label} ${diffMonth}mo ago`;
    return `${label} ${diffYear}y ago`;
  } catch {
    return `${label} recently`;
  }
}

export function formatRelativeTime(iso: string): string {
  return formatRelativeTimeWithLabel(iso, "Updated");
}

export function formatModifiedRelativeTime(iso: string): string {
  return formatRelativeTimeWithLabel(iso, "Modified");
}

type DriveFileKind =
  | "folder"
  | "word"
  | "excel"
  | "powerpoint"
  | "pdf"
  | "image"
  | "text"
  | "archive"
  | "video"
  | "audio"
  | "generic";

function getFileExtension(name: string): string | null {
  const parts = name.split(".");
  if (parts.length < 2) return null;
  const ext = parts.pop()!.toUpperCase();
  if (!ext || ext === name.toUpperCase()) return null;
  return ext;
}

function classifyDriveFile(item: DriveItem): DriveFileKind {
  if (item.isFolder) return "folder";

  const { mimeType, name } = item;
  const ext = getFileExtension(name);

  if (mimeType === "application/vnd.google-apps.document") return "word";
  if (mimeType === "application/vnd.google-apps.spreadsheet") return "excel";
  if (mimeType === "application/vnd.google-apps.presentation") return "powerpoint";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "text/plain" || ext === "TXT") return "text";

  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    ext === "XLS" ||
    ext === "XLSX" ||
    ext === "CSV"
  ) {
    return "excel";
  }
  if (
    mimeType.includes("presentation") ||
    mimeType.includes("powerpoint") ||
    ext === "PPT" ||
    ext === "PPTX"
  ) {
    return "powerpoint";
  }
  if (
    mimeType.includes("word") ||
    mimeType.includes("wordprocessing") ||
    mimeType.includes("document") ||
    ext === "DOC" ||
    ext === "DOCX"
  ) {
    return "word";
  }

  if (
    ext === "ZIP" ||
    ext === "RAR" ||
    ext === "7Z" ||
    mimeType === "application/zip" ||
    mimeType === "application/x-zip-compressed"
  ) {
    return "archive";
  }

  if (ext === "MP4" || ext === "WEBM" || mimeType.startsWith("video/")) {
    return "video";
  }

  if (
    ext === "MP3" ||
    ext === "WAV" ||
    ext === "M4A" ||
    mimeType.startsWith("audio/")
  ) {
    return "audio";
  }

  return "generic";
}

export type FluentIconComponent = ComponentType<FluentIconProps>;

export interface FluentIconResult {
  Icon: FluentIconComponent | ComponentType<FluentFolderIconProps>;
  iconProps?: Partial<FluentFolderIconProps>;
}

const FLUENT_ICON_BY_KIND: Record<
  Exclude<DriveFileKind, "folder">,
  FluentIconComponent
> = {
  word: FluentWordIcon,
  excel: FluentExcelIcon,
  powerpoint: FluentPowerPointIcon,
  pdf: FluentPdfIcon,
  image: FluentImageIcon,
  text: FluentTextIcon,
  archive: FluentArchiveIcon,
  video: FluentVideoIcon,
  audio: FluentAudioIcon,
  generic: FluentGenericFileIcon,
};

export function getFluentFileIcon(
  item: DriveItem,
  folderColorIndex = 0
): FluentIconResult {
  if (item.isFolder) {
    return {
      Icon: FluentFolderIcon,
      iconProps: { colorIndex: ((folderColorIndex % 7) + 7) % 7 },
    };
  }

  const kind = classifyDriveFile(item) as Exclude<DriveFileKind, "folder">;
  return { Icon: FLUENT_ICON_BY_KIND[kind] };
}

export interface FileExtensionBadge {
  label: string;
  className: string;
}

const BADGE_BASE =
  "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide";

function resolveBadgeLabel(
  kind: Exclude<DriveFileKind, "folder" | "generic">,
  ext: string | null,
  mimeType: string
): string {
  if (ext) return ext;

  if (kind === "image" && mimeType.startsWith("image/")) {
    const subtype = mimeType.split("/")[1]?.toUpperCase();
    if (subtype === "JPEG") return "JPG";
    if (subtype) return subtype;
  }

  switch (kind) {
    case "pdf":
      return "PDF";
    case "word":
      return "DOC";
    case "excel":
      return "XLS";
    case "powerpoint":
      return "PPT";
    case "image":
      return "IMG";
    case "text":
      return "TXT";
    case "archive":
      return "ZIP";
    case "video":
      return "VID";
    case "audio":
      return "AUD";
    default:
      return "FILE";
  }
}

const BADGE_COLORS: Record<Exclude<DriveFileKind, "folder" | "generic">, string> =
  {
    word: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    excel: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
    powerpoint:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
    pdf: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    image:
      "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
    text: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300",
    archive:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    video:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
    audio: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  };

export function getFileExtensionBadge(item: DriveItem): FileExtensionBadge {
  if (item.isFolder) {
    return {
      label: "DIR",
      className: `${BADGE_BASE} bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300`,
    };
  }

  const kind = classifyDriveFile(item);
  const ext = getFileExtension(item.name);
  const { mimeType } = item;

  if (mimeType === "application/vnd.google-apps.document") {
    return { label: "DOC", className: `${BADGE_BASE} ${BADGE_COLORS.word}` };
  }
  if (mimeType === "application/vnd.google-apps.spreadsheet") {
    return { label: "XLS", className: `${BADGE_BASE} ${BADGE_COLORS.excel}` };
  }
  if (mimeType === "application/vnd.google-apps.presentation") {
    return {
      label: "PPT",
      className: `${BADGE_BASE} ${BADGE_COLORS.powerpoint}`,
    };
  }
  if (mimeType === "application/vnd.google-apps.form") {
    return {
      label: "FORM",
      className: `${BADGE_BASE} bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300`,
    };
  }
  if (mimeType.startsWith("application/vnd.google-apps.")) {
    return {
      label: "GDOC",
      className: `${BADGE_BASE} bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300`,
    };
  }

  if (kind !== "generic" && kind !== "folder") {
    const label = resolveBadgeLabel(kind, ext, mimeType);
    return {
      label,
      className: `${BADGE_BASE} ${BADGE_COLORS[kind]}`,
    };
  }

  return {
    label: ext ?? "FILE",
    className: `${BADGE_BASE} bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300`,
  };
}

export function getListTypeLabel(item: DriveItem): string {
  if (item.isFolder) return "Folder";

  const { mimeType, name } = item;
  const ext = getFileExtension(name);

  if (mimeType === "application/vnd.google-apps.document") {
    return "Word Document";
  }
  if (mimeType === "application/vnd.google-apps.spreadsheet") {
    return "Excel Spreadsheet";
  }
  if (mimeType === "application/vnd.google-apps.presentation") {
    return "PowerPoint Presentation";
  }
  if (mimeType === "application/vnd.google-apps.form") {
    return "Form";
  }
  if (mimeType.startsWith("application/vnd.google-apps.")) {
    return "Document";
  }

  const kind = classifyDriveFile(item);

  switch (kind) {
    case "pdf":
      return "PDF Document";
    case "word":
      return ext === "DOC" || ext === "DOCX"
        ? "Word Document"
        : `${ext ?? "Word"} Document`;
    case "excel":
      return ext === "XLS" || ext === "XLSX" || ext === "CSV"
        ? `${ext} Spreadsheet`
        : "Spreadsheet";
    case "powerpoint":
      return ext === "PPT" || ext === "PPTX"
        ? "PowerPoint Presentation"
        : "Presentation";
    case "image": {
      const imageExt = ext ?? mimeType.split("/")[1]?.toUpperCase() ?? "IMG";
      return `Image (${imageExt})`;
    }
    case "text":
      return ext ? `${ext} Text File` : "Plain Text";
    case "archive":
      return ext ? `${ext} Archive` : "Archive";
    case "video": {
      const videoExt = ext ?? mimeType.split("/")[1]?.toUpperCase() ?? "VID";
      return `Video (${videoExt})`;
    }
    case "audio": {
      const audioExt = ext ?? mimeType.split("/")[1]?.toUpperCase() ?? "AUD";
      return `Audio (${audioExt})`;
    }
    default:
      return ext ? `${ext} File` : "File";
  }
}

export function isGoogleApp(mimeType: string): boolean {
  return mimeType.startsWith("application/vnd.google-apps.");
}

export function canInlinePreview(mimeType: string): boolean {
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
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

const DRIVE_ITEM_MENU_WIDTH = 168;
const DRIVE_ITEM_MENU_GAP = 4;

/** Position a context menu directly below a kebab/action button. */
export function getDriveItemMenuPosition(
  anchorEl: HTMLElement,
  menuWidth = DRIVE_ITEM_MENU_WIDTH
): { x: number; y: number } {
  const rect = anchorEl.getBoundingClientRect();
  let x = rect.right - menuWidth;
  const y = rect.bottom + DRIVE_ITEM_MENU_GAP;
  x = Math.max(8, Math.min(x, window.innerWidth - menuWidth - 8));
  return { x, y };
}
