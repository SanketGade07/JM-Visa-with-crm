"use client";

import React from "react";
import type { Lead } from "@/context/CrmContext";
import { FaGlobe, FaFileDownload, FaFileUpload } from "react-icons/fa";

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
  getLeadDocuments: (leadId: string) => { docType: string; fileUrl: string; fileName: string }[];
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

  return (
    <div
      className={`flex flex-col gap-2.5 p-4 border rounded-xl transition-all shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:shadow-sm ${
        value
          ? "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-500/30"
          : "bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-900"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={value}
          disabled={!canVerifyDocs}
          onChange={() => toggleChecklistItem(lead.id, itemKey)}
          aria-label={`Mark ${label} as verified`}
          className="shrink-0 mt-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed checked:!bg-emerald-500 checked:!border-emerald-500"
        />
        <span
          className={`flex-1 min-w-0 text-xs font-bold leading-snug ${value ? "text-emerald-700 dark:text-emerald-400" : "text-gray-800 dark:text-slate-300"}`}
        >
          {label}
        </span>
      </div>

      {doc ? (
        <button
          onClick={() => openSignedUrl(doc.fileUrl)}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50 transition-colors w-full min-w-0 cursor-pointer text-left"
          title={doc.fileName}
        >
          <FaFileDownload className="text-[9px] shrink-0" />
          <span className="truncate">{doc.fileName}</span>
        </button>
      ) : (
        <span className="text-[10px] text-gray-500 dark:text-slate-500">No file uploaded</span>
      )}

      {!value && (
        <div className="flex items-center gap-2 pt-0.5">
          <label
            className={`inline-flex items-center space-x-1 text-[10px] font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer transition-all active:scale-95 shadow-sm hover:shadow ${
              !canVerifyDocs || isUploading
                ? "opacity-40 cursor-not-allowed border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-600"
                : "border-violet-200 dark:border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
            }`}
          >
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
            className={`inline-flex items-center space-x-1 text-[10px] font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer transition-all active:scale-95 shadow-sm hover:shadow ${
              !canVerifyDocs || isUploading
                ? "opacity-40 cursor-not-allowed border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-600"
                : "border-violet-200 dark:border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
            }`}
          >
            <FaGlobe className="text-[9px]" />
            <span>Link</span>
          </button>
        </div>
      )}
    </div>
  );
}
