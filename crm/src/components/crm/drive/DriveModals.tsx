"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaTimes,
  FaExternalLinkAlt,
  FaFile,
  FaDownload,
  FaEdit,
  FaTrash,
  FaLink,
  FaSpinner,
  FaUnlink,
} from "react-icons/fa";
import { DriveLinkSettingsContent } from "./DriveAdminSettings";
import type { DriveItem } from "./driveUtils";
import {
  DRIVE_BORDER,
  DRIVE_BTN_PRIMARY,
  DRIVE_BTN_SECONDARY,
  DRIVE_CONTEXT_MENU,
  DRIVE_ICON_CONTAINER_SM,
  DRIVE_MODAL_BACKDROP,
  DRIVE_MODAL_SURFACE,
  DRIVE_ROW_HOVER,
  DRIVE_SURFACE_SECONDARY,
  DRIVE_TEXT_MUTED,
  DRIVE_TEXT_PRIMARY,
  DRIVE_TEXT_SECONDARY,
  canInlinePreview,
  getFileIcon,
  getFileIconColor,
} from "./driveUtils";

type DrivePreviewModalProps = {
  item: DriveItem;
  isMounted: boolean;
  onClose: () => void;
};

export function DrivePreviewModal({ item, isMounted, onClose }: DrivePreviewModalProps) {
  if (!isMounted) return null;

  const Icon = getFileIcon(item);
  const iconColor = getFileIconColor(item);

  return createPortal(
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center bg-black/40 dark:bg-[#020207]/80 ${DRIVE_MODAL_BACKDROP} p-4`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${item.name}`}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] ${DRIVE_MODAL_SURFACE} overflow-hidden flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-none`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${DRIVE_BORDER} ${DRIVE_SURFACE_SECONDARY}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={DRIVE_ICON_CONTAINER_SM}>
              <Icon className={`text-sm ${iconColor}`} />
            </div>
            <span className={`text-sm font-bold truncate ${DRIVE_TEXT_PRIMARY}`}>
              {item.name}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {item.webViewLink && (
              <a
                href={item.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg ${DRIVE_ROW_HOVER} ${DRIVE_TEXT_SECONDARY} hover:text-[#1F2937] dark:hover:text-[#EDEDED] transition-colors`}
                title="Open in Drive"
              >
                <FaExternalLinkAlt className="text-sm" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-lg ${DRIVE_ROW_HOVER} ${DRIVE_TEXT_SECONDARY} hover:text-[#1F2937] dark:hover:text-[#EDEDED] transition-colors`}
              aria-label="Close preview"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-[300px] flex items-center justify-center bg-[#F1F5F9]/50 dark:bg-[#1D1F23]/50">
          {item.previewUrl && canInlinePreview(item.mimeType) ? (
            item.mimeType.startsWith("image/") ? (
              <img
                src={item.previewUrl}
                alt={item.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <iframe
                src={item.previewUrl}
                title={item.name}
                className="w-full h-[70vh] border-0"
              />
            )
          ) : (
            <div className="text-center p-8">
              <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl ${DRIVE_SURFACE_SECONDARY}`}>
                <Icon className={`text-3xl ${iconColor}`} />
              </div>
              <p className={`text-sm mb-4 ${DRIVE_TEXT_SECONDARY}`}>
                Inline preview is not available for this file type.
              </p>
              {item.webViewLink && (
                <a
                  href={item.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 py-2.5 px-5 text-xs font-semibold transition-colors ${DRIVE_BTN_PRIMARY}`}
                >
                  <FaExternalLinkAlt />
                  Open in Google Drive
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

type DriveContextMenuProps = {
  menu: { x: number; y: number; item: DriveItem } | null;
  isMounted: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onPreview: (item: DriveItem) => void;
  onRename: (item: DriveItem) => void;
  onDelete: (item: DriveItem) => void;
};

const menuItemCls = `w-full flex items-center gap-2.5 px-3.5 py-2 text-xs ${DRIVE_TEXT_PRIMARY} ${DRIVE_ROW_HOVER} transition-colors`;

export function DriveContextMenu({
  menu,
  isMounted,
  isAdmin,
  onClose,
  onPreview,
  onRename,
  onDelete,
}: DriveContextMenuProps) {
  if (!menu || !isMounted) return null;

  const { item, x, y } = menu;

  return createPortal(
    <div
      className={`fixed z-[200] min-w-[168px] py-1 ${DRIVE_CONTEXT_MENU}`}
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      role="menu"
    >
      {!item.isFolder && item.previewUrl && (
        <button
          type="button"
          role="menuitem"
          className={menuItemCls}
          onClick={() => {
            onPreview(item);
            onClose();
          }}
        >
          <FaFile className={`text-[10px] ${DRIVE_TEXT_MUTED}`} /> Preview
        </button>
      )}
      {item.webViewLink && (
        <a
          href={item.webViewLink}
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          className={menuItemCls}
          onClick={onClose}
        >
          <FaExternalLinkAlt className={`text-[10px] ${DRIVE_TEXT_MUTED}`} /> Open in Drive
        </a>
      )}
      {!item.isFolder && (item.webContentLink || item.previewUrl) && (
        <a
          href={item.webContentLink || item.previewUrl || "#"}
          download
          role="menuitem"
          className={menuItemCls}
          onClick={onClose}
        >
          <FaDownload className={`text-[10px] ${DRIVE_TEXT_MUTED}`} /> Download
        </a>
      )}
      {isAdmin && (
        <>
          <div className={`my-1 border-t ${DRIVE_BORDER}`} />
          <button
            type="button"
            role="menuitem"
            className={menuItemCls}
            onClick={() => {
              onRename(item);
              onClose();
            }}
          >
            <FaEdit className={`text-[10px] ${DRIVE_TEXT_MUTED}`} /> Rename
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            onClick={() => {
              onDelete(item);
              onClose();
            }}
          >
            <FaTrash className="text-[10px]" /> Delete
          </button>
        </>
      )}
    </div>,
    document.body
  );
}

type DriveLinkSettingsModalProps = {
  open: boolean;
  isMounted: boolean;
  onClose: () => void;
  rootFolderId: string | null;
  rootFolderName: string | null;
  folderInput: string;
  onFolderInputChange: (value: string) => void;
  onValidateAndSave: () => void;
  onUnlink: () => void;
  isValidating: boolean;
  isUnlinking: boolean;
};

export function DriveLinkSettingsModal({
  open,
  isMounted,
  onClose,
  rootFolderId,
  rootFolderName,
  folderInput,
  onFolderInputChange,
  onValidateAndSave,
  onUnlink,
  isValidating,
  isUnlinking,
}: DriveLinkSettingsModalProps) {
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  useEffect(() => {
    if (!open) setConfirmUnlink(false);
  }, [open]);

  const linkLabel = rootFolderId ? "Update link" : "Validate & Link";
  const busy = isValidating || isUnlinking;

  return (
    <DriveModal
      open={open}
      isMounted={isMounted}
      title="Drive Link Settings"
      onClose={onClose}
      footer={
        <>
          {rootFolderId && !confirmUnlink ? (
            <button
              type="button"
              onClick={() => setConfirmUnlink(true)}
              disabled={busy}
              className="py-2 px-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-semibold text-[11px] transition-all flex items-center gap-2 border border-rose-200 dark:border-rose-500/30 disabled:opacity-40 mr-auto"
            >
              <FaUnlink />
              Unlink
            </button>
          ) : null}
          {confirmUnlink ? (
            <>
              <button
                type="button"
                onClick={() => setConfirmUnlink(false)}
                disabled={isUnlinking}
                className={DRIVE_BTN_SECONDARY}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onUnlink()}
                disabled={isUnlinking}
                className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold text-[11px] transition-all flex items-center gap-2"
              >
                {isUnlinking ? <FaSpinner className="animate-spin" /> : <FaUnlink />}
                Confirm unlink
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className={DRIVE_BTN_SECONDARY}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => void onValidateAndSave()}
                disabled={busy || !folderInput.trim()}
                className={DRIVE_BTN_PRIMARY}
              >
                {isValidating ? <FaSpinner className="animate-spin" /> : <FaLink />}
                {linkLabel}
              </button>
            </>
          )}
        </>
      }
    >
      {confirmUnlink ? (
        <p className={`text-xs ${DRIVE_TEXT_SECONDARY} leading-relaxed`}>
          Unlink{" "}
          <span className={`font-semibold ${DRIVE_TEXT_PRIMARY}`}>
            {rootFolderName || "this folder"}
          </span>
          ? The Drive tab will no longer browse this folder until you link a new one.
        </p>
      ) : (
        <DriveLinkSettingsContent
          rootFolderId={rootFolderId}
          rootFolderName={rootFolderName}
          folderInput={folderInput}
          onFolderInputChange={onFolderInputChange}
        />
      )}
    </DriveModal>
  );
}

type DriveModalProps = {
  open: boolean;
  isMounted: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function DriveModal({
  open,
  isMounted,
  title,
  onClose,
  children,
  footer,
}: DriveModalProps) {
  if (!open || !isMounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center bg-black/40 dark:bg-[#020207]/80 ${DRIVE_MODAL_BACKDROP} p-4`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-md ${DRIVE_MODAL_SURFACE} p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-none`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b ${DRIVE_BORDER} pb-3 mb-4`}>
          <h4 className={`text-sm font-bold ${DRIVE_TEXT_PRIMARY}`}>{title}</h4>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg ${DRIVE_ROW_HOVER} ${DRIVE_TEXT_SECONDARY} hover:text-[#1F2937] dark:hover:text-[#EDEDED] transition-colors`}
            aria-label="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
        {children}
        <div className="flex flex-wrap items-center justify-end gap-2 mt-4 w-full">{footer}</div>
      </div>
    </div>,
    document.body
  );
}
