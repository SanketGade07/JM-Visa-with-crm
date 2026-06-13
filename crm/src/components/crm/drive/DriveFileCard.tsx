"use client";

import React from "react";
import { FaEllipsisV } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import type { DriveItem } from "./driveUtils";
import { DriveItemIcon } from "./DriveItemIcon";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_ACTION_BTN,
  DRIVE_FILE_CARD_HEIGHT,
  DRIVE_TEXT_MUTED,
  DRIVE_TEXT_PRIMARY,
  DRIVE_TILE,
  DRIVE_TILE_ACTIVE,
  DRIVE_TILE_FOCUS_RING,
  formatFileSizeCompact,
  formatModifiedRelativeTime,
  getFileExtensionBadge,
} from "./driveUtils";

type DriveFileCardProps = {
  item: DriveItem;
  isActive?: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onItemMenu: (item: DriveItem, e?: React.MouseEvent<HTMLButtonElement>) => void;
};

export function DriveFileCard({
  item,
  isActive = false,
  onClick,
  onContextMenu,
  onItemMenu,
}: DriveFileCardProps) {
  const modifiedIso = item.modifiedTime || item.createdTime;
  const badge = getFileExtensionBadge(item);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative flex flex-col ${DRIVE_FILE_CARD_HEIGHT} w-full min-w-0 overflow-hidden ${
        isActive ? DRIVE_TILE_ACTIVE : DRIVE_TILE
      } ${DRIVE_TILE_FOCUS_RING}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between px-3 pt-3 pb-0 shrink-0">
        <div className="w-12 h-12 shrink-0 flex items-center justify-center">
          <DriveItemIcon item={item} size={48} />
        </div>
        <button
          type="button"
          aria-label={`Actions for ${item.name}`}
          className={`${DRIVE_ACTION_BTN} shrink-0`}
          onClick={(e) => {
            e.stopPropagation();
            onItemMenu(item, e);
          }}
        >
          <FaEllipsisV className="text-[10px]" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-3 pb-3 pt-1.5 min-h-0">
        <p
          className={`text-[13px] font-semibold leading-tight truncate ${
            isActive ? DRIVE_ACCENT_TEXT : DRIVE_TEXT_PRIMARY
          }`}
          title={item.name}
        >
          {item.name}
        </p>

        <div
          className={`flex items-center gap-1.5 min-w-0 text-[11px] leading-tight ${DRIVE_TEXT_MUTED}`}
        >
          <span className={`shrink-0 ${badge.className}`}>{badge.label}</span>
          <span className="truncate">{formatFileSizeCompact(item.size)}</span>
        </div>

        <p
          className={`flex items-center gap-1 text-[11px] truncate leading-tight ${DRIVE_TEXT_MUTED}`}
        >
          <FiClock className="shrink-0 text-[10px]" aria-hidden="true" />
          <span className="truncate">{formatModifiedRelativeTime(modifiedIso)}</span>
        </p>
      </div>
    </div>
  );
}
