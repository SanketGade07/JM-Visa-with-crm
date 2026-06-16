"use client";

import React, { useMemo } from "react";
import type { IconType } from "react-icons";
import { FaChevronLeft, FaPlus, FaSun, FaMoon } from "react-icons/fa";
import {
  FiCheckCircle,
  FiDownload,
  FiGrid,
  FiMenu,
  FiRefreshCw,
  FiSend,
  FiStar,
  FiX,
} from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { LeadDetailTabBar } from "../leads/LeadDetailTabBar";
import { QuickStatusTabs } from "@/components/ui/QuickStatusTabs";
import { useLeadQuickStatusTabs } from "@/hooks/useLeadQuickStatusTabs";
import { DEFAULT_EMPLOYMENT_CATEGORY } from "@/utils/documentChecklistConfig";
import { docProgress } from "@/utils/leadHelpers";

const QUICK_TAB_ICONS: Record<string, IconType> = {
  All: FiGrid,
  NEW_LEAD: FiStar,
  IN_PROGRESS: FiRefreshCw,
  VISA_SUBMISSION: FiSend,
  VISA_APPROVED: FiCheckCircle,
  VISA_REJECTED: FiX,
};

export function CrmHeader() {
  const {
    currentTab,
    isLeadDetailRoute,
    isCreateLeadOpen,
    openCreateLead,
    setIsMobileSidebarOpen,
    theme,
    toggleTheme,
    canModifyLeads,
    statusFilter,
    setStatusFilter,
    leads,
    selectedLeadId,
    closeLeadDetail,
    exportLeadsCsv,
    leadDetailTab,
    setLeadDetailTab,
  } = useCrmLayoutContext();

  const { quickStatusTabs } = useLeadQuickStatusTabs();

  const tabsWithIcons = useMemo(
    () =>
      quickStatusTabs.map((tab) => ({
        ...tab,
        icon: QUICK_TAB_ICONS[tab.id] ?? FiGrid,
      })),
    [quickStatusTabs]
  );

  const lead = selectedLeadId ? leads.find((l) => l.id === selectedLeadId) : null;

  const checklistPct = lead
    ? Math.round(
        docProgress(lead.checklist, lead.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY)
      )
    : 0;

  return (
    <header className="relative h-16 border-b border-slate-800/80 bg-[#0a0a1a] px-4 md:px-8 flex items-center gap-2 md:gap-4 shrink-0 overflow-visible">
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden flex items-center justify-center cursor-pointer shrink-0"
      >
        <FiMenu className="text-lg" />
      </button>

      {currentTab === "Leads" && !isLeadDetailRoute && (
        <div className="crm-header__tabs crm-header__tabs--list min-w-0 flex-1">
          <QuickStatusTabs
            variant="header"
            scroll
            tabs={tabsWithIcons}
            activeTab={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      )}

      {currentTab === "Leads" && isLeadDetailRoute && lead && (
        <>
          <div className="flex items-center gap-2 min-w-0 flex-1 z-10">
            <button
              type="button"
              onClick={closeLeadDetail}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer"
              aria-label="Back to Lead Management"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <div className="crm-header__tabs crm-header__tabs--lead-detail min-w-0">
              <LeadDetailTabBar
                activeTab={leadDetailTab}
                onTabChange={setLeadDetailTab}
                checklistPct={checklistPct}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-full max-w-[min(100%,calc(100%-9rem))] -translate-x-1/2 -translate-y-1/2 px-2 text-center">
            <p className="truncate text-xs font-bold leading-tight text-white">{lead.name}</p>
            <p className="truncate text-[10px] leading-tight text-slate-400">
              {lead.country} · {lead.visaType}
            </p>
          </div>
        </>
      )}

      <div className="flex items-center gap-2 md:gap-3 ml-auto shrink-0 z-10">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all flex items-center justify-center shadow-md cursor-pointer group"
        >
          {theme === "dark" ? (
            <FaSun className="text-sm text-amber-400 transition-transform duration-500 group-hover:rotate-45" />
          ) : (
            <FaMoon className="text-sm text-indigo-600 transition-transform duration-500 group-hover:-rotate-12" />
          )}
        </button>

        <button
          onClick={openCreateLead}
          disabled={!canModifyLeads || isCreateLeadOpen}
          className={`flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs py-1.5 px-2 rounded-xl transition-all shadow-md shadow-violet-500/10 ${
            !canModifyLeads || isCreateLeadOpen
              ? "opacity-40 cursor-not-allowed"
              : "hover:from-violet-500 hover:to-indigo-500"
          }`}
        >
          <FaPlus className="text-[10px]" />
          <span>New</span>
        </button>

        {currentTab === "Leads" && !isLeadDetailRoute && (
          <button
            type="button"
            onClick={exportLeadsCsv}
            title="Export"
            aria-label="Export leads"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all flex items-center justify-center shadow-md cursor-pointer"
          >
            <FiDownload className="text-sm" />
          </button>
        )}
      </div>
    </header>
  );
}
