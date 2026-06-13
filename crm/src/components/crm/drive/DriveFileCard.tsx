"use client";

import React from "react";
import { FiClipboard, FiEdit2 } from "react-icons/fi";
import type { DriveItem } from "./driveUtils";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_ACTION_BTN,
  DRIVE_BORDER,
  DRIVE_FILE_ICON_BG,
  DRIVE_SURFACE_SECONDARY,
  DRIVE_TEXT_MUTED,
  DRIVE_TEXT_PRIMARY,
  DRIVE_TILE,
  DRIVE_TILE_ACTIVE,
  DRIVE_TILE_FOCUS_RING,
  formatFileSize,
  getFileIcon,
  getFileIconColor,
  getFileTypeLabel,
} from "./driveUtils";

type DriveFileCardProps = {
  item: DriveItem;
  isActive?: boolean;
  isAdmin?: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onRename?: (item: DriveItem) => void;
  onLink?: (item: DriveItem) => void;
};

export function DriveFileCard({
  item,
  isActive = false,
  isAdmin = false,
  onClick,
  onContextMenu,
  onRename,
  onLink,
}: DriveFileCardProps) {
  const Icon = getFileIcon(item);
  const iconColor = getFileIconColor(item);
  const typeLabel = getFileTypeLabel(item);
  const hasActions =
    (isAdmin && onRename) || (onLink != null && item.webViewLink);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative aspect-square w-full max-w-[148px] flex flex-col overflow-hidden ${
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
      {hasActions ? (
        <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          {isAdmin && onRename && (
            <button
              type="button"
              aria-label={`Rename ${item.name}`}
              className={DRIVE_ACTION_BTN}
              onClick={(e) => {
                e.stopPropagation();
                onRename(item);
              }}
            >
              <FiEdit2 className="text-[13px]" />
            </button>
          )}
          {onLink && item.webViewLink && (
            <button
              type="button"
              aria-label={`Copy link for ${item.name}`}
              className={DRIVE_ACTION_BTN}
              onClick={(e) => {
                e.stopPropagation();
                onLink(item);
              }}
            >
              <FiClipboard className="text-[13px]" />
            </button>
          )}
        </div>
      ) : null}

      <div className="flex-[0.65] flex items-center justify-center px-3 pt-3 pb-1 min-h-0">
        <div className="relative w-[58%] aspect-square">
          <div
            className={`w-full h-full rounded-2xl flex items-center justify-center ${DRIVE_FILE_ICON_BG}`}
          >
            <Icon className={`text-2xl ${iconColor}`} />
          </div>
          <span
            className={`absolute -bottom-1.5 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wide border ${DRIVE_BORDER} ${DRIVE_SURFACE_SECONDARY} ${DRIVE_TEXT_PRIMARY}`}
          >
            {typeLabel}
          </span>
        </div>
      </div>

      <div className={`shrink-0 border-t ${DRIVE_BORDER}`} />

      <div className="flex-[0.35] flex flex-col justify-center px-2.5 py-2 min-h-0">
        <span
          className={`text-[10px] font-semibold uppercase truncate ${
            isActive ? DRIVE_ACCENT_TEXT : DRIVE_TEXT_PRIMARY
          }`}
          title={item.name}
        >
          {item.name}
        </span>
        <span className={`text-[9px] tabular-nums truncate mt-0.5 ${DRIVE_TEXT_MUTED}`}>
          {formatFileSize(item.size)}
        </span>
      </div>
    </div>
  );
}
