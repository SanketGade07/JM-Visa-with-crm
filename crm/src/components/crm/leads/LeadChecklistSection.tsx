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
    uploadDocument,
    getLeadDocuments,
    showToast,
    uploadingKey,
    setUploadingKey,
    setUrlModalData,
    setPastedUrl,
    uploadError,
    setUploadError,
    canVerifyDocs,
    openSignedUrl,
    toggleChecklistItem,
  } = useCrmLayoutContext();

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
    getLeadDocuments,
    showToast,
    setPastedUrl,
    setUrlModalData,
    openSignedUrl,
    toggleChecklistItem,
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/80 rounded-2xl flex flex-col min-h-[calc(100vh-220px)] space-y-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none">
      <div className="flex flex-col space-y-4 border-b border-gray-100 dark:border-slate-800 pb-4">
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
          <label className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block">
            Employment Category
          </label>
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-gray-500 dark:text-slate-400">
              Verification Progress ({checkedCount}/{activeKeys.length})
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
              {pct}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-950 rounded-[4px] h-2 overflow-hidden border border-gray-200/60 dark:border-slate-800/50">
            <div
              className="bg-emerald-500 h-full rounded-[2px] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
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
            <h5 className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400 border-b border-violet-100 dark:border-violet-500/20 pb-2">
              {section.title}
            </h5>
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
          Staff uploads each document manually (received via WhatsApp/email). Files are stored in
          Supabase. Once all required docs are uploaded, status auto-updates to{" "}
          <strong>READY FOR SUBMISSION</strong>.
        </span>
      </div>
    </div>
  );
}
