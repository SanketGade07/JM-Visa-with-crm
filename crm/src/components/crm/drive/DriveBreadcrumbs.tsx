"use client";

import React from "react";
import { FaChevronRight } from "react-icons/fa";
import type { Breadcrumb } from "./driveUtils";
import {
  DRIVE_BREADCRUMB_ACTIVE,
  DRIVE_BREADCRUMB_INACTIVE,
  DRIVE_BREADCRUMB_SEPARATOR,
} from "./driveUtils";

type DriveBreadcrumbsProps = {
  breadcrumbs: Breadcrumb[];
  onNavigate: (index: number) => void;
};

export function DriveBreadcrumbs({ breadcrumbs, onNavigate }: DriveBreadcrumbsProps) {
  if (breadcrumbs.length === 0) return null;

  return (
    <nav
      aria-label="Drive folder path"
      className="flex items-center flex-wrap gap-1 min-w-0"
    >
      {breadcrumbs.map((crumb, i) => (
        <React.Fragment key={crumb.id}>
          {i > 0 && (
            <FaChevronRight className={DRIVE_BREADCRUMB_SEPARATOR} aria-hidden />
          )}
          <button
            type="button"
            onClick={() => onNavigate(i)}
            title={crumb.name}
            className={`transition-colors truncate max-w-[120px] sm:max-w-[160px] ${
              i === breadcrumbs.length - 1
                ? DRIVE_BREADCRUMB_ACTIVE
                : DRIVE_BREADCRUMB_INACTIVE
            }`}
          >
            {crumb.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}
