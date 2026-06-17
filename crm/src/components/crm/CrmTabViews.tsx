"use client";

import React from "react";
import { useCrmLayoutContext } from "./context/CrmLayoutContext";
import { DashboardTab } from "./tabs/DashboardTab";
import { LeadsTab } from "./tabs/LeadsTab";
import { FollowUpsTab } from "./tabs/FollowUpsTab";
import { CountriesTab } from "./tabs/CountriesTab";
import { USASlotsTab } from "./tabs/USASlotsTab";
import { SubmissionsTab } from "./tabs/SubmissionsTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { DropLeadsTab } from "./tabs/DropLeadsTab";
import { StaffTab } from "./tabs/StaffTab";
import { DriveTab } from "./tabs/DriveTab";
import { LeadDetailPage } from "./leads/LeadDetailPage";

export function CrmTabViews() {
  const { currentTab, isLeadDetailRoute, canViewLeads } = useCrmLayoutContext();

  return (
    <div
      data-crm-scroll-container
      id="crm-main-scroll"
      className="crm-slim-scrollbar flex-1 overflow-y-auto p-4 md:p-8"
    >
      {currentTab === "Dashboard" && <DashboardTab />}
      {currentTab === "Leads" && isLeadDetailRoute && canViewLeads && <LeadDetailPage />}
      {currentTab === "Leads" && !isLeadDetailRoute && <LeadsTab />}
      {currentTab === "FollowUps" && <FollowUpsTab />}
      {currentTab === "Countries" && <CountriesTab />}
      {currentTab === "USASlots" && <USASlotsTab />}
      {currentTab === "Submissions" && <SubmissionsTab />}
      {currentTab === "Payments" && <PaymentsTab />}
      {currentTab === "DropLeads" && <DropLeadsTab />}
      {currentTab === "Staff" && <StaffTab />}
      {currentTab === "Drive" && <DriveTab />}
    </div>
  );
}
