"use client";

import React from "react";
import type { Lead, VisaStatus } from "@/context/CrmContext";
import { FaFileUpload, FaFileDownload, FaGlobe, FaTrash } from "react-icons/fa";
import { docProgress } from "@/utils/leadHelpers";
import { HoverHint } from "@/components/ui/HoverHint";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

// Once a case reaches a decision the document checklist is no longer relevant, so
// the "Doc verifications" column swaps to the outcome document for that status:
// the approved visa copy, or the refusal letter for a rejection.
const OUTCOME_DOCUMENT: Partial<Record<VisaStatus, { docType: string; label: string }>> = {
  VISA_APPROVED: { docType: "visa-copy", label: "Visa Copy" },
  VISA_REJECTED: { docType: "refusal-letter", label: "Refusal Letter" },
};

const actionButtonClass = (disabled: boolean) =>
  `inline-flex items-center gap-1 text-[10px] font-bold rounded-lg px-2.5 py-1.5 border transition-all active:scale-95 ${
    disabled
      ? "opacity-40 cursor-not-allowed border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-600"
      : "border-violet-200 dark:border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 cursor-pointer"
  }`;

type StatusDocumentCellProps = {
  lead: Lead;
};

export function StatusDocumentCell({ lead }: StatusDocumentCellProps) {
  const {
    getLeadDocuments,
    uploadDocument,
    removeDocument,
    openSignedUrl,
    setUrlModalData,
    setPastedUrl,
    uploadingKey,
    setUploadingKey,
    setUploadError,
    showToast,
    canAccessChecklistForLead,
    openLeadChecklist,
  } = useCrmLayoutContext();

  const outcome = OUTCOME_DOCUMENT[lead.status];

  // Pre-decision statuses keep the document verification progress bar.
  if (!outcome) {
    const pct = docProgress(lead.checklist, lead.employmentCategory);
    const filledCount = pct === 0 ? 0 : Math.ceil(pct / 25);
    const canOpenChecklist = canAccessChecklistForLead(lead);

    return (
      <div className="min-w-[120px] flex items-center justify-start gap-2 h-full">
        <HoverHint
          label="Open checklist"
          disabled={!canOpenChecklist}
          onClick={() => openLeadChecklist(lead.id)}
        >
          <div className="flex gap-1 w-[76px]">
            {[1, 2, 3, 4].map((seg) => (
              <div
                key={seg}
                className={`h-2 flex-1 rounded-[1.5px] ${
                  seg <= filledCount ? "bg-emerald-500" : "bg-gray-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>
        </HoverHint>
        <span className="text-[12px] font-bold text-gray-500 dark:text-slate-400 tabular-nums">
          {Math.round(pct)}%
        </span>
      </div>
    );
  }

  // Decision statuses show the outcome document (visa copy / refusal letter).
  const doc = getLeadDocuments(lead.id).find((d) => d.docType === outcome.docType);
  const rowKey = `${lead.id}-${outcome.docType}`;
  const isUploading = uploadingKey === rowKey;
  const canManage = canAccessChecklistForLead(lead);

  return (
    <div className="min-w-[120px] flex flex-wrap items-center justify-start gap-1.5 h-full">
      {doc ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openSignedUrl(doc.fileUrl);
            }}
            title={doc.fileName}
            className="inline-flex min-w-0 max-w-[150px] cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50 px-2.5 py-1 text-left text-[10px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-100/50 hover:text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
          >
            <FaFileDownload className="shrink-0 text-[9px]" />
            <span className="truncate">{outcome.label}</span>
          </button>
          {canManage && (
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                if (isUploading) return;
                setUploadError("");
                setUploadingKey(rowKey);
                const res = await removeDocument(lead.id, doc.id);
                setUploadingKey(null);
                if (res.ok) {
                  showToast(`${outcome.label} removed`);
                } else {
                  setUploadError(res.error || "Removal failed");
                  showToast(res.error || "Removal failed", "error");
                }
              }}
              disabled={isUploading}
              className={`p-1.5 rounded-lg border transition-colors ${
                isUploading
                  ? "opacity-40 cursor-not-allowed border-gray-200 dark:border-slate-800 text-gray-400"
                  : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30 cursor-pointer"
              }`}
              aria-label={`Remove ${outcome.label}`}
              title={`Remove ${outcome.label}`}
            >
              <FaTrash className="text-[10px]" />
            </button>
          )}
        </>
      ) : canManage ? (
        <>
          <label
            className={actionButtonClass(isUploading)}
            onClick={(e) => e.stopPropagation()}
          >
            <FaFileUpload className="text-[9px]" />
            <span>{isUploading ? "Uploading…" : outcome.label}</span>
            <input
              type="file"
              className="hidden"
              disabled={isUploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadError("");
                setUploadingKey(rowKey);
                const res = await uploadDocument(lead.id, outcome.docType, file);
                setUploadingKey(null);
                if (res.ok) {
                  showToast(`${outcome.label} uploaded successfully!`);
                } else {
                  setUploadError(res.error || "Upload failed");
                  showToast(res.error || "Upload failed", "error");
                }
                e.target.value = "";
              }}
            />
          </label>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isUploading) return;
              setPastedUrl("");
              setUrlModalData({
                leadId: lead.id,
                docType: outcome.docType,
                title: outcome.label,
              });
            }}
            disabled={isUploading}
            className={actionButtonClass(isUploading)}
          >
            <FaGlobe className="text-[9px]" />
            <span>Link</span>
          </button>
        </>
      ) : (
        <span className="text-[10px] text-gray-500 dark:text-slate-500">Not uploaded</span>
      )}
    </div>
  );
}
