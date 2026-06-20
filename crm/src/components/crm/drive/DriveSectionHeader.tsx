"use client";

import React from "react";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_SECTION_LABEL,
  DRIVE_TEXT_SECONDARY,
} from "./driveUtils";

type DriveSectionHeaderProps = {
  label: string;
  totalCount: number;
  expanded: boolean;
  hasMore: boolean;
  onToggle: () => void;
};

export function DriveSectionHeader({
  label,
  totalCount,
  expanded,
  hasMore,
  onToggle,
}: DriveSectionHeaderProps) {
  const toggleLabel = expanded ? "Show less" : `View all (${totalCount})`;

  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-baseline gap-2 min-w-0">
        <p className={DRIVE_SECTION_LABEL}>{label}</p>
        <span
          className={`text-[11px] font-medium tabular-nums ${DRIVE_TEXT_SECONDARY}`}
          aria-hidden
        >
          {totalCount}
        </span>
      </div>
      {hasMore ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? `Show fewer ${label.toLowerCase()}` : `View all ${totalCount} ${label.toLowerCase()}`}
          className={`shrink-0 text-[12px] font-medium ${DRIVE_ACCENT_TEXT} hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40`}
        >
          {toggleLabel}
        </button>
      ) : null}
    </div>
  );
}
