"use client";

import React from "react";
import {
  segmentedTabBadgeHeaderClass,
  segmentedTabButtonHeaderClass,
  segmentedTabListHeaderClass,
} from "@/components/ui/segmentedTabStyles";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { LEAD_DETAIL_TAB_ITEMS, type LeadDetailTab } from "./leadDetailTabConfig";

export type { LeadDetailTab };

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

  const visibleTabs = LEAD_DETAIL_TAB_ITEMS.filter(
    (tab) => tab.id !== "checklist" || canAccessLeadChecklist
  );

  return (
    <div
      role="tablist"
      aria-label="Lead detail sections"
      className={segmentedTabListHeaderClass}
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
            className={segmentedTabButtonHeaderClass(isActive)}
          >
            <span>{tab.label}</span>
            {tab.id === "checklist" && checklistPct !== undefined && (
              <span className={segmentedTabBadgeHeaderClass(isActive)}>
                {checklistPct}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
