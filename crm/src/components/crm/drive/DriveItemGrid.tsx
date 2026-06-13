"use client";

import React from "react";
import {
  DRIVE_CONTENT_PADDING,
  DRIVE_FILE_GRID_LAYOUT,
  DRIVE_FOLDER_GRID_LAYOUT,
} from "./driveTheme";
import type { DriveItem } from "./driveUtils";
import { DriveFileCard } from "./DriveFileCard";
import { DriveFolderCard } from "./DriveFolderCard";

type DriveItemGridProps = {
  items: DriveItem[];
  onItemClick: (item: DriveItem) => void;
  onContextMenu: (e: React.MouseEvent, item: DriveItem) => void;
  onItemMenu: (item: DriveItem, e?: React.MouseEvent<HTMLButtonElement>) => void;
  /** When true, omits outer padding (used inside FOLDERS/FILES sections). */
  nested?: boolean;
  activeItemId?: string | null;
};

function gridLayoutForItems(items: DriveItem[]): string {
  const allFolders = items.every((item) => item.isFolder);
  const allFiles = items.every((item) => !item.isFolder);
  if (allFolders) return DRIVE_FOLDER_GRID_LAYOUT;
  if (allFiles) return DRIVE_FILE_GRID_LAYOUT;
  return DRIVE_FILE_GRID_LAYOUT;
}

export function DriveItemGrid({
  items,
  onItemClick,
  onContextMenu,
  onItemMenu,
  nested = false,
  activeItemId,
}: DriveItemGridProps) {
  if (items.length === 0) return null;

  const paddingCls = nested ? "" : `${DRIVE_CONTENT_PADDING} pb-2`;
  const gridCls = gridLayoutForItems(items);

  return (
    <div className={`${gridCls} ${paddingCls}`}>
      {items.map((item, index) => {
        const isActive = activeItemId != null && item.id === activeItemId;

        if (item.isFolder) {
          return (
            <DriveFolderCard
              key={item.id}
              item={item}
              colorIndex={index}
              isActive={isActive}
              onClick={() => onItemClick(item)}
              onContextMenu={(e) => onContextMenu(e, item)}
              onItemMenu={onItemMenu}
            />
          );
        }

        return (
          <DriveFileCard
            key={item.id}
            item={item}
            isActive={isActive}
            onClick={() => onItemClick(item)}
            onContextMenu={(e) => onContextMenu(e, item)}
            onItemMenu={onItemMenu}
          />
        );
      })}
    </div>
  );
}
