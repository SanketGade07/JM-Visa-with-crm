"use client";

import React from "react";
import {
  DRIVE_CONTENT_BG,
  DRIVE_CONTENT_PADDING,
  DRIVE_FILE_PREVIEW_LIMIT,
  DRIVE_FOLDER_PREVIEW_LIMIT,
  DRIVE_SECTION_GAP,
  type DriveItem,
  type DriveTypeFilter,
} from "./driveUtils";
import { DriveListView } from "./DriveListView";
import { DriveSectionHeader } from "./DriveSectionHeader";
import { DriveStatusFooter } from "./DriveStatusFooter";
import { useDriveSectionPreview } from "./useDriveSectionPreview";

type DriveListItemHandlers = {
  activeItemId?: string | null;
  onItemClick: (item: DriveItem) => void;
  onContextMenu: (e: React.MouseEvent, item: DriveItem) => void;
  onItemMenu: (item: DriveItem, e?: React.MouseEvent<HTMLButtonElement>) => void;
};

type DriveListSectionsProps = DriveListItemHandlers & {
  items: DriveItem[];
  typeFilter?: DriveTypeFilter;
};

export function DriveListSections({
  items,
  typeFilter = "all",
  activeItemId,
  onItemClick,
  onContextMenu,
  onItemMenu,
}: DriveListSectionsProps) {
  const handlers: DriveListItemHandlers = {
    activeItemId,
    onItemClick,
    onContextMenu,
    onItemMenu,
  };

  const showSplitSections = typeFilter === "all" || typeFilter === "folders";
  const folders = items.filter((item) => item.isFolder);
  const files = items.filter((item) => !item.isFolder);

  const flatPreview = useDriveSectionPreview(items, DRIVE_FILE_PREVIEW_LIMIT);
  const folderPreview = useDriveSectionPreview(folders, DRIVE_FOLDER_PREVIEW_LIMIT);
  const filePreview = useDriveSectionPreview(files, DRIVE_FILE_PREVIEW_LIMIT);

  if (!showSplitSections) {
    return (
      <div className={`${DRIVE_CONTENT_PADDING} pb-2 ${DRIVE_CONTENT_BG}`}>
        {flatPreview.hasMore ? (
          <DriveSectionHeader
            label="Items"
            totalCount={flatPreview.total}
            expanded={flatPreview.expanded}
            hasMore={flatPreview.hasMore}
            onToggle={flatPreview.toggle}
          />
        ) : null}
        <DriveListView items={flatPreview.visible} showFooter={false} {...handlers} />
        <DriveStatusFooter
          items={items}
          sections={[
            {
              kind: "file",
              visible: flatPreview.visibleCount,
              total: flatPreview.total,
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className={`${DRIVE_CONTENT_PADDING} pb-2 ${DRIVE_CONTENT_BG}`}>
      <div className={DRIVE_SECTION_GAP}>
        {folders.length > 0 ? (
          <section>
            <DriveSectionHeader
              label="Folders"
              totalCount={folderPreview.total}
              expanded={folderPreview.expanded}
              hasMore={folderPreview.hasMore}
              onToggle={folderPreview.toggle}
            />
            <DriveListView
              items={folderPreview.visible}
              showFooter={false}
              showTableHeader
              {...handlers}
            />
          </section>
        ) : null}
        {files.length > 0 ? (
          <section>
            <DriveSectionHeader
              label="Files"
              totalCount={filePreview.total}
              expanded={filePreview.expanded}
              hasMore={filePreview.hasMore}
              onToggle={filePreview.toggle}
            />
            <DriveListView
              items={filePreview.visible}
              showFooter={false}
              showTableHeader
              {...handlers}
            />
          </section>
        ) : null}
      </div>
      <DriveStatusFooter
        items={items}
        sections={[
          {
            kind: "folder",
            visible: folderPreview.visibleCount,
            total: folderPreview.total,
          },
          {
            kind: "file",
            visible: filePreview.visibleCount,
            total: filePreview.total,
          },
        ]}
      />
    </div>
  );
}
