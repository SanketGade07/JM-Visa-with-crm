"use client";

import React, { useState, useEffect } from "react";
import { useCrm, VisaStatus, StaffRole, CountryType, LeadSource, DocumentChecklist } from "@/context/CrmContext";

// Which sidebar tabs each role is allowed to open (guide §8.9 access model).
// Every role lands on the Dashboard; specialist teams only see their own desks.
const ROLE_TABS: Record<StaffRole, string[]> = {
  ADMIN: ["Dashboard", "Leads", "FollowUps", "Countries", "USASlots", "Checklist", "Submissions", "Payments", "Meetings", "DropLeads", "Staff"],
  MANAGER: ["Dashboard", "Leads", "FollowUps", "Countries", "USASlots", "Checklist", "Submissions", "Payments", "Meetings", "DropLeads", "Staff"],
  COUNSELOR: ["Dashboard", "Leads", "FollowUps", "Countries", "Meetings", "DropLeads"],
  "DOCUMENT TEAM": ["Dashboard", "Leads", "Countries", "Checklist"],
  "VISA TEAM": ["Dashboard", "Leads", "Countries", "USASlots", "Submissions"],
  "ACCOUNT TEAM": ["Dashboard", "Leads", "Payments"],
};
import {
  FaUserFriends, FaGlobe, FaCheckSquare, FaCalendarAlt, FaHistory,
  FaPassport, FaFileInvoiceDollar, FaChartBar, FaUserLock, FaPlus,
  FaTrash, FaUndo, FaSearch, FaTimes, FaCoins, FaCheckCircle,
  FaInfoCircle, FaFileDownload, FaFileUpload, FaPaperPlane
} from "react-icons/fa";

export default function CrmLayout() {
  const {
    leads,
    meetings,
    currentRole,
    currentTab,
    setCurrentTab,
    setCurrentRole,
    addLead,
    updateLeadStatus,
    updateUsaSlots,
    addPayment,
    addMeeting,
    deleteLead,
    restoreLead,
    updateLeadNotes,
    assignCounselor,
    uploadDocument,
    getLeadDocuments
  } = useCrm();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [countryFilter, setCountryFilter] = useState<string>("All");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Modals
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);

  // Revenue Date Filters
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-05-31");

  // Role SWITCH permission checks
  const canModifyLeads = ["ADMIN", "COUNSELOR", "MANAGER"].includes(currentRole);
  const canVerifyDocs = ["ADMIN", "DOCUMENT TEAM", "MANAGER"].includes(currentRole);
  const canSubmitVisa = ["ADMIN", "VISA TEAM", "MANAGER"].includes(currentRole);
  const canManagePayments = ["ADMIN", "ACCOUNT TEAM", "MANAGER"].includes(currentRole);

  // Tabs the active role is allowed to open
  const allowedTabs = ROLE_TABS[currentRole] ?? ["Dashboard"];

  // If a role switch lands on a tab the role can't access, fall back to Dashboard
  useEffect(() => {
    if (!allowedTabs.includes(currentTab)) {
      setCurrentTab("Dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRole]);

  // Active Lead Object
  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  // Helper: Status Badge Colors
  const getStatusColor = (status: VisaStatus) => {
    switch (status) {
      case "New Lead": return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
      case "Contacted": return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "Follow-Up": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Interested": return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "Documents Pending": return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "Documents Received": return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "Under Verification": return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "Ready For Submission": return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
      case "Visa Submitted": return "bg-violet-500/15 text-violet-300 border border-violet-500/30";
      case "Approved / Rejected": return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
      case "Closed": return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
      case "Dropped": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default: return "bg-slate-600/10 text-slate-400 border border-slate-600/20";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070712] text-slate-100 font-sans">
      
      {/* ----------------- SIDEBAR ----------------- */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#0a0a1a] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-slate-800/60 flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/20">
              <FaGlobe className="text-white text-lg animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 leading-tight">
                JM VISA
              </h1>
              <span className="text-[10px] uppercase font-bold text-violet-400/90 tracking-widest block">
                IMMIGRATION CRM
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider px-3 block mb-2">
              Main Operations
            </span>
            
            {[
              { id: "Dashboard", label: "Dashboard", icon: FaChartBar },
              { id: "Leads", label: "Lead Management", icon: FaUserFriends },
              { id: "FollowUps", label: "Follow-Ups", icon: FaHistory },
              { id: "Countries", label: "Country Wise Leads", icon: FaGlobe },
              { id: "USASlots", label: "USA Slot Tracking", icon: FaPassport },
              { id: "Checklist", label: "Document Checklist", icon: FaCheckSquare },
              { id: "Submissions", label: "Visa Submission", icon: FaPaperPlane },
              { id: "Payments", label: "Payments & Finance", icon: FaFileInvoiceDollar },
              { id: "Meetings", label: "Meetings & Reminders", icon: FaCalendarAlt },
              { id: "DropLeads", label: "Drop Leads Log", icon: FaTrash },
              { id: "Staff", label: "Staff Directory", icon: FaUserLock },
            ].filter((tab) => allowedTabs.includes(tab.id)).map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600/25 to-indigo-600/5 text-violet-300 border-l-4 border-violet-500 shadow-inner"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`${isActive ? "text-violet-400" : "text-slate-500"} text-base shrink-0`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer - Role Switcher */}
        <div className="p-4 border-t border-slate-800/60 bg-[#070714] space-y-3">
          {/* Current Role switcher preview */}
          <div className="text-[10px] text-slate-500 font-bold px-1 uppercase tracking-wider block">
            Switch Sandbox Role:
          </div>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as StaffRole)}
            className="w-full bg-slate-900/80 border border-slate-800 text-violet-400 font-bold text-xs py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="ADMIN">ADMINISTRATOR</option>
            <option value="COUNSELOR">COUNSELOR</option>
            <option value="DOCUMENT TEAM">DOCUMENT TEAM</option>
            <option value="VISA TEAM">VISA TEAM</option>
            <option value="ACCOUNT TEAM">ACCOUNT TEAM</option>
            <option value="MANAGER">GENERAL MANAGER</option>
          </select>
        </div>
      </aside>

      {/* ----------------- MAIN CONTENT AREA ----------------- */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR / HEADER */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0a0a1a] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-slate-100">
              Staff Operations Pane
            </h2>
            <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded-md tracking-wider">
              {`ROLE: ${currentRole}`}
            </div>
          </div>

          {/* Search bar inside header (only visible for dashboard/leads) */}
          <div className="flex items-center space-x-4">
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FaSearch className="text-xs" />
              </span>
              <input
                type="text"
                placeholder="Search leads, names, files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800/80 text-xs pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 placeholder-slate-500"
              />
            </div>
            
            <button
              onClick={() => {
                if (!canModifyLeads) return;
                setIsAddLeadOpen(true);
              }}
              disabled={!canModifyLeads}
              title={!canModifyLeads ? `${currentRole} cannot create leads` : "Add a new lead"}
              className={`flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition-all shadow-md shadow-violet-500/10 ${
                !canModifyLeads ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              <FaPlus />
              <span>Add New Lead</span>
            </button>
          </div>
        </header>

        {/* TAB VIEWS CONTAINER */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* 1. DASHBOARD OVERVIEW */}
          {currentTab === "Dashboard" && (
            <div className="space-y-8">
              {/* Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Active Leads", value: leads.filter(l => l.status !== "Dropped").length, icon: FaUserFriends, color: "from-sky-600 to-sky-400" },
                  { label: "Visa Approved Leads", value: leads.filter(l => l.status === "Approved / Rejected").length, icon: FaCheckCircle, color: "from-emerald-600 to-emerald-400" },
                  { label: "Pending Verification", value: leads.filter(l => l.status === "Documents Pending" || l.status === "Under Verification").length, icon: FaInfoCircle, color: "from-amber-600 to-amber-400" },
                  { label: "Total Gross Revenue", value: `₹${leads.reduce((acc, lead) => acc + lead.payments.reduce((a, p) => a + p.amountPaid, 0), 0).toLocaleString()}`, icon: FaCoins, color: "from-violet-600 to-violet-400" },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-between group hover:-translate-y-0.5 transition-all">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          {item.label}
                        </span>
                        <span className="text-2xl font-extrabold text-white block">
                          {item.value}
                        </span>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-tr ${item.color} text-slate-950 shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="text-base" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic SVGs for visually premium graphics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue Overview chart */}
                <div className="lg:col-span-2 p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Monthly Analytics Chart</h3>
                    <p className="text-[11px] text-slate-400">Dynamic tracking comparison of Visa Applications submitted vs Approved.</p>
                  </div>
                  
                  {/* SVG Chart */}
                  <div className="h-64 flex items-end justify-between border-b border-l border-slate-800 p-4 relative">
                    {/* Grid lines */}
                    <div className="absolute left-0 right-0 top-1/4 border-t border-slate-900 border-dashed pointer-events-none" />
                    <div className="absolute left-0 right-0 top-2/4 border-t border-slate-900 border-dashed pointer-events-none" />
                    <div className="absolute left-0 right-0 top-3/4 border-t border-slate-900 border-dashed pointer-events-none" />

                    {[
                      { month: "Jan", sub: 10, app: 8 },
                      { month: "Feb", sub: 15, app: 11 },
                      { month: "Mar", sub: 25, app: 19 },
                      { month: "Apr", sub: 32, app: 28 },
                      { month: "May", sub: 45, app: 38 },
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center space-y-2 z-10 w-1/5">
                        <div className="flex items-end space-x-1.5 h-44">
                          {/* Submissions Bar */}
                          <div 
                            className="w-4 bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t-md hover:scale-105 transition-all cursor-pointer relative group"
                            style={{ height: `${bar.sub * 3}px` }}
                          >
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-violet-300 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                              Sub: {bar.sub}
                            </span>
                          </div>
                          {/* Approvals Bar */}
                          <div 
                            className="w-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md hover:scale-105 transition-all cursor-pointer relative group"
                            style={{ height: `${bar.app * 3}px` }}
                          >
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-emerald-300 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                              App: {bar.app}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{bar.month}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart Legend */}
                  <div className="flex items-center space-x-6 text-[10px] font-bold pl-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-violet-500 rounded-sm" />
                      <span className="text-slate-400">Total Submissions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-sm" />
                      <span className="text-slate-400">Visa Approvals</span>
                    </div>
                  </div>
                </div>

                {/* Country Breakdown Donut SVG Chart */}
                <div className="p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Destination Volume</h3>
                    <p className="text-[11px] text-slate-400">Demographic percentage of active immigration files.</p>
                  </div>

                  {/* Custom Donut Chart via SVG */}
                  <div className="flex items-center justify-center py-4">
                    <svg className="w-36 h-36" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#0f172a" strokeWidth="3" />
                      {/* USA - 40% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="40 60" strokeDashoffset="25" />
                      {/* UK - 30% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="3" strokeDasharray="30 70" strokeDashoffset="85" />
                      {/* Canada - 20% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="55" />
                      {/* Europe - 10% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="3" strokeDasharray="10 90" strokeDashoffset="35" />
                    </svg>
                  </div>

                  {/* Legend list */}
                  <div className="space-y-1.5 text-[10px] font-bold">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                        <span className="text-slate-400">USA (40%)</span>
                      </div>
                      <span className="text-slate-200">
                        {leads.filter((l) => l.country === "USA" && l.status !== "Dropped").length} Leads
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-slate-400">UK (30%)</span>
                      </div>
                      <span className="text-slate-200">
                        {leads.filter((l) => l.country === "UK" && l.status !== "Dropped").length} Leads
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-400">Canada (20%)</span>
                      </div>
                      <span className="text-slate-200">
                        {leads.filter((l) => l.country === "Canada" && l.status !== "Dropped").length} Leads
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-slate-400">Europe (10%)</span>
                      </div>
                      <span className="text-slate-200">
                        {leads.filter((l) => l.country === "Europe" && l.status !== "Dropped").length} Leads
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Recent Meetings widget & Workload log */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Meetings */}
                <div className="p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-slate-800/60 pb-3">Upcoming Client Consultations</h3>
                  <div className="space-y-3">
                    {meetings.slice(0, 3).map((meet) => (
                      <div key={meet.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-100">{meet.clientName}</span>
                          <p className="text-[10px] text-slate-400">{meet.reminderText}</p>
                          <span className="text-[9px] uppercase font-bold text-violet-400">{meet.counselorAssigned}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-1 bg-slate-900 text-slate-300 font-bold border border-slate-800 rounded-lg text-[10px]">
                            {meet.meetingDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Workload list */}
                <div className="p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-slate-800/60 pb-3">Counselor Distribution Desk</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Priya Mehta", role: "Senior Consultant", count: leads.filter(l => l.counselor === "Priya Mehta").length },
                      { name: "Rohit Verma", role: "Visa Specialist", count: leads.filter(l => l.counselor === "Rohit Verma").length },
                      { name: "Simran Kaur", role: "Schengen Expert", count: leads.filter(l => l.counselor === "Simran Kaur").length },
                    ].map((member, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-200">{member.name}</span>
                          <p className="text-[10px] text-slate-500">{member.role}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 py-0.5 px-2 rounded-lg font-bold">
                            {member.count} Active Files
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. LEAD MANAGEMENT */}
          {currentTab === "Leads" && (
            <div className="space-y-6">
              
              {/* Filter Row */}
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-500">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-1.5 px-3 focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="New Lead">New Lead</option>
                      <option value="Follow-Up">Follow-Up</option>
                      <option value="Documents Pending">Documents Pending</option>
                      <option value="Ready For Submission">Ready For Submission</option>
                      <option value="Visa Submitted">Visa Submitted</option>
                      <option value="Approved / Rejected">Approved / Rejected</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-500">Destination:</span>
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-1.5 px-3 focus:outline-none"
                    >
                      <option value="All">All Countries</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                      <option value="Europe">Europe</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-400">
                  Showing <span className="text-violet-400 font-bold">{
                    leads.filter(l => 
                      l.status !== "Dropped" &&
                      (statusFilter === "All" || l.status === statusFilter) &&
                      (countryFilter === "All" || l.country === countryFilter) &&
                      (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm))
                    ).length
                  }</span> Leads
                </div>
              </div>

              {/* Lead detail split-screen */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Leads list list */}
                <div className="xl:col-span-2 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold">
                          <th className="pb-2.5">Name</th>
                          <th className="pb-2.5">Destination</th>
                          <th className="pb-2.5">Visa Class</th>
                          <th className="pb-2.5">Workflow Status</th>
                          <th className="pb-2.5">Counselor</th>
                          <th className="pb-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads
                          .filter(l => 
                            l.status !== "Dropped" &&
                            (statusFilter === "All" || l.status === statusFilter) &&
                            (countryFilter === "All" || l.country === countryFilter) &&
                            (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm))
                          )
                          .map((lead) => (
                            <tr 
                              key={lead.id} 
                              onClick={() => setSelectedLeadId(lead.id)}
                              className={`border-b border-slate-900/50 hover:bg-slate-900/20 cursor-pointer ${
                                selectedLeadId === lead.id ? "bg-violet-950/20 border-violet-800/40" : ""
                              }`}
                            >
                              <td className="py-3 font-semibold text-slate-200">
                                <div>{lead.name}</div>
                                <span className="text-[10px] text-slate-500 font-medium block">{lead.phone}</span>
                              </td>
                              <td className="py-3 font-semibold text-slate-300">{lead.country}</td>
                              <td className="py-3 text-slate-400">{lead.visaType}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${getStatusColor(lead.status)}`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="py-3 text-slate-300 font-semibold">{lead.counselor}</td>
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteLead(lead.id);
                                    }}
                                    disabled={!canModifyLeads}
                                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                                    title="Drop Lead"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Lead Detail Panel Side Card */}
                {selectedLead && (
                  <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">{selectedLead.name}</h4>
                        <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase block">{selectedLead.id}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg ${getStatusColor(selectedLead.status)}`}>
                        {selectedLead.status}
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      
                      {/* Workflow state slider dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Transition Status</label>
                        <select
                          value={selectedLead.status}
                          onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as VisaStatus)}
                          disabled={!canModifyLeads}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs py-2 px-3 rounded-xl focus:outline-none"
                        >
                          <option value="New Lead">New Lead</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Follow-Up">Follow-Up</option>
                          <option value="Interested">Interested</option>
                          <option value="Documents Pending">Documents Pending</option>
                          <option value="Documents Received">Documents Received</option>
                          <option value="Under Verification">Under Verification</option>
                          <option value="Ready For Submission">Ready For Submission</option>
                          <option value="Visa Submitted">Visa Submitted</option>
                          <option value="Approved / Rejected">Approved / Rejected</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      {/* Assign counselor dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Assigned Counselor</label>
                        <select
                          value={selectedLead.counselor}
                          onChange={(e) => assignCounselor(selectedLead.id, e.target.value)}
                          disabled={!canModifyLeads}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs py-2 px-3 rounded-xl focus:outline-none"
                        >
                          <option value="Unassigned">Unassigned</option>
                          <option value="Priya Mehta">Priya Mehta</option>
                          <option value="Rohit Verma">Rohit Verma</option>
                          <option value="Simran Kaur">Simran Kaur</option>
                        </select>
                      </div>

                      {/* Contact metadata */}
                      <div className="grid grid-cols-2 gap-4 border-y border-slate-900 py-4">
                        <div>
                          <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block">Email Address</span>
                          <span className="text-slate-300 font-semibold select-all block mt-0.5">{selectedLead.email}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block">Contact Number</span>
                          <span className="text-slate-300 font-semibold select-all block mt-0.5">{selectedLead.phone}</span>
                        </div>
                      </div>

                      {/* Notes Box */}
                      <div className="space-y-1.5">
                        <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Counselor File Notes</label>
                        <textarea
                          rows={3}
                          value={selectedLead.notes}
                          onChange={(e) => updateLeadNotes(selectedLead.id, e.target.value)}
                          disabled={!canModifyLeads}
                          placeholder="Type internal remarks here..."
                          className="w-full bg-slate-950 border border-slate-800 text-xs p-3 rounded-xl focus:outline-none placeholder-slate-600 text-slate-300"
                        />
                      </div>

                      {/* Summary checks stats */}
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block">Completed Scans</span>
                          <span className="text-emerald-400 font-bold mt-0.5 block">
                            {Object.values(selectedLead.checklist).filter(Boolean).length} / {Object.values(selectedLead.checklist).length} Files
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setCurrentTab("Checklist");
                            setSelectedLeadId(selectedLead.id);
                          }}
                          className="text-violet-400 hover:text-violet-300 font-bold hover:underline"
                        >
                          Review Vault
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* 3. FOLLOW-UPS */}
          {currentTab === "FollowUps" && (
            <div className="space-y-6">
              
              {/* Metric Card */}
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Follow-Up Center</h3>
                  <p className="text-xs text-slate-400">List of clients requiring contact followups or document updates.</p>
                </div>
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-sm rounded-xl">
                  {leads.filter(l => l.status === "Follow-Up" || l.status === "Contacted").length} Pending Callback Leads
                </div>
              </div>

              {/* Followups leads table */}
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold">
                        <th className="pb-2.5">Name</th>
                        <th className="pb-2.5">Visa Type</th>
                        <th className="pb-2.5">Last Status</th>
                        <th className="pb-2.5">File Notes Log</th>
                        <th className="pb-2.5">counselor</th>
                        <th className="pb-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads
                        .filter(l => ["Follow-Up", "Contacted", "Interested"].includes(l.status))
                        .map((lead) => (
                          <tr key={lead.id} className="border-b border-slate-900/50 hover:bg-slate-900/20">
                            <td className="py-3 font-semibold text-slate-200">{lead.name}</td>
                            <td className="py-3 text-slate-300">{lead.country} - {lead.visaType}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${getStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="py-3 text-slate-400 truncate max-w-xs">{lead.notes || "No notes yet..."}</td>
                            <td className="py-3 text-slate-300 font-semibold">{lead.counselor}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  setCurrentTab("Leads");
                                  setSelectedLeadId(lead.id);
                                }}
                                className="text-violet-400 hover:text-violet-300 font-bold hover:underline"
                              >
                                View File
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 4. COUNTRY WISE DEPARTMENTS */}
          {currentTab === "Countries" && (
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
                    className={`p-6 border rounded-2xl flex flex-col justify-between text-left transition-all ${
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
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-4">
                  {countryFilter === "All" ? "Select a country above to filter files" : `${countryFilter} Desk - File Registrations`}
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold">
                        <th className="pb-2.5">Client Name</th>
                        <th className="pb-2.5">Sub Visa Type</th>
                        <th className="pb-2.5">Workflow Status</th>
                        {countryFilter === "Canada" && <th className="pb-2.5">Biometrics Scan</th>}
                        {countryFilter === "USA" && <th className="pb-2.5">Interview Booking</th>}
                        <th className="pb-2.5">counselor</th>
                        <th className="pb-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads
                        .filter(l => l.status !== "Dropped" && (countryFilter === "All" || l.country === countryFilter))
                        .map((lead) => (
                          <tr key={lead.id} className="border-b border-slate-900/50 hover:bg-slate-900/20 text-slate-300">
                            <td className="py-3 font-semibold text-slate-200">{lead.name}</td>
                            <td className="py-3">{lead.visaType}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${getStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                            </td>
                            {countryFilter === "Canada" && (
                              <td className="py-3 font-bold text-slate-300">
                                {lead.checklist.biometricsCompleted ? (
                                  <span className="text-emerald-400 font-bold">Completed</span>
                                ) : (
                                  <span className="text-yellow-500/80 font-bold">Pending Call</span>
                                )}
                              </td>
                            )}
                            {countryFilter === "USA" && (
                              <td className="py-3 font-bold text-slate-300">
                                {lead.usaSlots?.interviewScheduled ? (
                                  <span className="text-emerald-400 font-bold">{lead.usaSlots?.interviewDate}</span>
                                ) : (
                                  <span className="text-yellow-500/80 font-bold">Not Booked</span>
                                )}
                              </td>
                            )}
                            <td className="py-3 text-slate-300 font-semibold">{lead.counselor}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  if (lead.country === "USA") {
                                    setCurrentTab("USASlots");
                                  } else {
                                    setCurrentTab("Leads");
                                    setSelectedLeadId(lead.id);
                                  }
                                }}
                                className="text-violet-400 hover:text-violet-300 font-bold hover:underline"
                              >
                                {lead.country === "USA" ? "Manage Slots" : "View File"}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 5. USA SLOT MANAGEMENT */}
          {currentTab === "USASlots" && (
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
                
                <div className="xl:col-span-2 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white mb-4">USA Client Profiles</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold">
                          <th className="pb-2.5">Name</th>
                          <th className="pb-2.5">DS-160 Form</th>
                          <th className="pb-2.5">Embassy Fee Paid</th>
                          <th className="pb-2.5">Slot Status</th>
                          <th className="pb-2.5">Interview Date</th>
                          <th className="pb-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads
                          .filter((l) => l.country === "USA" && l.status !== "Dropped")
                          .map((lead) => (
                            <tr 
                              key={lead.id}
                              onClick={() => setSelectedLeadId(lead.id)}
                              className={`border-b border-slate-900/50 hover:bg-slate-900/20 cursor-pointer ${
                                selectedLeadId === lead.id ? "bg-violet-950/20 border-violet-800/40" : ""
                              }`}
                            >
                              <td className="py-3 font-semibold text-slate-200">{lead.name}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                  lead.usaSlots?.ds160Submitted ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                                }`}>
                                  {lead.usaSlots?.ds160Submitted ? "Submitted" : "Pending"}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                  lead.usaSlots?.slotsPaid ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                                }`}>
                                  {lead.usaSlots?.slotsPaid ? "Fee Paid" : "Fee Unpaid"}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                  lead.usaSlots?.slotsBooked ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/10 text-rose-400"
                                }`}>
                                  {lead.usaSlots?.slotsBooked ? "Booked" : "No Booking"}
                                </span>
                              </td>
                              <td className="py-3 text-slate-300 font-semibold">
                                {lead.usaSlots?.interviewScheduled ? lead.usaSlots.interviewDate : "N/A"}
                              </td>
                              <td className="py-3 text-right">
                                <span className="text-violet-400 font-bold hover:underline text-xs">Edit Panel</span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Edit USA Slot side panel */}
                {selectedLead && selectedLead.country === "USA" && (
                  <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-6">
                    <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                      Slot Settings: {selectedLead.name}
                    </h3>

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
          )}

          {/* 6. DOCUMENT CHECKLIST */}
          {currentTab === "Checklist" && (
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
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Active lead selector */}
                <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4 h-fit">
                  <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Active Audits</h3>
                  <div className="space-y-2">
                    {leads
                      .filter(l => l.status !== "Dropped")
                      .map((lead) => (
                        <button
                          key={lead.id}
                          onClick={() => setSelectedLeadId(lead.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                            selectedLeadId === lead.id
                              ? "bg-violet-950/20 border-violet-500/50 text-slate-100 font-bold"
                              : "bg-slate-950 border-slate-900/80 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs block">{lead.name}</span>
                            <span className="text-[9px] uppercase font-bold text-slate-500">{lead.country} - {lead.visaType}</span>
                          </div>
                          <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-bold">
                            {Object.values(lead.checklist).filter(Boolean).length} Verified
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Audit checklist pane */}
                {selectedLead && (
                  <div className="xl:col-span-2 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">Compliance Checklist: {selectedLead.name}</h4>
                        <p className="text-[10px] text-slate-400">Click to change state. Verified scans show verified icon.</p>
                      </div>
                      
                      <div className="text-xs font-semibold text-slate-400 shrink-0">
                        Total Audit Complete: <span className="text-emerald-400 font-extrabold">{
                          Math.round(
                            (Object.values(selectedLead.checklist).filter(Boolean).length /
                              Object.values(selectedLead.checklist).length) *
                              100
                          )
                        }%</span>
                      </div>
                    </div>

                    {uploadError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-[11px] font-semibold flex items-center space-x-2">
                        <FaInfoCircle className="text-xs shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(Object.keys(selectedLead.checklist) as (keyof DocumentChecklist)[]).map((key) => {
                        const value = selectedLead.checklist[key];
                        const doc = getLeadDocuments(selectedLead.id).find((d) => d.docType === key);
                        const rowKey = `${selectedLead.id}-${key}`;
                        const isUploading = uploadingKey === rowKey;
                        return (
                          <div
                            key={key}
                            className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${
                              value
                                ? "bg-emerald-950/10 border-emerald-500/30"
                                : "bg-slate-950 border-slate-900"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <span className={`text-xs font-bold capitalize block truncate ${value ? "text-emerald-400" : "text-slate-400"}`}>
                                {key.replace(/([A-Z])/g, ' $1')}
                              </span>
                              {doc ? (
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-violet-400 hover:text-violet-300 hover:underline inline-flex items-center space-x-1 mt-0.5"
                                >
                                  <FaFileDownload className="text-[9px]" />
                                  <span className="truncate max-w-[140px]">{doc.fileName}</span>
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-600 block mt-0.5">No file uploaded</span>
                              )}
                            </div>

                            <div className="shrink-0 ml-3">
                              {value ? (
                                <span className="inline-flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
                                  <FaCheckCircle className="text-xs" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <label
                                  className={`inline-flex items-center space-x-1.5 text-[10px] font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer transition-all ${
                                    !canVerifyDocs
                                      ? "opacity-40 cursor-not-allowed border-slate-800 text-slate-600"
                                      : "border-violet-500/40 text-violet-400 hover:bg-violet-500/10"
                                  }`}
                                >
                                  <FaFileUpload className="text-[10px]" />
                                  <span>{isUploading ? "Uploading…" : "Upload File"}</span>
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
                                      if (!res.ok) setUploadError(res.error || "Upload failed");
                                      e.target.value = "";
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Auto status notice banner */}
                    <div className="p-3 bg-violet-500/5 border border-violet-500/20 text-violet-400 rounded-xl text-[10px] font-semibold flex items-center space-x-2">
                      <FaInfoCircle className="text-xs shrink-0" />
                      <span>Staff uploads each document manually (received via WhatsApp/email). Files are stored in Supabase. Once all required docs are uploaded, status auto-updates to <strong>READY FOR SUBMISSION</strong>.</span>
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* 7. VISA SUBMISSION */}
          {currentTab === "Submissions" && (
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
          )}

          {/* 8. PAYMENTS & FINANCE */}
          {currentTab === "Payments" && (
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
                      .reduce((acc, lead) => acc + lead.payments.reduce((a, p) => a + p.totalPackage, 0), 0)
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
                        return acc + (total - paid);
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
                
                <div className="xl:col-span-2 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Clients Accounts Ledger</h3>
                    <button
                      onClick={() => {
                        if (!canManagePayments) return;
                        setIsAddPaymentOpen(true);
                      }}
                      disabled={!canManagePayments}
                      className="py-1 px-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[11px] rounded-xl transition-all disabled:opacity-40"
                    >
                      Record Client Deposit
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold">
                          <th className="pb-2.5">Client Name</th>
                          <th className="pb-2.5">Destination</th>
                          <th className="pb-2.5">Invoiced Package</th>
                          <th className="pb-2.5">Realized Paid</th>
                          <th className="pb-2.5">Remaining Balance</th>
                          <th className="pb-2.5 text-right">Receipts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads
                          .filter((l) => l.status !== "Dropped")
                          .map((lead) => {
                            const total = lead.payments[0]?.totalPackage || 0;
                            const paid = lead.payments.reduce((acc, pay) => acc + pay.amountPaid, 0);
                            const balance = total - paid;
                            return (
                              <tr key={lead.id} className="border-b border-slate-900/50 hover:bg-slate-900/20 text-slate-300">
                                <td className="py-3 font-semibold text-slate-200">{lead.name}</td>
                                <td className="py-3">{lead.country}</td>
                                <td className="py-3 font-bold text-slate-400">₹{total.toLocaleString()}</td>
                                <td className="py-3 text-emerald-400 font-bold">₹{paid.toLocaleString()}</td>
                                <td className={`py-3 font-bold ${balance > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                                  ₹{balance.toLocaleString()}
                                </td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => {
                                      setCurrentTab("Leads");
                                      setSelectedLeadId(lead.id);
                                    }}
                                    className="text-violet-400 hover:text-violet-300 font-bold hover:underline"
                                  >
                                    Invoices
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
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
          )}

          {/* 9. MEETINGS & REMINDERS */}
          {currentTab === "Meetings" && (
            <div className="space-y-6">
              
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Calendar & Client Reminder Center</h3>
                  <p className="text-xs text-slate-400">View scheduled face-to-face or video consults with clients.</p>
                </div>
                
                <button
                  onClick={() => {
                    if (!canModifyLeads) return;
                    setIsAddMeetingOpen(true);
                  }}
                  disabled={!canModifyLeads}
                  className="py-2 px-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl transition-all disabled:opacity-40"
                >
                  Schedule New Meeting
                </button>
              </div>

              {/* Meetings grid display */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meetings.map((meet) => (
                  <div key={meet.id} className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4 hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{meet.clientName}</h4>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mt-0.5">Host: {meet.counselorAssigned}</span>
                      </div>
                      <span className="px-2 py-1 bg-slate-950 border border-slate-900 rounded-lg text-slate-300 font-bold text-[10px]">
                        {meet.meetingDate}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[9px] uppercase text-slate-500 font-bold block">Reminder Details</span>
                        <p className="text-slate-300 font-semibold mt-0.5">{meet.reminderText}</p>
                      </div>
                      
                      {meet.notes && (
                        <div>
                          <span className="text-[9px] uppercase text-slate-500 font-bold block">Agenda & Remarks</span>
                          <p className="text-slate-400 mt-0.5 italic">{meet.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 10. DROP LEADS */}
          {currentTab === "DropLeads" && (
            <div className="space-y-6">
              
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-1">Archived & Dropped Leads Log</h3>
                <p className="text-xs text-slate-400">Leads that withdrew or were archived. Restoring moves them back to the active list.</p>
              </div>

              {/* Dropped leads log table */}
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold">
                        <th className="pb-2.5">Client Name</th>
                        <th className="pb-2.5">Destination Desk</th>
                        <th className="pb-2.5">Sub Visa Type</th>
                        <th className="pb-2.5 font-bold">Last counselor Assigned</th>
                        <th className="pb-2.5">Date Created</th>
                        <th className="pb-2.5 text-right">Restore Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads
                        .filter((l) => l.status === "Dropped")
                        .map((lead) => (
                          <tr key={lead.id} className="border-b border-slate-900/50 hover:bg-slate-900/20 text-slate-300 text-xs">
                            <td className="py-3 font-semibold text-slate-200">{lead.name}</td>
                            <td className="py-3">{lead.country}</td>
                            <td className="py-3 text-slate-400">{lead.visaType}</td>
                            <td className="py-3 text-slate-300 font-semibold">{lead.counselor}</td>
                            <td className="py-3">{lead.dateCreated}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => restoreLead(lead.id)}
                                disabled={!canModifyLeads}
                                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline inline-flex items-center space-x-1.5 disabled:opacity-30"
                              >
                                <FaUndo className="text-xs" />
                                <span>Re-Activate Lead</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      {leads.filter((l) => l.status === "Dropped").length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-slate-500 font-bold text-xs">Archive log is currently empty.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 11. STAFF DIRECTORY */}
          {currentTab === "Staff" && (
            <div className="space-y-6">
              
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-1">Company Staff Directory</h3>
                <p className="text-xs text-slate-400">View roster of active case counselors and billing managers.</p>
              </div>

              {/* Roster profiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "Priya Mehta", role: "Senior Consultant", email: "priya.m@jmvisa.com", ext: "Ext: 402", location: "Mumbai HQ" },
                  { name: "Rohit Verma", role: "Visa Slot Officer", email: "rohit.v@jmvisa.com", ext: "Ext: 405", location: "Delhi Desk" },
                  { name: "Simran Kaur", role: "Schengen Case Expert", email: "simran.k@jmvisa.com", ext: "Ext: 412", location: "Kolkata Desk" },
                ].map((staff, i) => (
                  <div key={i} className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4 hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white">
                        {staff.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{staff.name}</h4>
                        <span className="text-[10px] text-violet-400 font-bold block">{staff.role}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-1 border-t border-slate-900">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Email Desk:</span>
                        <span className="text-slate-300 font-bold">{staff.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Intercom:</span>
                        <span className="text-slate-300 font-bold">{staff.ext}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Office:</span>
                        <span className="text-slate-300 font-bold">{staff.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ----------------- MODAL DIALOGS ----------------- */}
      
      {/* A. ADD NEW LEAD MODAL */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
            <button 
              onClick={() => setIsAddLeadOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-200 rounded-lg"
            >
              <FaTimes />
            </button>

            <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3">Initiate New Lead File</h3>

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
                  checklist: {
                    passport: false,
                    visaForm: false,
                    businessDocs: false,
                    salarySlips: false,
                    bankStatement: false,
                    itr: false,
                    offerLetter: false,
                    casOrI20: false,
                    travelHistory: false,
                    sopOrCoverLetter: false,
                    photos: false,
                    insurance: false,
                    biometricsCompleted: false,
                    visaFeesPaid: false,
                  },
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
                  usaSlots: country === "USA" ? {
                    credentialsProvided: false,
                    slotsAvailable: false,
                    slotsPaid: false,
                    slotsBooked: false,
                    ds160Submitted: false,
                    interviewScheduled: false,
                    interviewDate: "",
                    slotLocation: "Delhi",
                  } : undefined
                });

                setIsAddLeadOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Client Full Name</label>
                  <input required name="name" type="text" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Contact Number</label>
                  <input required name="phone" placeholder="+91 99999 99999" type="text" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Email Address</label>
                <input required name="email" type="email" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Immigration Country</label>
                  <select name="country" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none">
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                    <option value="Europe">Europe</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Visa Subtype</label>
                  <input required name="visaType" placeholder="e.g. Student (F-1)" type="text" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Assign Case Officer</label>
                  <select name="counselor" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none">
                    <option value="Priya Mehta">Priya Mehta</option>
                    <option value="Rohit Verma">Rohit Verma</option>
                    <option value="Simran Kaur">Simran Kaur</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Lead Source</label>
                  <select name="source" defaultValue="MANUAL" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none">
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
                  <label className="text-slate-400 font-bold block">Initial Invoiced Package (INR)</label>
                  <input name="totalPackage" placeholder="50000" type="number" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Initial File Notes</label>
                <textarea rows={2} name="notes" placeholder="Any initial information provided by client..." className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:outline-none" />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white rounded-xl shadow-lg"
              >
                Open Case Roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* B. RECORD PAYMENT DEPOSIT MODAL */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
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
                const leadId = fd.get("leadId") as string;
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
                  });
                }

                setIsAddPaymentOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Select Client File</label>
                <select name="leadId" className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none">
                  {leads.filter(l => l.status !== "Dropped").map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.country} - ₹{(l.payments[0]?.totalPackage - l.payments.reduce((a, p) => a + p.amountPaid, 0))?.toLocaleString()} outstanding)</option>
                  ))}
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
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
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

    </div>
  );
}
