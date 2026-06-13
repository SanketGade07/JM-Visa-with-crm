"use client";

import React from "react";
import { FaChevronLeft, FaFolder } from "react-icons/fa";
import { FiGrid, FiLink, FiList, FiRefreshCw } from "react-icons/fi";
import { DriveBreadcrumbs } from "./DriveBreadcrumbs";
import { DriveFiltersMenu } from "./DriveFiltersMenu";
import { DriveNewMenu } from "./DriveNewMenu";
import type { Breadcrumb, DriveTypeFilter } from "./driveUtils";
import {
  DRIVE_FOLDER_ICON_BG,
  DRIVE_FOLDER_ICON_BORDER,
  DRIVE_FOLDER_ICON_COLOR,
  DRIVE_ICON_SQUARE,
  DRIVE_SEGMENT_ACTIVE,
  DRIVE_SEGMENT_CONTAINER,
  DRIVE_SEGMENT_INACTIVE,
  DRIVE_TOOLBAR,
} from "./driveTheme";

export type DriveToolbarProps = {
  breadcrumbs: Breadcrumb[];
  onNavigate: (index: number) => void;
  onNavigateBack: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onRefresh: () => void;
  refreshing?: boolean;
  typeFilter: DriveTypeFilter;
  onTypeFilterChange: (filter: DriveTypeFilter) => void;
  isAdmin: boolean;
  isUploading: boolean;
  onUploadClick: () => void;
  onFolderUploadClick?: () => void;
  onNewFolder: () => void;
  onCreateGoogleFile: (type: "document" | "spreadsheet" | "presentation") => void;
  onOpenLinkSettings?: () => void;
};

export function DriveToolbar({
  breadcrumbs,
  onNavigate,
  onNavigateBack,
  viewMode,
  onViewModeChange,
  onRefresh,
  refreshing = false,
  typeFilter,
  onTypeFilterChange,
  isAdmin,
  isUploading,
  onUploadClick,
  onFolderUploadClick,
  onNewFolder,
  onCreateGoogleFile,
  onOpenLinkSettings,
}: DriveToolbarProps) {
  const showBack = breadcrumbs.length > 1;

  return (
    <div className={`px-4 py-3 sm:px-5 ${DRIVE_TOOLBAR}`}>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Left: back + folder icon + breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0 flex-1 basis-full sm:basis-auto">
          {showBack ? (
            <button
              type="button"
              onClick={onNavigateBack}
              className={DRIVE_ICON_SQUARE}
              aria-label="Back to parent folder"
            >
              <FaChevronLeft className="text-sm" />
            </button>
          ) : null}

          <div
            className={`w-8 h-8 flex items-center justify-center rounded-xl border shrink-0 ${DRIVE_FOLDER_ICON_BORDER} ${DRIVE_FOLDER_ICON_BG}`}
          >
            <FaFolder className={`text-sm ${DRIVE_FOLDER_ICON_COLOR}`} />
          </div>

          <DriveBreadcrumbs breadcrumbs={breadcrumbs} onNavigate={onNavigate} />
        </div>

        {/* Right: actions */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto sm:flex-nowrap">
          {isAdmin ? (
            <DriveNewMenu
              isUploading={isUploading}
              onNewFolder={onNewFolder}
              onUploadClick={onUploadClick}
              onFolderUploadClick={onFolderUploadClick}
              onCreateGoogleFile={onCreateGoogleFile}
            />
          ) : null}

          <DriveFiltersMenu
            typeFilter={typeFilter}
            onTypeFilterChange={onTypeFilterChange}
          />

          <div className={DRIVE_SEGMENT_CONTAINER} role="group" aria-label="View mode">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`h-9 flex items-center justify-center gap-1.5 transition-colors ${
                viewMode === "grid"
                  ? `${DRIVE_SEGMENT_ACTIVE} px-2.5`
                  : `${DRIVE_SEGMENT_INACTIVE} w-9`
              }`}
              title="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <FiGrid className="text-[14px]" />
              {viewMode === "grid" ? (
                <span className="text-[10px] uppercase tracking-wide">Grid</span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`h-9 flex items-center justify-center gap-1.5 transition-colors ${
                viewMode === "list"
                  ? `${DRIVE_SEGMENT_ACTIVE} px-2.5`
                  : `${DRIVE_SEGMENT_INACTIVE} w-9`
              }`}
              title="List view"
              aria-pressed={viewMode === "list"}
            >
              <FiList className="text-[14px]" />
              {viewMode === "list" ? (
                <span className="text-[10px] uppercase tracking-wide">List</span>
              ) : null}
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className={`${DRIVE_ICON_SQUARE} disabled:opacity-40`}
            title="Refresh"
            aria-label="Refresh folder"
          >
            <FiRefreshCw className={`text-[14px]${refreshing ? " animate-spin" : ""}`} />
          </button>

          {isAdmin && onOpenLinkSettings ? (
            <button
              type="button"
              onClick={onOpenLinkSettings}
              className={DRIVE_ICON_SQUARE}
              title="Link settings"
              aria-label="Drive link settings"
            >
              <FiLink className="text-[14px]" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
