"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import type { WizardStepId } from "@/components/crm/leads/create/WizardProgress";
import {
  CREATE_LEAD_INITIAL_STATE,
  type CreateLeadFormState,
  type CreateLeadType,
  type CreateLeadSlotStatus,
} from "@/types/createLeadForm";
import { isUsaCountry } from "@/utils/countryUtils";
import { isValidE164Phone } from "@/utils/validatePhone";

import { useCrm, type Lead } from "@/context/CrmContext";
import { DEFAULT_EMPLOYMENT_CATEGORY } from "@/utils/documentChecklistConfig";
import { UNASSIGNED_COUNSELOR } from "@/utils/counselorOptions";

export type {
  CreateLeadFormState,
  CreateLeadType,
  CreateLeadSlotStatus,
} from "@/types/createLeadForm";
export { CREATE_LEAD_INITIAL_STATE } from "@/types/createLeadForm";

export type StepValidationResult = {
  valid: boolean;
  errors: string[];
};

function getInitialStateFromLead(lead: Lead | null | undefined): CreateLeadFormState {
  if (!lead) return CREATE_LEAD_INITIAL_STATE;
  
  const leadType = lead.visaType === "Study Abroad" 
    ? "study_abroad" 
    : lead.visaType === "Passport"
      ? "passport"
      : "visa";

  const slotStatus: CreateLeadSlotStatus = lead.usaSlots?.slotsPaid 
    ? "paid" 
    : lead.usaSlots?.slotsAvailable 
      ? "available" 
      : "";

  return {
    leadType,
    visaSubtype: lead.visaType || "",
    clientName: lead.name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    passportNumber: lead.passportNumber || "",
    passportIssueDate: lead.passportIssueDate || "",
    passportExpiryDate: lead.passportExpiryDate || "",
    passportPlaceOfIssue: lead.passportPlaceOfIssue || "",
    immigrationCountry: lead.country || "",
    loginId: lead.visaCredentials?.username || "",
    password: lead.visaCredentials?.password || "",
    slotPortalLoginId: lead.usaSlots?.slotPortalUsername || "",
    slotPortalPassword: lead.usaSlots?.slotPortalPassword || "",
    usaTrackingMobile: lead.usaSlots?.trackingMobile || "",
    usaSecurityCar: lead.usaSlots?.securityCar || "",
    usaSecurityFood: lead.usaSlots?.securityFood || "",
    usaSecurityCity: lead.usaSlots?.securityCity || "",
    slotStatus,
    caseOfficer: lead.counselor || UNASSIGNED_COUNSELOR,
    leadSource: lead.source || "MANUAL",
    employmentCategory: lead.employmentCategory || DEFAULT_EMPLOYMENT_CATEGORY,
    packageAmount: lead.payments?.[0]?.totalPackage ? String(lead.payments[0].totalPackage) : "",
    annualIncome: lead.annualIncome || "",
    referredBy: lead.referredBy || "",
    notes: lead.notes || "",
  };
}

export const CREATE_LEAD_FIELD_IDS: Partial<Record<keyof CreateLeadFormState, string>> = {
  leadType: "create-lead-lead-type",
  visaSubtype: "create-lead-visa-subtype",
  clientName: "create-lead-client-name",
  email: "create-lead-email",
  phone: "create-lead-phone",
  passportNumber: "create-lead-passport-number",
  passportIssueDate: "create-lead-passport-issue-date",
  passportExpiryDate: "create-lead-passport-expiry-date",
  passportPlaceOfIssue: "create-lead-passport-place-of-issue",
  immigrationCountry: "create-lead-immigration-country",
  loginId: "create-lead-login-id",
  password: "create-lead-password",
  slotStatus: "create-lead-slot-status",
  slotPortalLoginId: "create-lead-slot-login-id",
  slotPortalPassword: "create-lead-slot-password",
  usaTrackingMobile: "create-lead-usa-mobile",
  usaSecurityCar: "create-lead-usa-car",
  usaSecurityFood: "create-lead-usa-food",
  usaSecurityCity: "create-lead-usa-city",
  caseOfficer: "create-lead-case-officer",
  leadSource: "create-lead-lead-source",
  employmentCategory: "create-lead-employment-category",
  packageAmount: "create-lead-package-amount",
  annualIncome: "create-lead-annual-income",
  referredBy: "create-lead-referred-by",
  notes: "create-lead-notes",
};

const STEP_FIELD_ORDER: Record<WizardStepId, (keyof CreateLeadFormState)[]> = {
  1: ["leadType", "visaSubtype"],
  2: ["clientName", "phone", "immigrationCountry", "caseOfficer", "leadSource", "referredBy", "notes"],
  3: ["passportNumber", "passportIssueDate", "passportExpiryDate", "passportPlaceOfIssue"],
  4: [
    "immigrationCountry",
    "loginId",
    "password",
    "slotStatus",
    "slotPortalLoginId",
    "slotPortalPassword",
    "usaTrackingMobile",
    "usaSecurityCar",
    "usaSecurityFood",
    "usaSecurityCity",
  ],
  5: ["visaSubtype", "employmentCategory", "packageAmount", "annualIncome", "email"],
  6: [],
};

export function getActiveStepIds(leadType: CreateLeadType): WizardStepId[] {
  if (leadType === "visa") {
    return [1, 2, 3, 4, 5, 6];
  }
  return [1, 2, 4, 5, 6];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length > 0 && EMAIL_PATTERN.test(trimmed);
}

function isValidPackageAmount(value: string): boolean {
  if (!value.trim()) return true;
  const parsed = parseFloat(value);
  return !Number.isNaN(parsed) && parsed >= 0;
}

function isValidAnnualIncome(value: string): boolean {
  if (!value.trim()) return true;
  const parsed = parseFloat(value);
  return !Number.isNaN(parsed) && parsed >= 0;
}

export function getStepFieldErrors(
  step: WizardStepId,
  state: CreateLeadFormState,
  leads?: Lead[],
  excludeLeadId?: string
): Partial<Record<keyof CreateLeadFormState, string>> {
  const errors: Partial<Record<keyof CreateLeadFormState, string>> = {};

  switch (step) {
    case 1: {
      if (!state.leadType) {
        errors.leadType = "Select a service type.";
      } else if (state.leadType === "visa" && !state.visaSubtype.trim()) {
        errors.visaSubtype = "Select a visa subtype.";
      }
      break;
    }
    case 2: {
      if (!state.clientName.trim()) {
        errors.clientName = "Client name is required.";
      }
      if (!isValidE164Phone(state.phone)) {
        errors.phone = "Enter a valid phone number.";
      } else if (leads) {
        const normalizedPhone = state.phone.trim();
        const exists = leads.some((l) => l.id !== excludeLeadId && l.phone?.trim() === normalizedPhone);
        if (exists) {
          errors.phone = "This phone number already exists.";
        }
      }
      if (!state.leadSource) {
        errors.leadSource = "Select a lead source.";
      }
      break;
    }
    case 3: {
      if (state.leadType === "visa") {
        if (!state.passportNumber.trim()) {
          errors.passportNumber = "Passport number is required.";
        }
        const issueParts = state.passportIssueDate.split("-");
        if (issueParts.length < 3 || issueParts.some((p) => !p.trim())) {
          errors.passportIssueDate = "Passport issue date is required.";
        }
        const expiryParts = state.passportExpiryDate.split("-");
        if (expiryParts.length < 3 || expiryParts.some((p) => !p.trim())) {
          errors.passportExpiryDate = "Passport expiry date is required.";
        }
        if (!state.passportPlaceOfIssue.trim()) {
          errors.passportPlaceOfIssue = "Passport place of issue is required.";
        }
      }
      break;
    }
    case 4: {
      if (!state.immigrationCountry) {
        errors.immigrationCountry = "Select an immigration country.";
      }
      if (!state.loginId.trim()) {
        errors.loginId = "Visa portal login ID is required.";
      }
      if (!state.password.trim()) {
        errors.password = "Visa portal password is required.";
      }
      if (isUsaCountry(state.immigrationCountry)) {
        if (!state.slotStatus) {
          errors.slotStatus = "Select a slot portal type (Available or Paid).";
        }
        if (!state.slotPortalLoginId.trim()) {
          errors.slotPortalLoginId = "Slot portal login ID is required.";
        }
        if (!state.slotPortalPassword.trim()) {
          errors.slotPortalPassword = "Slot portal password is required.";
        }
        if (!state.usaTrackingMobile.trim()) {
          errors.usaTrackingMobile = "Mobile number is required.";
        }
        if (!state.usaSecurityCar.trim()) {
          errors.usaSecurityCar = "Car is required.";
        }
        if (!state.usaSecurityFood.trim()) {
          errors.usaSecurityFood = "Food is required.";
        }
        if (!state.usaSecurityCity.trim()) {
          errors.usaSecurityCity = "City is required.";
        }
      }
      break;
    }
    case 5: {
      if (!state.visaSubtype.trim()) {
        errors.visaSubtype = "Visa subtype is required.";
      }
      if (!state.employmentCategory) {
        errors.employmentCategory = "Select an employment category.";
      }
      if (!isValidPackageAmount(state.packageAmount)) {
        errors.packageAmount = "Service charges must be a valid non-negative number.";
      }
      if (!isValidAnnualIncome(state.annualIncome)) {
        errors.annualIncome = "Annual income must be a valid non-negative number.";
      }
      if (state.email.trim() && !isValidEmail(state.email)) {
        errors.email = "Enter a valid email address.";
      }
      break;
    }
    case 6:
      break;
  }

  return errors;
}



export function validateStep(
  step: WizardStepId,
  state: CreateLeadFormState,
  leads?: Lead[],
  excludeLeadId?: string
): StepValidationResult {
  const fieldErrors = getStepFieldErrors(step, state, leads, excludeLeadId);
  const errors = Object.values(fieldErrors);

  return { valid: errors.length === 0, errors };
}

export function isStepValid(
  step: WizardStepId,
  state: CreateLeadFormState,
  leads?: Lead[],
  excludeLeadId?: string
): boolean {
  return validateStep(step, state, leads, excludeLeadId).valid;
}

export function findFirstInvalidStep(
  state: CreateLeadFormState,
  activeStepsOverride?: WizardStepId[],
  leads?: Lead[],
  excludeLeadId?: string
): WizardStepId | null {
  const activeSteps = activeStepsOverride ?? getActiveStepIds(state.leadType);
  for (const step of activeSteps) {
    if (step < 6 && !validateStep(step, state, leads, excludeLeadId).valid) {
      return step;
    }
  }
  return null;
}

export function findFirstInvalidField(
  state: CreateLeadFormState,
  activeStepsOverride?: WizardStepId[],
  leads?: Lead[],
  excludeLeadId?: string
): {
  step: WizardStepId;
  field: keyof CreateLeadFormState;
} | null {
  const activeSteps = activeStepsOverride ?? getActiveStepIds(state.leadType);
  for (const step of activeSteps) {
    if (step === 6) continue;
    const fieldErrors = getStepFieldErrors(step, state, leads, excludeLeadId);
    if (Object.keys(fieldErrors).length === 0) {
      continue;
    }

    for (const field of STEP_FIELD_ORDER[step]) {
      if (fieldErrors[field]) {
        return { step, field };
      }
    }

    const firstField = Object.keys(fieldErrors)[0] as keyof CreateLeadFormState;
    return { step, field: firstField };
  }

  return null;
}

function getFirstInvalidFieldForStep(
  step: WizardStepId,
  state: CreateLeadFormState,
  leads?: Lead[],
  excludeLeadId?: string
): keyof CreateLeadFormState | null {
  const fieldErrors = getStepFieldErrors(step, state, leads, excludeLeadId);
  for (const field of STEP_FIELD_ORDER[step]) {
    if (fieldErrors[field]) {
      return field;
    }
  }
  return null;
}

export function useCreateLeadForm(lead?: Lead | null) {
  const { leads } = useCrm();
  const leadId = lead?.id;

  const [state, setState] = useState<CreateLeadFormState>(() => getInitialStateFromLead(lead));

  const activeSteps = useMemo(() => {
    if (lead) {
      if (state.leadType === "visa") {
        return [3, 4, 5, 6] as WizardStepId[];
      }
      return [4, 5, 6] as WizardStepId[];
    }
    return [1, 2] as WizardStepId[];
  }, [lead, state.leadType]);

  const [currentStep, setCurrentStep] = useState<WizardStepId>(() => {
    if (lead) {
      const initialState = getInitialStateFromLead(lead);
      const localActive = initialState.leadType === "visa" ? ([3, 4, 5, 6] as WizardStepId[]) : ([4, 5, 6] as WizardStepId[]);
      const firstInvalid = findFirstInvalidStep(initialState, localActive, leads, leadId);
      return firstInvalid ?? (initialState.leadType === "visa" ? 3 : 4);
    }
    return 1;
  });
  const [hasCompletedWizard, setHasCompletedWizard] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStepId>>(() => {
    if (lead) {
      const valid = new Set<WizardStepId>();
      const localActive = lead.visaType === "Study Abroad" ? ([4, 5, 6] as WizardStepId[]) : lead.visaType === "Passport" ? ([4, 5, 6] as WizardStepId[]) : ([3, 4, 5, 6] as WizardStepId[]);
      const initialState = getInitialStateFromLead(lead);
      for (const stepId of localActive) {
        if (isStepValid(stepId, initialState, leads, leadId)) {
          valid.add(stepId);
        }
      }
      return valid;
    }
    return new Set<WizardStepId>();
  });
  const [returnToReview, setReturnToReview] = useState(false);

  useEffect(() => {
    const initialState = getInitialStateFromLead(lead);
    setState(initialState);
    if (lead) {
      const valid = new Set<WizardStepId>();
      const localActive = initialState.leadType === "visa" ? ([3, 4, 5, 6] as WizardStepId[]) : ([4, 5, 6] as WizardStepId[]);
      for (const stepId of localActive) {
        if (isStepValid(stepId, initialState, leads, leadId)) {
          valid.add(stepId);
        }
      }
      setCompletedSteps(valid);
      const firstInvalid = findFirstInvalidStep(initialState, localActive, leads, leadId);
      setCurrentStep(firstInvalid ?? (initialState.leadType === "visa" ? 3 : 4));
    } else {
      setCompletedSteps(new Set());
      setCurrentStep(1);
    }
    setHasCompletedWizard(false);
    setValidationAttempted(false);
    setSubmitFieldErrors({});
    setTouchedFields({});
  }, [lead, leads, leadId]);

  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<keyof CreateLeadFormState, boolean>>
  >({});
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [submitFieldErrors, setSubmitFieldErrors] = useState<
    Partial<Record<keyof CreateLeadFormState, string>>
  >({});
  const [focusFieldId, setFocusFieldId] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof CreateLeadFormState>(key: K, value: CreateLeadFormState[K]) => {
      setState((prev) => {
        const next: CreateLeadFormState = { ...prev, [key]: value };

        if (key === "leadType") {
          if (value === "study_abroad") {
            next.visaSubtype = "Study Abroad";
          } else if (value === "passport") {
            next.visaSubtype = "Passport";
          } else if (value === "visa" && (prev.visaSubtype === "Study Abroad" || prev.visaSubtype === "Passport")) {
            next.visaSubtype = "";
          }
        }

        return next;
      });
      setSubmitFieldErrors((prev) => {
        if (!prev[key]) {
          return prev;
        }
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const reset = useCallback(() => {
    setState(CREATE_LEAD_INITIAL_STATE);
    setCurrentStep(1);
    setHasCompletedWizard(false);
    setCompletedSteps(new Set());
    setReturnToReview(false);
    setTouchedFields({});
    setValidationAttempted(false);
    setSubmitFieldErrors({});
    setFocusFieldId(null);
  }, []);

  const markFieldTouched = useCallback((field: keyof CreateLeadFormState) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  }, []);

  const markValidationAttempted = useCallback(() => {
    setValidationAttempted(true);
  }, []);

  const getFieldError = useCallback(
    (field: keyof CreateLeadFormState): string | undefined => {
      if (submitFieldErrors[field]) {
        return submitFieldErrors[field];
      }

      // Check if we have an immediate phone duplicate error
      const currentErrors = getStepFieldErrors(currentStep, state, leads, leadId);
      if (field === "phone" && currentErrors.phone === "This phone number already exists.") {
        return currentErrors.phone;
      }

      if (!touchedFields[field] && !validationAttempted) {
        return undefined;
      }

      return currentErrors[field];
    },
    [currentStep, state, submitFieldErrors, touchedFields, validationAttempted, leads, leadId]
  );

  const applyValidationFailure = useCallback(
    (step: WizardStepId) => {
      const fieldErrors = getStepFieldErrors(step, state, leads, leadId);
      setValidationAttempted(true);
      setSubmitFieldErrors(fieldErrors);

      const firstField = getFirstInvalidFieldForStep(step, state, leads, leadId);
      if (firstField) {
        setFocusFieldId(CREATE_LEAD_FIELD_IDS[firstField] ?? null);
      }
    },
    [state, leads, leadId]
  );

  const clearFocusFieldId = useCallback(() => {
    setFocusFieldId(null);
  }, []);

  useEffect(() => {
    setCompletedSteps((prev) => {
      let next: Set<WizardStepId> | null = null;

      for (const step of [1, 2, 3, 4, 5, 6] as WizardStepId[]) {
        const isActive = activeSteps.includes(step);
        if (!isActive) {
          if (prev.has(step)) {
            if (!next) next = new Set(prev);
            next.delete(step);
          }
          continue;
        }

        const isValid = isStepValid(step, state, leads, leadId);

        if (prev.has(step)) {
          if (!isValid) {
            if (!next) {
              next = new Set(prev);
            }
            next.delete(step);
          }
        } else if (step < currentStep && isValid) {
          if (!next) {
            next = new Set(prev);
          }
          next.add(step);
        }
      }

      return next ?? prev;
    });
  }, [state, currentStep, activeSteps, leads, leadId]);

  const goToStep = useCallback((step: WizardStepId) => {
    setCurrentStep(step);
    if (step === 6) {
      setHasCompletedWizard(true);
      setReturnToReview(false);
    }
  }, []);

  const navigateToStep = useCallback(
    (step: WizardStepId) => {
      if (step === currentStep) return;
      goToStep(step);
    },
    [currentStep, goToStep]
  );

  const editStepFromReview = useCallback(
    (step: WizardStepId) => {
      if (step === currentStep) return;
      if (currentStep !== 6 || step >= 6) return;
      setReturnToReview(true);
      goToStep(step);
    },
    [currentStep, goToStep]
  );

  const advanceStep = useCallback(() => {
    if (!isStepValid(currentStep, state)) {
      applyValidationFailure(currentStep);
      return false;
    }

    setSubmitFieldErrors({});

    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });

    if (returnToReview) {
      goToStep(6);
      return true;
    }

    const currentIndex = activeSteps.indexOf(currentStep);
    if (currentIndex !== -1 && currentIndex < activeSteps.length - 1) {
      const nextStep = activeSteps[currentIndex + 1];
      goToStep(nextStep);
      return true;
    }

    return false;
  }, [applyValidationFailure, currentStep, goToStep, returnToReview, state, activeSteps]);

  const validateAllStepsForSubmit = useCallback((): boolean => {
    const invalid = findFirstInvalidField(state, activeSteps);
    if (!invalid) {
      return true;
    }

    setSubmitFieldErrors(getStepFieldErrors(invalid.step, state));
    setValidationAttempted(true);
    setFocusFieldId(CREATE_LEAD_FIELD_IDS[invalid.field] ?? null);
    goToStep(invalid.step);
    return false;
  }, [goToStep, state, activeSteps]);

  const validateCurrentStep = useCallback(
    () => validateStep(currentStep, state),
    [currentStep, state]
  );

  const isCurrentStepValid = useCallback(
    () => isStepValid(currentStep, state),
    [currentStep, state]
  );

  return {
    state,
    currentStep,
    setCurrentStep: goToStep,
    updateField,
    reset,
    hasCompletedWizard,
    completedSteps,
    returnToReview,
    navigateToStep,
    editStepFromReview,
    advanceStep,
    validateStep: validateCurrentStep,
    isStepValid: isCurrentStepValid,
    getFieldError,
    markFieldTouched,
    markValidationAttempted,
    validateAllStepsForSubmit,
    focusFieldId,
    clearFocusFieldId,
    getFirstInvalidStep: () => findFirstInvalidStep(state, activeSteps),
    activeStepIds: activeSteps,
  };
}
