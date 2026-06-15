"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { VisaStatus, StaffRole, CountryType, LeadSource, DocumentChecklist, CrmUser, Meeting, Lead } from "@/context/CrmContext";
import { ROLE_TABS, AVAILABLE_TABS } from "@/utils/crmConstants";
import { docProgress, timeAgo, getStatusColor } from "@/utils/leadHelpers";
import { AustraliaFlag, MalaysiaFlag, IndonesiaFlag, SingaporeFlag } from "@/components/CountryFlags";
import {
  FaUserFriends, FaGlobe, FaCheckSquare, FaCalendarAlt, FaHistory,
  FaPassport, FaFileInvoiceDollar, FaChartBar, FaUserLock, FaPlus,
  FaTrash, FaUndo, FaSearch, FaTimes, FaCoins,
  FaInfoCircle, FaFileDownload, FaFileUpload, FaPaperPlane,
  FaSun, FaMoon, FaEllipsisV, FaChevronLeft, FaChevronRight,
  FaMinus, FaExpand, FaEye, FaPhone, FaCommentDots, FaCog, FaEnvelope,
  FaWhatsapp, FaExternalLinkAlt, FaSignOutAlt, FaKey, FaClipboard, FaEdit, FaSave
} from "react-icons/fa";
import { FiPhone, FiMail, FiUsers, FiClock, FiCalendar, FiCheckCircle, FiEye, FiSettings, FiGlobe, FiMenu, FiUser, FiLock } from "react-icons/fi";
import DataTable, { exportRowsToCsv, StatusPill, getPillClasses, ProgressBar } from "@/components/ui/DataTable";
import { StatusSelectPill } from "@/components/ui/StatusSelectPill";
import { CounselorSelectPill, COUNSELOR_OPTIONS } from "@/components/ui/CounselorSelectPill";
import {
  SearchableCountrySelect,
  PhoneInput,
  leadStatusFilterOptions,
} from "@/components/ui/FormInputs";
// @ts-ignore
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { getLeadAvatar, getLeadDescription, getLeadCompany } from "../helpers/leadDisplayHelpers";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { useColumnSearch } from "@/hooks/useColumnSearch";
import { applyColumnSearch } from "@/utils/columnSearch";
import { HoverHint } from "@/components/ui/HoverHint";
import { LeadManagementToolbar } from "@/components/ui/LeadManagementToolbar";
import {
  IN_PROGRESS_STATUSES,
  QUICK_TAB_FILTERS,
  filterScopedLeads,
  matchesQuickTab,
} from "@/utils/leadQuickFilters";

export function LeadsTab() {
  const {
    leads, meetings, users, currentUser, currentRole, currentTab, setCurrentTab,
    setCurrentRole, setCurrentUser, addUser, deleteUser, addLead, updateLeadStatus,
    updateUsaSlots, addPayment, addMeeting, updateMeeting, restoreLead, updateLeadNotes,
    assignCounselor, uploadDocument, uploadInvoice, getLeadDocuments,
    handleLogout, checklistSearch, setChecklistSearch,
    isMobileSidebarOpen, setIsMobileSidebarOpen, isMobileDetailOpen, setIsMobileDetailOpen,
    isMobileSlotSettingsOpen, setIsMobileSlotSettingsOpen, isMobileChecklistOpen, setIsMobileChecklistOpen,
    theme, setTheme, shouldAnimate, setShouldAnimate, getAnimClass, toggleTheme,
    toast, setToast, showToast, uploadingKey, setUploadingKey,
    urlModalData, setUrlModalData, pastedUrl, setPastedUrl, uploadError, setUploadError,
    invoiceLeadId, setInvoiceLeadId, urlInvoiceData, setUrlInvoiceData,
    pastedInvoiceUrl, setPastedInvoiceUrl, uploadInvoiceError, setUploadInvoiceError,
    uploadingInvoiceKey, setUploadingInvoiceKey,
    statusFilter, setStatusFilter,
    kpiFilter, setKpiFilter, countryFilter, setCountryFilter,
    selectedLeadId, setSelectedLeadId, openLeadChecklist, openLeadDetail, isAddLeadOpen, setIsAddLeadOpen,
    addLeadStep, setAddLeadStep, addLeadSelectedCategory, setAddLeadSelectedCategory,
    isAddPaymentOpen, setIsAddPaymentOpen, isAddMeetingOpen, setIsAddMeetingOpen,
    selectedMeeting, setSelectedMeeting, isEditMeetingOpen, setIsEditMeetingOpen,
    isAddStaffOpen, setIsAddStaffOpen, isEditStaffOpen, setIsEditStaffOpen,
    editingStaff, setEditingStaff, addStaffRole, setAddStaffRole,
    addStaffCustomRole, setAddStaffCustomRole, editStaffRole, setEditStaffRole,
    editStaffCustomRole, setEditStaffCustomRole, leadsMgmtTab, setLeadsMgmtTab,
    selectedRevenuePeriod, setSelectedRevenuePeriod, hoveredBarIndex, setHoveredBarIndex,
    countrySortOrder, setCountrySortOrder, selectedCalendarDate, setSelectedCalendarDate,
    dateRangeStart, setDateRangeStart, dateRangeEnd, setDateRangeEnd,
    calMonth, setCalMonth, calYear, setCalYear, hoveredRetentionMonth, setHoveredRetentionMonth,
    isMapModalOpen, setIsMapModalOpen, mapZoom, setMapZoom, mapCenter, setMapCenter,
    cardMapZoom, setCardMapZoom, cardMapCenter, setCardMapCenter,
    hoveredCountry, setHoveredCountry, tooltipRef, tooltipPosRef, isMounted,
    handleCountryMouseEnter, handleCountryMouseMove, handleCountryMouseLeave,
    handleCountryClick, resetMap, startDate, setStartDate, endDate, setEndDate,
    depositLeadId, setDepositLeadId, tempInvoiceFile, setTempInvoiceFile,
    tempInvoiceUrl, setTempInvoiceUrl, isUploadingTempInvoice, setIsUploadingTempInvoice,
    allowedTabs, userAllowedTabs, canModifyLeads, canVerifyDocs, canSubmitVisa, canManagePayments,
    openSignedUrl, selectedLead, activeLeads, monthlyChart, chartMax, countryColors,
    countryStats, countryTotal, donutSegments, calendarData, filteredLeads,
    countryBarChartData, maxLeadsCount, yLabels, getCountryAbbreviation,
    handlePeriodChange, handleCalendarDateClick, getDaysInMonth, monthNames,
    leadsMgmtData, topCountryStats, pipelineStats, cardMap, modalMap,
  } = useCrmLayoutContext();

  const columnSearch = useColumnSearch();

  const scopedLeads = useMemo(
    () => filterScopedLeads(leads, kpiFilter, countryFilter, ""),
    [leads, kpiFilter, countryFilter]
  );

  const serviceFilterOptions = useMemo(() => {
    const types = [...new Set(leads.map((l) => l.visaType).filter(Boolean))].sort();
    return [{ value: "All", label: "All Services" }, ...types.map((t) => ({ value: t, label: t }))];
  }, [leads]);

  const counselorFilterOptions = useMemo(
    () => [{ value: "All", label: "All Counselors" }, ...COUNSELOR_OPTIONS],
    []
  );

  const baseFilteredLeads = useMemo(() => {
    const statusColFilter = columnSearch.debouncedFilters.status?.trim();
    const tab = QUICK_TAB_FILTERS.find((item) => item.id === statusFilter);

    if (!tab) {
      return scopedLeads.filter((l) => {
        if (!statusColFilter && l.status === "Dropped") return false;
        return true;
      });
    }

    return scopedLeads.filter((l) => matchesQuickTab(l, tab.id));
  }, [scopedLeads, statusFilter, columnSearch.debouncedFilters.status]);

  const leadSearchGetters = useMemo(
    () => ({
      lead: (lead: Lead) =>
        [lead.name, getLeadDescription(lead), lead.phone, lead.email, lead.country]
          .filter(Boolean)
          .join(" "),
      service: (lead: Lead) => lead.visaType,
      status: (lead: Lead) => lead.status,
      counselor: (lead: Lead) => lead.counselor,
    }),
    []
  );

  const leadSearchColumns = useMemo(
    () =>
      Object.entries(leadSearchGetters).map(([searchKey, getSearchValue]) => ({
        searchKey,
        getSearchValue,
        ...(searchKey === "lead"
          ? {}
          : { filterMode: "exact" as const, filterClearValue: "All" }),
      })),
    [leadSearchGetters]
  );

  const tableRows = useMemo(
    () => applyColumnSearch(baseFilteredLeads, leadSearchColumns, columnSearch.debouncedFilters),
    [baseFilteredLeads, leadSearchColumns, columnSearch.debouncedFilters]
  );

  return (
    <>
            <div className="-m-4 md:-m-8 p-4 md:p-6 bg-gray-50 dark:bg-transparent min-h-[calc(100vh-4rem)] space-y-5">

              {/* KPI cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    label: "New Today",
                    value: leads.filter(l => l.dateCreated === new Date().toISOString().split("T")[0]).length,
                    icon: FiCalendar,
                    iconClass: "bg-rose-100 border border-rose-200/90 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/25 dark:text-rose-400",
                    trend: "↓ 16%",
                    up: false,
                    bgColor: "bg-[#fef2f2] dark:bg-rose-950/45",
                    textColor: "text-[#ef4444] dark:text-rose-450",
                    trendColor: "text-rose-600 dark:text-rose-500",
                    color: "#ef4444",
                    linePath: "M 5 20 C 12 18, 18 35, 24 30 C 30 25, 36 22, 42 26 C 48 30, 54 28, 60 20 C 66 12, 72 35, 78 30 C 84 25, 92 28, 100 26",
                    areaPath: "M 5 20 C 12 18, 18 35, 24 30 C 30 25, 36 22, 42 26 C 48 30, 54 28, 60 20 C 66 12, 72 35, 78 30 C 84 25, 92 28, 100 26 L 100 40 L 5 40 Z"
                  },
                  {
                    label: "In Progress",
                    value: leads.filter(l => IN_PROGRESS_STATUSES.includes(l.status)).length,
                    icon: FiClock,
                    iconClass: "bg-sky-100 border border-sky-200/90 text-sky-600 dark:bg-sky-500/10 dark:border-sky-500/25 dark:text-sky-400",
                    trend: "↑ 8%",
                    up: true,
                    bgColor: "bg-[#eff6ff] dark:bg-sky-950/45",
                    textColor: "text-[#0284c7] dark:text-sky-400",
                    trendColor: "text-emerald-600 dark:text-emerald-500",
                    color: "#3b82f6",
                    linePath: "M 5 32 C 12 32, 18 35, 24 25 C 30 15, 36 32, 42 32 C 48 32, 54 18, 60 16 C 66 14, 72 25, 78 14 C 84 4, 92 14, 100 12",
                    areaPath: "M 5 32 C 12 32, 18 35, 24 25 C 30 15, 36 32, 42 32 C 48 32, 54 18, 60 16 C 66 14, 72 25, 78 14 C 84 4, 92 14, 100 12 L 100 40 L 5 40 Z"
                  },
                  {
                    label: "Visa Success",
                    value: leads.filter(l => l.status === "Approved / Rejected").length,
                    icon: FiCheckCircle,
                    iconClass: "bg-emerald-100 border border-emerald-200/90 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-400",
                    trend: "↑ 10%",
                    up: true,
                    bgColor: "bg-[#ecfdf5] dark:bg-emerald-950/45",
                    textColor: "text-[#10b981] dark:text-emerald-400",
                    trendColor: "text-emerald-600 dark:text-emerald-500",
                    color: "#10b981",
                    linePath: "M 5 35 C 15 35, 25 32, 35 25 C 45 20, 55 15, 65 10 C 75 5, 85 8, 95 4",
                    areaPath: "M 5 35 C 15 35, 25 32, 35 25 C 45 20, 55 15, 65 10 C 75 5, 85 8, 95 4 L 100 40 L 5 40 Z"
                  },
                  {
                    label: "Total Leads",
                    value: leads.filter(l => l.status !== "Dropped").length,
                    icon: FiUsers,
                    iconClass: "bg-blue-100 border border-blue-200/90 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/25 dark:text-blue-400",
                    trend: "↑ 12%",
                    up: true,
                    bgColor: "bg-[#eff6ff] dark:bg-blue-950/45",
                    textColor: "text-[#2563eb] dark:text-blue-400",
                    trendColor: "text-emerald-600 dark:text-emerald-500",
                    color: "#3b82f6",
                    linePath: "M 5 30 C 12 28, 18 20, 25 25 C 32 30, 38 12, 45 15 C 52 18, 58 22, 65 18 C 72 14, 78 10, 85 14 C 92 18, 96 10, 100 8",
                    areaPath: "M 5 30 C 12 28, 18 20, 25 25 C 32 30, 38 12, 45 15 C 52 18, 58 22, 65 18 C 72 14, 78 10, 85 14 C 92 18, 96 10, 100 8 L 100 40 L 5 40 Z"
                  },
                  // {
                  //   label: "Meetings Booked",
                  //   value: meetings.length,
                  //   icon: FiCalendar,
                  //   trend: "↑ 15%",
                  //   up: true,
                  //   bgColor: "bg-[#faf5ff] dark:bg-purple-950/45",
                  //   textColor: "text-[#7c3aed] dark:text-purple-400",
                  //   trendColor: "text-emerald-600 dark:text-emerald-500",
                  //   color: "#a855f7",
                  //   linePath: "M 5 32 C 15 32, 25 30, 35 28 C 45 26, 55 24, 65 18 C 75 12, 85 14, 95 8 C 97 6, 99 5, 100 4",
                  //   areaPath: "M 5 32 C 15 32, 25 30, 35 28 C 45 26, 55 24, 65 18 C 75 12, 85 14, 95 8 C 97 6, 99 5, 100 4 L 100 40 L 5 40 Z"
                  // },
                ].map((kpi, i) => {
                  const Icon = kpi.icon;
                  const isFilterActive =
                    (kpi.label === "New Today" && kpiFilter === "New Today") ||
                    (kpi.label === "In Progress" && kpiFilter === "In Progress") ||
                    (kpi.label === "Total Leads" && kpiFilter === "Total") ||
                    (kpi.label === "Visa Success" && kpiFilter === "Visa Success");
                  
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (kpi.label === "New Today") {
                          setKpiFilter("New Today");
                        } else if (kpi.label === "In Progress") {
                          setKpiFilter("In Progress");
                        } else if (kpi.label === "Total Leads") {
                          setKpiFilter("Total");
                        } else if (kpi.label === "Visa Success") {
                          setKpiFilter("Visa Success");
                        }
                      }}
                      className={`rounded-2xl border p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_4px_25px_-2px_rgba(0,0,0,0.08)] transition-all duration-300 flex gap-4 items-start cursor-pointer hover:border-violet-500/50 dark:hover:border-violet-500/50 ${
                        isFilterActive
                          ? "border-violet-500 ring-2 ring-violet-500/10 dark:border-violet-500 bg-violet-50 dark:bg-slate-800/80"
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${kpi.iconClass}`}
                      >
                        <Icon className="text-[16px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-350">{kpi.label}</span>
                          <span className={`text-[12px] font-semibold ${kpi.trendColor}`}>{kpi.trend}</span>
                        </div>
                        <div className="flex items-end justify-between mt-1">
                          <div className="flex flex-col">
                            <span className="text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none mt-1">
                              {kpi.value.toLocaleString()}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2">vs. last period</span>
                          </div>
                          <div className="w-[100px] h-10 shrink-0 relative overflow-visible">
                            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                              <defs>
                                <linearGradient id={`sparkline-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={kpi.color} stopOpacity="0.25" />
                                  <stop offset="100%" stopColor={kpi.color} stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              <path
                                d={kpi.areaPath}
                                fill={`url(#sparkline-grad-${i})`}
                              />
                              <path
                                d={kpi.linePath}
                                fill="none"
                                stroke={kpi.color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lead detail split-screen */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch h-auto xl:h-[600px]">
                
                {/* Leads list (reusable DataTable) */}
                <div className="xl:col-span-4 flex flex-col h-full">
                  <DataTable
                    className="h-full flex flex-col"
                    pagination={true}
                    defaultPageSize={8}
                    rows={tableRows}
                    columnSearch={columnSearch}
                    getRowId={(l) => l.id}
                    onRowClick={(l) => openLeadDetail(l.id)}
                    selectedRowId={selectedLeadId}
                    filters={
                      <LeadManagementToolbar
                        countryFilter={countryFilter}
                        onCountryFilterChange={setCountryFilter}
                      />
                    }
                    onExport={() =>
                      exportRowsToCsv(
                        "leads",
                        ["#", "Name", "Phone", "Destination", "Visa Class", "Doc %", "Status", "Counselor"],
                        tableRows.map((l, i) => [
                          i + 1,
                          l.name,
                          l.phone,
                          l.country,
                          l.visaType,
                          `${Math.round(docProgress(l.checklist, l.employmentCategory))}%`,
                          l.status,
                          l.counselor,
                        ])
                      )
                    }
                    columns={[
                      {
                        header: "Lead",
                        searchKey: "lead",
                        searchLabel: "Lead",
                        searchPlaceholder: "Search lead...",
                        getSearchValue: leadSearchGetters.lead,
                        render: (lead) => (
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openLeadDetail(lead.id);
                              }}
                              className="font-bold text-gray-900 dark:text-slate-100 text-[13px] truncate text-left hover:text-violet-600 dark:hover:text-violet-400 hover:underline cursor-pointer transition-colors"
                            >
                              {lead.name}
                            </button>
                            <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium block max-w-[180px] truncate">
                              {getLeadDescription(lead)}
                            </span>
                          </div>
                        ),
                      },
                      {
                        header: "Service",
                        searchKey: "service",
                        searchLabel: "Service",
                        filterSelectOptions: serviceFilterOptions,
                        filterSelectPlaceholder: "All Services",
                        filterSelectClearValue: "All",
                        getSearchValue: leadSearchGetters.service,
                        render: (lead) => (
                          <span className="font-medium text-gray-600 dark:text-slate-300 text-[13px] whitespace-nowrap">
                            {lead.visaType}
                          </span>
                        ),
                      },
                      {
                        header: "Doc Verification",
                        render: (lead) => {
                          const pct = docProgress(lead.checklist, lead.employmentCategory);
                          const filledCount = pct === 0 ? 0 : Math.ceil(pct / 25);
                          const canOpenChecklist = userAllowedTabs.includes("Checklist");

                          return (
                            <div className="min-w-[120px] flex items-center justify-start h-full">
                              <HoverHint
                                label="Open checklist"
                                disabled={!canOpenChecklist}
                                onClick={() => openLeadChecklist(lead.id)}
                              >
                                <div className="inline-flex items-center gap-2">
                                  <div className="flex gap-1 w-[76px]">
                                    {[1, 2, 3, 4].map((seg) => (
                                      <div
                                        key={seg}
                                        className={`h-2 flex-1 rounded-[1.5px] ${
                                          seg <= filledCount
                                            ? "bg-emerald-500"
                                            : "bg-gray-200 dark:bg-slate-800"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[12px] font-bold text-gray-500 dark:text-slate-400 tabular-nums">
                                    {Math.round(pct)}%
                                  </span>
                                </div>
                              </HoverHint>
                            </div>
                          );
                        },
                      },
                      {
                        header: "Status",
                        searchKey: "status",
                        searchLabel: "Status",
                        filterSelectOptions: leadStatusFilterOptions,
                        filterSelectPlaceholder: "All Statuses",
                        filterSelectPortalId: "lead-status-column-filter-portal",
                        filterSelectClearValue: "All",
                        getSearchValue: leadSearchGetters.status,
                        render: (lead) => (
                          <StatusSelectPill
                            value={lead.status}
                            disabled={!canModifyLeads}
                            portalId={`status-select-${lead.id}`}
                            onChange={(status) => updateLeadStatus(lead.id, status)}
                          />
                        ),
                      },
                      {
                        header: "Counselor",
                        searchKey: "counselor",
                        searchLabel: "Counselor",
                        filterSelectOptions: counselorFilterOptions,
                        filterSelectPlaceholder: "All Counselors",
                        filterSelectClearValue: "All",
                        getSearchValue: leadSearchGetters.counselor,
                        render: (lead) => (
                          <CounselorSelectPill
                            value={lead.counselor}
                            disabled={!canModifyLeads}
                            portalId={`counselor-select-${lead.id}`}
                            onChange={(counselor) => assignCounselor(lead.id, counselor)}
                          />
                        ),
                      },
                      {
                        header: "Visa Credential",
                        render: (lead) => (
                          <div className="flex items-center gap-2">
                            {lead.visaCredentials?.username ? (
                              <button
                                type="button"
                                data-tooltip="Copy username"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  try {
                                    navigator.clipboard.writeText(lead.visaCredentials?.username || "");
                                    showToast("Username copied");
                                  } catch {
                                    showToast("Copied", "success");
                                  }
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                              >
                                <FiUser className="text-[13.5px]" />
                              </button>
                            ) : null}
                            {lead.visaCredentials?.password ? (
                              <button
                                type="button"
                                data-tooltip="Copy password"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  try {
                                    navigator.clipboard.writeText(lead.visaCredentials?.password || "");
                                    showToast("Password copied");
                                  } catch {
                                    showToast("Copied", "success");
                                  }
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                              >
                                <FiLock className="text-[13.5px]" />
                              </button>
                            ) : null}
                            {!lead.visaCredentials?.username && !lead.visaCredentials?.password ? (
                              <span className="text-gray-400 dark:text-slate-500 text-[11px]">—</span>
                            ) : null}
                          </div>
                        ),
                      },
                      {
                        header: "Last Contact",
                        render: (lead) => (
                          <span className="text-gray-500 dark:text-slate-400 text-[12px] font-medium whitespace-nowrap">
                            {timeAgo(lead.lastUpdated)}
                          </span>
                        ),
                      },
                    ]}
                    actions={(lead) => [
                      {
                        icon: FiPhone,
                        title: "Call",
                        onClick: (l) => window.open(`tel:${l.phone}`),
                      },
                      {
                        icon: FaWhatsapp,
                        title: "WhatsApp",
                        onClick: (l) =>
                          window.open(
                            `https://wa.me/${l.phone.replace(/[^0-9]/g, "")}`,
                            "_blank"
                          ),
                      },
                      {
                        icon: FiMail,
                        title: "Email",
                        onClick: (l) => window.open(`mailto:${l.email}`),
                      },
                    ]}
                    emptyText="No leads match your filters."
                  />
                </div>

                {/* Lead Detail Panel - disabled (row click detail card) */}
                {false && isMobileDetailOpen && (
                  <div 
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
                    onClick={() => setIsMobileDetailOpen(false)}
                  />
                )}

                {false && selectedLead && (
                  <div className={`
                    fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-gray-250 dark:border-slate-800 p-5 flex flex-col h-full space-y-5 overflow-y-auto shadow-2xl transition-transform duration-300
                    xl:static xl:z-auto xl:w-auto xl:max-w-none xl:shadow-none xl:border-l-0 xl:rounded-2xl xl:bg-white xl:dark:bg-slate-900/50 xl:translate-x-0 xl:flex
                    ${isMobileDetailOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
                    ${!isMobileDetailOpen ? "hidden xl:flex" : "flex"}
                  `}>
                    <div className="space-y-5">
                      {/* Details header */}
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate leading-snug">{selectedLead.name}</h4>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold tracking-wider uppercase block truncate mt-0.5">{selectedLead.id}</span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <StatusPill status={selectedLead.status} />
                          <button
                            onClick={() => setIsMobileDetailOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 xl:hidden flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Dropdowns and Meta Fields */}
                      <div className="space-y-4 border-t border-gray-100 dark:border-slate-800/80 pt-4">
                        {/* Transition status */}
                        <div className="space-y-1.5">
                          <label className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block">Transition Status</label>
                          <select
                            value={selectedLead.status}
                            onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as VisaStatus)}
                            disabled={!canModifyLeads}
                            className="w-full bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                          >
                            <option value="New Lead">New Lead</option>
                            <option value="Lead Assigned">Lead Assigned</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Follow-Up">Follow-Up</option>
                            <option value="Interested">Interested</option>
                            <option value="Documents Pending">Documents Pending</option>
                            <option value="Documents Received">Documents Received</option>
                            <option value="Under Verification">Under Verification</option>
                            <option value="Ready For Submission">Ready For Submission</option>
                            <option value="Visa Submitted">Visa Submitted</option>
                            <option value="Approved / Rejected">Approved / Rejected</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>

                        {/* Assigned counselor */}
                        <div className="space-y-1.5">
                          <label className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block">Assigned Counselor</label>
                          <select
                            value={selectedLead.counselor}
                            onChange={(e) => assignCounselor(selectedLead.id, e.target.value)}
                            disabled={!canModifyLeads}
                            className="w-full bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                          >
                            <option value="Unassigned">Unassigned</option>
                            <option value="Priya Mehta">Priya Mehta</option>
                            <option value="Rohit Verma">Rohit Verma</option>
                            <option value="Simran Kaur">Simran Kaur</option>
                          </select>
                        </div>

                        {/* Contact details */}
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-slate-800/80 pt-4">
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider block">Email Address</span>
                            <span className="text-gray-700 dark:text-slate-200 text-[12px] font-bold select-all block mt-1 truncate">{selectedLead.email}</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider block">Contact Number</span>
                            <span className="text-gray-700 dark:text-slate-200 text-[12px] font-bold select-all block mt-1 truncate">{selectedLead.phone}</span>
                          </div>
                        </div>

                        {/* Counselor notes */}
                        <div className="space-y-1.5 border-t border-gray-100 dark:border-slate-800/80 pt-4">
                          <label className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block">Counselor File Notes</label>
                          <textarea
                            rows={3}
                            value={selectedLead.notes}
                            onChange={(e) => updateLeadNotes(selectedLead.id, e.target.value)}
                            disabled={!canModifyLeads}
                            placeholder="Type internal remarks here..."
                            className="w-full bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700 text-xs p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 dark:placeholder-slate-500 text-gray-700 dark:text-slate-200 resize-none h-[100px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Completed scans footer */}
                    {/* <div className="p-4 bg-gray-50/50 dark:bg-slate-800/20 border border-gray-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider block">Completed Scans</span>
                        <span className="text-emerald-500 dark:text-emerald-400 font-bold text-sm mt-0.5 block">
                          {Object.values(selectedLead.checklist).filter(Boolean).length} / {Object.values(selectedLead.checklist).length} Files
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentTab("Checklist");
                          setSelectedLeadId(selectedLead.id);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-xs inline-flex items-center gap-1"
                      >
                        Review Vault →
                      </button>
                    </div> */}
                  </div>
                )}

              </div>

            </div>
    </>
  );
}
