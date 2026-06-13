"use client";

import React, { useCallback, useMemo, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import type { DriveItem } from "./driveUtils";
import { DriveItemIcon } from "./DriveItemIcon";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_ACTION_BTN,
  DRIVE_BORDER,
  DRIVE_CONTENT_PADDING,
  DRIVE_LIST_HEADER,
  DRIVE_LIST_HEADER_ROW,
  DRIVE_LIST_ROW,
  DRIVE_ROW_HOVER,
  DRIVE_SURFACE,
  DRIVE_SURFACE_SECONDARY,
  DRIVE_TEXT_PRIMARY,
  DRIVE_TEXT_SECONDARY,
  DRIVE_TILE_ACTIVE,
  formatFileSize,
  formatModifiedRelativeTime,
  getListTypeLabel,
} from "./driveUtils";
import { DriveStatusFooter } from "./DriveStatusFooter";

const CHECKBOX_CLS =
  "h-3.5 w-3.5 rounded border border-gray-300 dark:border-slate-600 accent-blue-600 dark:accent-blue-500 cursor-pointer";

type DriveListViewProps = {
  items: DriveItem[];
  activeItemId?: string | null;
  onItemClick: (item: DriveItem) => void;
  onContextMenu: (e: React.MouseEvent, item: DriveItem) => void;
  onItemMenu: (item: DriveItem, e?: React.MouseEvent<HTMLButtonElement>) => void;
};

export function DriveListView({
  items,
  activeItemId,
  onItemClick,
  onContextMenu,
  onItemMenu,
}: DriveListViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const allIds = useMemo(() => items.map((item) => item.id), [items]);
  const allChecked = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someChecked = allIds.some((id) => selectedIds.has(id));

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (allIds.length > 0 && allIds.every((id) => prev.has(id))) {
        return new Set();
      }
      return new Set(allIds);
    });
  }, [allIds]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  let folderColorIndex = 0;

  return (
    <div className={`${DRIVE_CONTENT_PADDING} pb-2 ${DRIVE_SURFACE}`}>
      <div className="overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className={`sticky top-0 z-10 ${DRIVE_SURFACE_SECONDARY}`}>
            <tr className={`border-b ${DRIVE_BORDER} ${DRIVE_LIST_HEADER_ROW}`}>
              <th className="w-11 px-4">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked && !allChecked;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all items"
                  className={CHECKBOX_CLS}
                />
              </th>
              <th className={`px-4 text-left ${DRIVE_LIST_HEADER}`}>Name</th>
              <th className={`px-4 text-left hidden lg:table-cell ${DRIVE_LIST_HEADER}`}>
                Type
              </th>
              <th className={`px-4 text-left hidden md:table-cell w-24 ${DRIVE_LIST_HEADER}`}>
                Size
              </th>
              <th className={`px-4 text-left hidden sm:table-cell ${DRIVE_LIST_HEADER}`}>
                Modified
              </th>
              <th className="w-11 px-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isActive = activeItemId === item.id;
              const isChecked = selectedIds.has(item.id);
              const modifiedIso = item.modifiedTime || item.createdTime;
              const colorIndex = item.isFolder ? folderColorIndex++ : 0;

              return (
                <tr
                  key={item.id}
                  className={`${DRIVE_LIST_ROW} border-b last:border-b-0 ${DRIVE_BORDER} ${DRIVE_ROW_HOVER} cursor-pointer transition-colors ${
                    isActive ? DRIVE_TILE_ACTIVE : ""
                  }`}
                  onClick={() => onItemClick(item)}
                  onContextMenu={(e) => onContextMenu(e, item)}
                >
                  <td className="px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(item.id)}
                      aria-label={`Select ${item.name}`}
                      className={CHECKBOX_CLS}
                    />
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                        <DriveItemIcon
                          item={item}
                          size={24}
                          folderColorIndex={colorIndex}
                        />
                      </div>
                      <span
                        className={`text-[13px] font-medium truncate ${
                          isActive ? DRIVE_ACCENT_TEXT : DRIVE_TEXT_PRIMARY
                        }`}
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className={`px-4 hidden lg:table-cell ${DRIVE_TEXT_SECONDARY}`}>
                    <span className="text-[12px] truncate block max-w-[220px]">
                      {getListTypeLabel(item)}
                    </span>
                  </td>
                  <td className={`px-4 hidden md:table-cell ${DRIVE_TEXT_SECONDARY}`}>
                    <span className="text-[12px] tabular-nums">
                      {item.isFolder ? "—" : formatFileSize(item.size)}
                    </span>
                  </td>
                  <td className={`px-4 hidden sm:table-cell ${DRIVE_TEXT_SECONDARY}`}>
                    <span className="text-[12px] whitespace-nowrap">
                      {formatModifiedRelativeTime(modifiedIso)}
                    </span>
                  </td>
                  <td className="px-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      aria-label={`Actions for ${item.name}`}
                      className={`${DRIVE_ACTION_BTN} inline-flex items-center justify-center`}
                      onClick={(e) => onItemMenu(item, e)}
                    >
                      <FaEllipsisV className="text-[10px]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <DriveStatusFooter items={items} />
    </div>
  );
}
