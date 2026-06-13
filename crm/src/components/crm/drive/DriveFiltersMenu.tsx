"use client";

import React, { useState } from "react";
import {
  FaCheck,
  FaChevronDown,
  FaFile,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFolder,
} from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { DriveTypeFilter } from "./driveUtils";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_DROPDOWN,
  DRIVE_FOLDER_ICON_COLOR,
  DRIVE_ICON_DEFAULT,
  DRIVE_ICON_GOOGLE,
  DRIVE_ICON_IMAGE,
  DRIVE_ICON_PDF,
  DRIVE_OUTLINE_BTN,
  DRIVE_ROW_HOVER,
  DRIVE_TEXT_PRIMARY,
} from "./driveTheme";

type FilterOption = {
  value: DriveTypeFilter;
  label: string;
  icon: IconType;
  color: string;
};

const FILTER_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Files", icon: FaFile, color: DRIVE_ICON_DEFAULT },
  { value: "folders", label: "Folders", icon: FaFolder, color: DRIVE_FOLDER_ICON_COLOR },
  {
    value: "google-docs",
    label: "Google Docs",
    icon: FaFileWord,
    color: DRIVE_ICON_GOOGLE,
  },
  {
    value: "google-sheets",
    label: "Google Sheets",
    icon: FaFileExcel,
    color: DRIVE_ICON_GOOGLE,
  },
  {
    value: "google-slides",
    label: "Google Slides",
    icon: FaFileWord,
    color: DRIVE_ICON_GOOGLE,
  },
  { value: "images", label: "Images", icon: FaFileImage, color: DRIVE_ICON_IMAGE },
  { value: "pdfs", label: "PDFs", icon: FaFilePdf, color: DRIVE_ICON_PDF },
];

type DriveFiltersMenuProps = {
  typeFilter: DriveTypeFilter;
  onTypeFilterChange: (filter: DriveTypeFilter) => void;
};

export function DriveFiltersMenu({
  typeFilter,
  onTypeFilterChange,
}: DriveFiltersMenuProps) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleSelect = (filter: DriveTypeFilter) => {
    onTypeFilterChange(filter);
    close();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${DRIVE_OUTLINE_BTN}${typeFilter !== "all" ? " border-violet-600/40 dark:border-blue-400/40" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <FiFilter className="text-[13px]" />
        Filters
        <FaChevronDown className="text-[9px] opacity-70" />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={close} aria-hidden />
          <div
            role="menu"
            className={`absolute right-0 top-full mt-1.5 min-w-[200px] py-1.5 z-20 ${DRIVE_DROPDOWN}`}
          >
            {FILTER_OPTIONS.map(({ value, label, icon: Icon, color }) => {
              const isActive = typeFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(value)}
                  className={`w-full flex items-center gap-3 px-3.5 h-9 text-left text-[11px] font-semibold uppercase transition-colors ${
                    isActive ? DRIVE_ACCENT_TEXT : DRIVE_TEXT_PRIMARY
                  } ${DRIVE_ROW_HOVER}`}
                >
                  <Icon className={`text-sm shrink-0 ${color}`} />
                  <span className="flex-1 truncate">{label}</span>
                  {isActive ? (
                    <FaCheck className="text-[10px] shrink-0" />
                  ) : (
                    <span className="w-2.5 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
