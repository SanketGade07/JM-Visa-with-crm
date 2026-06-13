"use client";

import React from "react";
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
import { DriveItemIcon } from "./DriveItemIcon";
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
  DRIVE_ROW_HOVER,
  DRIVE_CONTENT_BG,
  DRIVE_CONTENT_PADDING,
  DRIVE_FILE_PREVIEW_LIMIT,
  DRIVE_FOLDER_PREVIEW_LIMIT,
  DRIVE_SECTION_GAP,
  DRIVE_SECTION_LABEL,
  DRIVE_SURFACE_SECONDARY,
  DRIVE_TEXT_MUTED,
  DRIVE_TEXT_PRIMARY,
  DRIVE_TEXT_SECONDARY,
  DRIVE_TITLE,
  DRIVE_SUBTITLE,
  formatDate,
  formatFileSize,
} from "./driveUtils";
import { DriveBreadcrumbs } from "./DriveBreadcrumbs";
import { DriveItemGrid } from "./DriveItemGrid";
import { DriveListView } from "./DriveListView";
import { DriveStatusFooter } from "./DriveStatusFooter";

type DriveBrowserBodyProps = {
  items: DriveItem[];
  filteredItems: DriveItem[];
  typeFilter?: DriveTypeFilter;
  viewMode: "grid" | "list";
  loading: boolean;
  refreshing?: boolean;
  error: string | null;
  isAdmin: boolean;
  isUploading: boolean;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onItemClick: (item: DriveItem) => void;
  onContextMenu: (e: React.MouseEvent, item: DriveItem) => void;
  onItemMenu: (item: DriveItem, e?: React.MouseEvent<HTMLButtonElement>) => void;
  onRefresh: () => void;
  onRename?: (item: DriveItem) => void;
  onLink?: (item: DriveItem) => void;
  activeItemId?: string | null;
  rootFolderId?: string | null;
};

type DriveBrowserEmbeddedProps = DriveBrowserBodyProps & {
  /** Grid/list body only — toolbar and breadcrumbs live in DriveTab. */
  embedded: true;
  search?: string;
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
  onItemMenu,
  activeItemId,
}: {
  items: DriveItem[];
  typeFilter?: DriveTypeFilter;
  onItemClick: (item: DriveItem) => void;
  onContextMenu: (e: React.MouseEvent, item: DriveItem) => void;
  onItemMenu: (item: DriveItem, e?: React.MouseEvent<HTMLButtonElement>) => void;
  activeItemId?: string | null;
}) {
  const gridProps = {
    onItemClick,
    onContextMenu,
    onItemMenu,
    nested: true,
    activeItemId,
  };

  const showSplitSections = typeFilter === "all" || typeFilter === "folders";

  if (!showSplitSections) {
    return (
      <div className={`${DRIVE_CONTENT_PADDING} pb-2 ${DRIVE_CONTENT_BG}`}>
        <DriveItemGrid items={items} {...gridProps} />
        <DriveStatusFooter items={items} />
      </div>
    );
  }

  const folders = items.filter((i) => i.isFolder);
  const files = items.filter((i) => !i.isFolder);
  const [showAllFolders, setShowAllFolders] = React.useState(false);
  const [showAllFiles, setShowAllFiles] = React.useState(false);
  const hasMoreFolders = folders.length > DRIVE_FOLDER_PREVIEW_LIMIT;
  const hasMoreFiles = files.length > DRIVE_FILE_PREVIEW_LIMIT;
  const visibleFolders = showAllFolders
    ? folders
    : folders.slice(0, DRIVE_FOLDER_PREVIEW_LIMIT);
  const visibleFiles = showAllFiles
    ? files
    : files.slice(0, DRIVE_FILE_PREVIEW_LIMIT);

  React.useEffect(() => {
    setShowAllFolders(false);
  }, [folders.map((f) => f.id).join(",")]);

  React.useEffect(() => {
    setShowAllFiles(false);
  }, [files.map((f) => f.id).join(",")]);

  return (
    <div className={`${DRIVE_CONTENT_PADDING} pb-2 ${DRIVE_CONTENT_BG}`}>
      <div className={DRIVE_SECTION_GAP}>
        {folders.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className={DRIVE_SECTION_LABEL}>Folders</p>
              {hasMoreFolders && (
                <button
                  type="button"
                  onClick={() => setShowAllFolders((expanded) => !expanded)}
                  className={`shrink-0 text-[12px] font-medium ${DRIVE_ACCENT_TEXT} hover:underline`}
                >
                  {showAllFolders ? "Show less" : "View all"}
                </button>
              )}
            </div>
            <DriveItemGrid items={visibleFolders} {...gridProps} />
          </section>
        )}
        {files.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className={DRIVE_SECTION_LABEL}>Files</p>
              {hasMoreFiles && (
                <button
                  type="button"
                  onClick={() => setShowAllFiles((expanded) => !expanded)}
                  className={`shrink-0 text-[12px] font-medium ${DRIVE_ACCENT_TEXT} hover:underline`}
                >
                  {showAllFiles ? "Show less" : "View all"}
                </button>
              )}
            </div>
            <DriveItemGrid items={visibleFiles} {...gridProps} />
          </section>
        )}
      </div>
      <DriveStatusFooter items={items} />
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
    refreshing = false,
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
  const search = embedded
    ? (props.search ?? "")
    : props.search;
  const onSearchChange = !embedded ? props.onSearchChange : () => {};
  const onNavigateBreadcrumb = !embedded ? props.onNavigateBreadcrumb : () => {};
  const onViewModeChange = !embedded ? props.onViewModeChange : () => {};
  const onUploadClick = !embedded ? props.onUploadClick : () => {};
  const onNewFolder = !embedded ? props.onNewFolder : () => {};
  const onCreateGoogleFile = !embedded ? props.onCreateGoogleFile : () => {};

  const [googleMenuOpen, setGoogleMenuOpen] = React.useState(false);

  const folderColorById = React.useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    for (const item of filteredItems) {
      if (item.isFolder) map.set(item.id, idx++);
    }
    return map;
  }, [filteredItems]);

  const listColumns: Column<DriveItem>[] = React.useMemo(
    () => [
      {
        header: "Name",
        render: (item) => (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
              <DriveItemIcon
                item={item}
                size={24}
                folderColorIndex={folderColorById.get(item.id) ?? 0}
              />
            </div>
            <span className={`font-semibold text-[13px] truncate ${DRIVE_TEXT_PRIMARY}`}>
              {item.name}
            </span>
          </div>
        ),
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
    [folderColorById]
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
      onItemMenu={onItemMenu}
      activeItemId={activeItemId}
    />
  );

  const renderEmbeddedList = () => (
    <DriveListView
      items={filteredItems}
      activeItemId={activeItemId}
      onItemClick={onItemClick}
      onContextMenu={onContextMenu}
      onItemMenu={onItemMenu}
    />
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

  const dragZoneCls = `relative min-h-[240px] w-full min-w-full transition-colors ${
    isDragOver && isAdmin
      ? DRIVE_DRAG_ZONE
      : ""
  }`;

  // Keep the grid/list mounted whenever we already have folder data so the
  // card and toolbar never collapse to spinner width during silent refresh.
  const showInitialLoading = loading && !refreshing && items.length === 0;

  const renderBody = () => {
    if (showInitialLoading) return loadingContent;
    if (error) return errorContent;
    if (filteredItems.length === 0) return emptyContent;
    return viewMode === "grid" ? renderGrid() : renderEmbeddedList();
  };

  if (embedded) {
    return (
      <div
        className={`${DRIVE_CONTENT_BG} ${dragZoneCls}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {dragOverlay}
        {renderBody()}
      </div>
    );
  }

  if (viewMode === "list") {
    if (showInitialLoading) {
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
        className={`${DRIVE_CONTENT_BG} ${dragZoneCls}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {dragOverlay}
        {renderBody()}
      </div>
    </div>
  );
}
