"use client";

import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { LeadChecklistSection } from "../leads/LeadChecklistSection";
import { LeadManagementCard } from "../leads/LeadManagementCard";

export function ChecklistTab() {
  const { leads, selectedLeadId, closeLeadChecklist } = useCrmLayoutContext();

  const checklistLead = selectedLeadId
    ? leads.find((l) => l.id === selectedLeadId) ?? null
    : null;

  if (!checklistLead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] text-center space-y-4">
        <p className="text-sm text-gray-500 dark:text-slate-400">Lead not found or no lead selected.</p>
        <button
          type="button"
          onClick={closeLeadChecklist}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/30 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
        >
          <FaChevronLeft className="text-xs" />
          Back to Lead Management
        </button>
      </div>
    );
  }

  const leadDisplayId =
    leads.filter((l) => l.status !== "Dropped").findIndex((l) => l.id === checklistLead.id) !== -1
      ? leads.filter((l) => l.status !== "Dropped").findIndex((l) => l.id === checklistLead.id) + 1
      : checklistLead.id;

  const leadFirstName = checklistLead.name.trim().split(/\s+/)[0] || checklistLead.name;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={closeLeadChecklist}
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:border-violet-300 dark:hover:border-violet-500/40 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors shrink-0"
          aria-label="Back to Lead Management"
        >
          <FaChevronLeft className="text-sm" />
        </button>
        <nav className="flex items-center flex-wrap gap-1.5 text-[12px] font-medium min-w-0" aria-label="Breadcrumb">
          <button
            type="button"
            onClick={closeLeadChecklist}
            className="text-gray-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            Lead Management
          </button>
          <FiChevronRight className="text-gray-300 dark:text-slate-600 shrink-0" />
          <span className="text-gray-900 dark:text-white font-semibold truncate max-w-[220px] sm:max-w-none">
            {leadFirstName}{" "}
            <span className="font-medium text-gray-500 dark:text-slate-400">(Doc)</span>
          </span>
        </nav>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        <LeadChecklistSection
          lead={checklistLead}
          showLeadHeader
          leadDisplayId={leadDisplayId}
        />
        <LeadManagementCard lead={checklistLead} className="xl:sticky xl:top-4" />
      </div>
    </div>
  );
}
