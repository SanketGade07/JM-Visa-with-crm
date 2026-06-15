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

const headerBase =
  "inline-flex items-center gap-1.5 max-w-full min-w-0 border-0 bg-transparent p-0 text-[13px] font-semibold text-slate-500 dark:text-slate-400 transition-all duration-150";

const iconIdle = "shrink-0 text-[13px] text-slate-400 dark:text-slate-500";
const iconHighlight = "shrink-0 text-[13px] text-sky-600 dark:text-sky-400";

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
      <div ref={containerRef} className={`relative ${headerBase}`}>
        <FiSearch className={iconHighlight} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder || label}
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
          className="column-search__input w-full min-w-0 bg-transparent border-0 shadow-none text-[13px] font-semibold normal-case tracking-normal py-0 pl-0 pr-6 rounded-none focus:outline-none focus:ring-0 text-slate-500 dark:text-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150"
        />
        {value.trim().length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              inputRef.current?.focus();
            }}
            className="absolute right-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-all duration-150"
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
        className={`${headerBase} hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer`}
        aria-label={`Search ${label}`}
      >
        <FiSearch
          className={hasFilter ? iconHighlight : iconIdle}
          aria-hidden="true"
        />
        <span className="truncate normal-case">{label}</span>
      </button>
    </div>
  );
}
