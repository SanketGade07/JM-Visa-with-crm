"use client";

import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import {
  DEFAULT_EMPLOYMENT_CATEGORY,
  getChecklistKeysForLead,
} from "@/utils/documentChecklistConfig";
import { docProgress } from "@/utils/leadHelpers";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { getLeadAvatar } from "../helpers/leadDisplayHelpers";
import { LeadDetailTabBar } from "./LeadDetailTabBar";
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
    setLeadDetailTab,
    theme,
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

  const employmentCategory = lead.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY;
  const activeKeys = getChecklistKeysForLead(employmentCategory);
  const checkedCount = activeKeys.filter((key) => lead.checklist[key]).length;
  const checklistPct = Math.round(docProgress(lead.checklist, employmentCategory));
  const leadIndex = leads.findIndex((l) => l.id === lead.id);
  const avatarUrl = getLeadAvatar(lead.id, leadIndex >= 0 ? leadIndex : 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={closeLeadDetail}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border shrink-0 transition-colors ${
              theme === "light"
                ? "border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-blue-300 hover:bg-blue-50"
                : "border-slate-700/80 bg-slate-900/60 text-slate-300 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10"
            }`}
            aria-label="Back to Lead Management"
          >
            <FaChevronLeft className="text-sm" />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {lead.name}
              </h1>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">
                {lead.country} · {lead.visaType}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-center">
          <LeadDetailTabBar
            activeTab={leadDetailTab}
            onTabChange={setLeadDetailTab}
            checklistPct={checklistPct}
          />
        </div>

        <div className="hidden lg:flex items-center justify-end shrink-0 min-w-[72px]">
          {canAccessLeadChecklist && (
            <span
              className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold tabular-nums ${
                theme === "light"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {checkedCount}/{activeKeys.length} docs · {checklistPct}%
            </span>
          )}
        </div>
      </header>

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
