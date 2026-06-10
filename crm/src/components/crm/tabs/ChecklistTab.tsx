"use client";

import React from "react";
import { DocumentChecklist } from "@/context/CrmContext";
import {
  FaGlobe, FaCheckCircle, FaInfoCircle, FaFileDownload, FaFileUpload, FaChevronLeft,
} from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { LeadDetailPanel } from "../LeadDetailPanel";

const DOC_LABELS: Record<keyof DocumentChecklist, string> = {
  passport: "Passport",
  visaForm: "Visa Form",
  businessDocs: "Business Documents",
  salarySlips: "Salary Slips",
  bankStatement: "Bank Statement",
  itr: "ITR",
  offerLetter: "Offer Letter",
  casOrI20: "CAS / I-20",
  travelHistory: "Travel History",
  sopOrCoverLetter: "SOP / Cover Letter",
  photos: "Photos",
  insurance: "Insurance",
  biometricsCompleted: "Biometrics Completed",
  visaFeesPaid: "Visa Fees Paid",
};

export function ChecklistTab() {
  const {
    leads,
    selectedLeadId,
    closeLeadChecklist,
    updateLeadStatus,
    assignCounselor,
    updateLeadNotes,
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
  } = useCrmLayoutContext();

  const checklistLead = selectedLeadId
    ? leads.find((l) => l.id === selectedLeadId) ?? null
    : null;

  if (!checklistLead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] text-center space-y-4">
        <p className="text-sm text-gray-500 dark:text-slate-400">Lead not found or no lead selected.</p>
        <button
          type="button"
          onClick={closeLeadChecklist}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/30 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
        >
          <FaChevronLeft className="text-xs" />
          Back to Lead Management
        </button>
      </div>
    );
  }

  const leadDisplayId =
    leads.filter((l) => l.status !== "Dropped").findIndex((l) => l.id === checklistLead.id) !== -1
      ? leads.filter((l) => l.status !== "Dropped").findIndex((l) => l.id === checklistLead.id) + 1
      : checklistLead.id;

  const pct = Math.round(
    (Object.values(checklistLead.checklist).filter(Boolean).length /
      Object.values(checklistLead.checklist).length) *
      100
  );

  const leadFirstName = checklistLead.name.trim().split(/\s+/)[0] || checklistLead.name;

  return (
    <div className="space-y-5">
      {/* Breadcrumb + back navigation */}
      <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={closeLeadChecklist}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:border-violet-300 dark:hover:border-violet-500/40 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors shrink-0"
            aria-label="Back to Lead Management"
          >
            <FaChevronLeft className="text-sm" />
          </button>
          <nav className="flex items-center flex-wrap gap-1.5 text-[12px] font-medium min-w-0" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={closeLeadChecklist}
              className="text-gray-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              Lead Management
            </button>
            <FiChevronRight className="text-gray-300 dark:text-slate-600 shrink-0" />
            <span className="text-gray-900 dark:text-white font-semibold truncate max-w-[220px] sm:max-w-none">
              {leadFirstName}{" "}
              <span className="font-medium text-gray-500 dark:text-slate-400">(Doc)</span>
            </span>
          </nav>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Compliance checklist — left */}
        <div className="xl:col-span-3 p-6 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/80 rounded-2xl flex flex-col min-h-[calc(100vh-220px)] space-y-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none">
          <div className="flex flex-col space-y-4 border-b border-gray-100 dark:border-slate-800 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  Compliance Checklist: {checklistLead.name}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                  {checklistLead.country} · {checklistLead.visaType}
                </p>
              </div>
              <div className="p-1.5 px-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-900 rounded-lg text-[10px] font-semibold text-gray-500 dark:text-slate-400 select-all shrink-0">
                ID: <span className="font-mono text-gray-800 dark:text-slate-300 font-bold">{leadDisplayId}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-gray-500 dark:text-slate-400">Total Verification Audit</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{pct}% Complete</span>
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

          <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto flex-1 min-w-0 pb-2">
            {(Object.keys(checklistLead.checklist) as (keyof DocumentChecklist)[]).map((key) => {
              const value = checklistLead.checklist[key];
              const doc = getLeadDocuments(checklistLead.id).find((d) => d.docType === key);
              const rowKey = `${checklistLead.id}-${key}`;
              const isUploading = uploadingKey === rowKey;
              const docLabel = DOC_LABELS[key];
              return (
                <div
                  key={key}
                  className={`flex flex-col gap-2.5 p-4 border rounded-xl transition-all shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:shadow-sm ${
                    value
                      ? "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-500/30"
                      : "bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-xs font-bold leading-snug ${value ? "text-emerald-700 dark:text-emerald-400" : "text-gray-800 dark:text-slate-300"}`}
                    >
                      {docLabel}
                    </span>
                    {value && (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold shrink-0">
                        <FaCheckCircle className="text-xs" />
                        <span>Verified</span>
                      </span>
                    )}
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
                            const res = await uploadDocument(checklistLead.id, key, file);
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
                            leadId: checklistLead.id,
                            docType: key,
                            title: docLabel,
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
            })}
          </div>

          <div className="p-3 bg-violet-50 dark:bg-violet-500/5 border border-violet-100 dark:border-violet-500/20 text-violet-700 dark:text-violet-400 rounded-xl text-[10px] font-semibold flex items-center space-x-2 shrink-0">
            <FaInfoCircle className="text-xs shrink-0" />
            <span>
              Staff uploads each document manually (received via WhatsApp/email). Files are stored in Supabase.
              Once all required docs are uploaded, status auto-updates to <strong>READY FOR SUBMISSION</strong>.
            </span>
          </div>
        </div>

        {/* Lead detail panel — right */}
        <div className="xl:col-span-1 xl:sticky xl:top-6">
          <LeadDetailPanel
            lead={checklistLead}
            canModifyLeads={canModifyLeads}
            onStatusChange={updateLeadStatus}
            onCounselorChange={assignCounselor}
            onNotesChange={updateLeadNotes}
          />
        </div>
      </div>
    </div>
  );
}
