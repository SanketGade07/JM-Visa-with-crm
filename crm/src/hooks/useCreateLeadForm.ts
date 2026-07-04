"use client";

import { useCallback, useEffect, useState } from "react";
import type { WizardStepId } from "@/components/crm/leads/create/WizardProgress";
import {
  CREATE_LEAD_INITIAL_STATE,
  type CreateLeadFormState,
  type CreateLeadType,
} from "@/types/createLeadForm";
import { isUsaCountry } from "@/utils/countryUtils";
import { isValidE164Phone } from "@/utils/validatePhone";

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
};

const STEP_FIELD_ORDER: Record<WizardStepId, (keyof CreateLeadFormState)[]> = {
  1: ["clientName", "phone", "immigrationCountry", "leadSource", "referredBy", "notes", "caseOfficer"],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
};

export function getActiveStepIds(leadType: CreateLeadType): WizardStepId[] {
  return [1];
}

export function getStepFieldErrors(
  step: WizardStepId,
  state: CreateLeadFormState
): Partial<Record<keyof CreateLeadFormState, string>> {
  const errors: Partial<Record<keyof CreateLeadFormState, string>> = {};

  if (step === 1) {
    if (state.phone && !isValidE164Phone(state.phone)) {
      errors.phone = "Enter a valid phone number.";
    }
  }

  return errors;
}



export function validateStep(
  step: WizardStepId,
  state: CreateLeadFormState
): StepValidationResult {
  const fieldErrors = getStepFieldErrors(step, state);
  const errors = Object.values(fieldErrors);

  return { valid: errors.length === 0, errors };
}

export function isStepValid(step: WizardStepId, state: CreateLeadFormState): boolean {
  return validateStep(step, state).valid;
}

export function findFirstInvalidStep(state: CreateLeadFormState): WizardStepId | null {
  const activeSteps = getActiveStepIds(state.leadType);
  for (const step of activeSteps) {
    if (step < 6 && !validateStep(step, state).valid) {
      return step;
    }
  }
  return null;
}

export function findFirstInvalidField(state: CreateLeadFormState): {
  step: WizardStepId;
  field: keyof CreateLeadFormState;
} | null {
  const activeSteps = getActiveStepIds(state.leadType);
  for (const step of activeSteps) {
    if (step === 6) continue;
    const fieldErrors = getStepFieldErrors(step, state);
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
  state: CreateLeadFormState
): keyof CreateLeadFormState | null {
  const fieldErrors = getStepFieldErrors(step, state);
  for (const field of STEP_FIELD_ORDER[step]) {
    if (fieldErrors[field]) {
      return field;
    }
  }
  return null;
}

export function useCreateLeadForm() {
  const [state, setState] = useState<CreateLeadFormState>(CREATE_LEAD_INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState<WizardStepId>(1);
  const [hasCompletedWizard, setHasCompletedWizard] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStepId>>(() => new Set());
  const [returnToReview, setReturnToReview] = useState(false);
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
          } else if (value === "visa" && prev.visaSubtype === "Study Abroad") {
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

      if (!touchedFields[field] && !validationAttempted) {
        return undefined;
      }

      return getStepFieldErrors(currentStep, state)[field];
    },
    [currentStep, state, submitFieldErrors, touchedFields, validationAttempted]
  );

  const applyValidationFailure = useCallback(
    (step: WizardStepId) => {
      const fieldErrors = getStepFieldErrors(step, state);
      setValidationAttempted(true);
      setSubmitFieldErrors(fieldErrors);

      const firstField = getFirstInvalidFieldForStep(step, state);
      if (firstField) {
        setFocusFieldId(CREATE_LEAD_FIELD_IDS[firstField] ?? null);
      }
    },
    [state]
  );

  const clearFocusFieldId = useCallback(() => {
    setFocusFieldId(null);
  }, []);

  useEffect(() => {
    setCompletedSteps((prev) => {
      let next: Set<WizardStepId> | null = null;
      const activeSteps = getActiveStepIds(state.leadType);

      for (const step of [1, 2, 3, 4, 5, 6] as WizardStepId[]) {
        const isActive = activeSteps.includes(step);
        if (!isActive) {
          if (prev.has(step)) {
            if (!next) next = new Set(prev);
            next.delete(step);
          }
          continue;
        }

        const isValid = isStepValid(step, state);

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
  }, [state, currentStep]);

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

    const activeSteps = getActiveStepIds(state.leadType);
    const currentIndex = activeSteps.indexOf(currentStep);
    if (currentIndex !== -1 && currentIndex < activeSteps.length - 1) {
      const nextStep = activeSteps[currentIndex + 1];
      goToStep(nextStep);
      return true;
    }

    return false;
  }, [applyValidationFailure, currentStep, goToStep, returnToReview, state]);

  const validateAllStepsForSubmit = useCallback((): boolean => {
    const invalid = findFirstInvalidField(state);
    if (!invalid) {
      return true;
    }

    setSubmitFieldErrors(getStepFieldErrors(invalid.step, state));
    setValidationAttempted(true);
    setFocusFieldId(CREATE_LEAD_FIELD_IDS[invalid.field] ?? null);
    goToStep(invalid.step);
    return false;
  }, [goToStep, state]);

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
    getFirstInvalidStep: () => findFirstInvalidStep(state),
  };
}
