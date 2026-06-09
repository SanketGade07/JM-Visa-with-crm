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

const DOC_LABELS: Record<keyof DocumentChecklist, string> = {
  passport: "Passport",
  visaForm: "Visa Form",
  businessDocs: "Business Documents",
  salarySlips: "Salary Slips",
  bankStatement: "Bank Statement",
  itr: "ITR",
  offerLetter: "Offer Letter",
  casOrI20: "CAS / I-20",
  travelHistory: "Travel History",
  sopOrCoverLetter: "SOP / Cover Letter",
  photos: "Photos",
  insurance: "Insurance",
  biometricsCompleted: "Biometrics Completed",
  visaFeesPaid: "Visa Fees Paid",
};

export function ChecklistTab() {
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
                  <h3 className="text-base font-bold text-white mb-1">Document Compliance Desk</h3>
                  <p className="text-xs text-slate-400">Complete verification audits. Ready status triggers when required items are checked.</p>
                </div>
                {selectedLead && (
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg ${getStatusColor(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                )}
              </div>

              {/* Selector and Checklist flow */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
                
                {/* Active lead selector */}
                <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col h-[400px] xl:h-[750px] xl:min-w-0 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white">Active Audits</h3>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-600 dark:text-slate-400">
                      {leads.filter(l => l.status !== "Dropped").length} files
                    </span>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-slate-500 text-xs" />
                    <input
                      type="text"
                      placeholder="Search client profile..."
                      value={checklistSearch}
                      onChange={(e) => setChecklistSearch(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-slate-900 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500/50 placeholder-slate-500"
                    />
                    {checklistSearch && (
                      <button
                        onClick={() => setChecklistSearch("")}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-350 cursor-pointer"
                      >
                        <FaTimes className="text-[10px]" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                    {leads
                      .filter(l => l.status !== "Dropped" && (
                        checklistSearch === "" ||
                        l.name.toLowerCase().includes(checklistSearch.toLowerCase()) ||
                        l.phone.includes(checklistSearch) ||
                        l.country.toLowerCase().includes(checklistSearch.toLowerCase()) ||
                        l.visaType.toLowerCase().includes(checklistSearch.toLowerCase())
                      ))
                      .map((lead) => {
                        const leadPct = Math.round(
                          (Object.values(lead.checklist).filter(Boolean).length /
                            Object.values(lead.checklist).length) *
                            100
                        );
                        const isSelected = selectedLeadId === lead.id;
                        const isFullyVerified = leadPct === 100;
                        return (
                          <button
                            key={lead.id}
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setIsMobileChecklistOpen(true);
                            }}
                            className={`audit-list-item w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "bg-violet-950/20 border-violet-500/50 text-slate-100 font-bold shadow-[0_2px_8px_-3px_rgba(99,102,241,0.15)]"
                                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-900 text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                            }`}
                          >
                            <div className="flex flex-col min-w-0 flex-1 space-y-0.5">
                              <span className={`text-[12px] block truncate font-bold ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>{lead.name}</span>
                              <span className="text-[9px] uppercase font-bold text-slate-500 block truncate">{lead.country} - {lead.visaType}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {/* 4-segment progress bar */}
                              <div className="flex gap-0.5 w-[36px] shrink-0">
                                {[1, 2, 3, 4].map((seg) => {
                                  const filledCount = leadPct === 0 ? 0 : Math.ceil(leadPct / 25);
                                  return (
                                    <div
                                      key={seg}
                                      className={`h-2.5 w-1.5 rounded-[1px] ${
                                        seg <= filledCount
                                          ? "bg-emerald-500"
                                          : "bg-slate-200 dark:bg-slate-800"
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums shrink-0 w-9 text-right">
                                {leadPct}%
                              </span>
                              <span className={`text-[10px] py-0.5 rounded font-bold border shrink-0 text-center w-[82px] ${
                                isFullyVerified
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                                  : isSelected
                                    ? "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-400"
                                    : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350"
                              }`}>
                                {isFullyVerified ? "Done" : `${Object.values(lead.checklist).filter(Boolean).length} Verified`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Mobile checklist drawer backdrop */}
                {/* Audit checklist pane */}
                {selectedLead && (
                  <div className={`
                    fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-slate-900 border-l border-slate-800 p-6 flex flex-col h-full space-y-6 overflow-y-auto shadow-2xl transition-transform duration-300
                    xl:static xl:z-auto xl:col-span-2 xl:max-w-none xl:w-full xl:min-w-0 xl:shadow-none xl:border-l-0 xl:rounded-2xl xl:bg-slate-900/60 xl:translate-x-0 xl:flex xl:h-[750px]
                    ${isMobileChecklistOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
                    ${!isMobileChecklistOpen ? "hidden xl:flex" : "flex"}
                  `}>
                    <div className="flex flex-col space-y-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">Compliance Checklist: {selectedLead.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Click to change state. Verified scans show verified icon.</p>
                        </div>
                        
                        <div className="flex items-center space-x-3 shrink-0">
                          <div className="p-1.5 px-2.5 bg-slate-950 border border-slate-900 rounded-lg text-[10px] font-semibold text-slate-400 select-all">
                            ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                              {leads.filter(l => l.status !== "Dropped").findIndex(l => l.id === selectedLead.id) !== -1
                                ? leads.filter(l => l.status !== "Dropped").findIndex(l => l.id === selectedLead.id) + 1
                                : selectedLead.id}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsMobileChecklistOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 xl:hidden flex items-center justify-center cursor-pointer hover:bg-slate-800"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {(() => {
                        const pct = Math.round(
                          (Object.values(selectedLead.checklist).filter(Boolean).length /
                            Object.values(selectedLead.checklist).length) *
                            100
                        );
                        return (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold">
                              <span className="text-slate-500 dark:text-slate-400">Total Verification Audit</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{pct}% Complete</span>
                            </div>
                            <div className="audit-progress-container w-full bg-slate-100 dark:bg-slate-950 rounded-[4px] h-2 overflow-hidden border border-slate-200/40 dark:border-slate-800/50">
                              <div
                                className="audit-progress-fill bg-emerald-500 h-full rounded-[2px] transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {uploadError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-[11px] font-semibold flex items-center space-x-2">
                        <FaInfoCircle className="text-xs shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    <div className="grid w-full grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto flex-1 min-w-0 pb-2">
                      {(Object.keys(selectedLead.checklist) as (keyof DocumentChecklist)[]).map((key) => {
                        const value = selectedLead.checklist[key];
                        const doc = getLeadDocuments(selectedLead.id).find((d) => d.docType === key);
                        const rowKey = `${selectedLead.id}-${key}`;
                        const isUploading = uploadingKey === rowKey;
                        const docLabel = DOC_LABELS[key];
                        return (
                          <div
                            key={key}
                            className={`flex flex-col gap-2.5 p-4 border rounded-xl transition-all shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:shadow-sm ${
                              value
                                ? "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-500/30 shadow-[0_2px_8px_-3px_rgba(16,185,129,0.08)]"
                                : "bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-900"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`text-xs font-bold leading-snug ${value ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}
                              >
                                {docLabel}
                              </span>
                              {value && (
                                <span className="inline-flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold shrink-0">
                                  <FaCheckCircle className="text-xs" />
                                  <span>Verified</span>
                                </span>
                              )}
                            </div>

                            {doc ? (
                              <button
                                onClick={() => openSignedUrl(doc.fileUrl)}
                                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50 transition-colors w-full min-w-0 cursor-pointer text-left"
                                title={doc.fileName}
                              >
                                <FaFileDownload className="text-[9px] shrink-0" />
                                <span className="truncate">{doc.fileName}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500">No file uploaded</span>
                            )}

                            {!value && (
                              <div className="flex items-center gap-2 pt-0.5">
                                <label
                                  className={`inline-flex items-center space-x-1 text-[10px] font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer transition-all active:scale-95 shadow-sm hover:shadow ${
                                    !canVerifyDocs || isUploading
                                      ? "opacity-40 cursor-not-allowed border-slate-800 text-slate-600"
                                      : "border-violet-200 dark:border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                                  }`}
                                >
                                  <FaFileUpload className="text-[9px]" />
                                  <span>{isUploading ? "..." : "File"}</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    disabled={!canVerifyDocs || isUploading}
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      setUploadError("");
                                      setUploadingKey(rowKey);
                                      const res = await uploadDocument(selectedLead.id, key, file);
                                      setUploadingKey(null);
                                      if (res.ok) {
                                        showToast("Document verified successfully!");
                                      } else {
                                        setUploadError(res.error || "Upload failed");
                                        showToast(res.error || "Upload failed", "error");
                                      }
                                      e.target.value = "";
                                    }}
                                  />
                                </label>

                                <button
                                  onClick={() => {
                                    if (!canVerifyDocs || isUploading) return;
                                    setPastedUrl("");
                                    setUrlModalData({
                                      leadId: selectedLead.id,
                                      docType: key,
                                      title: docLabel,
                                    });
                                  }}
                                  disabled={!canVerifyDocs || isUploading}
                                  className={`inline-flex items-center space-x-1 text-[10px] font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer transition-all active:scale-95 shadow-sm hover:shadow ${
                                    !canVerifyDocs || isUploading
                                      ? "opacity-40 cursor-not-allowed border-slate-800 text-slate-600"
                                      : "border-violet-200 dark:border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                                  }`}
                                >
                                  <FaGlobe className="text-[9px]" />
                                  <span>Link</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Auto status notice banner */}
                    <div className="p-3 bg-violet-50 dark:bg-violet-500/5 border border-violet-100 dark:border-violet-500/20 text-violet-700 dark:text-violet-400 rounded-xl text-[10px] font-semibold flex items-center space-x-2 shrink-0">
                      <FaInfoCircle className="text-xs shrink-0" />
                      <span>Staff uploads each document manually (received via WhatsApp/email). Files are stored in Supabase. Once all required docs are uploaded, status auto-updates to <strong>READY FOR SUBMISSION</strong>.</span>
                    </div>

                  </div>
                )}

              </div>

            </div>

            {isMobileChecklistOpen && selectedLead && (
              <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
                onClick={() => setIsMobileChecklistOpen(false)}
              />
            )}
    </>
  );
}
