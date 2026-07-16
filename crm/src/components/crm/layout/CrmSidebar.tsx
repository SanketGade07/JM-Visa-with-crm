"use client";

import React from "react";
import {
  FaChartBar, FaUserFriends, FaHistory, FaGlobe, FaPassport, FaCheckSquare,
  FaPaperPlane, FaFileInvoiceDollar, FaTrash, FaUserLock, FaFolder, FaSearch, FaPlus,
  FaSun, FaMoon, FaSignOutAlt, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { DriveStorageCard } from "../drive/DriveStorageCard";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";


export function CrmSidebar() {
  const {
    leads, meetings, users, currentUser, authUser, currentRole, currentTab, setCurrentTab,
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
    selectedLeadId, setSelectedLeadId, navigateToTab, isLeadDetailRoute, isLeadChecklistRoute, isLeadsListRoute,
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
    tempInvoiceFile, setTempInvoiceFile,
    tempInvoiceUrl, setTempInvoiceUrl, isUploadingTempInvoice, setIsUploadingTempInvoice,
    allowedTabs, userAllowedTabs, canModifyLeads, canVerifyDocs, canSubmitVisa, canManagePayments,
    assignmentNotifications,
    openSignedUrl, selectedLead, activeLeads, monthlyChart, chartMax, countryColors,
    countryStats, countryTotal, donutSegments, calendarData, filteredLeads,
    countryBarChartData, maxLeadsCount, yLabels, getCountryAbbreviation,
    handlePeriodChange, handleCalendarDateClick, getDaysInMonth, monthNames,
    leadsMgmtData, topCountryStats, pipelineStats, cardMap, modalMap,
    isSidebarCollapsed, setIsSidebarCollapsed,
  } = useCrmLayoutContext();

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-50 ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64 h-screen border-r border-slate-800/80 bg-[#0a0a1a] flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 relative
        lg:sticky lg:top-0 lg:translate-x-0 lg:z-30
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Collapse Toggle Button (desktop only) */}
        <button
          onClick={() => {
            setIsSidebarCollapsed(!isSidebarCollapsed);
            localStorage.setItem("crm_sidebar_collapsed", String(!isSidebarCollapsed));
          }}
          className="hidden lg:flex absolute top-5 -right-3 z-50 items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-[#0a0a1a] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-[#131326] hover:!border-violet-600 dark:hover:!border-violet-400 transition-all cursor-pointer hover:scale-105 group"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <FaChevronRight className="text-[10px] transition-colors duration-200 group-hover:text-violet-600 dark:group-hover:text-violet-400" />
          ) : (
            <FaChevronLeft className="text-[10px] transition-colors duration-200 group-hover:text-violet-600 dark:group-hover:text-violet-400" />
          )}
        </button>

        <div className="overflow-hidden">
          {/* Brand */}
          <div className={`h-16 border-b border-slate-800/60 flex items-center ${isSidebarCollapsed ? "justify-center" : "px-6 space-x-3"} overflow-hidden transition-all duration-300`}>
            <img src="/logo.webp" alt="JM Visa Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-violet-500/10 shrink-0" />
            {!isSidebarCollapsed && (
              <div className="transition-opacity duration-300 whitespace-nowrap">
                <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 leading-tight">
                  JM VISA
                </h1>
                <span className="text-[10px] uppercase font-bold text-violet-400/90 tracking-widest block">
                  IMMIGRATION CRM
                </span>
              </div>
            )}
          </div>


          {/* Navigation Menu */}
          <nav className="p-4 space-y-1 overflow-y-auto">
            {!isSidebarCollapsed && (
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider px-3 block mb-2">
                Main Operations
              </span>
            )}
            
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
                (tab.id === "Leads" && (isLeadDetailRoute || isLeadChecklistRoute || isLeadsListRoute));
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    navigateToTab(tab.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`relative w-full flex items-center ${isSidebarCollapsed ? "justify-center px-0 py-3" : "space-x-3 px-3 py-2.5"} rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600/25 to-indigo-600/5 text-violet-300 border-l-4 border-violet-500 shadow-inner"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  }`}
                  title={isSidebarCollapsed ? tab.label : undefined}
                >
                  <Icon className={`${isActive ? "text-violet-400" : "text-slate-500"} text-base shrink-0`} />
                  {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
                  
                  {!isSidebarCollapsed && tab.id === "Leads" && (currentUser?.role === "COUNSELOR" || currentUser?.role === "ADMIN") && assignmentNotifications.length > 0 && (
                    <span className="crm-sidebar-assigned-count ml-auto min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-violet-600/20 text-violet-300 text-[10px] font-bold border border-violet-500/30 animate-pulse">
                      {assignmentNotifications.length > 9 ? "9+" : assignmentNotifications.length}
                    </span>
                  )}
                  {isSidebarCollapsed && tab.id === "Leads" && (currentUser?.role === "COUNSELOR" || currentUser?.role === "ADMIN") && assignmentNotifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[0.5rem] h-2 w-2 rounded-full bg-violet-500 border border-slate-950 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {!isSidebarCollapsed && currentTab === "Drive" && userAllowedTabs.includes("Drive") && (
          <DriveStorageCard />
        )}

        {/* Sidebar Footer - Role Switcher */}
        <div className={`p-4 border-t border-slate-800/60 bg-[#070714] ${isSidebarCollapsed ? "flex flex-col items-center justify-center" : "space-y-3"}`}>
          {/* Sandbox account switcher — admin-only dev affordance */}
          {authUser?.role === "ADMIN" && !isSidebarCollapsed && (
            <>
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
            </>
          )}

          {isSidebarCollapsed ? (
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/10 text-slate-300 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
              title="Sign Out"
            >
              <FaSignOutAlt className="text-base shrink-0" />
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/10 text-slate-300 hover:text-rose-400 font-bold text-xs rounded-xl transition-all cursor-pointer mt-2"
            >
              <FaSignOutAlt className="text-xs shrink-0" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
