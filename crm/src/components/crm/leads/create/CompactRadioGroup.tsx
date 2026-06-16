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
};

export function CompactRadioGroup<T extends string>({
  name,
  value,
  options,
  onChange,
}: CompactRadioGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`relative inline-flex h-10 items-center gap-2 px-3 rounded-xl border cursor-pointer transition-colors ${
              selected
                ? "border-violet-600 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="crm-radio-input"
            />
            <span
              className={`crm-radio-dot${selected ? " crm-radio-dot--checked" : ""}`}
              aria-hidden="true"
            >
              {selected ? <span className="crm-radio-dot__inner" /> : null}
            </span>
            <span className="text-xs font-semibold leading-none">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
