"use client";

import type { DriveItem } from "./driveUtils";
import { getFluentFileIcon } from "./driveUtils";

type DriveItemIconProps = {
  item: DriveItem;
  size?: number;
  folderColorIndex?: number;
  className?: string;
};

export function DriveItemIcon({
  item,
  size = 48,
  folderColorIndex = 0,
  className,
}: DriveItemIconProps) {
  const { Icon, iconProps } = getFluentFileIcon(item, folderColorIndex);
  return (
    <Icon
      size={size}
      className={["shrink-0", className].filter(Boolean).join(" ")}
      {...iconProps}
    />
  );
}
