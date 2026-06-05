"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useCrm, VisaStatus, StaffRole, CountryType, LeadSource, DocumentChecklist, CrmUser, Meeting } from "@/context/CrmContext";
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
  FaWhatsapp, FaExternalLinkAlt
} from "react-icons/fa";
import { FiPhone, FiMail, FiUsers, FiClock, FiCalendar, FiEye, FiSettings, FiGlobe } from "react-icons/fi";
import DataTable, { exportRowsToCsv, StatusPill, getPillClasses, ProgressBar } from "@/components/ui/DataTable";

// @ts-ignore
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";

const LEAD_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
];

const getLeadAvatar = (id: string, index: number) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const avatarIndex = Math.abs(hash) % LEAD_AVATARS.length;
  return LEAD_AVATARS[avatarIndex];
};

const getLeadDescription = (lead: any) => {
  if (lead.notes && lead.notes.trim().length > 0) {
    const lines = lead.notes.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 5 && !trimmed.startsWith("Received via") && !trimmed.startsWith("Source:") && !trimmed.startsWith("Service:")) {
        return trimmed;
      }
    }
  }
  return `Interested in ${lead.visaType} for ${lead.country}`;
};

const getLeadCompany = (lead: any) => {
  const companySuffixes = ["Solutions", "Data Inc.", "Systems", "Technologies", "Innovations", "Group", "Dynamics", "Industries", "Global", "OmniCorp"];
  let hash = 0;
  for (let i = 0; i < lead.id.length; i++) {
    hash = lead.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const suffixIndex = Math.abs(hash) % companySuffixes.length;
  const firstWord = lead.name.split(' ')[0] || "Global";
  return `${firstWord} ${companySuffixes[suffixIndex]}`;
};

export default function CrmLayout() {
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


  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [checklistSearch, setChecklistSearch] = useState("");

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
  const [countryFilter, setCountryFilter] = useState<string>("All");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Modals
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
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
  const [selectedRevenuePeriod, setSelectedRevenuePeriod] = useState("1 Y");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(8);

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

  const dashboardRevenueData = [
    { month: "Mar", year: 2025, revenue: 23000, trend: 5000, valueStr: "$23.000", growth: "↑ 4%" },
    { month: "Apr", year: 2025, revenue: 16000, trend: 6500, valueStr: "$16.000", growth: "↑ 1%" },
    { month: "May", year: 2025, revenue: 20000, trend: 4000, valueStr: "$20.000", growth: "↑ 3%" },
    { month: "Jun", year: 2025, revenue: 13000, trend: 7000, valueStr: "$13.000", growth: "↓ 2%" },
    { month: "Jul", year: 2025, revenue: 20000, trend: 9500, valueStr: "$20.000", growth: "↑ 5%" },
    { month: "Aug", year: 2025, revenue: 6000, trend: 8000, valueStr: "$6.000", growth: "↓ 4%" },
    { month: "Sept", year: 2025, revenue: 20000, trend: 12000, valueStr: "$20.000", growth: "↑ 2%" },
    { month: "Oct", year: 2025, revenue: 16000, trend: 5000, valueStr: "$16.000", growth: "↑ 1%" },
    { month: "Nov", year: 2025, revenue: 19000, trend: 9000, valueStr: "$18.202", growth: "↑ 2%" },
    { month: "Des", year: 2025, revenue: 10000, trend: 8000, valueStr: "$10.000", growth: "↓ 1%" },
    { month: "Jan", year: 2026, revenue: 6000, trend: 5000, valueStr: "$6.000", growth: "↑ 2%" },
    { month: "Feb", year: 2026, revenue: 8000, trend: 7000, valueStr: "$8.000", growth: "↑ 3%" }
  ];

  const maxRevenue = 40000;
  
  const yLabels = ["40k", "30k", "20k", "10k", "0k"];

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

  if (!isMounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="flex min-h-screen bg-[#070712] text-slate-100 font-sans">
      
      {/* ----------------- SIDEBAR ----------------- */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#0a0a1a] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-slate-800/60 flex items-center space-x-3">
            <img src="/logo.webp" alt="JM Visa Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-violet-500/10" />
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
            ].filter((tab) => userAllowedTabs.includes(tab.id)).map((tab) => {
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
            Switch Sandbox Account:
          </div>
          <select
            value={currentUser?.id || "user-admin"}
            onChange={(e) => {
              const selectedUser = users.find((u) => u.id === e.target.value);
              if (selectedUser) {
                setCurrentUser(selectedUser);
              }
            }}
            className="w-full bg-slate-900/80 border border-slate-800 text-violet-400 font-bold text-xs py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
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

            {/* Theme Toggle Switch */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all flex items-center justify-center shadow-md cursor-pointer group"
            >
              {theme === "dark" ? (
                <FaSun className="text-sm text-amber-400 transition-transform duration-500 group-hover:rotate-45" />
              ) : (
                <FaMoon className="text-sm text-indigo-600 transition-transform duration-500 group-hover:-rotate-12" />
              )}
            </button>

            <button
              onClick={() => {
                if (!canModifyLeads) return;
                setIsAddLeadOpen(true);
              }}
              disabled={!canModifyLeads}
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
                  {
                    label: "Consultations",
                    value: meetings.length,
                    badge: "Active",
                    badgeColor: "bg-cyan-500/10 border-cyan-500/20 text-[#00C1D4]",
                    subtext: "reminders set",
                    icon: FaCalendarAlt
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
 
              {/* MIDDLE ROW (Revenue Overview + Calendar Widget) */}
              <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${getAnimClass("delay-200")}`}>
                {/* ── Revenue Overview Card ── */}
                <div className={`lg:col-span-2 rounded-xl flex flex-col shadow-sm border overflow-hidden ${
                  theme === "light" 
                    ? "bg-white border-[#E5E7EB]" 
                    : "bg-slate-900/60 backdrop-blur-md border-slate-800/80"
                }`} style={{ padding: "24px 28px 24px" }}>

                  {/* ── Header Row ── */}
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Title */}
                      <div className="flex items-center space-x-1.5 cursor-pointer select-none">
                        <span className={`text-[15px] font-semibold tracking-[-0.01em] ${
                          theme === "light" ? "text-slate-800" : "text-slate-100"
                        }`}>Revenue</span>
                        <svg className="w-3.5 h-3.5 text-slate-400 mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                        </svg>
                      </div>
                      {/* Value + growth */}
                      <div className="flex items-baseline mt-1">
                        <span className={`text-[32px] font-bold tracking-tight leading-none ${
                          theme === "light" ? "text-slate-900" : "text-white"
                        }`}>$32.209</span>
                        <span className="text-[13px] text-slate-400 font-normal ml-3 leading-none self-end pb-1">
                          +22% vs last month
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
                          onClick={() => setSelectedRevenuePeriod(period)}
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
                          className={`absolute right-0 -translate-y-1/2 text-[11px] font-medium tabular-nums ${
                            theme === "light" ? "text-slate-400" : "text-slate-500"
                          }`}
                          style={{ top: `${idx * 25}%` }}
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

                      {/* Trend Line (dotted curve behind bars) */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 20 }} viewBox="0 0 1200 200" preserveAspectRatio="none">
                        <path
                          d={dashboardRevenueData.map((item, idx) => {
                            const x = 50 + idx * (1100 / 11);
                            const y = 200 - (item.trend / 40000) * 200;
                            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke={theme === "light" ? "#CBD5E1" : "#475569"}
                          strokeWidth="1.5"
                          strokeDasharray="3 5"
                          opacity="0.6"
                        />
                      </svg>

                      {/* Bar Columns */}
                      <div className="absolute inset-0 flex items-end" style={{ paddingLeft: "8px", paddingRight: "8px" }}>
                        {dashboardRevenueData.map((item, idx) => {
                          const heightPct = (item.revenue / maxRevenue) * 100;
                          const isHovered = hoveredBarIndex === idx;
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
                                    className="bg-white border border-[#E5E7EB] flex flex-col items-start"
                                    style={{
                                      borderRadius: "16px",
                                      padding: "10px 16px",
                                      minWidth: "140px",
                                      boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)"
                                    }}
                                  >
                                    <span className="text-[12px] text-slate-400 font-medium">
                                      Sept, {item.year}
                                    </span>
                                    <div className="flex items-center mt-0.5" style={{ gap: "8px" }}>
                                      <span className="text-[20px] font-bold text-slate-800 tracking-tight">
                                        {item.valueStr}
                                      </span>
                                      {(() => {
                                        const isDown = item.growth.includes("↓");
                                        const cleanGrowth = item.growth.replace(/[↑↓\s%]/g, "");
                                        return (
                                          <span 
                                            className="flex items-center font-semibold"
                                            style={{
                                              fontSize: "11.5px",
                                              color: isDown ? "#e11d48" : "#16a34a",
                                              backgroundColor: isDown ? "#fff1f2" : "#f0fdf4",
                                              padding: "2px 7px",
                                              borderRadius: "6px"
                                            }}
                                          >
                                            {isDown ? (
                                              <svg className="mr-0.5 shrink-0" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                              </svg>
                                            ) : (
                                              <svg className="mr-0.5 shrink-0" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                              </svg>
                                            )}
                                            {cleanGrowth}%
                                          </span>
                                        );
                                      })()}
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

                  {/* X-Axis Month Labels */}
                  <div className="flex" style={{ paddingLeft: "44px", marginTop: "2px" }}>
                    {dashboardRevenueData.map((item, idx) => (
                      <div key={idx} className="flex-1 flex justify-center" style={{ paddingLeft: "8px", paddingRight: "8px" }}>
                        <span className={`text-[12px] font-medium transition-colors ${
                          hoveredBarIndex === idx 
                            ? (theme === "light" ? "text-slate-800" : "text-white") 
                            : (theme === "light" ? "text-slate-400" : "text-slate-500")
                        }`}>
                          {item.month}
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
                        Calendar
                      </h3>
                      <button className={`w-9 h-9 flex items-center justify-center rounded-[12px] border transition-all duration-200 ${
                        theme === "light" 
                          ? "bg-white border-gray-200/80 text-gray-700 hover:bg-gray-50 shadow-[0_2px_8px_rgb(0,0,0,0.04)]" 
                          : "bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-750 shadow-md"
                      }`}>
                        <FaEllipsisV className="text-sm" />
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-[18px] mb-4">
                      <button 
                        onClick={() => showToast("Previous week")}
                        className={`p-1 transition-colors ${
                          theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <FaChevronLeft className="text-[11px]" />
                      </button>
                      <span className={`text-[14px] font-medium tracking-wide ${
                        theme === "light" ? "text-gray-800" : "text-slate-200"
                      }`}>
                        October 2025
                      </span>
                      <button 
                        onClick={() => showToast("Next week")}
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
                    <div className="grid grid-cols-7 text-center items-center mb-4">
                      {[5, 6, 7, 8, 9, 10, 11].map((date) => {
                        const isSelected = selectedCalendarDate === date;
                        return (
                          <div key={date} className="flex justify-center items-center h-8">
                            <button
                              onClick={() => setSelectedCalendarDate(date)}
                              className={`w-[30px] h-[30px] flex items-center justify-center rounded-full text-[13px] font-medium transition-all duration-200 ${
                                isSelected
                                  ? "bg-[#2563EB] text-white shadow-[0_4px_10px_rgba(37,99,235,0.35)] scale-105"
                                  : theme === "light"
                                    ? "text-gray-700 hover:bg-gray-100"
                                    : "text-slate-300 hover:bg-slate-800"
                              }`}
                            >
                              {date}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Dashed Divider */}
                    <div className={`border-t border-dashed my-4 ${
                      theme === "light" ? "border-gray-200/80" : "border-slate-800/80"
                    }`} />

                    {/* Scheduled Events Container */}
                    <div className="space-y-3">
                      {/* Event 1 */}
                      <div className={`p-4 rounded-[14px] flex flex-col transition-all duration-205 ${
                        theme === "light" ? "bg-[#F8F9FB] hover:bg-[#F3F4F6]" : "bg-slate-800/30 hover:bg-slate-800/40"
                      }`}>
                        <div className="flex justify-between items-start">
                          <span className={`text-[14px] font-semibold tracking-tight ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          }`}>
                            Mesh Weekly Meeting
                          </span>
                          <span className={`text-[12px] font-medium tracking-tight ${
                            theme === "light" ? "text-gray-400" : "text-slate-400"
                          }`}>
                            9.00 am - 10.00 am
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-[14px]">
                          {/* Avatars */}
                          <div className="flex -space-x-1.5 items-center">
                            <img 
                              className={`w-[26px] h-[26px] rounded-full border-2 object-cover z-30 ${
                                theme === "light" ? "border-[#F8F9FB]" : "border-slate-850"
                              }`}
                              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80"
                              alt="Avatar 1"
                            />
                            <img 
                              className={`w-[26px] h-[26px] rounded-full border-2 object-cover z-20 ${
                                theme === "light" ? "border-[#F8F9FB]" : "border-slate-850"
                              }`}
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80"
                              alt="Avatar 2"
                            />
                            <img 
                              className={`w-[26px] h-[26px] rounded-full border-2 object-cover z-10 ${
                                theme === "light" ? "border-[#F8F9FB]" : "border-slate-850"
                              }`}
                              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80"
                              alt="Avatar 3"
                            />
                            <div className={`w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center text-[9px] font-semibold z-0 bg-purple-50 text-purple-600 ${
                              theme === "light" 
                                ? "border-[#F8F9FB]" 
                                : "border-slate-850 bg-purple-950/40 text-purple-300"
                            }`}>
                              +7
                            </div>
                          </div>

                          {/* Action Button */}
                          <button 
                            onClick={() => showToast("Joining Google Meet...")}
                            className={`px-3 py-1.5 rounded-[10px] border text-[11px] font-medium flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 ${
                              theme === "light" 
                                ? "bg-white border-gray-200/80 text-gray-700 hover:bg-gray-50 hover:border-gray-300" 
                                : "bg-slate-800 border-slate-700/60 text-slate-200 hover:bg-slate-750 hover:border-slate-650"
                            }`}
                          >
                            On Google Meet
                            <FaChevronRight className="text-[8px] text-gray-400/90 ml-1.5" />
                          </button>
                        </div>
                      </div>

                      {/* Event 2 */}
                      <div className={`p-4 rounded-[14px] flex flex-col transition-all duration-205 ${
                        theme === "light" ? "bg-[#F8F9FB] hover:bg-[#F3F4F6]" : "bg-slate-800/30 hover:bg-slate-800/40"
                      }`}>
                        <div className="flex justify-between items-start">
                          <span className={`text-[14px] font-semibold tracking-tight ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          }`}>
                            Gamification Demo
                          </span>
                          <span className={`text-[12px] font-medium tracking-tight ${
                            theme === "light" ? "text-gray-400" : "text-slate-400"
                          }`}>
                            10.45 am - 11.45 am
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-[14px]">
                          {/* Avatars */}
                          <div className="flex -space-x-1.5 items-center">
                            <img 
                              className={`w-[26px] h-[26px] rounded-full border-2 object-cover z-30 ${
                                theme === "light" ? "border-[#F8F9FB]" : "border-slate-850"
                              }`}
                              src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80"
                              alt="Avatar 4"
                            />
                            <img 
                              className={`w-[26px] h-[26px] rounded-full border-2 object-cover z-20 ${
                                theme === "light" ? "border-[#F8F9FB]" : "border-slate-850"
                              }`}
                              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80"
                              alt="Avatar 5"
                            />
                            <img 
                              className={`w-[26px] h-[26px] rounded-full border-2 object-cover z-10 ${
                                theme === "light" ? "border-[#F8F9FB]" : "border-slate-850"
                              }`}
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"
                              alt="Avatar 6"
                            />
                          </div>

                          {/* Action Button */}
                          <button 
                            onClick={() => showToast("Opening Slack...")}
                            className={`px-3 py-1.5 rounded-[10px] border text-[11px] font-medium flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 ${
                              theme === "light" 
                                ? "bg-white border-gray-200/80 text-gray-700 hover:bg-gray-50 hover:border-gray-300" 
                                : "bg-slate-800 border-slate-700/60 text-slate-200 hover:bg-slate-750 hover:border-slate-650"
                            }`}
                          >
                            On Slack
                            <FaChevronRight className="text-[8px] text-gray-400/90 ml-1.5" />
                          </button>
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
                    <div className="col-span-7 relative rounded-xl border border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-950/20 overflow-hidden flex items-center justify-center group min-h-[220px]">
                      
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
                    <div className="col-span-5 flex flex-col justify-between">
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
                                onMouseEnter={() => setHoveredCountry(c.country)}
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
          )}

          {/* 2. LEAD MANAGEMENT */}
          {currentTab === "Leads" && (
            <div className="-m-8 p-6 bg-gray-50 dark:bg-transparent min-h-[calc(100vh-4rem)] space-y-5">

              {/* Page header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Lead Management</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage and track all your leads in one place.</p>
                </div>

              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Leads",
                    value: leads.filter(l => l.status !== "Dropped").length,
                    icon: FiUsers,
                    trend: "↑ 12%",
                    up: true,
                    bgColor: "bg-[#eff6ff] dark:bg-blue-950/45",
                    textColor: "text-[#2563eb] dark:text-blue-400",
                    trendColor: "text-emerald-600 dark:text-emerald-500",
                    color: "#3b82f6",
                    linePath: "M 5 30 C 12 28, 18 20, 25 25 C 32 30, 38 12, 45 15 C 52 18, 58 22, 65 18 C 72 14, 78 10, 85 14 C 92 18, 96 10, 100 8",
                    areaPath: "M 5 30 C 12 28, 18 20, 25 25 C 32 30, 38 12, 45 15 C 52 18, 58 22, 65 18 C 72 14, 78 10, 85 14 C 92 18, 96 10, 100 8 L 100 40 L 5 40 Z"
                  },
                  {
                    label: "In Progress",
                    value: leads.filter(l => ["Contacted", "Follow-Up", "Interested", "Documents Pending", "Documents Received", "Under Verification", "Ready For Submission", "Visa Submitted"].includes(l.status)).length,
                    icon: FiClock,
                    trend: "↑ 8%",
                    up: true,
                    bgColor: "bg-[#eff6ff] dark:bg-sky-950/45",
                    textColor: "text-[#0284c7] dark:text-sky-400",
                    trendColor: "text-emerald-600 dark:text-emerald-500",
                    color: "#3b82f6",
                    linePath: "M 5 32 C 12 32, 18 35, 24 25 C 30 15, 36 32, 42 32 C 48 32, 54 18, 60 16 C 66 14, 72 25, 78 14 C 84 4, 92 14, 100 12",
                    areaPath: "M 5 32 C 12 32, 18 35, 24 25 C 30 15, 36 32, 42 32 C 48 32, 54 18, 60 16 C 66 14, 72 25, 78 14 C 84 4, 92 14, 100 12 L 100 40 L 5 40 Z"
                  },
                  {
                    label: "New Today",
                    value: leads.filter(l => l.dateCreated === new Date().toISOString().split("T")[0]).length,
                    icon: FiCalendar,
                    trend: "↓ 16%",
                    up: false,
                    bgColor: "bg-[#fef2f2] dark:bg-rose-950/45",
                    textColor: "text-[#ef4444] dark:text-rose-450",
                    trendColor: "text-rose-600 dark:text-rose-500",
                    color: "#ef4444",
                    linePath: "M 5 20 C 12 18, 18 35, 24 30 C 30 25, 36 22, 42 26 C 48 30, 54 28, 60 20 C 66 12, 72 35, 78 30 C 84 25, 92 28, 100 26",
                    areaPath: "M 5 20 C 12 18, 18 35, 24 30 C 30 25, 36 22, 42 26 C 48 30, 54 28, 60 20 C 66 12, 72 35, 78 30 C 84 25, 92 28, 100 26 L 100 40 L 5 40 Z"
                  },
                  {
                    label: "Meetings Booked",
                    value: meetings.length,
                    icon: FiCalendar,
                    trend: "↑ 15%",
                    up: true,
                    bgColor: "bg-[#faf5ff] dark:bg-purple-950/45",
                    textColor: "text-[#7c3aed] dark:text-purple-400",
                    trendColor: "text-emerald-600 dark:text-emerald-500",
                    color: "#a855f7",
                    linePath: "M 5 32 C 15 32, 25 30, 35 28 C 45 26, 55 24, 65 18 C 75 12, 85 14, 95 8 C 97 6, 99 5, 100 4",
                    areaPath: "M 5 32 C 15 32, 25 30, 35 28 C 45 26, 55 24, 65 18 C 75 12, 85 14, 95 8 C 97 6, 99 5, 100 4 L 100 40 L 5 40 Z"
                  },
                ].map((kpi, i) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_4px_25px_-2px_rgba(0,0,0,0.08)] transition-all duration-300 flex gap-4 items-start"
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${kpi.bgColor} ${kpi.textColor}`}>
                        <Icon className="text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-350">{kpi.label}</span>
                          <span className={`text-[12px] font-semibold ${kpi.trendColor}`}>{kpi.trend}</span>
                        </div>
                        <div className="flex items-end justify-between mt-1">
                          <div className="flex flex-col">
                            <span className="text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none mt-1">
                              {kpi.value.toLocaleString()}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2">vs. last period</span>
                          </div>
                          <div className="w-[100px] h-10 shrink-0 relative overflow-visible">
                            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                              <defs>
                                <linearGradient id={`sparkline-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={kpi.color} stopOpacity="0.25" />
                                  <stop offset="100%" stopColor={kpi.color} stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              <path
                                d={kpi.areaPath}
                                fill={`url(#sparkline-grad-${i})`}
                              />
                              <path
                                d={kpi.linePath}
                                fill="none"
                                stroke={kpi.color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lead detail split-screen */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch h-[600px]">
                
                {/* Leads list (reusable DataTable) */}
                <div className="xl:col-span-3 flex flex-col h-full">
                  <DataTable
                    className="h-full flex flex-col"
                    rows={leads.filter(l =>
                      (statusFilter === "Dropped" ? l.status === "Dropped" : l.status !== "Dropped") &&
                      (statusFilter === "All" || l.status === statusFilter) &&
                      (countryFilter === "All" || l.country === countryFilter) &&
                      (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm))
                    )}
                    getRowId={(l) => l.id}
                    onRowClick={(l) => setSelectedLeadId(l.id)}
                    selectedRowId={selectedLeadId}
                    title="Lead List"
                    search={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Search name or phone…"
                    filters={
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Status:</span>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 text-gray-750 dark:text-slate-250 text-[11px] rounded-lg py-1 px-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="All">All Statuses</option>
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
                            <option value="Dropped">Dropped</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Destination:</span>
                          <select
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 text-gray-750 dark:text-slate-250 text-[11px] rounded-lg py-1 px-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="All">All Countries</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                            <option value="Canada">Canada</option>
                            <option value="Europe">Europe</option>
                          </select>
                        </div>
                      </>
                    }
                    onExport={() =>
                      exportRowsToCsv(
                        "leads",
                        ["#", "Name", "Phone", "Destination", "Visa Class", "Doc %", "Status", "Counselor"],
                        leads
                          .filter(l =>
                            (statusFilter === "Dropped" ? l.status === "Dropped" : l.status !== "Dropped") &&
                            (statusFilter === "All" || l.status === statusFilter) &&
                            (countryFilter === "All" || l.country === countryFilter) &&
                            (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm))
                          )
                          .map((l, i) => [i + 1, l.name, l.phone, l.country, l.visaType, `${Math.round(docProgress(l.checklist))}%`, l.status, l.counselor])
                      )
                    }
                    columns={[
                      {
                        header: "Lead",
                        render: (lead) => (
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 dark:text-slate-100 text-[13px] truncate">{lead.name}</div>
                            <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium block max-w-[180px] truncate">
                              {getLeadDescription(lead)}
                            </span>
                          </div>
                        ),
                      },
                      {
                        header: "Service",
                        render: (lead) => (
                          <span className="font-medium text-gray-600 dark:text-slate-300 text-[13px] whitespace-nowrap">
                            {lead.visaType}
                          </span>
                        ),
                      },
                      {
                        header: "Doc Verification",
                        render: (lead) => {
                          const pct = docProgress(lead.checklist);
                          const filledCount = pct === 0 ? 0 : Math.ceil(pct / 25);
                          return (
                            <div className="min-w-[120px] flex items-center justify-start h-full">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1 w-[76px]">
                                  {[1, 2, 3, 4].map((seg) => (
                                    <div
                                      key={seg}
                                      className={`h-2 flex-1 rounded-[1.5px] ${
                                        seg <= filledCount
                                          ? "bg-emerald-500"
                                          : "bg-gray-200 dark:bg-slate-800"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[12px] font-bold text-gray-500 dark:text-slate-400 tabular-nums">
                                  {Math.round(pct)}%
                                </span>
                              </div>
                            </div>
                          );
                        },
                      },
                      {
                        header: "Status",
                        render: (lead) => {
                          const getStatusSelectClasses = (status: string) => {
                            switch (status) {
                              case "New Lead":
                                return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60";
                              case "Contacted":
                                return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60";
                              case "Follow-Up":
                                return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";
                              case "Interested":
                                return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60";
                              case "Documents Pending":
                                return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60";
                              case "Documents Received":
                                return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60";
                              case "Under Verification":
                                return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60";
                              case "Ready For Submission":
                                return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-800/60";
                              case "Visa Submitted":
                                return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60";
                              case "Approved / Rejected":
                                return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60";
                              case "Closed":
                                return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800/60";
                              case "Dropped":
                                return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60";
                              default:
                                return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/60";
                            }
                          };
                          return (
                            <select
                              value={lead.status}
                              data-status={lead.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value as VisaStatus)}
                              disabled={!canModifyLeads}
                              className="appearance-none py-0.5 px-2.5 text-[11px] font-semibold rounded-full border cursor-pointer focus:outline-none transition-all duration-150 status-select-pill"
                            >
                              <option value="New Lead" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">New Lead</option>
                              <option value="Contacted" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Contacted</option>
                              <option value="Follow-Up" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Follow-Up</option>
                              <option value="Interested" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Interested</option>
                              <option value="Documents Pending" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Documents Pending</option>
                              <option value="Documents Received" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Documents Received</option>
                              <option value="Under Verification" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Under Verification</option>
                              <option value="Ready For Submission" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Ready For Submission</option>
                              <option value="Visa Submitted" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Visa Submitted</option>
                              <option value="Approved / Rejected" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Approved / Rejected</option>
                              <option value="Closed" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Closed</option>
                              <option value="Dropped" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Dropped</option>
                            </select>
                          );
                        },
                      },
                      {
                        header: "Counselor",
                        render: (lead) => (
                          <select
                            value={lead.counselor}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => assignCounselor(lead.id, e.target.value)}
                            disabled={!canModifyLeads}
                            className="appearance-none py-0.5 px-2.5 text-[11px] font-medium rounded-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 focus:outline-none text-gray-600 dark:text-slate-300 cursor-pointer hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-150"
                          >
                            <option value="Unassigned" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Unassigned</option>
                            <option value="Priya Mehta" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Priya Mehta</option>
                            <option value="Rohit Verma" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Rohit Verma</option>
                            <option value="Simran Kaur" className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50">Simran Kaur</option>
                          </select>
                        ),
                      },
                      {
                        header: "Last Contact",
                        render: (lead) => (
                          <span className="text-gray-500 dark:text-slate-400 text-[12px] font-medium whitespace-nowrap">
                            {timeAgo(lead.lastUpdated)}
                          </span>
                        ),
                      },
                    ]}
                    actions={(lead) => [
                      {
                        icon: FiPhone,
                        title: "Call",
                        onClick: (l) => window.open(`tel:${l.phone}`),
                      },
                      {
                        icon: FaWhatsapp,
                        title: "WhatsApp",
                        onClick: (l) =>
                          window.open(
                            `https://wa.me/${l.phone.replace(/[^0-9]/g, "")}`,
                            "_blank"
                          ),
                      },
                      {
                        icon: FiMail,
                        title: "Email",
                        onClick: (l) => window.open(`mailto:${l.email}`),
                      },
                    ]}
                    emptyText="No leads match your filters."
                  />
                </div>

                {/* Lead Detail Panel Side Card */}
                {selectedLead && (
                  <div className="xl:col-span-1 bg-white dark:bg-slate-900/50 border border-gray-200/70 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none p-5 flex flex-col h-full space-y-5 overflow-y-auto">
                    <div className="space-y-5">
                      {/* Details header */}
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate leading-snug">{selectedLead.name}</h4>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold tracking-wider uppercase block truncate mt-0.5">{selectedLead.id}</span>
                        </div>
                        <StatusPill status={selectedLead.status} />
                      </div>

                      {/* Dropdowns and Meta Fields */}
                      <div className="space-y-4 border-t border-gray-100 dark:border-slate-800/80 pt-4">
                        {/* Transition status */}
                        <div className="space-y-1.5">
                          <label className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block">Transition Status</label>
                          <select
                            value={selectedLead.status}
                            onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as VisaStatus)}
                            disabled={!canModifyLeads}
                            className="w-full bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
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

                        {/* Assigned counselor */}
                        <div className="space-y-1.5">
                          <label className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block">Assigned Counselor</label>
                          <select
                            value={selectedLead.counselor}
                            onChange={(e) => assignCounselor(selectedLead.id, e.target.value)}
                            disabled={!canModifyLeads}
                            className="w-full bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                          >
                            <option value="Unassigned">Unassigned</option>
                            <option value="Priya Mehta">Priya Mehta</option>
                            <option value="Rohit Verma">Rohit Verma</option>
                            <option value="Simran Kaur">Simran Kaur</option>
                          </select>
                        </div>

                        {/* Contact details */}
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-slate-800/80 pt-4">
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider block">Email Address</span>
                            <span className="text-gray-700 dark:text-slate-200 text-[12px] font-bold select-all block mt-1 truncate">{selectedLead.email}</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider block">Contact Number</span>
                            <span className="text-gray-700 dark:text-slate-200 text-[12px] font-bold select-all block mt-1 truncate">{selectedLead.phone}</span>
                          </div>
                        </div>

                        {/* Counselor notes */}
                        <div className="space-y-1.5 border-t border-gray-100 dark:border-slate-800/80 pt-4">
                          <label className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block">Counselor File Notes</label>
                          <textarea
                            rows={3}
                            value={selectedLead.notes}
                            onChange={(e) => updateLeadNotes(selectedLead.id, e.target.value)}
                            disabled={!canModifyLeads}
                            placeholder="Type internal remarks here..."
                            className="w-full bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700 text-xs p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 dark:placeholder-slate-500 text-gray-700 dark:text-slate-200 resize-none h-[100px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Completed scans footer */}
                    <div className="p-4 bg-gray-50/50 dark:bg-slate-800/20 border border-gray-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider block">Completed Scans</span>
                        <span className="text-emerald-500 dark:text-emerald-400 font-bold text-sm mt-0.5 block">
                          {Object.values(selectedLead.checklist).filter(Boolean).length} / {Object.values(selectedLead.checklist).length} Files
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentTab("Checklist");
                          setSelectedLeadId(selectedLead.id);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-xs inline-flex items-center gap-1"
                      >
                        Review Vault →
                      </button>
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
              <DataTable
                title="Pending Follow-Ups"
                rows={leads.filter(l => ["Follow-Up", "Contacted", "Interested"].includes(l.status))}
                getRowId={(l) => l.id}
                onExport={() =>
                  exportRowsToCsv(
                    "follow-ups",
                    ["#", "Name", "Visa Type", "Status", "Notes", "Counselor"],
                    leads
                      .filter(l => ["Follow-Up", "Contacted", "Interested"].includes(l.status))
                      .map((l, i) => [i + 1, l.name, `${l.country} - ${l.visaType}`, l.status, l.notes || "", l.counselor])
                  )
                }
                columns={[
                  {
                    header: "Name",
                    render: (lead) => (
                      <span className="font-semibold text-gray-900 dark:text-slate-100 text-[13px]">{lead.name}</span>
                    ),
                  },
                  { header: "Visa Type", render: (lead) => <span className="text-gray-600 dark:text-slate-300">{lead.country} - {lead.visaType}</span> },
                  { header: "Last Status", render: (lead) => <StatusPill status={lead.status} /> },
                  { header: "File Notes Log", render: (lead) => <span className="text-gray-500 truncate max-w-xs block">{lead.notes || "No notes yet..."}</span> },
                  { header: "Counselor", render: (lead) => <span className="text-gray-600 dark:text-slate-300 font-medium">{lead.counselor}</span> },
                ]}
                actions={(lead) => [
                  { icon: FiEye, title: "View file", onClick: (l) => { setCurrentTab("Leads"); setSelectedLeadId(l.id); } },
                  { icon: FiPhone, title: "Call", onClick: (l) => window.open(`tel:${l.phone}`) },
                  { icon: FaWhatsapp, title: "Message", onClick: (l) => window.open(`https://wa.me/${l.phone.replace(/[^0-9]/g, "")}`, "_blank") },
                  { icon: FiMail, title: "Email", onClick: (l) => window.open(`mailto:${l.email}`) },
                ]}
                emptyText="No leads need follow-up right now."
              />

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
                    className={`country-desk-card p-6 border rounded-2xl flex flex-col justify-between text-left transition-all ${
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
              <DataTable
                title={countryFilter === "All" ? "Select a country above to filter files" : `${countryFilter} Desk - File Registrations`}
                rows={leads.filter(l => l.status !== "Dropped" && (countryFilter === "All" || l.country === countryFilter))}
                getRowId={(l) => l.id}
                onExport={() =>
                  exportRowsToCsv(
                    `${countryFilter.toLowerCase()}-files`,
                    ["#", "Client Name", "Sub Visa Type", "Status", "Counselor"],
                    leads
                      .filter(l => l.status !== "Dropped" && (countryFilter === "All" || l.country === countryFilter))
                      .map((l, i) => [i + 1, l.name, l.visaType, l.status, l.counselor])
                  )
                }
                columns={[
                  {
                    header: "Client Name",
                    render: (lead) => (
                      <span className="font-semibold text-gray-900 dark:text-slate-100 text-[13px]">{lead.name}</span>
                    ),
                  },
                  { header: "Sub Visa Type", render: (lead) => <span className="text-gray-600 dark:text-slate-300">{lead.visaType}</span> },
                  { header: "Workflow Status", render: (lead) => <StatusPill status={lead.status} /> },
                  ...(countryFilter === "Canada"
                    ? [{
                        header: "Biometrics Scan",
                        render: (lead: typeof leads[number]) =>
                          lead.checklist.biometricsCompleted
                            ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Completed</span>
                            : <span className="text-amber-600 dark:text-amber-400 font-semibold">Pending Call</span>,
                      }]
                    : []),
                  ...(countryFilter === "USA"
                    ? [{
                        header: "Interview Booking",
                        render: (lead: typeof leads[number]) =>
                          lead.usaSlots?.interviewScheduled
                            ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{lead.usaSlots?.interviewDate}</span>
                            : <span className="text-amber-600 dark:text-amber-400 font-semibold">Not Booked</span>,
                      }]
                    : []),
                  { header: "Counselor", render: (lead) => <span className="text-gray-600 dark:text-slate-300 font-medium">{lead.counselor}</span> },
                ]}
                actions={(lead) => [
                  lead.country === "USA"
                    ? { icon: FiGlobe, title: "Manage slots", onClick: () => setCurrentTab("USASlots") }
                    : { icon: FiEye, title: "View file", onClick: (l) => { setCurrentTab("Leads"); setSelectedLeadId(l.id); } },
                  { icon: FiPhone, title: "Call", onClick: (l) => window.open(`tel:${l.phone}`) },
                  { icon: FaWhatsapp, title: "Message", onClick: (l) => window.open(`https://wa.me/${l.phone.replace(/[^0-9]/g, "")}`, "_blank") },
                  { icon: FiMail, title: "Email", onClick: (l) => window.open(`mailto:${l.email}`) },
                ]}
                emptyText={countryFilter === "All" ? "Select a country desk above." : "No files in this desk yet."}
              />

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
                
                <div className="xl:col-span-2">
                  <DataTable
                    title="USA Client Profiles"
                    rows={leads.filter((l) => l.country === "USA" && l.status !== "Dropped")}
                    getRowId={(l) => l.id}
                    onRowClick={(l) => setSelectedLeadId(l.id)}
                    selectedRowId={selectedLeadId}
                    columns={[
                      {
                        header: "Name",
                        render: (lead) => (
                          <span className="font-semibold text-gray-900 dark:text-slate-100 text-[13px]">{lead.name}</span>
                        ),
                      },
                      {
                        header: "DS-160 Form",
                        render: (lead) => (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${lead.usaSlots?.ds160Submitted ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"}`}>
                            {lead.usaSlots?.ds160Submitted ? "Submitted" : "Pending"}
                          </span>
                        ),
                      },
                      {
                        header: "Embassy Fee Paid",
                        render: (lead) => (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${lead.usaSlots?.slotsPaid ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"}`}>
                            {lead.usaSlots?.slotsPaid ? "Fee Paid" : "Fee Unpaid"}
                          </span>
                        ),
                      },
                      {
                        header: "Slot Status",
                        render: (lead) => (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${lead.usaSlots?.slotsBooked ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"}`}>
                            {lead.usaSlots?.slotsBooked ? "Booked" : "No Booking"}
                          </span>
                        ),
                      },
                      {
                        header: "Interview Date",
                        render: (lead) => <span className="text-gray-600 dark:text-slate-300 font-medium">{lead.usaSlots?.interviewScheduled ? lead.usaSlots.interviewDate : "N/A"}</span>,
                      },
                    ]}
                    actions={(lead) => [
                      { icon: FiSettings, title: "Edit slot panel", onClick: (l) => setSelectedLeadId(l.id) },
                      { icon: FiPhone, title: "Call", onClick: (l) => window.open(`tel:${l.phone}`) },
                      { icon: FiMail, title: "Email", onClick: (l) => window.open(`mailto:${l.email}`) },
                    ]}
                    emptyText="No USA leads yet."
                  />
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
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
                
                {/* Active lead selector */}
                <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col h-[750px] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white">Active Audits</h3>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-600 dark:text-slate-400">
                      {leads.filter(l => l.status !== "Dropped").length} files
                    </span>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-2.5 text-slate-500 text-[11px]" />
                    <input
                      type="text"
                      placeholder="Search client profile..."
                      value={checklistSearch}
                      onChange={(e) => setChecklistSearch(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 bg-slate-950 border border-slate-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500/50 placeholder-slate-500"
                    />
                    {checklistSearch && (
                      <button
                        onClick={() => setChecklistSearch("")}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-350 cursor-pointer"
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
                            onClick={() => setSelectedLeadId(lead.id)}
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

                {/* Audit checklist pane */}
                {selectedLead && (
                  <div className="xl:col-span-2 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col h-[750px] space-y-6">
                    <div className="flex flex-col space-y-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">Compliance Checklist: {selectedLead.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Click to change state. Verified scans show verified icon.</p>
                        </div>
                        
                        <div className="p-1.5 px-2.5 bg-slate-950 border border-slate-900 rounded-lg text-[10px] font-semibold text-slate-400 select-all shrink-0">
                          ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                            {leads.filter(l => l.status !== "Dropped").findIndex(l => l.id === selectedLead.id) !== -1
                              ? leads.filter(l => l.status !== "Dropped").findIndex(l => l.id === selectedLead.id) + 1
                              : selectedLead.id}
                          </span>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-1 pb-2">
                      {(Object.keys(selectedLead.checklist) as (keyof DocumentChecklist)[]).map((key) => {
                        const value = selectedLead.checklist[key];
                        const doc = getLeadDocuments(selectedLead.id).find((d) => d.docType === key);
                        const rowKey = `${selectedLead.id}-${key}`;
                        const isUploading = uploadingKey === rowKey;
                        return (
                          <div
                            key={key}
                            className={`flex items-center justify-between p-3.5 border rounded-xl transition-all shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:shadow-sm ${
                              value
                                ? "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-500/30 shadow-[0_2px_8px_-3px_rgba(16,185,129,0.08)]"
                                : "bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-900"
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <span className={`text-xs font-bold capitalize block truncate ${value ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-400"}`}>
                                {key.replace(/([A-Z])/g, ' $1')}
                              </span>
                              {doc ? (
                                <div className="flex items-center mt-1">
                                  <a
                                    href={doc.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50 transition-colors truncate max-w-[170px]"
                                    title={doc.fileName}
                                  >
                                    <FaFileDownload className="text-[9px] shrink-0" />
                                    <span className="truncate">{doc.fileName}</span>
                                  </a>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 block mt-0.5">No file uploaded</span>
                              )}
                            </div>

                            <div className="shrink-0">
                              {value ? (
                                <span className="inline-flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                                  <FaCheckCircle className="text-xs" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <div className="flex items-center space-x-1.5">
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
                                        title: key.replace(/([A-Z])/g, ' $1'),
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
                  <div
                    key={meet.id}
                    className="meeting-card relative p-5 bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 border-l-4 rounded-2xl space-y-4 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                      <div className="min-w-0 pr-2">
                        <h4 className="text-[14px] font-extrabold text-slate-900 dark:text-slate-100 truncate leading-snug">{meet.clientName}</h4>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400 shrink-0" />
                          Host: {meet.counselorAssigned}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-800/40 rounded-lg text-violet-700 dark:text-violet-400 font-bold text-[10px] tracking-wide whitespace-nowrap">
                          <FaCalendarAlt className="text-[9px]" />
                          {meet.meetingDate}
                        </span>
                        {canModifyLeads && (
                          <button
                            onClick={() => {
                              setSelectedMeeting(meet);
                              setIsEditMeetingOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"

                          >
                            <FiSettings className="text-[11px]" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-xs flex-1">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">Reminder Details</span>
                        <p className="text-[12px] font-bold text-slate-700 dark:text-slate-250 mt-1 pl-2.5 border-l border-slate-200 dark:border-slate-800">{meet.reminderText}</p>
                      </div>
                      
                      {meet.notes && (
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">Agenda & Remarks</span>
                          <div className="mt-1 pl-2.5 border-l border-slate-200 dark:border-slate-800">
                            <p className="text-[11px] font-medium text-slate-655 dark:text-slate-400 italic bg-slate-50/50 dark:bg-slate-950/30 p-2 rounded-lg border border-slate-100/50 dark:border-slate-900/50 leading-relaxed">{meet.notes}</p>
                          </div>
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
              <DataTable
                title="Archived & Dropped Leads"
                rows={leads.filter((l) => l.status === "Dropped")}
                getRowId={(l) => l.id}
                onExport={() =>
                  exportRowsToCsv(
                    "dropped-leads",
                    ["#", "Client Name", "Destination", "Sub Visa Type", "Counselor", "Date Created"],
                    leads.filter((l) => l.status === "Dropped").map((l, i) => [i + 1, l.name, l.country, l.visaType, l.counselor, l.dateCreated])
                  )
                }
                columns={[
                  {
                    header: "Client Name",
                    render: (lead) => (
                      <span className="font-semibold text-gray-900 dark:text-slate-100 text-[13px]">{lead.name}</span>
                    ),
                  },
                  { header: "Destination Desk", render: (lead) => <span className="text-gray-600 dark:text-slate-300">{lead.country}</span> },
                  { header: "Sub Visa Type", render: (lead) => <span className="text-gray-500 dark:text-slate-400">{lead.visaType}</span> },
                  { header: "Last Counselor", render: (lead) => <span className="text-gray-600 dark:text-slate-300 font-medium">{lead.counselor}</span> },
                  { header: "Date Created", render: (lead) => <span className="text-gray-500 dark:text-slate-400">{lead.dateCreated}</span> },
                ]}
                actions={(lead) => [
                  { icon: FaUndo, title: "Re-activate lead", disabled: () => !canModifyLeads, onClick: (l) => restoreLead(l.id) },
                ]}
                actionsHeader="Restore"
                emptyText="Archive log is currently empty."
              />

            </div>
          )}

          {/* 11. STAFF DIRECTORY */}
          {currentTab === "Staff" && (
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

              {/* Roster profiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((staff, i) => (
                  <div key={staff.id || i} className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4 hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white uppercase">
                            {staff.name ? staff.name.split(" ").map(n => n[0]).join("") : "U"}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-100">{staff.name}</h4>
                            <span className="text-[10px] text-violet-400 font-bold block">{staff.role}</span>
                          </div>
                        </div>
                        {currentRole === "ADMIN" && staff.id !== "user-admin" && staff.role !== "ADMIN" && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${staff.name}'s account?`)) {
                                deleteUser(staff.id).then((res) => {
                                  if (res.ok) showToast("Account deleted successfully");
                                  else showToast(res.error || "Failed to delete account", "error");
                                });
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"

                          >
                            <FaTrash className="text-xs" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 text-xs pt-1 border-t border-slate-900">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Email Desk:</span>
                          <span className="text-slate-300 font-bold select-all">{staff.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Tab Access:</span>
                          <span className="text-violet-400 font-extrabold">{staff.allowedTabs ? staff.allowedTabs.length : 0} / 11 Tabs</span>
                        </div>
                      </div>
                    </div>

                    {currentRole === "ADMIN" && staff.role !== "ADMIN" && (
                      <button
                        onClick={() => {
                          setEditingStaff(staff);
                          const standardRoles = ["ADMIN", "COUNSELOR", "DOCUMENT TEAM", "VISA TEAM", "ACCOUNT TEAM", "MANAGER"];
                          if (standardRoles.includes(staff.role)) {
                            setEditStaffRole(staff.role);
                            setEditStaffCustomRole("");
                          } else {
                            setEditStaffRole("OTHER");
                            setEditStaffCustomRole(staff.role);
                          }
                          setIsEditStaffOpen(true);
                        }}
                        className="w-full mt-4 py-2 bg-slate-950 border border-slate-800 hover:border-violet-500/50 hover:bg-violet-950/10 text-slate-300 hover:text-violet-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Configure Access
                      </button>
                    )}
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

                showToast("Lead initialized successfully!");
                setIsAddLeadOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Client Full Name</label>
                  <input required name="name" placeholder="e.g. John Doe" type="text" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Contact Number</label>
                  <input required name="phone" placeholder="+91 99999 99999" type="text" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Email Address</label>
                <input required name="email" placeholder="e.g. john.doe@example.com" type="email" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" />
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
                  <input min="0" name="totalPackage" placeholder="50000 (optional)" type="number" className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-xl focus:outline-none" />
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
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
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
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
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
          <div className="w-full max-w-2xl bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
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
                      <table className="w-full text-left text-xs border-collapse">
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
                                      <a
                                        href={pay.invoiceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-1 text-[10px] font-bold text-violet-400 hover:text-violet-300 hover:underline"
                                      >
                                        <FaFileDownload className="text-[9px]" />
                                        <span className="truncate max-w-[120px]">{pay.invoiceFile || "Open"}</span>
                                      </a>
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
          <div className="w-full max-w-md bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
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
          <div className="w-full max-w-xl bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
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
          <div className="w-full max-w-xl bg-[#0a0a1a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
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

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center space-x-2.5 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 animate-fade-in ${
          toast.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
        }`}>
          {toast.type === "success" ? (
            <FaCheckCircle className="text-base shrink-0" />
          ) : (
            <FaInfoCircle className="text-base shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}


    </div>
  );
}
