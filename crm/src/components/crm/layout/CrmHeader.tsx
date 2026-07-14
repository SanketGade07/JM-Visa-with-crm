"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FaChevronLeft, FaPlus, FaSun, FaMoon } from "react-icons/fa";
import {
  FiBell,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiGlobe,
  FiGrid,
  FiMenu,
  FiRefreshCw,
  FiSend,
  FiStar,
  FiTrash,
  FiX,
  FiUserX,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { LeadDetailTabBar } from "../leads/LeadDetailTabBar";
import { DriveToolbar } from "../drive/DriveToolbar";
import { useMainDriveToolbar } from "../drive/MainDriveToolbarContext";
import { QuickStatusTabs } from "@/components/ui/QuickStatusTabs";
import { useLeadQuickStatusTabs } from "@/hooks/useLeadQuickStatusTabs";
import { usePaymentsTabs } from "@/hooks/usePaymentsTabs";
import { useSubmissionTabs } from "@/hooks/useSubmissionTabs";
import { useUsaSlotTabs } from "@/hooks/useUsaSlotTabs";
import type { PaymentsView, SubmissionView, UsaSlotView } from "../hooks/useCrmLayoutState";
import { DateRangeCalendarPopover } from "@/components/crm/ui/DateRangeCalendarPopover";
import { DEFAULT_EMPLOYMENT_CATEGORY } from "@/utils/documentChecklistConfig";
import { docProgress } from "@/utils/leadHelpers";
import { SearchableFilterSelect, destinationFilterOptions } from "@/components/ui/FormInputs";
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

function isDateRangeActive(startDate: string, endDate: string): boolean {
  return !!(startDate && endDate);
}

function parseDateParts(dateStr: string): { year: number; month: number } | null {
  if (!dateStr) return null;
  const [year, month] = dateStr.split("-").map(Number);
  if (!year || !month) return null;
  return { year, month: month - 1 };
}

function getDaysInMonth(year: number, month: number): (number | null)[] {
  const date = new Date(year, month, 1);
  const days: (number | null)[] = [];
  const startDay = date.getDay();
  for (let i = 0; i < startDay; i++) days.push(null);
  const totalDays = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= totalDays; i++) days.push(i);
  return days;
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function CrmHeader() {
  const {
    currentTab,
    isLeadDetailRoute,
    isCreateLeadOpen,
    openCreateLead,
    isCreateUsaLeadOpen,
    openCreateUsaLead,
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
    exportUsaSlotsCsv,
    exportDroppedLeadsCsv,
    exportPaymentsCsv,
    leadDetailTab,
    setLeadDetailTab,
    openLeadDetail,
    currentUser,
    assignmentNotifications,
    dismissAssignmentNotification,
    clearAssignmentNotifications,
    assignedLeadCount,
    usaSlotView,
    setUsaSlotView,
    submissionView,
    setSubmissionView,
    paymentsView,
    setPaymentsView,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    paymentsCountryFilter,
    setPaymentsCountryFilter,
    openEditLead,
    isEditLeadOpen,
    showConfirm,
  } = useCrmLayoutContext();

  const { toolbarProps: mainDriveToolbarProps } = useMainDriveToolbar();

  const { quickStatusTabs } = useLeadQuickStatusTabs();
  const { usaSlotTabs } = useUsaSlotTabs();
  const { submissionTabs } = useSubmissionTabs();
  const { paymentsTabs } = usePaymentsTabs();

  // Unified Filter Popover state inside CrmHeader component:
  const [filterOpen, setFilterOpen] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  const initialParts = parseDateParts(startDate) ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  };
  const [calYear, setCalYear] = useState(initialParts.year);
  const [calMonth, setCalMonth] = useState(initialParts.month);

  useEffect(() => {
    if (!filterOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!document.body.contains(target)) return;
      if (filterBtnRef.current?.contains(target) || filterPanelRef.current?.contains(target)) return;
      if (target instanceof HTMLElement && target.closest('[class*="filter-select"]')) {
        return;
      }
      setFilterOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterOpen]);

  const handleDateClick = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate("");
    } else if (dateStr < startDate) {
      setEndDate(startDate);
      setStartDate(dateStr);
    } else {
      setEndDate(dateStr);
    }
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setPaymentsCountryFilter("All");
  };

  const activeFilterCount =
    (isDateRangeActive(startDate, endDate) ? 1 : 0) +
    (paymentsCountryFilter !== "All" ? 1 : 0);

  const tabsWithIcons = useMemo(
    () =>
      quickStatusTabs.map((tab) => ({
        ...tab,
        icon: QUICK_TAB_ICONS[tab.id] ?? FiGrid,
      })),
    [quickStatusTabs]
  );

  const submissionTabsWithIcons = useMemo(
    () =>
      submissionTabs.map((tab) => {
        let icon = FiGrid;
        if (tab.id === "ready") icon = FiRefreshCw;
        else if (tab.id === "dispatched") icon = FiSend;
        else if (tab.id === "approved") icon = FiCheckCircle;
        else if (tab.id === "rejected") icon = FiX;
        return {
          ...tab,
          icon,
        };
      }),
    [submissionTabs]
  );

  const paymentsTabsWithIcons = useMemo(
    () =>
      paymentsTabs.map((tab) => ({
        ...tab,
        icon: tab.id === "ledger" ? FiFileText : FiGlobe,
      })),
    [paymentsTabs]
  );

  const lead = selectedLeadId ? leads.find((l) => l.id === selectedLeadId) : null;

  const checklistPct = lead
    ? Math.round(
        docProgress(lead.checklist, lead.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY)
      )
    : 0;

  const incompleteLeads = useMemo(() => {
    return leads.filter((l) => {
      if (l.isDeleted) return false;
      if (l.status === "DROPPED") return false;
      if (l.profileCompleted || l.passportNumber?.trim()) return false;
      const hasMissingEmail = !l.email?.trim();
      const hasMissingPassportNum = !l.passportNumber?.trim();
      const hasMissingPassportIssue = !l.passportIssueDate?.trim();
      const hasMissingPassportExpiry = !l.passportExpiryDate?.trim();
      const hasMissingPassportPlace = !l.passportPlaceOfIssue?.trim();
      const hasMissingIncome = !l.annualIncome?.trim();
      return (
        hasMissingEmail ||
        hasMissingPassportNum ||
        hasMissingPassportIssue ||
        hasMissingPassportExpiry ||
        hasMissingPassportPlace ||
        hasMissingIncome
      );
    });
  }, [leads]);

  const getMissingFieldsString = (l: typeof leads[0]) => {
    const missing = [];
    if (!l.email?.trim()) missing.push("Email");
    if (!l.annualIncome?.trim()) missing.push("Income");
    if (
      !l.passportNumber?.trim() ||
      !l.passportIssueDate?.trim() ||
      !l.passportExpiryDate?.trim() ||
      !l.passportPlaceOfIssue?.trim()
    ) {
      missing.push("Passport");
    }
    return missing.join(", ");
  };

  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) ?? null;
  }, [leads, selectedLeadId]);

  const selectedLeadIsIncomplete = useMemo(() => {
    if (!selectedLead) return false;
    if (selectedLead.profileCompleted || selectedLead.passportNumber?.trim()) return false;
    return (
      !selectedLead.email?.trim() ||
      !selectedLead.passportNumber?.trim() ||
      !selectedLead.passportIssueDate?.trim() ||
      !selectedLead.passportExpiryDate?.trim() ||
      !selectedLead.passportPlaceOfIssue?.trim() ||
      !selectedLead.annualIncome?.trim()
    );
  }, [selectedLead]);

  const [isIncompletePopoverOpen, setIsIncompletePopoverOpen] = useState(false);
  const incompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isIncompletePopoverOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (incompleteRef.current && !incompleteRef.current.contains(e.target as Node)) {
        setIsIncompletePopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isIncompletePopoverOpen]);

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

  const [activeNotifTab, setActiveNotifTab] = useState<"assignments" | "chats">("assignments");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logSearch, setLogSearch] = useState("");

  const unreadAssignmentsCount = useMemo(() => {
    return assignmentNotifications.filter((n) => n.kind !== "discussion").length;
  }, [assignmentNotifications]);

  const unreadChatsCount = useMemo(() => {
    return assignmentNotifications.filter((n) => n.kind === "discussion").length;
  }, [assignmentNotifications]);

  const assignmentLogs = useMemo(() => {
    if (typeof window === "undefined" || !isLogModalOpen) return [];
    try {
      const raw = localStorage.getItem("crm-assignment-logs");
      const allLogs = raw ? (JSON.parse(raw) as any[]) : [];
      if (currentUser?.role === "ADMIN") {
        return allLogs;
      }
      return allLogs.filter(
        (log) =>
          log.counselorName?.trim().toLowerCase() ===
          currentUser?.name.trim().toLowerCase()
      );
    } catch {
      return [];
    }
  }, [isLogModalOpen, currentUser]);

  const filteredLogs = useMemo(() => {
    const query = logSearch.toLowerCase().trim();
    if (!query) return assignmentLogs;
    return assignmentLogs.filter(
      (log) =>
        log.leadName?.toLowerCase().includes(query) ||
        log.counselorName?.toLowerCase().includes(query)
    );
  }, [assignmentLogs, logSearch]);

  const handleMarkAllRead = () => {
    const toClear = assignmentNotifications.filter((n) => {
      const kind = n.kind ?? "assignment";
      return activeNotifTab === "assignments" ? kind !== "discussion" : kind === "discussion";
    });
    toClear.forEach((n) => dismissAssignmentNotification(n.leadId));
    setIsNotificationOpen(false);
  };

  const showNewButton =
    currentTab === "Leads" && !isLeadDetailRoute && canModifyLeads;
  const showNewUsaButton =
    currentTab === "USASlots" && canModifyLeads;
  const showExportButton =
    (currentTab === "Leads" && !isLeadDetailRoute) ||
    currentTab === "USASlots" ||
    currentTab === "DropLeads" ||
    currentTab === "Payments";

  const handleExportCsv = () => {
    if (currentTab === "USASlots") exportUsaSlotsCsv();
    else if (currentTab === "DropLeads") exportDroppedLeadsCsv();
    else if (currentTab === "Payments") exportPaymentsCsv();
    else exportLeadsCsv();
  };

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

      {currentTab === "USASlots" && (
        <div className="crm-header__tabs crm-header__tabs--list min-w-0 flex-1">
          <QuickStatusTabs
            variant="header"
            scroll
            tabs={usaSlotTabs}
            activeTab={usaSlotView}
            onChange={(id) => setUsaSlotView(id as UsaSlotView)}
          />
        </div>
      )}

      {currentTab === "Submissions" && (
        <div className="crm-header__tabs crm-header__tabs--list min-w-0 flex-1">
          <QuickStatusTabs
            variant="header"
            scroll
            tabs={submissionTabsWithIcons}
            activeTab={submissionView}
            onChange={(id) => setSubmissionView(id as SubmissionView)}
          />
        </div>
      )}

      {currentTab === "Payments" && (
        <div className="crm-header__tabs crm-header__tabs--list min-w-0 flex-1">
          <QuickStatusTabs
            variant="header"
            scroll
            tabs={paymentsTabsWithIcons}
            activeTab={paymentsView}
            onChange={(id) => setPaymentsView(id as PaymentsView)}
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
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-full max-w-[min(100%,calc(100%-9rem))] -translate-x-1/2 -translate-y-1/2 px-2 text-center hidden md:block">
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
            onClick={handleExportCsv}
            title="Export"
            aria-label={
              currentTab === "USASlots"
                ? "Export USA slots"
                : currentTab === "DropLeads"
                  ? "Export dropped leads"
                  : "Export leads"
            }
            className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all hidden sm:flex items-center justify-center shadow-md cursor-pointer"
          >
            <FiDownload className="text-sm" />
          </button>
        )}

        {currentTab === "Payments" && (
          <div className="relative shrink-0">
            <button
              ref={filterBtnRef}
              type="button"
              onClick={() => {
                if (!filterOpen) {
                  const parts = parseDateParts(startDate);
                  if (parts) { setCalYear(parts.year); setCalMonth(parts.month); }
                }
                setFilterOpen((v) => !v);
              }}
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl border text-sm transition-all shadow-md cursor-pointer ${
                activeFilterCount > 0
                  ? "bg-blue-500/10 border-blue-400/50 text-blue-600 dark:border-blue-500/40 dark:text-blue-400"
                  : theme === "light"
                    ? "bg-white border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300"
                    : "bg-slate-900 border-slate-800/80 text-slate-400 hover:text-blue-400 hover:border-blue-500/30"
              }`}
            >
              <FiFilter className="shrink-0" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold !text-white leading-none px-1 shadow-sm ring-2 ring-white dark:ring-[#0c0d1e]">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* ── Combined filter popover panel ── */}
            {filterOpen && (
              <div
                ref={filterPanelRef}
                onMouseDown={(e) => e.stopPropagation()}
                className={`absolute right-0 top-full mt-2 w-[300px] rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                  theme === "light"
                    ? "bg-white border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.10)]"
                    : "bg-[#0c0d1e] border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                }`}
              >
                {/* Header */}
                <div className={`px-4 py-3 border-b flex items-center justify-between ${
                  theme === "light" ? "border-gray-100 bg-gray-50/70" : "border-slate-800/60 bg-[#0e0f26]"
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Filter Cards & Table
                  </span>
                  {activeFilterCount > 0 ? (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-[10px] font-bold text-blue-500 hover:text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/20 hover:border-blue-500/40 bg-blue-500/5 transition-all cursor-pointer"
                    >
                      Clear All
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFilterOpen(false)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        theme === "light"
                          ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          : "text-slate-500 hover:text-slate-300 hover:bg-slate-850"
                      }`}
                      aria-label="Close filters"
                    >
                      <FiX className="text-xs" />
                    </button>
                  )}
                </div>

                {/* Searchable Country Section */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-[9px] font-bold uppercase tracking-wider ${
                      theme === "light" ? "text-gray-500" : "text-slate-500"
                    }`}>
                      Destination Country
                    </label>
                  </div>
                  <SearchableFilterSelect
                    value={paymentsCountryFilter}
                    onChange={setPaymentsCountryFilter}
                    options={destinationFilterOptions}
                    placeholder="All Countries"
                    portalId="payments-country-filter"
                  />
                </div>

                {/* Divider */}
                <div className={`mx-4 border-t ${theme === "light" ? "border-gray-100" : "border-slate-800/50"}`} />

                {/* Date Range Section */}
                <div className="px-4 pt-3 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-[9px] font-bold uppercase tracking-wider ${
                      theme === "light" ? "text-gray-500" : "text-slate-500"
                    }`}>
                      Date Range
                    </label>
                    <div className="flex items-center gap-2">
                    {isDateRangeActive(startDate, endDate) && (
                      <>
                        <span className={`text-[9px] font-semibold tabular-nums ${
                          theme === "light" ? "text-blue-600" : "text-blue-400"
                        }`}>
                          {formatShortDate(startDate)} – {formatShortDate(endDate)}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setStartDate(""); setEndDate(""); }}
                          className={`p-0.5 rounded transition-colors cursor-pointer ${
                            theme === "light"
                              ? "text-gray-400 hover:text-red-500 hover:bg-gray-100"
                              : "text-slate-500 hover:text-red-400 hover:bg-slate-800"
                          }`}
                          title="Clear date range"
                        >
                          <FiX className="text-[10px]" />
                        </button>
                      </>
                    )}
                    </div>
                  </div>

                  {/* Month nav */}
                  <div className="flex items-center justify-between mb-2.5">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      aria-label="Previous month"
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        theme === "light" ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <FiChevronLeft className="text-[12px]" />
                    </button>
                    <div className="flex items-center gap-1 select-none">
                      {/* Month Select Wrapper */}
                      <div className="relative flex items-center">
                        <select
                          value={calMonth}
                          onChange={(e) => setCalMonth(parseInt(e.target.value))}
                          className={`appearance-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-[12px] font-bold pl-1.5 pr-5 py-0.5 rounded-md focus:outline-none cursor-pointer border-0 text-center transition-all ${
                            theme === "light" ? "text-gray-800" : "text-slate-200"
                          }`}
                        >
                          {MONTH_NAMES.map((name, i) => (
                            <option key={name} value={i} className={theme === "light" ? "bg-white text-gray-800" : "bg-slate-900 text-slate-250"}>
                              {name}
                            </option>
                          ))}
                        </select>
                        <div className={`absolute right-1 pointer-events-none ${theme === "light" ? "text-gray-400" : "text-slate-500"}`}>
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Year Select Wrapper */}
                      <div className="relative flex items-center">
                        <select
                          value={calYear}
                          onChange={(e) => setCalYear(parseInt(e.target.value))}
                          className={`appearance-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-[12px] font-bold pl-1.5 pr-5 py-0.5 rounded-md focus:outline-none cursor-pointer border-0 text-center transition-all ${
                            theme === "light" ? "text-gray-800" : "text-slate-200"
                          }`}
                        >
                          {Array.from({ length: 11 }, (_, i) => {
                            const year = new Date().getFullYear() - 5 + i;
                            return (
                              <option key={year} value={year} className={theme === "light" ? "bg-white text-gray-800" : "bg-slate-900 text-slate-250"}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                        <div className={`absolute right-1 pointer-events-none ${theme === "light" ? "text-gray-400" : "text-slate-500"}`}>
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      aria-label="Next month"
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        theme === "light" ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <FiChevronRight className="text-[12px]" />
                    </button>
                  </div>

                  {/* Weekday labels */}
                  <div className="grid grid-cols-7 text-center mb-1.5">
                    {WEEKDAY_LABELS.map((day) => (
                      <span key={day} className={`text-[9px] font-medium ${
                        theme === "light" ? "text-gray-400/90" : "text-slate-500"
                      }`}>
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Day grid */}
                  <div className="grid grid-cols-7 text-center items-center gap-y-0.5">
                    {getDaysInMonth(calYear, calMonth).map((day, idx) => {
                      if (day === null) return <div key={`empty-${idx}`} className="h-7" />;

                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const isStart = dateStr === startDate;
                      const isEnd = dateStr === endDate;
                      const inRange = startDate && endDate && dateStr > startDate && dateStr < endDate;
                      const isToday = (() => {
                        const t = new Date();
                        return t.getFullYear() === calYear && t.getMonth() === calMonth && t.getDate() === day;
                      })();

                      return (
                        <div key={day} className="flex justify-center items-center h-7 relative">
                          {inRange && (
                            <div className="absolute inset-y-0.5 left-0 right-0 bg-blue-500/10 dark:bg-blue-500/15" />
                          )}
                          {isStart && endDate && (
                            <div className="absolute inset-y-0.5 left-1/2 right-0 bg-blue-500/10 dark:bg-blue-500/15" />
                          )}
                          {isEnd && startDate && (
                            <div className="absolute inset-y-0.5 left-0 right-1/2 bg-blue-500/10 dark:bg-blue-500/15" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleDateClick(day)}
                            className={`w-[24px] h-[24px] flex items-center justify-center rounded-full text-[10px] font-medium transition-all duration-150 relative z-10 cursor-pointer ${
                              isStart || isEnd
                                ? "bg-blue-600 text-white shadow-[0_2px_6px_rgba(37,99,235,0.4)] font-bold scale-105"
                                : inRange
                                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                                  : isToday
                                    ? "border border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                                    : theme === "light"
                                      ? "text-gray-700 hover:bg-gray-100"
                                      : "text-slate-300 hover:bg-slate-800"
                            }`}
                          >
                            {day}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}



        {/* Incomplete Profiles warning button & popover */}
        {/* Incomplete Profiles warning button & popover */}
        {selectedLead ? (
          // When inside lead details
          selectedLeadIsIncomplete && leadDetailTab === "details" && (
            <div className="relative">
              <button
                type="button"
                onClick={() => openEditLead()}
                disabled={isEditLeadOpen}
                title="Complete Profile"
                aria-label="Complete current lead profile details"
                className={`relative p-2 rounded-xl border transition-all flex items-center justify-center shadow-md ${
                  isEditLeadOpen
                    ? "opacity-40 cursor-not-allowed border-amber-500/20 text-amber-500/40 bg-amber-500/5"
                    : "cursor-pointer bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                }`}
              >
                <FiUserX className="text-sm" />
              </button>
            </div>
          )
        ) : null}


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
              className={`absolute right-0 top-full mt-2 w-76 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                theme === "light"
                  ? "border-slate-200 bg-white shadow-slate-350/50"
                  : "border-slate-800/90 bg-[#0c0d1e] shadow-black/60"
              }`}
            >
              {/* Header */}
              <div
                className={`px-4 py-3 border-b flex items-center justify-between ${
                  theme === "light" ? "border-slate-100 bg-slate-50" : "border-slate-800/60 bg-[#0e0f26]"
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Notifications
                </span>
                <span className="text-[10px] font-bold text-violet-500 dark:text-violet-400 tabular-nums">
                  {unreadCount} unread
                </span>
              </div>

              {/* Tabs Switcher */}
              <div className={`flex border-b text-xs font-bold ${
                theme === "light" ? "border-slate-100 bg-white" : "border-slate-800/50 bg-[#0a0a1a]"
              }`}>
                <button
                  type="button"
                  onClick={() => setActiveNotifTab("assignments")}
                  className={`flex-1 py-2.5 transition-all border-b-2 text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeNotifTab === "assignments"
                      ? "border-violet-500 text-violet-600 dark:text-violet-400"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <span>Assignments</span>
                  {unreadAssignmentsCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-violet-650 dark:bg-violet-600 text-[9px] font-extrabold text-white rounded-md">
                      {unreadAssignmentsCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNotifTab("chats")}
                  className={`flex-1 py-2.5 transition-all border-b-2 text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeNotifTab === "chats"
                      ? "border-violet-500 text-violet-600 dark:text-violet-400"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <span>Chats</span>
                  {unreadChatsCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-violet-650 dark:bg-violet-600 text-[9px] font-extrabold text-white rounded-md">
                      {unreadChatsCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              {activeNotifTab === "assignments" ? (
                <div className="flex flex-col max-h-80 overflow-y-auto">
                  {/* Unread Assignments Section */}
                  <div className={`px-4 py-2 border-b ${
                    theme === "light" ? "bg-slate-50/70 border-slate-100" : "bg-[#0b0c20]/45 border-slate-800/40"
                  }`}>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      New Assignments
                    </span>
                  </div>
                  {assignmentNotifications.filter((n) => n.kind !== "discussion").length === 0 ? (
                    <p className="px-4 py-5 text-xs text-slate-400 dark:text-slate-500 text-center italic">
                      No new assignments
                    </p>
                  ) : (
                    <ul className="border-b border-slate-100 dark:border-slate-800/40">
                      {assignmentNotifications
                        .filter((n) => n.kind !== "discussion")
                        .map((item) => (
                          <li key={item.leadId}>
                            <button
                              type="button"
                              onClick={() => handleNotificationClick(item.leadId)}
                              className={`w-full px-4 py-3 text-left transition-colors border-b last:border-b-0 border-slate-100/60 dark:border-slate-800/30 cursor-pointer ${
                                theme === "light"
                                  ? "hover:bg-slate-50 bg-violet-50/20"
                                  : "hover:bg-slate-800/50 bg-violet-500/5"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <p className={`text-xs font-semibold ${theme === "light" ? "text-slate-800" : "text-slate-200"} truncate flex-1`}>
                                  {item.leadName}
                                </p>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 shrink-0 font-medium mt-0.5">
                                  {formatAssignedAt(item.assignedAt)}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Assigned to you
                              </p>
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}

                  {/* View Assignment Logs (History) */}
                  <div className={`px-4 py-3.5 flex flex-col items-center justify-center text-center gap-2 ${
                    theme === "light" ? "bg-slate-50/50" : "bg-[#0b0c21]/30"
                  }`}>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                      Want to check past lead assign history?
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationOpen(false);
                        setIsLogModalOpen(true);
                      }}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                        theme === "light"
                          ? "bg-white text-violet-600 border-slate-200 hover:bg-slate-50 hover:border-violet-300"
                          : "bg-[#0f1131] text-violet-400 border-slate-800 hover:bg-[#141640] hover:border-violet-700/80"
                      }`}
                    >
                      <FiFileText className="text-xs" />
                      <span>View Assignment Logs</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Chats Tab Content */
                <div className="flex flex-col max-h-80 overflow-y-auto">
                  <div className={`px-4 py-2 border-b ${
                    theme === "light" ? "bg-slate-50/70 border-slate-100" : "bg-[#0b0c20]/45 border-slate-800/40"
                  }`}>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Unread Chat Messages
                    </span>
                  </div>
                  {assignmentNotifications.filter((n) => n.kind === "discussion").length === 0 ? (
                    <p className="px-4 py-8 text-xs text-slate-400 dark:text-slate-500 text-center italic">
                      No new messages
                    </p>
                  ) : (
                    <ul className={`max-h-64 overflow-y-auto ${CRM_DROPDOWN_SCROLL_CLASS}`}>
                      {assignmentNotifications
                        .filter((n) => n.kind === "discussion")
                        .map((item) => (
                          <li key={item.leadId}>
                            <button
                              type="button"
                              onClick={() => handleNotificationClick(item.leadId)}
                              className={`w-full px-4 py-3 text-left transition-colors border-b last:border-b-0 border-slate-100/60 dark:border-slate-800/30 cursor-pointer ${
                                theme === "light"
                                  ? "hover:bg-slate-50 bg-violet-50/20"
                                  : "hover:bg-slate-800/50 bg-violet-500/5"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <p className={`text-xs font-semibold ${theme === "light" ? "text-slate-800" : "text-slate-200"} truncate flex-1`}>
                                  {item.leadName}
                                </p>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 shrink-0 font-medium mt-0.5">
                                  {formatAssignedAt(item.assignedAt)}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-1">
                                New discussion message
                              </p>
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Footer */}
              {assignmentNotifications.filter(
                (n) => (activeNotifTab === "assignments" ? n.kind !== "discussion" : n.kind === "discussion")
              ).length > 0 && (
                <div
                  className={`px-3 py-2 ${
                    theme === "light" ? "border-slate-150 bg-slate-50/50" : "border-slate-800/70 bg-[#0a0a1a]/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className={`w-full text-xs font-semibold py-1.5 rounded-lg transition-colors cursor-pointer ${
                      theme === "light"
                        ? "text-violet-600 hover:text-violet-750 hover:bg-violet-50"
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
            title="New Lead"
            aria-label="New Lead"
            className={`flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs p-2 sm:py-1.5 sm:px-2 rounded-xl transition-all shadow-md shadow-violet-500/10 ${
              isCreateLeadOpen
                ? "opacity-40 cursor-not-allowed"
                : "hover:from-violet-500 hover:to-indigo-500"
            }`}
          >
            <FaPlus className="text-[10px]" />
            <span className="hidden sm:inline">New</span>
          </button>
        )}

        {showNewUsaButton && (
          <button
            onClick={openCreateUsaLead}
            disabled={isCreateUsaLeadOpen}
            title="New USA Lead"
            aria-label="New USA Lead"
            className={`flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs p-2 sm:py-1.5 sm:px-2 rounded-xl transition-all shadow-md shadow-violet-500/10 ${
              isCreateUsaLeadOpen
                ? "opacity-40 cursor-not-allowed"
                : "hover:from-violet-500 hover:to-indigo-500"
            }`}
          >
            <FaPlus className="text-[10px]" />
            <span className="hidden sm:inline">New USA Lead</span>
          </button>
        )}
      </div>

      {/* Assignment Logs Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all transform scale-100 ${
              theme === "light"
                ? "bg-white border-slate-200 text-slate-800"
                : "bg-[#0c0d21] border-slate-800 text-slate-100"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                theme === "light" ? "border-slate-100 bg-slate-50" : "border-slate-800/80 bg-[#0e0f29]"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                  <FiFileText className="text-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Assignment Logs</h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {currentUser?.role === "ADMIN"
                      ? "Complete history of lead assignments across all counselors"
                      : "History of leads assigned to you"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLogModalOpen(false);
                  setLogSearch("");
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  theme === "light"
                    ? "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                }`}
              >
                <FiX className="text-base" />
              </button>
            </div>

            {/* Modal Subheader / Search */}
            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-4">
              <div className="relative flex-1">
                <FiGrid className="absolute left-3 top-2.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Filter by Lead name or Counselor..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className={`w-full text-xs py-2 px-3 pl-9 rounded-lg border focus:outline-none transition-all ${
                    theme === "light"
                      ? "border-slate-200 bg-slate-50 focus:border-violet-500 text-slate-800 focus:bg-white"
                      : "border-slate-800 bg-[#0e0f2d] focus:border-violet-500 text-slate-200 focus:bg-[#0c0d21]"
                  }`}
                />
                {logSearch && (
                  <button
                    onClick={() => setLogSearch("")}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-250 text-xs cursor-pointer"
                  >
                    <FiX />
                  </button>
                )}
              </div>
              <div className="text-[11px] font-bold text-slate-400 shrink-0">
                {filteredLogs.length} matching log{filteredLogs.length === 1 ? "" : "s"}
              </div>
            </div>

            {/* Modal Body / Table */}
            <div className="flex-1 overflow-y-auto crm-slim-scrollbar min-h-[300px]">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <FiGrid className="text-3xl text-slate-400/50 mb-3 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-400">No logs found</p>
                  <p className="text-[10px] text-slate-550 mt-1">
                    Try adjusting your filter search or assign new leads
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400 pb-2">
                        <th className="pb-2 font-bold">Lead Name</th>
                        <th className="pb-2 font-bold">Assigned Counselor</th>
                        <th className="pb-2 font-bold text-right">Assigned Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800/40">
                      {filteredLogs.map((log, idx) => (
                        <tr
                          key={idx}
                          className={`group transition-colors ${
                            theme === "light" ? "hover:bg-slate-50/50" : "hover:bg-slate-800/20"
                          }`}
                        >
                          <td className="py-3 font-semibold text-violet-650 dark:text-violet-400">
                            <button
                              type="button"
                              onClick={() => {
                                setIsLogModalOpen(false);
                                openLeadDetail(log.leadId);
                              }}
                              className="text-left font-bold hover:underline cursor-pointer focus:outline-none"
                            >
                              {log.leadName}
                            </button>
                          </td>
                          <td className="py-3 font-medium text-slate-600 dark:text-slate-350">
                            {log.counselorName}
                          </td>
                          <td className="py-3 text-right text-slate-450 dark:text-slate-500 tabular-nums">
                            {formatAssignedAt(log.assignedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={`px-6 py-3 border-t flex items-center justify-between ${
                theme === "light" ? "border-slate-100 bg-slate-50" : "border-slate-800 bg-[#0e0f29]"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  showConfirm(
                    "Clear Logs",
                    "Are you sure you want to clear all assignment logs? This cannot be undone.",
                    () => {
                      localStorage.removeItem("crm-assignment-logs");
                      setIsLogModalOpen(false);
                    }
                  );
                }}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  theme === "light"
                    ? "text-red-650 border-red-200 bg-white hover:bg-red-50"
                    : "text-red-450 border-red-900/60 bg-red-950/20 hover:bg-red-950/40"
                }`}
              >
                Clear All Logs
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogModalOpen(false);
                  setLogSearch("");
                }}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  theme === "light"
                    ? "bg-slate-200 text-slate-850 hover:bg-slate-300"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
