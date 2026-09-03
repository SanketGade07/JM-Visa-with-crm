import type { CountryType, LeadSource } from "@/context/CrmContext";
import type { EmploymentCategory } from "@/utils/documentChecklistConfig";
import { DEFAULT_EMPLOYMENT_CATEGORY } from "@/utils/documentChecklistConfig";
import { UNASSIGNED_COUNSELOR } from "@/utils/counselorOptions";
import { isCanadaCountry, isUsaCountry } from "@/utils/countryUtils";

export type CreateLeadType = "study_abroad" | "visa" | "passport" | null;

export type CreateLeadSlotStatus = "available" | "paid" | "";

export type CountryApplicationState = {
  loginId: string;
  password: string;
  slotStatus: CreateLeadSlotStatus;
  slotPortalLoginId: string;
  slotPortalPassword: string;
  usaTrackingMobile: string;
  usaSecurityCar: string;
  usaSecurityFood: string;
  usaSecurityCity: string;
  securityQuestions: Array<{ question: string; answer: string }>;
};

export function getDefaultSecurityQuestions(country?: string): Array<{ question: string; answer: string }> {
  if (country && isCanadaCountry(country)) {
    return [
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
    ];
  }
  if (country && isUsaCountry(country)) {
    return [
      { question: "Car", answer: "" },
      { question: "Food", answer: "" },
      { question: "City", answer: "" },
    ];
  }
  return [];
}

export function getDefaultCountryApplicationState(country?: string): CountryApplicationState {
  return {
    loginId: "",
    password: "",
    slotStatus: "",
    slotPortalLoginId: "",
    slotPortalPassword: "",
    usaTrackingMobile: "",
    usaSecurityCar: "",
    usaSecurityFood: "",
    usaSecurityCity: "",
    securityQuestions: getDefaultSecurityQuestions(country),
  };
}

export const DEFAULT_COUNTRY_APPLICATION_STATE: CountryApplicationState = {
  loginId: "",
  password: "",
  slotStatus: "",
  slotPortalLoginId: "",
  slotPortalPassword: "",
  usaTrackingMobile: "",
  usaSecurityCar: "",
  usaSecurityFood: "",
  usaSecurityCity: "",
  securityQuestions: [
    { question: "Car", answer: "" },
    { question: "Food", answer: "" },
    { question: "City", answer: "" }
  ],
};

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
  securityQuestions: Array<{ question: string; answer: string }>;
  slotStatus: CreateLeadSlotStatus;
  countryApplications: Record<string, CountryApplicationState>;
  activeCountryTab?: string;
  caseOfficer: string;
  leadSource: LeadSource;
  employmentCategory: EmploymentCategory;
  packageAmount: string;
  annualIncome: string;
  referredBy: string;
  notes: string;
  isFromUsaSlotsTab?: boolean;
  isEdit?: boolean;
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
  securityQuestions: [
    { question: "Car", answer: "" },
    { question: "Food", answer: "" },
    { question: "City", answer: "" }
  ],
  slotStatus: "",
  countryApplications: {},
  activeCountryTab: "",
  caseOfficer: UNASSIGNED_COUNSELOR,
  leadSource: "MANUAL",
  employmentCategory: DEFAULT_EMPLOYMENT_CATEGORY,
  packageAmount: "",
  annualIncome: "",
  referredBy: "",
  notes: "",
  isFromUsaSlotsTab: false,
  isEdit: false,
};
