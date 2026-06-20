"use client";

import React from "react";
import { FiGrid, FiLink, FiList, FiRefreshCw, FiSettings } from "react-icons/fi";
import { DriveBreadcrumbs } from "./DriveBreadcrumbs";
import { DriveFiltersMenu } from "./DriveFiltersMenu";
import { DriveNewMenu } from "./DriveNewMenu";
import { DriveSearchBar } from "./DriveSearchBar";
import type { Breadcrumb, DriveTypeFilter } from "./driveUtils";
import {
  DRIVE_ICON_SQUARE,
  DRIVE_SEGMENT_ACTIVE,
  DRIVE_SEGMENT_CONTAINER,
  DRIVE_SEGMENT_INACTIVE,
  DRIVE_TOOLBAR,
} from "./driveTheme";

export type DriveToolbarProps = {
  breadcrumbs: Breadcrumb[];
  onNavigate: (index: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onRefresh: () => void;
  onCopyFolderLink?: () => void;
  refreshing?: boolean;
  typeFilter: DriveTypeFilter;
  onTypeFilterChange: (filter: DriveTypeFilter) => void;
  isAdmin: boolean;
  isUploading: boolean;
  onUploadClick: () => void;
  onFolderUploadClick?: () => void;
  onNewFolder: () => void;
  onNewFile: () => void;
  onCreateGoogleFile: (type: "document" | "spreadsheet" | "presentation") => void;
  onOpenLinkSettings?: () => void;
  /** Compact layout for CRM header (main Drive tab only). */
  variant?: "header" | "inline";
};

export function DriveToolbar({
  breadcrumbs,
  onNavigate,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  onCopyFolderLink,
  refreshing = false,
  typeFilter,
  onTypeFilterChange,
  isAdmin,
  isUploading,
  onUploadClick,
  onFolderUploadClick,
  onNewFolder,
  onNewFile,
  onCreateGoogleFile,
  onOpenLinkSettings,
  variant = "inline",
}: DriveToolbarProps) {
  const isHeader = variant === "header";
  const wrapperClass = isHeader
    ? "flex w-full min-w-0 items-center"
    : DRIVE_TOOLBAR;

  const gridClass = isHeader
    ? "grid w-full min-w-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(140px,320px)_auto] items-center gap-2 md:gap-3"
    : "grid w-full min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 lg:gap-4";

  return (
    <div className={wrapperClass}>
      <div className={gridClass}>
        {/* Left: breadcrumbs */}
        <div
          className={
            isHeader
              ? "min-w-0 justify-self-start text-left order-1 md:order-none md:col-start-1"
              : "min-w-0 order-1 lg:order-none"
          }
        >
          <DriveBreadcrumbs
            breadcrumbs={breadcrumbs}
            onNavigate={onNavigate}
            onBack={
              breadcrumbs.length > 1
                ? () => onNavigate(breadcrumbs.length - 2)
                : undefined
            }
          />
        </div>

        {/* Center: search */}
        <div
          className={
            isHeader
              ? "flex min-w-0 w-full justify-center order-3 md:order-none md:col-start-2"
              : "flex justify-center order-3 lg:order-none w-full lg:w-auto"
          }
        >
          <DriveSearchBar value={search} onChange={onSearchChange} compact={isHeader} />
        </div>

        {/* Right: actions */}
        <div
          className={
            isHeader
              ? "flex shrink-0 flex-wrap items-center gap-1.5 justify-end justify-self-end order-2 md:order-none md:col-start-3"
              : "flex flex-wrap items-center gap-2 justify-end order-2 lg:order-none"
          }
        >
          {isAdmin && onOpenLinkSettings ? (
            <button
              type="button"
              onClick={onOpenLinkSettings}
              className={DRIVE_ICON_SQUARE}
              title="Drive link settings"
              aria-label="Drive link settings"
            >
              <FiSettings className="text-[14px]" />
            </button>
          ) : null}

          {isAdmin ? (
            <DriveNewMenu
              isUploading={isUploading}
              onNewFolder={onNewFolder}
              onNewFile={onNewFile}
              onUploadClick={onUploadClick}
              onFolderUploadClick={onFolderUploadClick}
              onCreateGoogleFile={onCreateGoogleFile}
              onOpenLinkSettings={onOpenLinkSettings}
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
              className={`flex items-center justify-center gap-1 transition-colors ${
                viewMode === "grid"
                  ? `${DRIVE_SEGMENT_ACTIVE} px-2.5`
                  : DRIVE_SEGMENT_INACTIVE
              }`}
              title="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <FiGrid className="text-[14px]" />
              {viewMode === "grid" ? <span>Grid</span> : null}
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`flex items-center justify-center gap-1 transition-colors ${
                viewMode === "list"
                  ? `${DRIVE_SEGMENT_ACTIVE} px-2.5`
                  : DRIVE_SEGMENT_INACTIVE
              }`}
              title="List view"
              aria-pressed={viewMode === "list"}
            >
              <FiList className="text-[14px]" />
              {viewMode === "list" ? <span>List</span> : null}
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

          {onCopyFolderLink ? (
            <button
              type="button"
              onClick={onCopyFolderLink}
              className={DRIVE_ICON_SQUARE}
              title="Copy folder link"
              aria-label="Copy folder link"
            >
              <FiLink className="text-[14px]" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
