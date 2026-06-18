"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FaChevronLeft, FaPlus, FaSun, FaMoon } from "react-icons/fa";
import {
  FiBell,
  FiCheckCircle,
  FiDownload,
  FiGrid,
  FiMenu,
  FiRefreshCw,
  FiSend,
  FiStar,
  FiTrash,
  FiX,
} from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { LeadDetailTabBar } from "../leads/LeadDetailTabBar";
import { DriveToolbar } from "../drive/DriveToolbar";
import { useMainDriveToolbar } from "../drive/MainDriveToolbarContext";
import { QuickStatusTabs } from "@/components/ui/QuickStatusTabs";
import { useLeadQuickStatusTabs } from "@/hooks/useLeadQuickStatusTabs";
import { DEFAULT_EMPLOYMENT_CATEGORY } from "@/utils/documentChecklistConfig";
import { docProgress } from "@/utils/leadHelpers";
import { CRM_DROPDOWN_SCROLL_CLASS } from "@/utils/dropdownScrollStyles";

const QUICK_TAB_ICONS: Record<string, IconType> = {
  All: FiGrid,
  NEW_LEAD: FiStar,
  IN_PROGRESS: FiRefreshCw,
  VISA_SUBMISSION: FiSend,
  VISA_APPROVED: FiCheckCircle,
  VISA_REJECTED: FiX,
  DROPPED: FiTrash,
};

function formatAssignedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function CrmHeader() {
  const {
    currentTab,
    isLeadDetailRoute,
    isLeadsListRoute,
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
    openLeadDetail,
    currentUser,
    assignmentNotifications,
    dismissAssignmentNotification,
    clearAssignmentNotifications,
    assignedLeadCount,
  } = useCrmLayoutContext();

  const { toolbarProps: mainDriveToolbarProps } = useMainDriveToolbar();

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

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const unreadCount = assignmentNotifications.length;

  useEffect(() => {
    if (!isNotificationOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen]);

  const handleNotificationClick = (leadId: string) => {
    dismissAssignmentNotification(leadId);
    setIsNotificationOpen(false);
    openLeadDetail(leadId);
  };

  const showNewButton =
    currentTab === "Leads" && !isLeadDetailRoute && canModifyLeads;
  const showExportButton = isLeadsListRoute;

  return (
    <header className="relative h-16 border-b border-slate-800/80 bg-[#0a0a1a] px-4 md:px-8 flex items-center gap-2 md:gap-4 shrink-0 overflow-visible">
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden flex items-center justify-center cursor-pointer shrink-0"
      >
        <FiMenu className="text-lg" />
      </button>

      {currentTab === "Drive" && mainDriveToolbarProps ? (
        <div className="crm-header__drive-toolbar min-w-0 flex-1 overflow-visible z-10 flex justify-start">
          <DriveToolbar variant="header" {...mainDriveToolbarProps} />
        </div>
      ) : null}

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
            <p className="truncate text-base font-bold leading-tight text-white">{lead.name}</p>
            <p className="truncate text-sm leading-tight text-slate-400">
              {lead.country} · {lead.visaType}
            </p>
          </div>
        </>
      )}

      <div className="flex items-center gap-2 md:gap-3 ml-auto shrink-0 z-10">
        {showExportButton && (
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

        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationOpen((open) => !open)}
            title="Notifications"
            aria-label="Assignment notifications"
            aria-expanded={isNotificationOpen}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all flex items-center justify-center shadow-md cursor-pointer"
          >
            <FiBell className="text-sm" />
            {unreadCount > 0 && (
              <span className="crm-notification-count absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-72 rounded-xl border shadow-xl z-50 overflow-hidden ${
                theme === "light"
                  ? "border-slate-200 bg-white shadow-slate-300/40"
                  : "border-slate-700/80 bg-[#0f0f22] shadow-black/40"
              }`}
            >
              <div
                className={`px-4 py-3 border-b ${
                  theme === "light" ? "border-slate-200" : "border-slate-800/80"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  }`}
                >
                  Assignments
                </p>
                {currentUser?.role === "COUNSELOR" && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {assignedLeadCount} assigned lead{assignedLeadCount === 1 ? "" : "s"}
                    {unreadCount > 0
                      ? ` · ${unreadCount} unread`
                      : ""}
                  </p>
                )}
              </div>

              {assignmentNotifications.length === 0 ? (
                <p className="px-4 py-6 text-xs text-slate-500 text-center">No new assignments</p>
              ) : (
                <ul className={`max-h-64 overflow-y-auto ${CRM_DROPDOWN_SCROLL_CLASS}`}>
                  {assignmentNotifications.map((item) => (
                    <li key={item.leadId}>
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(item.leadId)}
                        className={`w-full px-4 py-3 text-left transition-colors border-b last:border-b-0 cursor-pointer ${
                          theme === "light"
                            ? "hover:bg-slate-50 border-slate-100"
                            : "hover:bg-slate-800/50 border-slate-800/40"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium truncate ${
                            theme === "light" ? "text-slate-800" : "text-slate-200"
                          }`}
                        >
                          {item.leadName}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Assigned · {formatAssignedAt(item.assignedAt)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {assignmentNotifications.length > 0 && (
                <div
                  className={`px-3 py-2 border-t ${
                    theme === "light" ? "border-slate-200" : "border-slate-800/80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      clearAssignmentNotifications();
                      setIsNotificationOpen(false);
                    }}
                    className={`w-full text-xs font-medium py-1.5 rounded-lg transition-colors cursor-pointer ${
                      theme === "light"
                        ? "text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                        : "text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                    }`}
                  >
                    Mark all read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {showNewButton && (
          <button
            onClick={openCreateLead}
            disabled={isCreateLeadOpen}
            className={`flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs py-1.5 px-2 rounded-xl transition-all shadow-md shadow-violet-500/10 ${
              isCreateLeadOpen
                ? "opacity-40 cursor-not-allowed"
                : "hover:from-violet-500 hover:to-indigo-500"
            }`}
          >
            <FaPlus className="text-[10px]" />
            <span>New</span>
          </button>
        )}
      </div>
    </header>
  );
}
