"use client";

import React from "react";
import type { IconType } from "react-icons";
import {
  FiCheckCircle,
  FiFolder,
  FiGlobe,
  FiGrid,
  FiHeart,
  FiRefreshCw,
  FiSend,
  FiStar,
} from "react-icons/fi";
import { SearchableFilterSelect, destinationFilterOptions } from "@/components/ui/FormInputs";
import { QuickStatusTabs, type QuickStatusTab } from "@/components/ui/QuickStatusTabs";

const QUICK_TAB_ICONS: Record<string, IconType> = {
  All: FiGrid,
  New: FiStar,
  "Follow-Up": FiRefreshCw,
  Interested: FiHeart,
  Docs: FiFolder,
  Submitted: FiSend,
  Completed: FiCheckCircle,
};

type LeadManagementToolbarProps = {
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
  tabs: QuickStatusTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
};

export function LeadManagementToolbar({
  countryFilter,
  onCountryFilterChange,
  tabs,
  activeTab,
  onTabChange,
}: LeadManagementToolbarProps) {
  const tabsWithIcons = tabs.map((tab) => ({
    ...tab,
    icon: QUICK_TAB_ICONS[tab.id] ?? FiGrid,
  }));

  return (
    <div className="lead-mgmt-toolbar">
      <div className="lead-mgmt-toolbar__destination">
        <span className="lead-mgmt-toolbar__destination-label">Destination</span>
        <div className="lead-mgmt-toolbar__destination-control">
          <FiGlobe className="lead-mgmt-toolbar__destination-icon" aria-hidden="true" />
          <SearchableFilterSelect
            value={countryFilter}
            onChange={onCountryFilterChange}
            options={destinationFilterOptions}
            placeholder="All Countries"
            portalId="lead-destination-filter-portal"
          />
        </div>
      </div>
      <div className="lead-mgmt-toolbar__tabs-panel">
        <QuickStatusTabs
          variant="header"
          tabs={tabsWithIcons}
          activeTab={activeTab}
          onChange={onTabChange}
        />
      </div>
    </div>
  );
}
