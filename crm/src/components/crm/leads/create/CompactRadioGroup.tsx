"use client";

import React from "react";

type CompactRadioOption<T extends string> = {
  value: T;
  label: string;
};

type CompactRadioGroupProps<T extends string> = {
  name: string;
  value: T | "";
  options: CompactRadioOption<T>[];
  onChange: (value: T) => void;
  firstOptionId?: string;
  error?: string;
};

export function CompactRadioGroup<T extends string>({
  name,
  value,
  options,
  onChange,
  firstOptionId,
  error,
}: CompactRadioGroupProps<T>) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        {options.map((opt, index) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`relative inline-flex h-10 items-center gap-2 px-3 rounded-xl border cursor-pointer transition-colors ${
                selected
                  ? "border-violet-600 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }${error ? " border-red-500 dark:border-red-500" : ""}`}
            >
              <input
                id={index === 0 ? firstOptionId : undefined}
                type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="crm-radio-input"
            />
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                selected
                  ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              }`}
              aria-hidden="true"
            >
              {selected && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  viewBox="0 0 12 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1.5 5.2L4.2 8L10.5 1.5" />
                </svg>
              )}
            </span>
            <span className="text-xs font-semibold leading-none">{opt.label}</span>
          </label>
        );
      })}
      </div>
      {error ? (
        <p className="text-red-500 dark:text-red-400 text-[10px] font-medium">{error}</p>
      ) : null}
    </div>
  );
}
