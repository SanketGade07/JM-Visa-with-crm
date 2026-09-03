import type { Lead, CountryApplication } from "@/context/CrmContext";
import {
  buildEmptyChecklist,
  DEFAULT_EMPLOYMENT_CATEGORY,
} from "@/utils/documentChecklistConfig";
import { DEFAULT_USA_SLOTS } from "@/utils/normalizeLead";
import { isCanadaCountry, isUsaCountry, normalizeCrmCountry, parseCountries } from "@/utils/countryUtils";
import { isCounselorAssigned, UNASSIGNED_COUNSELOR } from "@/utils/counselorOptions";
import type { CreateLeadFormState } from "@/types/createLeadForm";

export type CreateLeadPayload = Omit<
  Lead,
  "id" | "dateCreated" | "lastUpdated" | "isDeleted"
>;

export function buildCreateLeadPayload(state: CreateLeadFormState): CreateLeadPayload {
  const employmentCategory = state.employmentCategory || DEFAULT_EMPLOYMENT_CATEGORY;
  const country = normalizeCrmCountry(state.immigrationCountry);
  const totalPackage = parseFloat(state.packageAmount) || 0;

  const payload: CreateLeadPayload = {
    name: state.clientName.trim(),
    email: state.email.trim(),
    phone: state.phone.trim(),
    passportNumber: state.passportNumber.trim(),
    passportIssueDate: state.passportIssueDate.trim(),
    passportExpiryDate: state.passportExpiryDate.trim(),
    passportPlaceOfIssue: state.passportPlaceOfIssue.trim(),
    country,
    visaType: state.visaSubtype.trim(),
    status: "NEW_LEAD",
    source: state.leadSource,
    counselor: isCounselorAssigned(state.caseOfficer)
      ? state.caseOfficer.trim()
      : UNASSIGNED_COUNSELOR,
    notes: state.notes.trim(),
    employmentCategory,
    annualIncome: state.annualIncome.trim(),
    referredBy: state.referredBy.trim(),
    checklist: buildEmptyChecklist(employmentCategory),
    payments:
      totalPackage > 0
        ? [
            {
              totalPackage,
              amountPaid: 0,
              pendingAmount: totalPackage,
              paymentMethod: "Pending",
              invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
              date: new Date().toISOString().split("T")[0],
            },
          ]
        : [],
  };

  const parsedCountries = parseCountries(state.immigrationCountry);
  const countryApplications: Record<string, CountryApplication> = {};

  parsedCountries.forEach((cName) => {
    const appState = state.countryApplications[cName] || {
      loginId: state.loginId,
      password: state.password,
      slotStatus: state.slotStatus,
      slotPortalLoginId: state.slotPortalLoginId,
      slotPortalPassword: state.slotPortalPassword,
      usaTrackingMobile: state.usaTrackingMobile,
      usaSecurityCar: state.usaSecurityCar,
      usaSecurityFood: state.usaSecurityFood,
      usaSecurityCity: state.usaSecurityCity,
      securityQuestions: state.securityQuestions,
    };

    const cLogin = appState.loginId.trim();
    const cPass = appState.password.trim();
    const cHasCreds = !!(cLogin && cPass);

    const countryApp: CountryApplication = {};
    if (cHasCreds) {
      countryApp.visaCredentials = { username: cLogin, password: cPass };
      if (!payload.visaCredentials) {
        payload.visaCredentials = countryApp.visaCredentials;
      }
    }

    if (isUsaCountry(cName)) {
      const cSlotLogin = appState.slotPortalLoginId.trim();
      const cSlotPass = appState.slotPortalPassword.trim();
      const cHasSlotCreds = !!(cSlotLogin && cSlotPass);

      const legacyCar = (appState.securityQuestions.find(q => q.question.toLowerCase().includes("car"))?.answer || "").trim();
      const legacyFood = (appState.securityQuestions.find(q => q.question.toLowerCase().includes("food"))?.answer || "").trim();
      const legacyCity = (appState.securityQuestions.find(q => q.question.toLowerCase().includes("city"))?.answer || "").trim();

      countryApp.usaSlots = {
        ...DEFAULT_USA_SLOTS,
        slotLocation: "Delhi",
        slotsAvailable: appState.slotStatus === "available",
        slotsPaid: appState.slotStatus === "paid",
        credentialsProvided: cHasCreds,
        ...(cHasSlotCreds && {
          slotPortalUsername: cSlotLogin,
          slotPortalPassword: cSlotPass,
        }),
        trackingMobile: appState.usaTrackingMobile.trim(),
        securityCar: legacyCar || appState.usaSecurityCar.trim(),
        securityFood: legacyFood || appState.usaSecurityFood.trim(),
        securityCity: legacyCity || appState.usaSecurityCity.trim(),
        securityQuestions: appState.securityQuestions.map((q) => ({
          question: q.question.trim(),
          answer: q.answer.trim(),
        })),
      };

      payload.usaSlots = countryApp.usaSlots;
    }

    if (isCanadaCountry(cName)) {
      countryApp.securityQuestions = appState.securityQuestions.map((q) => ({
        question: q.question.trim(),
        answer: q.answer.trim(),
      }));
      if (!payload.securityQuestions) {
        payload.securityQuestions = countryApp.securityQuestions;
      }
      if (countryApp.visaCredentials) {
        (countryApp.visaCredentials as any).securityQuestions = countryApp.securityQuestions;
      }
      if (payload.visaCredentials && (isCanadaCountry(state.immigrationCountry) || parsedCountries.length === 1)) {
        (payload.visaCredentials as any).securityQuestions = countryApp.securityQuestions;
      }
    }

    countryApplications[cName] = countryApp;
  });

  if (Object.keys(countryApplications).length > 0) {
    payload.countryApplications = countryApplications;
  }

  return payload;
}
