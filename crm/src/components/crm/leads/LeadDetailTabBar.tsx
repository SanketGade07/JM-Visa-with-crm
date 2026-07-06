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
  const { userAllowedTabs, canAccessLeadChecklist } = useCrmLayoutContext();

  const visibleTabs = LEAD_DETAIL_TAB_ITEMS.filter((tab) => {
    if (tab.id === "details") return userAllowedTabs.includes("LeadDetails_Details");
    if (tab.id === "checklist") return userAllowedTabs.includes("LeadDetails_Checklist") && canAccessLeadChecklist;
    if (tab.id === "drive") return userAllowedTabs.includes("LeadDetails_Drive");
    if (tab.id === "settings") return userAllowedTabs.includes("LeadDetails_Settings");
    return true;
  });

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
