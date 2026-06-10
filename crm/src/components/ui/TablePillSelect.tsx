"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import { TABLE_PILL_DROPDOWN_MAX_HEIGHT } from "@/utils/dropdownConstants";
import { CRM_DROPDOWN_SCROLL_CLASS } from "@/utils/dropdownScrollStyles";

export type TablePillOption = { value: string; label: string };

type TablePillSelectProps = {
  value: string;
  options: TablePillOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  portalId: string;
  getPillClassName: (value: string) => string;
  ariaLabel?: string;
  searchPlaceholder?: string;
  /** Override list max-height (e.g. status pill uses full height for all options). */
  maxMenuHeight?: number;
};

type MenuPosition = {
  top?: number;
  bottom?: number;
  left: number;
  minWidth: number;
};

const FORM_SELECT_THEME_CSS = `
  .table-pill-select {
    --form-bg: #020617;
    --form-border: #1e293b;
    --form-text: #e2e8f0;
    --form-focus: var(--color-violet-500, #3b82f6);
    --form-hover: #0f172a;
    --form-selected-bg: #1e293b;
    --form-selected-text: #a78bfa;
  }
  html.light .table-pill-select {
    --form-bg: #ffffff;
    --form-border: #cbd5e1;
    --form-text: #0f172a;
    --form-hover: #f1f5f9;
    --form-selected-bg: #e2e8f0;
    --form-selected-text: var(--color-violet-600, #2563eb);
  }
`;

function computeMenuPosition(trigger: HTMLElement, menuHeight: number): MenuPosition {
  const rect = trigger.getBoundingClientRect();
  const minWidth = Math.max(rect.width, 180);
  const gap = 4;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openAbove = spaceBelow < menuHeight && rect.top > spaceBelow;

  if (openAbove) {
    return {
      bottom: window.innerHeight - rect.top + gap,
      left: rect.left,
      minWidth,
    };
  }

  return {
    top: rect.bottom + gap,
    left: rect.left,
    minWidth,
  };
}

export function TablePillSelect({
  value,
  options,
  onChange,
  disabled,
  portalId,
  getPillClassName,
  ariaLabel,
  searchPlaceholder = "Search...",
  maxMenuHeight = TABLE_PILL_DROPDOWN_MAX_HEIGHT,
}: TablePillSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuPos, setMenuPos] = useState<MenuPosition>({ top: 0, left: 0, minWidth: 180 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value) ?? { value, label: value };
  const pillClass = getPillClassName(value);

  const filteredOptions = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, menuSearch]);

  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    setMenuPos(computeMenuPosition(triggerRef.current, maxMenuHeight));
  };

  const closeMenu = () => {
    setOpen(false);
    setMenuSearch("");
  };

  const openMenu = () => {
    if (disabled) return;
    updateMenuPosition();
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      closeMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    const handleReposition = () => updateMenuPosition();

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  const menu = open ? (
    <div
      ref={menuRef}
      id={portalId}
      role="listbox"
      className="table-pill-select"
      style={{
        position: "fixed",
        top: menuPos.top,
        bottom: menuPos.bottom,
        left: menuPos.left,
        minWidth: menuPos.minWidth,
        maxWidth: 280,
        zIndex: 99999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-lg border border-[var(--form-border)] bg-[var(--form-bg)] overflow-hidden overflow-x-hidden shadow-lg max-w-[280px]"
        style={{ boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)" }}
      >
        <div className="px-2 pt-2 pb-1.5 border-b border-[var(--form-border)]">
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 dark:text-slate-500 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-7 pr-2 py-1.5 text-[11px] rounded-md border border-[var(--form-border)] bg-[var(--form-bg)] text-[var(--form-text)] placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--form-focus)]"
            />
          </div>
        </div>
        <ul
          className={`table-pill__menu-list ${CRM_DROPDOWN_SCROLL_CLASS} overflow-y-auto overflow-x-hidden p-1`}
          style={{ maxHeight: maxMenuHeight }}
        >
          {filteredOptions.length === 0 ? (
            <li className="px-2.5 py-2 text-[11px] text-gray-400 dark:text-slate-500">No results</li>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      closeMenu();
                    }}
                    className={`w-full max-w-full text-left rounded-md px-2.5 py-2 text-[11px] leading-snug whitespace-nowrap overflow-hidden text-ellipsis transition-colors ${
                      isSelected
                        ? "bg-[var(--form-selected-bg)] text-[var(--form-selected-text)]"
                        : "text-[var(--form-text)] hover:bg-[var(--form-selected-bg)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  ) : null;

  return (
    <div className="table-pill-select inline-flex max-w-full items-center">
      <style>{FORM_SELECT_THEME_CSS}</style>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? `Select ${value}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (open) closeMenu();
          else openMenu();
        }}
        className={`inline-flex max-w-full items-center gap-0.5 rounded-full border-0 bg-transparent p-0 ${
          disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer"
        }`}
      >
        <span
          className={`inline-flex items-center max-w-full py-0.5 px-2.5 text-[11px] font-semibold rounded-full border leading-tight whitespace-nowrap ${pillClass}`}
        >
          <span className="truncate">{selected.label}</span>
        </span>
        <FiChevronDown className="shrink-0 text-[10px] text-gray-400 dark:text-slate-500 opacity-70" />
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
