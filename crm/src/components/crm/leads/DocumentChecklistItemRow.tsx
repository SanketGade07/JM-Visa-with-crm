"use client";

import React from "react";
import type { Lead } from "@/context/CrmContext";
import { FaGlobe, FaFileDownload, FaFileUpload, FaTrash } from "react-icons/fa";

export type DocumentChecklistItemRowProps = {
  lead: Lead;
  itemKey: string;
  label: string;
  canVerifyDocs: boolean;
  uploadingKey: string | null;
  setUploadingKey: (key: string | null) => void;
  setUploadError: (error: string) => void;
  uploadDocument: (
    leadId: string,
    docType: string,
    file: File
  ) => Promise<{ ok: boolean; error?: string }>;
  removeDocument: (
    leadId: string,
    documentId: string
  ) => Promise<{ ok: boolean; error?: string }>;
  getLeadDocuments: (leadId: string) => { id: string; docType: string; fileUrl: string; fileName: string }[];
  showToast: (message: string, type?: "success" | "error") => void;
  setPastedUrl: (url: string) => void;
  setUrlModalData: (data: { leadId: string; docType: string; title: string } | null) => void;
  openSignedUrl: (url: string) => void;
  toggleChecklistItem: (leadId: string, item: string) => void;
};

export function DocumentChecklistItemRow({
  lead,
  itemKey,
  label,
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
}: DocumentChecklistItemRowProps) {
  const value = lead.checklist[itemKey] ?? false;
  const doc = getLeadDocuments(lead.id).find((d) => d.docType === itemKey);
  const rowKey = `${lead.id}-${itemKey}`;
  const isUploading = uploadingKey === rowKey;

  // A document may only be checked once it has been received and verified — i.e. a
  // file/link exists for it. Unchecking an already-verified item stays allowed.
  const needsDocumentBeforeChecking = !value && !doc;
  const checkboxDisabled = !canVerifyDocs || needsDocumentBeforeChecking;

  const actionButtonClass = (disabled: boolean) =>
    `inline-flex items-center space-x-1 text-[10px] font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer transition-all active:scale-95 ${
      disabled
        ? "opacity-40 cursor-not-allowed border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-600"
        : "border-violet-200 dark:border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
    }`;

  return (
    <div className="flex flex-col gap-2.5 py-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <input
          type="checkbox"
          checked={value}
          disabled={checkboxDisabled}
          onChange={() => toggleChecklistItem(lead.id, itemKey)}
          aria-label={`Mark ${label} as verified`}
          title={
            needsDocumentBeforeChecking && canVerifyDocs
              ? "Upload or link this document before marking it verified."
              : undefined
          }
          className="checklist-item-checkbox shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        />
        <span
          className={`min-w-0 flex-1 text-xs font-bold leading-snug ${value ? "text-emerald-700 dark:text-emerald-400" : "text-gray-800 dark:text-slate-300"}`}
        >
          {label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-6 sm:shrink-0 sm:pl-0">
        {doc ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openSignedUrl(doc.fileUrl)}
              className="inline-flex min-w-0 max-w-[220px] cursor-pointer items-center space-x-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50 px-2.5 py-1 text-left text-[10px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-100/50 hover:text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
              title={doc.fileName}
            >
              <FaFileDownload className="shrink-0 text-[9px]" />
              <span className="truncate">{doc.fileName}</span>
            </button>
            {canVerifyDocs && (
              <button
                type="button"
                onClick={async () => {
                  if (isUploading) return;
                  setUploadError("");
                  setUploadingKey(rowKey);
                  const res = await removeDocument(lead.id, doc.id);
                  setUploadingKey(null);
                  if (res.ok) {
                    showToast("Document removed successfully!");
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
                aria-label={`Remove ${label} file`}
                title="Remove file or link"
              >
                <FaTrash className="text-[10px]" />
              </button>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-gray-500 dark:text-slate-500">No file uploaded</span>
        )}

        {!value && (
          <>
            <label className={actionButtonClass(!canVerifyDocs || isUploading)}>
              <FaFileUpload className="text-[9px]" />
              <span>{isUploading ? "..." : "File"}</span>
              <input
                type="file"
                className="hidden"
                disabled={!canVerifyDocs || isUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadError("");
                  setUploadingKey(rowKey);
                  const res = await uploadDocument(lead.id, itemKey, file);
                  setUploadingKey(null);
                  if (res.ok) {
                    showToast("Document verified successfully!");
                  } else {
                    setUploadError(res.error || "Upload failed");
                    showToast(res.error || "Upload failed", "error");
                  }
                  e.target.value = "";
                }}
              />
            </label>

            <button
              onClick={() => {
                if (!canVerifyDocs || isUploading) return;
                setPastedUrl("");
                setUrlModalData({
                  leadId: lead.id,
                  docType: itemKey,
                  title: label,
                });
              }}
              disabled={!canVerifyDocs || isUploading}
              className={actionButtonClass(!canVerifyDocs || isUploading)}
            >
              <FaGlobe className="text-[9px]" />
              <span>Link</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
