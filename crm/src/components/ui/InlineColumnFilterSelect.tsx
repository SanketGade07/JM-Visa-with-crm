"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiSearch } from "react-icons/fi";
import { FILTER_DROPDOWN_MAX_HEIGHT } from "@/utils/dropdownConstants";
import { CRM_DROPDOWN_SCROLL_CLASS } from "@/utils/dropdownScrollStyles";

export type InlineColumnFilterSelectProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  clearValue?: string;
  placeholder?: string;
  portalId: string;
  isActive: boolean;
  hasFilter: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onChange: (value: string) => void;
};

const headerIdle =
  "group inline-flex items-center gap-1.5 max-w-full border-0 bg-transparent p-0 text-[13px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-150 cursor-pointer";

const FILTER_THEME_CSS = `
  .inline-column-filter {
    --form-bg: #020617;
    --form-border: #1e293b;
    --form-text: #e2e8f0;
    --form-focus: var(--color-violet-500, #3b82f6);
    --form-selected-bg: #1e293b;
    --form-selected-text: #a78bfa;
  }
  html.light .inline-column-filter {
    --form-bg: #ffffff;
    --form-border: #cbd5e1;
    --form-text: #0f172a;
    --form-selected-bg: #e2e8f0;
    --form-selected-text: var(--color-violet-600, #2563eb);
  }
`;

type MenuPosition = { top: number; left: number; minWidth: number };

function computeMenuPosition(anchor: HTMLElement): MenuPosition {
  const rect = anchor.getBoundingClientRect();
  return {
    top: rect.bottom + 4,
    left: rect.left,
    minWidth: Math.max(rect.width, 180),
  };
}

export function InlineColumnFilterSelect({
  label,
  value,
  options,
  clearValue = "All",
  placeholder = "Search...",
  portalId,
  isActive,
  hasFilter,
  onActivate,
  onDeactivate,
  onChange,
}: InlineColumnFilterSelectProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuPos, setMenuPos] = useState<MenuPosition>({ top: 0, left: 0, minWidth: 180 });
  const anchorRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, menuSearch]);

  const updateMenuPosition = () => {
    if (!anchorRef.current) return;
    setMenuPos(computeMenuPosition(anchorRef.current));
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuSearch("");
    onDeactivate();
  };

  const openMenu = () => {
    onActivate();
    updateMenuPosition();
    setMenuOpen(true);
  };

  useLayoutEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();
    searchRef.current?.focus();
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || menuRef.current?.contains(target)) return;
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
  }, [menuOpen]);

  useEffect(() => {
    if (!isActive && menuOpen) {
      setMenuOpen(false);
      setMenuSearch("");
    }
  }, [isActive, menuOpen]);

  const menu = menuOpen ? (
    <div
      ref={menuRef}
      id={portalId}
      role="listbox"
      className="inline-column-filter"
      style={{
        position: "fixed",
        top: menuPos.top,
        left: menuPos.left,
        minWidth: menuPos.minWidth,
        maxWidth: 280,
        zIndex: 99999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="rounded-lg border border-[var(--form-border)] bg-[var(--form-bg)] overflow-hidden overflow-x-hidden shadow-lg max-w-[280px]">
        <div className="px-2 pt-2 pb-1.5 border-b border-[var(--form-border)]">
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 dark:text-slate-500 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-7 pr-2 py-1.5 text-[11px] rounded-md border border-[var(--form-border)] bg-[var(--form-bg)] text-[var(--form-text)] placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--form-focus)]"
            />
          </div>
        </div>
        <ul
          className={`inline-column-filter__menu-list ${CRM_DROPDOWN_SCROLL_CLASS} overflow-y-auto overflow-x-hidden p-1`}
          style={{ maxHeight: FILTER_DROPDOWN_MAX_HEIGHT }}
        >
          {filteredOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setMenuOpen(false);
                    setMenuSearch("");
                    onDeactivate();
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
          })}
        </ul>
      </div>
    </div>
  ) : null;

  return (
    <div className="inline-column-filter">
      <style>{FILTER_THEME_CSS}</style>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => (menuOpen ? closeMenu() : openMenu())}
        className={headerIdle}
        aria-label={`Filter ${label}`}
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
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
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
