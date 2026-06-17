"use client";

import React, { useEffect, useState } from "react";
import type { Lead } from "@/context/CrmContext";
import { FaTimes } from "react-icons/fa";
import { getLeadPaymentSummary, validatePackageAmount } from "@/utils/leadPaymentUtils";

type UpdatePackageModalProps = {
  lead: Lead;
  onClose: () => void;
  onSave: (leadId: string, totalPackage: number) => void;
  showToast: (message: string, type?: "success" | "error") => void;
};

export function UpdatePackageModal({
  lead,
  onClose,
  onSave,
  showToast,
}: UpdatePackageModalProps) {
  const summary = getLeadPaymentSummary(lead);
  const isUpdate = summary.totalPackage > 0;
  const [amount, setAmount] = useState(
    summary.totalPackage > 0 ? String(summary.totalPackage) : ""
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const totalPackage = parseFloat(amount);
    const validation = validatePackageAmount(lead, totalPackage);
    if (!validation.ok) {
      showToast(validation.message, "error");
      return;
    }
    onSave(lead.id, totalPackage);
    showToast(isUpdate ? "Package amount updated" : "Package amount set", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 dark:bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0a0a1a] border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 rounded-lg"
        >
          <FaTimes />
        </button>

        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-900 pb-3">
            {isUpdate ? "Update Invoiced Package" : "Set Invoiced Package"}
          </h3>
          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
            {lead.name} · {lead.country}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {summary.received > 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/80 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-500">
                Already received
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                ₹{summary.received.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-[10px] text-gray-500 dark:text-slate-500">
                Package must be at least this amount.
              </p>
            </div>
          ) : null}

          <div className="space-y-1">
            <label
              htmlFor="package-amount"
              className="text-gray-500 dark:text-slate-400 font-bold block"
            >
              Package amount (INR)
            </label>
            <input
              id="package-amount"
              required
              type="number"
              min={summary.received > 0 ? summary.received : 1}
              step={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g. 50000"
              className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:border-violet-500/50 text-gray-900 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-600"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount.trim()}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 font-bold text-white rounded-xl transition-colors"
            >
              {isUpdate ? "Update package" : "Set package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
