"use client";

import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaLink,
  FaPlus,
  FaSpinner,
} from "react-icons/fa";
import {
  DRIVE_DROPDOWN,
  DRIVE_OUTLINE_BTN,
  DRIVE_ROW_HOVER,
  DRIVE_TEXT_PRIMARY,
} from "./driveTheme";
import {
  FluentExcelIcon,
  FluentFolderIcon,
  FluentNewFileIcon,
  FluentPowerPointIcon,
  FluentUploadIcon,
  FluentWordIcon,
} from "./icons";

const GOOGLE_FILE_TYPES = [
  { type: "document" as const, label: "Google Docs", Icon: FluentWordIcon },
  { type: "spreadsheet" as const, label: "Google Sheets", Icon: FluentExcelIcon },
  { type: "presentation" as const, label: "Google Slides", Icon: FluentPowerPointIcon },
];

type DriveNewMenuProps = {
  isUploading: boolean;
  onNewFolder: () => void;
  onNewFile: () => void;
  onUploadClick: () => void;
  onFolderUploadClick?: () => void;
  onCreateGoogleFile: (type: "document" | "spreadsheet" | "presentation") => void;
  onOpenLinkSettings?: () => void;
};

export function DriveNewMenu({
  isUploading,
  onNewFolder,
  onNewFile,
  onUploadClick,
  onFolderUploadClick,
  onCreateGoogleFile,
  onOpenLinkSettings,
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
              <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                <FluentFolderIcon size={18} colorIndex={0} />
              </span>
              <span className="flex-1">New folder</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(onNewFile)}
              className={`w-full flex items-center gap-3 px-3.5 h-9 text-left text-[11px] font-semibold uppercase ${DRIVE_TEXT_PRIMARY} ${DRIVE_ROW_HOVER} transition-colors`}
            >
              <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                <FluentNewFileIcon size={18} />
              </span>
              <span className="flex-1">New file</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(onUploadClick)}
              disabled={isUploading}
              className={`w-full flex items-center gap-3 px-3.5 h-9 text-left text-[11px] font-semibold uppercase ${DRIVE_TEXT_PRIMARY} ${DRIVE_ROW_HOVER} transition-colors disabled:opacity-40`}
            >
              <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                {isUploading ? (
                  <FaSpinner className="text-sm animate-spin" />
                ) : (
                  <FluentUploadIcon size={18} />
                )}
              </span>
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
                <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                  <FluentFolderIcon size={18} colorIndex={4} />
                </span>
                <span className="flex-1">Folder upload</span>
              </button>
            ) : null}

            <div className="my-1 border-t border-slate-200 dark:border-[#2A2D33]" />

            {GOOGLE_FILE_TYPES.map(({ type, label, Icon }) => (
              <button
                key={type}
                type="button"
                role="menuitem"
                onClick={() => handleAction(() => onCreateGoogleFile(type))}
                className={`w-full flex items-center gap-3 px-3.5 h-9 text-left text-[11px] font-semibold uppercase ${DRIVE_TEXT_PRIMARY} ${DRIVE_ROW_HOVER} transition-colors`}
              >
                <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                  <Icon size={18} />
                </span>
                <span className="flex-1 truncate">{label}</span>
                <FaChevronRight className="text-[9px] opacity-50 shrink-0" />
              </button>
            ))}

            {onOpenLinkSettings ? (
              <>
                <div className="my-1 border-t border-slate-200 dark:border-[#2A2D33]" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleAction(onOpenLinkSettings)}
                  className={`w-full flex items-center gap-3 px-3.5 h-9 text-left text-[11px] font-semibold uppercase ${DRIVE_TEXT_PRIMARY} ${DRIVE_ROW_HOVER} transition-colors`}
                >
                  <FaLink className="text-sm text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="flex-1 normal-case font-medium">Drive link settings…</span>
                </button>
              </>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
