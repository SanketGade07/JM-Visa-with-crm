import type { CountryType, LeadSource } from "@/context/CrmContext";
import type { EmploymentCategory } from "@/utils/documentChecklistConfig";
import { DEFAULT_EMPLOYMENT_CATEGORY } from "@/utils/documentChecklistConfig";

export type CreateLeadType = "study_abroad" | "visa" | null;

export type CreateLeadSlotStatus = "available" | "paid" | "";

export type CreateLeadFormState = {
  leadType: CreateLeadType;
  visaSubtype: string;
  clientName: string;
  email: string;
  phone: string;
  immigrationCountry: CountryType | "";
  loginId: string;
  password: string;
  slotPortalLoginId: string;
  slotPortalPassword: string;
  slotStatus: CreateLeadSlotStatus;
  caseOfficer: string;
  leadSource: LeadSource;
  employmentCategory: EmploymentCategory;
  packageAmount: string;
  notes: string;
};

export const CREATE_LEAD_INITIAL_STATE: CreateLeadFormState = {
  leadType: null,
  visaSubtype: "",
  clientName: "",
  email: "",
  phone: "",
  immigrationCountry: "",
  loginId: "",
  password: "",
  slotPortalLoginId: "",
  slotPortalPassword: "",
  slotStatus: "",
  caseOfficer: "",
  leadSource: "MANUAL",
  employmentCategory: DEFAULT_EMPLOYMENT_CATEGORY,
  packageAmount: "",
  notes: "",
};
