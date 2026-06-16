export type LeadDetailTab = "details" | "checklist" | "drive" | "settings";

export const LEAD_DETAIL_TAB_ITEMS: { id: LeadDetailTab; label: string }[] = [
  { id: "details", label: "DETAILS" },
  { id: "checklist", label: "CHECKLIST" },
  { id: "drive", label: "DRIVE" },
  { id: "settings", label: "SETTINGS" },
];
