"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaTimes } from "react-icons/fa";
import { PhoneInput } from "@/components/ui/FormInputs";
import { useCrmLayoutContext } from "@/components/crm/context/CrmLayoutContext";
import { useCreateLeadForm } from "@/hooks/useCreateLeadForm";
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
  const { addLead, showToast, canModifyLeads, canAssignLeads, openLeadDetail, currentUser } = useCrmLayoutContext();
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
  } = useCreateLeadForm();
  const caseOfficerOptions = useCounselorSelectOptions(state.caseOfficer, {
    includeUnassigned: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!canAssignLeads && currentUser?.name && state.caseOfficer !== currentUser.name) {
      updateField("caseOfficer", currentUser.name);
    }
  }, [canAssignLeads, currentUser?.name, state.caseOfficer, updateField]);

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
      setCurrentStep(5);
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

    setCurrentStep((currentStep - 1) as WizardStepId);
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

  const showVisaSubtypePicker =
    state.leadType === "visa" && !state.visaSubtype.trim();

  const stepContent = (() => {
    switch (currentStep) {
      case 1: {
        const leadTypeError = getFieldError("leadType");
        const visaSubtypeError = getFieldError("visaSubtype");

        if (returnToReview) {
          return (
            <div className="space-y-4">
              <LeadTypeSelector
                onSelectStudyAbroad={() => updateField("leadType", "study_abroad")}
                onSelectVisa={() => updateField("leadType", "visa")}
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
                    goToClientInfo();
                  }}
                  onSelectVisa={() => updateField("leadType", "visa")}
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
        const emailError = getFieldError("email");
        const phoneError = getFieldError("phone");
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
                <PhoneInput
                  id="create-lead-phone"
                  value={state.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="9876543210"
                />
              </FormSection>
            </FormSectionGrid>
            <FormSection
              label="Email Address"
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
          </div>
        );
      }

      case 3: {
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
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    USA Slot Tracking
                  </p>
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
                    <FormSection
                      label="Car"
                      htmlFor="create-lead-usa-car"
                      error={usaSecurityCarError}
                    >
                      <input
                        id="create-lead-usa-car"
                        value={state.usaSecurityCar}
                        onChange={(e) => updateField("usaSecurityCar", e.target.value)}
                        onBlur={() => markFieldTouched("usaSecurityCar")}
                        placeholder="Security car"
                        type="text"
                        className={`${FORM_INPUT_CLASS}${
                          usaSecurityCarError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                        }`}
                        autoComplete="off"
                      />
                    </FormSection>
                    <FormSection
                      label="Food"
                      htmlFor="create-lead-usa-food"
                      error={usaSecurityFoodError}
                    >
                      <input
                        id="create-lead-usa-food"
                        value={state.usaSecurityFood}
                        onChange={(e) => updateField("usaSecurityFood", e.target.value)}
                        onBlur={() => markFieldTouched("usaSecurityFood")}
                        placeholder="Security food"
                        type="text"
                        className={`${FORM_INPUT_CLASS}${
                          usaSecurityFoodError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                        }`}
                        autoComplete="off"
                      />
                    </FormSection>
                    <FormSection
                      label="City"
                      htmlFor="create-lead-usa-city"
                      error={usaSecurityCityError}
                    >
                      <input
                        id="create-lead-usa-city"
                        value={state.usaSecurityCity}
                        onChange={(e) => updateField("usaSecurityCity", e.target.value)}
                        onBlur={() => markFieldTouched("usaSecurityCity")}
                        placeholder="Security city"
                        type="text"
                        className={`${FORM_INPUT_CLASS}${
                          usaSecurityCityError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                        }`}
                        autoComplete="off"
                      />
                    </FormSection>
                  </FormSectionGrid>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 4: {
        const visaSubtypeError = getFieldError("visaSubtype");
        const caseOfficerError = getFieldError("caseOfficer");
        const leadSourceError = getFieldError("leadSource");
        const employmentCategoryError = getFieldError("employmentCategory");
        const packageAmountError = getFieldError("packageAmount");

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
                label="Assign Case Officer"
                htmlFor="create-lead-case-officer"
                error={caseOfficerError}
              >
                <select
                  id="create-lead-case-officer"
                  value={state.caseOfficer}
                  onChange={(e) => updateField("caseOfficer", e.target.value)}
                  onBlur={() => markFieldTouched("caseOfficer")}
                  disabled={!canAssignLeads}
                  className={`${FORM_SELECT_CLASS}${
                    caseOfficerError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <option value="">Select officer</option>
                  {caseOfficerOptions.map((officer) => (
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
                label="Initial Invoiced Package (INR)"
                htmlFor="create-lead-package-amount"
                error={packageAmountError}
              >
                <input
                  id="create-lead-package-amount"
                  min="0"
                  value={state.packageAmount}
                  onChange={(e) => updateField("packageAmount", e.target.value)}
                  onBlur={() => markFieldTouched("packageAmount")}
                  placeholder="50000 (optional)"
                  type="number"
                  className={`${FORM_INPUT_CLASS}${
                    packageAmountError ? ` ${FORM_FIELD_ERROR_CLASS}` : ""
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

      case 5:
        return <CreateLeadReviewStep state={state} onEditStep={handleReviewEditStep} />;

      default:
        return null;
    }
  })();

  if (!canModifyLeads) {
    return null;
  }

  const isLastStep = currentStep === 5;
  const canProceed = isStepValid();
  const showSaveToReview = returnToReview && !isLastStep;

  return (
    <div
      className={
        isInline
          ? "w-full"
          : `mx-auto w-full pb-2 ${
              isLastStep ? "max-w-[1350px]" : "max-w-2xl lg:max-w-3xl"
            }`
      }
    >
      <div
        className={`bg-white dark:bg-[#0a0a1a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden ${
          isInline ? "shadow-none" : "shadow-xl"
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
                {isSubmitting ? "Creating…" : "Create Lead"}
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
