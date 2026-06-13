"use client";

import React from "react";
import type { DriveItem } from "./driveUtils";
import { DRIVE_STATUS_FOOTER, computeDriveStats } from "./driveUtils";

type DriveStatusFooterProps = {
  items: DriveItem[];
};

export function DriveStatusFooter({ items }: DriveStatusFooterProps) {
  const { files, folders } = computeDriveStats(items);

  return (
    <p className={DRIVE_STATUS_FOOTER}>
      Showing {files} file{files === 1 ? "" : "s"} • {folders} folder
      {folders === 1 ? "" : "s"}
    </p>
  );
}
