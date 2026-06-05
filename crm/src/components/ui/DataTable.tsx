import React, { useState } from "react";
import type { IconType } from "react-icons";
import { FiSearch, FiFilter, FiDownload, FiMoreVertical, FiInbox } from "react-icons/fi";

// ──────────────────────────────────────────────────────────────────────────────
// Pixel-faithful "Lead Management" table — theme-aware (light + dark).
// Light = white cards / gray dividers / dark text. Dark = slate cards / soft
// borders / light text. SAME layout, spacing and proportions in both themes
// via Tailwind `dark:` variants (html carries `.light` / `.dark`).
//
// Compact density: 40px header · ~48px rows · tight padding · no oversized gaps.
// Visual only — all render/onClick handlers come from callers, so data, APIs
// and logic are unchanged. One shared component → every table matches.
// ──────────────────────────────────────────────────────────────────────────────

export type Column<T> = {
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  align?: "left" | "right" | "center";
  cellClassName?: string;
  headerClassName?: string;
};

export type RowAction<T> = {
  icon: IconType;
  title: string;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
};

type DataTableProps<T> = {
  title?: React.ReactNode;
  rows: T[];
  getRowId: (row: T) => string;
  columns: Column<T>[];
  actions?: (row: T) => RowAction<T>[];
  actionsHeader?: string;
  onRowClick?: (row: T) => void;
  selectedRowId?: string | null;
  emptyText?: string;
  showToolbar?: boolean;
  showCheckbox?: boolean;
  showIndex?: boolean;
  filters?: React.ReactNode;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onFilter?: () => void;
  onExport?: () => void;
  rightSlot?: React.ReactNode;
  className?: string;
};

const alignClass = (a?: "left" | "right" | "center") =>
  a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

function ToolbarButton({
  icon: Icon,
  title,
  onClick,
}: {
  icon: IconType;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
    >
      <Icon className="text-[14.5px]" />
    </button>
  );
}

// ── Status pill (theme-aware outline badges matching screenshot) ─────────────────────────────
const PILL_MAP: Record<string, string> = {
  "New Lead": "border-blue-500/40 text-blue-600 bg-blue-500/5 dark:border-blue-400/30 dark:text-blue-400 dark:bg-blue-400/5",
  Contacted: "border-emerald-500/40 text-emerald-600 bg-emerald-500/5 dark:border-emerald-400/30 dark:text-emerald-400 dark:bg-emerald-400/5",
  "Follow-Up": "border-orange-500/40 text-orange-600 bg-orange-500/5 dark:border-orange-400/30 dark:text-orange-400 dark:bg-orange-400/5",
  Interested: "border-purple-500/40 text-purple-600 bg-purple-500/5 dark:border-purple-400/30 dark:text-purple-400 dark:bg-purple-400/5",
  "Documents Pending": "border-blue-500/40 text-blue-600 bg-blue-500/5 dark:border-blue-400/30 dark:text-blue-400 dark:bg-blue-400/5",
  "Documents Received": "border-orange-500/40 text-orange-600 bg-orange-500/5 dark:border-orange-400/30 dark:text-orange-400 dark:bg-orange-400/5",
  "Under Verification": "border-orange-500/40 text-orange-600 bg-orange-500/5 dark:border-orange-400/30 dark:text-orange-400 dark:bg-orange-400/5",
  "Ready For Submission": "border-purple-500/40 text-purple-600 bg-purple-500/5 dark:border-purple-400/30 dark:text-purple-400 dark:bg-purple-400/5",
  "Visa Submitted": "border-blue-500/40 text-blue-600 bg-blue-500/5 dark:border-blue-400/30 dark:text-blue-400 dark:bg-blue-400/5",
  "Approved / Rejected": "border-emerald-500/40 text-emerald-600 bg-emerald-500/5 dark:border-emerald-400/30 dark:text-emerald-400 dark:bg-emerald-400/5",
  Closed: "border-slate-400/40 text-slate-500 bg-slate-500/5 dark:border-slate-500/30 dark:text-slate-400 dark:bg-slate-400/5",
  Dropped: "border-rose-500/40 text-rose-600 bg-rose-500/5 dark:border-rose-400/30 dark:text-rose-400 dark:bg-rose-400/5",
};
export const getPillClasses = (status: string) =>
  PILL_MAP[status] ||
  "bg-gray-100 text-gray-500 border-gray-200 dark:bg-slate-700/40 dark:text-slate-400 dark:border-slate-700";

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap ${getPillClasses(
        status
      )}`}
    >
      {status}
    </span>
  );
}

// ── Thin green progress bar (Document Progress column) ─────────────────────────
export function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex items-center gap-2 min-w-[104px]">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${v}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 w-7 text-right tabular-nums">
        {v}%
      </span>
    </div>
  );
}

export default function DataTable<T>({
  title,
  rows,
  getRowId,
  columns,
  actions,
  actionsHeader = "Actions",
  onRowClick,
  selectedRowId,
  emptyText = "No records found.",
  showToolbar = true,
  showCheckbox = true,
  showIndex = true,
  filters,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  onFilter,
  onExport,
  rightSlot,
  className = "",
}: DataTableProps<T>) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allIds = rows.map(getRowId);
  const allChecked = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const toggleAll = () => setSelectedIds(allChecked ? new Set() : new Set(allIds));
  const toggleOne = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const totalCols =
    columns.length + (showCheckbox ? 1 : 0) + (showIndex ? 1 : 0) + (actions ? 1 : 0);

  const cardCls =
    `bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-200/70 dark:border-slate-800 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)] dark:shadow-none ${className}`;

  return (
    <div className={cardCls}>
      {/* ── Toolbar: filters (left) + circular buttons (right) ────────── */}
      {showToolbar && (
        <>
          <div className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0 flex-wrap">{filters}</div>
            <div className="flex items-center gap-2 shrink-0">
              {rightSlot && <div className="mr-1">{rightSlot}</div>}
              {onSearchChange && (searchOpen || (search && search.length > 0)) ? (
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                    <FiSearch className="text-[11px]" />
                  </span>
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onBlur={() => !search && setSearchOpen(false)}
                    placeholder={searchPlaceholder}
                    className="w-44 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-xs pl-8 pr-3 py-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 shadow-sm"
                  />
                </div>
              ) : (
                <ToolbarButton
                  icon={FiSearch}
                  title="Search"
                  onClick={() => (onSearchChange ? setSearchOpen(true) : undefined)}
                />
              )}
              <ToolbarButton icon={FiDownload} title="Export" onClick={onExport} />
              <ToolbarButton icon={FiMoreVertical} title="More" />
            </div>
          </div>
          {title && (
            <div className="px-5 pb-2.5">
              <h3 className="text-[13px] font-bold text-gray-900 dark:text-slate-100">{title}</h3>
            </div>
          )}
        </>
      )}

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 dark:bg-slate-800/30 border-y border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500">
              {showCheckbox && (
                <th className="w-9 pl-5 pr-1 py-2.5">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded border border-gray-200 dark:border-slate-700/50 accent-blue-500 cursor-pointer"
                  />
                </th>
              )}
              {showIndex && (
                <th className="w-8 px-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider">#</th>
              )}
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${alignClass(
                    col.align
                  )} ${col.headerClassName || ""}`}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-right whitespace-nowrap">
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const id = getRowId(row);
              const isSelected = selectedRowId === id;
              const isChecked = selectedIds.has(id);
              const rowActions = actions ? actions(row).filter((a) => !a.hidden?.(row)) : [];
              return (
                <tr
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-gray-100 dark:border-slate-800/60 last:border-0 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${
                    isSelected
                      ? "bg-blue-50/60 dark:bg-blue-500/10"
                      : "hover:bg-gray-50/70 dark:hover:bg-slate-800/30"
                  }`}
                >
                  {showCheckbox && (
                    <td className="pl-5 pr-1 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(id)}
                        className="h-3.5 w-3.5 rounded border border-gray-200 dark:border-slate-700/50 accent-blue-500 cursor-pointer"
                      />
                    </td>
                  )}
                  {showIndex && (
                    <td className="px-1 py-2.5 text-[12px] text-gray-400 dark:text-slate-500 font-medium tabular-nums">
                      {index + 1}
                    </td>
                  )}
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={`px-3 py-2.5 align-middle text-[13px] text-gray-600 dark:text-slate-300 ${alignClass(
                        col.align
                      )} ${col.cellClassName || ""}`}
                    >
                      {col.render(row, index)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-5 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {rowActions.map((action, ai) => {
                          const Icon = action.icon;
                          const disabled = action.disabled?.(row) ?? false;
                          return (
                             <button
                              key={ai}
                              type="button"
                              data-tooltip={action.title}
                              disabled={disabled}
                              onClick={() => action.onClick(row)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Icon className={action.title === "WhatsApp" ? "text-[16px]" : "text-[13.5px]"} />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={totalCols} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-300 dark:text-slate-600">
                    <FiInbox className="text-2xl" />
                    <span className="text-xs font-medium text-gray-400 dark:text-slate-500">{emptyText}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Helper: client-side CSV export (pure browser action, no backend) ───────────
export function exportRowsToCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
