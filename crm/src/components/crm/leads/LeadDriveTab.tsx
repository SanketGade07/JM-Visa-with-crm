"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaExclamationTriangle, FaFolder, FaSpinner } from "react-icons/fa";
import type { Lead } from "@/context/CrmContext";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { DriveBrowser } from "../drive/DriveBrowser";
import {
  DriveContextMenu,
  DriveModal,
  DrivePreviewModal,
} from "../drive/DriveModals";
import { DriveToolbar } from "../drive/DriveToolbar";
import {
  DRIVE_BORDER,
  DRIVE_BTN_PRIMARY,
  DRIVE_BTN_SECONDARY,
  DRIVE_CONTENT_BG,
  DRIVE_INPUT,
  DRIVE_TEXT_PRIMARY,
  DRIVE_TEXT_SECONDARY,
  type Breadcrumb,
  type DriveItem,
  type DriveTypeFilter,
  filterDriveItems,
  filterDriveItemsByType,
  getDriveItemMenuPosition,
  inferBlankFileMimeType,
  parseApiError,
  sortDriveItems,
  validateNewFileName,
} from "../drive/driveUtils";

type LeadDriveTabProps = {
  lead: Lead;
};

export function LeadDriveTab({ lead }: LeadDriveTabProps) {
  const { currentRole, showToast, patchLeadDriveFolder } = useCrmLayoutContext();
  const isAdmin = currentRole === "ADMIN";

  const [rootFolderId, setRootFolderId] = useState<string | null>(
    lead.driveFolderId ?? null
  );
  const [initialLoading, setInitialLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [folderResolveAttempted, setFolderResolveAttempted] = useState(false);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState<DriveTypeFilter>("all");
  const [search, setSearch] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const [previewItem, setPreviewItem] = useState<DriveItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: DriveItem;
  } | null>(null);

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  const [renameItem, setRenameItem] = useState<DriveItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<DriveItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const browseRequestIdRef = useRef(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const filteredItems = useMemo(
    () => filterDriveItemsByType(items, typeFilter),
    [items, typeFilter]
  );

  const filteredBySearch = useMemo(
    () => filterDriveItems(filteredItems, search),
    [filteredItems, search]
  );

  const isAccessDenied =
    !!error &&
    (error.includes("Access Denied") ||
      error.includes("Forbidden") ||
      error.includes("Refresh token"));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setRootFolderId(lead.driveFolderId ?? null);
    setFolderResolveAttempted(!!lead.driveFolderId);
    setItems([]);
    setBreadcrumbs([]);
    setCurrentFolderId(null);
    setError(null);
  }, [lead.id]);

  useEffect(() => {
    if (lead.driveFolderId) {
      setRootFolderId(lead.driveFolderId);
      setFolderResolveAttempted(true);
    }
  }, [lead.driveFolderId]);

  const applyDriveFolderId = useCallback(
    (folderId: string) => {
      setRootFolderId((prev) => (prev === folderId ? prev : folderId));
      patchLeadDriveFolder(lead.id, folderId);
    },
    [lead.id, patchLeadDriveFolder]
  );

  useEffect(() => {
    let cancelled = false;

    const syncDriveFolderFromServer = async () => {
      setFolderResolveAttempted(Boolean(lead.driveFolderId));

      try {
        const freshRes = await fetch(`/api/leads/${lead.id}`);
        if (cancelled) return;

        if (freshRes.ok) {
          const { lead: fresh } = (await freshRes.json()) as { lead?: Lead };
          if (fresh?.driveFolderId) {
            setRootFolderId(fresh.driveFolderId);
            patchLeadDriveFolder(lead.id, fresh.driveFolderId);
            return;
          }
        }

        if (!isAdmin) return;

        const res = await fetch(`/api/leads/${lead.id}/drive-create`, { method: "POST" });
        if (cancelled || !res.ok) return;

        const data = (await res.json()) as { driveFolderId?: string };
        if (data.driveFolderId) {
          setRootFolderId(data.driveFolderId);
          patchLeadDriveFolder(lead.id, data.driveFolderId);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to resolve lead Drive folder:", err);
        }
      } finally {
        if (!cancelled) {
          setFolderResolveAttempted(true);
        }
      }
    };

    void syncDriveFolderFromServer();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, lead.id, patchLeadDriveFolder]);

  const browseFolder = useCallback(
    async (
      folderId: string,
      crumbs?: Breadcrumb[],
      options?: { silent?: boolean }
    ) => {
      const requestId = ++browseRequestIdRef.current;
      const silent = options?.silent ?? false;
      if (silent) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const res = await fetch(
          `/api/drive/browse?folderId=${encodeURIComponent(folderId)}`
        );
        if (requestId !== browseRequestIdRef.current) return;

        if (!res.ok) {
          const msg = await parseApiError(res);
          setError(msg);
          if (!silent) setItems([]);
          return;
        }
        const data: DriveItem[] = await res.json();
        if (requestId !== browseRequestIdRef.current) return;

        setItems(sortDriveItems(data));
        setCurrentFolderId(folderId);
        if (crumbs) setBreadcrumbs(crumbs);
      } catch (err) {
        if (requestId !== browseRequestIdRef.current) return;
        setError(err instanceof Error ? err.message : "Failed to load folder");
        if (!silent) setItems([]);
      } finally {
        if (requestId !== browseRequestIdRef.current) return;
        if (silent) {
          setIsRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  const upsertDriveItem = useCallback((item: DriveItem) => {
    setItems((prev) =>
      sortDriveItems([...prev.filter((existing) => existing.id !== item.id), item])
    );
  }, []);

  const loadLeadFolder = useCallback(async () => {
    const folderId = rootFolderId;
    if (!folderId) {
      setInitialLoading(false);
      setCurrentFolderId(null);
      setBreadcrumbs([]);
      setItems([]);
      setError(null);
      return;
    }

    setInitialLoading(true);
    setError(null);
    try {
      let folderName = lead.name || "Client folder";
      try {
        const validateRes = await fetch("/api/drive/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId }),
        });
        if (validateRes.ok) {
          const validated = await validateRes.json();
          folderName = validated.folderName || folderName;
        }
      } catch {
        // browse may still work with lead name as label
      }
      const crumbs: Breadcrumb[] = [{ id: folderId, name: folderName }];
      setBreadcrumbs(crumbs);
      await browseFolder(folderId, crumbs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Drive folder");
    } finally {
      setInitialLoading(false);
    }
  }, [browseFolder, lead.name, rootFolderId]);

  useEffect(() => {
    void loadLeadFolder();
  }, [loadLeadFolder]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, []);

  const refreshCurrent = useCallback(() => {
    if (currentFolderId) {
      browseFolder(currentFolderId, breadcrumbs, { silent: true });
    }
  }, [browseFolder, currentFolderId, breadcrumbs]);

  const handleProvisionFolder = async () => {
    setIsProvisioning(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/drive-create`, {
        method: "POST",
      });
      if (!res.ok) {
        showToast(await parseApiError(res), "error");
        return;
      }
      const data = await res.json();
      const folderId = data.driveFolderId as string;
      const folderName = (data.folderName as string) || lead.name;
      applyDriveFolderId(folderId);
      const crumbs: Breadcrumb[] = [{ id: folderId, name: folderName }];
      setBreadcrumbs(crumbs);
      await browseFolder(folderId, crumbs);
      showToast(`Drive folder created: ${folderName}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to create Drive folder",
        "error"
      );
    } finally {
      setIsProvisioning(false);
    }
  };

  const navigateToFolder = (folder: DriveItem) => {
    const newCrumbs = [...breadcrumbs, { id: folder.id, name: folder.name }];
    browseFolder(folder.id, newCrumbs);
  };

  const navigateToBreadcrumb = (index: number) => {
    const crumb = breadcrumbs[index];
    const newCrumbs = breadcrumbs.slice(0, index + 1);
    browseFolder(crumb.id, newCrumbs);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || !currentFolderId) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("parentId", currentFolderId);
        const res = await fetch("/api/drive/browse", { method: "POST", body: formData });
        if (!res.ok) {
          showToast(`${file.name}: ${await parseApiError(res)}`, "error");
        }
      }
      showToast("Upload complete");
      refreshCurrent();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentFolderId) return;
    setIsCreatingFolder(true);
    try {
      const res = await fetch("/api/drive/browse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: currentFolderId,
          folderName: newFolderName.trim(),
        }),
      });
      if (!res.ok) {
        showToast(await parseApiError(res), "error");
        return;
      }
      const data = (await res.json()) as {
        folder?: { id: string; name: string; isFolder?: boolean };
      };
      const now = new Date().toISOString();
      if (data.folder?.id) {
        upsertDriveItem({
          id: data.folder.id,
          name: data.folder.name,
          mimeType: "application/vnd.google-apps.folder",
          isFolder: true,
          size: null,
          createdTime: now,
          modifiedTime: now,
          webViewLink: `https://drive.google.com/drive/folders/${data.folder.id}`,
          webContentLink: null,
          itemCount: 0,
        });
      }
      showToast("Folder created");
      setShowNewFolderModal(false);
      setNewFolderName("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create folder", "error");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleCreateBlankFile = async () => {
    if (!currentFolderId) return;
    const validationError = validateNewFileName(newFileName);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }
    const trimmed = newFileName.trim();
    setIsCreatingFile(true);
    try {
      const res = await fetch("/api/drive/browse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: currentFolderId,
          blankFile: true,
          fileName: trimmed,
        }),
      });
      if (!res.ok) {
        showToast(await parseApiError(res), "error");
        return;
      }
      const data = (await res.json()) as {
        file?: {
          id: string;
          name: string;
          webViewLink?: string;
          webContentLink?: string | null;
          previewUrl?: string | null;
        };
      };
      const now = new Date().toISOString();
      if (data.file?.id) {
        upsertDriveItem({
          id: data.file.id,
          name: data.file.name || trimmed,
          mimeType: inferBlankFileMimeType(trimmed),
          isFolder: false,
          size: 0,
          createdTime: now,
          modifiedTime: now,
          webViewLink: data.file.webViewLink || "",
          webContentLink: data.file.webContentLink ?? null,
          previewUrl: data.file.previewUrl ?? null,
        });
      }
      showToast("File created");
      setShowNewFileModal(false);
      setNewFileName("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create file", "error");
    } finally {
      setIsCreatingFile(false);
    }
  };

  const handleCreateGoogleFile = async (
    type: "document" | "spreadsheet" | "presentation"
  ) => {
    if (!currentFolderId) return;
    const name = prompt(`Name for new ${type}:`);
    if (!name?.trim()) return;
    try {
      const res = await fetch("/api/drive/browse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: currentFolderId,
          folderName: name.trim(),
          type,
        }),
      });
      if (!res.ok) {
        showToast(await parseApiError(res), "error");
        return;
      }
      showToast("Google file created");
      refreshCurrent();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create file", "error");
    }
  };

  const handleRename = async () => {
    if (!renameItem || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      const res = await fetch("/api/drive/browse", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: renameItem.id,
          newName: renameValue.trim(),
          isFolder: renameItem.isFolder,
        }),
      });
      if (!res.ok) {
        showToast(await parseApiError(res), "error");
        return;
      }
      showToast("Renamed successfully");
      setRenameItem(null);
      setRenameValue("");
      refreshCurrent();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Rename failed", "error");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/drive/browse?id=${encodeURIComponent(deleteConfirm.id)}&isFolder=${deleteConfirm.isFolder}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        showToast(await parseApiError(res), "error");
        return;
      }
      showToast("Moved to trash");
      setDeleteConfirm(null);
      refreshCurrent();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const openContextMenu = (e: React.MouseEvent, item: DriveItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const openItemMenu = (
    item: DriveItem,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e?.currentTarget) {
      const { x, y } = getDriveItemMenuPosition(e.currentTarget);
      setContextMenu({ x, y, item });
      return;
    }
    setContextMenu({
      x: Math.max(8, window.innerWidth - 168 - 8),
      y: 160,
      item,
    });
  };

  const handleItemClick = (item: DriveItem) => {
    if (item.isFolder) {
      navigateToFolder(item);
    } else {
      setPreviewItem(item);
    }
  };

  const handleRenameItem = (item: DriveItem) => {
    setRenameItem(item);
    setRenameValue(item.name);
  };

  const handleCopyLink = async (item: DriveItem) => {
    if (!item.webViewLink) return;
    try {
      await navigator.clipboard.writeText(item.webViewLink);
      showToast("Link copied to clipboard");
    } catch {
      window.open(item.webViewLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyFolderLink = async () => {
    if (!currentFolderId) return;
    const url = `https://drive.google.com/drive/folders/${currentFolderId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Folder link copied to clipboard");
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isAdmin) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isAdmin && e.dataTransfer.files?.length) {
      void handleUpload(e.dataTransfer.files);
    }
  };

  const inputCls = `w-full text-sm py-2.5 px-4 ${DRIVE_INPUT}`;

  const noFolderContent = !folderResolveAttempted ? (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <FaSpinner className={`text-2xl animate-spin ${DRIVE_TEXT_SECONDARY} mb-4`} />
      <p className={`text-sm font-semibold ${DRIVE_TEXT_PRIMARY}`}>
        Loading Drive folder…
      </p>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-800/60 mb-4">
        <FaFolder className={`text-2xl ${DRIVE_TEXT_SECONDARY}`} />
      </div>
      <p className={`text-sm font-semibold ${DRIVE_TEXT_PRIMARY}`}>
        No Drive folder linked
      </p>
      <p className={`text-xs mt-1 max-w-sm ${DRIVE_TEXT_SECONDARY}`}>
        {isAdmin
          ? "Create a dedicated Google Drive folder for this lead under Clients/."
          : "A Drive folder has not been set up for this lead yet."}
      </p>
      {isAdmin ? (
        <button
          type="button"
          onClick={() => void handleProvisionFolder()}
          disabled={isProvisioning}
          className={`mt-5 inline-flex items-center gap-2 ${DRIVE_BTN_PRIMARY}`}
        >
          {isProvisioning && <FaSpinner className="animate-spin" />}
          Create folder
        </button>
      ) : null}
    </div>
  );

  const showDriveBrowser = Boolean(rootFolderId);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">
      {isAccessDenied && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 flex gap-3">
          <FaExclamationTriangle className="text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-200/90">{error}</p>
        </div>
      )}

      <div className={`w-full max-w-full shrink-0 rounded-[14px] border ${DRIVE_BORDER} overflow-hidden`}>
        {showDriveBrowser ? (
          <>
            <DriveToolbar
              breadcrumbs={breadcrumbs}
              onNavigate={navigateToBreadcrumb}
              search={search}
              onSearchChange={setSearch}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onRefresh={refreshCurrent}
              onCopyFolderLink={
                currentFolderId ? handleCopyFolderLink : undefined
              }
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              isAdmin={isAdmin}
              isUploading={isUploading}
              onUploadClick={() => fileInputRef.current?.click()}
              onFolderUploadClick={() => folderInputRef.current?.click()}
              onNewFolder={() => setShowNewFolderModal(true)}
              onNewFile={() => setShowNewFileModal(true)}
              onCreateGoogleFile={handleCreateGoogleFile}
              refreshing={isRefreshing}
            />

            <div className={DRIVE_CONTENT_BG}>
              <DriveBrowser
                embedded
                items={items}
                filteredItems={filteredBySearch}
                search={search}
                typeFilter={typeFilter}
                viewMode={viewMode}
                loading={initialLoading || (loading && !isRefreshing)}
                refreshing={isRefreshing}
                error={isAccessDenied ? null : error}
                isAdmin={isAdmin}
                isUploading={isUploading}
                isDragOver={isDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onItemClick={handleItemClick}
                onContextMenu={openContextMenu}
                onItemMenu={openItemMenu}
                onRefresh={refreshCurrent}
                onRename={isAdmin ? handleRenameItem : undefined}
                onLink={handleCopyLink}
                rootFolderId={rootFolderId}
              />
            </div>
          </>
        ) : (
          <div className={DRIVE_CONTENT_BG}>{noFolderContent}</div>
        )}
      </div>

      {showDriveBrowser ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files)}
          />

          <input
            ref={folderInputRef}
            type="file"
            multiple
            className="hidden"
            {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
            onChange={(e) => void handleUpload(e.target.files)}
          />
        </>
      ) : null}

      {previewItem && (
        <DrivePreviewModal
          item={previewItem}
          isMounted={isMounted}
          onClose={() => setPreviewItem(null)}
        />
      )}

      <DriveContextMenu
        menu={contextMenu}
        isMounted={isMounted}
        isAdmin={isAdmin}
        onClose={() => setContextMenu(null)}
        onPreview={setPreviewItem}
        onRename={(item) => {
          setRenameItem(item);
          setRenameValue(item.name);
        }}
        onDelete={setDeleteConfirm}
      />

      <DriveModal
        open={showNewFolderModal}
        isMounted={isMounted}
        title="New Folder"
        onClose={() => setShowNewFolderModal(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowNewFolderModal(false)}
              className={DRIVE_BTN_SECONDARY}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleCreateFolder()}
              disabled={isCreatingFolder || !newFolderName.trim()}
              className={DRIVE_BTN_PRIMARY}
            >
              {isCreatingFolder && <FaSpinner className="animate-spin" />}
              Create
            </button>
          </>
        }
      >
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder name"
          autoFocus
          className={inputCls}
          onKeyDown={(e) => e.key === "Enter" && void handleCreateFolder()}
        />
      </DriveModal>

      <DriveModal
        open={showNewFileModal}
        isMounted={isMounted}
        title="New File"
        onClose={() => setShowNewFileModal(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowNewFileModal(false)}
              className={DRIVE_BTN_SECONDARY}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleCreateBlankFile()}
              disabled={isCreatingFile || !newFileName.trim()}
              className={DRIVE_BTN_PRIMARY}
            >
              {isCreatingFile && <FaSpinner className="animate-spin" />}
              Create
            </button>
          </>
        }
      >
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="document.pdf or notes.txt"
          autoFocus
          className={inputCls}
          onKeyDown={(e) => e.key === "Enter" && void handleCreateBlankFile()}
        />
      </DriveModal>

      <DriveModal
        open={!!renameItem}
        isMounted={isMounted}
        title="Rename"
        onClose={() => setRenameItem(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRenameItem(null)}
              className={DRIVE_BTN_SECONDARY}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleRename()}
              disabled={isRenaming || !renameValue.trim()}
              className={DRIVE_BTN_PRIMARY}
            >
              {isRenaming && <FaSpinner className="animate-spin" />}
              Save
            </button>
          </>
        }
      >
        <input
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          autoFocus
          className={inputCls}
          onKeyDown={(e) => e.key === "Enter" && void handleRename()}
        />
      </DriveModal>

      <DriveModal
        open={!!deleteConfirm}
        isMounted={isMounted}
        title="Delete item?"
        onClose={() => setDeleteConfirm(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteConfirm(null)}
              className={DRIVE_BTN_SECONDARY}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold text-[11px] transition-all flex items-center gap-2"
            >
              {isDeleting && <FaSpinner className="animate-spin" />}
              Delete
            </button>
          </>
        }
      >
        <p className="text-xs text-gray-600 dark:text-[#A0A6B0]">
          <span className="text-[#1F2937] dark:text-[#EDEDED] font-medium">
            {deleteConfirm?.name}
          </span>{" "}
          will be moved to Google Drive trash.
        </p>
      </DriveModal>
    </div>
  );
}
