"use client";

import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import type { Breadcrumb } from "./driveUtils";
import {
  DRIVE_BREADCRUMB_ACTIVE,
  DRIVE_BREADCRUMB_INACTIVE,
  DRIVE_BREADCRUMB_SEPARATOR,
  DRIVE_ICON_SQUARE,
} from "./driveTheme";

const ROOT_LABEL = "JM Visa CRM Files";

type DriveBreadcrumbsProps = {
  breadcrumbs: Breadcrumb[];
  onNavigate: (index: number) => void;
  onBack?: () => void;
};

export function DriveBreadcrumbs({
  breadcrumbs,
  onNavigate,
  onBack,
}: DriveBreadcrumbsProps) {
  if (breadcrumbs.length === 0) return null;

  const childCrumbs = breadcrumbs.slice(1);
  const atRoot = breadcrumbs.length === 1;
  const canGoBack = breadcrumbs.length > 1;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onNavigate(breadcrumbs.length - 2);
    }
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      {canGoBack ? (
        <button
          type="button"
          onClick={handleBack}
          className={DRIVE_ICON_SQUARE}
          title="Go to parent folder"
          aria-label="Go to parent folder"
        >
          <FiChevronLeft className="text-[16px]" aria-hidden />
        </button>
      ) : null}

      <nav
        aria-label="Drive folder path"
        className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 min-w-0"
      >
      <button
        type="button"
        onClick={() => onNavigate(0)}
        title={ROOT_LABEL}
        className={`transition-colors truncate max-w-[180px] ${
          atRoot ? DRIVE_BREADCRUMB_ACTIVE : DRIVE_BREADCRUMB_INACTIVE
        }`}
      >
        {ROOT_LABEL}
      </button>

      {childCrumbs.map((crumb, idx) => {
        const crumbIndex = idx + 1;
        const isLast = crumbIndex === breadcrumbs.length - 1;

        return (
          <React.Fragment key={crumb.id}>
            <span className={DRIVE_BREADCRUMB_SEPARATOR} aria-hidden>
              /
            </span>
            <button
              type="button"
              onClick={() => onNavigate(crumbIndex)}
              title={crumb.name}
              className={`transition-colors truncate max-w-[120px] sm:max-w-[160px] ${
                isLast ? DRIVE_BREADCRUMB_ACTIVE : DRIVE_BREADCRUMB_INACTIVE
              }`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        );
      })}
      </nav>
    </div>
  );
}
