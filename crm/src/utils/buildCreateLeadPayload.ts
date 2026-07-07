import type { Lead } from "@/context/CrmContext";
import {
  buildEmptyChecklist,
  DEFAULT_EMPLOYMENT_CATEGORY,
} from "@/utils/documentChecklistConfig";
import { DEFAULT_USA_SLOTS } from "@/utils/normalizeLead";
import { isUsaCountry, normalizeCrmCountry } from "@/utils/countryUtils";
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
  const loginId = state.loginId.trim();
  const password = state.password.trim();
  const hasCredentials = !!(loginId && password);
  const slotPortalLoginId = state.slotPortalLoginId.trim();
  const slotPortalPassword = state.slotPortalPassword.trim();
  const hasSlotPortalCredentials = !!(slotPortalLoginId && slotPortalPassword);

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

  if (hasCredentials) {
    payload.visaCredentials = { username: loginId, password };
  }

  if (isUsaCountry(country)) {
    const legacyCar = (state.securityQuestions.find(q => q.question.toLowerCase().includes("car"))?.answer || "").trim();
    const legacyFood = (state.securityQuestions.find(q => q.question.toLowerCase().includes("food"))?.answer || "").trim();
    const legacyCity = (state.securityQuestions.find(q => q.question.toLowerCase().includes("city"))?.answer || "").trim();

    payload.usaSlots = {
      ...DEFAULT_USA_SLOTS,
      slotLocation: "Delhi",
      slotsAvailable: state.slotStatus === "available",
      slotsPaid: state.slotStatus === "paid",
      credentialsProvided: hasCredentials,
      ...(hasSlotPortalCredentials && {
        slotPortalUsername: slotPortalLoginId,
        slotPortalPassword: slotPortalPassword,
      }),
      trackingMobile: state.usaTrackingMobile.trim(),
      securityCar: legacyCar || state.usaSecurityCar.trim(),
      securityFood: legacyFood || state.usaSecurityFood.trim(),
      securityCity: legacyCity || state.usaSecurityCity.trim(),
      securityQuestions: state.securityQuestions.map((q) => ({
        question: q.question.trim(),
        answer: q.answer.trim(),
      })),
    };
  }

  return payload;
}
