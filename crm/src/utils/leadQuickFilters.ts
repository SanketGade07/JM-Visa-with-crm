import { Lead, VisaStatus } from "@/context/CrmContext";

export const IN_PROGRESS_STATUSES: VisaStatus[] = [
  "Lead Assigned",
  "Contacted",
  "Follow-Up",
  "Interested",
  "Documents Pending",
  "Documents Received",
  "Under Verification",
  "Ready For Submission",
  "Visa Submitted",
];

export const COMPLETED_STATUSES: VisaStatus[] = ["Approved / Rejected", "Closed"];

export type QuickTabFilter = {
  id: string;
  label: string;
  statuses: VisaStatus[] | "all-non-dropped";
};

export const QUICK_TAB_FILTERS: QuickTabFilter[] = [
  { id: "All", label: "All", statuses: "all-non-dropped" },
  { id: "New", label: "New", statuses: ["New Lead", "Lead Assigned"] },
  { id: "Follow-Up", label: "Follow-Up", statuses: ["Follow-Up"] },
  { id: "Interested", label: "Interested", statuses: ["Interested"] },
  { id: "Docs", label: "Docs", statuses: ["Documents Pending", "Documents Received"] },
  { id: "Submitted", label: "Submitted", statuses: ["Ready For Submission", "Visa Submitted"] },
  { id: "Completed", label: "Completed", statuses: COMPLETED_STATUSES },
];

export function matchesQuickTab(lead: Lead, tabId: string): boolean {
  const tab = QUICK_TAB_FILTERS.find((item) => item.id === tabId);
  if (!tab) return true;
  if (tab.statuses === "all-non-dropped") return lead.status !== "Dropped";
  return tab.statuses.includes(lead.status);
}

export function filterScopedLeads(
  leads: Lead[],
  kpiFilter: string,
  countryFilter: string,
  searchTerm: string
): Lead[] {
  return leads.filter((l) => {
    if (kpiFilter === "New Today") {
      const todayStr = new Date().toISOString().split("T")[0];
      if (l.dateCreated !== todayStr) return false;
    } else if (kpiFilter === "In Progress") {
      if (!IN_PROGRESS_STATUSES.includes(l.status)) return false;
    } else if (kpiFilter === "Total") {
      if (l.status === "Dropped") return false;
    } else if (kpiFilter === "Visa Success") {
      if (l.status !== "Approved / Rejected") return false;
    }
    return (
      (countryFilter === "All" || l.country === countryFilter) &&
      (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm))
    );
  });
}
