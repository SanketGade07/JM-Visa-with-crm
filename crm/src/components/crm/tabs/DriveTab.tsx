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
  DRIVE_CARD_CLS,
  DRIVE_INPUT,
  DRIVE_TEXT_SECONDARY,
  DRIVE_WARNING_BANNER,
  type Breadcrumb,
  type DriveItem,
  type DriveTypeFilter,
  extractFolderId,
  filterDriveItemsByType,
  parseApiError,
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
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState<DriveTypeFilter>("all");
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

  const [renameItem, setRenameItem] = useState<DriveItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<DriveItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const filteredItems = useMemo(
    () => filterDriveItemsByType(items, typeFilter),
    [items, typeFilter]
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
    async (folderId: string, crumbs?: Breadcrumb[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/drive/browse?folderId=${encodeURIComponent(folderId)}`
        );
        if (!res.ok) {
          const msg = await parseApiError(res);
          setError(msg);
          setItems([]);
          return;
        }
        const data: DriveItem[] = await res.json();
        const sorted = [...data].sort((a, b) => {
          if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
          return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        });
        setItems(sorted);
        setCurrentFolderId(folderId);
        if (crumbs) setBreadcrumbs(crumbs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load folder");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
      browseFolder(currentFolderId, breadcrumbs);
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

  const navigateBack = () => {
    if (breadcrumbs.length > 1) {
      navigateToBreadcrumb(breadcrumbs.length - 2);
    }
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
      showToast("Folder created");
      setShowNewFolderModal(false);
      setNewFolderName("");
      refreshCurrent();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create folder", "error");
    } finally {
      setIsCreatingFolder(false);
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

  const openItemMenu = (item: DriveItem) => {
    setContextMenu({
      x: Math.min(window.innerWidth - 180, 240),
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
    <div className="min-w-0 space-y-6">
      {isAccessDenied && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 flex gap-3">
          <FaExclamationTriangle className="text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-200/90">{error}</p>
        </div>
      )}

      {showDriveCard && (
        <div className={`${DRIVE_CARD_CLS} overflow-hidden`}>
          <DriveToolbar
            breadcrumbs={breadcrumbs}
            onNavigate={navigateToBreadcrumb}
            onNavigateBack={navigateBack}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onRefresh={refreshCurrent}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            isAdmin={isAdmin}
            isUploading={isUploading}
            onUploadClick={() => fileInputRef.current?.click()}
            onFolderUploadClick={() => folderInputRef.current?.click()}
            onNewFolder={() => setShowNewFolderModal(true)}
            onCreateGoogleFile={handleCreateGoogleFile}
            onOpenLinkSettings={
              isAdmin ? () => setShowLinkSettingsModal(true) : undefined
            }
            refreshing={loading}
          />

          {rootFolderId ? (
            <DriveBrowser
              embedded
              items={items}
              filteredItems={filteredItems}
              typeFilter={typeFilter}
              viewMode={viewMode}
              loading={settingsLoading || loading}
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
