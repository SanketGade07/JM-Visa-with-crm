"use client";

import React from "react";
import type { IconType } from "react-icons";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

export type ToggleOption<T extends string> = {
  id: T;
  label: string;
  count?: number;
  icon?: IconType;
};

export type TableViewToggleProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: ToggleOption<T>[];
  className?: string;
};

export function TableViewToggle<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: TableViewToggleProps<T>) {
  const { theme } = useCrmLayoutContext();

  return (
    <div
      role="tablist"
      className={`flex shrink-0 items-center p-1 rounded-xl ${
        theme === "light" ? "bg-gray-100/80" : "bg-slate-950 border border-slate-900"
      } ${className}`}
    >
      {options.map((option) => {
        const isActive = value === option.id;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={`flex-none flex items-center justify-center gap-1.5 whitespace-nowrap text-center py-1.5 px-4 rounded-lg text-[11px] font-medium transition-all duration-200 ${
              isActive
                ? theme === "light"
                  ? "bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.05)] font-semibold"
                  : "bg-slate-800 text-white shadow-md font-semibold"
                : theme === "light"
                  ? "text-gray-400 hover:text-gray-700"
                  : "text-slate-500 hover:text-slate-350"
            }`}
          >
            {Icon ? <Icon className="text-[13px] shrink-0" aria-hidden="true" /> : null}
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`tabular-nums text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? theme === "light"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-slate-700 text-slate-300"
                    : theme === "light"
                      ? "bg-gray-200/60 text-gray-500"
                      : "bg-slate-900 text-slate-500"
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
