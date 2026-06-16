"use client";

import { useCallback, useState } from "react";
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

export function validateStep(
  step: WizardStepId,
  state: CreateLeadFormState
): StepValidationResult {
  const errors: string[] = [];

  switch (step) {
    case 1: {
      if (!state.leadType) {
        errors.push("Select a service type.");
      } else if (state.leadType === "visa" && !state.visaSubtype.trim()) {
        errors.push("Select a visa subtype.");
      }
      break;
    }
    case 2: {
      if (!state.clientName.trim()) {
        errors.push("Client name is required.");
      }
      if (!isValidEmail(state.email)) {
        errors.push("Enter a valid email address.");
      }
      if (!isValidE164Phone(state.phone)) {
        errors.push("Enter a valid phone number.");
      }
      break;
    }
    case 3: {
      if (!state.immigrationCountry) {
        errors.push("Select an immigration country.");
      }
      if (!state.loginId.trim()) {
        errors.push("Visa portal login ID is required.");
      }
      if (!state.password.trim()) {
        errors.push("Visa portal password is required.");
      }
      if (isUsaCountry(state.immigrationCountry)) {
        if (!state.slotStatus) {
          errors.push("Select a slot portal type (Available or Paid).");
        }
        if (!state.slotPortalLoginId.trim()) {
          errors.push("Slot portal login ID is required.");
        }
        if (!state.slotPortalPassword.trim()) {
          errors.push("Slot portal password is required.");
        }
      }
      break;
    }
    case 4: {
      if (!state.visaSubtype.trim()) {
        errors.push("Visa subtype is required.");
      }
      if (!state.caseOfficer.trim()) {
        errors.push("Assign a case officer.");
      }
      if (!state.leadSource) {
        errors.push("Select a lead source.");
      }
      if (!state.employmentCategory) {
        errors.push("Select an employment category.");
      }
      if (!isValidPackageAmount(state.packageAmount)) {
        errors.push("Package amount must be a valid non-negative number.");
      }
      break;
    }
    case 5:
      break;
  }

  return { valid: errors.length === 0, errors };
}

export function isStepValid(step: WizardStepId, state: CreateLeadFormState): boolean {
  return validateStep(step, state).valid;
}

export function useCreateLeadForm() {
  const [state, setState] = useState<CreateLeadFormState>(CREATE_LEAD_INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState<WizardStepId>(1);
  const [hasCompletedWizard, setHasCompletedWizard] = useState(false);
  const [returnToReview, setReturnToReview] = useState(false);

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
    },
    []
  );

  const reset = useCallback(() => {
    setState(CREATE_LEAD_INITIAL_STATE);
    setCurrentStep(1);
    setHasCompletedWizard(false);
    setReturnToReview(false);
  }, []);

  const goToStep = useCallback((step: WizardStepId) => {
    setCurrentStep(step);
    if (step === 5) {
      setHasCompletedWizard(true);
      setReturnToReview(false);
    }
  }, []);

  const navigateToStep = useCallback(
    (step: WizardStepId) => {
      if (step === currentStep) return;

      if (!hasCompletedWizard) {
        if (step < currentStep) {
          goToStep(step);
        }
        return;
      }

      if (step === 5) {
        if (returnToReview && !isStepValid(currentStep, state)) {
          return;
        }
        goToStep(5);
        return;
      }

      setReturnToReview(true);
      goToStep(step);
    },
    [currentStep, goToStep, hasCompletedWizard, returnToReview, state]
  );

  const advanceStep = useCallback(() => {
    if (!isStepValid(currentStep, state)) {
      return false;
    }

    if (returnToReview) {
      goToStep(5);
      return true;
    }

    if (currentStep < 5) {
      const nextStep = (currentStep + 1) as WizardStepId;
      goToStep(nextStep);
      return true;
    }

    return false;
  }, [currentStep, goToStep, returnToReview, state]);

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
    returnToReview,
    navigateToStep,
    advanceStep,
    validateStep: validateCurrentStep,
    isStepValid: isCurrentStepValid,
  };
}
