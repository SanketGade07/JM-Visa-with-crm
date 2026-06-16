export type LeadStatus =
  | "NEW_LEAD"
  | "IN_PROGRESS"
  | "VISA_SUBMISSION"
  | "VISA_APPROVED"
  | "VISA_REJECTED"
  | "DROPPED";

type StatusConfig = {
  label: string;
  backgroundColor: string;
  textColor?: string;
};

const STATUS_CONFIG: Record<LeadStatus, StatusConfig> = {
  NEW_LEAD: { label: "New Lead", backgroundColor: "#CCCCCC" },
  IN_PROGRESS: { label: "In Progress", backgroundColor: "#FACC15" },
  VISA_SUBMISSION: { label: "Visa Submission", backgroundColor: "#3B82F6" },
  VISA_APPROVED: { label: "Visa Approved", backgroundColor: "#22C55E" },
  VISA_REJECTED: { label: "Visa Rejected", backgroundColor: "#EF4444" },
  DROPPED: { label: "Dropped", backgroundColor: "#000000", textColor: "#F8FAFC" },
};

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "NEW_LEAD",
  "IN_PROGRESS",
  "VISA_SUBMISSION",
  "VISA_APPROVED",
  "VISA_REJECTED",
  "DROPPED",
];

/** Maps legacy human-readable statuses to the 6-key model. */
export const LEGACY_STATUS_MAP: Record<string, LeadStatus> = {
  "New Lead": "NEW_LEAD",
  "Lead Assigned": "NEW_LEAD",
  Contacted: "IN_PROGRESS",
  "Follow-Up": "IN_PROGRESS",
  Interested: "IN_PROGRESS",
  "Documents Pending": "IN_PROGRESS",
  "Documents Received": "IN_PROGRESS",
  "Under Verification": "IN_PROGRESS",
  "Ready For Submission": "VISA_SUBMISSION",
  "Visa Submitted": "VISA_SUBMISSION",
  "Approved / Rejected": "VISA_APPROVED",
  Closed: "VISA_APPROVED",
  Dropped: "DROPPED",
};

const LIGHT_BG_STATUSES = new Set<LeadStatus>(["NEW_LEAD", "IN_PROGRESS"]);

const DEFAULT_DARK_TEXT = "#1E293B";
const DEFAULT_LIGHT_TEXT = "#FFFFFF";
const FALLBACK_PILL_STYLE = {
  backgroundColor: "#F1F5F9",
  color: "#64748B",
  borderColor: "#CBD5E1",
} as const;

export type StatusPillStyle = {
  backgroundColor: string;
  color: string;
  borderColor: string;
};

export function isLeadStatus(status: string): status is LeadStatus {
  return (LEAD_STATUS_ORDER as string[]).includes(status);
}

export function normalizeLeadStatus(status: string): LeadStatus {
  if (isLeadStatus(status)) return status;
  return LEGACY_STATUS_MAP[status] ?? "NEW_LEAD";
}

export function isLightStatusBg(status: string): boolean {
  const key = isLeadStatus(status) ? status : LEGACY_STATUS_MAP[status];
  return key ? LIGHT_BG_STATUSES.has(key) : false;
}

export function getStatusLabel(status: string): string {
  const key = isLeadStatus(status) ? status : LEGACY_STATUS_MAP[status];
  if (key) return STATUS_CONFIG[key].label;
  return status;
}

function darkenHex(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const num = parseInt(normalized, 16);
  if (Number.isNaN(num)) return hex;

  const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 0xff) * (1 - amount)));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function getStatusPillStyle(status: string): StatusPillStyle {
  const key = isLeadStatus(status) ? status : LEGACY_STATUS_MAP[status];
  if (!key) return { ...FALLBACK_PILL_STYLE };

  const config = STATUS_CONFIG[key];
  const backgroundColor = config.backgroundColor;
  const color =
    config.textColor ??
    (isLightStatusBg(key) ? DEFAULT_DARK_TEXT : DEFAULT_LIGHT_TEXT);
  const borderColor =
    key === "DROPPED" ? "#334155" : darkenHex(backgroundColor, 0.15);

  return { backgroundColor, color, borderColor };
}
