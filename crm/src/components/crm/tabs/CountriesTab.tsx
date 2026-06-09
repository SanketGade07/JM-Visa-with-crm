"use client";

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


export function CountriesTab() {
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
            <div className="space-y-6">
              
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-2">Visa Country Departments</h3>
                <p className="text-xs text-slate-400">Leads categorized and filtered by selected country desk.</p>
              </div>

              {/* Country Cards GRID */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { name: "UK", desc: "Student, Tourist, Work, Dependent", color: "from-indigo-600 to-blue-500", key: "UK" },
                  { name: "USA", desc: "Slots availability & Credentials", color: "from-violet-600 to-purple-500", key: "USA" },
                  { name: "Canada", desc: "SDS/Non-SDS & Biometrics Status", color: "from-emerald-600 to-teal-500", key: "Canada" },
                  { name: "Europe", desc: "Schengen - France, Spain, Germany, Italy", color: "from-amber-600 to-orange-500", key: "Europe" }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setCountryFilter(item.key)}
                    className={`country-desk-card p-6 border rounded-2xl flex flex-col justify-between text-left transition-all ${
                      countryFilter === item.key 
                        ? "bg-slate-900/80 border-violet-500 shadow-md shadow-violet-500/10 scale-[1.02]" 
                        : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-lg font-bold text-white block">{item.name} Desk</span>
                      <p className="text-[10px] text-slate-400 tracking-normal block">{item.desc}</p>
                    </div>
                    <span className="text-[10px] mt-6 bg-slate-950 py-1 px-3 border border-slate-900 rounded-lg text-slate-400 font-bold block self-start">
                      {leads.filter(l => l.country === item.key && l.status !== "Dropped").length} Active Files
                    </span>
                  </button>
                ))}
              </div>

              {/* Department Specific Table */}
              <DataTable
                title={countryFilter === "All" ? "Select a country above to filter files" : `${countryFilter} Desk - File Registrations`}
                rows={leads.filter(l => l.status !== "Dropped" && (countryFilter === "All" || l.country === countryFilter))}
                getRowId={(l) => l.id}
                onExport={() =>
                  exportRowsToCsv(
                    `${countryFilter.toLowerCase()}-files`,
                    ["#", "Client Name", "Sub Visa Type", "Status", "Counselor"],
                    leads
                      .filter(l => l.status !== "Dropped" && (countryFilter === "All" || l.country === countryFilter))
                      .map((l, i) => [i + 1, l.name, l.visaType, l.status, l.counselor])
                  )
                }
                columns={[
                  {
                    header: "Client Name",
                    render: (lead) => (
                      <span className="font-semibold text-gray-900 dark:text-slate-100 text-[13px]">{lead.name}</span>
                    ),
                  },
                  { header: "Sub Visa Type", render: (lead) => <span className="text-gray-600 dark:text-slate-300">{lead.visaType}</span> },
                  { header: "Workflow Status", render: (lead) => <StatusPill status={lead.status} /> },
                  ...(countryFilter === "Canada"
                    ? [{
                        header: "Biometrics Scan",
                        render: (lead: typeof leads[number]) =>
                          lead.checklist.biometricsCompleted
                            ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Completed</span>
                            : <span className="text-amber-600 dark:text-amber-400 font-semibold">Pending Call</span>,
                      }]
                    : []),
                  ...(countryFilter === "USA"
                    ? [{
                        header: "Interview Booking",
                        render: (lead: typeof leads[number]) =>
                          lead.usaSlots?.interviewScheduled
                            ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{lead.usaSlots?.interviewDate}</span>
                            : <span className="text-amber-600 dark:text-amber-400 font-semibold">Not Booked</span>,
                      }]
                    : []),
                  { header: "Counselor", render: (lead) => <span className="text-gray-600 dark:text-slate-300 font-medium">{lead.counselor}</span> },
                ]}
                actions={(lead) => [
                  lead.country === "USA"
                    ? { icon: FiGlobe, title: "Manage slots", onClick: () => setCurrentTab("USASlots") }
                    : { icon: FiEye, title: "View file", onClick: (l) => { setCurrentTab("Leads"); setSelectedLeadId(l.id); } },
                  { icon: FiPhone, title: "Call", onClick: (l) => window.open(`tel:${l.phone}`) },
                  { icon: FaWhatsapp, title: "Message", onClick: (l) => window.open(`https://wa.me/${l.phone.replace(/[^0-9]/g, "")}`, "_blank") },
                  { icon: FiMail, title: "Email", onClick: (l) => window.open(`mailto:${l.email}`) },
                ]}
                emptyText={countryFilter === "All" ? "Select a country desk above." : "No files in this desk yet."}
              />

            </div>
    </>
  );
}
