/**
 * Drive tab semantic theme tokens — screenshot palette (blue accent, light/dark surfaces).
 */

// ── Surfaces ────────────────────────────────────────────────────────────────

/** Main content area — gray-50 in light, deep navy in dark */
export const DRIVE_CONTENT_BG = "bg-gray-50 dark:bg-[#0a0e1f]";

/** Toolbar strip — same as content in light, deep navy header in dark */
export const DRIVE_TOOLBAR_BG = DRIVE_CONTENT_BG;

/** Grid/list tile cards */
export const DRIVE_TILE_BG = "bg-white dark:bg-[#0a0e1f]";

/** @deprecated Prefer DRIVE_CONTENT_BG — kept for existing imports */
export const DRIVE_SURFACE = DRIVE_CONTENT_BG;

/** Elevated surfaces (table headers, modal sections, empty states) */
export const DRIVE_SURFACE_SECONDARY = DRIVE_TILE_BG;

// ── Borders ─────────────────────────────────────────────────────────────────

export const DRIVE_BORDER = "border-gray-200 dark:border-slate-700/50";

// ── Text ────────────────────────────────────────────────────────────────────

export const DRIVE_TEXT_PRIMARY = "text-slate-800 dark:text-[#EDEDED]";
export const DRIVE_TEXT_SECONDARY = "text-gray-600 dark:text-[#A0A6B0]";
export const DRIVE_TEXT_MUTED = "text-gray-500 dark:text-[#707781]";

// ── Accent (unified blue in light + dark) ───────────────────────────────────

export const DRIVE_ACCENT_TEXT = "text-blue-600 dark:text-blue-400";
export const DRIVE_ACCENT_BG = "bg-blue-600 dark:bg-blue-600";
export const DRIVE_ACCENT_HOVER_BG = "bg-blue-50 dark:bg-blue-500/10";
export const DRIVE_ACCENT_HOVER_BG_CLASS =
  "hover:bg-blue-50 dark:hover:bg-blue-500/10";
export const DRIVE_ACCENT_BORDER = "border-blue-600/40 dark:border-blue-400/40";
export const DRIVE_ACCENT_BORDER_SUBTLE =
  "border-blue-600/20 dark:border-blue-400/20";
export const DRIVE_ACCENT_RING = "ring-blue-600/40 dark:ring-blue-400/40";
export const DRIVE_FOCUS_RING =
  "focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-400/20 focus:border-blue-600/40 dark:focus:border-blue-400/40";

/** Root / linked folder highlight */
export const DRIVE_FOLDER_SPECIAL = "text-amber-600 dark:text-amber-500";

// ── Card wrapper ────────────────────────────────────────────────────────────

export const DRIVE_CARD_CLS =
  "rounded-lg border bg-white dark:bg-[#1A1D26] border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-none";

// ── Buttons ─────────────────────────────────────────────────────────────────

export const DRIVE_BTN_PRIMARY =
  "py-2 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-all flex items-center gap-2 disabled:opacity-40";

export const DRIVE_BTN_SECONDARY =
  "py-2 px-3.5 rounded-lg bg-white dark:bg-[#1A1D26] hover:bg-gray-50 dark:hover:bg-[#22262f] text-slate-800 dark:text-[#EDEDED] font-semibold text-[11px] transition-all flex items-center gap-2 border border-gray-200 dark:border-slate-700/50 disabled:opacity-40";

/** Outlined pill for + New / Filters toolbar actions */
export const DRIVE_OUTLINE_BTN =
  "h-9 px-3 rounded-lg border border-gray-200 dark:border-slate-700/50 bg-white dark:bg-[#0a0e1f] text-slate-800 dark:text-[#EDEDED] text-[12px] font-medium flex items-center gap-2 transition-colors hover:border-blue-600/40 dark:hover:border-blue-400/40 hover:bg-blue-50 dark:hover:bg-blue-500/10";

// ── Icon containers ─────────────────────────────────────────────────────────

/** Refresh, copy link, and other square icon controls */
export const DRIVE_ICON_SQUARE =
  "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-slate-700/50 bg-white dark:bg-[#0a0e1f] text-gray-600 dark:text-[#A0A6B0] hover:text-slate-800 dark:hover:text-[#EDEDED] hover:border-blue-600/40 dark:hover:border-blue-400/40 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0";

export const DRIVE_ICON_SQUARE_ACTIVE =
  "border-blue-600/40 dark:border-blue-400/40 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400";

/** Grid tile icon backgrounds */
export const DRIVE_FOLDER_ICON_BG = "bg-blue-50 dark:bg-blue-500/10";
export const DRIVE_FOLDER_ICON_BORDER = DRIVE_ACCENT_BORDER_SUBTLE;
export const DRIVE_FILE_ICON_BG = "bg-gray-100 dark:bg-slate-800/30";
export const DRIVE_ICON_CONTAINER_LG =
  "w-12 h-12 flex items-center justify-center rounded-lg";
export const DRIVE_ICON_CONTAINER_SM =
  "w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800/30 shrink-0";

// ── File / folder icon colors ───────────────────────────────────────────────

export const DRIVE_FOLDER_ICON_COLOR = "text-blue-600 dark:text-blue-400";
export const DRIVE_ICON_GOOGLE = "text-blue-600 dark:text-blue-400";
export const DRIVE_ICON_PDF = "text-rose-600 dark:text-rose-400";
export const DRIVE_ICON_IMAGE = "text-emerald-600 dark:text-emerald-400";
export const DRIVE_ICON_DEFAULT = "text-gray-500 dark:text-[#707781]";

// ── Layout sections ─────────────────────────────────────────────────────────

export const DRIVE_SECTION_LABEL =
  "text-sm font-semibold text-slate-800 dark:text-[#EDEDED]";

export const DRIVE_TITLE =
  "font-sans text-base font-bold uppercase tracking-wide text-slate-800 dark:text-[#EDEDED]";
export const DRIVE_SUBTITLE = "text-[11px] text-gray-600 dark:text-[#A0A6B0]";

export const DRIVE_TOOLBAR =
  `min-h-[52px] w-full min-w-full shrink-0 px-5 py-3 ${DRIVE_TOOLBAR_BG} border-b border-gray-200 dark:border-slate-700/50`;

/** Main content padding (grid + list bodies) */
export const DRIVE_CONTENT_PADDING = "px-5 pt-4 pb-0";

/** Vertical gap between Folders / Files sections */
export const DRIVE_SECTION_GAP = "space-y-6";

/** Max folders shown before "View all" in the Folders section. */
export const DRIVE_FOLDER_PREVIEW_LIMIT = 6;

/** Max files shown before "View all" in the Files section. */
export const DRIVE_FILE_PREVIEW_LIMIT = 12;

/** Folder row tiles — auto-fill with minimum tile width to avoid clipped metadata. */
export const DRIVE_FOLDER_GRID_LAYOUT =
  "grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3";

/** File tiles — 6 columns on xl per screenshot spec. */
export const DRIVE_FILE_GRID_LAYOUT =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3";

/** @deprecated Use DRIVE_FOLDER_GRID_LAYOUT or DRIVE_FILE_GRID_LAYOUT */
export const DRIVE_GRID_LAYOUT = DRIVE_FILE_GRID_LAYOUT;

// ── Grid tiles ──────────────────────────────────────────────────────────────

export const DRIVE_FILE_CARD_HEIGHT = "h-[150px]";

export const DRIVE_TILE =
  "rounded-[14px] border border-gray-200 dark:border-slate-700/50 bg-white dark:bg-[#0a0e1f] shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-blue-500/10 hover:border-gray-300 dark:hover:border-slate-600/80 transition-colors duration-200 cursor-pointer";

export const DRIVE_TILE_ACTIVE =
  "rounded-[14px] border border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-50 dark:hover:bg-blue-500/15 hover:border-blue-600 dark:hover:border-blue-400 transition-colors duration-200 cursor-pointer";

export const DRIVE_TILE_FOCUS_RING =
  "focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-400/20";

/** Horizontal row card for grid view (icon left, name right) */
export const DRIVE_ROW_TILE =
  "flex items-center gap-3 h-[72px] p-3 rounded-[14px] border border-gray-200 dark:border-slate-700/50 bg-white dark:bg-[#0a0e1f] shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-blue-500/10 hover:border-gray-300 dark:hover:border-slate-600/80 transition-colors duration-200 cursor-pointer";

export const DRIVE_ROW_TILE_ICON =
  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0";

export const DRIVE_ACTION_BTN =
  "p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#2a3040] text-gray-400 dark:text-[#707781] hover:text-slate-600 dark:hover:text-[#EDEDED] transition-colors";

// ── Breadcrumbs ─────────────────────────────────────────────────────────────

export const DRIVE_BREADCRUMB_ACTIVE =
  "text-[13px] font-normal text-blue-600 dark:text-blue-400";

export const DRIVE_BREADCRUMB_INACTIVE =
  "text-[13px] font-normal text-gray-500 dark:text-[#A0A6B0] hover:text-slate-800 dark:hover:text-[#EDEDED] hover:underline";

export const DRIVE_BREADCRUMB_SEPARATOR =
  "text-gray-400 dark:text-slate-600 text-[13px] shrink-0";

// ── List view ───────────────────────────────────────────────────────────────

export const DRIVE_ROW_HOVER = "hover:bg-gray-50 dark:hover:bg-blue-500/10";

export const DRIVE_LIST_HEADER =
  "text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-[#707781]";

export const DRIVE_LIST_ROW = "h-12";

export const DRIVE_LIST_HEADER_ROW = "h-10";

// ── Segmented control (grid / list toggle) ──────────────────────────────────

export const DRIVE_SEGMENT_CONTAINER =
  "h-9 rounded-lg border border-gray-200 dark:border-slate-700/50 bg-white dark:bg-[#0a0e1f] p-0.5 flex items-center";

export const DRIVE_SEGMENT_ACTIVE =
  "h-8 rounded-md bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-wide";

export const DRIVE_SEGMENT_INACTIVE =
  "h-8 w-8 rounded-md text-gray-500 dark:text-[#707781] hover:text-slate-800 dark:hover:text-[#EDEDED]";

// ── Dropdowns & menus ───────────────────────────────────────────────────────

export const DRIVE_DROPDOWN =
  "rounded-lg border border-gray-200 dark:border-slate-700/50 bg-white dark:bg-[#0a0a1a] shadow-sm dark:shadow-none";

export const DRIVE_CONTEXT_MENU = DRIVE_DROPDOWN;

// ── Form inputs ─────────────────────────────────────────────────────────────

export const DRIVE_INPUT =
  "bg-white dark:bg-[#0a0e1f] border border-gray-200 dark:border-slate-700/50 text-slate-800 dark:text-[#EDEDED] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-400/20 focus:border-blue-600/40 dark:focus:border-blue-400/40 placeholder:text-gray-400 dark:placeholder:text-[#707781]";

// ── Drag & drop ─────────────────────────────────────────────────────────────

export const DRIVE_DRAG_OVERLAY =
  "border border-blue-600/30 dark:border-blue-400/30";

export const DRIVE_DRAG_ZONE =
  "ring-2 ring-blue-600/30 dark:ring-blue-400/30 ring-inset bg-blue-50/50 dark:bg-blue-500/5";

// ── Modals ──────────────────────────────────────────────────────────────────

export const DRIVE_MODAL_SURFACE =
  "rounded-lg border bg-white dark:bg-[#1A1D26] border-gray-200 dark:border-slate-700/50";

export const DRIVE_MODAL_BACKDROP = "backdrop-blur-sm";

// ── Admin / alerts ──────────────────────────────────────────────────────────

export const DRIVE_WARNING_BANNER =
  "rounded-lg border border-amber-500/40 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10";

// ── Footer ──────────────────────────────────────────────────────────────────

export const DRIVE_STATUS_FOOTER =
  "text-xs text-center py-4 text-gray-500 dark:text-[#707781]";
