/**
 * Drive tab semantic theme tokens — aligned with CRM violet/blue palette.
 */

// ── Surfaces ────────────────────────────────────────────────────────────────

export const DRIVE_SURFACE = "bg-white dark:bg-slate-900/50";
export const DRIVE_SURFACE_SECONDARY = "bg-gray-50/70 dark:bg-slate-800/30";

// ── Borders ─────────────────────────────────────────────────────────────────

export const DRIVE_BORDER = "border-gray-200/70 dark:border-slate-800";

// ── Text ────────────────────────────────────────────────────────────────────

export const DRIVE_TEXT_PRIMARY = "text-slate-800 dark:text-[#EDEDED]";
export const DRIVE_TEXT_SECONDARY = "text-gray-600 dark:text-[#A0A6B0]";
export const DRIVE_TEXT_MUTED = "text-gray-500 dark:text-[#707781]";

// ── Accent (CRM violet light / blue dark) ───────────────────────────────────

export const DRIVE_ACCENT_TEXT = "text-violet-600 dark:text-blue-400";
export const DRIVE_ACCENT_BG = "bg-violet-600 dark:bg-blue-500";
export const DRIVE_ACCENT_HOVER_BG = "bg-violet-50 dark:bg-violet-600/10";
export const DRIVE_ACCENT_HOVER_BG_CLASS =
  "hover:bg-violet-50 dark:hover:bg-violet-600/10";
export const DRIVE_ACCENT_BORDER = "border-violet-600/40 dark:border-blue-400/40";
export const DRIVE_ACCENT_BORDER_SUBTLE =
  "border-violet-600/20 dark:border-blue-400/20";
export const DRIVE_ACCENT_RING = "ring-violet-600/40 dark:ring-blue-400/40";
export const DRIVE_FOCUS_RING =
  "focus:outline-none focus:ring-2 focus:ring-violet-600/20 dark:focus:ring-blue-400/20 focus:border-violet-600/40 dark:focus:border-blue-400/40";

/** Root / linked folder highlight */
export const DRIVE_FOLDER_SPECIAL = "text-amber-600 dark:text-amber-500";

// ── Card wrapper ────────────────────────────────────────────────────────────

export const DRIVE_CARD_CLS =
  "rounded-2xl border bg-white dark:bg-slate-900/50 border-gray-200/70 dark:border-slate-800 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)] dark:shadow-none";

// ── Buttons ─────────────────────────────────────────────────────────────────

export const DRIVE_BTN_PRIMARY =
  "py-2 px-3.5 rounded-xl bg-violet-600 dark:bg-blue-500 hover:bg-violet-700 dark:hover:bg-blue-600 text-white font-semibold text-[11px] transition-all flex items-center gap-2 disabled:opacity-40";

export const DRIVE_BTN_SECONDARY =
  "py-2 px-3.5 rounded-xl bg-gray-50/70 dark:bg-slate-800/30 hover:bg-gray-200 dark:hover:bg-slate-800/50 text-slate-800 dark:text-[#EDEDED] font-semibold text-[11px] transition-all flex items-center gap-2 border border-gray-200/70 dark:border-slate-800 disabled:opacity-40";

/** Outlined pill for + NEW / FILTERS toolbar actions (~36px height) */
export const DRIVE_OUTLINE_BTN =
  "min-h-9 py-2 px-3 rounded-xl border border-gray-200/70 dark:border-slate-800 bg-white dark:bg-slate-800/30 text-slate-800 dark:text-[#EDEDED] text-[11px] font-semibold uppercase flex items-center gap-2 transition-colors hover:border-violet-600/40 dark:hover:border-blue-400/40 hover:bg-violet-50 dark:hover:bg-violet-600/10";

// ── Icon containers ─────────────────────────────────────────────────────────

/** Back button, refresh, and other square icon controls */
export const DRIVE_ICON_SQUARE =
  "inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200/70 dark:border-slate-800 bg-white dark:bg-slate-800/30 text-gray-600 dark:text-[#A0A6B0] hover:text-slate-800 dark:hover:text-[#EDEDED] hover:border-violet-600/40 dark:hover:border-blue-400/40 hover:bg-violet-50 dark:hover:bg-violet-600/10 transition-colors shrink-0";

export const DRIVE_ICON_SQUARE_ACTIVE =
  "border-violet-600/40 dark:border-blue-400/40 bg-violet-50 dark:bg-violet-600/10 text-violet-600 dark:text-blue-400";

/** Grid tile icon backgrounds */
export const DRIVE_FOLDER_ICON_BG = "bg-violet-50 dark:bg-blue-500/10";
export const DRIVE_FOLDER_ICON_BORDER = DRIVE_ACCENT_BORDER_SUBTLE;
export const DRIVE_FILE_ICON_BG = "bg-gray-100 dark:bg-slate-800/30";
export const DRIVE_ICON_CONTAINER_LG =
  "w-12 h-12 flex items-center justify-center rounded-xl";
export const DRIVE_ICON_CONTAINER_SM =
  "w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800/30 shrink-0";

// ── File / folder icon colors ───────────────────────────────────────────────

export const DRIVE_FOLDER_ICON_COLOR = "text-violet-600 dark:text-blue-400";
export const DRIVE_ICON_GOOGLE = "text-blue-600 dark:text-blue-400";
export const DRIVE_ICON_PDF = "text-rose-600 dark:text-rose-400";
export const DRIVE_ICON_IMAGE = "text-emerald-600 dark:text-emerald-400";
export const DRIVE_ICON_DEFAULT = "text-gray-500 dark:text-[#707781]";

// ── Layout sections ─────────────────────────────────────────────────────────

export const DRIVE_SECTION_LABEL =
  "font-sans text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#707781]";

export const DRIVE_TITLE =
  "font-sans text-base font-bold uppercase tracking-wide text-slate-800 dark:text-[#EDEDED]";
export const DRIVE_SUBTITLE = "text-[11px] text-gray-600 dark:text-[#A0A6B0]";

export const DRIVE_TOOLBAR =
  "bg-gray-50/70 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800";

// ── Grid tiles ──────────────────────────────────────────────────────────────

export const DRIVE_TILE =
  "rounded-xl border border-gray-200/70 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/50 hover:border-violet-600/40 dark:hover:border-blue-400/30 transition-all cursor-pointer";

export const DRIVE_TILE_ACTIVE =
  "rounded-xl border border-violet-600 dark:border-blue-400 bg-violet-50 dark:bg-violet-600/10";

export const DRIVE_TILE_FOCUS_RING =
  "focus:outline-none focus:ring-2 focus:ring-violet-600/30 dark:focus:ring-blue-400/30";

/** Horizontal row card for grid view (icon left, name right) */
export const DRIVE_ROW_TILE =
  "flex items-center gap-3 h-11 px-3 rounded-xl border border-gray-200/70 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/50 hover:border-violet-600/40 dark:hover:border-blue-400/30 transition-all cursor-pointer";

export const DRIVE_ROW_TILE_ICON =
  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0";

export const DRIVE_ACTION_BTN =
  "p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-slate-800/50 text-[#707781] dark:text-[#A0A6B0] hover:text-violet-600 dark:hover:text-blue-400 transition-colors";

// ── Breadcrumbs ─────────────────────────────────────────────────────────────

export const DRIVE_BREADCRUMB_ACTIVE =
  "text-sm font-medium text-violet-600 dark:text-blue-400";

export const DRIVE_BREADCRUMB_INACTIVE =
  "text-sm font-medium text-gray-500 dark:text-[#A0A6B0] hover:text-slate-800 dark:hover:text-[#EDEDED] hover:underline";

export const DRIVE_BREADCRUMB_SEPARATOR =
  "text-gray-300 dark:text-slate-800 text-[9px] shrink-0";

// ── List view ───────────────────────────────────────────────────────────────

export const DRIVE_ROW_HOVER = "hover:bg-violet-50 dark:hover:bg-slate-800/30";

// ── Segmented control (grid / list toggle) ──────────────────────────────────

export const DRIVE_SEGMENT_CONTAINER =
  "rounded-xl border border-gray-200/70 dark:border-slate-800 bg-white dark:bg-slate-800/30 p-0.5 flex";

export const DRIVE_SEGMENT_ACTIVE =
  "rounded-lg bg-violet-600 dark:bg-blue-500 text-white font-semibold";

export const DRIVE_SEGMENT_INACTIVE =
  "rounded-lg text-gray-600 dark:text-[#A0A6B0] hover:text-slate-800 dark:hover:text-[#EDEDED] font-semibold";

// ── Dropdowns & menus ───────────────────────────────────────────────────────

export const DRIVE_DROPDOWN =
  "rounded-xl border border-gray-200/70 dark:border-slate-800 bg-white dark:bg-slate-800/30 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-none";

export const DRIVE_CONTEXT_MENU = DRIVE_DROPDOWN;

// ── Form inputs ─────────────────────────────────────────────────────────────

export const DRIVE_INPUT =
  "bg-white dark:bg-slate-900/50 border border-gray-200/70 dark:border-slate-800 text-slate-800 dark:text-[#EDEDED] rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600/20 dark:focus:ring-blue-400/20 focus:border-violet-600/40 dark:focus:border-blue-400/40 placeholder:text-gray-400 dark:placeholder:text-[#707781]";

// ── Drag & drop ─────────────────────────────────────────────────────────────

export const DRIVE_DRAG_OVERLAY =
  "border border-violet-600/30 dark:border-blue-400/30";

export const DRIVE_DRAG_ZONE =
  "ring-2 ring-violet-600/40 dark:ring-blue-400/40 ring-inset bg-violet-50/50 dark:bg-blue-500/5";

// ── Modals ──────────────────────────────────────────────────────────────────

export const DRIVE_MODAL_SURFACE =
  "rounded-2xl border bg-white dark:bg-slate-900/50 border-gray-200/70 dark:border-slate-800";

export const DRIVE_MODAL_BACKDROP = "backdrop-blur-sm";

// ── Admin / alerts ──────────────────────────────────────────────────────────

export const DRIVE_WARNING_BANNER =
  "rounded-xl border border-amber-500/40 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10";
