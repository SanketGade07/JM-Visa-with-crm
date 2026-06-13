"use client";

import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_BORDER,
  DRIVE_INPUT,
  DRIVE_SURFACE_SECONDARY,
  DRIVE_TEXT_MUTED,
  DRIVE_TEXT_PRIMARY,
  DRIVE_TEXT_SECONDARY,
} from "./driveTheme";

export type DriveLinkSettingsContentProps = {
  rootFolderId: string | null;
  rootFolderName: string | null;
  folderInput: string;
  onFolderInputChange: (value: string) => void;
};

const DRIVE_INPUT_CLS = `w-full text-sm py-2.5 px-4 shadow-sm ${DRIVE_INPUT}`;

export function DriveLinkSettingsContent({
  rootFolderId,
  rootFolderName,
  folderInput,
  onFolderInputChange,
}: DriveLinkSettingsContentProps) {
  return (
    <div className="space-y-4">
      {rootFolderId ? (
        <div
          className={`p-3 rounded-xl border text-xs ${DRIVE_SURFACE_SECONDARY} ${DRIVE_BORDER}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className={DRIVE_TEXT_MUTED}>Linked folder</p>
              <p className={`font-semibold ${DRIVE_TEXT_PRIMARY} truncate`}>
                {rootFolderName || "Root folder"}
              </p>
              <code
                className={`block ${DRIVE_ACCENT_TEXT} font-mono text-[11px] break-all`}
              >
                {rootFolderId}
              </code>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
              <FaCheckCircle className="text-[9px]" />
              Connected
            </span>
          </div>
        </div>
      ) : (
        <p className={`text-xs ${DRIVE_TEXT_SECONDARY} leading-relaxed`}>
          Paste your Google Drive root folder URL or ID to connect.
        </p>
      )}

      <div>
        <label
          htmlFor="drive-folder-input"
          className={`block text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${DRIVE_TEXT_SECONDARY}`}
        >
          {rootFolderId ? "New folder URL or ID" : "Folder URL or ID"}
        </label>
        <input
          id="drive-folder-input"
          type="text"
          value={folderInput}
          onChange={(e) => onFolderInputChange(e.target.value)}
          placeholder="Paste Drive folder URL or ID…"
          className={DRIVE_INPUT_CLS}
        />
      </div>

      <p className={`text-[11px] ${DRIVE_TEXT_MUTED} leading-relaxed`}>
        Share the root folder with your Storage Owner Gmail as{" "}
        <span className={`font-semibold ${DRIVE_TEXT_SECONDARY}`}>Editor</span>{" "}
        before linking.
      </p>
    </div>
  );
}
