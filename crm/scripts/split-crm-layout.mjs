import fs from "fs";
import path from "path";

const root = path.resolve("src/components");
const sourcePath = path.join(root, "CrmLayout.original.tsx");
const src = fs.readFileSync(sourcePath, "utf8");
const lines = src.split("\n");

const slice = (start, end) => lines.slice(start - 1, end).join("\n");

const sections = {
  helpers: { start: 26, end: 70 },
  hook: { start: 73, end: 796 },
  sidebar: { start: 814, end: 907 },
  header: { start: 913, end: 972 },
  dashboard: { start: 979, end: 2052 },
  leads: { start: 2057, end: 2592 },
  followUps: { start: 2597, end: 2645 },
  countries: { start: 2650, end: 2739 },
  usaSlots: { start: 2744, end: 2913 },
  checklist: { start: 2918, end: 3221 },
  submissions: { start: 3226, end: 3320 },
  payments: { start: 3325, end: 3484 },
  dropLeads: { start: 3567, end: 3605 },
  staff: { start: 3610, end: 3696 },
  modals: { start: 3705, end: 4838 },
};

const commonImports = `"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { VisaStatus, StaffRole, CountryType, LeadSource, DocumentChecklist, CrmUser, Meeting } from "@/context/CrmContext";
import { ROLE_TABS, AVAILABLE_TABS } from "@/utils/crmConstants";
import { docProgress, timeAgo, getStatusColor } from "@/utils/leadHelpers";
import { AustraliaFlag, MalaysiaFlag, IndonesiaFlag, SingaporeFlag } from "@/components/CountryFlags";
import {
  FaUserFriends, FaGlobe, FaCheckSquare, FaCalendarAlt, FaHistory,
  FaPassport, FaFileInvoiceDollar, FaChartBar, FaUserLock, FaPlus,
  FaTrash, FaUndo, FaSearch, FaTimes, FaCoins, FaCheckCircle,
  FaInfoCircle, FaFileDownload, FaFileUpload, FaPaperPlane,
  FaSun, FaMoon, FaEllipsisV, FaChevronLeft, FaChevronRight,
  FaMinus, FaExpand, FaEye, FaPhone, FaCommentDots, FaCog, FaEnvelope,
  FaWhatsapp, FaExternalLinkAlt, FaSignOutAlt, FaKey, FaClipboard, FaEdit, FaSave
} from "react-icons/fa";
import { FiPhone, FiMail, FiUsers, FiClock, FiCalendar, FiEye, FiSettings, FiGlobe, FiMenu, FiUser, FiLock } from "react-icons/fi";
import DataTable, { exportRowsToCsv, StatusPill, getPillClasses, ProgressBar } from "@/components/ui/DataTable";
import { SearchableCountrySelect, PhoneInput } from "@/components/ui/FormInputs";
// @ts-ignore
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { getLeadAvatar, getLeadDescription, getLeadCompany } from "../helpers/leadDisplayHelpers";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
`;

const layoutImports = `"use client";

import React from "react";
import {
  FaChartBar, FaUserFriends, FaHistory, FaGlobe, FaPassport, FaCheckSquare,
  FaPaperPlane, FaFileInvoiceDollar, FaTrash, FaUserLock, FaSearch, FaPlus,
  FaSun, FaMoon, FaSignOutAlt
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
`;

const modalImports = `"use client";

import React from "react";
import { StaffRole, CountryType, LeadSource } from "@/context/CrmContext";
import { AVAILABLE_TABS } from "@/utils/crmConstants";
import {
  FaTimes, FaChevronRight, FaChevronLeft, FaFileUpload, FaFileDownload,
  FaGlobe, FaTrash, FaInfoCircle, FaCheckCircle
} from "react-icons/fa";
import { SearchableCountrySelect, PhoneInput } from "@/components/ui/FormInputs";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
`;

const ctxDestructure = `  const {
    leads, meetings, users, currentUser, currentRole, currentTab, setCurrentTab,
    setCurrentRole, setCurrentUser, addUser, deleteUser, addLead, updateLeadStatus,
    updateUsaSlots, addPayment, addMeeting, updateMeeting, restoreLead, updateLeadNotes,
    assignCounselor, uploadDocument, uploadInvoice, getLeadDocuments,
    handleLogout, searchTerm, setSearchTerm, checklistSearch, setChecklistSearch,
    isMobileSidebarOpen, setIsMobileSidebarOpen, isMobileDetailOpen, setIsMobileDetailOpen,
    isMobileSlotSettingsOpen, setIsMobileSlotSettingsOpen, isMobileChecklistOpen, setIsMobileChecklistOpen,
    theme, setTheme, shouldAnimate, setShouldAnimate, getAnimClass, toggleTheme,
    toast, setToast, showToast, uploadingKey, setUploadingKey,
    urlModalData, setUrlModalData, pastedUrl, setPastedUrl, uploadError, setUploadError,
    invoiceLeadId, setInvoiceLeadId, urlInvoiceData, setUrlInvoiceData,
    pastedInvoiceUrl, setPastedInvoiceUrl, uploadInvoiceError, setUploadInvoiceError,
    uploadingInvoiceKey, setUploadingInvoiceKey, statusFilter, setStatusFilter,
    kpiFilter, setKpiFilter, countryFilter, setCountryFilter,
    selectedLeadId, setSelectedLeadId, isAddLeadOpen, setIsAddLeadOpen,
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
`;

function writeTab(name, startLine, endLine) {
  const body = slice(startLine, endLine);
  const file = `${commonImports}

export function ${name}() {
${ctxDestructure}
  return (
    <>
${body}
    </>
  );
}
`;
  fs.writeFileSync(path.join(root, "crm/tabs", `${name}.tsx`), file);
}

function writeLayout(name, imports, startLine, endLine) {
  const body = slice(startLine, endLine);
  const file = `${imports}

export function ${name}() {
${ctxDestructure}
  return (
    <>
${body}
    </>
  );
}
`;
  fs.writeFileSync(path.join(root, "crm/layout", `${name}.tsx`), file);
}

const helpersBody = slice(sections.helpers.start, sections.helpers.end)
  .replace(/^const getLeadAvatar/m, "export const getLeadAvatar")
  .replace(/^const getLeadDescription/m, "export const getLeadDescription")
  .replace(/^const getLeadCompany/m, "export const getLeadCompany");
fs.writeFileSync(
  path.join(root, "crm/helpers/leadDisplayHelpers.ts"),
  helpersBody + "\n"
);

const hookBody = slice(sections.hook.start, sections.hook.end);
const hookFile = `"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCrm, VisaStatus, StaffRole, CountryType, LeadSource, DocumentChecklist, CrmUser, Meeting } from "@/context/CrmContext";
import { ROLE_TABS } from "@/utils/crmConstants";
// @ts-ignore
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";

export function useCrmLayoutState() {
${hookBody}

  return {
    leads, meetings, users, currentUser, currentRole, currentTab, setCurrentTab,
    setCurrentRole, setCurrentUser, addUser, deleteUser, addLead, updateLeadStatus,
    updateUsaSlots, addPayment, addMeeting, updateMeeting, restoreLead, updateLeadNotes,
    assignCounselor, uploadDocument, uploadInvoice, getLeadDocuments,
    handleLogout, searchTerm, setSearchTerm, checklistSearch, setChecklistSearch,
    isMobileSidebarOpen, setIsMobileSidebarOpen, isMobileDetailOpen, setIsMobileDetailOpen,
    isMobileSlotSettingsOpen, setIsMobileSlotSettingsOpen, isMobileChecklistOpen, setIsMobileChecklistOpen,
    theme, setTheme, shouldAnimate, setShouldAnimate, getAnimClass, toggleTheme,
    toast, setToast, showToast, uploadingKey, setUploadingKey,
    urlModalData, setUrlModalData, pastedUrl, setPastedUrl, uploadError, setUploadError,
    invoiceLeadId, setInvoiceLeadId, urlInvoiceData, setUrlInvoiceData,
    pastedInvoiceUrl, setPastedInvoiceUrl, uploadInvoiceError, setUploadInvoiceError,
    uploadingInvoiceKey, setUploadingInvoiceKey, statusFilter, setStatusFilter,
    kpiFilter, setKpiFilter, countryFilter, setCountryFilter,
    selectedLeadId, setSelectedLeadId, isAddLeadOpen, setIsAddLeadOpen,
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
  };
}

export type CrmLayoutState = ReturnType<typeof useCrmLayoutState>;
`;
fs.writeFileSync(path.join(root, "crm/hooks/useCrmLayoutState.tsx"), hookFile);

fs.writeFileSync(
  path.join(root, "crm/context/CrmLayoutContext.tsx"),
  `"use client";

import React, { createContext, useContext } from "react";
import { useCrmLayoutState, type CrmLayoutState } from "../hooks/useCrmLayoutState";

const CrmLayoutContext = createContext<CrmLayoutState | null>(null);

export function CrmLayoutProvider({ children }: { children: React.ReactNode }) {
  const state = useCrmLayoutState();
  return (
    <CrmLayoutContext.Provider value={state}>{children}</CrmLayoutContext.Provider>
  );
}

export function useCrmLayoutContext(): CrmLayoutState {
  const ctx = useContext(CrmLayoutContext);
  if (!ctx) throw new Error("useCrmLayoutContext must be used within CrmLayoutProvider");
  return ctx;
}
`
);

writeLayout("CrmSidebar", layoutImports, sections.sidebar.start, sections.sidebar.end);
writeLayout("CrmHeader", layoutImports, sections.header.start, sections.header.end);

writeTab("DashboardTab", sections.dashboard.start, sections.dashboard.end);
writeTab("LeadsTab", sections.leads.start, sections.leads.end);
writeTab("FollowUpsTab", sections.followUps.start, sections.followUps.end);
writeTab("CountriesTab", sections.countries.start, sections.countries.end);
writeTab("USASlotsTab", sections.usaSlots.start, sections.usaSlots.end);
writeTab("ChecklistTab", sections.checklist.start, sections.checklist.end);
writeTab("SubmissionsTab", sections.submissions.start, sections.submissions.end);
writeTab("PaymentsTab", sections.payments.start, sections.payments.end);
writeTab("DropLeadsTab", sections.dropLeads.start, sections.dropLeads.end);
writeTab("StaffTab", sections.staff.start, sections.staff.end);

const modalsFile = `${modalImports}

export function CrmModals() {
${ctxDestructure}
  return (
    <>
${slice(sections.modals.start, sections.modals.end)}
    </>
  );
}
`;
fs.writeFileSync(path.join(root, "crm/modals/CrmModals.tsx"), modalsFile);

fs.writeFileSync(
  path.join(root, "crm/CrmTabViews.tsx"),
  `"use client";

import React from "react";
import { useCrmLayoutContext } from "./context/CrmLayoutContext";
import { DashboardTab } from "./tabs/DashboardTab";
import { LeadsTab } from "./tabs/LeadsTab";
import { FollowUpsTab } from "./tabs/FollowUpsTab";
import { CountriesTab } from "./tabs/CountriesTab";
import { USASlotsTab } from "./tabs/USASlotsTab";
import { ChecklistTab } from "./tabs/ChecklistTab";
import { SubmissionsTab } from "./tabs/SubmissionsTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { DropLeadsTab } from "./tabs/DropLeadsTab";
import { StaffTab } from "./tabs/StaffTab";

export function CrmTabViews() {
  const { currentTab } = useCrmLayoutContext();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      {currentTab === "Dashboard" && <DashboardTab />}
      {currentTab === "Leads" && <LeadsTab />}
      {currentTab === "FollowUps" && <FollowUpsTab />}
      {currentTab === "Countries" && <CountriesTab />}
      {currentTab === "USASlots" && <USASlotsTab />}
      {currentTab === "Checklist" && <ChecklistTab />}
      {currentTab === "Submissions" && <SubmissionsTab />}
      {currentTab === "Payments" && <PaymentsTab />}
      {currentTab === "DropLeads" && <DropLeadsTab />}
      {currentTab === "Staff" && <StaffTab />}
    </div>
  );
}
`
);

fs.writeFileSync(
  path.join(root, "crm/CrmLayoutShell.tsx"),
  `"use client";

import React from "react";
import { CrmLayoutProvider, useCrmLayoutContext } from "./context/CrmLayoutContext";
import { CrmSidebar } from "./layout/CrmSidebar";
import { CrmHeader } from "./layout/CrmHeader";
import { CrmToast } from "./layout/CrmToast";
import { CrmTabViews } from "./CrmTabViews";
import { CrmModals } from "./modals/CrmModals";

function CrmLayoutContent() {
  const { isMounted, isMobileSidebarOpen, setIsMobileSidebarOpen } = useCrmLayoutContext();

  if (!isMounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="relative flex min-h-screen bg-[#070712] text-slate-100 font-sans overflow-x-hidden">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <CrmSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <CrmHeader />
        <CrmTabViews />
      </main>

      <CrmModals />
      <CrmToast />
    </div>
  );
}

export default function CrmLayout() {
  return (
    <CrmLayoutProvider>
      <CrmLayoutContent />
    </CrmLayoutProvider>
  );
}
`
);

fs.writeFileSync(path.join(root, "CrmLayout.tsx"), `export { default } from "./crm/CrmLayoutShell";\n`);

console.log("Split complete from", sourcePath);
