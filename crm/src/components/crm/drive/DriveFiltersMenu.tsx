"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ComponentType } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import type { DriveTypeFilter } from "./driveUtils";
import {
  getDrivePortalMenuPosition,
  type DrivePortalMenuPosition,
} from "./driveUtils";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_DROPDOWN,
  DRIVE_OUTLINE_BTN,
  DRIVE_ROW_HOVER,
  DRIVE_TEXT_PRIMARY,
} from "./driveTheme";
import {
  FluentExcelIcon,
  FluentFolderIcon,
  FluentGenericFileIcon,
  FluentImageIcon,
  FluentPdfIcon,
  FluentPowerPointIcon,
  FluentWordIcon,
  type FluentIconProps,
} from "./icons";

type FilterOption = {
  value: DriveTypeFilter;
  label: string;
  Icon: ComponentType<FluentIconProps>;
};

const FILTER_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Files", Icon: FluentGenericFileIcon },
  { value: "folders", label: "Folders", Icon: FluentFolderIcon },
  { value: "google-docs", label: "Google Docs", Icon: FluentWordIcon },
  { value: "google-sheets", label: "Google Sheets", Icon: FluentExcelIcon },
  { value: "google-slides", label: "Google Slides", Icon: FluentPowerPointIcon },
  { value: "images", label: "Images", Icon: FluentImageIcon },
  { value: "pdfs", label: "PDFs", Icon: FluentPdfIcon },
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
  const [menuPos, setMenuPos] = useState<DrivePortalMenuPosition>({
    top: 0,
    right: 8,
    minWidth: 200,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);

  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    setMenuPos(getDrivePortalMenuPosition(triggerRef.current, 200));
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const onReposition = () => updateMenuPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  const handleSelect = (filter: DriveTypeFilter) => {
    onTypeFilterChange(filter);
    close();
  };

  const menu =
    open && typeof document !== "undefined" ? (
      <>
        <div className="fixed inset-0 z-[140]" onClick={close} aria-hidden />
        <div
          role="menu"
          className={`fixed z-[150] py-1.5 ${DRIVE_DROPDOWN}`}
          style={{
            top: menuPos.top,
            right: menuPos.right,
            minWidth: menuPos.minWidth,
          }}
        >
          {FILTER_OPTIONS.map(({ value, label, Icon }) => {
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
                <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                  <Icon size={14} />
                </span>
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
    ) : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${DRIVE_OUTLINE_BTN}${typeFilter !== "all" ? " border-blue-600/40 dark:border-blue-400/40" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <FiFilter className="text-[13px]" />
        Filters
        <FaChevronDown className="text-[9px] opacity-70" />
      </button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
