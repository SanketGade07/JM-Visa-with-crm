"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCrm, VisaStatus, StaffRole, CountryType, LeadSource, DocumentChecklist, CrmUser, Lead, Meeting } from "@/context/CrmContext";
import { ROLE_TABS, userHasPermission } from "@/utils/crmConstants";
import { LEAD_STATUS_ORDER, getStatusLabel } from "@/utils/leadStatusConfig";
import { getDepositPickerLeads, getEligibleDepositLeads, getLeadPaymentSummary } from "@/utils/leadPaymentUtils";
import { getAssignableCounselorNames, UNASSIGNED_COUNSELOR } from "@/utils/counselorOptions";
import { isLeadAssignedToCounselor } from "@/utils/leadHelpers";
// @ts-ignore
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";

const LEAD_ID_PATTERN = /^\/leads\/([^/]+)$/;
const RESERVED_LEAD_SEGMENTS = new Set(["new"]);

export type AssignmentNotificationKind = "assignment" | "discussion";

export type AssignmentNotification = {
  leadId: string;
  leadName: string;
  assignedAt: string;
  // Distinguishes a lead assignment from a new discussion message. Optional so
  // previously stored notifications (which had no kind) keep working as before.
  kind?: AssignmentNotificationKind;
};

export type UsaSlotView = "available" | "paid";
export type SubmissionView = "ready" | "dispatched" | "approved" | "rejected";
export type PaymentsView = "ledger" | "desk-revenue";

const ASSIGNMENT_NOTIFICATIONS_KEY = "crm-assignment-notifications";

function readStoredNotifications(userId: string): AssignmentNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ASSIGNMENT_NOTIFICATIONS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Record<string, AssignmentNotification[]>;
    return Array.isArray(data[userId]) ? data[userId] : [];
  } catch {
    return [];
  }
}

function writeStoredNotifications(userId: string, items: AssignmentNotification[]) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ASSIGNMENT_NOTIFICATIONS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[userId] = items;
    localStorage.setItem(ASSIGNMENT_NOTIFICATIONS_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

function appendStoredNotification(
  userId: string,
  entry: AssignmentNotification
): AssignmentNotification[] {
  const prev = readStoredNotifications(userId);
  const withoutDup = prev.filter((n) => n.leadId !== entry.leadId);
  return [entry, ...withoutDup].slice(0, 50);
}

function findCounselorUser(users: CrmUser[], counselorName: string): CrmUser | undefined {
  const normalized = counselorName.trim().toLowerCase();
  if (!normalized || normalized === UNASSIGNED_COUNSELOR.toLowerCase()) return undefined;
  return users.find((user) => user.name.trim().toLowerCase() === normalized);
}

const ASSIGNMENT_LOGS_KEY = "crm-assignment-logs";

export type AssignmentLog = {
  leadId: string;
  leadName: string;
  assignedAt: string;
  counselorName: string;
};

function appendAssignmentLog(entry: AssignmentLog) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ASSIGNMENT_LOGS_KEY);
    const prev = raw ? (JSON.parse(raw) as AssignmentLog[]) : [];
    const next = [entry, ...prev].slice(0, 100);
    localStorage.setItem(ASSIGNMENT_LOGS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function getLeadIdFromPathname(pathname: string | null | undefined): string | null {
  const match = pathname?.match(LEAD_ID_PATTERN);
  if (!match) return null;
  const segment = decodeURIComponent(match[1]);
  if (RESERVED_LEAD_SEGMENTS.has(segment) || segment.endsWith("/edit")) return null;
  return segment;
}

export function useCrmLayoutState() {
  const {
    leads,
    meetings,
    users,
    currentUser,
    authUser,
    currentRole,
    currentTab,
    setCurrentTab,
    setCurrentRole,
    setCurrentUser,
    addUser,
    deleteUser,
    resetUserPassword,
    addLead,
    updateLeadStatus,
    updateUsaSlots,
    addPayment,
    setLeadPackage,
    updateAmountReceived,
    addMeeting,
    updateMeeting,
    deleteLead,
    deleteLeads,
    restoreLead,
    updateLeadNotes,
    updateLeadProfile,
    assignCounselor,
    updateEmploymentCategory,
    setLeadCredentials,
    setLeadDriveFolder,
    patchLeadDriveFolder,
    uploadDocument,
    removeDocument,
    uploadInvoice,
    getLeadDocuments,
    getLeadActivities,
    postLeadDiscussionMessage,
    toggleChecklistItem,
    updateLeadFromWizard,
  } = useCrm();

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const LEAD_DETAIL_TABS = ["details", "checklist", "drive", "settings"] as const;
  type LeadDetailTab = (typeof LEAD_DETAIL_TABS)[number];

  const parseLeadDetailTab = (value: string | null): LeadDetailTab => {
    if (value && LEAD_DETAIL_TABS.includes(value as LeadDetailTab)) {
      return value as LeadDetailTab;
    }
    return "details";
  };

  // Tabs the current user or active role is allowed to open
  const allowedTabs = ROLE_TABS[currentRole as StaffRole] ?? ["Dashboard"];
  const userAllowedTabs = currentUser?.allowedTabs ?? allowedTabs;

  // Role-based permission checks
  const isAdmin = currentRole === "ADMIN";
  const canViewLeads = userAllowedTabs.includes("Leads");
  const canModifyLeads = ["ADMIN", "COUNSELOR"].includes(currentRole) || userAllowedTabs.includes("Leads");
  const canEditCredentials = userAllowedTabs.includes("USASlots");
  const canSubmitVisa = ["ADMIN", "VISA TEAM"].includes(currentRole) || userAllowedTabs.includes("Submissions");
  const canManagePayments = ["ADMIN", "ACCOUNT TEAM"].includes(currentRole) || userAllowedTabs.includes("Payments");
  const canAssignLeads = !!currentUser;

  // Document checklist access is per-lead: admins have full privilege; any other
  // staff member can open/verify a lead's checklist only when that lead is
  // assigned to them. Pass the specific lead you're gating.
  const isAdminUser = currentRole === "ADMIN";
  const canAccessChecklistForLead = useCallback(
    (lead?: Lead | null): boolean => {
      if (isAdminUser) return true;
      if (!lead || !currentUser) return false;
      if (userAllowedTabs.includes("LeadDetails_Checklist")) return true;
      return isLeadAssignedToCounselor(lead, currentUser.name);
    },
    [isAdminUser, currentUser, userAllowedTabs]
  );

  const resolveLeadDetailTab = useCallback(
    (tab: LeadDetailTab, lead?: Lead | null): LeadDetailTab => {
      if (tab === "checklist" && !canAccessChecklistForLead(lead)) return "settings";
      return tab;
    },
    [canAccessChecklistForLead]
  );

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("visa_crm_user");
    localStorage.removeItem("visa_crm_auth_user");
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("crm_sidebar_collapsed") === "true";
    }
    return false;
  });

  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.classList.contains("light") ? "light" : "dark";
  });
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
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.classList.remove("light", "dark");
    root.classList.add(nextTheme);
    localStorage.setItem("crm-theme", nextTheme);
    setTheme(nextTheme);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("theme-switching");
      });
    });
  };

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    const onCrmToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; type?: "success" | "error" }>).detail;
      if (detail?.message) {
        showToast(detail.message, detail.type ?? "error");
      }
    };
    window.addEventListener("crm-toast", onCrmToast);
    return () => window.removeEventListener("crm-toast", onCrmToast);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable bridge from CrmContext sync errors
  }, []);

  useEffect(() => {
    if (toast) {
      const durationMs = toast.type === "error" ? 6000 : 5000;
      const timer = setTimeout(() => setToast(null), durationMs);
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

  const [statusFilter, setStatusFilter] = useState<string>("NEW_LEAD");
  const [usaSlotView, setUsaSlotView] = useState<UsaSlotView>("available");
  const [submissionView, setSubmissionView] = useState<SubmissionView>("ready");
  const [paymentsView, setPaymentsView] = useState<PaymentsView>("ledger");
  const [kpiFilter, setKpiFilter] = useState<string>("Total");
  const [countryFilter, setCountryFilter] = useState<string>("All");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [assignmentNotifications, setAssignmentNotifications] = useState<AssignmentNotification[]>([]);

  const [customDialog, setCustomDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "confirm" | "alert";
    onConfirm?: () => void;
    onClose?: () => void;
  } | null>(null);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setCustomDialog({
      isOpen: true,
      title,
      message,
      type: "confirm",
      onConfirm,
    });
  }, []);

  const showAlert = useCallback((title: string, message: string, onClose?: () => void) => {
    setCustomDialog({
      isOpen: true,
      title,
      message,
      type: "alert",
      onClose,
    });
  }, []);

  const closeCustomDialog = useCallback(() => {
    if (customDialog?.onClose) {
      customDialog.onClose();
    }
    setCustomDialog(null);
  }, [customDialog]);

  useEffect(() => {
    if (!currentUser?.id) {
      setAssignmentNotifications([]);
      return;
    }
    const stored = readStoredNotifications(currentUser.id);
    if (leads.length > 0) {
      const valid = stored.filter((n) => leads.some((l) => l.id === n.leadId && !l.isDeleted && l.status !== "DROPPED"));
      if (valid.length !== stored.length) {
        writeStoredNotifications(currentUser.id, valid);
        setAssignmentNotifications(valid);
        return;
      }
    }
    setAssignmentNotifications(stored);
  }, [currentUser?.id, leads]);

  const pushAssignmentNotificationForCounselor = useCallback(
    (
      counselorName: string,
      leadId: string,
      leadName?: string,
      kind: AssignmentNotificationKind = "assignment"
    ) => {
      const counselorUser = findCounselorUser(users, counselorName);
      if (!counselorUser) return;

      const name = leadName ?? leads.find((l) => l.id === leadId)?.name ?? "Lead";
      const entry: AssignmentNotification = {
        leadId,
        leadName: name,
        assignedAt: new Date().toISOString(),
        kind,
      };

      const next = appendStoredNotification(counselorUser.id, entry);
      writeStoredNotifications(counselorUser.id, next);

      if (currentUser?.id === counselorUser.id) {
        setAssignmentNotifications(next);
      }
    },
    [users, leads, currentUser?.id]
  );

  const pushAssignmentNotificationForAdmin = useCallback(
    (leadId: string, leadName?: string, kind: AssignmentNotificationKind = "assignment") => {
      const name = leadName ?? leads.find((l) => l.id === leadId)?.name ?? "Lead";
      const entry: AssignmentNotification = {
        leadId,
        leadName: name,
        assignedAt: new Date().toISOString(),
        kind,
      };

      const admins = users.filter((u) => u.role === "ADMIN");
      admins.forEach((admin) => {
        const next = appendStoredNotification(admin.id, entry);
        writeStoredNotifications(admin.id, next);

        if (currentUser?.id === admin.id) {
          setAssignmentNotifications(next);
        }
      });
    },
    [users, leads, currentUser?.id]
  );

  // Route a new lead-discussion message to the right recipient. There is exactly
  // one Admin: any non-admin message notifies the Admin, while an Admin message
  // notifies only the lead's assigned counselor/owner. The sender is never
  // notified, and an unassigned lead produces no notification when the Admin
  // posts. Per-lead de-duplication is handled by appendStoredNotification.
  const notifyDiscussionMessage = useCallback(
    (leadId: string) => {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return;

      const senderIsAdmin = (currentUser?.role ?? currentRole) === "ADMIN";

      if (!senderIsAdmin) {
        // Non-admin → Admin only (skip if the sender somehow resolves to the Admin).
        const admin = users.find((u) => u.role === "ADMIN");
        if (!admin || admin.id === currentUser?.id) return;
        pushAssignmentNotificationForAdmin(leadId, lead.name, "discussion");
        return;
      }

      // Admin → the assigned counselor/owner only.
      const counselorUser = findCounselorUser(users, lead.counselor);
      if (!counselorUser || counselorUser.id === currentUser?.id) return;
      pushAssignmentNotificationForCounselor(lead.counselor, leadId, lead.name, "discussion");
    },
    [
      leads,
      users,
      currentUser?.id,
      currentUser?.role,
      currentRole,
      pushAssignmentNotificationForAdmin,
      pushAssignmentNotificationForCounselor,
    ]
  );

  // Post the message through the existing flow, then fan out a single role-based
  // notification only when a message was actually created. The chat UI keeps
  // calling postLeadDiscussionMessage unchanged.
  const wrappedPostLeadDiscussionMessage = useCallback(
    async (leadId: string, content: string) => {
      const trimmed = content.trim();
      await postLeadDiscussionMessage(leadId, content);
      if (!trimmed) return;
      notifyDiscussionMessage(leadId);
    },
    [postLeadDiscussionMessage, notifyDiscussionMessage]
  );

  const dismissAssignmentNotification = useCallback(
    (leadId: string) => {
      if (!currentUser?.id) return;
      setAssignmentNotifications((prev) => {
        const next = prev.filter((n) => n.leadId !== leadId);
        writeStoredNotifications(currentUser.id, next);
        return next;
      });
    },
    [currentUser?.id]
  );

  const clearAssignmentNotifications = useCallback(() => {
    if (!currentUser?.id) return;
    setAssignmentNotifications([]);
    writeStoredNotifications(currentUser.id, []);
  }, [currentUser?.id]);

  const wrappedAssignCounselor = useCallback(
    (leadId: string, counselor: string) => {
      if (!canAssignLeads) return;
      const prev = leads.find((l) => l.id === leadId);
      assignCounselor(leadId, counselor);
      if (prev && prev.counselor !== counselor) {
        pushAssignmentNotificationForCounselor(counselor, leadId, prev.name);
        appendAssignmentLog({
          leadId,
          leadName: prev.name,
          assignedAt: new Date().toISOString(),
          counselorName: counselor,
        });
      }
    },
    [assignCounselor, leads, canAssignLeads, pushAssignmentNotificationForCounselor]
  );

  const wrappedAddLead = useCallback(
    async (newLeadData: Parameters<typeof addLead>[0]): Promise<string | null> => {
      const newId = await addLead(newLeadData);
      if (!newId) return null;
      const counselor = newLeadData.counselor?.trim();
      if (counselor) {
        pushAssignmentNotificationForCounselor(
          counselor,
          newId,
          newLeadData.name
        );
        appendAssignmentLog({
          leadId: newId,
          leadName: newLeadData.name,
          assignedAt: new Date().toISOString(),
          counselorName: counselor,
        });
      }
      return newId;
    },
    [addLead, pushAssignmentNotificationForCounselor]
  );

  const assignedLeadCount = useMemo(() => {
    if (!currentUser || currentUser.role !== "COUNSELOR") return 0;
    return leads.filter(
      (lead) =>
        !lead.isDeleted &&
        lead.status !== "DROPPED" &&
        isLeadAssignedToCounselor(lead, currentUser.name)
    ).length;
  }, [leads, currentUser]);

  const [leadDetailTab, setLeadDetailTabState] = useState<LeadDetailTab>("details");

  const isLeadsListRoute = pathname === "/leads";
  const isLeadNewRoute = pathname === "/leads/new";
  const isLeadDetailRoute = getLeadIdFromPathname(pathname) !== null;
  const isLeadChecklistRoute = Boolean(pathname?.match(/^\/checklist\/([^/]+)$/));

  const openLeadDetail = useCallback(
    (
      leadId: string,
      tab: LeadDetailTab = "details",
      options?: { created?: boolean }
    ) => {
      const lead = leads.find((l) => l.id === leadId) ?? null;
      const resolvedTab = resolveLeadDetailTab(tab, lead);
      setSelectedLeadId(leadId);
      setLeadDetailTabState(resolvedTab);
      setCurrentTab("Leads");
      const createdQuery = options?.created ? "&created=1" : "";
      router.push(
        `/leads/${encodeURIComponent(leadId)}?tab=${resolvedTab}${createdQuery}`
      );
    },
    [leads, router, setCurrentTab, resolveLeadDetailTab]
  );

  const openLeadChecklist = useCallback(
    (leadId: string) => {
      openLeadDetail(leadId, "checklist");
    },
    [openLeadDetail]
  );

  const navigateToTab = useCallback(
    (tab: string) => {
      setCurrentTab(tab);
      setIsMobileChecklistOpen(false);
      if (pathname?.startsWith("/checklist/") || pathname?.startsWith("/leads")) {
        router.push(tab === "Leads" ? "/leads" : "/");
      }
    },
    [router, setCurrentTab, pathname]
  );

  const closeLeadDetail = useCallback(() => {
    setCurrentTab("Leads");
    router.push("/leads");
  }, [router, setCurrentTab]);

  const closeLeadChecklist = useCallback(() => {
    closeLeadDetail();
  }, [closeLeadDetail]);

  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  const [createLeadSession, setCreateLeadSession] = useState(0);

  const [isCreateUsaLeadOpen, setIsCreateUsaLeadOpen] = useState(false);
  const [createUsaLeadSession, setCreateUsaLeadSession] = useState(0);

  const openCreateLead = useCallback(() => {
    if (!canModifyLeads) return;
    setCurrentTab("Leads");
    setIsCreateUsaLeadOpen(false);
    setCreateLeadSession((session) => session + 1);
    setIsCreateLeadOpen(true);
  }, [canModifyLeads, setCurrentTab]);

  const closeCreateLead = useCallback(() => {
    setIsCreateLeadOpen(false);
  }, []);

  const openCreateUsaLead = useCallback(() => {
    if (!canModifyLeads) return;
    setCurrentTab("USASlots");
    setIsCreateLeadOpen(false);
    setCreateUsaLeadSession((session) => session + 1);
    setIsCreateUsaLeadOpen(true);
  }, [canModifyLeads, setCurrentTab]);

  const closeCreateUsaLead = useCallback(() => {
    setIsCreateUsaLeadOpen(false);
  }, []);

  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  const [editLeadSession, setEditLeadSession] = useState(0);

  const openEditLead = useCallback(() => {
    if (!canModifyLeads) return;
    setEditLeadSession((session) => session + 1);
    setIsEditLeadOpen(true);
  }, [canModifyLeads]);

  const closeEditLead = useCallback(() => {
    setIsEditLeadOpen(false);
  }, []);

  const setLeadDetailTab = useCallback(
    (tab: LeadDetailTab) => {
      const lead = selectedLeadId
        ? leads.find((l) => l.id === selectedLeadId) ?? null
        : null;
      const resolvedTab = resolveLeadDetailTab(tab, lead);
      setLeadDetailTabState(resolvedTab);
      if (!selectedLeadId) return;
      if (!getLeadIdFromPathname(pathname)) return;
      router.push(`/leads/${encodeURIComponent(selectedLeadId)}?tab=${resolvedTab}`);
    },
    [leads, router, pathname, selectedLeadId, resolveLeadDetailTab]
  );

  useEffect(() => {
    const match = pathname?.match(/^\/checklist\/([^/]+)$/);
    if (!match) return;

    const leadId = decodeURIComponent(match[1]);
    const lead = leads.find((l) => l.id === leadId) ?? null;
    const tab = resolveLeadDetailTab("checklist", lead);
    router.replace(`/leads/${encodeURIComponent(leadId)}?tab=${tab}`);
  }, [leads, pathname, router, resolveLeadDetailTab]);

  useEffect(() => {
    if (pathname === "/leads" || pathname === "/leads/new") {
      setCurrentTab("Leads");
      setSelectedLeadId(null);
    }
  }, [pathname, setCurrentTab]);

  useEffect(() => {
    if (pathname === "/leads/new") {
      router.replace("/leads");
    }
  }, [pathname, router]);

  useEffect(() => {
    const leadId = getLeadIdFromPathname(pathname);
    if (!leadId) {
      setSelectedLeadId((prev) => (prev !== null ? null : prev));
      return;
    }

    if (!canViewLeads) {
      router.replace("/");
      return;
    }

    const lead = leads.find((l) => l.id === leadId) ?? null;
    if (!lead) return;

    const requestedTab = parseLeadDetailTab(searchParams.get("tab"));
    const resolvedTab = resolveLeadDetailTab(requestedTab, lead);

    setSelectedLeadId(leadId);
    setCurrentTab("Leads");
    setLeadDetailTabState(resolvedTab);

    if (resolvedTab !== requestedTab) {
      router.replace(`/leads/${encodeURIComponent(leadId)}?tab=${resolvedTab}`);
    }
  }, [pathname, leads, setCurrentTab, searchParams, canViewLeads, router, resolveLeadDetailTab]);

  // Modals
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
  const leadsExportRef = useRef<(() => void) | null>(null);
  const usaSlotsExportRef = useRef<(() => void) | null>(null);
  const droppedLeadsExportRef = useRef<(() => void) | null>(null);
  const paymentsExportRef = useRef<(() => void) | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const registerLeadsExport = useCallback((fn: (() => void) | null) => {
    leadsExportRef.current = fn;
  }, []);

  const exportLeadsCsv = useCallback(() => {
    leadsExportRef.current?.();
  }, []);

  const registerUsaSlotsExport = useCallback((fn: (() => void) | null) => {
    usaSlotsExportRef.current = fn;
  }, []);

  const exportUsaSlotsCsv = useCallback(() => {
    usaSlotsExportRef.current?.();
  }, []);

  const registerDroppedLeadsExport = useCallback((fn: (() => void) | null) => {
    droppedLeadsExportRef.current = fn;
  }, []);

  const exportDroppedLeadsCsv = useCallback(() => {
    droppedLeadsExportRef.current?.();
  }, []);

  const registerPaymentsExport = useCallback((fn: (() => void) | null) => {
    paymentsExportRef.current = fn;
  }, []);

  const exportPaymentsCsv = useCallback(() => {
    paymentsExportRef.current?.();
  }, []);

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentsCountryFilter, setPaymentsCountryFilter] = useState("All");

  // Deposit Upload State
  const [profileDepositLeadId, setProfileDepositLeadId] = useState("");
  const [pickerDepositLeadId, setPickerDepositLeadId] = useState("");
  const [depositModalMode, setDepositModalMode] = useState<"profile" | "picker">("picker");
  const [tempInvoiceFile, setTempInvoiceFile] = useState("");
  const [tempInvoiceUrl, setTempInvoiceUrl] = useState("");
  // Google Drive file ID returned by the upload. Set only for uploaded invoices
  // (not pasted URL links); used to verify an upload fully completed before the
  // payment is logged, so the invoice can never be lost to the upload race.
  const [tempInvoiceFileId, setTempInvoiceFileId] = useState("");
  const [isUploadingTempInvoice, setIsUploadingTempInvoice] = useState(false);

  const openProfileDepositModal = useCallback((leadId: string) => {
    setProfileDepositLeadId(leadId);
    setDepositModalMode("profile");
    setTempInvoiceFile("");
    setTempInvoiceUrl("");
    setTempInvoiceFileId("");
    setIsAddPaymentOpen(true);
  }, []);

  const openPickerDepositModal = useCallback(() => {
    setPickerDepositLeadId("");
    setDepositModalMode("picker");
    setTempInvoiceFile("");
    setTempInvoiceUrl("");
    setTempInvoiceFileId("");
    setIsAddPaymentOpen(true);
  }, []);

  const closeDepositModal = useCallback(() => {
    setIsAddPaymentOpen(false);
    setProfileDepositLeadId("");
    setPickerDepositLeadId("");
    setDepositModalMode("picker");
    setTempInvoiceFile("");
    setTempInvoiceUrl("");
    setTempInvoiceFileId("");
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isAddPaymentOpen || depositModalMode !== "picker") return;

    const pickerLeads = getDepositPickerLeads(leads);
    const eligible = getEligibleDepositLeads(leads);

    setPickerDepositLeadId((current) => {
      if (current && pickerLeads.some((l) => l.id === current)) {
        return current;
      }
      return eligible.length > 0 ? eligible[0].id : pickerLeads[0]?.id ?? "";
    });
  }, [isAddPaymentOpen, leads, depositModalMode]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
          showToast(data.error || "Failed to load document", "error");
        }
      } catch {
        showToast("Network error loading document", "error");
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

  // Checklist access for the lead currently open in the detail view. Drives the
  // detail tab bars (which always operate on the selected lead). Per-lead/per-row
  // consumers should call canAccessChecklistForLead(lead) with their own lead.
  const canAccessLeadChecklist = canAccessChecklistForLead(selectedLead);
  const canVerifyDocs = canAccessLeadChecklist;

  // ── Real dashboard analytics (computed from live leads) ─────────────────────
  const activeLeads = leads.filter((l) => l.status !== "DROPPED");

  // Monthly chart: last 6 months, bucketed by lead creation date.
  // submissions = leads that reached submission stage; approvals = approved leads.
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
        sub: inMonth.filter((l) => l.status === "VISA_SUBMISSION" || l.status === "VISA_APPROVED").length,
        app: inMonth.filter((l) => l.status === "VISA_APPROVED").length,
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
      if (lead.isDeleted || lead.status === "DROPPED") return false;
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
    const counts: Record<string, { count: number; received: number; pending: number }> = {};
    filteredLeads.forEach((lead) => {
      const country = lead.country || "Unknown";
      if (!counts[country]) {
        counts[country] = { count: 0, received: 0, pending: 0 };
      }
      const summary = getLeadPaymentSummary(lead);
      counts[country].count += 1;
      counts[country].received += summary.received;
      counts[country].pending += summary.pending;
    });

    const sorted = Object.entries(counts)
      .map(([country, stats]) => ({
        country,
        count: stats.count,
        received: stats.received,
        pending: stats.pending,
      }))
      .sort((a, b) => b.count - a.count);

    const top11 = sorted.slice(0, 11);
    const othersList = sorted.slice(11);
    const othersCount = othersList.reduce((sum, item) => sum + item.count, 0);
    const othersReceived = othersList.reduce((sum, item) => sum + item.received, 0);
    const othersPending = othersList.reduce((sum, item) => sum + item.pending, 0);

    const result = [...top11];
    while (result.length < 11) {
      result.push({ country: "-", count: 0, received: 0, pending: 0 });
    }

    if (countrySortOrder === "asc") {
      result.sort((a, b) => a.count - b.count);
    } else {
      result.sort((a, b) => b.count - a.count);
    }

    result.push({
      country: "Others",
      count: othersCount,
      received: othersReceived,
      pending: othersPending,
    });
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
        setDateRangeEnd(dateRangeStart);
        setDateRangeStart(dateStr);
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
      const statuses = LEAD_STATUS_ORDER.filter((s) => s !== "DROPPED");
      return statuses.map(status => {
        const count = leads.filter(l => l.status === status).length;
        const pct = leads.length > 0 ? (count / leads.length) * 100 : 15 + (status.length * 7) % 45; // Fallback for aesthetic progress bars
        return { label: getStatusLabel(status), count, pct };
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
      const counselors = getAssignableCounselorNames(users);
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
      const approved = cLeads.filter(l => l.status === "VISA_APPROVED").length;
      const pending = cLeads.filter(l => l.status === "IN_PROGRESS" || l.status === "APPLICATION_PROCESSED" || l.status === "VISA_SUBMISSION").length;
      const newLeads = cLeads.filter(l => l.status === "NEW_LEAD").length;
      
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
    leads, meetings, users, currentUser, authUser, currentRole, currentTab, setCurrentTab,
    setCurrentRole, setCurrentUser, addUser, deleteUser, resetUserPassword, addLead: wrappedAddLead, updateLeadStatus,
    updateUsaSlots, addPayment, setLeadPackage, updateAmountReceived, addMeeting, updateMeeting, deleteLead, deleteLeads, restoreLead, updateLeadNotes,
    showConfirm, showAlert, closeCustomDialog, customDialog,
    updateLeadProfile, assignCounselor: wrappedAssignCounselor, updateEmploymentCategory, setLeadCredentials, setLeadDriveFolder, patchLeadDriveFolder, uploadDocument, removeDocument, uploadInvoice, getLeadDocuments, getLeadActivities, postLeadDiscussionMessage: wrappedPostLeadDiscussionMessage, toggleChecklistItem, updateLeadFromWizard,
    assignmentNotifications, dismissAssignmentNotification, clearAssignmentNotifications, assignedLeadCount,
    handleLogout, searchTerm, setSearchTerm, checklistSearch, setChecklistSearch,
    isMobileSidebarOpen, setIsMobileSidebarOpen, isMobileDetailOpen, setIsMobileDetailOpen,
    isMobileSlotSettingsOpen, setIsMobileSlotSettingsOpen, isMobileChecklistOpen, setIsMobileChecklistOpen,
    theme, setTheme, shouldAnimate, setShouldAnimate, getAnimClass, toggleTheme,
    toast, setToast, showToast, uploadingKey, setUploadingKey,
    urlModalData, setUrlModalData, pastedUrl, setPastedUrl, uploadError, setUploadError,
    invoiceLeadId, setInvoiceLeadId, urlInvoiceData, setUrlInvoiceData,
    pastedInvoiceUrl, setPastedInvoiceUrl, uploadInvoiceError, setUploadInvoiceError,
    uploadingInvoiceKey, setUploadingInvoiceKey, statusFilter, setStatusFilter,
    usaSlotView, setUsaSlotView,
    submissionView, setSubmissionView,
    paymentsView, setPaymentsView,
    kpiFilter, setKpiFilter, countryFilter, setCountryFilter,
    selectedLeadId, setSelectedLeadId,
    openLeadDetail, closeLeadDetail, leadDetailTab, setLeadDetailTab,
    openLeadChecklist, closeLeadChecklist, navigateToTab,
    isCreateLeadOpen, createLeadSession, openCreateLead, closeCreateLead,
    isCreateUsaLeadOpen, createUsaLeadSession, openCreateUsaLead, closeCreateUsaLead,
    isEditLeadOpen, editLeadSession, openEditLead, closeEditLead,
    isLeadsListRoute, isLeadNewRoute, isLeadDetailRoute, isLeadChecklistRoute,
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
    paymentsCountryFilter, setPaymentsCountryFilter,
    profileDepositLeadId, pickerDepositLeadId, setPickerDepositLeadId,
    depositModalMode, setDepositModalMode,
    openProfileDepositModal, openPickerDepositModal, closeDepositModal,
    tempInvoiceFile, setTempInvoiceFile,
    tempInvoiceUrl, setTempInvoiceUrl, tempInvoiceFileId, setTempInvoiceFileId,
    isUploadingTempInvoice, setIsUploadingTempInvoice,
    allowedTabs, userAllowedTabs, isAdmin, canViewLeads, canModifyLeads, canAssignLeads, canVerifyDocs, canAccessLeadChecklist,
    canAccessChecklistForLead,
    canEditCredentials, canSubmitVisa, canManagePayments,
    openSignedUrl, selectedLead, activeLeads, monthlyChart, chartMax, countryColors,
    countryStats, countryTotal, donutSegments, calendarData, filteredLeads,
    countryBarChartData, maxLeadsCount, yLabels, getCountryAbbreviation,
    handlePeriodChange, handleCalendarDateClick, getDaysInMonth, monthNames,
    leadsMgmtData, topCountryStats, pipelineStats, cardMap, modalMap,
    registerLeadsExport, exportLeadsCsv,
    registerUsaSlotsExport, exportUsaSlotsCsv,
    registerDroppedLeadsExport, exportDroppedLeadsCsv,
    registerPaymentsExport, exportPaymentsCsv,
    isSidebarCollapsed, setIsSidebarCollapsed,
  };
}

export type CrmLayoutState = ReturnType<typeof useCrmLayoutState>;
