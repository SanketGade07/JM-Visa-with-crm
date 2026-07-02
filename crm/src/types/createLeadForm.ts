import type { CountryType, LeadSource } from "@/context/CrmContext";
import type { EmploymentCategory } from "@/utils/documentChecklistConfig";
import { DEFAULT_EMPLOYMENT_CATEGORY } from "@/utils/documentChecklistConfig";
import { UNASSIGNED_COUNSELOR } from "@/utils/counselorOptions";

export type CreateLeadType = "study_abroad" | "visa" | null;

export type CreateLeadSlotStatus = "available" | "paid" | "";

export type CreateLeadFormState = {
  leadType: CreateLeadType;
  visaSubtype: string;
  clientName: string;
  email: string;
  phone: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  passportPlaceOfIssue: string;
  immigrationCountry: CountryType | "";
  loginId: string;
  password: string;
  slotPortalLoginId: string;
  slotPortalPassword: string;
  usaTrackingMobile: string;
  usaSecurityCar: string;
  usaSecurityFood: string;
  usaSecurityCity: string;
  slotStatus: CreateLeadSlotStatus;
  caseOfficer: string;
  leadSource: LeadSource;
  employmentCategory: EmploymentCategory;
  packageAmount: string;
  annualIncome: string;
  notes: string;
};

export const CREATE_LEAD_INITIAL_STATE: CreateLeadFormState = {
  leadType: null,
  visaSubtype: "",
  clientName: "",
  email: "",
  phone: "",
  passportNumber: "",
  passportIssueDate: "",
  passportExpiryDate: "",
  passportPlaceOfIssue: "",
  immigrationCountry: "",
  loginId: "",
  password: "",
  slotPortalLoginId: "",
  slotPortalPassword: "",
  usaTrackingMobile: "",
  usaSecurityCar: "",
  usaSecurityFood: "",
  usaSecurityCity: "",
  slotStatus: "",
  caseOfficer: UNASSIGNED_COUNSELOR,
  leadSource: "MANUAL",
  employmentCategory: DEFAULT_EMPLOYMENT_CATEGORY,
  packageAmount: "",
  annualIncome: "",
  notes: "",
};
