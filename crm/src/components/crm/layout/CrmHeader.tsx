"use client";

import React, { useMemo } from "react";
import type { IconType } from "react-icons";
import { FaPlus, FaSun, FaMoon } from "react-icons/fa";
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
import { QuickStatusTabs } from "@/components/ui/QuickStatusTabs";
import { useLeadQuickStatusTabs } from "@/hooks/useLeadQuickStatusTabs";

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

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0a0a1a] px-4 md:px-8 flex items-center gap-2 md:gap-4 shrink-0">
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden flex items-center justify-center cursor-pointer shrink-0"
      >
        <FiMenu className="text-lg" />
      </button>

      {currentTab === "Leads" && !isLeadDetailRoute && (
        <div className="crm-header__tabs flex-1 min-w-0 overflow-hidden">
          <QuickStatusTabs
            variant="header"
            scroll
            tabs={tabsWithIcons}
            activeTab={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      )}

      <div className="flex items-center space-x-2 md:space-x-4 ml-auto shrink-0">
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
