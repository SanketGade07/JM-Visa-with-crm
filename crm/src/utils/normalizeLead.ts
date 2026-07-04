import type { Lead, UsaSlotTracking } from "@/context/CrmContext";
import { normalizeLeadStatus } from "./leadStatusConfig";
import { isUsaCountry, normalizeCrmCountry } from "./countryUtils";
import {
  DEFAULT_EMPLOYMENT_CATEGORY,
  EMPLOYMENT_CATEGORIES,
  mergeChecklist,
  type DocumentChecklistState,
  type EmploymentCategory,
} from "./documentChecklistConfig";

export const DEFAULT_USA_SLOTS: UsaSlotTracking = {
  credentialsProvided: false,
  slotsAvailable: false,
  slotsPaid: false,
  slotsBooked: false,
  ds160Submitted: false,
  interviewScheduled: false,
  interviewDate: "",
  slotLocation: "",
  paidDate: "",
  trackingMobile: "",
  securityCar: "",
  securityFood: "",
  securityCity: "",
};

const isEmploymentCategory = (value: unknown): value is EmploymentCategory =>
  typeof value === "string" && value in EMPLOYMENT_CATEGORIES;

export function normalizeUsaSlots(raw: unknown): UsaSlotTracking {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_USA_SLOTS };
  }
  const slots = raw as Partial<UsaSlotTracking>;
  return {
    credentialsProvided: !!slots.credentialsProvided,
    slotsAvailable: !!slots.slotsAvailable,
    slotsPaid: !!slots.slotsPaid,
    slotsBooked: !!slots.slotsBooked,
    ds160Submitted: !!slots.ds160Submitted,
    interviewScheduled: !!slots.interviewScheduled,
    interviewDate: slots.interviewDate ?? "",
    slotLocation: slots.slotLocation ?? "",
    paidDate: slots.paidDate ?? "",
    trackingMobile: slots.trackingMobile ?? "",
    securityCar: slots.securityCar ?? "",
    securityFood: slots.securityFood ?? "",
    securityCity: slots.securityCity ?? "",
    slotPortalUsername: slots.slotPortalUsername ?? "",
    slotPortalPassword: slots.slotPortalPassword ?? "",
  };
}

/** Columns accepted by the Supabase `leads` table upsert. */
export const LEAD_DB_COLUMNS = [
  "id",
  "name",
  "email",
  "phone",
  "country",
  "visaType",
  "status",
  "source",
  "counselor",
  "assignedAt",
  "dateCreated",
  "lastUpdated",
  "isDeleted",
  "notes",
  "employmentCategory",
  "checklist",
  "payments",
  "usaSlots",
  "visaCredentials",
  "driveFolderId",
  "passportNumber",
  "passportIssueDate",
  "passportExpiryDate",
  "passportPlaceOfIssue",
  "annualIncome",
  "referredBy",
] as const;

export function serializeLeadForDb(
  lead: Lead,
  options?: { omitColumns?: Set<string> | string[] }
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const omitSet = options?.omitColumns
    ? (options.omitColumns instanceof Set ? options.omitColumns : new Set(options.omitColumns))
    : new Set<string>();

  for (const key of LEAD_DB_COLUMNS) {
    if (omitSet.has(key)) continue;
    const value = lead[key as keyof Lead];
    if (value !== undefined) {
      row[key] = value;
    }
  }
  return row;
}

export function normalizeLead(raw: Record<string, unknown>): Lead {
  const employmentCategory: EmploymentCategory = isEmploymentCategory(raw.employmentCategory)
    ? raw.employmentCategory
    : isEmploymentCategory(raw.employmentcategory)
      ? raw.employmentcategory
      : DEFAULT_EMPLOYMENT_CATEGORY;

  const storedChecklist: DocumentChecklistState =
    raw.checklist && typeof raw.checklist === "object" && !Array.isArray(raw.checklist)
      ? (raw.checklist as DocumentChecklistState)
      : {};

  const countryRaw = typeof raw.country === "string" ? raw.country : "";
  const country = normalizeCrmCountry(countryRaw);
  const usaSlotsRaw = raw.usaSlots ?? raw.usaslots;
  const rawStatus = typeof raw.status === "string" ? raw.status : "NEW_LEAD";

  return {
    ...raw,
    status: normalizeLeadStatus(rawStatus),
    country,
    assignedAt:
      (raw.assignedAt as Lead["assignedAt"]) ??
      (raw.assignedat as Lead["assignedAt"]),
    visaCredentials:
      (raw.visaCredentials as Lead["visaCredentials"]) ??
      (raw.visacredentials as Lead["visaCredentials"]),
    driveFolderId:
      (raw.driveFolderId as Lead["driveFolderId"]) ??
      (raw.drivefolderid as Lead["driveFolderId"]),
    employmentCategory,
    checklist: mergeChecklist(storedChecklist, employmentCategory),
    usaSlots:
      isUsaCountry(country) || usaSlotsRaw
        ? normalizeUsaSlots(usaSlotsRaw)
        : undefined,
    passportNumber: (raw.passportNumber as string) ?? (raw.passportnumber as string) ?? "",
    passportIssueDate: (raw.passportIssueDate as string) ?? (raw.passportissuedate as string) ?? "",
    passportExpiryDate: (raw.passportExpiryDate as string) ?? (raw.passportexpirydate as string) ?? "",
    passportPlaceOfIssue: (raw.passportPlaceOfIssue as string) ?? (raw.passportplaceofissue as string) ?? "",
    annualIncome: (raw.annualIncome as string) ?? (raw.annualincome as string) ?? "",
    referredBy: (raw.referredBy as string) ?? (raw.referredby as string) ?? "",
  } as Lead;
}
