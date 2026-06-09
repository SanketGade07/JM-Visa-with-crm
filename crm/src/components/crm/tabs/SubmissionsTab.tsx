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


export function SubmissionsTab() {
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
                  <h3 className="text-base font-bold text-white mb-1">Embassy Submission Desk</h3>
                  <p className="text-xs text-slate-400">File tracking for ready applications and dispatched submissions.</p>
                </div>
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-sm rounded-xl">
                  {leads.filter(l => l.status === "Ready For Submission").length} Ready for Submission
                </div>
              </div>

              {/* Submission visual board split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Ready Column */}
                <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Applications Ready ({leads.filter(l => l.status === "Ready For Submission").length})</span>
                  </h3>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {leads
                      .filter((l) => l.status === "Ready For Submission")
                      .map((lead) => (
                        <div key={lead.id} className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-100">{lead.name}</span>
                            <span className="text-[10px] bg-slate-900 border border-slate-800 py-0.5 px-2 rounded-lg text-slate-400 font-bold">
                              {lead.country}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">{lead.visaType} - Managed by {lead.counselor}</p>
                          <button
                            onClick={() => updateLeadStatus(lead.id, "Visa Submitted")}
                            disabled={!canSubmitVisa}
                            className="w-full py-1.5 px-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[10px] rounded-lg transition-all"
                          >
                            Mark as Dispatched/Submitted
                          </button>
                        </div>
                      ))}
                    {leads.filter((l) => l.status === "Ready For Submission").length === 0 && (
                      <p className="text-center py-6 text-slate-500 font-bold text-xs">No files ready for submission. Complete document verification audits first.</p>
                    )}
                  </div>
                </div>

                {/* Submitted Column */}
                <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                    <span>Dispatched to Embassy ({leads.filter(l => l.status === "Visa Submitted").length})</span>
                  </h3>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {leads
                      .filter((l) => l.status === "Visa Submitted")
                      .map((lead) => (
                        <div key={lead.id} className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-100">{lead.name}</span>
                            <span className="text-[10px] bg-slate-900 border border-slate-800 py-0.5 px-2 rounded-lg text-slate-400 font-bold">
                              {lead.country}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">{lead.visaType} - Handled by {lead.counselor}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => updateLeadStatus(lead.id, "Approved / Rejected")}
                              disabled={!canSubmitVisa}
                              className="py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-semibold text-[9px] rounded-lg transition-all"
                            >
                              Consulate Approved
                            </button>
                            <button
                              onClick={() => updateLeadStatus(lead.id, "Closed")}
                              disabled={!canSubmitVisa}
                              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[9px] rounded-lg transition-all"
                            >
                              Close Case
                            </button>
                          </div>
                        </div>
                      ))}
                    {leads.filter((l) => l.status === "Visa Submitted").length === 0 && (
                      <p className="text-center py-6 text-slate-500 font-bold text-xs">No active submissions currently at the embassy.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
    </>
  );
}
