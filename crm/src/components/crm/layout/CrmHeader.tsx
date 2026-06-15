"use client";

import React, { useMemo } from "react";
import type { IconType } from "react-icons";
import { FaChevronLeft, FaPlus, FaSun, FaMoon } from "react-icons/fa";
import {
  FiCheckCircle,
  FiFolder,
  FiGrid,
  FiHeart,
  FiMenu,
  FiRefreshCw,
  FiSend,
  FiStar,
} from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { getLeadAvatar } from "../helpers/leadDisplayHelpers";
import { LeadDetailTabBar } from "../leads/LeadDetailTabBar";
import { QuickStatusTabs } from "@/components/ui/QuickStatusTabs";
import { useLeadQuickStatusTabs } from "@/hooks/useLeadQuickStatusTabs";
import { DEFAULT_EMPLOYMENT_CATEGORY } from "@/utils/documentChecklistConfig";
import { docProgress } from "@/utils/leadHelpers";

const QUICK_TAB_ICONS: Record<string, IconType> = {
  All: FiGrid,
  New: FiStar,
  "Follow-Up": FiRefreshCw,
  Interested: FiHeart,
  Docs: FiFolder,
  Submitted: FiSend,
  Completed: FiCheckCircle,
};

export function CrmHeader() {
  const {
    currentTab,
    isLeadDetailRoute,
    setIsMobileSidebarOpen,
    theme,
    toggleTheme,
    canModifyLeads,
    setAddLeadStep,
    setAddLeadSelectedCategory,
    setIsAddLeadOpen,
    statusFilter,
    setStatusFilter,
    leadDetailTab,
    setLeadDetailTab,
    leads,
    selectedLeadId,
    closeLeadDetail,
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
  const leadIndex = lead ? leads.findIndex((l) => l.id === lead.id) : -1;
  const avatarUrl = lead ? getLeadAvatar(lead.id, leadIndex >= 0 ? leadIndex : 0) : "";

  return (
    <header className="relative h-16 border-b border-slate-800/80 bg-[#0a0a1a] px-4 md:px-8 flex items-center gap-2 md:gap-4 shrink-0 overflow-visible">
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden flex items-center justify-center cursor-pointer shrink-0"
      >
        <FiMenu className="text-lg" />
      </button>

      {currentTab === "Leads" && isLeadDetailRoute && lead && (
        <div className="flex items-center gap-2 md:gap-3 min-w-0 shrink z-10">
          <button
            type="button"
            onClick={closeLeadDetail}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Back to Lead Management"
          >
            <FaChevronLeft className="text-xs" />
          </button>
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 shrink-0 hidden sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate leading-tight">{lead.name}</p>
            <p className="text-[10px] text-slate-400 truncate leading-tight">
              {lead.country} · {lead.visaType}
            </p>
          </div>
        </div>
      )}

      {currentTab === "Leads" && (
        <div
          className={
            isLeadDetailRoute
              ? "crm-header__tabs crm-header__tabs--lead-detail absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
              : "crm-header__tabs flex-1 min-w-0"
          }
        >
          {!isLeadDetailRoute ? (
            <QuickStatusTabs
              variant="header"
              scroll
              tabs={tabsWithIcons}
              activeTab={statusFilter}
              onChange={setStatusFilter}
            />
          ) : (
            <LeadDetailTabBar
              activeTab={leadDetailTab}
              onTabChange={setLeadDetailTab}
              checklistPct={checklistPct}
            />
          )}
        </div>
      )}

      <div className="flex items-center space-x-2 md:space-x-4 ml-auto shrink-0 z-10">
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
          onClick={() => {
            if (!canModifyLeads) return;
            setAddLeadStep("initial");
            setAddLeadSelectedCategory("");
            setIsAddLeadOpen(true);
          }}
          disabled={!canModifyLeads}
          className={`flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs py-2 px-2.5 sm:px-3.5 rounded-xl transition-all shadow-md shadow-violet-500/10 ${
            !canModifyLeads ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          <FaPlus />
          <span className="hidden sm:inline">Add New Lead</span>
        </button>
      </div>
    </header>
  );
}
