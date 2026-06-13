"use client";

import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
  FaPlus,
  FaSpinner,
  FaUpload,
} from "react-icons/fa";
import {
  DRIVE_DROPDOWN,
  DRIVE_OUTLINE_BTN,
  DRIVE_ROW_HOVER,
  DRIVE_TEXT_MUTED,
  DRIVE_TEXT_PRIMARY,
} from "./driveTheme";

const GOOGLE_FILE_TYPES = [
  ["document", "Google Docs", "N"],
  ["spreadsheet", "Google Sheets", "S"],
  ["presentation", "Google Slides", "P"],
] as const;

type DriveNewMenuProps = {
  isUploading: boolean;
  onNewFolder: () => void;
  onUploadClick: () => void;
  onFolderUploadClick?: () => void;
  onCreateGoogleFile: (type: "document" | "spreadsheet" | "presentation") => void;
};

export function DriveNewMenu({
  isUploading,
  onNewFolder,
  onUploadClick,
  onFolderUploadClick,
  onCreateGoogleFile,
}: DriveNewMenuProps) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleAction = (action: () => void) => {
    action();
    close();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={DRIVE_OUTLINE_BTN}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <FaPlus className="text-[10px]" />
        New
        <FaChevronDown className="text-[9px] opacity-70" />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={close} aria-hidden />
          <div
            role="menu"
            className={`absolute right-0 top-full mt-1.5 min-w-[220px] py-1.5 z-20 ${DRIVE_DROPDOWN}`}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(onNewFolder)}
              className={`w-full flex items-center gap-3 px-3.5 h-9 text-left text-[11px] font-semibold uppercase ${DRIVE_TEXT_PRIMARY} ${DRIVE_ROW_HOVER} transition-colors`}
            >
              <FaFolder className="text-sm text-violet-600 dark:text-blue-400 shrink-0" />
              <span className="flex-1">New folder</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(onUploadClick)}
              disabled={isUploading}
              className={`w-full flex items-center gap-3 px-3.5 h-9 text-left text-[11px] font-semibold uppercase ${DRIVE_TEXT_PRIMARY} ${DRIVE_ROW_HOVER} transition-colors disabled:opacity-40`}
            >
              {isUploading ? (
                <FaSpinner className="text-sm animate-spin shrink-0" />
              ) : (
                <FaUpload className="text-sm text-violet-600 dark:text-blue-400 shrink-0" />
              )}
              <span className="flex-1">File upload</span>
            </button>

            {onFolderUploadClick ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => handleAction(onFolderUploadClick)}
                disabled={isUploading}
                className={`w-full flex items-center gap-3 px-3.5 h-9 text-left text-[11px] font-semibold uppercase ${DRIVE_TEXT_PRIMARY} ${DRIVE_ROW_HOVER} transition-colors disabled:opacity-40`}
              >
                <FaFolderOpen className="text-sm text-violet-600 dark:text-blue-400 shrink-0" />
                <span className="flex-1">Folder upload</span>
              </button>
            ) : null}

            <div className="my-1 border-t border-slate-200 dark:border-[#2A2D33]" />

            {GOOGLE_FILE_TYPES.map(([type, label, hint]) => (
              <button
                key={type}
                type="button"
                role="menuitem"
                onClick={() => handleAction(() => onCreateGoogleFile(type))}
                className={`w-full flex items-center gap-3 px-3.5 h-9 text-left text-[11px] font-semibold uppercase ${DRIVE_TEXT_PRIMARY} ${DRIVE_ROW_HOVER} transition-colors`}
              >
                <span className="w-5 text-center text-blue-600 dark:text-blue-400 text-xs font-bold shrink-0">
                  G
                </span>
                <span className="flex-1 truncate">{label}</span>
                <FaChevronRight className="text-[9px] opacity-50 shrink-0" />
                <span className={`text-[9px] ${DRIVE_TEXT_MUTED} shrink-0`}>{hint}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
