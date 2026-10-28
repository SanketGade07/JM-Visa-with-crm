"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import type { Lead } from "@/context/CrmContext";
import { FaTimes, FaTrash, FaCar, FaUtensils, FaCity, FaWhatsapp, FaRegStar } from "react-icons/fa";
import { FiSettings, FiPhone, FiMail, FiCopy, FiUser, FiLock, FiSmartphone, FiKey, FiChevronDown, FiCheck } from "react-icons/fi";
import DataTable, { exportRowsToCsv } from "@/components/ui/DataTable";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { createPortal } from "react-dom";
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
  const [copied, setCopied] = useState(false);

  if (!value) {
    return <span className="text-gray-400 dark:text-slate-500 text-[11px]">—</span>;
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(value);
      setCopied(true);
      showToast(`${label} copied`, "success");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast("Copied", "success");
    }
  };

  const btnClassName = variant === "blue"
    ? "copyable-cred-btn w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
    : "copyable-cred-btn w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer";

  return (
    <div className="inline-flex items-center gap-1.5 max-w-full min-w-0">
      <span className="text-gray-700 dark:text-slate-300 font-medium text-[12px] font-mono truncate min-w-0">
        {value}
      </span>
      <button
        type="button"
        data-tooltip={copied ? "Copied!" : `Copy ${label}`}
        onClick={handleCopy}
        className={btnClassName}
      >
        {copied ? (
          <FiCheck className="text-[12px] text-emerald-600 dark:text-emerald-400" />
        ) : (
          icon || <FiCopy className="text-[12px]" />
        )}
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

  const handleSaveMobile = () => {
    updateUsaSlots(lead.id, {
      trackingMobile: trackingMobile.trim(),
    });
    showToast("Tracking mobile saved", "success");
  };

  const handleSaveSecurity = () => {
    const legacyCar = (securityQuestions.find(q => q.question.toLowerCase().includes("car"))?.answer || "").trim();
    const legacyFood = (securityQuestions.find(q => q.question.toLowerCase().includes("food"))?.answer || "").trim();
    const legacyCity = (securityQuestions.find(q => q.question.toLowerCase().includes("city"))?.answer || "").trim();

    updateUsaSlots(lead.id, {
      securityCar: legacyCar,
      securityFood: legacyFood,
      securityCity: legacyCity,
      securityQuestions: securityQuestions.map(q => ({
        question: q.question.trim(),
        answer: q.answer.trim()
      }))
    });
    showToast("Security answers saved", "success");
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto crm-slim-scrollbar space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FiSettings className="text-violet-400" />
            <span>Slot Settings</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Client info summary */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-sm font-bold text-white truncate">{lead.name}</p>
            <p className="text-xs text-slate-400 truncate">{lead.phone || "—"}</p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 whitespace-nowrap">
            USA Visa
          </span>
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

        {/* Mobile */}
        <section className="space-y-3 border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Mobile</h4>
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
          <button
            type="button"
            onClick={handleSaveMobile}
            className="w-full py-2 bg-violet-600 hover:bg-violet-500 font-bold text-white text-xs rounded-xl cursor-pointer transition-colors"
          >
            Save Mobile
          </button>
        </section>

        {/* Security */}
        <section className="space-y-4 border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
              Security
            </h4>
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

          <div className="space-y-3">
            {securityQuestions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No security questions added. Click "Add Question" to add one.
              </p>
            ) : (
              <div className="space-y-3">
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
          <button
            type="button"
            onClick={handleSaveSecurity}
            className="w-full py-2 bg-violet-600 hover:bg-violet-500 font-bold text-white text-xs rounded-xl cursor-pointer transition-colors"
          >
            Save Security Answers
          </button>
        </section>

        {/* Status */}
        <section className="space-y-3 border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Status</h4>

          {/* Hidden workflow items kept in code as requested */}
          <div className="hidden" aria-hidden="true">
            <input
              type="checkbox"
              checked={!!lead.usaSlots?.credentialsProvided}
              onChange={() => {
                updateUsaSlots(lead.id, {
                  credentialsProvided: !lead.usaSlots?.credentialsProvided,
                });
              }}
              readOnly
            />
            <input
              type="checkbox"
              checked={!!lead.usaSlots?.ds160Submitted}
              onChange={() => {
                updateUsaSlots(lead.id, {
                  ds160Submitted: !lead.usaSlots?.ds160Submitted,
                });
              }}
              readOnly
            />
          </div>

          {/* Radio buttons for Not Booked & Booked */}
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${!lead.usaSlots?.slotsBooked
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-sm"
                : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span className="text-xs font-semibold">Not Booked</span>
              </div>
              <input
                type="radio"
                name={`slot-status-modal-${lead.id}`}
                value="not-booked"
                checked={!lead.usaSlots?.slotsBooked}
                onChange={() => {
                  updateUsaSlots(lead.id, { slotsBooked: false });
                  showToast("Status updated to Not Booked", "success");
                }}
                className="w-4 h-4 accent-rose-500 cursor-pointer"
              />
            </label>

            <label
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${lead.usaSlots?.slotsBooked
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-sm"
                : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-semibold">Booked</span>
              </div>
              <input
                type="radio"
                name={`slot-status-modal-${lead.id}`}
                value="booked"
                checked={!!lead.usaSlots?.slotsBooked}
                onChange={() => {
                  updateUsaSlots(lead.id, { slotsBooked: true });
                  showToast("Status updated to Booked", "success");
                }}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </label>
          </div>
        </section>
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
      </div>
    </div>
  );
}

function CopyableSecurityQuestionsCell({ lead, showToast }: { lead: Lead; showToast: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const questions = lead.usaSlots?.securityQuestions || [
    { question: "Car", answer: lead.usaSlots?.securityCar ?? "" },
    { question: "Food", answer: lead.usaSlots?.securityFood ?? "" },
    { question: "City", answer: lead.usaSlots?.securityCity ?? "" }
  ];

  const filledQuestions = questions.filter(q => q.question.trim() || q.answer.trim());
  const count = filledQuestions.length;

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(288, window.innerWidth - 16);
    const popoverHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = 0;
    if (spaceBelow < popoverHeight + 10 && rect.top > popoverHeight + 10) {
      top = rect.top - popoverHeight - 6;
    } else {
      top = rect.bottom + 6;
    }

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 8) {
      left = window.innerWidth - popoverWidth - 8;
    }
    if (left < 8) {
      left = 8;
    }

    setPopoverPos({ top, left });
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portalPopover = document.getElementById(`security-portal-${lead.id}`);
        if (portalPopover && portalPopover.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    const handleReposition = () => updatePosition();

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen, lead.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
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
    <div className="relative inline-block text-left whitespace-nowrap" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="security-answers-btn inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-xl border border-slate-200 dark:border-slate-800 transition-all duration-200 shadow-sm cursor-pointer whitespace-nowrap"
      >
        <FiKey className="text-violet-500 text-[12px] shrink-0" />
        <span className="whitespace-nowrap">{count} Answer{count !== 1 ? "s" : ""}</span>
        <FiChevronDown className={`text-slate-400 text-[10px] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          id={`security-portal-${lead.id}`}
          style={{
            position: "fixed",
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            zIndex: 99999,
          }}
          className="w-72 max-w-[calc(100vw-16px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3.5 z-[99999] transition-all animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
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
                        className={`p-1.5 rounded-lg border transition-all duration-200 shrink-0 cursor-pointer ${isCopied
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-450 dark:bg-slate-950 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-400"
                          }`}
                        data-tooltip={`Copy ${q.question || "answer"}`}
                      >
                        {isCopied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

function UsaSlotStatusDropdownCell({
  lead,
  updateUsaSlots,
  canModifyLeads,
  showToast,
}: {
  lead: Lead;
  updateUsaSlots: ReturnType<typeof useCrmLayoutContext>["updateUsaSlots"];
  canModifyLeads: boolean;
  showToast: ReturnType<typeof useCrmLayoutContext>["showToast"];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const isBooked = Boolean(lead.usaSlots?.slotsBooked);
  const currentStatus = isBooked ? "Booked" : "Not Booked";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portalPopover = document.getElementById(`slot-status-portal-${lead.id}`);
        if (portalPopover && portalPopover.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, lead.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canModifyLeads) return;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverHeight = 110;
      const popoverWidth = 148;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top = 0;
      if (spaceBelow < popoverHeight + 10) {
        top = rect.top - popoverHeight - 4;
      } else {
        top = rect.bottom + 4;
      }

      let left = rect.left;
      if (left + popoverWidth > window.innerWidth) {
        left = window.innerWidth - popoverWidth - 16;
      }

      setPopoverPos({ top, left });
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (status: "Booked" | "Not Booked", e: React.MouseEvent) => {
    e.stopPropagation();
    const newBooked = status === "Booked";
    if (newBooked !== isBooked) {
      updateUsaSlots(lead.id, { slotsBooked: newBooked });
      showToast(`Slot status updated to ${status}`, "success");
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left whitespace-nowrap" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        disabled={!canModifyLeads}
        onClick={handleToggle}
        className={`slot-status-pill inline-flex items-center justify-between gap-2 px-3 py-1 text-[11px] font-semibold rounded-xl border whitespace-nowrap transition-all duration-200 shadow-sm min-w-[110px] ${!canModifyLeads
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:shadow-md"
          } ${isBooked
            ? "bg-white hover:bg-slate-50 text-slate-850 border-slate-200/80 shadow-xs dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-100 dark:border-slate-700/80"
            : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/25"
          }`}
        aria-label={`Slot status: ${currentStatus}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${isBooked ? "bg-emerald-500 shadow-emerald-500/40 shadow-sm" : "bg-rose-500 shadow-rose-500/40 shadow-sm"
              }`}
          />
          <span className="whitespace-nowrap font-bold text-[11px]">{currentStatus}</span>
        </div>
        {canModifyLeads && (
          <FiChevronDown
            className={`text-[11px] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              } ${isBooked ? "text-slate-400 dark:text-slate-400" : "text-rose-600 dark:text-rose-400/80"}`}
          />
        )}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id={`slot-status-portal-${lead.id}`}
            style={{
              position: "fixed",
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              zIndex: 99999,
            }}
            className="w-38 min-w-[148px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 z-[99999] transition-all animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
            role="listbox"
          >
            <div className="px-2 py-1 border-b border-slate-100 dark:border-slate-800/80 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Slot Status
              </span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                role="option"
                aria-selected={!isBooked}
                onClick={(e) => handleSelect("Not Booked", e)}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer text-left ${!isBooked
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80"
                  }`}
              >
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className={!isBooked ? "text-rose-700 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}>
                    Not Booked
                  </span>
                </div>
                {!isBooked && <FiCheck className="text-[12px] text-rose-600 dark:text-rose-400 shrink-0" />}
              </button>

              <button
                type="button"
                role="option"
                aria-selected={isBooked}
                onClick={(e) => handleSelect("Booked", e)}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer text-left ${isBooked
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80"
                  }`}
              >
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className={isBooked ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}>
                    Booked
                  </span>
                </div>
                {isBooked && <FiCheck className="text-[12px] text-emerald-600 dark:text-emerald-400 shrink-0" />}
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export function USASlotsTab() {
  const {
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
    usaSlotView,
  } = useCrmLayoutContext();

  const [slotSettingsLead, setSlotSettingsLead] = useState<Lead | null>(null);

  const { usaLeads, filteredUsaLeads } = useUsaSlotTabs();
  const columnSearch = useColumnSearch();

  const activeSettingsLead = useMemo(() => {
    if (!slotSettingsLead) return null;
    return usaLeads.find((l) => l.id === slotSettingsLead.id) || slotSettingsLead;
  }, [slotSettingsLead, usaLeads]);

  const clientSearchGetter = useMemo(
    () => (lead: Lead) =>
      [lead.name, lead.phone, lead.email].filter(Boolean).join(" "),
    []
  );

  const tableRows = useMemo(
    () =>
      applyColumnSearch(
        filteredUsaLeads,
        [
          { searchKey: "client", getSearchValue: clientSearchGetter },
          {
            searchKey: "status",
            getSearchValue: (l: Lead) => (l.usaSlots?.slotsBooked ? "Booked" : "Not Booked"),
            filterMode: "exact",
            filterClearValue: "All",
          },
        ],
        columnSearch.debouncedFilters
      ),
    [filteredUsaLeads, clientSearchGetter, columnSearch.debouncedFilters]
  );

  useEffect(() => {
    registerUsaSlotsExport(() =>
      exportRowsToCsv(
        "usa-slots",
        ["Client", "Phone", "Visa User", "Visa Pass", "Slot User", "Slot Pass", "Mobile", "Car", "Food", "City", "Status"],
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
          l.usaSlots?.slotsBooked ? "Booked" : "Not Booked",
        ])
      )
    );
    return () => registerUsaSlotsExport(null);
  }, [registerUsaSlotsExport, usaLeads]);

  const openSlotSettings = (lead: Lead) => {
    setSlotSettingsLead(lead);
  };

  return (
    <div className="-m-4 md:-m-8 pt-0 pl-0 pr-0 pb-4 md:pt-0 md:pl-0 md:pr-0 md:pb-6 space-y-6">
      <style>{`
        /* High-contrast text styles for Booked row - Light theme */
        .booked-row,
        .booked-row td {
          color: #000000 !important;
        }
        .booked-row span,
        .booked-row p,
        .booked-row div {
          color: #000000 !important;
        }
        .booked-row span.font-mono {
          color: #000000 !important;
          font-weight: 700 !important;
          letter-spacing: 0.02em !important;
        }
        .booked-row td:nth-child(2) button,
        .booked-row button.font-semibold {
          color: #000000 !important;
          font-weight: 800 !important;
        }
        .booked-row td span.text-gray-500,
        .booked-row td span.text-gray-400 {
          color: #1e293b !important;
          font-weight: 600 !important;
        }

        /* Copy buttons inside credential cells - clearly visible and crisp */
        .copyable-cred-btn {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          opacity: 0.85 !important;
          transition: opacity 0.15s ease, background-color 0.15s ease, transform 0.15s ease !important;
        }
        .copyable-cred-btn:hover {
          opacity: 1 !important;
          background-color: rgba(0, 0, 0, 0.08) !important;
          transform: scale(1.1) !important;
        }

        /* High-contrast visibility on Booked row (Light Theme) */
        .booked-row .copyable-cred-btn {
          color: #0f172a !important;
          opacity: 0.9 !important;
        }
        .booked-row .copyable-cred-btn svg {
          stroke: #0f172a !important;
        }
        .booked-row .copyable-cred-btn:hover {
          opacity: 1 !important;
          background-color: rgba(0, 0, 0, 0.12) !important;
          color: #000000 !important;
        }
        .booked-row .copyable-cred-btn:hover svg {
          stroke: #000000 !important;
        }

        /* Security answers pill button - elevated crisp white */
        .booked-row .security-answers-btn {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: rgba(0, 0, 0, 0.12) !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06) !important;
          font-weight: 700 !important;
        }
        .booked-row .security-answers-btn span {
          color: #0f172a !important;
          font-weight: 700 !important;
        }
        .booked-row .security-answers-btn svg:last-child {
          color: #64748b !important;
        }

        /* Status Booked pill - Perfectly match Security Answers button elevation and visibility */
        .booked-row .slot-status-pill {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: rgba(0, 0, 0, 0.12) !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06) !important;
          font-weight: 700 !important;
        }
        .booked-row .slot-status-pill:hover {
          background-color: #f8fafc !important;
        }
        .booked-row .slot-status-pill span {
          color: #0f172a !important;
          font-weight: 700 !important;
        }
        .booked-row .slot-status-pill span.bg-emerald-500 {
          background-color: #10b981 !important;
        }
        .booked-row .slot-status-pill svg {
          color: #64748b !important;
        }

        /* Action buttons in last column - crisp icons with semantic colors */
        .booked-row td:last-child button {
          transition: transform 0.15s ease, opacity 0.15s ease !important;
        }
        .booked-row td:last-child button:hover {
          transform: scale(1.1) !important;
        }
        .booked-row td:last-child button[data-tooltip*="Slot settings"],
        .booked-row td:last-child button[data-tooltip*="settings"] {
          color: #334155 !important;
        }
        .booked-row td:last-child button[data-tooltip*="Call"],
        .booked-row td:last-child button[data-tooltip*="phone"] {
          color: #0284c7 !important;
        }
        .booked-row td:last-child button[data-tooltip*="WhatsApp"],
        .booked-row td:last-child button[data-tooltip*="whatsapp"] {
          color: #15803d !important;
        }
        .booked-row td:last-child button[data-tooltip*="Email"],
        .booked-row td:last-child button[data-tooltip*="email"] {
          color: #0284c7 !important;
        }
        .booked-row td:last-child button[data-tooltip*="Review"],
        .booked-row td:last-child button[data-tooltip*="review"] {
          color: #d97706 !important;
        }

        .booked-row td:last-child button[data-tooltip*="Slot settings"]:hover {
          color: #0f172a !important;
        }
        .booked-row td:last-child button[data-tooltip*="Call"]:hover {
          color: #0369a1 !important;
        }
        .booked-row td:last-child button[data-tooltip*="WhatsApp"]:hover {
          color: #166534 !important;
        }
        .booked-row td:last-child button[data-tooltip*="Email"]:hover {
          color: #0369a1 !important;
        }
        .booked-row td:last-child button[data-tooltip*="Review"]:hover {
          color: #b45309 !important;
        }

        /* High-contrast text styles for Booked row - Dark theme (matches Light Green highlighter) */
        html.dark .booked-row,
        html.dark .booked-row td,
        .dark .booked-row,
        .dark .booked-row td {
          color: #000000 !important;
        }
        html.dark .booked-row span,
        .dark .booked-row span,
        html.dark .booked-row p,
        .dark .booked-row p,
        html.dark .booked-row div,
        .dark .booked-row div {
          color: #000000 !important;
        }
        html.dark .booked-row span.font-mono,
        .dark .booked-row span.font-mono {
          color: #000000 !important;
          font-weight: 700 !important;
          letter-spacing: 0.02em !important;
        }
        html.dark .booked-row td:nth-child(2) button,
        html.dark .booked-row button.font-semibold,
        .dark .booked-row td:nth-child(2) button,
        .dark .booked-row button.font-semibold {
          color: #000000 !important;
          font-weight: 800 !important;
        }
        html.dark .booked-row td span.text-gray-500,
        html.dark .booked-row td span.text-slate-400,
        .dark .booked-row td span.text-gray-500,
        .dark .booked-row td span.text-slate-400 {
          color: #1e293b !important;
          font-weight: 600 !important;
        }

        /* High-contrast visibility on Booked row (Dark Theme) */
        html.dark .booked-row .copyable-cred-btn,
        .dark .booked-row .copyable-cred-btn {
          color: #0f172a !important;
          opacity: 0.9 !important;
        }
        html.dark .booked-row .copyable-cred-btn svg,
        .dark .booked-row .copyable-cred-btn svg {
          stroke: #0f172a !important;
        }
        html.dark .booked-row .copyable-cred-btn:hover,
        .dark .booked-row .copyable-cred-btn:hover {
          opacity: 1 !important;
          background-color: rgba(0, 0, 0, 0.12) !important;
          color: #000000 !important;
        }
        html.dark .booked-row .copyable-cred-btn:hover svg,
        .dark .booked-row .copyable-cred-btn:hover svg {
          stroke: #000000 !important;
        }
        html.dark .booked-row .security-answers-btn,
        .dark .booked-row .security-answers-btn {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: rgba(0, 0, 0, 0.12) !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06) !important;
          font-weight: 700 !important;
        }
        html.dark .booked-row .security-answers-btn span,
        .dark .booked-row .security-answers-btn span {
          color: #0f172a !important;
          font-weight: 700 !important;
        }
        html.dark .booked-row .security-answers-btn svg:last-child,
        .dark .booked-row .security-answers-btn svg:last-child {
          color: #64748b !important;
        }
        html.dark .booked-row .slot-status-pill,
        .dark .booked-row .slot-status-pill {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: rgba(0, 0, 0, 0.12) !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06) !important;
          font-weight: 700 !important;
        }
        html.dark .booked-row .slot-status-pill:hover,
        .dark .booked-row .slot-status-pill:hover {
          background-color: #f8fafc !important;
        }
        html.dark .booked-row .slot-status-pill span,
        .dark .booked-row .slot-status-pill span {
          color: #0f172a !important;
          font-weight: 700 !important;
        }
        html.dark .booked-row .slot-status-pill span.bg-emerald-500,
        .dark .booked-row .slot-status-pill span.bg-emerald-500 {
          background-color: #10b981 !important;
        }
        html.dark .booked-row .slot-status-pill svg,
        .dark .booked-row .slot-status-pill svg {
          color: #64748b !important;
        }

        html.dark .booked-row td:last-child button[data-tooltip*="Slot settings"],
        .dark .booked-row td:last-child button[data-tooltip*="Slot settings"] {
          color: #334155 !important;
        }
        html.dark .booked-row td:last-child button[data-tooltip*="Call"],
        .dark .booked-row td:last-child button[data-tooltip*="Call"] {
          color: #0284c7 !important;
        }
        html.dark .booked-row td:last-child button[data-tooltip*="WhatsApp"],
        .dark .booked-row td:last-child button[data-tooltip*="WhatsApp"] {
          color: #15803d !important;
        }
        html.dark .booked-row td:last-child button[data-tooltip*="Email"],
        .dark .booked-row td:last-child button[data-tooltip*="Email"] {
          color: #0284c7 !important;
        }
        html.dark .booked-row td:last-child button[data-tooltip*="Review"],
        .dark .booked-row td:last-child button[data-tooltip*="Review"] {
          color: #d97706 !important;
        }

        html.dark .booked-row td:last-child button[data-tooltip*="Slot settings"]:hover,
        .dark .booked-row td:last-child button[data-tooltip*="Slot settings"]:hover {
          color: #0f172a !important;
        }
        html.dark .booked-row td:last-child button[data-tooltip*="Call"]:hover,
        .dark .booked-row td:last-child button[data-tooltip*="Call"]:hover {
          color: #0369a1 !important;
        }
        html.dark .booked-row td:last-child button[data-tooltip*="WhatsApp"]:hover,
        .dark .booked-row td:last-child button[data-tooltip*="WhatsApp"]:hover {
          color: #166534 !important;
        }
        html.dark .booked-row td:last-child button[data-tooltip*="Email"]:hover,
        .dark .booked-row td:last-child button[data-tooltip*="Email"]:hover {
          color: #0369a1 !important;
        }
        html.dark .booked-row td:last-child button[data-tooltip*="Review"]:hover,
        .dark .booked-row td:last-child button[data-tooltip*="Review"]:hover {
          color: #b45309 !important;
        }
      `}</style>
      <CollapsiblePanel open={isCreateUsaLeadOpen && canModifyLeads}>
        <div className="mb-4">
          <CreateLeadWizardPage
            key={createUsaLeadSession}
            variant="inline"
            onClose={closeCreateUsaLead}
            isFromUsaSlotsTab={true}
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
        getRowClassName={(lead) =>
          lead.usaSlots?.slotsBooked
            ? "booked-row bg-[#90EE90] hover:bg-[#80e580] dark:bg-[#90EE90] dark:hover:bg-[#80e580] border-b border-[#60cf60] dark:border-[#60cf60] [&>td:first-child]:border-l-4 [&>td:first-child]:border-l-[#15803d] dark:[&>td:first-child]:border-l-[#15803d]"
            : undefined
        }
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
          {
            header: "Status",
            searchKey: "status",
            searchLabel: "Status",
            filterSelectOptions: [
              { value: "All", label: "All" },
              { value: "Booked", label: "Booked" },
              { value: "Not Booked", label: "Not Booked" },
            ],
            filterSelectPlaceholder: "All",
            filterSelectPortalId: "usa-slots-status-filter-portal",
            filterSelectClearValue: "All",
            filterSelectShowSearch: false,
            getSearchValue: (l: Lead) => (l.usaSlots?.slotsBooked ? "Booked" : "Not Booked"),
            render: (lead) => (
              <UsaSlotStatusDropdownCell
                lead={lead}
                updateUsaSlots={updateUsaSlots}
                canModifyLeads={canModifyLeads}
                showToast={showToast}
              />
            ),
          },
        ]}
        actions={(lead) => [
          {
            icon: FiSettings,
            title: "Slot settings",
            onClick: openSlotSettings,
          },
          { icon: FiPhone, title: "Call", onClick: (l) => window.open(`tel:${l.phone}`) },
          {
            icon: FaWhatsapp,
            title: "WhatsApp",
            onClick: (l) =>
              window.open(
                `https://wa.me/${l.phone.replace(/[^0-9]/g, "")}`,
                "_blank"
              ),
          },
          { icon: FiMail, title: "Email", onClick: (l) => window.open(`mailto:${l.email}`) },
          {
            icon: FaRegStar,
            title: "Review",
            onClick: (l) => {
              const name = l.name || "Client";
              const message = `Hello ${name}, thank you for choosing JM Visa Services. We hope you had a great experience!`;
              window.open(
                `https://wa.me/${l.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`,
                "_blank"
              );
            },
          },
        ]}
        emptyText={
          usaSlotView === "booked"
            ? "No booked USA leads yet."
            : usaSlotView === "paid"
              ? "No paid USA leads yet."
              : "No available USA leads yet."
        }
      />

      {activeSettingsLead && (
        <UsaSlotSettingsModal
          lead={activeSettingsLead}
          onClose={() => setSlotSettingsLead(null)}
          updateUsaSlots={updateUsaSlots}
          setLeadCredentials={setLeadCredentials}
          showToast={showToast}
        />
      )}
    </div>
  );
}
