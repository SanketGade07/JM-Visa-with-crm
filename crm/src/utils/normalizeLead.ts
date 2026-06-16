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
    securityCar: slots.securityCar ?? "",
    securityFood: slots.securityFood ?? "",
    securityCity: slots.securityCity ?? "",
    slotPortalUsername: slots.slotPortalUsername ?? "",
    slotPortalPassword: slots.slotPortalPassword ?? "",
  };
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
  } as Lead;
}
