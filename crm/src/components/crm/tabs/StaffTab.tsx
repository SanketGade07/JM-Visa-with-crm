"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { VisaStatus, StaffRole, CountryType, LeadSource, DocumentChecklist, CrmUser, Meeting } from "@/context/CrmContext";
import { ROLE_TABS, AVAILABLE_TABS, normalizeAllowedTabs } from "@/utils/crmConstants";
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
import { FiPhone, FiMail, FiUsers, FiClock, FiCalendar, FiEye, FiSettings, FiGlobe, FiMenu, FiUser, FiLock, FiEdit, FiEdit3 } from "react-icons/fi";
import DataTable, { exportRowsToCsv, StatusPill, getPillClasses, ProgressBar } from "@/components/ui/DataTable";
import { SearchableCountrySelect, PhoneInput } from "@/components/ui/FormInputs";
// @ts-ignore
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { getLeadAvatar, getLeadDescription, getLeadCompany } from "../helpers/leadDisplayHelpers";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";


export function StaffTab() {
  const {
    leads, meetings, users, currentUser, currentRole, currentTab, setCurrentTab,
    setCurrentRole, setCurrentUser, addUser, deleteUser, resetUserPassword, addLead, updateLeadStatus,
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
    selectedLeadId, setSelectedLeadId,
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
    openSignedUrl, selectedLead, activeLeads, monthlyChart, chartMax, countryColors,
    countryStats, countryTotal, donutSegments, calendarData, filteredLeads,
    countryBarChartData, maxLeadsCount, yLabels, getCountryAbbreviation,
    handlePeriodChange, handleCalendarDateClick, getDaysInMonth, monthNames,
    leadsMgmtData, topCountryStats, pipelineStats, cardMap, modalMap,
  } = useCrmLayoutContext();

  const [resettingStaff, setResettingStaff] = useState<CrmUser | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard`);
    } catch {
      showToast(`Failed to copy ${label.toLowerCase()}`, "error");
    }
  }, [showToast]);

  const handleResetPassword = useCallback((staff: CrmUser) => {
    setResettingStaff(staff);
    setNewPasswordValue("");
  }, []);

  return (
    <>
            <div className="space-y-6">
              
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Company Staff Directory & Access Manager</h3>
                  <p className="text-xs text-slate-400">Manage case counselors, roles, and customize tab-level access permissions.</p>
                </div>
                {currentRole === "ADMIN" && (
                  <button
                    onClick={() => setIsAddStaffOpen(true)}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all"
                  >
                    <FaPlus className="text-xs" />
                    <span>Create Staff Account</span>
                  </button>
                )}
              </div>

              {/* Roster list view */}
              <div className="overflow-x-auto border border-slate-800/80 rounded-2xl bg-slate-900/60">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-950/40">
                      <th className="py-4 px-6">Staff Member</th>
                      <th className="py-4 px-6">Email Desk / User ID</th>
                      <th className="py-4 px-6">Password</th>
                      <th className="py-4 px-6 text-center">Tab Access</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {users.map((staff, i) => (
                      <tr key={staff.id || i} className="hover:bg-slate-800/10 transition-colors">
                        {/* Staff Member column */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white uppercase text-xs">
                              {staff.name ? staff.name.split(" ").map(n => n[0]).join("") : "U"}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100">{staff.name}</div>
                              <span className="text-[9px] text-violet-400 font-extrabold uppercase tracking-wider block mt-0.5">{staff.role}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email Desk / User ID column */}
                        <td className="py-4 px-6 font-medium text-slate-300">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="select-all truncate">{staff.email}</span>
                            {currentRole === "ADMIN" && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(staff.email, "User ID")}
                                className="p-1 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-md transition-colors shrink-0 cursor-pointer"
                                title="Copy User ID"
                              >
                                <FaClipboard className="text-[10px]" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Password column */}
                        <td className="py-4 px-6 font-medium text-slate-300">
                          {currentRole === "ADMIN" ? (
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="select-all truncate font-mono">{staff.password || "—"}</span>
                              {staff.password && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(staff.password || "", "Password")}
                                  className="p-1 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-md transition-colors shrink-0 cursor-pointer"
                                  title="Copy password"
                                >
                                  <FaClipboard className="text-[10px]" />
                                </button>
                              )}
                              {staff.id !== "user-admin" && (
                                <button
                                  type="button"
                                  onClick={() => handleResetPassword(staff)}
                                  className="p-1 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors shrink-0 cursor-pointer"
                                  title="Reset password"
                                >
                                  <FaKey className="text-[10px]" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Hidden</span>
                          )}
                        </td>

                        {/* Tab Access column */}
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center rounded-full bg-violet-400/10 px-2.5 py-0.5 text-[10px] font-extrabold text-violet-400 border border-violet-400/20">
                            {normalizeAllowedTabs(staff.allowedTabs).length} / {AVAILABLE_TABS.length} Tabs
                          </span>
                        </td>

                        {/* Actions column */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {currentRole === "ADMIN" && (
                              <button
                                onClick={() => {
                                  setEditingStaff(staff);
                                  const standardRoles = ["ADMIN", "COUNSELOR", "DOCUMENT TEAM", "VISA TEAM", "ACCOUNT TEAM"];
                                  if (standardRoles.includes(staff.role)) {
                                    setEditStaffRole(staff.role);
                                    setEditStaffCustomRole("");
                                  } else {
                                    setEditStaffRole("OTHER");
                                    setEditStaffCustomRole(staff.role);
                                  }
                                  setIsEditStaffOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg cursor-pointer transition-colors"
                                title="Edit Details & Access"
                              >
                                <FiEdit3 className="text-[13px]" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

      {resettingStaff && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3">Reset Password for {resettingStaff.name}</h3>
            <div className="space-y-1.5 text-left text-xs">
              <label className="text-slate-400 font-bold block">New Password</label>
              <input
                type="text"
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                placeholder="Leave blank to auto-generate"
                className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
              />
              <p className="text-[10px] text-slate-500 mt-1">Leave empty to automatically generate a secure 8-character random password.</p>
            </div>
            <div className="flex justify-end space-x-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setResettingStaff(null)}
                className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await resetUserPassword(resettingStaff.id, newPasswordValue.trim());
                  if (res.ok && res.password) {
                    setGeneratedPassword(res.password);
                    setResettingStaff(null);
                    setShowResetSuccessModal(true);
                  } else {
                    showToast(res.error || "Failed to reset password", "error");
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetSuccessModal && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <FaKey />
            </div>
            <h3 className="text-sm font-bold text-white">Password Reset Successful</h3>
            <p className="text-xs text-slate-400">The password has been updated. Please copy it and share it with the user:</p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between font-mono text-sm text-slate-800 dark:text-slate-200">
              <span>{generatedPassword}</span>
              <button
                onClick={() => {
                  void copyToClipboard(generatedPassword, "Password");
                }}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors cursor-pointer"
                title="Copy Password"
              >
                <FaClipboard />
              </button>
            </div>
            <div className="pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowResetSuccessModal(false);
                  setGeneratedPassword("");
                }}
                className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white rounded-xl transition-colors font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
