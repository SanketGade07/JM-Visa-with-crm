import type { CrmUser, DocumentChecklist, Lead, VisaStatus } from "@/context/CrmContext";
import {
  DEFAULT_EMPLOYMENT_CATEGORY,
  getChecklistKeysForLead,
  type EmploymentCategory,
} from "@/utils/documentChecklistConfig";

export function isLeadAssignedToCounselor(lead: Lead, counselorName: string): boolean {
  const assigned = lead.counselor?.trim().toLowerCase() ?? "";
  const counselor = counselorName.trim().toLowerCase();
  return assigned !== "" && assigned !== "unassigned" && assigned === counselor;
}

/** Milliseconds from lead id (`lead-<timestamp>`) or dateCreated. */
export function getLeadCreatedTimestamp(lead: Lead): number {
  const idMatch = lead.id.match(/^lead-(\d+)$/);
  if (idMatch) {
    const ts = Number(idMatch[1]);
    if (!Number.isNaN(ts)) return ts;
  }
  const parsed = Date.parse(lead.dateCreated);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Most recent of create time or last counselor assignment. */
export function getLeadRecencyTimestamp(lead: Lead): number {
  const created = getLeadCreatedTimestamp(lead);
  const assigned = lead.assignedAt ? Date.parse(lead.assignedAt) : 0;
  return Math.max(created, Number.isNaN(assigned) ? 0 : assigned);
}

/** Newest created or assigned leads first. */
export function sortLeadsByRecency<T extends Lead>(leads: T[]): T[] {
  return [...leads].sort(
    (a, b) => getLeadRecencyTimestamp(b) - getLeadRecencyTimestamp(a)
  );
}

export function scopeLeadsForUser(leads: Lead[], user: CrmUser | null): Lead[] {
  if (!user || user.role !== "COUNSELOR") {
    return leads;
  }
  return leads.filter((lead) => isLeadAssignedToCounselor(lead, user.name));
}

export function getDeskCountriesFromLeads(leads: Lead[]): string[] {
  const set = new Set<string>();
  for (const l of leads) {
    if (l.status !== "DROPPED" && l.country?.trim()) set.add(l.country.trim());
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

// Document checklist completion % for the Document Progress column
export const docProgress = (
  checklist: DocumentChecklist,
  employmentCategory?: EmploymentCategory
) => {
  const category = employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY;
  const activeKeys = getChecklistKeysForLead(category);
  if (!activeKeys.length) return 0;
  const checked = activeKeys.filter((key) => checklist[key]).length;
  return (checked / activeKeys.length) * 100;
};

// Relative "time ago" for the Last Contact column (display only)
export const timeAgo = (dateStr: string) => {
  if (!dateStr) return "—";
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return dateStr;
  const diff = Date.now() - then;
  const day = 86400000;
  if (diff < 0) return "just now";
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))} min ago`;
  if (diff < day) return `${Math.floor(diff / 3600000)} hr ago`;
  const days = Math.floor(diff / day);
  return days === 1 ? "1 day ago" : `${days} days ago`;
};

// Dark-theme status badge classes (used outside the shared light/dark pills)
export const getStatusColor = (status: VisaStatus) => {
  switch (status) {
    case "NEW_LEAD": return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    case "IN_PROGRESS": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    case "APPLICATION_PROCESSED": return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
    case "VISA_SUBMISSION": return "bg-violet-500/15 text-violet-300 border border-violet-500/30";
    case "VISA_APPROVED": return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
    case "VISA_REJECTED": return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    case "DROPPED": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    default: return "bg-slate-600/10 text-slate-400 border border-slate-600/20";
  }
};
