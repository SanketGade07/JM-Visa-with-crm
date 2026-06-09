"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCrm, VisaStatus, StaffRole, CountryType, LeadSource, DocumentChecklist, CrmUser, Meeting } from "@/context/CrmContext";
import { ROLE_TABS } from "@/utils/crmConstants";
// @ts-ignore
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";

export function useCrmLayoutState() {
  const {
    leads,
    meetings,
    users,
    currentUser,
    currentRole,
    currentTab,
    setCurrentTab,
    setCurrentRole,
    setCurrentUser,
    addUser,
    deleteUser,
    addLead,
    updateLeadStatus,
    updateUsaSlots,
    addPayment,
    addMeeting,
    updateMeeting,
    restoreLead,
    updateLeadNotes,
    assignCounselor,
    uploadDocument,
    uploadInvoice,
    getLeadDocuments
  } = useCrm();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("visa_crm_user");
    localStorage.removeItem("visa_crm_role");
    setCurrentUser(null);
    window.location.href = "/login";
  };

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [checklistSearch, setChecklistSearch] = useState("");

  // Responsive Layout States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isMobileSlotSettingsOpen, setIsMobileSlotSettingsOpen] = useState(false);
  const [isMobileChecklistOpen, setIsMobileChecklistOpen] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(currentTheme);

    // Disable dashboard entry animations after 1.5s so switching tabs does not trigger them again
    const animTimer = setTimeout(() => {
      setShouldAnimate(false);
    }, 1500);
    return () => clearTimeout(animTimer);
  }, []);

  const getAnimClass = (delayClass: string) => {
    return shouldAnimate ? `opacity-0 animate-premium-fade-in-up ${delayClass}` : "";
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("crm-theme", nextTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(nextTheme);
  };

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  // URL Link Modal State
  const [urlModalData, setUrlModalData] = useState<{ leadId: string; docType: keyof DocumentChecklist; title: string } | null>(null);
  const [pastedUrl, setPastedUrl] = useState("");
  const [uploadError, setUploadError] = useState<string>("");

  // Invoice Manager Modal State
  const [invoiceLeadId, setInvoiceLeadId] = useState<string | null>(null);
  const [urlInvoiceData, setUrlInvoiceData] = useState<{ leadId: string; invoiceNumber: string } | null>(null);
  const [pastedInvoiceUrl, setPastedInvoiceUrl] = useState("");
  const [uploadInvoiceError, setUploadInvoiceError] = useState<string>("");
  const [uploadingInvoiceKey, setUploadingInvoiceKey] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [kpiFilter, setKpiFilter] = useState<string>("Total");
  const [countryFilter, setCountryFilter] = useState<string>("All");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Modals
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [addLeadStep, setAddLeadStep] = useState<"initial" | "visa-options" | "form">("initial");
  const [addLeadSelectedCategory, setAddLeadSelectedCategory] = useState<string>("");
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<CrmUser | null>(null);
  const [addStaffRole, setAddStaffRole] = useState<string>("COUNSELOR");
  const [addStaffCustomRole, setAddStaffCustomRole] = useState("");
  const [editStaffRole, setEditStaffRole] = useState<string>("COUNSELOR");
  const [editStaffCustomRole, setEditStaffCustomRole] = useState("");

  // Dashboard Interactive States
  const [leadsMgmtTab, setLeadsMgmtTab] = useState<"Status" | "Sources" | "Qualification">("Status");
  const [selectedRevenuePeriod, setSelectedRevenuePeriod] = useState("ALL");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [countrySortOrder, setCountrySortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(8);
  const [dateRangeStart, setDateRangeStart] = useState<string | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState<number>(new Date().getMonth());
  const [calYear, setCalYear] = useState<number>(new Date().getFullYear());

  // States for Bottom Row Dashboard Widgets
  const [hoveredRetentionMonth, setHoveredRetentionMonth] = useState<string | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(3.5);
  const [mapCenter, setMapCenter] = useState<[number, number]>([130, -18]);
  const [cardMapZoom, setCardMapZoom] = useState(2.7);
  const [cardMapCenter, setCardMapCenter] = useState<[number, number]>([122, -18]);
  const hoveredCountryRef = useRef<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipPosRef = useRef({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Map mouse/drag handlers - use refs to avoid re-renders that cause vibration
  const handleCountryMouseEnter = useCallback((e: any, countryName: string) => {
    setHoveredCountry(countryName);
    tooltipPosRef.current = { x: e.clientX, y: e.clientY };
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${e.clientX + 16}px`;
      tooltipRef.current.style.top = `${e.clientY - 10}px`;
    }
  }, []);

  const handleCountryMouseMove = useCallback((e: any) => {
    tooltipPosRef.current = { x: e.clientX, y: e.clientY };
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${e.clientX + 16}px`;
      tooltipRef.current.style.top = `${e.clientY - 10}px`;
    }
  }, []);

  const handleCountryMouseLeave = useCallback(() => {
    setHoveredCountry(null);
  }, []);

  const handleCountryClick = useCallback((country: string) => {
    setIsMapModalOpen(true);
  }, []);

  const resetMap = () => {
    setMapZoom(1);
    setMapCenter([11, 0]);
  };


  // Revenue Date Filters
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-05-31");

  // Deposit Upload State
  const [depositLeadId, setDepositLeadId] = useState("");
  const [tempInvoiceFile, setTempInvoiceFile] = useState("");
  const [tempInvoiceUrl, setTempInvoiceUrl] = useState("");
  const [isUploadingTempInvoice, setIsUploadingTempInvoice] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isAddPaymentOpen) {
      const filtered = leads.filter(l => l.status !== "Dropped" && (l.payments[0]?.totalPackage || 0) > 0);
      if (filtered.length > 0) {
        setDepositLeadId(filtered[0].id);
      } else {
        setDepositLeadId("");
      }
      setTempInvoiceFile("");
      setTempInvoiceUrl("");
    }
  }, [isAddPaymentOpen, leads]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Tabs the current user or active role is allowed to open
  const allowedTabs = ROLE_TABS[currentRole as StaffRole] ?? ["Dashboard"];
  const userAllowedTabs = currentUser?.allowedTabs ?? allowedTabs;

  // Role SWITCH permission checks
  const canModifyLeads = ["ADMIN", "COUNSELOR", "MANAGER"].includes(currentRole) || userAllowedTabs.includes("Leads");
  const canVerifyDocs = ["ADMIN", "DOCUMENT TEAM", "MANAGER"].includes(currentRole) || userAllowedTabs.includes("Checklist");
  const canSubmitVisa = ["ADMIN", "VISA TEAM", "MANAGER"].includes(currentRole) || userAllowedTabs.includes("Submissions");
  const canManagePayments = ["ADMIN", "ACCOUNT TEAM", "MANAGER"].includes(currentRole) || userAllowedTabs.includes("Payments");

  // Helper: open a document URL. If it's a Supabase storage path, fetch a signed URL first.
  const openSignedUrl = useCallback(async (fileUrl: string) => {
    // New format: storage://path/to/file
    // Legacy format: https://xxx.supabase.co/storage/v1/object/public/crm-documents/path/to/file
    let storagePath = "";

    if (fileUrl.startsWith("storage://")) {
      storagePath = fileUrl.replace("storage://", "");
    } else if (fileUrl.includes("/storage/v1/object/public/crm-documents/")) {
      storagePath = fileUrl.split("/storage/v1/object/public/crm-documents/")[1];
    }

    if (storagePath) {
      try {
        const res = await fetch(`/api/documents/signed-url?path=${encodeURIComponent(storagePath)}`);
        const data = await res.json();
        if (res.ok && data.signedUrl) {
          window.open(data.signedUrl, "_blank", "noopener,noreferrer");
        } else {
          alert(data.error || "Failed to load document");
        }
      } catch {
        alert("Network error loading document");
      }
    } else {
      // External URL (e.g., Google Drive link) — open directly
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  }, []);

  // If a user switch lands on a tab they can't access, fall back to Dashboard
  useEffect(() => {
    if (!userAllowedTabs.includes(currentTab)) {
      setCurrentTab("Dashboard");
    }
  }, [currentUser, currentTab, userAllowedTabs]);


  // Active Lead Object
  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  // ── Real dashboard analytics (computed from live leads) ─────────────────────
  const activeLeads = leads.filter((l) => l.status !== "Dropped");

  // Monthly chart: last 6 months, bucketed by lead creation date.
  // submissions = leads that reached submission stage; approvals = approved leads.
  const submittedStages = ["Visa Submitted", "Approved / Rejected", "Closed"];
  const monthlyChart = (() => {
    const now = new Date();
    const months: { month: string; sub: number; app: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short" });
      const inMonth = leads.filter((l) => (l.dateCreated || "").startsWith(key));
      months.push({
        month: label,
        sub: inMonth.filter((l) => submittedStages.includes(l.status)).length,
        app: inMonth.filter((l) => l.status === "Approved / Rejected").length,
      });
    }
    return months;
  })();
  const chartMax = Math.max(1, ...monthlyChart.map((m) => Math.max(m.sub, m.app)));

  // Destination donut: real counts + percentages per country
  const countryColors: Record<string, string> = {
    USA: "#007BFF",
    UK: "#00C1D4",
    Canada: "#0ea5e9",
    Europe: "#38bdf8",
  };
  const countryStats = (["USA", "UK", "Canada", "Europe"] as const).map((c) => {
    const count = activeLeads.filter((l) => l.country === c).length;
    return { country: c, count, color: countryColors[c] };
  });
  const countryTotal = countryStats.reduce((acc, c) => acc + c.count, 0);
  // Build donut segments with cumulative offsets (circumference ≈ 100)
  let cumulative = 0;
  const donutSegments = countryStats.map((c) => {
    const pct = countryTotal > 0 ? (c.count / countryTotal) * 100 : 0;
    const seg = { ...c, pct, offset: 25 - cumulative };
    cumulative += pct;
    return seg;
  });

  // ── Dashboard Calculations for Image-like Mockup ────────────────────────────
  const calendarData = (() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const monthName = today.toLocaleString("en-US", { month: "long" });
    
    // Days in current month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Day of the week of the first day
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    
    return { monthName, currentYear, days, todayDate: today.getDate() };
  })();

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (lead.isDeleted) return false;
      if (dateRangeStart) {
        const dateCreated = lead.dateCreated || "";
        if (dateRangeEnd) {
          return dateCreated >= dateRangeStart && dateCreated <= dateRangeEnd;
        } else {
          return dateCreated === dateRangeStart;
        }
      }
      return true;
    });
  }, [leads, dateRangeStart, dateRangeEnd]);

  const countryBarChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLeads.forEach((lead) => {
      const country = lead.country || "Unknown";
      counts[country] = (counts[country] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    const top11 = sorted.slice(0, 11);
    const othersList = sorted.slice(11);
    const othersCount = othersList.reduce((sum, item) => sum + item.count, 0);

    const result = [...top11];
    while (result.length < 11) {
      result.push({ country: "-", count: 0 });
    }

    if (countrySortOrder === "asc") {
      result.sort((a, b) => a.count - b.count);
    } else {
      result.sort((a, b) => b.count - a.count);
    }

    result.push({ country: "Others", count: othersCount });
    return result;
  }, [filteredLeads, countrySortOrder]);

  const maxLeadsCount = useMemo(() => {
    const counts = countryBarChartData.map((d) => d.count);
    const maxVal = Math.max(...counts, 1);
    if (maxVal <= 5) return 5;
    if (maxVal <= 10) return 10;
    if (maxVal <= 25) return 25;
    if (maxVal <= 50) return 50;
    if (maxVal <= 100) return 100;
    return Math.ceil(maxVal / 10) * 10;
  }, [countryBarChartData]);

  const yLabels = useMemo(() => {
    const labels = [];
    for (let i = 4; i >= 0; i--) {
      const val = Math.round((maxLeadsCount / 4) * i);
      labels.push(val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val));
    }
    return labels;
  }, [maxLeadsCount]);

  const getCountryAbbreviation = (name: string) => {
    if (!name || name === "-") return "-";
    if (name === "Others") return "OTH";
    if (name.length <= 4) return name.toUpperCase();
    return name.slice(0, 3).toUpperCase();
  };

  const handlePeriodChange = (period: string) => {
    setSelectedRevenuePeriod(period);
    const today = new Date();
    const format = (d: Date) => d.toISOString().split("T")[0];

    if (period === "1 D") {
      setDateRangeStart(format(today));
      setDateRangeEnd(format(today));
    } else if (period === "1 W") {
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      setDateRangeStart(format(start));
      setDateRangeEnd(format(today));
    } else if (period === "1 M") {
      const start = new Date(today);
      start.setMonth(today.getMonth() - 1);
      setDateRangeStart(format(start));
      setDateRangeEnd(format(today));
    } else if (period === "6 M") {
      const start = new Date(today);
      start.setMonth(today.getMonth() - 6);
      setDateRangeStart(format(start));
      setDateRangeEnd(format(today));
    } else if (period === "1 Y") {
      const start = new Date(today);
      start.setFullYear(today.getFullYear() - 1);
      setDateRangeStart(format(start));
      setDateRangeEnd(format(today));
    } else if (period === "ALL") {
      setDateRangeStart(null);
      setDateRangeEnd(null);
    }
  };

  const handleCalendarDateClick = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (!dateRangeStart || (dateRangeStart && dateRangeEnd)) {
      setDateRangeStart(dateStr);
      setDateRangeEnd(null);
    } else {
      if (dateStr < dateRangeStart) {
        setDateRangeStart(dateStr);
        setDateRangeEnd(null);
      } else {
        setDateRangeEnd(dateStr);
      }
    }
    setSelectedRevenuePeriod(""); // Clear default period selector
  };

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    const startDay = date.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const leadsMgmtData = (() => {
    if (leadsMgmtTab === "Status") {
      const statuses = ["New Lead", "Documents Pending", "Under Verification", "Ready for Submission", "Visa Submitted", "Approved / Rejected"];
      return statuses.map(status => {
        const count = leads.filter(l => l.status === status).length;
        const pct = leads.length > 0 ? (count / leads.length) * 100 : 15 + (status.length * 7) % 45; // Fallback for aesthetic progress bars
        return { label: status, count, pct };
      });
    } else if (leadsMgmtTab === "Sources") {
      const sources: LeadSource[] = ["WEBSITE", "REFERRAL", "WALK_IN", "SOCIAL_MEDIA", "MANUAL"];
      const labelMap: Record<LeadSource, string> = {
        WEBSITE: "Website Form",
        REFERRAL: "Agent Referral",
        WALK_IN: "Walk-in Desk",
        SOCIAL_MEDIA: "Social Media",
        MANUAL: "Manual Registry",
      };
      return sources.map(source => {
        const count = leads.filter(l => l.source === source).length;
        const pct = leads.length > 0 ? (count / leads.length) * 100 : 10 + (source.length * 11) % 55;
        return { label: labelMap[source] || source, count, pct };
      });
    } else {
      const counselors = ["Priya Mehta", "Rohit Verma", "Simran Kaur"];
      return counselors.map(c => {
        const count = leads.filter(l => l.counselor === c).length;
        const pct = leads.length > 0 ? (count / leads.length) * 100 : 20 + (c.length * 13) % 45;
        return { label: c, count, pct };
      });
    }
  })();

  const topCountryStats = (() => {
    const stats = (["USA", "UK", "Canada", "Europe"] as const).map((c) => {
      const count = leads.filter((l) => l.country === c).length;
      const pct = activeLeads.length > 0 ? (count / activeLeads.length) * 100 : 25 + (c.length * 12) % 35;
      return { country: c === "Canada" ? "Canada" : c, count, pct, color: countryColors[c] || "#007BFF" };
    });
    return stats.sort((a, b) => b.count - a.count);
  })();

  const pipelineStats = (() => {
    return (["USA", "UK", "Canada", "Europe"] as const).map((c) => {
      const cLeads = leads.filter(l => l.country === c);
      const approved = cLeads.filter(l => l.status === "Approved / Rejected").length;
      const pending = cLeads.filter(l => ["Documents Pending", "Under Verification", "Ready for Submission", "Visa Submitted"].includes(l.status)).length;
      const newLeads = cLeads.filter(l => l.status === "New Lead").length;
      
      const total = Math.max(1, approved + pending + newLeads);
      return {
        country: c === "Canada" ? "CAN" : c === "Europe" ? "EUR" : c,
        approved: Math.round((approved / total) * 100) || 20 + (c.length * 5) % 40,
        pending: Math.round((pending / total) * 100) || 30 + (c.length * 7) % 35,
        newLeads: Math.round((newLeads / total) * 100) || 15 + (c.length * 3) % 25
      };
    });
  })();

  const cardMap = useMemo(() => {
    if (!isMounted) return <div className="w-full h-full bg-gray-50/50 dark:bg-slate-950/20 animate-pulse rounded-xl" />;
    return (
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 145,
          center: [11, 0]
        }}
        className="w-full h-full select-none"
      >
        <ZoomableGroup
          zoom={cardMapZoom}
          center={cardMapZoom <= 1.05 ? [11, 0] : cardMapCenter}
          onMoveEnd={(position: any) => {
            if (cardMapZoom > 1.05) {
              setCardMapCenter(position.coordinates);
            }
          }}
          maxZoom={5}
          minZoom={0.1}
        >
          <Geographies geography="/world-110m.json">
            {({ geographies }: any) =>
              geographies.map((geo: any) => {
                const countryName = geo.properties.name;
                const isHighlighted = ["Australia", "Indonesia", "Malaysia", "Singapore"].includes(countryName);
                return (
                  <Geography
                    key={geo.rrd || geo.id || countryName}
                    geography={geo}
                    fill={
                      isHighlighted
                        ? "#2563EB"
                        : (theme === "light" ? "#F3F4F6" : "#1E293B")
                    }
                    stroke={theme === "light" ? "#D1D5DB" : "#334155"}
                    strokeWidth={0.3}
                    style={{
                      default: { outline: "none", transition: "fill 150ms ease" },
                      hover: { 
                        fill: isHighlighted ? "#1D4ED8" : (theme === "light" ? "#E5E7EB" : "#334155"),
                        outline: "none",
                        cursor: isHighlighted ? "pointer" : "default",
                        transition: "fill 150ms ease"
                      },
                      pressed: { outline: "none", transition: "fill 150ms ease" }
                    }}
                    onMouseEnter={(e: any) => {
                      if (isHighlighted) {
                        handleCountryMouseEnter(e, countryName);
                      }
                    }}
                    onMouseMove={(e: any) => {
                      if (isHighlighted) {
                        handleCountryMouseMove(e);
                      }
                    }}
                    onMouseLeave={() => {
                      if (isHighlighted) {
                        handleCountryMouseLeave();
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    );
  }, [isMounted, theme, cardMapZoom, cardMapCenter, handleCountryMouseEnter, handleCountryMouseMove, handleCountryMouseLeave]);

  const modalMap = useMemo(() => {
    if (!isMounted) return <div className="w-full h-full bg-gray-50/50 dark:bg-slate-950/20 animate-pulse rounded-xl" />;
    return (
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 145,
          center: [11, 0]
        }}
        className="w-full h-full select-none"
      >
        <ZoomableGroup
          zoom={mapZoom}
          center={mapZoom <= 1.05 ? [11, 0] : mapCenter}
          onMoveEnd={(position: any) => {
            if (mapZoom > 1.05) {
              setMapCenter(position.coordinates);
            }
          }}
          minZoom={0.2}
          maxZoom={8}
        >
          <Geographies geography="/world-110m.json">
            {({ geographies }: any) =>
              geographies.map((geo: any) => {
                const countryName = geo.properties.name;
                const isHighlighted = ["Australia", "Indonesia", "Malaysia", "Singapore"].includes(countryName);
                return (
                  <Geography
                    key={geo.rrd || geo.id || countryName}
                    geography={geo}
                    fill={
                      isHighlighted
                        ? "#2563EB"
                        : (theme === "light" ? "#F3F4F6" : "#1E293B")
                    }
                    stroke={theme === "light" ? "#D1D5DB" : "#334155"}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", transition: "fill 150ms ease" },
                      hover: { 
                        fill: isHighlighted ? "#1D4ED8" : (theme === "light" ? "#E5E7EB" : "#334155"),
                        outline: "none",
                        cursor: isHighlighted ? "pointer" : "default",
                        transition: "fill 150ms ease"
                      },
                      pressed: { outline: "none", transition: "fill 150ms ease" }
                    }}
                    onMouseEnter={(e: any) => {
                      if (isHighlighted) {
                        handleCountryMouseEnter(e, countryName);
                      }
                    }}
                    onMouseMove={(e: any) => {
                      if (isHighlighted) {
                        handleCountryMouseMove(e);
                      }
                    }}
                    onMouseLeave={() => {
                      if (isHighlighted) {
                        handleCountryMouseLeave();
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Markers */}
          {[
            { name: "Australia", coords: [133.77, -25.27], rate: "48%" },
            { name: "Indonesia", coords: [113.92, -0.78], rate: "25%" },
            { name: "Malaysia", coords: [101.97, 4.21], rate: "33%" },
            { name: "Singapore", coords: [103.82, 1.35], rate: "17%" }
          ].map((marker) => (
            <Marker key={marker.name} coordinates={marker.coords as [number, number]}>
              <circle
                r={3.5 / mapZoom}
                fill="#EF4444"
                stroke="#FFFFFF"
                strokeWidth={0.8 / mapZoom}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e: any) => handleCountryMouseEnter(e, marker.name)}
                onMouseMove={(e: any) => handleCountryMouseMove(e)}
                onMouseLeave={handleCountryMouseLeave}
              />
              {/* Text Outline/Halo for maximum contrast and readability */}
              <text
                textAnchor="middle"
                y={-9.5 / mapZoom}
                style={{
                  fontFamily: "sans-serif",
                  fill: "none",
                  stroke: theme === "light" ? "#FFFFFF" : "#0A0A14",
                  strokeWidth: 2.2 / mapZoom,
                  strokeLinejoin: "round",
                  fontSize: `${10 / mapZoom}px`,
                  fontWeight: "bold",
                  pointerEvents: "none"
                }}
              >
                {marker.name}: {marker.rate}
              </text>
              {/* Text Foreground (consistent theme-based color) */}
              <text
                textAnchor="middle"
                y={-9.5 / mapZoom}
                style={{
                  fontFamily: "sans-serif",
                  fill: theme === "light" ? "#0F172A" : "#F8FAFC",
                  fontSize: `${10 / mapZoom}px`,
                  fontWeight: "bold",
                  pointerEvents: "none"
                }}
              >
                {marker.name}: {marker.rate}
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    );
  }, [isMounted, theme, mapZoom, mapCenter, handleCountryMouseEnter, handleCountryMouseMove, handleCountryMouseLeave, setMapCenter]);

  return {
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
  };
}

export type CrmLayoutState = ReturnType<typeof useCrmLayoutState>;
