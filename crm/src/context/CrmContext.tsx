"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// ── Enums / union types ───────────────────────────────────────────────────────

export type VisaStatus =
  | "New Lead"
  | "Contacted"
  | "Follow-Up"
  | "Interested"
  | "Documents Pending"
  | "Documents Received"
  | "Under Verification"
  | "Ready For Submission"
  | "Visa Submitted"
  | "Approved / Rejected"
  | "Closed"
  | "Dropped";

export type CountryType = "UK" | "USA" | "Canada" | "Europe";

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
  | "MANAGER";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DocumentChecklist {
  passport: boolean;
  visaForm: boolean;
  businessDocs: boolean;
  salarySlips: boolean;
  bankStatement: boolean;
  itr: boolean;
  offerLetter: boolean;
  casOrI20: boolean;
  travelHistory: boolean;
  sopOrCoverLetter: boolean;
  photos: boolean;
  insurance: boolean;
  biometricsCompleted: boolean;
  visaFeesPaid: boolean;
}

export interface PaymentDetails {
  totalPackage: number;
  amountPaid: number;
  pendingAmount: number;
  paymentMethod: string;
  invoiceNumber: string;
  date: string;
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
}

export interface Activity {
  id: string;
  leadId: string;
  type: "status_change" | "note" | "call" | "email" | "document" | "lead_created" | "payment";
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
  fileUrl: string; // public URL from Supabase Storage
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
  checklist: DocumentChecklist;
  payments: PaymentDetails[];
  usaSlots?: UsaSlotTracking;
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
  currentRole: StaffRole;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  setCurrentRole: (role: StaffRole) => void;
  addLead: (lead: Omit<Lead, "id" | "dateCreated" | "lastUpdated" | "isDeleted">) => void;
  updateLeadStatus: (leadId: string, status: VisaStatus) => void;
  toggleChecklistItem: (leadId: string, item: keyof DocumentChecklist) => void;
  updateUsaSlots: (leadId: string, slots: Partial<UsaSlotTracking>) => void;
  addPayment: (leadId: string, payment: Omit<PaymentDetails, "invoiceNumber" | "date">) => void;
  addMeeting: (meeting: Omit<Meeting, "id">) => void;
  deleteLead: (leadId: string) => void;
  restoreLead: (leadId: string) => void;
  updateLeadNotes: (leadId: string, notes: string) => void;
  assignCounselor: (leadId: string, counselor: string) => void;
  getLeadActivities: (leadId: string) => Activity[];
  uploadDocument: (leadId: string, docType: keyof DocumentChecklist, file: File) => Promise<{ ok: boolean; error?: string }>;
  getLeadDocuments: (leadId: string) => Document[];
}

// ── Provider ──────────────────────────────────────────────────────────────────

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentRole, setCurrentRole] = useState<StaffRole>("ADMIN");
  const [currentTab, setCurrentTab] = useState<string>("Dashboard");

  useEffect(() => {
    const loadData = async () => {
      // Restore the persisted role first (deferred out of the effect body)
      const savedRole = localStorage.getItem("visa_crm_role");
      if (savedRole) setCurrentRole(savedRole as StaffRole);

      try {
        const [leadsRes, meetingsRes, activitiesRes, documentsRes] = await Promise.all([
          fetch("/api/leads?limit=1000"),
          fetch("/api/meetings"),
          fetch("/api/activities"),
          fetch("/api/documents"),
        ]);

        if (leadsRes.ok) {
          const data = await leadsRes.json();
          // API returns { leads, total, page, limit } — extract the array
          setLeads(Array.isArray(data) ? data : (data.leads ?? []));
        }
        if (meetingsRes.ok) setMeetings(await meetingsRes.json());
        if (activitiesRes.ok) setActivities(await activitiesRes.json());
        if (documentsRes.ok) setDocuments(await documentsRes.json());
      } catch (error) {
        console.error("Failed to load CRM data:", error);
      }
    };

    loadData();
  }, []);

  // ── Persistence helpers ─────────────────────────────────────────────────────

  const syncLeads = async (updated: Lead[]) => {
    setLeads(updated);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: updated }),
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

  const addLead = (newLeadData: Omit<Lead, "id" | "dateCreated" | "lastUpdated" | "isDeleted">) => {
    const today = new Date().toISOString().split("T")[0];
    const newLead: Lead = {
      ...newLeadData,
      id: `lead-${Date.now()}`,
      dateCreated: today,
      lastUpdated: today,
      isDeleted: false,
    };
    syncLeads([...leads, newLead]);
    logActivity({
      leadId: newLead.id,
      type: "lead_created",
      content: `Lead created manually by ${currentRole}`,
      createdBy: currentRole,
    });
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

  const assignCounselor = (leadId: string, counselor: string) => {
    const today = new Date().toISOString().split("T")[0];
    const prev = leads.find((l) => l.id === leadId);
    const updated = leads.map((lead) =>
      lead.id === leadId ? { ...lead, counselor, lastUpdated: today } : lead
    );
    syncLeads(updated);
    if (prev && prev.counselor !== counselor) {
      logActivity({
        leadId,
        type: "note",
        content: `Counselor changed from "${prev.counselor}" to "${counselor}"`,
        createdBy: currentRole,
      });
    }
  };

  const toggleChecklistItem = (leadId: string, item: keyof DocumentChecklist) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = leads.map((lead) => {
      if (lead.id !== leadId) return lead;

      const updatedChecklist = { ...lead.checklist, [item]: !lead.checklist[item] };

      const requiredDocs: (keyof DocumentChecklist)[] = [
        "passport",
        "visaForm",
        "bankStatement",
        "photos",
        "visaFeesPaid",
      ];
      if (lead.country === "USA" || lead.country === "UK") {
        requiredDocs.push("casOrI20");
      } else if (lead.country === "Canada") {
        requiredDocs.push("offerLetter");
      }

      const allRequired = requiredDocs.every((doc) => updatedChecklist[doc]);
      let newStatus = lead.status;
      if (
        allRequired &&
        !["Ready For Submission", "Visa Submitted", "Approved / Rejected", "Closed"].includes(
          lead.status
        )
      ) {
        newStatus = "Ready For Submission";
      } else if (!allRequired && lead.status === "Ready For Submission") {
        newStatus = "Documents Pending";
      }

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
        content: `Document "${item.replace(/([A-Z])/g, " $1")}" marked ${updatedChecklist[item] ? "verified" : "unverified"}`,
        createdBy: currentRole,
      });

      return { ...lead, checklist: updatedChecklist, status: newStatus as VisaStatus, lastUpdated: today };
    });
    syncLeads(updated);
  };

  const updateUsaSlots = (leadId: string, slotsData: Partial<UsaSlotTracking>) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = leads.map((lead) => {
      if (lead.id !== leadId || lead.country !== "USA") return lead;
      return {
        ...lead,
        usaSlots: { ...lead.usaSlots, ...slotsData } as UsaSlotTracking,
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

  const addMeeting = (meetingData: Omit<Meeting, "id">) => {
    const newMeeting: Meeting = { ...meetingData, id: `meet-${Date.now()}` };
    syncMeetings([...meetings, newMeeting]);
  };

  // Soft delete — never permanently removes a lead (guide §13 rule 5)
  const deleteLead = (leadId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = leads.map((lead) =>
      lead.id === leadId
        ? { ...lead, status: "Dropped" as VisaStatus, isDeleted: true, lastUpdated: today }
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
        ? { ...lead, status: "New Lead" as VisaStatus, isDeleted: false, lastUpdated: today }
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

  const getLeadDocuments = (leadId: string) =>
    documents.filter((d) => d.leadId === leadId);

  // Recompute auto status after a checklist value is forced to a given value
  const applyChecklistValue = (
    leadId: string,
    item: keyof DocumentChecklist,
    value: boolean
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = leads.map((lead) => {
      if (lead.id !== leadId) return lead;
      const updatedChecklist = { ...lead.checklist, [item]: value };

      const requiredDocs: (keyof DocumentChecklist)[] = [
        "passport",
        "visaForm",
        "bankStatement",
        "photos",
        "visaFeesPaid",
      ];
      if (lead.country === "USA" || lead.country === "UK") {
        requiredDocs.push("casOrI20");
      } else if (lead.country === "Canada") {
        requiredDocs.push("offerLetter");
      }

      const allRequired = requiredDocs.every((doc) => updatedChecklist[doc]);
      let newStatus = lead.status;
      if (
        allRequired &&
        !["Ready For Submission", "Visa Submitted", "Approved / Rejected", "Closed"].includes(lead.status)
      ) {
        newStatus = "Ready For Submission";
      } else if (!allRequired && lead.status === "Ready For Submission") {
        newStatus = "Documents Pending";
      }

      return { ...lead, checklist: updatedChecklist, status: newStatus as VisaStatus, lastUpdated: today };
    });
    syncLeads(updated);
  };

  // Staff manually uploads a document file → stored in Supabase Storage,
  // metadata persisted, and the matching checklist item marked verified.
  const uploadDocument = async (
    leadId: string,
    docType: keyof DocumentChecklist,
    file: File
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("leadId", leadId);
      form.append("docType", String(docType));
      form.append("uploadedBy", currentRole);

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
        content: `Document "${String(docType).replace(/([A-Z])/g, " $1")}" uploaded & verified (${file.name})`,
        createdBy: currentRole,
      });

      return { ok: true };
    } catch {
      return { ok: false, error: "Network error during upload" };
    }
  };

  const changeRoleAndPersist = (role: StaffRole) => {
    setCurrentRole(role);
    localStorage.setItem("visa_crm_role", role);
  };

  return (
    <CrmContext.Provider
      value={{
        leads,
        meetings,
        activities,
        documents,
        currentRole,
        currentTab,
        setCurrentTab,
        setCurrentRole: changeRoleAndPersist,
        addLead,
        updateLeadStatus,
        toggleChecklistItem,
        updateUsaSlots,
        addPayment,
        addMeeting,
        deleteLead,
        restoreLead,
        updateLeadNotes,
        assignCounselor,
        getLeadActivities,
        uploadDocument,
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
