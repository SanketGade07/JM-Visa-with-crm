"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaChartBar, FaUserFriends, FaHistory, FaGlobe, FaPassport, FaCheckSquare,
  FaPaperPlane, FaFileInvoiceDollar, FaTrash, FaUserLock, FaFolder, FaSearch, FaPlus,
  FaSun, FaMoon, FaSignOutAlt
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { DriveStorageCard } from "../drive/DriveStorageCard";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";


export function CrmSidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

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
  } = useCrmLayoutContext();

  const isExpanded = isHovered || isMobileSidebarOpen;

  return (
    <>
      {/* Spacer to prevent layout shift on desktop when sidebar expands */}
      <div className="hidden lg:block lg:w-[76px] shrink-0" />

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed inset-y-0 left-0 z-50 h-screen border-r border-slate-800/80 bg-[#0a0a1a] flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0
          lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:translate-x-0
          ${isExpanded ? "lg:w-64" : "lg:w-[76px]"}
          ${isMobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full"}
        `}
      >
        <div>
          {/* Brand */}
          <div className="h-16 border-b border-slate-800/60 flex items-center justify-start px-4 overflow-hidden">
            <div className="flex items-center space-x-3 shrink-0">
              <div className="w-[42px] flex items-center justify-center shrink-0">
                <img src="/logo.webp" alt="JM Visa Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-violet-500/10" />
              </div>
              <div className={`transition-all duration-300 ease-in-out ${isExpanded ? "opacity-100 translate-x-0 w-auto" : "lg:opacity-0 lg:-translate-x-4 lg:w-0 lg:overflow-hidden"}`}>
                <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 leading-tight whitespace-nowrap">
                  JM VISA
                </h1>
                <span className="text-[10px] uppercase font-bold text-violet-400/90 tracking-widest block whitespace-nowrap">
                  IMMIGRATION CRM
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1 overflow-y-auto">
            <span className={`text-[9px] uppercase font-bold text-slate-500 tracking-wider px-3 block mb-2 transition-opacity duration-200 ${isExpanded ? "opacity-100" : "lg:opacity-0 lg:h-0 lg:mb-0 lg:overflow-hidden"}`}>
              Main Operations
            </span>
            
            {[
              { id: "Dashboard", label: "Dashboard", icon: FaChartBar },
              { id: "Leads", label: "Lead Management", icon: FaUserFriends },
              { id: "USASlots", label: "USA Slot Tracking", icon: FaPassport },
              { id: "Submissions", label: "Visa Submission", icon: FaPaperPlane },
              { id: "Payments", label: "Payments & Finance", icon: FaFileInvoiceDollar },
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
                  title={!isExpanded ? tab.label : undefined}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-l-4 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600/25 to-indigo-600/5 text-violet-300 border-violet-500 shadow-inner"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border-transparent"
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <Icon className={`${isActive ? "text-violet-400" : "text-slate-500"} text-base`} />
                  </div>
                  <span className={`ml-3 truncate transition-all duration-300 ease-in-out ${isExpanded ? "opacity-100 translate-x-0 w-auto" : "lg:opacity-0 lg:-translate-x-4 lg:w-0 lg:overflow-hidden"}`}>
                    {tab.label}
                  </span>
                  {tab.id === "Leads" && (currentUser?.role === "COUNSELOR" || currentUser?.role === "ADMIN") && assignmentNotifications.length > 0 && (
                    <span className={`crm-sidebar-assigned-count ml-auto min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-violet-600/20 text-violet-300 text-[10px] font-bold border border-violet-500/30 transition-all duration-300 ${isExpanded ? "opacity-100 scale-100" : "lg:opacity-0 lg:scale-0 lg:w-0 lg:h-0 lg:overflow-hidden"}`}>
                      {assignmentNotifications.length > 9 ? "9+" : assignmentNotifications.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {currentTab === "Drive" && userAllowedTabs.includes("Drive") && (
          <div className={`transition-all duration-300 ease-in-out ${isExpanded ? "opacity-100 scale-100 h-auto" : "lg:opacity-0 lg:scale-95 lg:h-0 lg:overflow-hidden lg:m-0"}`}>
            <DriveStorageCard />
          </div>
        )}

        {/* Sidebar Footer - Role Switcher & Sign Out */}
        <div className="p-4 border-t border-slate-800/60 bg-[#070714] space-y-3 transition-all duration-300">
          {authUser?.role === "ADMIN" && (
            <div className={`space-y-1.5 transition-all duration-300 ease-in-out ${isExpanded ? "opacity-100 h-auto mb-3" : "lg:opacity-0 lg:h-0 lg:overflow-hidden lg:mb-0"}`}>
              <div className="text-[10px] text-slate-500 font-bold px-1 uppercase tracking-wider block whitespace-nowrap">
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
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/10 text-slate-300 hover:text-rose-400 font-bold text-xs rounded-xl transition-all cursor-pointer ${
              isExpanded ? "space-x-2 py-2 px-4" : "lg:py-2.5 lg:px-0"
            }`}
            title={!isExpanded ? "Sign Out" : undefined}
          >
            <FaSignOutAlt className="text-xs shrink-0" />
            <span className={`transition-all duration-300 ease-in-out ${isExpanded ? "opacity-100 translate-x-0 w-auto" : "lg:opacity-0 lg:-translate-x-4 lg:w-0 lg:overflow-hidden"}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
