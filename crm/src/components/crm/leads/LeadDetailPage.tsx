"use client";

import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { LeadChecklistSection } from "./LeadChecklistSection";
import { LeadManagementCard } from "./LeadManagementCard";
import { LeadSettingsSection } from "./LeadSettingsSection";

function TabPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] rounded-2xl border border-gray-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-8 text-center">
      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-xs text-gray-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

export function LeadDetailPage() {
  const {
    leads,
    selectedLeadId,
    closeLeadDetail,
    leadDetailTab,
    canAccessLeadChecklist,
    canViewLeads,
  } = useCrmLayoutContext();

  const lead = selectedLeadId ? leads.find((l) => l.id === selectedLeadId) ?? null : null;

  if (!canViewLeads) {
    return null;
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] text-center space-y-4">
        <p className="text-sm text-gray-500 dark:text-slate-400">Lead not found or no lead selected.</p>
        <button
          type="button"
          onClick={closeLeadDetail}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
        >
          <FaChevronLeft className="text-xs" />
          Back to Lead Management
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div role="tabpanel" aria-label={leadDetailTab}>
        {leadDetailTab === "checklist" && canAccessLeadChecklist && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
            <LeadChecklistSection lead={lead} />
            <LeadManagementCard lead={lead} className="xl:sticky xl:top-4" />
          </div>
        )}
        {leadDetailTab === "checklist" && !canAccessLeadChecklist && (
          <TabPlaceholder
            title="Checklist access restricted"
            description="You do not have permission to view or verify documents for this lead."
          />
        )}
        {leadDetailTab === "drive" && (
          <TabPlaceholder
            title="Drive"
            description="Per-lead Google Drive folders will appear here once linked."
          />
        )}
        {leadDetailTab === "settings" && <LeadSettingsSection lead={lead} />}
      </div>
    </div>
  );
}
