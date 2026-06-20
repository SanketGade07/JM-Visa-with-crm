"use client";

import React from "react";
import type { DriveItem } from "./driveUtils";
import { DRIVE_STATUS_FOOTER, computeDriveStats } from "./driveUtils";

export type DriveSectionPreviewStat = {
  kind: "folder" | "file";
  visible: number;
  total: number;
};

type DriveStatusFooterProps = {
  items: DriveItem[];
  sections?: DriveSectionPreviewStat[];
  className?: string;
};

function formatSectionStat({ kind, visible, total }: DriveSectionPreviewStat): string | null {
  if (total <= 0) return null;
  const noun = kind === "folder" ? "folder" : "file";
  const plural = total === 1 ? noun : `${noun}s`;
  if (visible < total) {
    return `${visible} of ${total} ${plural}`;
  }
  return `${total} ${plural}`;
}

export function DriveStatusFooter({ items, sections, className }: DriveStatusFooterProps) {
  const { files, folders } = computeDriveStats(items);

  if (sections?.length) {
    const parts = sections
      .map(formatSectionStat)
      .filter((part): part is string => part != null);
    if (parts.length > 0) {
      return (
        <p className={className ? `${DRIVE_STATUS_FOOTER} ${className}` : DRIVE_STATUS_FOOTER}>
          Showing {parts.join(" • ")}
        </p>
      );
    }
  }

  return (
    <p className={className ? `${DRIVE_STATUS_FOOTER} ${className}` : DRIVE_STATUS_FOOTER}>
      Showing {files} file{files === 1 ? "" : "s"} • {folders} folder
      {folders === 1 ? "" : "s"}
    </p>
  );
}
