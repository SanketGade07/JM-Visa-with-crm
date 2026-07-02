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

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard`);
    } catch {
      showToast(`Failed to copy ${label.toLowerCase()}`, "error");
    }
  }, [showToast]);

  const handleResetPassword = useCallback(async (staff: CrmUser) => {
    const enteredPassword = prompt(`Enter a new password for ${staff.name}:`, staff.password || "");
    if (enteredPassword === null) return;
    const nextPassword = enteredPassword.trim();
    if (!nextPassword) {
      showToast("Password cannot be empty", "error");
      return;
    }

    const res = await resetUserPassword(staff.id, nextPassword);
    if (res.ok && res.password) {
      showToast(`Password reset for ${staff.name}`);
    } else {
      showToast(res.error || "Failed to reset password", "error");
    }
  }, [resetUserPassword, showToast]);

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
                <table className="w-full text-left border-collapse">
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
                              <button
                                type="button"
                                onClick={() => copyToClipboard(staff.password || "", "Password")}
                                disabled={!staff.password}
                                className="p-1 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-md transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                title="Copy password"
                              >
                                <FaClipboard className="text-[10px]" />
                              </button>
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

                            {currentRole === "ADMIN" && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${staff.name}'s account?`)) {
                                    deleteUser(staff.id).then((res) => {
                                      if (res.ok) showToast("Account deleted successfully");
                                      else showToast(res.error || "Failed to delete account", "error");
                                    });
                                  }
                                }}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                                title="Delete Account"
                              >
                                <FaTrash className="text-xs" />
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
    </>
  );
}
