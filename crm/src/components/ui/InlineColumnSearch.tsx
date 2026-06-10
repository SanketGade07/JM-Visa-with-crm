"use client";

import React, { useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";

export type InlineColumnSearchProps = {
  columnKey: string;
  label: string;
  placeholder: string;
  value: string;
  isActive: boolean;
  hasFilter: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onChange: (value: string) => void;
  onClear: () => void;
};

const pillActive =
  "inline-flex items-center gap-1.5 min-h-[30px] min-w-[155px] max-w-full px-2.5 py-1 rounded-lg border border-blue-500 dark:border-blue-500 bg-white dark:bg-slate-900 text-[11px] font-semibold text-gray-700 dark:text-slate-200 shadow-[0_0_0_1px_#3b82f6] transition-all duration-150";

const headerIdle =
  "group inline-flex items-center gap-1.5 max-w-full border-0 bg-transparent p-0 text-[13px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-150";

export function InlineColumnSearch({
  label,
  placeholder,
  value,
  isActive,
  hasFilter,
  onActivate,
  onDeactivate,
  onChange,
  onClear,
}: InlineColumnSearchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onDeactivate();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isActive, onDeactivate]);

  if (isActive) {
    return (
      <div
        ref={containerRef}
        className={`relative ${pillActive} pr-7`}
      >
        <FiSearch className="shrink-0 text-[11px] text-gray-400 dark:text-slate-500" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              onDeactivate();
            }
            if (e.key === "Enter") {
              e.preventDefault();
              onDeactivate();
            }
          }}
          className="column-search__input w-full min-w-0 bg-transparent border-0 shadow-none text-[11px] font-medium normal-case tracking-normal py-0 pl-0 pr-0 rounded-none focus:outline-none focus:ring-0 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 transition-all duration-150"
        />
        {value.trim().length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              inputRef.current?.focus();
            }}
            className="absolute right-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-150"
            aria-label={`Clear ${label} search`}
          >
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="w-2.5 h-2.5">
              <path
                d="M3.25 3.25l5.5 5.5M8.75 3.25l-5.5 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <button
        type="button"
        onClick={onActivate}
        className={headerIdle}
        aria-label={`Search ${label}`}
      >
        <FiSearch
          className={`shrink-0 text-[11px] transition-all duration-150 ${
            hasFilter
              ? "opacity-70"
              : "w-0 opacity-0 overflow-hidden group-hover:w-auto group-hover:opacity-60"
          }`}
        />
        <span className="truncate normal-case">{label}</span>
      </button>
    </div>
  );
}
