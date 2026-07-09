"use client";

import React, { useState } from "react";
import type { Lead } from "@/context/CrmContext";
import { FaGlobe, FaFileDownload, FaFileUpload, FaTrash, FaPaperPlane } from "react-icons/fa";
import { createPortal } from "react-dom";

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

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [email, setEmail] = useState(lead.email ?? "");
  const [isSending, setIsSending] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  const isEmailInvalid = email.trim() !== "" && !emailRegex.test(email.trim());
  const isFormInvalid = !email.trim() || isEmailInvalid;

  // A document may be checked or unchecked freely by staff who have verification permissions.
  const checkboxDisabled = !canVerifyDocs;

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
          className="checklist-item-checkbox shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        />
        <span
          className={`min-w-0 flex-1 text-xs font-bold leading-snug ${value ? "text-emerald-700 dark:text-emerald-400" : "text-gray-800 dark:text-slate-300"}`}
        >
          {label} <span className="text-rose-500 font-extrabold ml-0.5">*</span>
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
        ) : itemKey === "termsAndConditions" ? null : (
          <span className="text-[10px] text-gray-500 dark:text-slate-500">No file uploaded</span>
        )}

        {!value && (
          <>
            {itemKey === "termsAndConditions" ? (
              <button
                type="button"
                onClick={() => {
                  if (!canVerifyDocs || isUploading) return;
                  setIsSendModalOpen(true);
                }}
                disabled={!canVerifyDocs || isUploading}
                className="inline-flex items-center justify-center space-x-1.5 text-[10px] font-bold rounded-lg w-[124px] py-1.5 border border-blue-200 dark:border-blue-500/40 text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaPaperPlane className="text-[9px]" />
                <span>Send Terms</span>
              </button>
            ) : (
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
          </>
        )}
      </div>

      {isSendModalOpen && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsSendModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Terms & Conditions</h3>
              <button
                type="button"
                onClick={() => setIsSendModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email.trim()) {
                  showToast("Please enter an email address", "error");
                  return;
                }
                if (!emailRegex.test(email.trim())) {
                  showToast("Please enter a valid email address", "error");
                  return;
                }
                
                setIsSending(true);
                try {
                  const res = await fetch("/api/send-terms", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email: email.trim(),
                      leadName: lead.name,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok && data.ok) {
                    showToast(`Terms and conditions sent successfully to ${email.trim()}!`, "success");
                    if (!value) {
                      toggleChecklistItem(lead.id, itemKey);
                    }
                    setIsSendModalOpen(false);
                  } else {
                    throw new Error(data.error || "Failed to send");
                  }
                } catch (err: any) {
                  console.error("Direct email failed, launching mailto fallback:", err);
                  
                  // Open user's email client (Gmail/Outlook) with pre-filled Terms & Conditions template as fallback
                  const subject = encodeURIComponent("JM Visa Services - Terms & Conditions");
                  const body = encodeURIComponent(
                    `Dear Applicant,\n\nPlease read and sign the terms and conditions at the following link:\nhttps://www.jmvisaservices.com/terms-and-condition\n\nBest regards,\nJM Visa Services`
                  );
                  window.open(`mailto:${email.trim()}?subject=${subject}&body=${body}`, "_blank");

                  showToast(`Terms and conditions fallback email drafted to ${email.trim()}!`, "success");
                  if (!value) {
                    toggleChecklistItem(lead.id, itemKey);
                  }
                  setIsSendModalOpen(false);
                } finally {
                  setIsSending(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-gray-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                  Your Email <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  disabled={isSending}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-white dark:bg-slate-800/30 border ${
                    isEmailInvalid
                      ? "border-rose-500 focus:ring-rose-500/20 text-rose-600 dark:text-rose-400"
                      : "border-gray-200 dark:border-slate-700 focus:ring-blue-500/20 text-gray-800 dark:text-slate-200"
                  } text-xs p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {isEmailInvalid && (
                  <span className="text-[10px] font-semibold text-rose-500 block mt-1">
                    Please enter a valid email address
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSending || isFormInvalid}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Sending..." : "Send Email"}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
