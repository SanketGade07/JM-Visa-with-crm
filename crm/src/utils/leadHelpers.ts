import type { DocumentChecklist, VisaStatus } from "@/context/CrmContext";
import {
  DEFAULT_EMPLOYMENT_CATEGORY,
  getChecklistKeysForLead,
  type EmploymentCategory,
} from "@/utils/documentChecklistConfig";

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
    case "New Lead": return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    case "Lead Assigned": return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
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
