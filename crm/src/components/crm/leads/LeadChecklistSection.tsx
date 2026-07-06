"use client";

import React from "react";
import type { Lead } from "@/context/CrmContext";
import {
  DEFAULT_EMPLOYMENT_CATEGORY,
  EMPLOYMENT_CATEGORY_OPTIONS,
  getChecklistKeysForLead,
  getChecklistSectionsForLead,
  type EmploymentCategory,
} from "@/utils/documentChecklistConfig";
import { FaInfoCircle } from "react-icons/fa";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { DocumentChecklistItemRow } from "./DocumentChecklistItemRow";

type LeadChecklistSectionProps = {
  lead: Lead;
  /** When true, show the lead name / ID header inside the card (standalone checklist route). */
  showLeadHeader?: boolean;
  /** Display index for lead ID badge (1-based). Omit to hide the badge. */
  leadDisplayId?: string | number;
};

export function LeadChecklistSection({
  lead,
  showLeadHeader = false,
  leadDisplayId,
}: LeadChecklistSectionProps) {
  const {
    updateEmploymentCategory,
    canModifyLeads,
    canAccessChecklistForLead,
    uploadDocument,
    removeDocument,
    getLeadDocuments,
    showToast,
    uploadingKey,
    setUploadingKey,
    setUrlModalData,
    setPastedUrl,
    uploadError,
    setUploadError,
    openSignedUrl,
    toggleChecklistItem,
    setLeadDetailTab,
    openEditLead,
  } = useCrmLayoutContext();

  const [dismissedAlert, setDismissedAlert] = React.useState(false);

  React.useEffect(() => {
    setDismissedAlert(false);
  }, [lead.id]);

  const incompleteFields = React.useMemo(() => {
    const fields = [];
    if (!lead.email?.trim()) fields.push("Email");
    if (!lead.passportNumber?.trim()) fields.push("Passport Number");
    if (!lead.passportIssueDate?.trim()) fields.push("Passport Issue Date");
    if (!lead.passportExpiryDate?.trim()) fields.push("Passport Expiry Date");
    if (!lead.passportPlaceOfIssue?.trim()) fields.push("Passport Place of Issue");
    if (!lead.annualIncome?.trim()) fields.push("Annual Income");
    return fields;
  }, [
    lead.email,
    lead.passportNumber,
    lead.passportIssueDate,
    lead.passportExpiryDate,
    lead.passportPlaceOfIssue,
    lead.annualIncome,
  ]);

  const isProfileIncomplete = incompleteFields.length > 0;

  const showAlert = isProfileIncomplete && !dismissedAlert;

  // Gate on THIS lead's assignment (admins always, otherwise the assigned staff).
  const canAccessLeadChecklist = canAccessChecklistForLead(lead);
  const canVerifyDocs = canAccessLeadChecklist;

  const employmentCategory = lead.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY;
  const activeKeys = getChecklistKeysForLead(employmentCategory);
  const checkedCount = activeKeys.filter((key) => lead.checklist[key]).length;
  const pct = activeKeys.length
    ? Math.round((checkedCount / activeKeys.length) * 100)
    : 0;
  const sections = getChecklistSectionsForLead(employmentCategory);

  const itemRowProps = {
    lead,
    canVerifyDocs,
    uploadingKey,
    setUploadingKey,
    setUploadError,
    uploadDocument,
    removeDocument,
    getLeadDocuments,
    showToast,
    setPastedUrl,
    setUrlModalData,
    openSignedUrl,
    toggleChecklistItem,
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-220px)] space-y-6 p-6">
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4 animate-premium-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0c0d21] border border-gray-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 transform scale-100 transition-all">
            <div className="flex items-center gap-3 text-amber-500">
              <FaInfoCircle className="text-3xl shrink-0" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Incomplete Profile Details
              </h3>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
              Please fill out the lead's complete profile first. The following fields are currently empty:
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/40">
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                {incompleteFields.map((field) => (
                  <li key={field} className="marker:text-amber-500">
                    {field}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDismissedAlert(true);
                  openEditLead();
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all text-center select-none cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => setDismissedAlert(true)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all text-center select-none cursor-pointer"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-4 pb-4">
        {showLeadHeader && (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                Document Checklist: {lead.name}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                {lead.country} · {lead.visaType}
              </p>
            </div>
            {leadDisplayId != null && (
              <div className="p-1.5 px-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-900 rounded-lg text-[10px] font-semibold text-gray-500 dark:text-slate-400 select-all shrink-0">
                ID:{" "}
                <span className="font-mono text-gray-800 dark:text-slate-300 font-bold">
                  {leadDisplayId}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              Employment Category
            </label>
            {canAccessLeadChecklist && (
              <span className="inline-flex shrink-0 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold tabular-nums text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                {checkedCount}/{activeKeys.length} docs · {pct}%
              </span>
            )}
          </div>
          <select
            value={employmentCategory}
            onChange={(e) =>
              updateEmploymentCategory(lead.id, e.target.value as EmploymentCategory)
            }
            disabled={!canModifyLeads}
            className="w-full bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {EMPLOYMENT_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-500 dark:text-slate-500">
            General requirements always apply. Category-specific items update when you change the
            selection.
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-semibold flex items-center space-x-2">
          <FaInfoCircle className="text-xs shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="space-y-8 overflow-y-auto flex-1 min-w-0 pb-2">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400">
              {section.title}
            </h5>
            <div className="w-full space-y-1">
              {section.items.map((item) => (
                <DocumentChecklistItemRow
                  key={item.key}
                  itemKey={item.key}
                  label={item.label}
                  {...itemRowProps}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="p-3 bg-violet-50 dark:bg-violet-500/5 border border-violet-100 dark:border-violet-500/20 text-violet-700 dark:text-violet-400 rounded-xl text-[10px] font-semibold flex items-center space-x-2 shrink-0">
        <FaInfoCircle className="text-xs shrink-0" />
        <span>
          Staff uploads each document manually (received via WhatsApp/email). Files are stored in Google Drive (only
          metadata is kept in Supabase). The lead advances to <strong>APPLICATION PROCESSED</strong>{" "}
          only when the checklist is 100% complete, and can then proceed to Visa Submission.
        </span>
      </div>
    </div>
  );
}
