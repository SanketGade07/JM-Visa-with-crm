"use client";

import React, { useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import {
  DRIVE_BORDER,
  DRIVE_FOCUS_RING,
  DRIVE_INPUT,
  DRIVE_TEXT_MUTED,
  DRIVE_TEXT_PRIMARY,
} from "./driveTheme";

type DriveSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DriveSearchBar({ value, onChange }: DriveSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-[480px] mx-auto">
      <FiSearch
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] pointer-events-none ${DRIVE_TEXT_MUTED}`}
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search files and folders..."
        className={`w-full h-9 pl-10 pr-[4.75rem] rounded-lg text-[13px] shadow-sm dark:shadow-none ${DRIVE_INPUT} ${DRIVE_FOCUS_RING} ${DRIVE_TEXT_PRIMARY}`}
        aria-label="Search files and folders"
      />
      <kbd
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 text-[10px] leading-none font-medium px-1.5 py-[3px] rounded-md border ${DRIVE_BORDER} ${DRIVE_TEXT_MUTED} bg-gray-50 dark:bg-[#0a0e1f] pointer-events-none font-sans`}
        aria-hidden
      >
        Ctrl K
      </kbd>
    </div>
  );
}
