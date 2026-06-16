import { Lead, VisaStatus } from "@/context/CrmContext";
import { getStatusLabel, type LeadStatus } from "@/utils/leadStatusConfig";

const ACTIVE_PIPELINE_STATUSES: LeadStatus[] = [
  "NEW_LEAD",
  "IN_PROGRESS",
  "VISA_SUBMISSION",
  "VISA_APPROVED",
  "VISA_REJECTED",
];

export type QuickTabFilter = {
  id: string;
  label: string;
  statuses: VisaStatus[] | "all-non-dropped";
};

export const QUICK_TAB_FILTERS: QuickTabFilter[] = [
  { id: "All", label: "All", statuses: "all-non-dropped" },
  ...ACTIVE_PIPELINE_STATUSES.map((status) => ({
    id: status,
    label: getStatusLabel(status),
    statuses: [status] as VisaStatus[],
  })),
];

export function matchesQuickTab(lead: Lead, tabId: string): boolean {
  const tab = QUICK_TAB_FILTERS.find((item) => item.id === tabId);
  if (!tab) return true;
  if (tab.statuses === "all-non-dropped") return lead.status !== "DROPPED";
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
      if (l.status !== "IN_PROGRESS") return false;
    } else if (kpiFilter === "Total") {
      if (l.status === "DROPPED") return false;
    } else if (kpiFilter === "Visa Success") {
      if (l.status !== "VISA_APPROVED") return false;
    }
    return (
      (countryFilter === "All" || l.country === countryFilter) &&
      (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm))
    );
  });
}
