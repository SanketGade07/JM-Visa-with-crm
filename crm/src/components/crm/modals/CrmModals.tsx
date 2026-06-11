"use client";

import React from "react";
import { StaffRole, CountryType, LeadSource } from "@/context/CrmContext";
import { AVAILABLE_TABS } from "@/utils/crmConstants";
import {
  FaTimes, FaChevronRight, FaChevronLeft, FaFileUpload, FaFileDownload,
  FaGlobe, FaTrash, FaInfoCircle, FaCheckCircle
} from "react-icons/fa";
import { SearchableCountrySelect, PhoneInput } from "@/components/ui/FormInputs";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { DEFAULT_USA_SLOTS } from "@/utils/normalizeLead";
import {
  buildEmptyChecklist,
  DEFAULT_EMPLOYMENT_CATEGORY,
  EMPLOYMENT_CATEGORY_OPTIONS,
  type EmploymentCategory,
} from "@/utils/documentChecklistConfig";


export function CrmModals() {
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
      {/* A. ADD NEW LEAD MODAL */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 dark:bg-[#020207]/80 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#0a0a1a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 overflow-visible">
            <button 
              onClick={() => setIsAddLeadOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
            >
              <FaTimes />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-900 pb-3">Initiate New Lead File</h3>

            {addLeadStep === "initial" && (
              <div className="flex flex-col space-y-4 py-4">
                <button 
                  onClick={() => {
                    setAddLeadSelectedCategory("Study Abroad");
                    setAddLeadStep("form");
                  }}
                  className="group w-full py-4 px-6 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl text-slate-700 dark:text-slate-200 font-bold transition-all duration-200 text-left flex justify-between items-center shadow-sm"
                >
                  <span className="text-sm font-bold text-slate-800 dark:text-white">Study Abroad</span>
                  <FaChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </button>
                <button 
                  onClick={() => {
                    setAddLeadStep("visa-options");
                  }}
                  className="group w-full py-4 px-6 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl text-slate-700 dark:text-slate-200 font-bold transition-all duration-200 text-left flex justify-between items-center shadow-sm"
                >
                  <span className="text-sm font-bold text-slate-800 dark:text-white">Visa</span>
                  <FaChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            )}

            {addLeadStep === "visa-options" && (
              <div className="flex flex-col space-y-4 py-4">
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 mb-2">
                  <button onClick={() => setAddLeadStep("initial")} className="hover:text-slate-800 dark:hover:text-white transition-colors p-1"><FaChevronLeft /></button>
                  <span className="text-xs font-bold uppercase tracking-wider">Select Visa Type</span>
                </div>
                {["Work", "Business", "Residence", "Tourist"].map((visaOpt) => (
                  <button 
                    key={visaOpt}
                    onClick={() => {
                      setAddLeadSelectedCategory(visaOpt + " Visa");
                      setAddLeadStep("form");
                    }}
                    className="group w-full py-4 px-6 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl text-slate-700 dark:text-slate-200 font-bold transition-all duration-200 text-left flex justify-between items-center shadow-sm"
                  >
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{visaOpt} Visa</span>
                    <FaChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}

            {addLeadStep === "form" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = fd.get("name") as string;
                const email = fd.get("email") as string;
                const phone = fd.get("phone") as string;
                const country = fd.get("country") as CountryType;
                const visaType = fd.get("visaType") as string;
                const counselor = fd.get("counselor") as string;
                const notes = fd.get("notes") as string;
                const totalPackage = parseFloat(fd.get("totalPackage") as string) || 0;

                const source = (fd.get("source") as string) || "MANUAL";
                const employmentCategory =
                  (fd.get("employmentCategory") as EmploymentCategory) ||
                  DEFAULT_EMPLOYMENT_CATEGORY;
                addLead({
                  name,
                  email,
                  phone,
                  country,
                  visaType,
                  status: "New Lead",
                  source: source as LeadSource,
                  counselor,
                  notes,
                  employmentCategory,
                  checklist: buildEmptyChecklist(employmentCategory),
                  payments: totalPackage > 0 ? [
                    {
                      totalPackage,
                      amountPaid: 0,
                      pendingAmount: totalPackage,
                      paymentMethod: "Pending",
                      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
                      date: new Date().toISOString().split("T")[0]
                    }
                  ] : [],
                  usaSlots: country === "USA" ? { ...DEFAULT_USA_SLOTS, slotLocation: "Delhi" } : undefined
                });

                showToast("Lead initialized successfully!");
                setIsAddLeadOpen(false);
              }}
              className="space-y-4 text-xs px-1.5 -mx-1.5 py-1 overflow-visible"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 font-bold block">Client Full Name</label>
                  <input required name="name" placeholder="e.g. John Doe" type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 font-bold block">Contact Number</label>
                  <PhoneInput name="phone" required placeholder="9876543210" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400 font-bold block">Email Address</label>
                <input required name="email" placeholder="e.g. john.doe@example.com" type="email" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 rounded-xl focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 font-bold block">Immigration Country</label>
                  <SearchableCountrySelect name="country" required />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 font-bold block">Visa Subtype</label>
                  <input required name="visaType" defaultValue={addLeadSelectedCategory} placeholder="e.g. Student (F-1)" type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 rounded-xl focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 font-bold block">Assign Case Officer</label>
                  <select name="counselor" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 rounded-xl focus:outline-none">
                    <option value="Priya Mehta">Priya Mehta</option>
                    <option value="Rohit Verma">Rohit Verma</option>
                    <option value="Simran Kaur">Simran Kaur</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 font-bold block">Lead Source</label>
                  <select name="source" defaultValue="MANUAL" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 rounded-xl focus:outline-none">
                    <option value="MANUAL">Manual Entry</option>
                    <option value="WEBSITE">Website</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="WALK_IN">Walk-In</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 font-bold block">Employment Category</label>
                  <select
                    name="employmentCategory"
                    defaultValue={DEFAULT_EMPLOYMENT_CATEGORY}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 rounded-xl focus:outline-none"
                  >
                    {EMPLOYMENT_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 font-bold block">Initial Invoiced Package (INR)</label>
                  <input min="0" name="totalPackage" placeholder="50000 (optional)" type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 rounded-xl focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400 font-bold block">Initial File Notes</label>
                <textarea rows={2} name="notes" placeholder="Any initial information provided by client..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 p-3 rounded-xl focus:outline-none" />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg"
              >
                Open Case Roster
              </button>
            </form>
            )}
          </div>
        </div>
      )}

      {/* B. RECORD PAYMENT DEPOSIT MODAL */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAddPaymentOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-200 rounded-lg"
            >
              <FaTimes />
            </button>

            <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3">Record Client Bill Deposit</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const leadId = depositLeadId;
                const amountPaid = parseFloat(fd.get("amountPaid") as string) || 0;
                const paymentMethod = fd.get("paymentMethod") as string;

                const lead = leads.find((l) => l.id === leadId);
                if (lead) {
                  const total = lead.payments[0]?.totalPackage || 0;
                  const currentPaid = lead.payments.reduce((a, p) => a + p.amountPaid, 0);
                  const newPending = Math.max(0, total - (currentPaid + amountPaid));

                  addPayment(leadId, {
                    totalPackage: total,
                    amountPaid,
                    pendingAmount: newPending,
                    paymentMethod,
                    invoiceFile: tempInvoiceFile || undefined,
                    invoiceUrl: tempInvoiceUrl || undefined,
                  });
                  showToast("Payment recorded successfully!");
                }

                setIsAddPaymentOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Select Client File</label>
                <select 
                  name="leadId" 
                  value={depositLeadId}
                  onChange={(e) => setDepositLeadId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none"
                >
                  {leads.filter(l => l.status !== "Dropped" && (l.payments[0]?.totalPackage || 0) > 0).map(l => {
                    const total = l.payments[0]?.totalPackage || 0;
                    const paid = l.payments.reduce((a, p) => a + p.amountPaid, 0);
                    const outstanding = total > 0 ? Math.max(0, total - paid) : 0;
                    const labelSuffix = total > 0 
                      ? `₹${outstanding.toLocaleString()} outstanding` 
                      : "package not decided";
                    return (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.country} - {labelSuffix})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Deposit Amount (INR)</label>
                  <input required name="amountPaid" type="number" placeholder="10000" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Payment Method</label>
                  <select name="paymentMethod" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none">
                    <option value="UPI">UPI / GPay</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash Depot</option>
                  </select>
                </div>
              </div>

              {/* Invoice Attachment Options */}
              <div className="space-y-2 border-t border-slate-900 pt-3">
                <label className="text-slate-400 font-bold block">Invoice Document (Optional)</label>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* File Upload Option */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold block">Upload Invoice PDF/Image</span>
                    {tempInvoiceFile ? (
                      <div className="flex items-center justify-between bg-slate-950 border border-slate-900 px-3 py-2 rounded-xl text-[11px] text-slate-300">
                        <span className="truncate max-w-[120px]">{tempInvoiceFile}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setTempInvoiceFile("");
                            setTempInvoiceUrl("");
                          }}
                          className="text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <label className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-950 border border-slate-800 border-dashed hover:border-violet-500/50 hover:text-violet-400 rounded-xl cursor-pointer text-slate-400 text-xs transition-all">
                        <FaFileUpload className="text-[11px]" />
                        <span>{isUploadingTempInvoice ? "Uploading..." : "Upload File"}</span>
                        <input
                          type="file"
                          className="hidden"
                          disabled={isUploadingTempInvoice}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            if (!depositLeadId) {
                              showToast("Please select a client file first", "error");
                              return;
                            }
                            
                            setIsUploadingTempInvoice(true);
                            const form = new FormData();
                            form.append("leadId", depositLeadId);
                            form.append("docType", "invoice-deposit");
                            form.append("uploadedBy", currentRole);
                            form.append("file", file);

                            try {
                              const res = await fetch("/api/documents", { method: "POST", body: form });
                              const data = await res.json();
                              if (res.ok) {
                                setTempInvoiceFile(data.document.fileName);
                                setTempInvoiceUrl(data.document.fileUrl);
                                showToast("Invoice uploaded successfully!");
                              } else {
                                showToast(data.error || "Upload failed", "error");
                              }
                            } catch {
                              showToast("Network error during upload", "error");
                            } finally {
                              setIsUploadingTempInvoice(false);
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* URL Link Option */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold block">Or Paste Invoice URL</span>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={tempInvoiceUrl && tempInvoiceFile === "Linked Invoice" ? tempInvoiceUrl : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          setTempInvoiceUrl(val);
                          setTempInvoiceFile("Linked Invoice");
                        } else {
                          setTempInvoiceUrl("");
                          setTempInvoiceFile("");
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none placeholder-slate-600 text-slate-300"
                    />
                  </div>

                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg"
              >
                Log Receipt Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* C. SCHEDULE NEW MEETING MODAL */}
      {isAddMeetingOpen && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAddMeetingOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-200 rounded-lg"
            >
              <FaTimes />
            </button>

            <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3">Schedule Consultation Slot</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const clientName = fd.get("clientName") as string;
                const meetingDate = fd.get("meetingDate") as string;
                const reminderText = fd.get("reminderText") as string;
                const counselorAssigned = fd.get("counselorAssigned") as string;
                const notes = fd.get("notes") as string;

                addMeeting({
                  clientName,
                  meetingDate,
                  reminderText,
                  counselorAssigned,
                  notes,
                });

                showToast("Consultation meeting scheduled!");
                setIsAddMeetingOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Client Name</label>
                <input required name="clientName" placeholder="e.g. Rahul Kapoor" type="text" className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Meeting Date</label>
                  <input required name="meetingDate" type="date" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Consultant</label>
                  <select name="counselorAssigned" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none">
                    <option value="Priya Mehta">Priya Mehta</option>
                    <option value="Rohit Verma">Rohit Verma</option>
                    <option value="Simran Kaur">Simran Kaur</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Notification Reminder Text</label>
                <input required name="reminderText" placeholder="Pre-visa documentation verify slot" type="text" className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Agenda Notes</label>
                <textarea rows={2} name="notes" placeholder="Discuss finances, salary statement scans..." className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none" />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg"
              >
                Log Appointment File
              </button>
            </form>
          </div>
        </div>
      )}

      {/* C.5 EDIT EXISTING MEETING MODAL */}
      {isEditMeetingOpen && selectedMeeting && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setIsEditMeetingOpen(false);
                setSelectedMeeting(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-200 rounded-lg"
            >
              <FaTimes />
            </button>

            <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3">Edit Consultation Slot</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const clientName = fd.get("clientName") as string;
                const meetingDate = fd.get("meetingDate") as string;
                const reminderText = fd.get("reminderText") as string;
                const counselorAssigned = fd.get("counselorAssigned") as string;
                const notes = fd.get("notes") as string;

                updateMeeting({
                  id: selectedMeeting.id,
                  clientName,
                  meetingDate,
                  reminderText,
                  counselorAssigned,
                  notes,
                });

                showToast("Consultation meeting updated!");
                setIsEditMeetingOpen(false);
                setSelectedMeeting(null);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Client Name</label>
                <input 
                  required 
                  name="clientName" 
                  defaultValue={selectedMeeting.clientName} 
                  placeholder="e.g. Rahul Kapoor" 
                  type="text" 
                  className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Meeting Date</label>
                  <input 
                    required 
                    name="meetingDate" 
                    defaultValue={selectedMeeting.meetingDate} 
                    type="date" 
                    className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Consultant</label>
                  <select 
                    name="counselorAssigned" 
                    defaultValue={selectedMeeting.counselorAssigned} 
                    className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none"
                  >
                    <option value="Priya Mehta">Priya Mehta</option>
                    <option value="Rohit Verma">Rohit Verma</option>
                    <option value="Simran Kaur">Simran Kaur</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Notification Reminder Text</label>
                <input 
                  required 
                  name="reminderText" 
                  defaultValue={selectedMeeting.reminderText} 
                  placeholder="Pre-visa documentation verify slot" 
                  type="text" 
                  className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Agenda Notes</label>
                <textarea 
                  rows={2} 
                  name="notes" 
                  defaultValue={selectedMeeting.notes} 
                  placeholder="Discuss finances, salary statement scans..." 
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none" 
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg"
              >
                Save Meeting Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* D. PASTE URL MODAL */}
      {urlModalData && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setUrlModalData(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-200 rounded-lg"
            >
              <FaTimes />
            </button>

            <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3 text-left">
              Link Document URL: <span className="capitalize">{urlModalData.title}</span>
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const url = pastedUrl.trim();
                if (!url) return;
                
                setUploadError("");
                const rowKey = `${urlModalData.leadId}-${urlModalData.docType}`;
                setUploadingKey(rowKey);
                setUrlModalData(null);
                
                const res = await uploadDocument(urlModalData.leadId, urlModalData.docType, url);
                setUploadingKey(null);
                if (res.ok) {
                  showToast("Document link verified successfully!");
                } else {
                  setUploadError(res.error || "Saving link failed");
                  showToast(res.error || "Saving link failed", "error");
                }
              }}
              className="space-y-4 text-xs text-left"
            >
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Document URL Link</label>
                <input
                  required
                  type="url"
                  value={pastedUrl}
                  onChange={(e) => setPastedUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or OneDrive/Dropbox link"
                  className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg"
              >
                Attach & Verify Link
              </button>
            </form>
          </div>
        </div>
      )}

      {/* E. INVOICES MANAGER MODAL */}
      {invoiceLeadId && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setInvoiceLeadId(null);
                setUploadInvoiceError("");
              }}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <FaTimes />
            </button>

            {(() => {
              const lead = leads.find(l => l.id === invoiceLeadId);
              if (!lead) return null;
              return (
                <>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      Billing Invoices: {lead.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      View, upload, or attach external document URLs (such as Google Drive or Dropbox links) to individual payment invoices.
                    </p>
                  </div>

                  {uploadInvoiceError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-[10px] font-semibold flex items-center space-x-2">
                      <FaInfoCircle className="text-xs shrink-0" />
                      <span>{uploadInvoiceError}</span>
                    </div>
                  )}

                  <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                    {lead.payments.length === 0 ? (
                      <p className="text-center py-6 text-slate-500 font-semibold text-xs">
                        No transactions recorded for this client. Log a deposit first.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                        <thead>
                          <tr className="border-b border-slate-800/60 text-slate-500 font-bold">
                            <th className="pb-2">Invoice #</th>
                            <th className="pb-2">Date</th>
                            <th className="pb-2">Amount</th>
                            <th className="pb-2">Method</th>
                            <th className="pb-2 text-right">Invoice Document</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lead.payments.map((pay) => {
                            const isUploading = uploadingInvoiceKey === `${lead.id}-${pay.invoiceNumber}`;
                            return (
                              <tr key={pay.invoiceNumber} className="border-b border-slate-900 last:border-0 text-slate-300">
                                <td className="py-3 font-semibold text-slate-100">{pay.invoiceNumber}</td>
                                <td className="py-3 text-slate-400">{pay.date}</td>
                                <td className="py-3 text-emerald-400 font-bold">₹{pay.amountPaid.toLocaleString()}</td>
                                <td className="py-3 font-medium text-slate-400">{pay.paymentMethod}</td>
                                <td className="py-3 text-right">
                                  {pay.invoiceUrl ? (
                                    <div className="flex items-center justify-end space-x-2">
                                      <button
                                        onClick={() => openSignedUrl(pay.invoiceUrl!)}
                                        className="inline-flex items-center space-x-1 text-[10px] font-bold text-violet-400 hover:text-violet-300 hover:underline cursor-pointer"
                                      >
                                        <FaFileDownload className="text-[9px]" />
                                        <span className="truncate max-w-[120px]">{pay.invoiceFile || "Open"}</span>
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (isUploading) return;
                                          setUploadInvoiceError("");
                                          const key = `${lead.id}-${pay.invoiceNumber}`;
                                          setUploadingInvoiceKey(key);
                                          const res = await uploadInvoice(lead.id, pay.invoiceNumber, "");
                                          setUploadingInvoiceKey(null);
                                          if (res.ok) {
                                            showToast("Invoice attachment removed successfully!");
                                          } else {
                                            setUploadInvoiceError(res.error || "Removal failed");
                                            showToast(res.error || "Removal failed", "error");
                                          }
                                        }}
                                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"

                                      >
                                        <FaTrash className="text-[10px]" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end space-x-1.5">
                                      <label
                                        className="inline-flex items-center space-x-1 text-[10px] font-bold rounded-lg px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 hover:text-violet-400 hover:border-violet-500/30 cursor-pointer transition-all"
                                      >
                                        <FaFileUpload className="text-[9px]" />
                                        <span>{isUploading ? "..." : "File"}</span>
                                        <input
                                          type="file"
                                          className="hidden"
                                          disabled={isUploading}
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setUploadInvoiceError("");
                                            const key = `${lead.id}-${pay.invoiceNumber}`;
                                            setUploadingInvoiceKey(key);
                                            
                                            const res = await uploadInvoice(lead.id, pay.invoiceNumber, file);
                                            setUploadingInvoiceKey(null);
                                            if (res.ok) {
                                              showToast("Invoice file uploaded successfully!");
                                            } else {
                                              setUploadInvoiceError(res.error || "Upload failed");
                                              showToast(res.error || "Upload failed", "error");
                                            }
                                            e.target.value = "";
                                          }}
                                        />
                                      </label>

                                      <button
                                        onClick={() => {
                                          setPastedInvoiceUrl("");
                                          setUrlInvoiceData({
                                            leadId: lead.id,
                                            invoiceNumber: pay.invoiceNumber,
                                          });
                                        }}
                                        className="inline-flex items-center space-x-1 text-[10px] font-bold rounded-lg px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 hover:text-violet-400 hover:border-violet-500/30 cursor-pointer transition-all"
                                      >
                                        <FaGlobe className="text-[9px]" />
                                        <span>Link</span>
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* F. PASTE INVOICE URL MODAL */}
      {urlInvoiceData && (
        <div className="fixed inset-0 z-[60] bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setUrlInvoiceData(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <FaTimes />
            </button>

            <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3 text-left">
              Link Invoice URL: {urlInvoiceData.invoiceNumber}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const url = pastedInvoiceUrl.trim();
                if (!url) return;
                
                setUploadInvoiceError("");
                const key = `${urlInvoiceData.leadId}-${urlInvoiceData.invoiceNumber}`;
                setUploadingInvoiceKey(key);
                setUrlInvoiceData(null);
                
                const res = await uploadInvoice(urlInvoiceData.leadId, urlInvoiceData.invoiceNumber, url);
                setUploadingInvoiceKey(null);
                if (res.ok) {
                  showToast("Invoice link attached successfully!");
                } else {
                  setUploadInvoiceError(res.error || "Saving link failed");
                  showToast(res.error || "Saving link failed", "error");
                }
              }}
              className="space-y-4 text-xs text-left"
            >
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Invoice URL Link</label>
                <input
                  required
                  type="url"
                  value={pastedInvoiceUrl}
                  onChange={(e) => setPastedInvoiceUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or OneDrive/Dropbox link"
                  className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg"
              >
                Attach & Verify Invoice Link
              </button>
            </form>
          </div>
        </div>
      )}

      {/* G. ADD NEW STAFF MODAL */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAddStaffOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <FaTimes />
            </button>

            <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3">Create New Staff Account</h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = fd.get("name") as string;
                const email = fd.get("email") as string;
                const password = fd.get("password") as string;
                const role = (addStaffRole === "OTHER" ? addStaffCustomRole.trim() || "OTHER" : addStaffRole) as StaffRole;
                
                // Get checked tabs
                const allowedTabs: string[] = [];
                AVAILABLE_TABS.forEach((t) => {
                  if (fd.get(`tab-${t.id}`)) {
                    allowedTabs.push(t.id);
                  }
                });

                const res = await addUser({ name, email, password, role, allowedTabs });
                if (res.ok) {
                  showToast("Staff account created successfully!");
                  setIsAddStaffOpen(false);
                  setAddStaffRole("COUNSELOR");
                  setAddStaffCustomRole("");
                } else {
                  showToast(res.error || "Failed to create account", "error");
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-400 font-bold block">Full Name</label>
                  <input
                    required
                    name="name"
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-400 font-bold block">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="john@jmvisa.com"
                    className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-400 font-bold block">Password</label>
                  <input
                    required
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-400 font-bold block">Staff Role</label>
                  <select
                    name="role"
                    value={addStaffRole}
                    onChange={(e) => {
                      setAddStaffRole(e.target.value);
                      if (e.target.value !== "OTHER") setAddStaffCustomRole("");
                    }}
                    className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 font-bold"
                  >
                    <option value="COUNSELOR">COUNSELOR</option>
                    <option value="ADMIN">ADMINISTRATOR</option>
                    <option value="MANAGER">GENERAL MANAGER</option>
                    <option value="DOCUMENT TEAM">DOCUMENT TEAM</option>
                    <option value="VISA TEAM">VISA TEAM</option>
                    <option value="ACCOUNT TEAM">ACCOUNT TEAM</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                  {addStaffRole === "OTHER" && (
                    <input
                      type="text"
                      value={addStaffCustomRole}
                      onChange={(e) => setAddStaffCustomRole(e.target.value)}
                      required
                      placeholder="Enter custom role name"
                      className="w-full mt-2 bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-slate-400 font-bold block border-b border-slate-900 pb-1.5">
                  Tab Permissions (Select accessible operations)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-40 overflow-y-auto p-2 bg-slate-950/50 rounded-xl border border-slate-900">
                  {AVAILABLE_TABS.map((t) => (
                    <label key={t.id} className="flex items-center space-x-2 p-1.5 hover:bg-slate-900/50 rounded-lg cursor-pointer text-slate-300 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        name={`tab-${t.id}`}
                        defaultChecked={t.id === "Dashboard"}
                        className="rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                      <span className="font-semibold">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg cursor-pointer"
              >
                Create Staff Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* H. EDIT STAFF / CONFIGURE ACCESS MODAL */}
      {isEditStaffOpen && editingStaff && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setIsEditStaffOpen(false);
                setEditingStaff(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <FaTimes />
            </button>

            <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3">Configure Tab Access & Account Settings</h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = fd.get("name") as string;
                const email = fd.get("email") as string;
                const password = fd.get("password") as string;
                const role = (editStaffRole === "OTHER" ? editStaffCustomRole.trim() || "OTHER" : editStaffRole) as StaffRole;
                
                // Get checked tabs
                const allowedTabs: string[] = [];
                AVAILABLE_TABS.forEach((t) => {
                  if (fd.get(`tab-${t.id}`)) {
                    allowedTabs.push(t.id);
                  }
                });

                const res = await addUser({
                  id: editingStaff.id,
                  name,
                  email,
                  password: password || editingStaff.password,
                  role,
                  allowedTabs,
                  createdAt: editingStaff.createdAt
                });

                if (res.ok) {
                  showToast("Staff account updated successfully!");
                  setIsEditStaffOpen(false);
                  setEditingStaff(null);
                  setEditStaffRole("COUNSELOR");
                  setEditStaffCustomRole("");
                } else {
                  showToast(res.error || "Failed to update account", "error");
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-400 font-bold block">Full Name</label>
                  <input
                    required
                    name="name"
                    defaultValue={editingStaff.name}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-400 font-bold block">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    defaultValue={editingStaff.email}
                    placeholder="john@jmvisa.com"
                    className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-400 font-bold block">Password (Leave blank to keep current)</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-400 font-bold block">Staff Role</label>
                  <select
                    name="role"
                    value={editStaffRole}
                    onChange={(e) => {
                      setEditStaffRole(e.target.value);
                      if (e.target.value !== "OTHER") setEditStaffCustomRole("");
                    }}
                    className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 font-bold"
                  >
                    <option value="COUNSELOR">COUNSELOR</option>
                    <option value="ADMIN">ADMINISTRATOR</option>
                    <option value="MANAGER">GENERAL MANAGER</option>
                    <option value="DOCUMENT TEAM">DOCUMENT TEAM</option>
                    <option value="VISA TEAM">VISA TEAM</option>
                    <option value="ACCOUNT TEAM">ACCOUNT TEAM</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                  {editStaffRole === "OTHER" && (
                    <input
                      type="text"
                      value={editStaffCustomRole}
                      onChange={(e) => setEditStaffCustomRole(e.target.value)}
                      required
                      placeholder="Enter custom role name"
                      className="w-full mt-2 bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-slate-400 font-bold block border-b border-slate-900 pb-1.5">
                  Tab Permissions (Select accessible operations)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-40 overflow-y-auto p-2 bg-slate-950/50 rounded-xl border border-slate-900">
                  {AVAILABLE_TABS.map((t) => (
                    <label key={t.id} className="flex items-center space-x-2 p-1.5 hover:bg-slate-900/50 rounded-lg cursor-pointer text-slate-300 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        name={`tab-${t.id}`}
                        defaultChecked={editingStaff.allowedTabs ? editingStaff.allowedTabs.includes(t.id) : false}
                        className="rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                      <span className="font-semibold">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg cursor-pointer"
              >
                Save Account Configuration
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
