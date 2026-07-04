"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { PhoneInput } from "@/components/ui/FormInputs";
import { useCrmLayoutContext } from "@/components/crm/context/CrmLayoutContext";
import { useCreateLeadFormContext } from "@/components/crm/context/CreateLeadFormContext";
import { getActiveStepIds } from "@/hooks/useCreateLeadForm";
import { buildCreateLeadPayload } from "@/utils/buildCreateLeadPayload";
import {
  EMPLOYMENT_CATEGORY_OPTIONS,
  DEFAULT_EMPLOYMENT_CATEGORY,
} from "@/utils/documentChecklistConfig";
import type { CountryType, LeadSource } from "@/context/CrmContext";
import type { CreateLeadSlotStatus } from "@/types/createLeadForm";
import {
  LeadTypeSelector,
  VisaSubtypeSelector,
  CountrySelector,
  FormSection,
  FormSectionGrid,
  FORM_INPUT_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_SELECT_CLASS,
  FORM_TEXTAREA_CLASS,
  CompactRadioGroup,
  WizardProgress,
  type WizardStepId,
} from "@/components/crm/leads/create";
import { isUsaCountry } from "@/utils/countryUtils";
import { CreateLeadReviewStep } from "./CreateLeadReviewStep";
import { useCounselorSelectOptions } from "@/hooks/useCounselorOptions";

const DAYS_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

const MONTHS_OPTIONS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const currentYear = new Date().getFullYear();
const ISSUE_YEARS = Array.from({ length: 100 }, (_, i) => String(currentYear - i));
const EXPIRY_YEARS = Array.from({ length: 50 }, (_, i) => String(currentYear + i));

const parseIsoDate = (dateStr: string) => {
  if (!dateStr) return { day: "", month: "", year: "" };
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return { year: parts[0], month: parts[1], day: parts[2] };
  }
  return { day: "", month: "", year: "" };
};

const SLOT_STATUS_OPTIONS: { value: CreateLeadSlotStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "paid", label: "Paid" },
];

type CreateLeadWizardPageProps = {
  variant?: "page" | "inline";
  onClose?: () => void;
};

export function CreateLeadWizardPage({
  variant = "page",
  onClose,
}: CreateLeadWizardPageProps = {}) {
  const router = useRouter();
  const isInline = variant === "inline";
  const { leads, addLead, showToast, canModifyLeads, canAssignLeads, currentUser, openLeadDetail } = useCrmLayoutContext();
  const {
    state,
    currentStep,
    setCurrentStep,
    updateField,
    isStepValid,
    returnToReview,
    navigateToStep,
    editStepFromReview,
    advanceStep,
    getFieldError,
    markFieldTouched,
    validateAllStepsForSubmit,
    focusFieldId,
    clearFocusFieldId,
    completedSteps,
  } = useCreateLeadFormContext();
  const caseOfficerOptions = useCounselorSelectOptions(state.caseOfficer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Staff who can't assign leads (everyone except admins) always create leads
  // assigned to themselves — never "Unassigned". The Case Officer field is locked
  // to the creator, and we force the form value so the saved lead matches.
  const selfAssign = !canAssignLeads && !!currentUser?.name;
  const caseOfficerSelectOptions = selfAssign
    ? [{ value: currentUser!.name, label: `${currentUser!.name} (You)` }]
    : caseOfficerOptions;

  const parsedIssue = parseIsoDate(state.passportIssueDate);
  const parsedExpiry = parseIsoDate(state.passportExpiryDate);

  const handleDatePartChange = (
    field: "passportIssueDate" | "passportExpiryDate",
    part: "day" | "month" | "year",
    value: string,
    currentVal: string
  ) => {
    const parsed = parseIsoDate(currentVal);
    parsed[part] = value;
    const isoString = `${parsed.year || ""}-${parsed.month || ""}-${parsed.day || ""}`;
    updateField(field, isoString);
    markFieldTouched(field);
  };

  useEffect(() => {
    if (selfAssign && state.caseOfficer !== currentUser!.name) {
      updateField("caseOfficer", currentUser!.name);
    }
  }, [selfAssign, currentUser, state.caseOfficer, updateField]);

  useEffect(() => {
    if (!canModifyLeads) {
      if (isInline) {
        onClose?.();
      } else {
        router.replace("/leads");
      }
    }
  }, [canModifyLeads, isInline, onClose, router]);

  useEffect(() => {
    if (!focusFieldId) return;

    const frame = window.requestAnimationFrame(() => {
      const el = document.getElementById(focusFieldId);
      if (el) {
        el.focus({ preventScroll: true });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      clearFocusFieldId();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusFieldId, currentStep, clearFocusFieldId]);

  const goToLeads = useCallback(() => {
    if (isInline) {
      onClose?.();
    } else {
      router.push("/leads");
    }
  }, [isInline, onClose, router]);

  const goToClientInfo = useCallback(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  const handleBack = useCallback(() => {
    if (returnToReview) {
      setCurrentStep(6);
      return;
    }

    if (currentStep === 2) {
      if (state.leadType === "visa") {
        updateField("visaSubtype", "");
      } else {
        updateField("leadType", null);
        updateField("visaSubtype", "");
      }
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      if (state.leadType === "visa" && !state.visaSubtype.trim()) {
        updateField("leadType", null);
        return;
      }
      if (
        state.leadType === "study_abroad" ||
        (state.leadType === "visa" && state.visaSubtype.trim())
      ) {
        if (state.leadType === "visa") {
          updateField("visaSubtype", "");
        } else {
          updateField("leadType", null);
          updateField("visaSubtype", "");
        }
        return;
      }
      goToLeads();
      return;
    }

    const activeSteps = getActiveStepIds(state.leadType);
    const currentIndex = activeSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(activeSteps[currentIndex - 1]);
    }
  }, [
    currentStep,
    goToLeads,
    returnToReview,
    setCurrentStep,
    state.leadType,
    state.visaSubtype,
    updateField,
  ]);

  const handleNext = useCallback(() => {
    advanceStep();
  }, [advanceStep]);

  const handleProgressStepClick = useCallback(
    (step: WizardStepId) => {
      navigateToStep(step);
    },
    [navigateToStep]
  );

  const handleReviewEditStep = useCallback(
    (step: WizardStepId) => {
      editStepFromReview(step);
    },
    [editStepFromReview]
  );

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;
    if (!validateAllStepsForSubmit()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildCreateLeadPayload(state);
      const newId = addLead(payload);
      showToast("Lead initialized successfully!");
      openLeadDetail(newId, "details", { created: true });
      if (isInline) {
        onClose?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    addLead,
    isInline,
    isSubmitting,
    onClose,
    openLeadDetail,
    showToast,
    state,
    validateAllStepsForSubmit,
  ]);

  const stepContent = (() => {
    const clientNameError = getFieldError("clientName");
    const phoneError = getFieldError("phone");
    const immigrationCountryError = getFieldError("immigrationCountry");
    const caseOfficerError = getFieldError("caseOfficer");
    const notesError = getFieldError("notes");
    const leadSourceError = getFieldError("leadSource");
    const referredByError = getFieldError("referredBy");

    const typedDigits = state.phone ? state.phone.replace(/\D/g, "") : "";
    const duplicateLead =
      typedDigits.length >= 7
        ? leads.find(
            (l) => l.phone.replace(/\D/g, "") === typedDigits && !l.isDeleted
          )
        : null;

    return (
      <div className="space-y-4">
        <FormSectionGrid>
          <FormSection
            label="Client Full Name"
            htmlFor="create-lead-client-name"
            error={clientNameError}
          >
            <input
              id="create-lead-client-name"
              value={state.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
              onBlur={() => markFieldTouched("clientName")}
              placeholder="e.g. John Doe"
              type="text"
              className={`${FORM_INPUT_CLASS}${
                clientNameError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
              }`}
            />
          </FormSection>
          <FormSection
            label="Contact Number"
            htmlFor="create-lead-phone"
            error={phoneError}
          >
            <div className="space-y-2">
              <PhoneInput
                id="create-lead-phone"
                value={state.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="9876543210"
              />
              {duplicateLead && (
                <div className="flex items-start gap-2.5 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed shadow-sm">
                  <FaExclamationTriangle className="text-amber-500 text-sm shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Duplicate Number:</span> A lead named{" "}
                    <button
                      type="button"
                      onClick={() => {
                        if (onClose) onClose();
                        openLeadDetail(duplicateLead.id);
                      }}
                      className="font-bold underline hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
                    >
                      {duplicateLead.name}
                    </button>{" "}
                    already exists with this number.
                  </div>
                </div>
              )}
            </div>
          </FormSection>
        </FormSectionGrid>

        <FormSectionGrid>
          <CountrySelector
            inputId="create-lead-immigration-country"
            value={state.immigrationCountry}
            onChange={(value) =>
              updateField("immigrationCountry", value as CountryType | "")
            }
            error={immigrationCountryError}
          />
          <FormSection
            label="Case Officer (Assignee)"
            htmlFor="create-lead-case-officer"
            error={caseOfficerError}
          >
            <select
              id="create-lead-case-officer"
              value={state.caseOfficer}
              onChange={(e) => updateField("caseOfficer", e.target.value)}
              onBlur={() => markFieldTouched("caseOfficer")}
              className={`${FORM_SELECT_CLASS}${
                caseOfficerError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
              }`}
            >
              {caseOfficerSelectOptions.map((officer) => (
                <option key={officer.value} value={officer.value}>
                  {officer.label}
                </option>
              ))}
            </select>
          </FormSection>
        </FormSectionGrid>

        <FormSectionGrid>
          <FormSection
            label="Lead Source"
            htmlFor="create-lead-lead-source"
            error={leadSourceError}
          >
            <select
              id="create-lead-lead-source"
              value={state.leadSource}
              onChange={(e) => updateField("leadSource", e.target.value as LeadSource)}
              onBlur={() => markFieldTouched("leadSource")}
              className={`${FORM_SELECT_CLASS}${
                leadSourceError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
              }`}
            >
              <option value="MANUAL">Manual Entry</option>
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="WALK_IN">Walk-In</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
            </select>
          </FormSection>

          {state.leadSource === "REFERRAL" ? (
            <FormSection
              label="Referred By (Referrer Name)"
              htmlFor="create-lead-referred-by"
              error={referredByError}
            >
              <input
                id="create-lead-referred-by"
                value={state.referredBy}
                onChange={(e) => updateField("referredBy", e.target.value)}
                onBlur={() => markFieldTouched("referredBy")}
                placeholder="e.g. Jane Doe"
                type="text"
                className={`${FORM_INPUT_CLASS}${
                  referredByError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                }`}
              />
            </FormSection>
          ) : (
            <div />
          )}
        </FormSectionGrid>

        <FormSection label="Comment / Notes" error={notesError}>
          <textarea
            id="create-lead-notes"
            rows={4}
            value={state.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            onBlur={() => markFieldTouched("notes")}
            placeholder="Enter initial comments / notes..."
            className={`${FORM_TEXTAREA_CLASS}${
              notesError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
            }`}
          />
        </FormSection>
      </div>
    );
  })();

  if (!canModifyLeads) {
    return null;
  }

  const canProceed = isStepValid();

  return (
    <div
      className={
        isInline
          ? "w-full px-6 py-4"
          : "mx-auto w-full pb-2 max-w-2xl lg:max-w-3xl"
      }
    >
      <div
        className={`bg-white dark:bg-[#0a0a1a] border rounded-2xl overflow-hidden ${
          isInline
            ? "create-lead-glow border-blue-500/70"
            : "border-slate-200 dark:border-slate-800 shadow-xl"
        }`}
      >
        <div
          className={`${
            isInline ? "relative" : "sticky top-0"
          } z-20 px-5 md:px-6 pt-5 pb-3 bg-white/95 dark:bg-[#0a0a1a]/95 backdrop-blur-sm`}
        >
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={goToLeads}
              aria-label="Close wizard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>

        <div className="px-5 md:px-6 py-4 text-xs">
          {stepContent}
        </div>

        <div
          className={`${
            isInline ? "relative" : "sticky bottom-0"
          } z-20 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-5 md:px-6 py-3 bg-white/95 dark:bg-[#0a0a1a]/95 backdrop-blur-sm`}
        >
          <button
            type="button"
            onClick={goToLeads}
            className="py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="py-2.5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white text-xs rounded-xl shadow-lg transition-all"
            >
              {isSubmitting ? "Creating…" : "Create Lead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
