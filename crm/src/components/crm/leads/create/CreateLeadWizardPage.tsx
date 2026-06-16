"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  FORM_SELECT_CLASS,
  FORM_TEXTAREA_CLASS,
  CompactRadioGroup,
  WizardProgress,
  type WizardStepId,
} from "@/components/crm/leads/create";
import { isUsaCountry } from "@/utils/countryUtils";
import { CreateLeadReviewStep } from "./CreateLeadReviewStep";

const CASE_OFFICERS = ["Priya Mehta", "Rohit Verma", "Simran Kaur"] as const;

const SLOT_STATUS_OPTIONS: { value: CreateLeadSlotStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "paid", label: "Paid" },
];

export function CreateLeadWizardPage() {
  const router = useRouter();
  const { addLead, showToast, canModifyLeads, openLeadDetail } = useCrmLayoutContext();
  const {
    state,
    currentStep,
    setCurrentStep,
    updateField,
    isStepValid,
    hasCompletedWizard,
    returnToReview,
    navigateToStep,
    advanceStep,
  } = useCreateLeadForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!canModifyLeads) {
      router.replace("/leads");
    }
  }, [canModifyLeads, router]);

  const goToLeads = useCallback(() => {
    router.push("/leads");
  }, [router]);

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

  const handleEditStep = useCallback(
    (step: WizardStepId) => {
      navigateToStep(step);
    },
    [navigateToStep]
  );

  const handleSubmit = useCallback(() => {
    if (isSubmitting || !isStepValid()) return;

    setIsSubmitting(true);
    try {
      const payload = buildCreateLeadPayload(state);
      const newId = addLead(payload);
      showToast("Lead initialized successfully!");
      openLeadDetail(newId, "checklist", { created: true });
    } finally {
      setIsSubmitting(false);
    }
  }, [addLead, isStepValid, isSubmitting, openLeadDetail, showToast, state]);

  const showVisaSubtypePicker =
    state.leadType === "visa" && !state.visaSubtype.trim();

  const stepContent = (() => {
    switch (currentStep) {
      case 1:
        if (returnToReview) {
          return (
            <div className="space-y-4">
              <LeadTypeSelector
                onSelectStudyAbroad={() => updateField("leadType", "study_abroad")}
                onSelectVisa={() => updateField("leadType", "visa")}
              />
              {state.leadType === "visa" && (
                <VisaSubtypeSelector
                  onSelect={(visaSubtype) => updateField("visaSubtype", visaSubtype)}
                />
              )}
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {showVisaSubtypePicker ? (
              <VisaSubtypeSelector
                onSelect={(visaSubtype) => {
                  updateField("visaSubtype", visaSubtype);
                  goToClientInfo();
                }}
              />
            ) : !state.leadType ? (
              <LeadTypeSelector
                onSelectStudyAbroad={() => {
                  updateField("leadType", "study_abroad");
                  goToClientInfo();
                }}
                onSelectVisa={() => updateField("leadType", "visa")}
              />
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

      case 2:
        return (
          <div className="space-y-4">
            <FormSectionGrid>
              <FormSection label="Client Full Name">
                <input
                  value={state.clientName}
                  onChange={(e) => updateField("clientName", e.target.value)}
                  placeholder="e.g. John Doe"
                  type="text"
                  className={FORM_INPUT_CLASS}
                />
              </FormSection>
              <FormSection label="Contact Number">
                <PhoneInput
                  value={state.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="9876543210"
                />
              </FormSection>
            </FormSectionGrid>
            <FormSection label="Email Address">
              <input
                value={state.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="e.g. john.doe@example.com"
                type="email"
                className={FORM_INPUT_CLASS}
              />
            </FormSection>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <CountrySelector
              value={state.immigrationCountry}
              onChange={(value) =>
                updateField("immigrationCountry", value as CountryType | "")
              }
              required
            />
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Visa Portal
              </p>
              <FormSectionGrid>
                <FormSection label="Login ID">
                  <input
                    value={state.loginId}
                    onChange={(e) => updateField("loginId", e.target.value)}
                    placeholder="Visa portal username"
                    type="text"
                    className={FORM_INPUT_CLASS}
                    autoComplete="off"
                  />
                </FormSection>
                <FormSection label="Password">
                  <input
                    value={state.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Visa portal password"
                    type="password"
                    className={FORM_INPUT_CLASS}
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
                  />
                </FormSection>
                <FormSectionGrid>
                  <FormSection label="Login ID">
                    <input
                      value={state.slotPortalLoginId}
                      onChange={(e) => updateField("slotPortalLoginId", e.target.value)}
                      placeholder="Slot portal username"
                      type="text"
                      className={FORM_INPUT_CLASS}
                      autoComplete="off"
                    />
                  </FormSection>
                  <FormSection label="Password">
                    <input
                      value={state.slotPortalPassword}
                      onChange={(e) => updateField("slotPortalPassword", e.target.value)}
                      placeholder="Slot portal password"
                      type="password"
                      className={FORM_INPUT_CLASS}
                      autoComplete="new-password"
                    />
                  </FormSection>
                </FormSectionGrid>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <FormSection label="Visa Subtype">
              <input
                value={state.visaSubtype}
                onChange={(e) => updateField("visaSubtype", e.target.value)}
                placeholder="e.g. Work Visa"
                type="text"
                className={FORM_INPUT_CLASS}
              />
            </FormSection>
            <FormSectionGrid>
              <FormSection label="Assign Case Officer">
                <select
                  value={state.caseOfficer}
                  onChange={(e) => updateField("caseOfficer", e.target.value)}
                  className={FORM_SELECT_CLASS}
                >
                  <option value="">Select officer</option>
                  {CASE_OFFICERS.map((officer) => (
                    <option key={officer} value={officer}>
                      {officer}
                    </option>
                  ))}
                </select>
              </FormSection>
              <FormSection label="Lead Source">
                <select
                  value={state.leadSource}
                  onChange={(e) =>
                    updateField("leadSource", e.target.value as LeadSource)
                  }
                  className={FORM_SELECT_CLASS}
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
              <FormSection label="Employment Category">
                <select
                  value={state.employmentCategory || DEFAULT_EMPLOYMENT_CATEGORY}
                  onChange={(e) =>
                    updateField(
                      "employmentCategory",
                      e.target.value as typeof state.employmentCategory
                    )
                  }
                  className={FORM_SELECT_CLASS}
                >
                  {EMPLOYMENT_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormSection>
              <FormSection label="Initial Invoiced Package (INR)">
                <input
                  min="0"
                  value={state.packageAmount}
                  onChange={(e) => updateField("packageAmount", e.target.value)}
                  placeholder="50000 (optional)"
                  type="number"
                  className={FORM_INPUT_CLASS}
                />
              </FormSection>
            </FormSectionGrid>
            <FormSection label="Initial File Notes">
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

      case 5:
        return <CreateLeadReviewStep state={state} onEditStep={handleEditStep} />;

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
      className={`mx-auto w-full pb-2 ${
        isLastStep ? "max-w-[1350px]" : "max-w-2xl lg:max-w-3xl"
      }`}
    >
      <div className="bg-white dark:bg-[#0a0a1a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="sticky top-0 z-20 px-5 md:px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0a0a1a]/95 backdrop-blur-sm">
          <WizardProgress
            currentStep={currentStep}
            onStepClick={handleEditStep}
            allowFullNavigation={hasCompletedWizard}
          />
        </div>

        <div className={`px-5 md:px-6 ${isLastStep ? "py-3 text-sm" : "py-4 text-xs"}`}>
          {stepContent}
        </div>

        <div className="sticky bottom-0 z-20 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-5 md:px-6 py-3 bg-white/95 dark:bg-[#0a0a1a]/95 backdrop-blur-sm">
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
                disabled={!canProceed || isSubmitting}
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
