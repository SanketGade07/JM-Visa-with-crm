"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import type { Lead } from "@/context/CrmContext";
import { FaTimes, FaTrash, FaCar, FaUtensils, FaCity } from "react-icons/fa";
import { FiSettings, FiPhone, FiMail, FiCopy, FiUser, FiLock, FiSmartphone, FiKey, FiChevronDown, FiCheck } from "react-icons/fi";
import DataTable, { exportRowsToCsv } from "@/components/ui/DataTable";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { CreateLeadWizardPage } from "@/components/crm/leads/create/CreateLeadWizardPage";
import { useUsaSlotTabs } from "@/hooks/useUsaSlotTabs";
import { useColumnSearch } from "@/hooks/useColumnSearch";
import { applyColumnSearch } from "@/utils/columnSearch";

// function formatDisplayDate(iso: string): string {
//   if (!iso) return "";
//   try {
//     return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   } catch {
//     return iso;
//   }
// }

// function paidBadge(slotsPaid: boolean) {
//   return slotsPaid
//     ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
//     : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
// }

// function interviewBadge(booked: boolean) {
//   return booked
//     ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
//     : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
// }

function CopyableCredentialCell({
  value,
  label,
  showToast,
  icon,
  variant = "gray",
}: {
  value: string | undefined;
  label: string;
  showToast: ReturnType<typeof useCrmLayoutContext>["showToast"];
  icon?: React.ReactNode;
  variant?: "blue" | "gray";
}) {
  if (!value) {
    return <span className="text-gray-400 dark:text-slate-500 text-[11px]">—</span>;
  }

  const btnClassName = variant === "blue"
    ? "w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
    : "w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer";

  return (
    <div className="inline-flex items-center gap-0.5 max-w-full min-w-0">
      <span className="text-gray-600 dark:text-slate-300 font-medium text-[12px] font-mono truncate min-w-0">
        {value}
      </span>
      <button
        type="button"
        data-tooltip={`Copy ${label}`}
        onClick={(e) => {
          e.stopPropagation();
          try {
            navigator.clipboard.writeText(value);
            showToast(`${label} copied`);
          } catch {
            showToast("Copied", "success");
          }
        }}
        className={btnClassName}
      >
        {icon || <FiCopy className="text-[13px]" />}
      </button>
    </div>
  );
}

type UsaSlotSettingsModalProps = {
  lead: Lead;
  onClose: () => void;
  updateUsaSlots: ReturnType<typeof useCrmLayoutContext>["updateUsaSlots"];
  setLeadCredentials: ReturnType<typeof useCrmLayoutContext>["setLeadCredentials"];
  showToast: ReturnType<typeof useCrmLayoutContext>["showToast"];
};

function UsaSlotSettingsModal({
  lead,
  onClose,
  updateUsaSlots,
  setLeadCredentials,
  showToast,
}: UsaSlotSettingsModalProps) {
  const [credUsername, setCredUsername] = useState(lead.visaCredentials?.username ?? "");
  const [credPassword, setCredPassword] = useState(lead.visaCredentials?.password ?? "");
  const [savingCreds, setSavingCreds] = useState(false);
  const [slotPortalUsername, setSlotPortalUsername] = useState(
    lead.usaSlots?.slotPortalUsername ?? ""
  );
  const [slotPortalPassword, setSlotPortalPassword] = useState(
    lead.usaSlots?.slotPortalPassword ?? ""
  );
  const [savingSlotPortal, setSavingSlotPortal] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState<Array<{ question: string; answer: string }>>([]);
  const [trackingMobile, setTrackingMobile] = useState(lead.usaSlots?.trackingMobile ?? "");

  useEffect(() => {
    setCredUsername(lead.visaCredentials?.username ?? "");
    setCredPassword(lead.visaCredentials?.password ?? "");
    setTrackingMobile(lead.usaSlots?.trackingMobile ?? "");
    const questions = lead.usaSlots?.securityQuestions || [
      { question: "Car", answer: lead.usaSlots?.securityCar ?? "" },
      { question: "Food", answer: lead.usaSlots?.securityFood ?? "" },
      { question: "City", answer: lead.usaSlots?.securityCity ?? "" }
    ];
    setSecurityQuestions(questions);
  }, [lead.id, lead.visaCredentials, lead.usaSlots]);

  useEffect(() => {
    setSlotPortalUsername(lead.usaSlots?.slotPortalUsername ?? "");
    setSlotPortalPassword(lead.usaSlots?.slotPortalPassword ?? "");
  }, [lead.id, lead.usaSlots?.slotPortalUsername, lead.usaSlots?.slotPortalPassword]);

  const handleSaveCredentials = async () => {
    setSavingCreds(true);
    const ok = await setLeadCredentials(lead.id, {
      username: credUsername.trim() || undefined,
      password: credPassword.trim() || undefined,
      portalUrl: lead.visaCredentials?.portalUrl,
    });
    setSavingCreds(false);
    showToast(ok ? "Portal credentials saved" : "Failed to save credentials", ok ? "success" : "error");
  };

  const handleSaveSlotPortal = () => {
    setSavingSlotPortal(true);
    updateUsaSlots(lead.id, {
      slotPortalUsername: slotPortalUsername.trim(),
      slotPortalPassword: slotPortalPassword.trim(),
    });
    setSavingSlotPortal(false);
    showToast("Slot portal credentials saved", "success");
  };

  const handleSecurityQuestionChange = (index: number, val: string) => {
    const list = [...securityQuestions];
    list[index] = { ...list[index], question: val };
    setSecurityQuestions(list);
  };

  const handleSecurityAnswerChange = (index: number, val: string) => {
    const list = [...securityQuestions];
    list[index] = { ...list[index], answer: val };
    setSecurityQuestions(list);
  };

  const handleAddSecurityQuestion = () => {
    setSecurityQuestions([
      ...securityQuestions,
      { question: "", answer: "" },
    ]);
  };

  const handleRemoveSecurityQuestion = (index: number) => {
    const list = securityQuestions.filter((_, i) => i !== index);
    setSecurityQuestions(list);
  };

  const handleSaveSecurity = () => {
    const legacyCar = (securityQuestions.find(q => q.question.toLowerCase().includes("car"))?.answer || "").trim();
    const legacyFood = (securityQuestions.find(q => q.question.toLowerCase().includes("food"))?.answer || "").trim();
    const legacyCity = (securityQuestions.find(q => q.question.toLowerCase().includes("city"))?.answer || "").trim();

    updateUsaSlots(lead.id, {
      securityCar: legacyCar,
      securityFood: legacyFood,
      securityCity: legacyCity,
      trackingMobile: trackingMobile.trim(),
      securityQuestions: securityQuestions.map(q => ({
        question: q.question.trim(),
        answer: q.answer.trim()
      }))
    });
    showToast("Security answers & mobile saved", "success");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">Slot Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Paid Dates */}
        {/* <section className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Paid Dates</h4>
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
            <p className="text-sm font-semibold text-white">{lead.name}</p>
            <p className="text-xs text-slate-400">{lead.phone || "—"}</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-900 rounded-xl">
            <span className="font-semibold text-slate-300 text-xs">Embassy Visa Fee Paid</span>
            <input
              type="checkbox"
              checked={!!lead.usaSlots?.slotsPaid}
              onChange={() => {
                updateUsaSlots(lead.id, { slotsPaid: !lead.usaSlots?.slotsPaid });
              }}
              className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
              Fee Paid Date
            </label>
            <input
              type="date"
              value={lead.usaSlots?.paidDate || ""}
              onChange={(e) => {
                updateUsaSlots(lead.id, { paidDate: e.target.value });
              }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none"
            />
          </div>
        </section> */}

        {/* Visa portal credentials */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Visa Portal</h4>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Username</label>
            <input
              type="text"
              value={credUsername}
              onChange={(e) => setCredUsername(e.target.value)}
              placeholder="e.g. V2486037"
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Password</label>
            <input
              type="text"
              value={credPassword}
              onChange={(e) => setCredPassword(e.target.value)}
              placeholder="Portal password"
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <button
            type="button"
            disabled={savingCreds}
            onClick={handleSaveCredentials}
            className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 font-bold text-white text-xs rounded-xl cursor-pointer transition-colors"
          >
            {savingCreds ? "Saving…" : "Save Credentials"}
          </button>
        </section>

        {/* Slot portal credentials */}
        <section className="space-y-3 border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Slot Portal</h4>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Username</label>
            <input
              type="text"
              value={slotPortalUsername}
              onChange={(e) => setSlotPortalUsername(e.target.value)}
              placeholder="Slot portal username"
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Password</label>
            <input
              type="text"
              value={slotPortalPassword}
              onChange={(e) => setSlotPortalPassword(e.target.value)}
              placeholder="Slot portal password"
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <button
            type="button"
            disabled={savingSlotPortal}
            onClick={handleSaveSlotPortal}
            className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 font-bold text-white text-xs rounded-xl cursor-pointer transition-colors"
          >
            {savingSlotPortal ? "Saving…" : "Save Slot Portal"}
          </button>
        </section>

        {/* DS-160 security answers & mobile */}
        <section className="space-y-4 border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
            DS-160 Security & Mobile
          </h4>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Tracking Mobile</label>
              <input
                type="text"
                value={trackingMobile}
                onChange={(e) => setTrackingMobile(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
                  Security Questions
                </label>
                <button
                  type="button"
                  onClick={handleAddSecurityQuestion}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Question
                </button>
              </div>

              {securityQuestions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No security questions added. Click "Add Question" to add one.
                </p>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {securityQuestions.map((q, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-medium text-slate-500">
                            Question {idx + 1}
                          </label>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => handleSecurityQuestionChange(idx, e.target.value)}
                            placeholder="e.g. Car"
                            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-1.5 px-2.5 focus:outline-none focus:border-slate-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-medium text-slate-500">
                            Answer
                          </label>
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) => handleSecurityAnswerChange(idx, e.target.value)}
                            placeholder="Enter answer"
                            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-1.5 px-2.5 focus:outline-none focus:border-slate-700"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSecurityQuestion(idx)}
                        className="mt-5 text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-850 transition-colors"
                        title="Remove question"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveSecurity}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 text-xs rounded-xl cursor-pointer transition-colors"
          >
            Save Security & Mobile
          </button>
        </section>

        {/* Slot workflow */}
        <section className="space-y-3 border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Slot Workflow</h4>
          {(
            [
              { key: "credentialsProvided", label: "Credentials Provided by Client" },
              { key: "ds160Submitted", label: "DS-160 Form Dispatched" },
              // { key: "slotsPaid", label: "Embassy Visa Fee Paid" },
              // { key: "slotsBooked", label: "Visa Slot Booked" },
            ] as const
          ).map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 bg-slate-950 border border-slate-900 rounded-xl"
            >
              <span className="font-semibold text-slate-300 text-xs">{item.label}</span>
              <input
                type="checkbox"
                checked={!!lead.usaSlots?.[item.key]}
                onChange={() => {
                  updateUsaSlots(lead.id, {
                    [item.key]: !lead.usaSlots?.[item.key],
                  });
                }}
                className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
              />
            </div>
          ))}
          {/* <div className="space-y-1.5 pt-1">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
              Consulate Interview Details
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={lead.usaSlots?.interviewDate || ""}
                onChange={(e) => {
                  updateUsaSlots(lead.id, {
                    interviewDate: e.target.value,
                    interviewScheduled: !!e.target.value,
                    slotsBooked: !!e.target.value,
                  });
                }}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none"
              />
              <select
                value={lead.usaSlots?.slotLocation || "Delhi"}
                onChange={(e) => {
                  updateUsaSlots(lead.id, { slotLocation: e.target.value });
                }}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none"
              >
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>
          </div> */}
        </section>
      </div>
    </div>
  );
}

function CopyableSecurityQuestionsCell({ lead, showToast }: { lead: Lead; showToast: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const questions = lead.usaSlots?.securityQuestions || [
    { question: "Car", answer: lead.usaSlots?.securityCar ?? "" },
    { question: "Food", answer: lead.usaSlots?.securityFood ?? "" },
    { question: "City", answer: lead.usaSlots?.securityCity ?? "" }
  ];

  const filledQuestions = questions.filter(q => q.question.trim() || q.answer.trim());
  const count = filledQuestions.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // If the button is in the bottom 45% of the screen, open it upward
      setOpenUpward(rect.bottom > windowHeight * 0.55);
    }
    setIsOpen(!isOpen);
  };

  const handleCopy = async (text: string, idx: number, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      showToast(`${label} answer copied`, "success");
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-xl border border-slate-200 dark:border-slate-850 transition-all duration-200 shadow-sm cursor-pointer"
      >
        <FiKey className="text-violet-500 text-[12px]" />
        <span>{count} Answer{count !== 1 ? "s" : ""}</span>
        <FiChevronDown className={`text-slate-400 text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-black/60 p-3.5 z-40 transition-all animate-fadeIn ${
          openUpward ? "bottom-full mb-2 origin-bottom" : "mt-2 origin-top"
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Security Answers
            </span>
            <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
              Click answer to copy
            </span>
          </div>

          {filledQuestions.length === 0 ? (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic py-1 text-center">
              No security answers entered.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto crm-slim-scrollbar">
              {filledQuestions.map((q, idx) => {
                const isCopied = copiedIndex === idx;
                const value = q.answer || "—";
                return (
                  <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                    <div className="flex-1 min-w-0">
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide truncate">
                        {q.question || `Question ${idx + 1}`}
                      </span>
                      <span className="block font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {value}
                      </span>
                    </div>
                    {q.answer && (
                      <button
                        type="button"
                        onClick={() => handleCopy(q.answer, idx, q.question || "Security")}
                        className={`p-1.5 rounded-lg border transition-all duration-200 shrink-0 cursor-pointer ${
                          isCopied
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-150 text-slate-450 dark:bg-slate-950 dark:hover:bg-slate-850 dark:border-slate-800 dark:text-slate-400"
                        }`}
                        title="Copy answer"
                      >
                        {isCopied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function USASlotsTab() {
  const {
    setSelectedLeadId,
    isMobileSlotSettingsOpen,
    setIsMobileSlotSettingsOpen,
    selectedLead,
    updateUsaSlots,
    setLeadCredentials,
    showToast,
    openLeadDetail,
    registerUsaSlotsExport,
    canModifyLeads,
    deleteLead,
    deleteLeads,
    showConfirm,
    showAlert,
    isAdmin,
    isCreateUsaLeadOpen,
    createUsaLeadSession,
    closeCreateUsaLead,
  } = useCrmLayoutContext();

  const { usaLeads, filteredUsaLeads } = useUsaSlotTabs();
  const columnSearch = useColumnSearch();

  const clientSearchGetter = useMemo(
    () => (lead: Lead) =>
      [lead.name, lead.phone, lead.email].filter(Boolean).join(" "),
    []
  );

  const tableRows = useMemo(
    () =>
      applyColumnSearch(
        filteredUsaLeads,
        [{ searchKey: "client", getSearchValue: clientSearchGetter }],
        columnSearch.debouncedFilters
      ),
    [filteredUsaLeads, clientSearchGetter, columnSearch.debouncedFilters]
  );

  useEffect(() => {
    registerUsaSlotsExport(() =>
      exportRowsToCsv(
        "usa-slots",
        ["Client", "Phone", "Visa User", "Visa Pass", "Slot User", "Slot Pass", "Mobile", "Car", "Food", "City"],
        usaLeads.map((l) => [
          l.name,
          l.phone ?? "",
          l.visaCredentials?.username ?? "",
          l.visaCredentials?.password ?? "",
          l.usaSlots?.slotPortalUsername ?? "",
          l.usaSlots?.slotPortalPassword ?? "",
          l.usaSlots?.trackingMobile ?? "",
          l.usaSlots?.securityCar ?? "",
          l.usaSlots?.securityFood ?? "",
          l.usaSlots?.securityCity ?? "",
        ])
      )
    );
    return () => registerUsaSlotsExport(null);
  }, [registerUsaSlotsExport, usaLeads]);

  const openSlotSettings = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setIsMobileSlotSettingsOpen(true);
  };

  return (
    <div className="-m-4 md:-m-8 pt-0 pl-0 pr-0 pb-4 md:pt-0 md:pl-0 md:pr-0 md:pb-6 space-y-6">
      <CollapsiblePanel open={isCreateUsaLeadOpen && canModifyLeads}>
        <div className="mb-4">
          <CreateLeadWizardPage
            key={createUsaLeadSession}
            variant="inline"
            onClose={closeCreateUsaLead}
          />
        </div>
      </CollapsiblePanel>

      <DataTable
        borderless={true}
        pagination={true}
        defaultPageSize={10}
        showToolbar={false}
        columnSearch={columnSearch}
        rows={tableRows}
        getRowId={(l) => l.id}
        columns={[
          {
            header: "Client",
            searchKey: "client",
            searchLabel: "Client",
            getSearchValue: clientSearchGetter,
            render: (lead) => (
              <div className="flex flex-col gap-0.5 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLeadDetail(lead.id);
                  }}
                  className="font-semibold text-gray-900 dark:text-slate-100 text-[13px] truncate text-left hover:text-violet-600 dark:hover:text-violet-400 hover:underline cursor-pointer transition-colors"
                >
                  {lead.name}
                </button>
                <span className="text-gray-500 dark:text-slate-400 text-[11px]">{lead.phone || "—"}</span>
              </div>
            ),
          },
          {
            header: "Visa User",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.visaCredentials?.username}
                label="Visa username"
                showToast={showToast}
                icon={<FiUser className="text-[13.5px]" />}
              />
            ),
          },
          {
            header: "Visa Pass",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.visaCredentials?.password}
                label="Visa password"
                showToast={showToast}
                icon={<FiLock className="text-[13.5px]" />}
              />
            ),
          },
          {
            header: "Slot User",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.usaSlots?.slotPortalUsername}
                label="Slot username"
                showToast={showToast}
                icon={<FiUser className="text-[13.5px]" />}
                variant="blue"
              />
            ),
          },
          {
            header: "Slot Pass",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.usaSlots?.slotPortalPassword}
                label="Slot password"
                showToast={showToast}
                icon={<FiLock className="text-[13.5px]" />}
                variant="blue"
              />
            ),
          },
          {
            header: "Mobile",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.usaSlots?.trackingMobile}
                label="Tracking mobile"
                showToast={showToast}
                icon={<FiSmartphone className="text-[13.5px]" />}
                variant="blue"
              />
            ),
          },
          {
            header: "Security",
            render: (lead) => (
              <CopyableSecurityQuestionsCell
                lead={lead}
                showToast={showToast}
              />
            ),
          },
          // {
          //   header: "Paid",
          //   render: (lead) => (
          //     <div className="flex flex-col gap-0.5">
          //       <span
          //         className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${paidBadge(!!lead.usaSlots?.slotsPaid)}`}
          //       >
          //         {lead.usaSlots?.slotsPaid ? "Paid" : "Unpaid"}
          //       </span>
          //       {lead.usaSlots?.paidDate ? (
          //         <span className="text-gray-500 dark:text-slate-400 text-[10px]">
          //           {formatDisplayDate(lead.usaSlots.paidDate)}
          //         </span>
          //       ) : null}
          //     </div>
          //   ),
          // },
          // {
          //   header: "Interview",
          //   render: (lead) => (
          //     <span className="text-gray-600 dark:text-slate-300 font-medium text-[12px] whitespace-nowrap">
          //       {lead.usaSlots?.interviewScheduled && lead.usaSlots.interviewDate
          //         ? formatDisplayDate(lead.usaSlots.interviewDate)
          //         : "N/A"}
          //     </span>
          //   ),
          // },
          // {
          //   header: "Status",
          //   render: (lead) => (
          //     <span
          //       className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${interviewBadge(!!lead.usaSlots?.slotsBooked)}`}
          //     >
          //       {lead.usaSlots?.slotsBooked ? "Booked" : "No Booking"}
          //     </span>
          //   ),
          // },
        ]}
        actions={(lead) => [
          {
            icon: FiSettings,
            title: "Slot settings",
            onClick: openSlotSettings,
          },
          { icon: FiPhone, title: "Call", onClick: (l) => window.open(`tel:${l.phone}`) },
          { icon: FiMail, title: "Email", onClick: (l) => window.open(`mailto:${l.email}`) },
        ]}
        emptyText="No USA leads yet."
      />

      {isMobileSlotSettingsOpen && selectedLead?.country === "USA" && (
        <UsaSlotSettingsModal
          lead={selectedLead}
          onClose={() => setIsMobileSlotSettingsOpen(false)}
          updateUsaSlots={updateUsaSlots}
          setLeadCredentials={setLeadCredentials}
          showToast={showToast}
        />
      )}
    </div>
  );
}
