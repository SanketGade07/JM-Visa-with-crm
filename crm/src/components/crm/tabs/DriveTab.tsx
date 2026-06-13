"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { DriveBrowser } from "../drive/DriveBrowser";
import {
  DriveContextMenu,
  DriveLinkSettingsModal,
  DriveModal,
  DrivePreviewModal,
} from "../drive/DriveModals";
import { DriveToolbar } from "../drive/DriveToolbar";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_BTN_PRIMARY,
  DRIVE_BTN_SECONDARY,
  DRIVE_BORDER,
  DRIVE_CONTENT_BG,
  DRIVE_INPUT,
  DRIVE_TEXT_SECONDARY,
  DRIVE_WARNING_BANNER,
  type Breadcrumb,
  type DriveItem,
  type DriveTypeFilter,
  extractFolderId,
  filterDriveItems,
  filterDriveItemsByType,
  inferBlankFileMimeType,
  parseApiError,
  sortDriveItems,
  getDriveItemMenuPosition,
  validateNewFileName,
} from "../drive/driveUtils";

export function DriveTab() {
  const { currentRole, showToast } = useCrmLayoutContext();
  const isAdmin = currentRole === "ADMIN";

  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  const [rootFolderName, setRootFolderName] = useState<string | null>(null);
  const [folderInput, setFolderInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState<DriveTypeFilter>("all");
  const [search, setSearch] = useState("");
  const [showLinkSettingsModal, setShowLinkSettingsModal] = useState(false);
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

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) {
        const msg = await parseApiError(res);
        setError(msg);
        return;
      }
      const data = await res.json();
      const rootId = data.drive_root_folder_id as string | null;
      if (rootId) {
        setRootFolderId(rootId);
        let folderName = "Root";
        try {
          const validateRes = await fetch("/api/drive/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderId: rootId }),
          });
          if (validateRes.ok) {
            const validated = await validateRes.json();
            folderName = validated.folderName || folderName;
            setRootFolderName(folderName);
          }
        } catch {
          // browse may still work with a generic label
        }
        const crumbs: Breadcrumb[] = [{ id: rootId, name: folderName }];
        setBreadcrumbs(crumbs);
        await browseFolder(rootId, crumbs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setSettingsLoading(false);
    }
  }, [browseFolder]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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

  const navigateToFolder = (folder: DriveItem) => {
    const newCrumbs = [...breadcrumbs, { id: folder.id, name: folder.name }];
    browseFolder(folder.id, newCrumbs);
  };

  const navigateToBreadcrumb = (index: number) => {
    const crumb = breadcrumbs[index];
    const newCrumbs = breadcrumbs.slice(0, index + 1);
    browseFolder(crumb.id, newCrumbs);
  };

  const handleValidateAndSave = async () => {
    if (!folderInput.trim()) {
      showToast("Enter a Drive folder URL or ID", "error");
      return;
    }
    setIsValidating(true);
    try {
      const folderId = extractFolderId(folderInput);
      const validateRes = await fetch("/api/drive/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (!validateRes.ok) {
        showToast(await parseApiError(validateRes), "error");
        return;
      }
      const validated = await validateRes.json();

      const saveRes = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "drive_root_folder_id",
          value: validated.folderId,
        }),
      });
      if (!saveRes.ok) {
        showToast(await parseApiError(saveRes), "error");
        return;
      }
      const saved = await saveRes.json();
      setRootFolderId(saved.value);
      setRootFolderName(saved.folderName || validated.folderName);
      setFolderInput("");
      setShowLinkSettingsModal(false);
      showToast(`Linked folder: ${saved.folderName || validated.folderName}`);
      const crumbs: Breadcrumb[] = [
        { id: saved.value, name: saved.folderName || validated.folderName || "Root" },
      ];
      setBreadcrumbs(crumbs);
      await browseFolder(saved.value, crumbs);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Validation failed", "error");
    } finally {
      setIsValidating(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "drive_root_folder_id",
          value: null,
        }),
      });
      if (!res.ok) {
        showToast(await parseApiError(res), "error");
        return;
      }
      setRootFolderId(null);
      setRootFolderName(null);
      setFolderInput("");
      setCurrentFolderId(null);
      setBreadcrumbs([]);
      setItems([]);
      setError(null);
      setShowLinkSettingsModal(false);
      showToast("Drive folder unlinked");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to unlink folder", "error");
    } finally {
      setIsUnlinking(false);
    }
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

  const showDriveCard = !!rootFolderId || isAdmin;

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">
      {isAccessDenied && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 flex gap-3">
          <FaExclamationTriangle className="text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-200/90">{error}</p>
        </div>
      )}

      {showDriveCard && (
        <div className={`w-full max-w-full shrink-0 rounded-[14px] border ${DRIVE_BORDER} overflow-hidden`}>
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
            onOpenLinkSettings={
              isAdmin ? () => setShowLinkSettingsModal(true) : undefined
            }
            refreshing={isRefreshing}
          />

          <div className={DRIVE_CONTENT_BG}>
            {rootFolderId ? (
              <DriveBrowser
                embedded
                items={items}
                filteredItems={filteredBySearch}
                search={search}
                typeFilter={typeFilter}
                viewMode={viewMode}
                loading={settingsLoading || (loading && !isRefreshing)}
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
            ) : settingsLoading ? (
              <div className={`flex items-center justify-center py-16 ${DRIVE_TEXT_SECONDARY}`}>
                <FaSpinner className={`animate-spin text-xl mr-3 ${DRIVE_ACCENT_TEXT}`} />
                <span className="text-sm font-medium">Loading drive settings…</span>
              </div>
            ) : isAdmin ? (
              <div className={`mx-5 my-5 p-4 flex gap-3 ${DRIVE_WARNING_BANNER}`}>
                <FaExclamationTriangle className="text-[#C99200] shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200/90">
                  <p className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    Google Drive not linked
                  </p>
                  <p className="text-xs text-amber-700/90 dark:text-amber-200/70 leading-relaxed">
                    Set OAuth env vars (
                    <code className="text-amber-800 dark:text-amber-300">GOOGLE_OAUTH_*</code>
                    ), then open link settings and paste your root folder URL. Share the folder
                    with the Storage Owner Gmail as Editor.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

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

      <DriveLinkSettingsModal
        open={showLinkSettingsModal}
        isMounted={isMounted}
        onClose={() => setShowLinkSettingsModal(false)}
        rootFolderId={rootFolderId}
        rootFolderName={rootFolderName}
        folderInput={folderInput}
        onFolderInputChange={setFolderInput}
        onValidateAndSave={handleValidateAndSave}
        onUnlink={handleUnlink}
        isValidating={isValidating}
        isUnlinking={isUnlinking}
      />

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
