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

  const focusInputAtStart = () => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(0, 0);
  };

  useEffect(() => {
    if (isActive) {
      focusInputAtStart();
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
    const hasTyped = value.length > 0;

    return (
      <div
        ref={containerRef}
        className={`relative ${headerBase} !cursor-text`}
        onClick={focusInputAtStart}
      >
        <FiSearch className={iconHighlight} aria-hidden="true" />
        <span className="inline-flex min-w-0 items-center gap-0">
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
            style={{
              width: hasTyped ? `${Math.max(value.length, 1)}ch` : "2px",
              maxWidth: hasTyped ? "100%" : undefined,
            }}
            className="column-search__input inline-block min-w-0 shrink-0 bg-transparent border-0 shadow-none text-[13px] font-semibold normal-case tracking-normal py-0 pl-0 pr-0 rounded-none focus:outline-none focus:ring-0 !cursor-text text-slate-500 dark:text-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150"
          />
          {!hasTyped && (
            <span className="truncate normal-case shrink-0 pointer-events-none">{label}</span>
          )}
        </span>
        {value.trim().length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              focusInputAtStart();
            }}
            className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-all duration-150 cursor-pointer"
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
        className={`${headerBase} hover:text-slate-600 dark:hover:text-slate-300 !cursor-text`}
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
