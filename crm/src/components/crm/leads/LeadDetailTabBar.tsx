"use client";

import React from "react";
import {
  segmentedTabBadgeHeaderClass,
  segmentedTabButtonHeaderClass,
  segmentedTabListHeaderClass,
} from "@/components/ui/segmentedTabStyles";
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
