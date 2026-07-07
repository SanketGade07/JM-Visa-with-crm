"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaTimes } from "react-icons/fa";
import { PhoneInput } from "@/components/ui/FormInputs";
import { useCrmLayoutContext } from "@/components/crm/context/CrmLayoutContext";
import { useCreateLeadFormContext, CreateLeadFormContext } from "@/components/crm/context/CreateLeadFormContext";
import { getActiveStepIds, useCreateLeadForm } from "@/hooks/useCreateLeadForm";
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
  editLeadId?: string | null;
};

export function CreateLeadWizardPage({
  variant = "page",
  onClose,
  editLeadId,
}: CreateLeadWizardPageProps = {}) {
  const { leads } = useCrmLayoutContext();
  const lead = editLeadId ? leads.find((l) => l.id === editLeadId) ?? null : null;

  if (editLeadId) {
    return (
      <CreateLeadWizardWrapper
        variant={variant}
        onClose={onClose}
        editLeadId={editLeadId}
        lead={lead}
      />
    );
  }

  return (
    <CreateLeadWizardInner
      variant={variant}
      onClose={onClose}
    />
  );
}

function CreateLeadWizardWrapper({
  variant,
  onClose,
  editLeadId,
  lead,
}: CreateLeadWizardPageProps & { lead: any }) {
  const form = useCreateLeadForm(lead);
  return (
    <CreateLeadFormContext.Provider value={form}>
      <CreateLeadWizardInner
        variant={variant}
        onClose={onClose}
        editLeadId={editLeadId}
      />
    </CreateLeadFormContext.Provider>
  );
}

function CreateLeadWizardInner({
  variant = "page",
  onClose,
  editLeadId,
}: CreateLeadWizardPageProps = {}) {
  const router = useRouter();
  const isInline = variant === "inline";
  const { addLead, showToast, canModifyLeads, canAssignLeads, currentUser, openLeadDetail, updateLeadFromWizard } = useCrmLayoutContext();
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
    activeStepIds,
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

    const activeSteps = activeStepIds;
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
    activeStepIds,
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

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (!validateAllStepsForSubmit()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const basePayload = buildCreateLeadPayload(state);
      const payload = {
        ...basePayload,
        profileCompleted: !!editLeadId,
      };
      if (editLeadId) {
        const ok = await updateLeadFromWizard(editLeadId, payload);
        if (ok) {
          showToast("Lead profile completed successfully!");
          openLeadDetail(editLeadId, "details");
          if (onClose) onClose();
        } else {
          showToast("Failed to update lead", "error");
        }
      } else {
        const newId = addLead(payload);
        showToast("Lead created successfully!");
        openLeadDetail(newId, "details", { created: true });
        if (isInline) {
          onClose?.();
        }
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
    editLeadId,
    updateLeadFromWizard,
  ]);

  const showVisaSubtypePicker =
    state.leadType === "visa" && !state.visaSubtype.trim();

  const handleSecurityQuestionChange = (index: number, val: string) => {
    const list = [...state.securityQuestions];
    list[index] = { ...list[index], question: val };
    updateField("securityQuestions", list);
  };

  const handleSecurityAnswerChange = (index: number, val: string) => {
    const list = [...state.securityQuestions];
    list[index] = { ...list[index], answer: val };
    updateField("securityQuestions", list);
  };

  const handleAddSecurityQuestion = () => {
    updateField("securityQuestions", [
      ...state.securityQuestions,
      { question: "", answer: "" },
    ]);
  };

  const handleRemoveSecurityQuestion = (index: number) => {
    const list = state.securityQuestions.filter((_, i) => i !== index);
    updateField("securityQuestions", list);
  };

  const stepContent = (() => {
    switch (currentStep) {
      case 1: {
        const leadTypeError = getFieldError("leadType");
        const visaSubtypeError = getFieldError("visaSubtype");

        if (returnToReview) {
          return (
            <div className="space-y-4">
              <LeadTypeSelector
                onSelectStudyAbroad={() => {
                  updateField("leadType", "study_abroad");
                  updateField("visaSubtype", "Study Abroad");
                }}
                onSelectVisa={() => updateField("leadType", "visa")}
                onSelectPassport={() => {
                  updateField("leadType", "passport");
                  updateField("visaSubtype", "Passport");
                }}
              />
              {leadTypeError ? (
                <p className="text-red-500 dark:text-red-400 text-[10px] font-medium">
                  {leadTypeError}
                </p>
              ) : null}
              {state.leadType === "visa" && (
                <>
                  <VisaSubtypeSelector
                    onSelect={(visaSubtype) => updateField("visaSubtype", visaSubtype)}
                  />
                  {visaSubtypeError ? (
                    <p className="text-red-500 dark:text-red-400 text-[10px] font-medium">
                      {visaSubtypeError}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {showVisaSubtypePicker ? (
              <>
                <VisaSubtypeSelector
                  onSelect={(visaSubtype) => {
                    updateField("visaSubtype", visaSubtype);
                    goToClientInfo();
                  }}
                />
                {visaSubtypeError ? (
                  <p className="text-red-500 dark:text-red-400 text-[10px] font-medium">
                    {visaSubtypeError}
                  </p>
                ) : null}
              </>
            ) : !state.leadType ? (
              <>
                <LeadTypeSelector
                  onSelectStudyAbroad={() => {
                    updateField("leadType", "study_abroad");
                    updateField("visaSubtype", "Study Abroad");
                    goToClientInfo();
                  }}
                  onSelectVisa={() => updateField("leadType", "visa")}
                  onSelectPassport={() => {
                    updateField("leadType", "passport");
                    updateField("visaSubtype", "Passport");
                    goToClientInfo();
                  }}
                />
                {leadTypeError ? (
                  <p className="text-red-500 dark:text-red-400 text-[10px] font-medium">
                    {leadTypeError}
                  </p>
                ) : null}
              </>
            ) : (
              <div className="rounded-xl border border-violet-200 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-950/20 p-4 text-xs">
                <p className="text-slate-500 dark:text-slate-400 font-semibold">Selected</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                  {state.leadType === "study_abroad" ? "Study Abroad" : state.visaSubtype}
                </p>
              </div>
            )}
          </div>
        );
      }

      case 2: {
        const clientNameError = getFieldError("clientName");
        const phoneError = getFieldError("phone");
        const immigrationCountryError = getFieldError("immigrationCountry");
        const caseOfficerError = getFieldError("caseOfficer");
        const leadSourceError = getFieldError("leadSource");
        const referredByError = getFieldError("referredBy");
        const loginIdError = getFieldError("loginId");
        const passwordError = getFieldError("password");
        const slotStatusError = getFieldError("slotStatus");
        const slotPortalLoginIdError = getFieldError("slotPortalLoginId");
        const slotPortalPasswordError = getFieldError("slotPortalPassword");
        const usaTrackingMobileError = getFieldError("usaTrackingMobile");
        const usaSecurityCarError = getFieldError("usaSecurityCar");
        const usaSecurityFoodError = getFieldError("usaSecurityFood");
        const usaSecurityCityError = getFieldError("usaSecurityCity");
        return (
          <div className="space-y-4">
            <FormSectionGrid>
              <FormSection
                label="Client Full Name"
                htmlFor="create-lead-client-name"
                error={clientNameError}
                required
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
                required
              >
                <PhoneInput
                  id="create-lead-phone"
                  value={state.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="9876543210"
                />
              </FormSection>
            </FormSectionGrid>
            {state.immigrationCountry !== "USA" ? (
              <>
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
                      value={selfAssign ? currentUser!.name : state.caseOfficer}
                      onChange={(e) => updateField("caseOfficer", e.target.value)}
                      onBlur={() => markFieldTouched("caseOfficer")}
                      disabled={!canAssignLeads}
                      className={`${FORM_SELECT_CLASS}${
                        caseOfficerError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
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
                      onChange={(e) =>
                        updateField("leadSource", e.target.value as LeadSource)
                      }
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
                      label="Referred By"
                      htmlFor="create-lead-referred-by"
                      error={referredByError}
                    >
                      <input
                        id="create-lead-referred-by"
                        value={state.referredBy}
                        onChange={(e) => updateField("referredBy", e.target.value)}
                        onBlur={() => markFieldTouched("referredBy")}
                        placeholder="Enter referral name"
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
              </>
            ) : (
              <>
                <FormSectionGrid>
                  <FormSection
                    label="Case Officer (Assignee)"
                    htmlFor="create-lead-case-officer"
                    error={caseOfficerError}
                  >
                    <select
                      id="create-lead-case-officer"
                      value={selfAssign ? currentUser!.name : state.caseOfficer}
                      onChange={(e) => updateField("caseOfficer", e.target.value)}
                      onBlur={() => markFieldTouched("caseOfficer")}
                      disabled={!canAssignLeads}
                      className={`${FORM_SELECT_CLASS}${
                        caseOfficerError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {caseOfficerSelectOptions.map((officer) => (
                        <option key={officer.value} value={officer.value}>
                          {officer.label}
                        </option>
                      ))}
                    </select>
                  </FormSection>
                  <FormSection
                    label="Lead Source"
                    htmlFor="create-lead-lead-source"
                    error={leadSourceError}
                  >
                    <select
                      id="create-lead-lead-source"
                      value={state.leadSource}
                      onChange={(e) =>
                        updateField("leadSource", e.target.value as LeadSource)
                      }
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
                </FormSectionGrid>
                {state.leadSource === "REFERRAL" && (
                  <FormSectionGrid>
                    <div />
                    <FormSection
                      label="Referred By"
                      htmlFor="create-lead-referred-by"
                      error={referredByError}
                    >
                      <input
                        id="create-lead-referred-by"
                        value={state.referredBy}
                        onChange={(e) => updateField("referredBy", e.target.value)}
                        onBlur={() => markFieldTouched("referredBy")}
                        placeholder="Enter referral name"
                        type="text"
                        className={`${FORM_INPUT_CLASS}${
                          referredByError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                        }`}
                      />
                    </FormSection>
                  </FormSectionGrid>
                )}
              </>
            )}


            {isUsaCountry(state.immigrationCountry) && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Visa Portal
                  </p>
                  <FormSectionGrid>
                    <FormSection
                      label="Login ID"
                      htmlFor="create-lead-login-id-step2"
                      error={loginIdError}
                    >
                      <input
                        id="create-lead-login-id-step2"
                        value={state.loginId}
                        onChange={(e) => updateField("loginId", e.target.value)}
                        onBlur={() => markFieldTouched("loginId")}
                        placeholder="Visa portal username"
                        type="text"
                        className={`${FORM_INPUT_CLASS}${
                          loginIdError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                        }`}
                        autoComplete="off"
                      />
                    </FormSection>
                    <FormSection
                      label="Password"
                      htmlFor="create-lead-password-step2"
                      error={passwordError}
                    >
                      <input
                        id="create-lead-password-step2"
                        value={state.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        onBlur={() => markFieldTouched("password")}
                        placeholder="Visa portal password"
                        type="text"
                        className={`${FORM_INPUT_CLASS}${
                          passwordError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                        }`}
                        autoComplete="new-password"
                      />
                    </FormSection>
                  </FormSectionGrid>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Slot Portal
                  </p>
                  <FormSection label="Portal Type">
                    <CompactRadioGroup
                      name="slotStatus"
                      value={state.slotStatus}
                      options={SLOT_STATUS_OPTIONS}
                      onChange={(value) => updateField("slotStatus", value)}
                      firstOptionId="create-lead-slot-status-step2"
                      error={slotStatusError}
                    />
                  </FormSection>
                  <FormSectionGrid>
                    <FormSection
                      label="Login ID"
                      htmlFor="create-lead-slot-login-id-step2"
                      error={slotPortalLoginIdError}
                    >
                      <input
                        id="create-lead-slot-login-id-step2"
                        value={state.slotPortalLoginId}
                        onChange={(e) => updateField("slotPortalLoginId", e.target.value)}
                        onBlur={() => markFieldTouched("slotPortalLoginId")}
                        placeholder="Slot portal username"
                        type="text"
                        className={`${FORM_INPUT_CLASS}${
                          slotPortalLoginIdError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                        }`}
                        autoComplete="off"
                      />
                    </FormSection>
                    <FormSection
                      label="Password"
                      htmlFor="create-lead-slot-password-step2"
                      error={slotPortalPasswordError}
                    >
                      <input
                        id="create-lead-slot-password-step2"
                        value={state.slotPortalPassword}
                        onChange={(e) => updateField("slotPortalPassword", e.target.value)}
                        onBlur={() => markFieldTouched("slotPortalPassword")}
                        placeholder="Slot portal password"
                        type="text"
                        className={`${FORM_INPUT_CLASS}${
                          slotPortalPasswordError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                        }`}
                        autoComplete="new-password"
                      />
                    </FormSection>
                  </FormSectionGrid>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    USA Slot Tracking
                  </p>
                  <FormSectionGrid>
                    <FormSection
                      label="Mobile Number"
                      htmlFor="create-lead-usa-mobile-step2"
                      error={usaTrackingMobileError}
                    >
                      <input
                        id="create-lead-usa-mobile-step2"
                        value={state.usaTrackingMobile}
                        onChange={(e) => updateField("usaTrackingMobile", e.target.value)}
                        onBlur={() => markFieldTouched("usaTrackingMobile")}
                        placeholder="Tracking mobile number"
                        type="text"
                        className={`${FORM_INPUT_CLASS}${
                          usaTrackingMobileError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                        }`}
                        autoComplete="off"
                      />
                    </FormSection>
                    <div />
                  </FormSectionGrid>

                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Security Questions
                      </p>
                      <button
                        type="button"
                        onClick={handleAddSecurityQuestion}
                        className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Question
                      </button>
                    </div>

                    {state.securityQuestions.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                        No security questions added. Click "Add Question" to add one.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {state.securityQuestions.map((q, idx) => {
                          const questionError = getFieldError(`securityQuestion_${idx}_question` as any);
                          const answerError = getFieldError(`securityQuestion_${idx}_answer` as any);
                          return (
                            <div key={idx} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">
                                    Question {idx + 1}
                                  </label>
                                  <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) => handleSecurityQuestionChange(idx, e.target.value)}
                                    placeholder="e.g. Mother's maiden name"
                                    className={`${FORM_INPUT_CLASS} text-sm`}
                                  />
                                  {questionError && (
                                    <p className="text-xs text-red-500 mt-1">{questionError}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">
                                    Answer
                                  </label>
                                  <input
                                    type="text"
                                    value={q.answer}
                                    onChange={(e) => handleSecurityAnswerChange(idx, e.target.value)}
                                    placeholder="Enter answer"
                                    className={`${FORM_INPUT_CLASS} text-sm`}
                                  />
                                  {answerError && (
                                    <p className="text-xs text-red-500 mt-1">{answerError}</p>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveSecurityQuestion(idx)}
                                className="mt-6 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Remove question"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <FormSection label="Comment / Notes" htmlFor="create-lead-notes">
              <textarea
                id="create-lead-notes"
                rows={3}
                value={state.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Enter initial comments / notes..."
                className={FORM_TEXTAREA_CLASS}
              />
            </FormSection>
          </div>
        );
      }

      case 3: {
        const passportNumberError = getFieldError("passportNumber");
        const passportIssueDateError = getFieldError("passportIssueDate");
        const passportExpiryDateError = getFieldError("passportExpiryDate");
        const passportPlaceOfIssueError = getFieldError("passportPlaceOfIssue");

        return (
          <div className="space-y-4">
            <FormSection
              label="Passport Number"
              htmlFor="create-lead-passport-number"
              error={passportNumberError}
            >
              <input
                id="create-lead-passport-number"
                value={state.passportNumber}
                onChange={(e) => updateField("passportNumber", e.target.value)}
                onBlur={() => markFieldTouched("passportNumber")}
                placeholder="e.g. A1234567"
                type="text"
                className={`${FORM_INPUT_CLASS}${
                  passportNumberError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                }`}
              />
            </FormSection>
            <FormSectionGrid>
              <FormSection
                label="Passport Issue Date"
                error={passportIssueDateError}
              >
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={parsedIssue.day}
                    onChange={(e) => handleDatePartChange("passportIssueDate", "day", e.target.value, state.passportIssueDate)}
                    className={FORM_SELECT_CLASS}
                  >
                    <option value="">Day</option>
                    {DAYS_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={parsedIssue.month}
                    onChange={(e) => handleDatePartChange("passportIssueDate", "month", e.target.value, state.passportIssueDate)}
                    className={FORM_SELECT_CLASS}
                  >
                    <option value="">Month</option>
                    {MONTHS_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="Year"
                    value={parsedIssue.year}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ""); // Digits only
                      handleDatePartChange("passportIssueDate", "year", val, state.passportIssueDate);
                    }}
                    className={FORM_INPUT_CLASS}
                  />
                </div>
              </FormSection>
              <FormSection
                label="Passport Expiry Date"
                error={passportExpiryDateError}
              >
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={parsedExpiry.day}
                    onChange={(e) => handleDatePartChange("passportExpiryDate", "day", e.target.value, state.passportExpiryDate)}
                    className={FORM_SELECT_CLASS}
                  >
                    <option value="">Day</option>
                    {DAYS_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={parsedExpiry.month}
                    onChange={(e) => handleDatePartChange("passportExpiryDate", "month", e.target.value, state.passportExpiryDate)}
                    className={FORM_SELECT_CLASS}
                  >
                    <option value="">Month</option>
                    {MONTHS_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="Year"
                    value={parsedExpiry.year}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ""); // Digits only
                      handleDatePartChange("passportExpiryDate", "year", val, state.passportExpiryDate);
                    }}
                    className={FORM_INPUT_CLASS}
                  />
                </div>
              </FormSection>
            </FormSectionGrid>
            <FormSection
              label="Place of Issue"
              htmlFor="create-lead-passport-place-of-issue"
              error={passportPlaceOfIssueError}
            >
              <input
                id="create-lead-passport-place-of-issue"
                value={state.passportPlaceOfIssue}
                onChange={(e) => updateField("passportPlaceOfIssue", e.target.value)}
                onBlur={() => markFieldTouched("passportPlaceOfIssue")}
                placeholder="e.g. Delhi"
                type="text"
                className={`${FORM_INPUT_CLASS}${
                  passportPlaceOfIssueError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                }`}
              />
            </FormSection>
          </div>
        );
      }

      case 4: {
        const immigrationCountryError = getFieldError("immigrationCountry");
        const loginIdError = getFieldError("loginId");
        const passwordError = getFieldError("password");
        const slotStatusError = getFieldError("slotStatus");
        const slotPortalLoginIdError = getFieldError("slotPortalLoginId");
        const slotPortalPasswordError = getFieldError("slotPortalPassword");
        const usaTrackingMobileError = getFieldError("usaTrackingMobile");
        const usaSecurityCarError = getFieldError("usaSecurityCar");
        const usaSecurityFoodError = getFieldError("usaSecurityFood");
        const usaSecurityCityError = getFieldError("usaSecurityCity");

        return (
          <div className="space-y-4">
            <CountrySelector
              inputId="create-lead-immigration-country"
              value={state.immigrationCountry}
              onChange={(value) =>
                updateField("immigrationCountry", value as CountryType | "")
              }
              required
              error={immigrationCountryError}
            />
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Visa Portal
              </p>
              <FormSectionGrid>
                <FormSection
                  label="Login ID"
                  htmlFor="create-lead-login-id"
                  error={loginIdError}
                >
                  <input
                    id="create-lead-login-id"
                    value={state.loginId}
                    onChange={(e) => updateField("loginId", e.target.value)}
                    onBlur={() => markFieldTouched("loginId")}
                    placeholder="Visa portal username"
                    type="text"
                    className={`${FORM_INPUT_CLASS}${
                      loginIdError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                    }`}
                    autoComplete="off"
                  />
                </FormSection>
                <FormSection
                  label="Password"
                  htmlFor="create-lead-password"
                  error={passwordError}
                >
                  <input
                    id="create-lead-password"
                    value={state.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    onBlur={() => markFieldTouched("password")}
                    placeholder="Visa portal password"
                    type="text"
                    className={`${FORM_INPUT_CLASS}${
                      passwordError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                    }`}
                    autoComplete="new-password"
                  />
                </FormSection>
              </FormSectionGrid>
            </div>
            {isUsaCountry(state.immigrationCountry) && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Slot Portal
                </p>
                <FormSection label="Portal Type">
                  <CompactRadioGroup
                    name="slotStatus"
                    value={state.slotStatus}
                    options={SLOT_STATUS_OPTIONS}
                    onChange={(value) => updateField("slotStatus", value)}
                    firstOptionId="create-lead-slot-status"
                    error={slotStatusError}
                  />
                </FormSection>
                <FormSectionGrid>
                  <FormSection
                    label="Login ID"
                    htmlFor="create-lead-slot-login-id"
                    error={slotPortalLoginIdError}
                  >
                    <input
                      id="create-lead-slot-login-id"
                      value={state.slotPortalLoginId}
                      onChange={(e) => updateField("slotPortalLoginId", e.target.value)}
                      onBlur={() => markFieldTouched("slotPortalLoginId")}
                      placeholder="Slot portal username"
                      type="text"
                      className={`${FORM_INPUT_CLASS}${
                        slotPortalLoginIdError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                      }`}
                      autoComplete="off"
                    />
                  </FormSection>
                  <FormSection
                    label="Password"
                    htmlFor="create-lead-slot-password"
                    error={slotPortalPasswordError}
                  >
                    <input
                      id="create-lead-slot-password"
                      value={state.slotPortalPassword}
                      onChange={(e) => updateField("slotPortalPassword", e.target.value)}
                      onBlur={() => markFieldTouched("slotPortalPassword")}
                      placeholder="Slot portal password"
                      type="text"
                      className={`${FORM_INPUT_CLASS}${
                        slotPortalPasswordError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                      }`}
                      autoComplete="new-password"
                    />
                  </FormSection>
                </FormSectionGrid>
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <FormSectionGrid>
                    <FormSection
                      label="Mobile Number"
                      htmlFor="create-lead-usa-mobile"
                      error={usaTrackingMobileError}
                    >
                      <input
                        id="create-lead-usa-mobile"
                        value={state.usaTrackingMobile}
                        onChange={(e) => updateField("usaTrackingMobile", e.target.value)}
                        onBlur={() => markFieldTouched("usaTrackingMobile")}
                        placeholder="Tracking mobile number"
                        type="text"
                        className={`${FORM_INPUT_CLASS}${
                          usaTrackingMobileError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                        }`}
                        autoComplete="off"
                      />
                    </FormSection>
                    <div />
                  </FormSectionGrid>

                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Security Questions
                      </p>
                      <button
                        type="button"
                        onClick={handleAddSecurityQuestion}
                        className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Question
                      </button>
                    </div>

                    {state.securityQuestions.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                        No security questions added. Click "Add Question" to add one.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {state.securityQuestions.map((q, idx) => {
                          const questionError = getFieldError(`securityQuestion_${idx}_question` as any);
                          const answerError = getFieldError(`securityQuestion_${idx}_answer` as any);
                          return (
                            <div key={idx} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">
                                    Question {idx + 1}
                                  </label>
                                  <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) => handleSecurityQuestionChange(idx, e.target.value)}
                                    placeholder="e.g. Mother's maiden name"
                                    className={`${FORM_INPUT_CLASS} text-sm`}
                                  />
                                  {questionError && (
                                    <p className="text-xs text-red-500 mt-1">{questionError}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">
                                    Answer
                                  </label>
                                  <input
                                    type="text"
                                    value={q.answer}
                                    onChange={(e) => handleSecurityAnswerChange(idx, e.target.value)}
                                    placeholder="Enter answer"
                                    className={`${FORM_INPUT_CLASS} text-sm`}
                                  />
                                  {answerError && (
                                    <p className="text-xs text-red-500 mt-1">{answerError}</p>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveSecurityQuestion(idx)}
                                className="mt-6 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Remove question"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 5: {
        const visaSubtypeError = getFieldError("visaSubtype");
        const emailError = getFieldError("email");
        const employmentCategoryError = getFieldError("employmentCategory");
        const packageAmountError = getFieldError("packageAmount");
        const annualIncomeError = getFieldError("annualIncome");

        return (
          <div className="space-y-4">
            <FormSection
              label="Visa Subtype"
              htmlFor="create-lead-visa-subtype"
              error={visaSubtypeError}
            >
              <input
                id="create-lead-visa-subtype"
                value={state.visaSubtype}
                onChange={(e) => updateField("visaSubtype", e.target.value)}
                onBlur={() => markFieldTouched("visaSubtype")}
                placeholder="e.g. Work Visa"
                type="text"
                className={`${FORM_INPUT_CLASS}${
                  visaSubtypeError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                }`}
              />
            </FormSection>
            <FormSectionGrid>
              <FormSection
                label="Employment Category"
                htmlFor="create-lead-employment-category"
                error={employmentCategoryError}
              >
                <select
                  id="create-lead-employment-category"
                  value={state.employmentCategory || DEFAULT_EMPLOYMENT_CATEGORY}
                  onChange={(e) =>
                    updateField(
                      "employmentCategory",
                      e.target.value as typeof state.employmentCategory
                    )
                  }
                  onBlur={() => markFieldTouched("employmentCategory")}
                  className={`${FORM_SELECT_CLASS}${
                    employmentCategoryError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                  }`}
                >
                  {EMPLOYMENT_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormSection>
              <FormSection
                label="Service Charges (INR)"
                htmlFor="create-lead-package-amount"
                error={packageAmountError}
              >
                <input
                  id="create-lead-package-amount"
                  min="0"
                  value={state.packageAmount}
                  onChange={(e) => updateField("packageAmount", e.target.value)}
                  onBlur={() => markFieldTouched("packageAmount")}
                  placeholder="e.g. 50000 (optional)"
                  type="number"
                  className={`${FORM_INPUT_CLASS}${
                    packageAmountError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                  }`}
                />
              </FormSection>
            </FormSectionGrid>
            <FormSectionGrid>
              <FormSection
                label="Annual Income (INR)"
                htmlFor="create-lead-annual-income"
                error={annualIncomeError}
              >
                <input
                  id="create-lead-annual-income"
                  min="0"
                  value={state.annualIncome}
                  onChange={(e) => updateField("annualIncome", e.target.value)}
                  onBlur={() => markFieldTouched("annualIncome")}
                  placeholder="e.g. 800000 (optional)"
                  type="number"
                  className={`${FORM_INPUT_CLASS}${
                    annualIncomeError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                  }`}
                />
              </FormSection>
              <FormSection
                label="Email Address (optional)"
                htmlFor="create-lead-email"
                error={emailError}
              >
                <input
                  id="create-lead-email"
                  value={state.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  onBlur={() => markFieldTouched("email")}
                  placeholder="e.g. john.doe@example.com"
                  type="email"
                  className={`${FORM_INPUT_CLASS}${
                    emailError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                  }`}
                />
              </FormSection>
            </FormSectionGrid>
            <FormSection label="Description">
              <textarea
                rows={2}
                value={state.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Any initial information provided by client..."
                className={FORM_TEXTAREA_CLASS}
              />
            </FormSection>
          </div>
        );
      }

      case 6:
        return <CreateLeadReviewStep state={state} onEditStep={handleReviewEditStep} />;

      default:
        return null;
    }
  })();

  if (!canModifyLeads) {
    return null;
  }

  const isLastStep = currentStep === activeStepIds[activeStepIds.length - 1];
  const canProceed = isStepValid();
  const showSaveToReview = returnToReview && !isLastStep;

  return (
    <div
      className={
        isInline
          ? "w-full px-6 py-4"
          : `mx-auto w-full pb-2 ${
              isLastStep ? "max-w-[1350px]" : "max-w-2xl lg:max-w-3xl"
            }`
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
          <WizardProgress
            currentStep={currentStep}
            onStepClick={handleProgressStepClick}
            allowFullNavigation
            completedSteps={completedSteps}
            activeStepIds={activeStepIds}
          />
        </div>

        <div className={`px-5 md:px-6 ${isLastStep ? "py-3 text-sm" : "py-4 text-xs"}`}>
          {stepContent}
        </div>

        <div
          className={`${
            isInline ? "relative" : "sticky bottom-0"
          } z-20 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-5 md:px-6 py-3 bg-white/95 dark:bg-[#0a0a1a]/95 backdrop-blur-sm`}
        >
          <button
            type="button"
            onClick={handleBack}
            className="py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {currentStep === 1 && !state.leadType && !returnToReview ? "Cancel" : "Back"}
          </button>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={goToLeads}
                className="py-2.5 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="py-2.5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white text-xs rounded-xl shadow-lg transition-all"
              >
                {editLeadId 
                  ? (isSubmitting ? "Saving…" : "Complete Profile")
                  : (isSubmitting ? "Creating…" : "Create Lead")}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                className="py-2.5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white text-xs rounded-xl shadow-lg transition-all"
              >
                {showSaveToReview ? "Save" : "Next"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
