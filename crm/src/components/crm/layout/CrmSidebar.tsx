"use client";

import React from "react";
import {
  FaChartBar, FaUserFriends, FaHistory, FaGlobe, FaPassport, FaCheckSquare,
  FaPaperPlane, FaFileInvoiceDollar, FaTrash, FaUserLock, FaFolder, FaSearch, FaPlus,
  FaSun, FaMoon, FaSignOutAlt
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";


export function CrmSidebar() {
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
    selectedLeadId, setSelectedLeadId, navigateToTab, isLeadChecklistRoute, isAddLeadOpen, setIsAddLeadOpen,
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
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800/80 bg-[#0a0a1a] flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0
        lg:static lg:translate-x-0 lg:z-auto lg:flex
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div>
          {/* Brand */}
          <div className="h-16 px-6 border-b border-slate-800/60 flex items-center space-x-3">
            <img src="/logo.webp" alt="JM Visa Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-violet-500/10" />
            <div>
              <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 leading-tight">
                JM VISA
              </h1>
              <span className="text-[10px] uppercase font-bold text-violet-400/90 tracking-widest block">
                IMMIGRATION CRM
              </span>
            </div>
          </div>


          {/* Navigation Menu */}
          <nav className="p-4 space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider px-3 block mb-2">
              Main Operations
            </span>
            
            {[
              { id: "Dashboard", label: "Dashboard", icon: FaChartBar },
              { id: "Leads", label: "Lead Management", icon: FaUserFriends },
              // { id: "FollowUps", label: "Follow-Ups", icon: FaHistory },
              // { id: "Countries", label: "Country Wise Leads", icon: FaGlobe },
              { id: "USASlots", label: "USA Slot Tracking", icon: FaPassport },
              // { id: "Checklist", label: "Document Checklist", icon: FaCheckSquare },
              { id: "Submissions", label: "Visa Submission", icon: FaPaperPlane },
              { id: "Payments", label: "Payments & Finance", icon: FaFileInvoiceDollar },
              // { id: "Meetings", label: "Meetings & Reminders", icon: FaCalendarAlt },
              { id: "DropLeads", label: "Drop Leads Log", icon: FaTrash },
              { id: "Staff", label: "Staff Directory", icon: FaUserLock },
              { id: "Drive", label: "Drive", icon: FaFolder },
            ].filter((tab) => userAllowedTabs.includes(tab.id)).map((tab) => {
              const Icon = tab.icon;
              const isActive =
                currentTab === tab.id ||
                (tab.id === "Leads" && currentTab === "Checklist");
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    navigateToTab(tab.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600/25 to-indigo-600/5 text-violet-300 border-l-4 border-violet-500 shadow-inner"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`${isActive ? "text-violet-400" : "text-slate-500"} text-base shrink-0`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer - Role Switcher */}
        <div className="p-4 border-t border-slate-800/60 bg-[#070714] space-y-3">
          {/* Current Role switcher preview */}
          <div className="text-[10px] text-slate-500 font-bold px-1 uppercase tracking-wider block">
            Switch Sandbox Account:
          </div>
          <select
            value={currentUser?.id || "user-admin"}
            onChange={(e) => {
              const selectedUser = users.find((u) => u.id === e.target.value);
              if (selectedUser) {
                setCurrentUser(selectedUser);
              }
            }}
            className="w-full bg-slate-900/80 border border-slate-800 text-violet-400 font-bold text-xs py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/10 text-slate-300 hover:text-rose-400 font-bold text-xs rounded-xl transition-all cursor-pointer mt-2"
          >
            <FaSignOutAlt className="text-xs shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
