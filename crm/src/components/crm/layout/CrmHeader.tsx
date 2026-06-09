"use client";

import React from "react";
import {
  FaChartBar, FaUserFriends, FaHistory, FaGlobe, FaPassport, FaCheckSquare,
  FaPaperPlane, FaFileInvoiceDollar, FaTrash, FaUserLock, FaSearch, FaPlus,
  FaSun, FaMoon, FaSignOutAlt
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";


export function CrmHeader() {
  const {
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

  return (
    <>
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0a1a] px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 mr-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden flex items-center justify-center cursor-pointer"
            >
              <FiMenu className="text-lg" />
            </button>
            <h2 className="text-sm md:text-lg font-bold text-slate-100 truncate max-w-[120px] md:max-w-none">
              Staff Operations Pane
            </h2>
            <div className="px-2 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[10px] font-extrabold uppercase bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded-md tracking-wider">
              <span className="hidden sm:inline">ROLE: </span>{currentRole}
            </div>
          </div>

          {/* Search bar inside header (only visible for dashboard/leads) */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative w-28 sm:w-48 md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FaSearch className="text-xs" />
              </span>
              <input
                type="text"
                placeholder="Search leads, names, files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800/80 text-xs pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 placeholder-slate-500"
              />
            </div>

            {/* Theme Toggle Switch */}
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
    </>
  );
}
