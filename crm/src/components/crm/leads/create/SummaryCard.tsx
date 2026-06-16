"use client";

import React from "react";
import { FiEdit2 } from "react-icons/fi";
import type { WizardStepId } from "./WizardProgress";

type SummaryCardProps = {
  title: string;
  step: WizardStepId;
  onEdit: (step: WizardStepId) => void;
  children: React.ReactNode;
  className?: string;
};

export function SummaryCard({ title, step, onEdit, children, className = "" }: SummaryCardProps) {
  return (
    <section
      className={`flex h-full flex-col rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/25 overflow-hidden ${className}`}
    >
      <header className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-0 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors rounded-lg px-2 py-0.5 -mr-1 hover:bg-violet-50 dark:hover:bg-violet-950/30"
        >
          <FiEdit2 className="w-3.5 h-3.5" aria-hidden />
          Edit
        </button>
      </header>
      <dl className="flex-1 px-4 pt-2.5 pb-3">{children}</dl>
    </section>
  );
}
