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


export function USASlotsTab() {
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
              
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">USA Embassy Slot Coordinator</h3>
                  <p className="text-xs text-slate-400">Track DS-160 application forms, consulate fees, and booked interviews.</p>
                </div>
                <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 font-extrabold text-sm rounded-xl">
                  {leads.filter(l => l.country === "USA" && l.usaSlots?.interviewScheduled).length} Confirmed Slots
                </div>
              </div>

              {/* USA Files list */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                <div className="xl:col-span-2">
                  <DataTable
                    title="USA Client Profiles"
                    pagination={true}
                    defaultPageSize={8}
                    rows={leads.filter((l) => l.country === "USA" && l.status !== "Dropped")}
                    getRowId={(l) => l.id}
                    onRowClick={(l) => {
                      setSelectedLeadId(l.id);
                      setIsMobileSlotSettingsOpen(true);
                    }}
                    selectedRowId={selectedLeadId}
                    columns={[
                      {
                        header: "Name",
                        render: (lead) => (
                          <span className="font-semibold text-gray-900 dark:text-slate-100 text-[13px]">{lead.name}</span>
                        ),
                      },
                      {
                        header: "DS-160 Form",
                        render: (lead) => (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${lead.usaSlots?.ds160Submitted ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"}`}>
                            {lead.usaSlots?.ds160Submitted ? "Submitted" : "Pending"}
                          </span>
                        ),
                      },
                      {
                        header: "Embassy Fee Paid",
                        render: (lead) => (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${lead.usaSlots?.slotsPaid ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"}`}>
                            {lead.usaSlots?.slotsPaid ? "Fee Paid" : "Fee Unpaid"}
                          </span>
                        ),
                      },
                      {
                        header: "Slot Status",
                        render: (lead) => (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${lead.usaSlots?.slotsBooked ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"}`}>
                            {lead.usaSlots?.slotsBooked ? "Booked" : "No Booking"}
                          </span>
                        ),
                      },
                      {
                        header: "Interview Date",
                        render: (lead) => <span className="text-gray-600 dark:text-slate-300 font-medium">{lead.usaSlots?.interviewScheduled ? lead.usaSlots.interviewDate : "N/A"}</span>,
                      },
                    ]}
                    actions={(lead) => [
                      { 
                        icon: FiSettings, 
                        title: "Edit slot panel", 
                        onClick: (l) => {
                          setSelectedLeadId(l.id);
                          setIsMobileSlotSettingsOpen(true);
                        } 
                      },
                      { icon: FiPhone, title: "Call", onClick: (l) => window.open(`tel:${l.phone}`) },
                      { icon: FiMail, title: "Email", onClick: (l) => window.open(`mailto:${l.email}`) },
                    ]}
                    emptyText="No USA leads yet."
                  />
                </div>

                {/* Mobile USA slot drawer backdrop */}
                {isMobileSlotSettingsOpen && selectedLead && selectedLead.country === "USA" && (
                  <div 
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
                    onClick={() => setIsMobileSlotSettingsOpen(false)}
                  />
                )}

                {/* Edit USA Slot side panel */}
                {selectedLead && selectedLead.country === "USA" && (
                  <div className={`
                    fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col h-full space-y-6 overflow-y-auto shadow-2xl transition-transform duration-300
                    xl:static xl:z-auto xl:w-auto xl:max-w-none xl:shadow-none xl:border-l-0 xl:rounded-2xl xl:bg-slate-900/60 xl:translate-x-0 xl:flex
                    ${isMobileSlotSettingsOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
                    ${!isMobileSlotSettingsOpen ? "hidden xl:flex" : "flex"}
                  `}>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-white">
                        Slot Settings: {selectedLead.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsMobileSlotSettingsOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 xl:hidden flex items-center justify-center cursor-pointer hover:bg-slate-800"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      
                      {(
                        [
                          { key: "credentialsProvided", label: "Credentials Provided by Client" },
                          { key: "ds160Submitted", label: "DS-160 Form Dispatched" },
                          { key: "slotsPaid", label: "Embassy Visa Fee Paid" },
                          { key: "slotsBooked", label: "Visa Slot Booked" },
                        ] as const
                      ).map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-900 rounded-xl">
                          <span className="font-semibold text-slate-300">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={!!selectedLead.usaSlots?.[item.key]}
                            onChange={() => {
                              updateUsaSlots(selectedLead.id, {
                                [item.key]: !selectedLead.usaSlots?.[item.key]
                              });
                            }}
                            className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                          />
                        </div>
                      ))}

                      {/* Date selection for Interview */}
                      <div className="space-y-1.5 pt-2">
                        <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Consulate Interview Details</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={selectedLead.usaSlots?.interviewDate || ""}
                            onChange={(e) => {
                              updateUsaSlots(selectedLead.id, {
                                interviewDate: e.target.value,
                                interviewScheduled: !!e.target.value,
                                slotsBooked: !!e.target.value
                              });
                            }}
                            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none"
                          />
                          <select
                            value={selectedLead.usaSlots?.slotLocation || "Delhi"}
                            onChange={(e) => {
                              updateUsaSlots(selectedLead.id, { slotLocation: e.target.value });
                            }}
                            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none"
                          >
                            <option value="Delhi">Delhi</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Chennai">Chennai</option>
                            <option value="Kolkata">Kolkata</option>
                            <option value="Hyderabad">Hyderabad</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>

            </div>
    </>
  );
}
