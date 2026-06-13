"use client";

import React from "react";
import { FiClipboard, FiEdit2 } from "react-icons/fi";
import type { DriveItem } from "./driveUtils";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_ACTION_BTN,
  DRIVE_FILE_ICON_BG,
  DRIVE_FOLDER_ICON_BG,
  DRIVE_FOLDER_SPECIAL,
  DRIVE_ROW_TILE,
  DRIVE_ROW_TILE_ICON,
  DRIVE_TEXT_PRIMARY,
  DRIVE_TILE_ACTIVE,
  DRIVE_TILE_FOCUS_RING,
  getFileIcon,
  getFileIconColor,
} from "./driveUtils";
import { DriveFileCard } from "./DriveFileCard";

type DriveItemGridProps = {
  items: DriveItem[];
  onItemClick: (item: DriveItem) => void;
  onContextMenu: (e: React.MouseEvent, item: DriveItem) => void;
  /** When true, omits outer padding (used inside FOLDERS/FILES sections). */
  nested?: boolean;
  activeItemId?: string | null;
  /** Linked root folder ID — shown with amber highlight when it appears in the grid. */
  rootFolderId?: string | null;
  isAdmin?: boolean;
  onRename?: (item: DriveItem) => void;
  onLink?: (item: DriveItem) => void;
};

function FolderRowTile({
  item,
  isActive,
  isRootFolder,
  isAdmin,
  onItemClick,
  onContextMenu,
  onRename,
  onLink,
}: {
  item: DriveItem;
  isActive: boolean;
  isRootFolder: boolean;
  isAdmin: boolean;
  onItemClick: (item: DriveItem) => void;
  onContextMenu: (e: React.MouseEvent, item: DriveItem) => void;
  onRename?: (item: DriveItem) => void;
  onLink?: (item: DriveItem) => void;
}) {
  const Icon = getFileIcon(item);
  const iconColor = isRootFolder ? DRIVE_FOLDER_SPECIAL : getFileIconColor(item);
  const hasActions =
    (isAdmin && onRename) || (onLink != null && item.webViewLink);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative w-full min-w-0 ${DRIVE_TILE_FOCUS_RING} ${
        isActive
          ? `${DRIVE_TILE_ACTIVE} flex items-center gap-3 h-11 px-3 cursor-pointer`
          : DRIVE_ROW_TILE
      }`}
      onClick={() => onItemClick(item)}
      onContextMenu={(e) => onContextMenu(e, item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onItemClick(item);
        }
      }}
    >
      <div className={`${DRIVE_ROW_TILE_ICON} ${DRIVE_FOLDER_ICON_BG}`}>
        <Icon className={`text-base ${iconColor}`} />
      </div>

      <span
        className={`text-[11px] font-semibold uppercase truncate flex-1 min-w-0 ${
          isActive ? DRIVE_ACCENT_TEXT : DRIVE_TEXT_PRIMARY
        }`}
      >
        {item.name}
      </span>

      {hasActions ? (
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
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
    </div>
  );
}

export function DriveItemGrid({
  items,
  onItemClick,
  onContextMenu,
  nested = false,
  activeItemId,
  rootFolderId = null,
  isAdmin = false,
  onRename,
  onLink,
}: DriveItemGridProps) {
  if (items.length === 0) return null;

  const folders = items.filter((i) => i.isFolder);
  const files = items.filter((i) => !i.isFolder);
  const paddingCls = nested ? "" : "p-5 pt-2";

  return (
    <div className={`space-y-3 ${paddingCls}`}>
      {folders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {folders.map((item) => (
            <FolderRowTile
              key={item.id}
              item={item}
              isActive={activeItemId != null && item.id === activeItemId}
              isRootFolder={rootFolderId != null && item.id === rootFolderId}
              isAdmin={isAdmin}
              onItemClick={onItemClick}
              onContextMenu={onContextMenu}
              onRename={onRename}
              onLink={onLink}
            />
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {files.map((item) => (
            <DriveFileCard
              key={item.id}
              item={item}
              isActive={activeItemId != null && item.id === activeItemId}
              isAdmin={isAdmin}
              onClick={() => onItemClick(item)}
              onContextMenu={(e) => onContextMenu(e, item)}
              onRename={onRename}
              onLink={onLink}
            />
          ))}
        </div>
      )}
    </div>
  );
}
