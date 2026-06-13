import type { StaffRole } from "@/context/CrmContext";

// Which sidebar tabs each role is allowed to open (guide §8.9 access model).
// Every role lands on the Dashboard; specialist teams only see their own desks.
export const ROLE_TABS: Record<StaffRole, string[]> = {
  ADMIN: ["Dashboard", "Leads", "FollowUps", "Countries", "USASlots", "Checklist", "Submissions", "Payments", "Meetings", "DropLeads", "Staff", "Drive"],
  MANAGER: ["Dashboard", "Leads", "FollowUps", "Countries", "USASlots", "Checklist", "Submissions", "Payments", "Meetings", "DropLeads", "Staff"],
  COUNSELOR: ["Dashboard", "Leads", "FollowUps", "Countries", "Meetings", "DropLeads"],
  "DOCUMENT TEAM": ["Dashboard", "Leads", "Countries", "Checklist"],
  "VISA TEAM": ["Dashboard", "Leads", "Countries", "USASlots", "Submissions"],
  "ACCOUNT TEAM": ["Dashboard", "Leads", "Payments"],
  OTHER: ["Dashboard"],
};

export const AVAILABLE_TABS = [
  { id: "Dashboard", label: "Dashboard" },
  { id: "Leads", label: "Lead Management" },
  { id: "FollowUps", label: "Follow-Ups" },
  // { id: "Countries", label: "Country Wise Leads" },
  { id: "USASlots", label: "USA Slot Tracking" },
  // { id: "Checklist", label: "Document Checklist" },
  { id: "Submissions", label: "Visa Submission" },
  { id: "Payments", label: "Payments & Finance" },
  { id: "Meetings", label: "Meetings & Reminders" },
  { id: "DropLeads", label: "Drop Leads Log" },
  { id: "Staff", label: "Staff Directory" },
  { id: "Drive", label: "Drive" },
];
