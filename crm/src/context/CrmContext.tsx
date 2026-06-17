"use client";

import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import {
  DEFAULT_EMPLOYMENT_CATEGORY,
  getChecklistItemLabel,
  getChecklistKeysForLead,
  mergeChecklist,
  type EmploymentCategory,
} from "@/utils/documentChecklistConfig";
import { DEFAULT_USA_SLOTS } from "@/utils/normalizeLead";
import type { LeadStatus } from "@/utils/leadStatusConfig";

export type { EmploymentCategory } from "@/utils/documentChecklistConfig";

// ── Enums / union types ───────────────────────────────────────────────────────

export type VisaStatus = LeadStatus;

export type CountryType = string;

export type LeadSource =
  | "WEBSITE"
  | "REFERRAL"
  | "WALK_IN"
  | "SOCIAL_MEDIA"
  | "MANUAL";

export type StaffRole =
  | "ADMIN"
  | "COUNSELOR"
  | "DOCUMENT TEAM"
  | "VISA TEAM"
  | "ACCOUNT TEAM"
  | "MANAGER"
  | "OTHER";

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: StaffRole | string;
  allowedTabs: string[];
  createdAt: string;
}



// ── Interfaces ────────────────────────────────────────────────────────────────

export type DocumentChecklist = Record<string, boolean>;

export interface PaymentDetails {
  totalPackage: number;
  amountPaid: number;
  pendingAmount: number;
  paymentMethod: string;
  invoiceNumber: string;
  date: string;
  invoiceFile?: string;
  invoiceUrl?: string;
}

export interface UsaSlotTracking {
  credentialsProvided: boolean;
  slotsAvailable: boolean;
  slotsPaid: boolean;
  slotsBooked: boolean;
  ds160Submitted: boolean;
  interviewScheduled: boolean;
  interviewDate: string;
  slotLocation: string;
  paidDate: string;
  trackingMobile: string;
  securityCar: string;
  securityFood: string;
  securityCity: string;
  slotPortalUsername?: string;
  slotPortalPassword?: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: "status_change" | "note" | "call" | "email" | "document" | "lead_created" | "payment" | "discussion";
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Expense {
  id: string;
  category: "Office" | "Travel" | "Marketing" | "Government Fees" | "Staff" | "Other";
  amount: number;
  description: string;
  date: string;
  receipt?: string;
  createdBy: string;
  createdAt: string;
}

export interface Document {
  id: string;
  leadId: string;
  docType: string; // matches a DocumentChecklist key, e.g. "passport"
  fileName: string;
  fileUrl: string; // storage path (storage://...) or external URL
  status: "UPLOADED" | "VERIFIED" | "REJECTED";
  uploadedBy: string;
  uploadedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: CountryType;
  visaType: string;
  status: VisaStatus;
  source: LeadSource;
  counselor: string;
  dateCreated: string;
  employmentCategory?: EmploymentCategory;
  checklist: DocumentChecklist;
  payments: PaymentDetails[];
  usaSlots?: UsaSlotTracking;
  visaCredentials?: {
    username?: string;
    password?: string;
    portalUrl?: string;
  };
  driveFolderId?: string | null;
  notes: string;
  lastUpdated: string;
  isDeleted: boolean;
}

export interface Meeting {
  id: string;
  meetingDate: string;
  clientName: string;
  reminderText: string;
  counselorAssigned: string;
  notes: string;
}

// ── Context type ──────────────────────────────────────────────────────────────

interface CrmContextType {
  leads: Lead[];
  meetings: Meeting[];
  activities: Activity[];
  documents: Document[];
  users: CrmUser[];
  currentUser: CrmUser | null;
  currentRole: StaffRole | string;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  setCurrentRole: (role: StaffRole | string) => void;
  setCurrentUser: (user: CrmUser | null) => void;
  addUser: (user: Omit<CrmUser, "id" | "createdAt"> & { id?: string; password?: string; createdAt?: string }) => Promise<{ ok: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ ok: boolean; error?: string }>;
  addLead: (lead: Omit<Lead, "id" | "dateCreated" | "lastUpdated" | "isDeleted">) => string;
  updateLeadStatus: (leadId: string, status: VisaStatus) => void;
  updateEmploymentCategory: (leadId: string, category: EmploymentCategory) => void;
  toggleChecklistItem: (leadId: string, item: string) => void;
  updateUsaSlots: (leadId: string, slots: Partial<UsaSlotTracking>) => void;
  addPayment: (leadId: string, payment: Omit<PaymentDetails, "invoiceNumber" | "date">) => void;
  setLeadPackage: (leadId: string, totalPackage: number) => void;
  addMeeting: (meeting: Omit<Meeting, "id">) => void;
  updateMeeting: (meeting: Meeting) => void;
  deleteLead: (leadId: string) => void;
  restoreLead: (leadId: string) => void;
  updateLeadNotes: (leadId: string, notes: string) => void;
  updateLeadProfile: (
    leadId: string,
    patch: Partial<Pick<Lead, "email" | "country" | "visaType">>
  ) => void;
  assignCounselor: (leadId: string, counselor: string) => void;
  setLeadCredentials: (leadId: string, creds: { username?: string; password?: string; portalUrl?: string } | null) => Promise<boolean>;
  setLeadDriveFolder: (leadId: string, driveFolderId: string | null) => Promise<boolean>;
  patchLeadDriveFolder: (leadId: string, driveFolderId: string) => void;
  refreshLeads: () => Promise<void>;
  getLeadActivities: (leadId: string) => Activity[];
  postLeadDiscussionMessage: (leadId: string, content: string) => Promise<void>;
  uploadDocument: (leadId: string, docType: string, fileOrUrl: File | string) => Promise<{ ok: boolean; error?: string }>;
  uploadInvoice: (leadId: string, invoiceNumber: string, fileOrUrl: File | string) => Promise<{ ok: boolean; error?: string }>;
  getLeadDocuments: (leadId: string) => Document[];
}


// ── Helpers ─────────────────────────────────────────────────────────────────────

const isAssignedCounselor = (counselor: string) =>
  counselor.trim() !== "" && counselor !== "Unassigned";

const resolveStatusAfterCounselorChange = (
  status: VisaStatus,
  counselor: string
): VisaStatus => {
  if (isAssignedCounselor(counselor) && status === "NEW_LEAD") return "IN_PROGRESS";
  if (!isAssignedCounselor(counselor) && status === "IN_PROGRESS") return "NEW_LEAD";
  return status;
};

const TERMINAL_STATUSES: VisaStatus[] = [
  "VISA_SUBMISSION",
  "VISA_APPROVED",
  "VISA_REJECTED",
];

const resolveStatusAfterChecklistChange = (
  lead: Lead,
  updatedChecklist: DocumentChecklist
): VisaStatus => {
  if (lead.status === "DROPPED") return lead.status;

  const category = lead.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY;
  const requiredDocs = getChecklistKeysForLead(category);
  const allRequired = requiredDocs.every((key) => updatedChecklist[key]);

  if (allRequired && !TERMINAL_STATUSES.includes(lead.status)) {
    return "VISA_SUBMISSION";
  }
  if (!allRequired && lead.status === "VISA_SUBMISSION") {
    return "IN_PROGRESS";
  }
  return lead.status;
};

const formatChecklistItemName = (key: string) =>
  getChecklistItemLabel(key) ?? key.replace(/([A-Z])/g, " $1").replace(/_/g, " ");

// ── Provider ──────────────────────────────────────────────────────────────────

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<CrmUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CrmUser | null>(null);
  const [currentRole, setCurrentRole] = useState<StaffRole | string>("ADMIN");
  const [currentTab, setCurrentTab] = useState<string>("Dashboard");

  useEffect(() => {
    const loadData = async () => {
      // Restore the persisted user & role first
      const savedUserStr = localStorage.getItem("visa_crm_user");
      const savedRole = localStorage.getItem("visa_crm_role");
      
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          setCurrentUser(parsed);
          setCurrentRole(parsed.role);
        } catch {}
      } else if (savedRole) {
        setCurrentRole(savedRole as StaffRole);
      }

      try {
        const [leadsRes, meetingsRes, activitiesRes, documentsRes, usersRes] = await Promise.all([
          fetch("/api/leads?limit=1000"),
          fetch("/api/meetings"),
          fetch("/api/activities"),
          fetch("/api/documents"),
          fetch("/api/users"),
        ]);

        if (leadsRes.ok) {
          const data = await leadsRes.json();
          setLeads(Array.isArray(data) ? data : (data.leads ?? []));
        }
        if (meetingsRes.ok) setMeetings(await meetingsRes.json());
        if (activitiesRes.ok) setActivities(await activitiesRes.json());
        if (documentsRes.ok) setDocuments(await documentsRes.json());
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data);
          
          // Seed initial user object structure in state if matching email was stored
          if (savedUserStr) {
            try {
              const parsed = JSON.parse(savedUserStr);
              const matched = data.find((u: CrmUser) => u.id === parsed.id || u.email === parsed.email);
              if (matched) {
                setCurrentUser(matched);
                setCurrentRole(matched.role);
              }
            } catch {}
          }
        }
      } catch (error) {
        console.error("Failed to load CRM data:", error);
      }
    };


    loadData();
  }, []);

  // ── Persistence helpers ─────────────────────────────────────────────────────

  const syncLeads = async (updated: Lead[]) => {
    let merged = updated;
    setLeads((prev) => {
      merged = updated.map((lead) => {
        if (lead.driveFolderId) return lead;
        const fromPrev = prev.find((l) => l.id === lead.id);
        return fromPrev?.driveFolderId
          ? { ...lead, driveFolderId: fromPrev.driveFolderId }
          : lead;
      });
      return merged;
    });
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: merged }),
      });
    } catch (error) {
      console.error("Failed to sync leads:", error);
    }
  };

  const syncMeetings = async (updated: Meeting[]) => {
    setMeetings(updated);
    try {
      await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetings: updated }),
      });
    } catch (error) {
      console.error("Failed to sync meetings:", error);
    }
  };

  const logActivity = async (entry: Omit<Activity, "id" | "createdAt">) => {
    const activity: Activity = {
      ...entry,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [...prev, activity]);
    try {
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  // ── Lead operations ─────────────────────────────────────────────────────────

  const addLead = (newLeadData: Omit<Lead, "id" | "dateCreated" | "lastUpdated" | "isDeleted">): string => {
    const today = new Date().toISOString().split("T")[0];
    const category = newLeadData.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY;
    const status = resolveStatusAfterCounselorChange(newLeadData.status, newLeadData.counselor);
    const newLead: Lead = {
      ...newLeadData,
      employmentCategory: category,
      checklist: mergeChecklist(newLeadData.checklist, category),
      status,
      id: `lead-${Date.now()}`,
      dateCreated: today,
      lastUpdated: today,
      isDeleted: false,
    };
    void syncLeads([...leads, newLead]).then(async () => {
      try {
        const res = await fetch(`/api/leads/${newLead.id}/drive-create`, { method: "POST" });
        if (!res.ok) {
          console.error(
            "Drive folder provisioning failed for new lead:",
            newLead.id,
            await res.text()
          );
          return;
        }
        const data = await res.json();
        if (data.driveFolderId) {
          patchLeadDriveFolder(newLead.id, data.driveFolderId as string);
        }
      } catch (error) {
        console.error("Failed to create Drive folder for lead:", error);
      }
    });
    logActivity({
      leadId: newLead.id,
      type: "lead_created",
      content: `Lead created manually by ${currentRole}`,
      createdBy: currentRole,
    });
    if (status !== newLeadData.status) {
      logActivity({
        leadId: newLead.id,
        type: "status_change",
        content: `Status auto-set to "${status}" after counselor assignment`,
        createdBy: "SYSTEM",
      });
    }
    return newLead.id;
  };

  const updateLeadStatus = (leadId: string, status: VisaStatus) => {
    const today = new Date().toISOString().split("T")[0];
    const prev = leads.find((l) => l.id === leadId);
    const updated = leads.map((lead) =>
      lead.id === leadId ? { ...lead, status, lastUpdated: today } : lead
    );
    syncLeads(updated);
    if (prev && prev.status !== status) {
      logActivity({
        leadId,
        type: "status_change",
        content: `Status changed from "${prev.status}" to "${status}"`,
        createdBy: currentRole,
      });
    }
  };

  const updateLeadNotes = (leadId: string, notes: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = leads.map((lead) =>
      lead.id === leadId ? { ...lead, notes, lastUpdated: today } : lead
    );
    syncLeads(updated);
  };

  const updateLeadProfile = (
    leadId: string,
    patch: Partial<Pick<Lead, "email" | "country" | "visaType">>
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const prev = leads.find((l) => l.id === leadId);
    if (!prev) return;

    const updated = leads.map((lead) =>
      lead.id === leadId ? { ...lead, ...patch, lastUpdated: today } : lead
    );
    syncLeads(updated);

    if (patch.email !== undefined && patch.email !== prev.email) {
      logActivity({
        leadId,
        type: "note",
        content: "Email updated",
        createdBy: currentRole,
      });
    }
    if (patch.country !== undefined && patch.country !== prev.country) {
      logActivity({
        leadId,
        type: "note",
        content: `Country changed from "${prev.country}" to "${patch.country}"`,
        createdBy: currentRole,
      });
    }
    if (patch.visaType !== undefined && patch.visaType !== prev.visaType) {
      logActivity({
        leadId,
        type: "note",
        content: `Visa service type changed from "${prev.visaType}" to "${patch.visaType}"`,
        createdBy: currentRole,
      });
    }
  };

  const assignCounselor = (leadId: string, counselor: string) => {
    const today = new Date().toISOString().split("T")[0];
    const prev = leads.find((l) => l.id === leadId);
    const updated = leads.map((lead) => {
      if (lead.id !== leadId) return lead;
      const status = resolveStatusAfterCounselorChange(lead.status, counselor);
      return { ...lead, counselor, status, lastUpdated: today };
    });
    syncLeads(updated);
    if (prev && prev.counselor !== counselor) {
      logActivity({
        leadId,
        type: "note",
        content: `Counselor changed from "${prev.counselor}" to "${counselor}"`,
        createdBy: currentRole,
      });
      const newStatus = resolveStatusAfterCounselorChange(prev.status, counselor);
      if (newStatus !== prev.status) {
        logActivity({
          leadId,
          type: "status_change",
          content: `Status auto-updated from "${prev.status}" to "${newStatus}" after counselor assignment`,
          createdBy: "SYSTEM",
        });
      }
    }
  };

  const updateEmploymentCategory = (leadId: string, category: EmploymentCategory) => {
    const today = new Date().toISOString().split("T")[0];
    const prev = leads.find((l) => l.id === leadId);
    const updated = leads.map((lead) => {
      if (lead.id !== leadId) return lead;
      const checklist = mergeChecklist(lead.checklist, category);
      const status = resolveStatusAfterChecklistChange(
        { ...lead, employmentCategory: category, checklist },
        checklist
      );
      return {
        ...lead,
        employmentCategory: category,
        checklist,
        status,
        lastUpdated: today,
      };
    });
    syncLeads(updated);
    if (prev && prev.employmentCategory !== category) {
      logActivity({
        leadId,
        type: "document",
        content: `Employment category changed to "${category.replace(/_/g, " ")}"`,
        createdBy: currentRole,
      });
      const updatedLead = updated.find((l) => l.id === leadId);
      if (updatedLead && updatedLead.status !== prev.status) {
        logActivity({
          leadId,
          type: "status_change",
          content: `Status auto-updated to "${updatedLead.status}" after employment category change`,
          createdBy: "SYSTEM",
        });
      }
    }
  };

  const toggleChecklistItem = (leadId: string, item: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = leads.map((lead) => {
      if (lead.id !== leadId) return lead;

      const updatedChecklist = { ...lead.checklist, [item]: !lead.checklist[item] };
      const newStatus = resolveStatusAfterChecklistChange(lead, updatedChecklist);

      if (newStatus !== lead.status) {
        logActivity({
          leadId,
          type: "status_change",
          content: `Status auto-updated to "${newStatus}" after document checklist change`,
          createdBy: "SYSTEM",
        });
      }
      logActivity({
        leadId,
        type: "document",
        content: `Document "${formatChecklistItemName(item)}" marked ${updatedChecklist[item] ? "verified" : "unverified"}`,
        createdBy: currentRole,
      });

      return { ...lead, checklist: updatedChecklist, status: newStatus, lastUpdated: today };
    });
    syncLeads(updated);
  };

  const updateUsaSlots = (leadId: string, slotsData: Partial<UsaSlotTracking>) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = leads.map((lead) => {
      if (lead.id !== leadId || lead.country !== "USA") return lead;
      return {
        ...lead,
        usaSlots: { ...DEFAULT_USA_SLOTS, ...lead.usaSlots, ...slotsData },
        lastUpdated: today,
      };
    });
    syncLeads(updated);
  };

  const addPayment = (leadId: string, paymentData: Omit<PaymentDetails, "invoiceNumber" | "date">) => {
    const today = new Date().toISOString().split("T")[0];
    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newPayment: PaymentDetails = { ...paymentData, invoiceNumber: invoiceNum, date: today };
    const updated = leads.map((lead) =>
      lead.id === leadId
        ? { ...lead, payments: [...(lead.payments || []), newPayment], lastUpdated: today }
        : lead
    );
    syncLeads(updated);
    logActivity({
      leadId,
      type: "payment",
      content: `Payment of ₹${paymentData.amountPaid.toLocaleString()} recorded (${invoiceNum}) via ${paymentData.paymentMethod}`,
      createdBy: currentRole,
    });
  };

  const setLeadPackage = (leadId: string, totalPackage: number) => {
    if (totalPackage <= 0) return;
    const today = new Date().toISOString().split("T")[0];
    const updated = leads.map((lead) => {
      if (lead.id !== leadId) return lead;
      const payments = lead.payments || [];
      const currentPackage = payments[0]?.totalPackage || 0;
      if (currentPackage > 0) return lead;

      const received = payments.reduce((acc, p) => acc + p.amountPaid, 0);
      const pendingAmount = Math.max(0, totalPackage - received);

      if (payments.length === 0) {
        const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        return {
          ...lead,
          payments: [
            {
              totalPackage,
              amountPaid: 0,
              pendingAmount: totalPackage,
              paymentMethod: "Pending",
              invoiceNumber: invoiceNum,
              date: today,
            },
          ],
          lastUpdated: today,
        };
      }

      return {
        ...lead,
        payments: payments.map((payment, index) =>
          index === 0
            ? { ...payment, totalPackage, pendingAmount }
            : { ...payment, totalPackage }
        ),
        lastUpdated: today,
      };
    });
    syncLeads(updated);
    logActivity({
      leadId,
      type: "payment",
      content: `Package amount set to ₹${totalPackage.toLocaleString()}`,
      createdBy: currentRole,
    });
  };

  const addMeeting = (meetingData: Omit<Meeting, "id">) => {
    const newMeeting: Meeting = { ...meetingData, id: `meet-${Date.now()}` };
    syncMeetings([...meetings, newMeeting]);
  };

  const updateMeeting = (updatedMeeting: Meeting) => {
    const updated = meetings.map((meet) =>
      meet.id === updatedMeeting.id ? updatedMeeting : meet
    );
    syncMeetings(updated);
  };

  // Soft delete — never permanently removes a lead (guide §13 rule 5)
  const deleteLead = (leadId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = leads.map((lead) =>
      lead.id === leadId
        ? { ...lead, status: "DROPPED" as VisaStatus, isDeleted: true, lastUpdated: today }
        : lead
    );
    syncLeads(updated);
    logActivity({
      leadId,
      type: "status_change",
      content: "Lead marked as Dropped (soft-deleted)",
      createdBy: currentRole,
    });
  };

  const restoreLead = (leadId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = leads.map((lead) =>
      lead.id === leadId
        ? { ...lead, status: "NEW_LEAD" as VisaStatus, isDeleted: false, lastUpdated: today }
        : lead
    );
    syncLeads(updated);
    logActivity({
      leadId,
      type: "status_change",
      content: "Lead restored from Dropped status",
      createdBy: currentRole,
    });
  };

  const getLeadActivities = (leadId: string) =>
    activities.filter((a) => a.leadId === leadId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const postLeadDiscussionMessage = async (leadId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    await logActivity({
      leadId,
      type: "discussion",
      content: trimmed,
      createdBy: currentUser?.name ?? String(currentRole),
    });
  };

  const getLeadDocuments = (leadId: string) =>
    documents.filter((d) => d.leadId === leadId);

  // Recompute auto status after a checklist value is forced to a given value
  const applyChecklistValue = (leadId: string, item: string, value: boolean) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = leads.map((lead) => {
      if (lead.id !== leadId) return lead;
      const updatedChecklist = { ...lead.checklist, [item]: value };
      const newStatus = resolveStatusAfterChecklistChange(lead, updatedChecklist);

      if (newStatus !== lead.status) {
        logActivity({
          leadId,
          type: "status_change",
          content: `Status auto-updated to "${newStatus}" after document checklist change`,
          createdBy: "SYSTEM",
        });
      }

      return { ...lead, checklist: updatedChecklist, status: newStatus, lastUpdated: today };
    });
    syncLeads(updated);
  };

  const uploadDocument = async (
    leadId: string,
    docType: string,
    fileOrUrl: File | string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const form = new FormData();
      form.append("leadId", leadId);
      form.append("docType", String(docType));
      form.append("uploadedBy", currentRole);

      if (typeof fileOrUrl === "string") {
        form.append("fileUrl", fileOrUrl);
        let name = "Linked Document";
        try {
          const urlObj = new URL(fileOrUrl);
          const pathname = urlObj.pathname;
          const lastPart = pathname.substring(pathname.lastIndexOf('/') + 1);
          if (lastPart) name = decodeURIComponent(lastPart);
        } catch {}
        form.append("fileName", name);
      } else {
        form.append("file", fileOrUrl);
      }

      const res = await fetch("/api/documents", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || "Upload failed" };
      }

      setDocuments((prev) => [...prev, data.document as Document]);
      applyChecklistValue(leadId, docType, true);
      logActivity({
        leadId,
        type: "document",
        content: `Document "${formatChecklistItemName(docType)}" verified via ${typeof fileOrUrl === "string" ? "URL link" : `upload (${fileOrUrl.name})`}`,
        createdBy: currentRole,
      });

      return { ok: true };
    } catch {
      return { ok: false, error: "Network error during upload" };
    }
  };

  const uploadInvoice = async (
    leadId: string,
    invoiceNumber: string,
    fileOrUrl: File | string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      let finalUrl = "";
      let finalName = "";

      if (typeof fileOrUrl === "string") {
        if (fileOrUrl === "") {
          finalUrl = "";
          finalName = "";
        } else {
          finalUrl = fileOrUrl;
          let name = "Linked Invoice";
          try {
            const urlObj = new URL(fileOrUrl);
            const pathname = urlObj.pathname;
            const lastPart = pathname.substring(pathname.lastIndexOf('/') + 1);
            if (lastPart) name = decodeURIComponent(lastPart);
          } catch {}
          finalName = name;
        }
      } else {
        const form = new FormData();
        form.append("leadId", leadId);
        form.append("docType", `invoice-${invoiceNumber}`);
        form.append("uploadedBy", currentRole);
        form.append("file", fileOrUrl);

        const res = await fetch("/api/documents", { method: "POST", body: form });
        const data = await res.json();

        if (!res.ok) {
          return { ok: false, error: data.error || "Upload failed" };
        }
        finalUrl = data.document.fileUrl;
        finalName = data.document.fileName;
      }

      // Now update the lead's payment array
      const today = new Date().toISOString().split("T")[0];
      const updated = leads.map((lead) => {
        if (lead.id !== leadId) return lead;
        const updatedPayments = (lead.payments || []).map((pay) => {
          if (pay.invoiceNumber === invoiceNumber) {
            return {
              ...pay,
              invoiceFile: finalName || undefined,
              invoiceUrl: finalUrl || undefined,
            };
          }
          return pay;
        });
        return { ...lead, payments: updatedPayments, lastUpdated: today };
      });

      await syncLeads(updated);
      logActivity({
        leadId,
        type: "payment",
        content: fileOrUrl === ""
          ? `Invoice ${invoiceNumber} attachment removed`
          : `Invoice ${invoiceNumber} attached via ${typeof fileOrUrl === "string" ? "URL link" : `upload (${finalName})`}`,
        createdBy: currentRole,
      });

      return { ok: true };
    } catch {
      return { ok: false, error: "Network error during upload" };
    }
  };

  const addUser = async (userData: Omit<CrmUser, "id" | "createdAt"> & { id?: string; password?: string; createdAt?: string }) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "Failed to save user" };
      }
      
      // Update local state
      setUsers((prev) => {
        const isExisting = prev.some((u) => u.id === data.user.id);
        if (isExisting) {
          return prev.map((u) => (u.id === data.user.id ? data.user : u));
        } else {
          return [...prev, data.user];
        }
      });
      
      // If updating our own logged-in account, keep currentUser in sync
      if (currentUser && currentUser.id === data.user.id) {
        const updatedCurrentUser = { ...currentUser, ...data.user };
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem("visa_crm_user", JSON.stringify(updatedCurrentUser));
      }

      return { ok: true };
    } catch {
      return { ok: false, error: "Network error saving user" };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE", id: userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "Failed to delete user" };
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error deleting user" };
    }
  };

  const changeRoleAndPersist = (role: StaffRole | string) => {
    setCurrentRole(role);
    localStorage.setItem("visa_crm_role", role);
    
    // Find if a user matches this role to update currentUser locally for the simulation
    const matchedUser = users.find((u) => u.role === role);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      localStorage.setItem("visa_crm_user", JSON.stringify(matchedUser));
    }
  };

  const handleSetCurrentUser = (user: CrmUser | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("visa_crm_user", JSON.stringify(user));
      setCurrentRole(user.role);
      localStorage.setItem("visa_crm_role", user.role);
    } else {
      localStorage.removeItem("visa_crm_user");
    }
  };

  const patchLeadDriveFolder = useCallback((leadId: string, driveFolderId: string) => {
    const today = new Date().toISOString().split("T")[0];
    setLeads((prev) => {
      const existing = prev.find((lead) => lead.id === leadId);
      if (existing?.driveFolderId === driveFolderId) return prev;
      return prev.map((lead) =>
        lead.id === leadId ? { ...lead, driveFolderId, lastUpdated: today } : lead
      );
    });
  }, []);

  const setLeadDriveFolder = async (
    leadId: string,
    driveFolderId: string | null
  ): Promise<boolean> => {
    const today = new Date().toISOString().split("T")[0];
    const previousLeads = leads;
    const optimistic = leads.map((lead) =>
      lead.id === leadId
        ? { ...lead, driveFolderId: driveFolderId ?? undefined, lastUpdated: today }
        : lead
    );
    setLeads(optimistic);

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveFolderId }),
      });
      if (!res.ok) {
        setLeads(previousLeads);
        return false;
      }

      const data = (await res.json()) as { lead?: Lead };
      if (data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead! : l)));
      }

      logActivity({
        leadId,
        type: "note",
        content: driveFolderId
          ? "Drive folder linked for lead"
          : "Drive folder unlinked for lead",
        createdBy: currentRole,
      });
      return true;
    } catch {
      setLeads(previousLeads);
      return false;
    }
  };

  const setLeadCredentials = async (
    leadId: string,
    creds: { username?: string; password?: string; portalUrl?: string } | null
  ): Promise<boolean> => {
    const today = new Date().toISOString().split("T")[0];
    const previousLeads = leads;
    const optimistic = leads.map((lead) =>
      lead.id === leadId
        ? { ...lead, visaCredentials: creds ?? undefined, lastUpdated: today }
        : lead
    );
    setLeads(optimistic);

    try {
      const res = await fetch("/api/leads/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, visaCredentials: creds }),
      });
      if (!res.ok) {
        setLeads(previousLeads);
        return false;
      }

      await syncLeads(optimistic);
      logActivity({
        leadId,
        type: "note",
        content: creds
          ? `Visa portal credentials ${creds.username ? "updated" : "cleared"}`
          : "Visa portal credentials removed",
        createdBy: currentRole,
      });
      return true;
    } catch (err) {
      console.error("Failed to set lead credentials:", err);
      setLeads(previousLeads);
      return false;
    }
  };

  const refreshLeads = async (): Promise<void> => {
    try {
      const leadsRes = await fetch("/api/leads?limit=1000");
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        const leadsData = Array.isArray(data.leads) ? data.leads : (data.leads ?? []);
        setLeads(leadsData);
        console.log(`✓ Refreshed ${leadsData.length} leads from Supabase`);
      }
    } catch (err) {
      console.error("Failed to refresh leads:", err);
    }
  };

  return (
    <CrmContext.Provider
      value={{
        leads,
        meetings,
        activities,
        documents,
        users,
        currentUser,
        currentRole,
        currentTab,
        setCurrentTab,
        setCurrentRole: changeRoleAndPersist,
        setCurrentUser: handleSetCurrentUser,
        addUser,
        deleteUser,
        addLead,
        updateLeadStatus,
        updateEmploymentCategory,
        toggleChecklistItem,
        updateUsaSlots,
        addPayment,
        setLeadPackage,
        addMeeting,
        updateMeeting,
        deleteLead,
        restoreLead,
        updateLeadNotes,
        updateLeadProfile,
        assignCounselor,
        setLeadCredentials,
        setLeadDriveFolder,
        patchLeadDriveFolder,
        refreshLeads,
        getLeadActivities,
        postLeadDiscussionMessage,
        uploadDocument,
        uploadInvoice,
        getLeadDocuments,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) throw new Error("useCrm must be used within a CrmProvider");
  return context;
};
