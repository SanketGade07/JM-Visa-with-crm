"use client";

import React from "react";
import type { CreateLeadFormState } from "@/types/createLeadForm";
import { EMPLOYMENT_CATEGORY_OPTIONS } from "@/utils/documentChecklistConfig";
import { isUsaCountry } from "@/utils/countryUtils";
import type { WizardStepId } from "./WizardProgress";
import { SummaryCard } from "./SummaryCard";
import {
  SummaryRow,
  summaryMaskPassword,
  summaryNotSet,
  summaryText,
} from "./SummaryRow";

const LEAD_SOURCE_LABELS: Record<string, string> = {
  MANUAL: "Manual Entry",
  WEBSITE: "Website",
  REFERRAL: "Referral",
  WALK_IN: "Walk-In",
  SOCIAL_MEDIA: "Social Media",
};

function formatCurrencyAmount(value: string): React.ReactNode {
  if (!value.trim()) {
    return summaryNotSet();
  }
  const amount = parseFloat(value);
  if (Number.isNaN(amount)) {
    return value.trim();
  }
  return (
    <span className="tabular-nums">
      ₹{amount.toLocaleString("en-IN")}
    </span>
  );
}

type CreateLeadReviewStepProps = {
  state: CreateLeadFormState;
  onEditStep: (step: WizardStepId) => void;
};

export function CreateLeadReviewStep({ state, onEditStep }: CreateLeadReviewStepProps) {
  const isUsa = isUsaCountry(state.immigrationCountry);

  const serviceLabel =
    state.leadType === "study_abroad"
      ? "Study Abroad"
      : state.leadType === "visa"
        ? "Visa"
        : null;

  const employmentLabel =
    EMPLOYMENT_CATEGORY_OPTIONS.find((opt) => opt.value === state.employmentCategory)?.label ??
    state.employmentCategory;

  const slotLabel =
    state.slotStatus === "available"
      ? "Available"
      : state.slotStatus === "paid"
        ? "Paid"
        : null;

  return (
    <div className="w-full space-y-3">
      <div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-white">
          Review & confirm
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          Verify each section before submitting. Use Edit to jump back and update a section.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 items-stretch">
        {/* <SummaryCard title="Service Selection" step={1} onEdit={onEditStep}>
          <SummaryRow
            label="Service type"
            value={serviceLabel ? summaryText(serviceLabel) : summaryNotSet()}
          />
          {state.leadType === "visa" && (
            <SummaryRow label="Visa subtype" value={summaryText(state.visaSubtype)} />
          )}
        </SummaryCard> */}

        {/* <SummaryCard title="Client Information" step={2} onEdit={onEditStep}>
          <SummaryRow label="Full name" value={summaryText(state.clientName)} />
          <SummaryRow label="Email" value={summaryText(state.email)} />
          <SummaryRow label="Phone" value={summaryText(state.phone)} />
        </SummaryCard> */}

        {(state.leadType === "visa" ||
          state.passportNumber.trim() ||
          state.passportIssueDate.trim() ||
          state.passportExpiryDate.trim() ||
          state.passportPlaceOfIssue.trim()) && (
          <SummaryCard title="Passport Details" step={3} onEdit={onEditStep}>
            <SummaryRow label="Passport number" value={summaryText(state.passportNumber)} />
            <SummaryRow label="Passport issue date" value={summaryText(state.passportIssueDate)} />
            <SummaryRow label="Passport expiry date" value={summaryText(state.passportExpiryDate)} />
            <SummaryRow label="Place of issue" value={summaryText(state.passportPlaceOfIssue)} />
          </SummaryCard>
        )}

        <SummaryCard title="Application Credentials" step={4} onEdit={onEditStep}>
          <SummaryRow
            label="Immigration country"
            value={summaryText(state.immigrationCountry)}
          />
          <SummaryRow label="Visa portal login" value={summaryText(state.loginId)} />
          <SummaryRow
            label="Visa portal password"
            value={summaryMaskPassword(state.password)}
          />
          {isUsa && (
            <>
              <SummaryRow
                label="Slot portal type"
                value={slotLabel ? summaryText(slotLabel) : summaryNotSet()}
              />
              <SummaryRow
                label="Slot portal login"
                value={summaryText(state.slotPortalLoginId)}
              />
              <SummaryRow
                label="Slot portal password"
                value={summaryMaskPassword(state.slotPortalPassword)}
              />
              <SummaryRow
                label="Mobile number"
                value={summaryText(state.usaTrackingMobile)}
              />
              <SummaryRow label="Car" value={summaryText(state.usaSecurityCar)} />
              <SummaryRow label="Food" value={summaryText(state.usaSecurityFood)} />
              <SummaryRow label="City" value={summaryText(state.usaSecurityCity)} />
            </>
          )}
        </SummaryCard>

        <SummaryCard title="Case Information" step={5} onEdit={onEditStep}>
          <SummaryRow label="Visa subtype" value={summaryText(state.visaSubtype)} />
          <SummaryRow label="Case officer" value={summaryText(state.caseOfficer)} />
          <SummaryRow
            label="Lead source"
            value={summaryText(LEAD_SOURCE_LABELS[state.leadSource] ?? state.leadSource)}
          />
          {state.leadSource === "REFERRAL" && (
            <SummaryRow label="Referred by" value={summaryText(state.referredBy)} />
          )}
          <SummaryRow label="Employment category" value={summaryText(employmentLabel)} />
          <SummaryRow label="Service charges" value={formatCurrencyAmount(state.packageAmount)} />
          <SummaryRow label="Annual income" value={formatCurrencyAmount(state.annualIncome)} />
          <SummaryRow label="Email" value={summaryText(state.email)} />
          <SummaryRow
            label="Initial notes"
            value={
              state.notes.trim() ? (
                <span className="whitespace-pre-wrap text-left sm:text-right block line-clamp-3">
                  {state.notes.trim()}
                </span>
              ) : (
                summaryNotSet()
              )
            }
          />
        </SummaryCard>
      </div>
    </div>
  );
}
