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
import { getCountryDisplayName } from "@/utils/countryUtils";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";


export function DropLeadsTab() {
  const {
    leads, meetings, users, currentUser, currentRole, currentTab, setCurrentTab,
    setCurrentRole, setCurrentUser, addUser, deleteUser, addLead, updateLeadStatus,
    updateUsaSlots, addPayment, addMeeting, updateMeeting, restoreLead, deleteLead, deleteLeads, showConfirm, showAlert, updateLeadNotes, isAdmin,
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
    allowedTabs, userAllowedTabs, canModifyLeads, canVerifyDocs, canSubmitVisa, canManagePayments, openLeadDetail,
    openSignedUrl, selectedLead, activeLeads, monthlyChart, chartMax, countryColors,
    countryStats, countryTotal, donutSegments, calendarData, filteredLeads,
    countryBarChartData, maxLeadsCount, yLabels, getCountryAbbreviation,
    handlePeriodChange, handleCalendarDateClick, getDaysInMonth, monthNames,
    leadsMgmtData, topCountryStats, pipelineStats, cardMap, modalMap,
    registerDroppedLeadsExport,
  } = useCrmLayoutContext();

  const droppedLeads = useMemo(
    () => leads.filter((l) => l.status === "DROPPED"),
    [leads]
  );

  useEffect(() => {
    registerDroppedLeadsExport(() =>
      exportRowsToCsv(
        "dropped-leads",
        ["#", "Client Name", "Destination", "Sub Visa Type", "Counselor", "Date Created"],
        droppedLeads.map((l, i) => [i + 1, l.name, l.country, l.visaType, l.counselor, l.dateCreated])
      )
    );
    return () => registerDroppedLeadsExport(null);
  }, [registerDroppedLeadsExport, droppedLeads]);

  return (
    <div className="-m-4 md:-m-8 pt-0 pl-0 pr-0 pb-4 md:pt-0 md:pl-0 md:pr-0 md:pb-6 bg-gray-50 dark:bg-transparent min-h-[calc(100vh-4rem)] space-y-5">
      <div className="min-w-0 space-y-6">
        {/* Dropped leads log table */}
        <DataTable
          borderless={true}
          title="Archived & Dropped Leads"
          rows={droppedLeads}
          getRowId={(l) => l.id}
          columns={[
            {
              header: "Client Name",
              render: (lead) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLeadDetail(lead.id);
                  }}
                  className="font-semibold text-gray-900 dark:text-slate-100 text-[13px] text-left hover:text-violet-600 dark:hover:text-violet-400 hover:underline cursor-pointer transition-colors"
                >
                  {lead.name}
                </button>
              ),
            },
            {
              header: "Destination Desk",
              render: (lead) => {
                const displayCountry = getCountryDisplayName(lead.country);
                return (
                  <span
                    className="text-gray-600 dark:text-slate-300 text-[13px] block truncate max-w-[130px]"
                    title={displayCountry}
                  >
                    {displayCountry}
                  </span>
                );
              },
            },
            { header: "Sub Visa Type", render: (lead) => <span className="text-gray-500 dark:text-slate-400">{lead.visaType}</span> },
            { header: "Last Counselor", render: (lead) => <span className="text-gray-600 dark:text-slate-300 font-medium">{lead.counselor}</span> },
            { header: "Date Created", render: (lead) => <span className="text-gray-500 dark:text-slate-400">{lead.dateCreated}</span> },
          ]}
          actions={(lead) => [
            { icon: FaUndo, title: "Re-activate lead", disabled: () => !canModifyLeads, onClick: (l) => restoreLead(l.id) },
            {
              icon: FaTrash,
              title: "Delete permanently",
              hidden: () => !isAdmin,
              onClick: (l) => {
                showConfirm(
                  "Delete Lead",
                  `Are you sure you want to permanently delete "${l.name}" from the database? This action cannot be undone.`,
                  async () => {
                    const ok = await deleteLead(l.id);
                    if (ok) {
                      showAlert("Delete Success", `"${l.name}" has been permanently deleted from the database.`);
                    } else {
                      showAlert("Delete Failed", "Failed to delete the lead from the database.");
                    }
                  }
                );
              }
            }
          ]}
          onBulkDelete={
            isAdmin
              ? (ids) => {
                  showConfirm(
                    "Delete Multiple Leads",
                    `Are you sure you want to permanently delete the ${ids.length} selected lead(s) from the database? This action cannot be undone.`,
                    async () => {
                      const ok = await deleteLeads(ids);
                      if (ok) {
                        showAlert("Delete Success", `${ids.length} lead(s) have been permanently deleted from the database.`);
                      } else {
                        showAlert("Delete Failed", "Failed to delete the selected leads.");
                      }
                    }
                  );
                }
              : undefined
          }
          actionsHeader="Actions"
          emptyText="Archive log is currently empty."
        />
      </div>
    </div>
  );
}
