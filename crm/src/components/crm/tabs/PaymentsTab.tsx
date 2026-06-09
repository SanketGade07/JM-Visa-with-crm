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


export function PaymentsTab() {
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
              
              {/* Date Filter & Metrics header */}
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-wrap gap-6 items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Billing & Finance Dashboard</h3>
                  <p className="text-xs text-slate-400">Track package billing, client deposit records, and outstanding payments.</p>
                </div>
                
                {/* Date filter widgets */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-500">From:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-1 px-3 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-500">To:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-1 px-3 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Finance Metrics list cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    label: "Gross Invoiced Revenue",
                    value: `₹${leads
                      .reduce((acc, lead) => acc + (lead.payments[0]?.totalPackage || 0), 0)
                      .toLocaleString()}`,
                    desc: "Total value of all packaged contracts"
                  },
                  {
                    label: "Deposited Payments",
                    value: `₹${leads
                      .reduce((acc, lead) => acc + lead.payments.reduce((a, p) => a + p.amountPaid, 0), 0)
                      .toLocaleString()}`,
                    desc: "Total cash realized in bank"
                  },
                  {
                    label: "Pending Receivables",
                    value: `₹${leads
                      .reduce((acc, lead) => {
                        const total = lead.payments[0]?.totalPackage || 0;
                        const paid = lead.payments.reduce((a, p) => a + p.amountPaid, 0);
                        const balance = total > 0 ? Math.max(0, total - paid) : 0;
                        return acc + balance;
                      }, 0)
                      .toLocaleString()}`,
                    desc: "Outstanding credit from client packages"
                  }
                ].map((card, i) => (
                  <div key={i} className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{card.label}</span>
                    <span className="text-xl font-extrabold text-white block">{card.value}</span>
                    <p className="text-[10px] text-slate-400 block pt-1">{card.desc}</p>
                  </div>
                ))}
              </div>

              {/* Active Ledger table */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                <div className="xl:col-span-2">
                  <DataTable
                    title="Clients Accounts Ledger"
                    rows={leads.filter((l) => l.status !== "Dropped")}
                    getRowId={(l) => l.id}
                    rightSlot={
                      <button
                        onClick={() => {
                          if (!canManagePayments) return;
                          setIsAddPaymentOpen(true);
                        }}
                        disabled={!canManagePayments}
                        className="py-2 px-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[11px] rounded-full transition-all disabled:opacity-40"
                      >
                        Record Client Deposit
                      </button>
                    }
                    columns={[
                      {
                        header: "Client Name",
                        render: (lead) => (
                          <span className="font-semibold text-gray-900 dark:text-slate-100 text-[13px]">{lead.name}</span>
                        ),
                      },
                      { header: "Destination", render: (lead) => <span className="text-gray-600 dark:text-slate-300">{lead.country}</span> },
                      {
                        header: "Invoiced Package",
                        render: (lead) => {
                          const total = lead.payments[0]?.totalPackage || 0;
                          return <span className="font-semibold text-gray-700 dark:text-slate-200">{total > 0 ? `₹${total.toLocaleString()}` : "Not Decided"}</span>;
                        },
                      },
                      {
                        header: "Realized Paid",
                        render: (lead) => {
                          const paid = lead.payments.reduce((acc, pay) => acc + pay.amountPaid, 0);
                          return <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{paid.toLocaleString()}</span>;
                        },
                      },
                      {
                        header: "Remaining Balance",
                        render: (lead) => {
                          const total = lead.payments[0]?.totalPackage || 0;
                          const paid = lead.payments.reduce((acc, pay) => acc + pay.amountPaid, 0);
                          const balance = total > 0 ? Math.max(0, total - paid) : 0;
                          return <span className={`font-semibold ${balance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>₹{balance.toLocaleString()}</span>;
                        },
                      },
                    ]}
                    actions={(lead) => [
                      { icon: FaFileInvoiceDollar, title: "View invoices", onClick: (l) => setInvoiceLeadId(l.id) },
                      { icon: FaEnvelope, title: "Email", onClick: (l) => window.open(`mailto:${l.email}`) },
                    ]}
                    actionsHeader="Receipts"
                    emptyText="No active client accounts."
                  />
                </div>

                {/* Country Breakdown finance card */}
                <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Destination Desk Revenue</h3>
                  
                  <div className="space-y-4">
                    {["USA", "UK", "Canada", "Europe"].map((cKey) => {
                      const cLeads = leads.filter(l => l.country === cKey);
                      const cRev = cLeads.reduce((acc, l) => acc + l.payments.reduce((a, p) => a + p.amountPaid, 0), 0);
                      return (
                        <div key={cKey} className="space-y-1 text-xs">
                          <div className="flex items-center justify-between text-slate-400 font-semibold">
                            <span>{cKey} Desk</span>
                            <span className="text-slate-100 font-bold">₹{cRev.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, (cRev / 100000) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
    </>
  );
}
