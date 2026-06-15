"use client";

import React from "react";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

export type LeadDetailTab = "checklist" | "drive" | "settings";

const TABS: { id: LeadDetailTab; label: string }[] = [
  { id: "checklist", label: "CHECKLIST" },
  { id: "drive", label: "DRIVE" },
  { id: "settings", label: "SETTINGS" },
];

type LeadDetailTabBarProps = {
  activeTab: LeadDetailTab;
  onTabChange: (tab: LeadDetailTab) => void;
  checklistPct?: number;
};

export function LeadDetailTabBar({
  activeTab,
  onTabChange,
  checklistPct,
}: LeadDetailTabBarProps) {
  const { canAccessLeadChecklist } = useCrmLayoutContext();

  const visibleTabs = TABS.filter(
    (tab) => tab.id !== "checklist" || canAccessLeadChecklist
  );

  return (
    <div
      role="tablist"
      aria-label="Lead detail sections"
      className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900"
    >
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all duration-200 sm:px-4 ${
              isActive
                ? "border-blue-600 bg-white text-slate-900 shadow-sm dark:border-blue-400 dark:bg-slate-800 dark:text-white"
                : "border-transparent text-slate-500 hover:bg-white hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            {tab.id === "checklist" && checklistPct !== undefined && (
              <span
                className={`tabular-nums rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-950 dark:text-slate-400"
                }`}
              >
                {checklistPct}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
