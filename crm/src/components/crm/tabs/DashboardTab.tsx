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


export function DashboardTab() {
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
              
              {/* TOP METRICS ROW (4 Cards) */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 ${getAnimClass("delay-100")}`}>
                {[
                  {
                    label: "Leads",
                    value: leads.filter(l => l.status !== "Dropped").length,
                    badge: "↑ 2%",
                    badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                    subtext: "vs last week",
                    icon: FaUserFriends
                  },
                  // {
                  //   label: "Consultations",
                  //   value: meetings.length,
                  //   badge: "Active",
                  //   badgeColor: "bg-cyan-500/10 border-cyan-500/20 text-[#00C1D4]",
                  //   subtext: "reminders set",
                  //   icon: FaCalendarAlt
                  // },
                  {
                    label: "Active Leads",
                    value: leads.filter(l => !["Dropped", "Closed", "Approved / Rejected"].includes(l.status)).length,
                    badge: "Active",
                    badgeColor: "bg-cyan-500/10 border-cyan-500/20 text-[#00C1D4]",
                    subtext: "in progress",
                    icon: FaUserFriends
                  },
                  {
                    label: "Conversion Rate",
                    value: `${leads.length > 0 ? Math.round((leads.filter(l => l.status === "Approved / Rejected").length / leads.length) * 100) : 0}%`,
                    badge: "↑ 1.5%",
                    badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                    subtext: "approved visas",
                    icon: FaCheckSquare
                  },
                  {
                    label: "Revenue",
                    value: (() => {
                      const rev = leads.reduce((acc, lead) => acc + lead.payments.reduce((a, p) => a + p.amountPaid, 0), 0);
                      return rev >= 100000 ? `₹${(rev / 100000).toFixed(1)}L` : `₹${(rev / 1000).toFixed(1)}K`;
                    })(),
                    badge: "↑ 12%",
                    badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                    subtext: "vs last month",
                    icon: FaCoins
                  }
                ].map((card, index) => {
                  const Icon = card.icon;
                  const isRed = card.badge.includes("↓") || card.badge.includes("Dropped");
                  const isBlue = card.badge.includes("Active");
                  
                  // Theme-aware card background, border, text
                  const cardBgClass = theme === "light" 
                    ? "bg-white border-[#E5E7EB] shadow-[0_4px_16px_rgba(0,0,0,0.03)]" 
                    : "bg-slate-900/60 backdrop-blur-md border-slate-800/80 shadow-lg";
                  
                  const labelColorClass = theme === "light" ? "text-slate-850" : "text-slate-200";
                  const valueColorClass = theme === "light" ? "text-slate-900" : "text-white";
                  const subtextColorClass = theme === "light" ? "text-slate-400" : "text-slate-500";
                  
                  // Icon container theme styling
                  const iconContainerClass = theme === "light"
                    ? "bg-slate-50 border-[#E5E7EB] text-slate-700"
                    : "bg-slate-800/50 border-slate-700/50 text-slate-300";
                  
                  // Badge styling:
                  const badgeClass = isRed
                    ? (theme === "light" 
                        ? "bg-[#fff1f2] border-[#ffe4e6] text-[#e11d48]" 
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400")
                    : isBlue
                    ? (theme === "light"
                        ? "bg-[#ecfeff] border-[#cffafe] text-[#0891b2]"
                        : "bg-cyan-500/10 border-cyan-500/20 text-[#00C1D4]")
                    : (theme === "light"
                        ? "bg-[#ecfdf5] border-[#d1fae5] text-[#059669]"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400");
                  
                  return (
                    <div 
                      key={index} 
                      className={`border rounded-xl p-4.5 flex flex-col justify-between h-28 hover:-translate-y-0.5 transition-all ${cardBgClass}`}
                      style={{ padding: "18px" }}
                    >
                      {/* Top Row: Icon Container + Label & Info Icon */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          {/* Rounded square container for the icon */}
                          <div className={`w-[28px] h-[28px] flex items-center justify-center rounded-[8px] border shadow-sm ${iconContainerClass}`}>
                            <Icon className="text-xs" />
                          </div>
                          <span className={`text-[12.5px] font-semibold tracking-tight ${labelColorClass}`}>
                            {card.label}
                          </span>
                        </div>
                        <FaInfoCircle className="text-[11px] text-slate-400 hover:text-slate-500 cursor-pointer" />
                      </div>

                      {/* Bottom Row: Value + Badge & Subtext */}
                      <div className="flex items-baseline justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <span className={`text-2xl font-extrabold ${valueColorClass}`}>
                            {card.value}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors ${badgeClass}`}>
                            {card.badge}
                          </span>
                        </div>
                        <span className={`text-[10.5px] font-semibold ${subtextColorClass}`}>
                          {card.subtext}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
 
              {/* MIDDLE ROW (Leads by Country + Calendar Widget) */}
              <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${getAnimClass("delay-200")}`}>
                {/* ── Leads by Country Card ── */}
                <div className={`lg:col-span-2 rounded-xl flex flex-col shadow-sm border overflow-hidden ${
                  theme === "light" 
                    ? "bg-white border-[#E5E7EB]" 
                    : "bg-slate-900/60 backdrop-blur-md border-slate-800/80"
                }`} style={{ padding: "24px 28px 24px" }}>

                  {/* ── Header Row ── */}
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Title */}
                      <div 
                        onClick={() => setCountrySortOrder(prev => prev === "desc" ? "asc" : "desc")}
                        title={countrySortOrder === "desc" ? "Sorted: Highest first. Click to sort Lowest first." : "Sorted: Lowest first. Click to sort Highest first."}
                        className="group flex items-center space-x-1.5 cursor-pointer select-none"
                      >
                        <span className={`text-[15px] font-semibold tracking-[-0.01em] transition-colors ${
                          theme === "light" ? "text-slate-800 group-hover:text-slate-950" : "text-slate-100 group-hover:text-white"
                        }`}>Leads by Country</span>
                        <svg className="w-3.5 h-3.5 mt-px transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          {/* Up arrow */}
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M8.25 9L12 5.25L15.75 9" 
                            className={`transition-colors duration-200 ${
                              countrySortOrder === "asc"
                                ? (theme === "light" ? "text-violet-600" : "text-violet-400")
                                : (theme === "light" ? "text-slate-300" : "text-slate-600 opacity-45")
                            }`}
                          />
                          {/* Down arrow */}
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M8.25 15L12 18.75L15.75 15" 
                            className={`transition-colors duration-200 ${
                              countrySortOrder === "desc"
                                ? (theme === "light" ? "text-violet-600" : "text-violet-400")
                                : (theme === "light" ? "text-slate-300" : "text-slate-600 opacity-45")
                            }`}
                          />
                        </svg>
                      </div>
                      {/* Value + dynamic range */}
                      <div className="flex items-baseline mt-1">
                        <span className={`text-[32px] font-bold tracking-tight leading-none ${
                          theme === "light" ? "text-slate-900" : "text-white"
                        }`}>{filteredLeads.length} Leads</span>
                        <span className="text-[13px] text-slate-400 font-normal ml-3 leading-none self-end pb-1">
                          {dateRangeStart ? (
                            <span>
                              filtered: {dateRangeStart}{dateRangeEnd ? ` to ${dateRangeEnd}` : " (Single Day)"}
                            </span>
                          ) : (
                            "all time"
                          )}
                        </span>
                      </div>
                    </div>
                    
                    {/* ── Period Selector ── */}
                    <div className={`flex items-center rounded-xl overflow-hidden ${
                      theme === "light"
                        ? "bg-[#F3F4F6] border border-[#E5E7EB]"
                        : "bg-slate-900 border border-slate-700"
                    }`} style={{ padding: "3px" }}>
                      {["1 D", "1 W", "1 M", "6 M", "1 Y", "ALL"].map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => handlePeriodChange(period)}
                          className={`transition-all text-[12px] font-medium leading-none ${
                            selectedRevenuePeriod === period 
                              ? (theme === "light" 
                                  ? "bg-white text-slate-900 shadow-sm rounded-lg border border-[#E5E7EB]" 
                                  : "bg-slate-800 text-white shadow-md rounded-lg")
                              : (theme === "light" 
                                  ? "text-slate-400 hover:text-slate-600" 
                                  : "text-slate-500 hover:text-slate-300")
                          }`}
                          style={{ padding: "6px 14px" }}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Chart Area ── */}
                  <div className="relative flex-1 flex items-end" style={{ marginTop: "12px", paddingLeft: "44px" }}>
                    
                    {/* Y-Axis Labels */}
                    <div className="absolute left-0 top-0 bottom-0 pointer-events-none select-none" style={{ width: "36px" }}>
                      {yLabels.map((lbl, idx) => (
                        <span 
                          key={idx} 
                          className={`absolute right-0 text-[11px] font-medium tabular-nums ${
                            theme === "light" ? "text-slate-400" : "text-slate-500"
                          }`}
                          style={{ 
                            top: `${idx * 25}%`,
                            transform: idx === 0 ? "translateY(0)" : idx === yLabels.length - 1 ? "translateY(-100%)" : "translateY(-50%)"
                          }}
                        >
                          {lbl}
                        </span>
                      ))}
                    </div>

                    {/* Grid Canvas */}
                    <div className={`relative flex-1 h-full border-l ${
                      theme === "light" ? "border-[#E5E7EB]" : "border-slate-700"
                    }`}>
                      
                      {/* Horizontal grid lines */}
                      {[25, 50, 75, 100].map((pct) => (
                        <div 
                          key={pct}
                          className={`absolute left-0 right-0 border-t pointer-events-none ${
                            pct === 100 
                              ? (theme === "light" ? "border-[#E5E7EB]" : "border-slate-700")
                              : (theme === "light" ? "border-[#F1F3F5] border-dashed" : "border-slate-800/50 border-dashed")
                          }`}
                          style={{ top: `${pct}%` }}
                        />
                      ))}

                      {/* Bar Columns */}
                      <div className="absolute inset-0 flex items-end" style={{ paddingLeft: "8px", paddingRight: "8px" }}>
                        {countryBarChartData.map((item, idx) => {
                          const heightPct = (item.count / maxLeadsCount) * 100;
                          const isHovered = hoveredBarIndex === idx && item.country !== "-";
                          return (
                            <div
                              key={idx}
                              onMouseEnter={() => setHoveredBarIndex(idx)}
                              onMouseLeave={() => setHoveredBarIndex(null)}
                              className="flex-1 h-full flex flex-col justify-end items-center relative cursor-pointer"
                              style={{ zIndex: isHovered ? 30 : 10 }}
                            >
                              {/* Vertical dashed guide line — ONLY on hover */}
                              {isHovered && (
                                <div 
                                  className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
                                  style={{ 
                                    height: `${heightPct}%`,
                                    width: 0,
                                    borderLeft: "1.5px dashed rgba(0,0,0,0.35)",
                                    zIndex: 25
                                  }}
                                />
                              )}

                              {/* Dot on top of hovered bar */}
                              {isHovered && (
                                <div 
                                  className="absolute pointer-events-none rounded-full"
                                  style={{ 
                                    bottom: `${heightPct}%`, 
                                    left: "50%", 
                                    transform: "translate(-50%, 50%)",
                                    width: "8px",
                                    height: "8px",
                                    backgroundColor: "#1e293b",
                                    border: "2px solid white",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                    zIndex: 35
                                  }}
                                />
                              )}

                              {/* Tooltip */}
                              {isHovered && (
                                <div 
                                  className="absolute pointer-events-none left-1/2 -translate-x-1/2"
                                  style={{ 
                                    bottom: `calc(${heightPct}% + 14px)`,
                                    zIndex: 50
                                  }}
                                >
                                  <div 
                                    className="revenue-tooltip-card flex flex-col items-start border shadow-lg"
                                    style={{
                                      borderRadius: "16px",
                                      padding: "10px 16px",
                                      minWidth: "140px",
                                      boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)"
                                    }}
                                  >
                                    <span className="revenue-tooltip-month text-[12px] font-medium text-slate-400">
                                      {item.country}
                                    </span>
                                    <div className="flex items-center mt-0.5" style={{ gap: "8px" }}>
                                      <span className="revenue-tooltip-value text-[20px] font-bold tracking-tight text-white">
                                        {item.count} Leads
                                      </span>
                                      {filteredLeads.length > 0 && (
                                        <span 
                                          className="flex items-center font-semibold"
                                          style={{
                                            fontSize: "11.5px",
                                            color: "#2563EB",
                                            backgroundColor: "rgba(37, 99, 235, 0.15)",
                                            padding: "2px 7px",
                                            borderRadius: "6px"
                                          }}
                                        >
                                          {Math.round((item.count / filteredLeads.length) * 100)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* The Bar */}
                              <div 
                                className={`relative flex flex-col justify-start overflow-hidden transition-all ${shouldAnimate ? "animate-grow-y" : ""}`}
                                style={{ 
                                  height: `${heightPct}%`,
                                  width: "70%",
                                  maxWidth: "48px",
                                  borderRadius: "6px 6px 0 0",
                                  borderWidth: "1px 1px 0px 1px",
                                  borderStyle: "solid",
                                  borderColor: isHovered 
                                    ? "rgba(37, 99, 235, 0.3)" 
                                    : (theme === "light" ? "#E8EAED" : "rgba(51,65,85,0.5)"),
                                  backgroundColor: isHovered 
                                    ? "rgba(37, 99, 235, 0.12)" 
                                    : (theme === "light" ? "rgba(241, 243, 245, 0.55)" : "rgba(30,41,59,0.15)"),
                                  animationDelay: shouldAnimate ? `${idx * 40}ms` : undefined
                                }}
                              >
                                {/* Top accent line */}
                                <div style={{ 
                                  height: "3px", 
                                  width: "100%",
                                  backgroundColor: "#2563EB",
                                  opacity: isHovered ? 1 : 0.95,
                                  flexShrink: 0
                                }} />
                                
                                {/* Hover gradient fill */}
                                {isHovered && (
                                  <div 
                                    className="flex-1 w-full"
                                    style={{
                                      background: "linear-gradient(to bottom, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.06) 60%, transparent 100%)"
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex" style={{ paddingLeft: "44px", marginTop: "4px" }}>
                    {countryBarChartData.map((item, idx) => (
                      <div key={idx} className="flex-1 flex justify-center" style={{ paddingLeft: "8px", paddingRight: "8px" }}>
                        <span className={`text-[11px] font-bold transition-colors select-none ${
                          hoveredBarIndex === idx 
                            ? (theme === "light" ? "text-slate-800" : "text-white") 
                            : (theme === "light" ? "text-slate-400" : "text-slate-500")
                        }`} title={item.country}>
                          {getCountryAbbreviation(item.country)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1/3 Width - Calendar Widget */}
                <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                  theme === "light" 
                    ? "bg-white border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]" 
                    : "bg-slate-900 border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                }`}>
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className={`text-[16px] font-semibold tracking-tight ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}>
                        Date Filter Calendar
                      </h3>
                      {(dateRangeStart || dateRangeEnd) && (
                        <button 
                          onClick={() => {
                            setDateRangeStart(null);
                            setDateRangeEnd(null);
                            setSelectedRevenuePeriod("ALL");
                          }}
                          className="text-[11px] text-blue-500 hover:text-blue-400 font-bold px-2.5 py-1 rounded-lg border border-blue-500/20 hover:border-blue-500/40 bg-blue-500/5 transition-all"
                        >
                          Clear Filter
                        </button>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-[18px] mb-4">
                      <button 
                        type="button"
                        onClick={() => {
                          if (calMonth === 0) {
                            setCalMonth(11);
                            setCalYear(calYear - 1);
                          } else {
                            setCalMonth(calMonth - 1);
                          }
                        }}
                        className={`p-1 transition-colors ${
                          theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <FaChevronLeft className="text-[11px]" />
                      </button>
                      <span className={`text-[14px] font-semibold tracking-wide ${
                        theme === "light" ? "text-gray-800" : "text-slate-200"
                      }`}>
                        {monthNames[calMonth]} {calYear}
                      </span>
                      <button 
                        type="button"
                        onClick={() => {
                          if (calMonth === 11) {
                            setCalMonth(0);
                            setCalYear(calYear + 1);
                          } else {
                            setCalMonth(calMonth + 1);
                          }
                        }}
                        className={`p-1 transition-colors ${
                          theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <FaChevronRight className="text-[11px]" />
                      </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 text-center mb-3">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <span key={day} className={`text-[12px] font-medium ${
                          theme === "light" ? "text-gray-400/90" : "text-slate-500"
                        }`}>
                          {day}
                        </span>
                      ))}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-7 text-center items-center gap-y-1.5 mb-4">
                      {getDaysInMonth(calYear, calMonth).map((day, idx) => {
                        if (day === null) {
                          return <div key={`empty-${idx}`} className="h-8" />;
                        }
                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const isStart = dateStr === dateRangeStart;
                        const isEnd = dateStr === dateRangeEnd;
                        const inRange = dateRangeStart && dateRangeEnd && dateStr > dateRangeStart && dateStr < dateRangeEnd;
                        const isToday = (() => {
                          const t = new Date();
                          return t.getFullYear() === calYear && t.getMonth() === calMonth && t.getDate() === day;
                        })();

                        return (
                          <div key={day} className="flex justify-center items-center h-8 relative">
                            {/* Range highlight connector */}
                            {inRange && (
                              <div className="absolute inset-y-1 left-0 right-0 bg-[#2563EB]/10 dark:bg-[#2563EB]/20" />
                            )}
                            {isStart && dateRangeEnd && (
                              <div className="absolute inset-y-1 left-1/2 right-0 bg-[#2563EB]/10 dark:bg-[#2563EB]/20" />
                            )}
                            {isEnd && dateRangeStart && (
                              <div className="absolute inset-y-1 left-0 right-1/2 bg-[#2563EB]/10 dark:bg-[#2563EB]/20" />
                            )}
                            <button
                              type="button"
                              onClick={() => handleCalendarDateClick(day)}
                              className={`w-[28px] h-[28px] flex items-center justify-center rounded-full text-[12px] font-medium transition-all duration-150 relative z-10 ${
                                isStart || isEnd
                                  ? "bg-[#2563EB] text-white shadow-[0_3px_8px_rgba(37,99,235,0.4)] font-bold scale-105"
                                  : inRange
                                    ? "text-[#2563EB] dark:text-blue-400 font-semibold"
                                    : isToday
                                      ? "border border-[#2563EB] text-[#2563EB] dark:text-blue-400 font-semibold"
                                      : theme === "light"
                                        ? "text-gray-700 hover:bg-gray-100"
                                        : "text-slate-300 hover:bg-slate-800"
                              }`}
                            >
                              {day}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Divider */}
                    <div className={`border-t border-dashed my-4 ${
                      theme === "light" ? "border-gray-200" : "border-slate-800"
                    }`} />

                    {/* Selection Summary (Replaces meetings list) */}
                    <div className="space-y-3">
                      <div className={`p-4 rounded-xl flex flex-col transition-all duration-200 border ${
                        theme === "light" 
                          ? "bg-slate-50 border-gray-150" 
                          : "bg-slate-800/20 border-slate-800"
                      }`}>
                        <span className={`text-[13px] font-bold tracking-tight mb-2 block ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}>
                          Filter Status
                        </span>
                        
                        <div className="space-y-2 text-[12px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Date Range:</span>
                            <span className={`font-semibold ${theme === "light" ? "text-slate-700" : "text-slate-200"}`}>
                              {dateRangeStart ? (
                                <span>
                                  {(() => {
                                    const [y, m, d] = dateRangeStart.split("-");
                                    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                                    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                                  })()}
                                  {dateRangeEnd && (
                                    <>
                                      {" - "}
                                      {(() => {
                                        const [y, m, d] = dateRangeEnd.split("-");
                                        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                                        return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                                      })()}
                                    </>
                                  )}
                                </span>
                              ) : (
                                "All Time"
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Leads Found:</span>
                            <span className="font-bold text-blue-500">{filteredLeads.length} Leads</span>
                          </div>

                          {dateRangeStart && !dateRangeEnd && (
                            <div className="text-[11px] text-orange-500 dark:text-orange-400 font-medium pt-1">
                              💡 Click a second date to set end of range.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW (Leads Management + Country Breakdown Map + Pipeline) */}
              <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 ${getAnimClass("delay-300")}`}>
                
                {/* Column 1 - Leads Management */}
                <div className={`md:col-span-3 pt-5 px-5 pb-3 rounded-xl border flex flex-col transition-all duration-300 ${
                  theme === "light" 
                    ? "bg-white border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)]" 
                    : "bg-slate-900 border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                }`}>
                  <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-[15px] font-semibold tracking-tight ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}>
                        Leads Management
                      </h3>
                      <button className={`w-8 h-8 flex items-center justify-center rounded-[10px] border transition-all duration-200 ${
                        theme === "light" 
                          ? "bg-white border-gray-200/80 text-gray-700 hover:bg-gray-50 shadow-[0_2px_8px_rgb(0,0,0,0.04)]" 
                          : "bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-750 shadow-md"
                      }`}>
                        <FaEllipsisV className="text-xs" />
                      </button>
                    </div>

                    {/* Custom switchable tabs */}
                    <div className={`flex items-center p-1 rounded-xl mb-4 ${
                      theme === "light" ? "bg-gray-100/80" : "bg-slate-950 border border-slate-900"
                    }`}>
                      {(["Status", "Sources", "Qualification"] as const).map((tab) => {
                        const isActive = leadsMgmtTab === tab;
                        return (
                          <button
                            key={tab}
                            onClick={() => setLeadsMgmtTab(tab)}
                            className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                              isActive 
                                ? theme === "light"
                                  ? "bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.05)] font-semibold"
                                  : "bg-slate-800 text-white shadow-md font-semibold"
                                : theme === "light"
                                  ? "text-gray-400 hover:text-gray-700"
                                  : "text-slate-500 hover:text-slate-350"
                            }`}
                          >
                            {tab}
                          </button>
                        );
                      })}
                    </div>

                    {/* Metrics and Progress Bars */}
                    <div className="space-y-6 pt-2 flex-1 flex flex-col justify-center">
                      {[
                        { label: "Qualified", pct: 90 },
                        { label: "Contacted", pct: 70 },
                        { label: "Lost", pct: 20 },
                        { label: "Won", pct: 85 }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className={`text-[13px] font-medium w-20 shrink-0 ${
                            theme === "light" ? "text-gray-800" : "text-slate-300"
                          }`}>
                            {item.label}
                          </span>
                          <div className="flex-1 flex items-center relative group">
                            {/* Outer Progress Bar container */}
                            <div className={`w-full h-[14px] rounded-[4px] overflow-hidden relative ${
                              theme === "light" ? "bg-gray-100/60" : "bg-slate-950/40 border border-slate-800/30"
                            }`}>
                              <div 
                                className={`h-full rounded-[4px] transition-all duration-700 relative overflow-hidden ${shouldAnimate ? "animate-grow-x" : ""}`} 
                                style={{ 
                                  width: `${item.pct}%`,
                                  background: "linear-gradient(to right, #2563EB, #60A5FA)",
                                  animationDelay: shouldAnimate ? `${idx * 100}ms` : undefined
                                }}
                              >
                                {/* Diagonal gloss overlay for a premium look */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-pulse" />
                              </div>
                            </div>
                            
                            {/* Hover percentage tooltip */}
                            <span className={`absolute right-2 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                              theme === "light" ? "text-gray-900" : "text-white"
                            }`}>
                              {item.pct}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2 - Top Country */}
                <div className={`md:col-span-5 pt-5 px-5 pb-4 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                  theme === "light" 
                    ? "bg-white border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)]" 
                    : "bg-slate-900 border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                }`}>
                  <div className="grid grid-cols-12 gap-5 items-stretch h-full flex-1">
                    {/* Left: Map */}
                    <div className="col-span-12 sm:col-span-7 relative rounded-xl border border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-950/20 overflow-hidden flex items-center justify-center group min-h-[220px]">
                      
                      {/* Card Map Zoom Controls */}
                      <div className="absolute bottom-3 left-3 flex items-center rounded-[8px] border border-[#E5E7EB] dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] z-10 overflow-hidden divide-x divide-[#E5E7EB] dark:divide-slate-700/80">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCardMapZoom(prev => Math.min(5, prev + 0.3));
                          }}
                          className="w-7 h-7 flex items-center justify-center text-slate-800 dark:text-slate-200 text-[13px] font-semibold hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCardMapZoom(prev => Math.max(0.1, prev - 0.2));
                          }}
                          className="w-7 h-7 flex items-center justify-center text-slate-800 dark:text-slate-200 text-[13px] font-semibold hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors"
                        >
                          -
                        </button>
                      </div>

                      <button 
                        onClick={() => setIsMapModalOpen(true)}
                        className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-750 shadow-[0_2px_8px_rgba(0,0,0,0.06)] z-10 transition-colors"
                      >
                        <FaExpand />
                      </button>

                      <div 
                        className="w-full h-full" 
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setCardMapZoom(2.7);
                          setCardMapCenter([122, -18]);
                        }}
                      >
                        {cardMap}
                      </div>
                    </div>

                    {/* Right: Info Column */}
                    <div className="col-span-12 sm:col-span-5 flex flex-col justify-between">
                      <div>
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-[15px] font-semibold tracking-tight ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          }`}>
                            Top Country
                          </h3>
                          <button className={`w-8 h-8 flex items-center justify-center rounded-[10px] border transition-all duration-200 ${
                            theme === "light" 
                              ? "bg-white border-gray-200/80 text-gray-700 hover:bg-gray-50 shadow-[0_2px_8px_rgb(0,0,0,0.04)]" 
                              : "bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-750 shadow-md"
                          }`}>
                            <FaEllipsisV className="text-xs" />
                          </button>
                        </div>

                        {/* Country Ranking */}
                        <div className="space-y-2.5">
                          {[
                            { rank: 1, country: "Australia", value: "48%", flag: <AustraliaFlag /> },
                            { rank: 2, country: "Malaysia", value: "33%", flag: <MalaysiaFlag /> },
                            { rank: 3, country: "Indonesia", value: "25%", flag: <IndonesiaFlag /> },
                            { rank: 4, country: "Singapore", value: "17%", flag: <SingaporeFlag /> }
                          ].map((c) => {
                            const isHovered = hoveredCountry === c.country;
                            return (
                              <div 
                                key={c.rank} 
                                className={`flex items-center justify-between py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isHovered 
                                    ? theme === "light" ? "bg-gray-50" : "bg-slate-800/40"
                                    : ""
                                }`}
                                onMouseEnter={(e) => {
                                  setHoveredCountry(c.country);
                                  tooltipPosRef.current = { x: e.clientX, y: e.clientY };
                                }}
                                onMouseMove={(e) => {
                                  tooltipPosRef.current = { x: e.clientX, y: e.clientY };
                                  if (tooltipRef.current) {
                                    tooltipRef.current.style.left = `${e.clientX + 16}px`;
                                    tooltipRef.current.style.top = `${e.clientY - 10}px`;
                                  }
                                }}
                                onMouseLeave={() => setHoveredCountry(null)}
                                onClick={() => handleCountryClick(c.country)}
                              >
                                <div className="flex items-center space-x-2.5">
                                  <span className={`text-[12px] font-bold ${
                                    theme === "light" ? "text-gray-400" : "text-slate-500"
                                  }`}>
                                    {c.rank}
                                  </span>
                                  {c.flag}
                                  <span className={`text-[13px] font-medium ${
                                    theme === "light" ? "text-gray-750" : "text-slate-350"
                                  }`}>
                                    {c.country}
                                  </span>
                                </div>
                                <span className={`text-[13px] font-semibold ${
                                  theme === "light" ? "text-gray-900" : "text-white"
                                }`}>
                                  {c.value}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* View Countries Tab link */}
                      <div className="flex justify-start mt-3">
                        <button
                          onClick={() => setIsMapModalOpen(true)}
                          className={`w-full py-2 rounded-xl border text-[12px] font-semibold flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-200 ${
                            theme === "light" 
                              ? "bg-white border-gray-200/80 text-gray-700 hover:bg-gray-50 hover:border-gray-300" 
                              : "bg-slate-800 border-slate-700/60 text-slate-200 hover:bg-slate-750 hover:border-slate-650"
                          }`}
                        >
                          View more &nbsp; &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3 - Retention Rate */}
                <div className={`md:col-span-4 pt-5 px-5 pb-1 rounded-xl border flex flex-col transition-all duration-300 ${
                  theme === "light" 
                    ? "bg-white border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)]" 
                    : "bg-slate-900 border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-[15px] font-semibold tracking-tight ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}>
                        Retention Rate
                      </h3>
                      <button className={`w-8 h-8 flex items-center justify-center rounded-[10px] border transition-all duration-200 ${
                        theme === "light" 
                          ? "bg-white border-gray-200/80 text-gray-700 hover:bg-gray-50 shadow-[0_2px_8px_rgb(0,0,0,0.04)]" 
                          : "bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-750 shadow-md"
                      }`}>
                        <FaEllipsisV className="text-xs" />
                      </button>
                    </div>

                    {/* Headline and Legend */}
                    <div className="mb-3">
                      <div className="flex items-baseline space-x-1.5">
                        <span className={`text-2xl font-extrabold ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}>
                          95%
                        </span>
                        <span className="text-[12px] text-emerald-500 font-semibold">
                          +12% vs last month
                        </span>
                      </div>
                      
                      {/* Color opacity legend */}
                      <div className="flex items-center space-x-4 text-[10px] font-semibold mt-1">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                          <span className={theme === "light" ? "text-gray-500" : "text-slate-400"}>SMEs</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]/60" />
                          <span className={theme === "light" ? "text-gray-500" : "text-slate-400"}>Startups</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]/25" />
                          <span className={theme === "light" ? "text-gray-500" : "text-slate-400"}>Enterprises</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stacked Chart container */}
                  <div className="flex-1 flex items-end justify-around pb-0 relative select-none">
                      {[
                        { month: "Jun", sme: 28, startup: 22, enterprise: 15, total: 65 },
                        { month: "Jul", sme: 18, startup: 15, enterprise: 12, total: 45 },
                        { month: "Aug", sme: 35, startup: 25, enterprise: 20, total: 80 },
                        { month: "Sep", sme: 42, startup: 31, enterprise: 22, total: 95 },
                        { month: "Oct", sme: 1.2, startup: 0.5, enterprise: 0.3, total: 2 },
                        { month: "Nov", sme: 1.0, startup: 0.6, enterprise: 0.4, total: 2 },
                        { month: "Dec", sme: 1.1, startup: 0.5, enterprise: 0.4, total: 2 },
                      ].map((item, idx) => {
                        const isHovered = hoveredRetentionMonth === item.month;
                        return (
                          <div 
                            key={idx} 
                            className="w-1/8 flex flex-col items-center h-full justify-end relative"
                            onMouseEnter={() => setHoveredRetentionMonth(item.month)}
                            onMouseLeave={() => setHoveredRetentionMonth(null)}
                          >
                            {/* Floating breakdown tooltip */}
                            {isHovered && (
                              <div className={`absolute bottom-[175px] left-1/2 transform -translate-x-1/2 text-[10px] p-2.5 rounded-lg shadow-xl z-20 w-32 border pointer-events-none transition-all duration-200 ${
                                theme === "light" 
                                  ? "bg-slate-900 border-slate-800 text-white" 
                                  : "bg-white border-gray-200 text-gray-900"
                              }`}>
                                <div className="font-semibold mb-1 text-center border-b border-gray-700/35 pb-0.5">{item.month}</div>
                                <div className="flex justify-between py-0.5">
                                  <span className="opacity-70">SMEs:</span>
                                  <span className="font-semibold">{item.sme}%</span>
                                </div>
                                <div className="flex justify-between py-0.5">
                                  <span className="opacity-70">Startups:</span>
                                  <span className="font-semibold">{item.startup}%</span>
                                </div>
                                <div className="flex justify-between py-0.5">
                                  <span className="opacity-70">Enterprises:</span>
                                  <span className="font-semibold">{item.enterprise}%</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-700/35 mt-1 pt-0.5 font-bold">
                                  <span>Total:</span>
                                  <span>{item.total}%</span>
                                </div>
                              </div>
                            )}

                            {/* The Stacked Bar */}
                            <div 
                              className={`w-8 flex flex-col justify-end rounded-t-lg overflow-hidden transition-all duration-250 cursor-pointer ${shouldAnimate ? "animate-grow-y" : ""} ${
                                isHovered 
                                  ? "ring-2 ring-[#2563EB]/40 ring-offset-1 dark:ring-offset-slate-900" 
                                  : ""
                              }`}
                              style={{ 
                                height: `${item.total}%`,
                                minHeight: item.total <= 2 ? "3px" : "auto",
                                animationDelay: shouldAnimate ? `${idx * 40}ms` : undefined
                              }}
                            >
                              <div className="bg-[#2563EB]/25" style={{ height: `${(item.enterprise / item.total) * 100}%` }} />
                              <div className="bg-[#2563EB]/60" style={{ height: `${(item.startup / item.total) * 100}%` }} />
                              <div className="bg-[#2563EB]" style={{ height: `${(item.sme / item.total) * 100}%` }} />
                            </div>
                            
                            <span className={`text-[10px] font-bold mt-1.5 transition-colors ${
                              item.month === "Sep" 
                                ? theme === "light" ? "text-gray-900 font-black" : "text-white font-black"
                                : "text-gray-400 dark:text-slate-500"
                            }`}>
                              {item.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                </div>

              </div>

              {/* Top Countries Map Full Screen Modal */}
              {isMapModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 dark:bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
                  <div 
                    className={`w-[90vw] h-[85vh] rounded-[24px] border shadow-2xl flex flex-col relative p-6 transition-all duration-300 scale-100 ${
                      theme === "light" 
                        ? "bg-white border-gray-200" 
                        : "bg-slate-900 border-slate-800"
                    }`}
                  >
                    {/* Close Button */}
                    <button 
                      onClick={() => setIsMapModalOpen(false)}
                      className={`absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                          : "bg-slate-850 border-slate-700 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      <FaTimes className="text-sm" />
                    </button>

                    {/* Header */}
                    <div className="mb-4">
                      <h3 className={`text-xl font-bold tracking-tight ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}>
                        Top Countries Analytics
                      </h3>
                      <p className="text-[12px] text-gray-400 dark:text-slate-500 font-medium">
                        Asia-Pacific Traffic & Engagement Statistics
                      </p>
                    </div>

                    {/* Map Viewport */}
                    <div className="flex-1 rounded-2xl border border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20 relative overflow-hidden flex items-center justify-center">
                      
                      {/* Floating Map Helper Controls (bottom left) */}
                      <div className="absolute bottom-4 left-4 flex space-x-2 z-10">
                        <button 
                          onClick={() => setMapZoom(z => Math.min(z + 0.5, 8))}
                          className={`w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition-all ${
                            theme === "light" 
                              ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm" 
                              : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750"
                          }`}
                        >
                          <FaPlus />
                        </button>
                        <button 
                          onClick={() => setMapZoom(z => Math.max(z - 0.5, 0.2))}
                          className={`w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition-all ${
                            theme === "light" 
                              ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm" 
                              : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750"
                          }`}
                        >
                          <FaMinus />
                        </button>
                        <button 
                          onClick={resetMap}
                          className={`px-3 h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                            theme === "light" 
                              ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm" 
                              : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750"
                          }`}
                        >
                          Reset
                        </button>
                      </div>

                      {/* Real Map inside Modal */}
                      <div className="w-full h-full">
                        {modalMap}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tooltip elements rendered outside SVGs using fixed positions */}
              {isMounted && hoveredCountry && createPortal(
                <div 
                  ref={tooltipRef}
                  className={`fixed text-[11px] p-2.5 rounded-lg shadow-xl z-[9999] border pointer-events-none ${
                    theme === "light" 
                      ? "bg-slate-900 border-slate-800 text-white" 
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                  style={{ 
                    left: `${tooltipPosRef.current.x + 16}px`, 
                    top: `${tooltipPosRef.current.y - 10}px`,
                    pointerEvents: "none"
                  }}
                >
                  <div className="font-bold border-b border-gray-700/20 pb-0.5 mb-1">{hoveredCountry}</div>
                  <div className="flex justify-between gap-3 py-0.5">
                    <span className="opacity-70">Traffic Share:</span>
                    <span className="font-semibold">
                      {hoveredCountry === "Australia" ? "48%" : hoveredCountry === "Malaysia" ? "33%" : hoveredCountry === "Indonesia" ? "25%" : hoveredCountry === "Singapore" ? "17%" : "0%"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 py-0.5">
                    <span className="opacity-70">Active Users:</span>
                    <span className="font-semibold">
                      {hoveredCountry === "Australia" ? "12,345" : hoveredCountry === "Malaysia" ? "8,421" : hoveredCountry === "Indonesia" ? "6,192" : hoveredCountry === "Singapore" ? "4,057" : "0"}
                    </span>
                  </div>
                </div>,
                document.body
              )}

            </div>
    </>
  );
}
