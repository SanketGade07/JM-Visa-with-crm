"use client";

import React, { useMemo } from "react";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { TableViewToggle } from "@/components/crm/ui/TableViewToggle";
import {
  FaUpload,
  FaPlus,
  FaGoogle,
  FaSpinner,
  FaFolder,
  FaExclamationTriangle,
  FaCloudUploadAlt,
  FaEllipsisV,
} from "react-icons/fa";
import { FiGrid, FiList } from "react-icons/fi";
import type { Breadcrumb, DriveItem, DriveTypeFilter } from "./driveUtils";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_BORDER,
  DRIVE_BTN_PRIMARY,
  DRIVE_BTN_SECONDARY,
  DRIVE_CARD_CLS,
  DRIVE_DRAG_OVERLAY,
  DRIVE_DRAG_ZONE,
  DRIVE_DROPDOWN,
  DRIVE_FILE_ICON_BG,
  DRIVE_FOLDER_ICON_BG,
  DRIVE_ROW_HOVER,
  DRIVE_ROW_TILE_ICON,
  DRIVE_SECTION_LABEL,
  DRIVE_SURFACE_SECONDARY,
  DRIVE_TEXT_MUTED,
  DRIVE_TEXT_PRIMARY,
  DRIVE_TEXT_SECONDARY,
  DRIVE_TITLE,
  DRIVE_SUBTITLE,
  formatDate,
  formatFileSize,
  getFileIcon,
  getFileIconColor,
} from "./driveUtils";
import { DriveBreadcrumbs } from "./DriveBreadcrumbs";
import { DriveItemGrid } from "./DriveItemGrid";

type DriveBrowserBodyProps = {
  items: DriveItem[];
  filteredItems: DriveItem[];
  typeFilter?: DriveTypeFilter;
  viewMode: "grid" | "list";
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isUploading: boolean;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onItemClick: (item: DriveItem) => void;
  onContextMenu: (e: React.MouseEvent, item: DriveItem) => void;
  onItemMenu: (item: DriveItem) => void;
  onRefresh: () => void;
  onRename?: (item: DriveItem) => void;
  onLink?: (item: DriveItem) => void;
  activeItemId?: string | null;
  rootFolderId?: string | null;
};

type DriveBrowserEmbeddedProps = DriveBrowserBodyProps & {
  /** Grid/list body only — toolbar and breadcrumbs live in DriveTab. */
  embedded: true;
};

type DriveBrowserStandaloneProps = DriveBrowserBodyProps & {
  embedded?: false;
  breadcrumbs: Breadcrumb[];
  onViewModeChange: (mode: "grid" | "list") => void;
  search: string;
  onSearchChange: (value: string) => void;
  onNavigateBreadcrumb: (index: number) => void;
  onUploadClick: () => void;
  onNewFolder: () => void;
  onCreateGoogleFile: (type: "document" | "spreadsheet" | "presentation") => void;
};

type DriveBrowserProps = DriveBrowserEmbeddedProps | DriveBrowserStandaloneProps;

function DriveGridSections({
  items,
  typeFilter = "all",
  onItemClick,
  onContextMenu,
  isAdmin,
  onRename,
  onLink,
  activeItemId,
  rootFolderId,
}: {
  items: DriveItem[];
  typeFilter?: DriveTypeFilter;
  onItemClick: (item: DriveItem) => void;
  onContextMenu: (e: React.MouseEvent, item: DriveItem) => void;
  isAdmin: boolean;
  onRename?: (item: DriveItem) => void;
  onLink?: (item: DriveItem) => void;
  activeItemId?: string | null;
  rootFolderId?: string | null;
}) {
  const gridProps = {
    onItemClick,
    onContextMenu,
    nested: true,
    isAdmin,
    onRename,
    onLink,
    activeItemId,
    rootFolderId,
  };

  const showSplitSections = typeFilter === "all" || typeFilter === "folders";

  if (!showSplitSections) {
    return (
      <div className="px-5 pt-3 pb-5">
        <DriveItemGrid items={items} {...gridProps} />
      </div>
    );
  }

  const folders = items.filter((i) => i.isFolder);
  const files = items.filter((i) => !i.isFolder);

  return (
    <div className="px-5 pt-3 pb-5 space-y-5">
      {folders.length > 0 && (
        <section>
          <p className={`${DRIVE_SECTION_LABEL} mb-2 px-0.5`}>Folders</p>
          <DriveItemGrid items={folders} {...gridProps} />
        </section>
      )}
      {files.length > 0 && (
        <section>
          <p className={`${DRIVE_SECTION_LABEL} mb-2 px-0.5`}>Files</p>
          <DriveItemGrid items={files} {...gridProps} />
        </section>
      )}
    </div>
  );
}

export function DriveBrowser(props: DriveBrowserProps) {
  const embedded = props.embedded === true;
  const {
    items,
    filteredItems,
    typeFilter = "all",
    viewMode,
    loading,
    error,
    isAdmin,
    isUploading,
    isDragOver,
    onDragOver,
    onDragLeave,
    onDrop,
    onItemClick,
    onContextMenu,
    onItemMenu,
    onRefresh,
    onRename,
    onLink,
    activeItemId,
    rootFolderId = null,
  } = props;

  const breadcrumbs = !embedded ? props.breadcrumbs : [];
  const search = !embedded ? props.search : "";
  const onSearchChange = !embedded ? props.onSearchChange : () => {};
  const onNavigateBreadcrumb = !embedded ? props.onNavigateBreadcrumb : () => {};
  const onViewModeChange = !embedded ? props.onViewModeChange : () => {};
  const onUploadClick = !embedded ? props.onUploadClick : () => {};
  const onNewFolder = !embedded ? props.onNewFolder : () => {};
  const onCreateGoogleFile = !embedded ? props.onCreateGoogleFile : () => {};

  const [googleMenuOpen, setGoogleMenuOpen] = React.useState(false);

  const listColumns = useMemo<Column<DriveItem>[]>(
    () => [
      {
        header: "Name",
        render: (item) => {
          const Icon = getFileIcon(item);
          const iconColor = getFileIconColor(item);
          return (
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`${DRIVE_ROW_TILE_ICON} ${
                  item.isFolder ? DRIVE_FOLDER_ICON_BG : DRIVE_FILE_ICON_BG
                }`}
              >
                <Icon className={`text-sm ${iconColor}`} />
              </div>
              <span className={`font-semibold text-[13px] truncate ${DRIVE_TEXT_PRIMARY}`}>
                {item.name}
              </span>
            </div>
          );
        },
      },
      {
        header: "Modified",
        render: (item) => (
          <span className={`text-[12px] ${DRIVE_TEXT_SECONDARY}`}>
            {formatDate(item.createdTime)}
          </span>
        ),
      },
      {
        header: "Size",
        render: (item) => (
          <span className={`text-[12px] tabular-nums ${DRIVE_TEXT_SECONDARY}`}>
            {item.isFolder ? "—" : formatFileSize(item.size)}
          </span>
        ),
      },
    ],
    []
  );

  const viewToggle = (
    <TableViewToggle
      value={viewMode}
      onChange={onViewModeChange}
      options={[
        { id: "grid", label: "Grid", count: filteredItems.length, icon: FiGrid },
        { id: "list", label: "List", count: filteredItems.length, icon: FiList },
      ]}
    />
  );

  const toolbarRight = isAdmin ? (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onUploadClick}
        disabled={isUploading}
        className={DRIVE_BTN_SECONDARY}
      >
        {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
        Upload
      </button>
      <button type="button" onClick={onNewFolder} className={DRIVE_BTN_PRIMARY}>
        <FaPlus />
        New Folder
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setGoogleMenuOpen((v) => !v)}
          className={DRIVE_BTN_SECONDARY}
        >
          <FaGoogle />
          New
        </button>
        {googleMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setGoogleMenuOpen(false)}
              aria-hidden
            />
            <div className={`absolute right-0 top-full mt-1.5 w-44 py-1 z-20 ${DRIVE_DROPDOWN}`}>
              {(
                [
                  ["document", "Google Doc"],
                  ["spreadsheet", "Google Sheet"],
                  ["presentation", "Google Slides"],
                ] as const
              ).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onCreateGoogleFile(type);
                    setGoogleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs ${DRIVE_TEXT_PRIMARY} ${DRIVE_ROW_HOVER} transition-colors`}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;

  const belowTitle = (
    <div className="px-5 pb-3">
      <DriveBreadcrumbs breadcrumbs={breadcrumbs} onNavigate={onNavigateBreadcrumb} />
    </div>
  );

  const hasActiveFilter = typeFilter !== "all";
  const emptyContent = (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div
        className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-4 ${DRIVE_SURFACE_SECONDARY}`}
      >
        <FaFolder className={`text-2xl ${DRIVE_TEXT_MUTED}`} />
      </div>
      <p className={`text-sm font-semibold ${DRIVE_TEXT_PRIMARY}`}>
        {search || (hasActiveFilter && items.length > 0)
          ? "No matching items"
          : "This folder is empty"}
      </p>
      <p className={`text-xs mt-1 max-w-xs ${DRIVE_TEXT_SECONDARY}`}>
        {search
          ? "Try a different search term."
          : hasActiveFilter && items.length > 0
            ? "Try a different file type filter."
            : isAdmin
              ? "Upload files or create a subfolder to get started."
              : "No files have been added to this folder yet."}
      </p>
    </div>
  );

  const errorContent = error && (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/30 mb-4">
        <FaExclamationTriangle className="text-rose-500 dark:text-rose-400 text-2xl" />
      </div>
      <p className="text-sm font-semibold text-rose-600 dark:text-rose-300 max-w-md">{error}</p>
      <button
        type="button"
        onClick={onRefresh}
        className={`mt-4 py-2 px-4 text-xs font-semibold rounded-xl border ${DRIVE_BORDER} ${DRIVE_ACCENT_TEXT} ${DRIVE_ROW_HOVER} transition-colors`}
      >
        Retry
      </button>
    </div>
  );

  const loadingContent = (
    <div className={`flex items-center justify-center py-16 ${DRIVE_TEXT_SECONDARY}`}>
      <FaSpinner className={`animate-spin text-xl mr-3 ${DRIVE_ACCENT_TEXT}`} />
      <span className="text-sm font-medium">Loading folder…</span>
    </div>
  );

  const renderGrid = () => (
    <DriveGridSections
      items={filteredItems}
      typeFilter={typeFilter}
      onItemClick={onItemClick}
      onContextMenu={onContextMenu}
      isAdmin={isAdmin}
      onRename={onRename}
      onLink={onLink}
      activeItemId={activeItemId}
      rootFolderId={rootFolderId}
    />
  );

  const renderEmbeddedList = () => (
    <div className={`overflow-hidden mx-5 mb-5 rounded-xl border ${DRIVE_BORDER}`}>
      <table className="w-full text-sm">
        <thead>
          <tr
            className={`${DRIVE_SURFACE_SECONDARY} text-[10px] uppercase font-bold tracking-wider ${DRIVE_TEXT_MUTED}`}
          >
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3 hidden sm:table-cell">Modified</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Size</th>
            <th className="w-10 px-2" />
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, index) => (
            <tr
              key={item.id}
              className={`border-t ${DRIVE_BORDER} ${DRIVE_ROW_HOVER} cursor-pointer transition-colors`}
              onClick={() => onItemClick(item)}
              onContextMenu={(e) => onContextMenu(e, item)}
            >
              <td className="px-4 py-3">{listColumns[0].render(item, index)}</td>
              <td className="px-4 py-3 hidden sm:table-cell">{listColumns[1].render(item, index)}</td>
              <td className="px-4 py-3 hidden md:table-cell">{listColumns[2].render(item, index)}</td>
              <td className="px-2 py-3">
                <button
                  type="button"
                  className={`p-1.5 rounded-lg ${DRIVE_ROW_HOVER} ${DRIVE_TEXT_MUTED}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemMenu(item);
                  }}
                >
                  <FaEllipsisV className="text-xs" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const dragOverlay = isDragOver && isAdmin && (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div
        className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-white/90 dark:bg-[#17181B]/90 shadow-lg ${DRIVE_DRAG_OVERLAY}`}
      >
        <FaCloudUploadAlt className={`text-2xl ${DRIVE_ACCENT_TEXT}`} />
        <span className={`text-sm font-semibold ${DRIVE_ACCENT_TEXT}`}>Drop files to upload</span>
      </div>
    </div>
  );

  const dragZoneCls = `relative min-h-[240px] transition-colors ${
    isDragOver && isAdmin
      ? DRIVE_DRAG_ZONE
      : ""
  }`;

  if (embedded) {
    return (
      <div
        className={dragZoneCls}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {dragOverlay}
        {loading
          ? loadingContent
          : error
            ? errorContent
            : filteredItems.length === 0
              ? emptyContent
              : viewMode === "grid"
                ? renderGrid()
                : renderEmbeddedList()}
      </div>
    );
  }

  if (viewMode === "list") {
    if (loading) {
      return (
        <div className={`${DRIVE_CARD_CLS} overflow-hidden`}>
          {loadingContent}
        </div>
      );
    }
    if (error) {
      return (
        <div className={`${DRIVE_CARD_CLS} overflow-hidden`}>
          {errorContent}
        </div>
      );
    }

    return (
      <DataTable
        title="File Browser"
        subtitle={`${items.length} item${items.length !== 1 ? "s" : ""} in this folder`}
        rows={filteredItems}
        getRowId={(item) => item.id}
        columns={listColumns}
        filters={viewToggle}
        rightSlot={toolbarRight}
        belowTitle={belowTitle}
        onRowClick={onItemClick}
        onRefresh={onRefresh}
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search files…"
        showCheckbox={false}
        showIndex={false}
        emptyText={search ? "No matching items." : "This folder is empty."}
        actions={() => [
          {
            icon: FaEllipsisV,
            title: "More",
            onClick: onItemMenu,
          },
        ]}
        actionsHeader=""
      />
    );
  }

  return (
    <div className={`${DRIVE_CARD_CLS} overflow-visible`}>
      <div className="flex items-end justify-between gap-3 px-5 py-3 overflow-visible">
        <div className="flex items-end flex-1 min-w-0 overflow-visible">{viewToggle}</div>
        <div className="data-table-toolbar__actions shrink-0 flex items-center gap-2">
          {toolbarRight}
        </div>
      </div>

      <div className="px-5 pb-2.5">
        <h3 className={DRIVE_TITLE}>File Browser</h3>
        <p className={`${DRIVE_SUBTITLE} mt-1`}>
          {items.length} item{items.length !== 1 ? "s" : ""} in this folder
        </p>
      </div>

      {belowTitle}

      <div
        className={dragZoneCls}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {dragOverlay}
        {loading
          ? loadingContent
          : error
            ? errorContent
            : filteredItems.length === 0
              ? emptyContent
              : renderGrid()}
      </div>
    </div>
  );
}
