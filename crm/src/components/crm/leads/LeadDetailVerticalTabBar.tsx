"use client";

import React from "react";
import {
  segmentedTabBadgeHeaderClass,
  segmentedTabButtonHeaderClass,
} from "@/components/ui/segmentedTabStyles";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { LEAD_DETAIL_TAB_ITEMS, type LeadDetailTab } from "./leadDetailTabConfig";

export type { LeadDetailTab };

type LeadDetailVerticalTabBarProps = {
  activeTab: LeadDetailTab;
  onTabChange: (tab: LeadDetailTab) => void;
  checklistPct?: number;
  className?: string;
  /** Horizontal scroll strip on mobile; vertical rail on md+. */
  orientation?: "auto" | "horizontal" | "vertical";
};

const leadDetailTabListBaseClass =
  "flex shrink-0 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-[#1a2332] dark:bg-[#070b12]";

function tabListClassName(orientation: LeadDetailVerticalTabBarProps["orientation"]) {
  if (orientation === "horizontal") {
    return `${leadDetailTabListBaseClass} lead-detail-vertical-tabs lead-detail-vertical-tabs--horizontal w-full flex-row overflow-x-auto`;
  }
  if (orientation === "vertical") {
    return `${leadDetailTabListBaseClass} lead-detail-vertical-tabs lead-detail-vertical-tabs--vertical flex-col w-full max-w-[72px]`;
  }
  return `${leadDetailTabListBaseClass} lead-detail-vertical-tabs flex-row overflow-x-auto w-full md:flex-col md:overflow-visible md:w-[72px] md:max-w-[72px]`;
}

function tabButtonClassName(isActive: boolean, orientation: LeadDetailVerticalTabBarProps["orientation"]) {
  const base = segmentedTabButtonHeaderClass(isActive);
  if (orientation === "vertical") {
    return `${base} w-full flex-col gap-1 px-2 py-2.5 shrink-0`;
  }
  if (orientation === "horizontal") {
    return `${base} shrink-0`;
  }
  return `${base} shrink-0 md:w-full md:flex-col md:gap-1 md:px-2 md:py-2.5`;
}

export function LeadDetailVerticalTabBar({
  activeTab,
  onTabChange,
  checklistPct,
  className = "",
  orientation = "auto",
}: LeadDetailVerticalTabBarProps) {
  const { userAllowedTabs, canAccessLeadChecklist } = useCrmLayoutContext();

  const visibleTabs = LEAD_DETAIL_TAB_ITEMS.filter((tab) => {
    if (tab.id === "details") return userAllowedTabs.includes("LeadDetails_Details");
    if (tab.id === "checklist") return userAllowedTabs.includes("LeadDetails_Checklist") && canAccessLeadChecklist;
    if (tab.id === "drive") return userAllowedTabs.includes("LeadDetails_Drive");
    if (tab.id === "settings") return userAllowedTabs.includes("LeadDetails_Settings");
    return true;
  });

  return (
    <nav
      aria-label="Lead detail sections"
      className={`shrink-0 ${className}`.trim()}
    >
      <div
        role="tablist"
        className={tabListClassName(orientation)}
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
              className={tabButtonClassName(isActive, orientation)}
            >
              <span className="text-center leading-tight">{tab.label}</span>
              {tab.id === "checklist" && checklistPct !== undefined && (
                <span className={segmentedTabBadgeHeaderClass(isActive)}>
                  {checklistPct}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
