import type { CrmUser, StaffRole } from "@/context/CrmContext";

export const AVAILABLE_PERMISSIONS = [
  { id: "assignLeads", label: "Assign Leads to Counselors" },
] as const;

export type StaffPermission = (typeof AVAILABLE_PERMISSIONS)[number]["id"];

export const PERMISSION_IDS = new Set<string>(AVAILABLE_PERMISSIONS.map((p) => p.id));

const DEFAULT_ROLE_PERMISSIONS: Partial<Record<StaffRole, StaffPermission[]>> = {
  ADMIN: ["assignLeads"],
};

export const normalizePermissions = (
  permissions: string[] | undefined | null,
  role?: StaffRole | string
): StaffPermission[] => {
  if (Array.isArray(permissions)) {
    const unique = Array.from(new Set(permissions)).filter((id): id is StaffPermission =>
      PERMISSION_IDS.has(id)
    );
    return unique;
  }
  return DEFAULT_ROLE_PERMISSIONS[role as StaffRole] ?? [];
};

export function userHasPermission(
  user: CrmUser | null | undefined,
  permission: StaffPermission
): boolean {
  if (!user) return false;
  return normalizePermissions(user.permissions, user.role).includes(permission);
}

// Which sidebar tabs each role is allowed to open (guide §8.9 access model).
// Every role lands on the Dashboard; specialist teams only see their own desks.
export const ROLE_TABS: Record<StaffRole, string[]> = {
  ADMIN: [
    "Dashboard",
    "Leads",
    "USASlots",
    "Submissions",
    "Payments",
    "DropLeads",
    "Staff",
    "Drive",
    "LeadDetails_Details",
    "LeadDetails_Checklist",
    "LeadDetails_Drive",
    "LeadDetails_Settings",
  ],
  COUNSELOR: [
    "Dashboard",
    "Leads",
    "DropLeads",
    "LeadDetails_Details",
    "LeadDetails_Checklist",
    "LeadDetails_Drive",
    "LeadDetails_Settings",
  ],
  "DOCUMENT TEAM": [
    "Dashboard",
    "Leads",
    "LeadDetails_Details",
    "LeadDetails_Checklist",
    "LeadDetails_Drive",
    "LeadDetails_Settings",
  ],
  "VISA TEAM": [
    "Dashboard",
    "Leads",
    "USASlots",
    "Submissions",
    "LeadDetails_Details",
    "LeadDetails_Checklist",
    "LeadDetails_Drive",
    "LeadDetails_Settings",
  ],
  "ACCOUNT TEAM": [
    "Dashboard",
    "Leads",
    "Payments",
    "LeadDetails_Details",
    "LeadDetails_Checklist",
    "LeadDetails_Drive",
    "LeadDetails_Settings",
  ],
  OTHER: ["Dashboard"],
};

export const AVAILABLE_TABS = [
  { id: "Dashboard", label: "Dashboard" },
  { id: "Leads", label: "Lead Management" },
  { id: "USASlots", label: "USA Slot Tracking" },
  { id: "Submissions", label: "Visa Submission" },
  { id: "Payments", label: "Payments & Finance" },
  { id: "DropLeads", label: "Drop Leads Log" },
  { id: "Staff", label: "Staff Directory" },
  { id: "Drive", label: "Drive Storage (Sidebar)" },
  { id: "LeadDetails_Details", label: "Lead Details: Details" },
  { id: "LeadDetails_Checklist", label: "Lead Details: Checklist" },
  { id: "LeadDetails_Drive", label: "Lead Details: Drive" },
  { id: "LeadDetails_Settings", label: "Lead Details: Settings" },
];

export const AVAILABLE_TAB_IDS = new Set(AVAILABLE_TABS.map((tab) => tab.id));
export const MAX_ALLOWED_TABS = AVAILABLE_TABS.length;

export const normalizeAllowedTabs = (tabs: string[] | undefined | null): string[] => {
  if (!Array.isArray(tabs)) return [];
  const uniqueValidTabs = Array.from(new Set(tabs)).filter((tabId) => AVAILABLE_TAB_IDS.has(tabId));
  return uniqueValidTabs.slice(0, MAX_ALLOWED_TABS);
};
