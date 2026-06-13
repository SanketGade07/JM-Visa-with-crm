"use client";

import React from "react";
import { FaEllipsisV } from "react-icons/fa";
import type { DriveItem } from "./driveUtils";
import { DriveItemIcon } from "./DriveItemIcon";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_ACTION_BTN,
  DRIVE_ROW_TILE,
  DRIVE_TEXT_MUTED,
  DRIVE_TEXT_PRIMARY,
  DRIVE_TILE_FOCUS_RING,
  formatModifiedRelativeTime,
} from "./driveUtils";

type DriveFolderCardProps = {
  item: DriveItem;
  colorIndex?: number;
  isActive?: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onItemMenu: (item: DriveItem, e?: React.MouseEvent<HTMLButtonElement>) => void;
};

export function DriveFolderCard({
  item,
  colorIndex = 0,
  isActive = false,
  onClick,
  onContextMenu,
  onItemMenu,
}: DriveFolderCardProps) {
  const modifiedIso = item.modifiedTime || item.createdTime;
  const itemCount = item.itemCount ?? 0;

  const tileCls = [
    DRIVE_ROW_TILE,
    DRIVE_TILE_FOCUS_RING,
    isActive &&
      "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-50 dark:hover:bg-blue-500/15 hover:border-blue-600 dark:hover:border-blue-400",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative w-full min-w-0 ${tileCls}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <button
        type="button"
        aria-label={`Actions for ${item.name}`}
        className={`absolute top-2.5 right-2.5 z-10 ${DRIVE_ACTION_BTN}`}
        onClick={(e) => {
          e.stopPropagation();
          onItemMenu(item, e);
        }}
      >
        <FaEllipsisV className="text-[10px]" />
      </button>

      <div className="w-11 h-11 shrink-0 flex items-center justify-center">
        <DriveItemIcon item={item} size={44} folderColorIndex={colorIndex} />
      </div>

      <div className="flex-1 min-w-0 pr-6 flex flex-col justify-center gap-0">
        <p
          className={`text-[13px] font-semibold truncate leading-tight ${
            isActive ? DRIVE_ACCENT_TEXT : DRIVE_TEXT_PRIMARY
          }`}
          title={item.name}
        >
          {item.name}
        </p>
        <p className={`text-[11px] truncate leading-tight ${DRIVE_TEXT_MUTED}`}>
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </p>
        <p className={`text-[11px] truncate leading-tight ${DRIVE_TEXT_MUTED}`}>
          {formatModifiedRelativeTime(modifiedIso)}
        </p>
      </div>
    </div>
  );
}
