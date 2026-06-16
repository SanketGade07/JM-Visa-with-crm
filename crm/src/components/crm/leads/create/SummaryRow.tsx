"use client";

import React from "react";

type SummaryRowProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

export function SummaryRow({ label, value, className = "" }: SummaryRowProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-[minmax(0,8.5rem)_1fr] gap-0.5 sm:gap-x-4 sm:gap-y-0 py-2.5 border-b border-slate-200/60 dark:border-slate-800/40 last:border-b-0 ${className}`}
    >
      <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
        {label}
      </dt>
      <dd className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug break-words min-w-0 sm:text-right">
        {value}
      </dd>
    </div>
  );
}

export function summaryNotSet() {
  return (
    <span className="text-slate-400 dark:text-slate-500 font-normal italic text-xs">
      Not set
    </span>
  );
}

export function summaryMaskPassword(value: string) {
  if (!value.trim()) {
    return summaryNotSet();
  }
  return (
    <span className="tracking-widest text-slate-600 dark:text-slate-300" aria-label="Password hidden">
      {"•".repeat(Math.min(Math.max(value.length, 8), 12))}
    </span>
  );
}

export function summaryText(value: string | undefined | null) {
  if (!value?.trim()) {
    return summaryNotSet();
  }
  return value.trim();
}
