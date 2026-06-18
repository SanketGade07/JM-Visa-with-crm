"use client";

import React, { useMemo, useState } from "react";
import type { Lead } from "@/context/CrmContext";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { StatusSelectPill } from "@/components/ui/StatusSelectPill";
import { CounselorSelectPill } from "@/components/ui/CounselorSelectPill";
import { isUsaCountry } from "@/utils/countryUtils";
import { canRecordLeadDeposit, getLeadPaymentSummary } from "@/utils/leadPaymentUtils";

type LeadManagementCardProps = {
  lead: Lead;
  className?: string;
  highlighted?: boolean;
};

const fieldLabelCls =
  "text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block";

const sectionDividerCls = "border-t border-gray-200 dark:border-slate-800/80 pt-4 space-y-4";

const sectionTitleCls =
  "text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500";

const fieldInputCls =
  "w-full bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed";

function deriveSlotStatusLabel(lead: Lead): string {
  if (lead.usaSlots?.slotsPaid) return "Paid";
  if (lead.usaSlots?.slotsAvailable) return "Available";
  return "—";
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className={fieldLabelCls}>{label}</span>
      <span className="text-[13px] font-semibold text-gray-800 dark:text-slate-100 block break-words">
        {value || "—"}
      </span>
    </div>
  );
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function LeadManagementCard({
  lead,
  className = "",
  highlighted = false,
}: LeadManagementCardProps) {
  const {
    updateLeadStatus,
    assignCounselor,
    canModifyLeads,
    canAssignLeads,
    canManagePayments,
    setLeadPackage,
    openProfileDepositModal,
    showToast,
  } = useCrmLayoutContext();

  const isUsa = isUsaCountry(lead.country);
  const paymentSummary = useMemo(() => getLeadPaymentSummary(lead), [lead.payments]);
  const [packageDraft, setPackageDraft] = useState("");

  const handleSetPackage = () => {
    if (!canManagePayments) return;
    const amount = parseFloat(packageDraft);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("Enter a valid package amount", "error");
      return;
    }
    setLeadPackage(lead.id, amount);
    setPackageDraft("");
    showToast("Package amount set", "success");
  };

  const handleRecordDeposit = () => {
    if (!canManagePayments || !canRecordLeadDeposit(lead)) return;
    openProfileDepositModal(lead.id);
  };

  const fields = (
    <div className="space-y-4">
        <div className="space-y-1.5">
          <label className={fieldLabelCls} htmlFor={`lead-status-${lead.id}`}>
            Status
          </label>
          <StatusSelectPill
            variant="field"
            value={lead.status}
            disabled={!canModifyLeads}
            portalId={`mgmt-status-${lead.id}`}
            onChange={(status) => updateLeadStatus(lead.id, status)}
          />
        </div>

        <div className="space-y-1.5">
          <label className={fieldLabelCls} htmlFor={`lead-counselor-${lead.id}`}>
            Assigned To
          </label>
          <CounselorSelectPill
            variant="field"
            value={lead.counselor}
            disabled={!canModifyLeads || !canAssignLeads}
            portalId={`mgmt-counselor-${lead.id}`}
            onChange={(counselor) => assignCounselor(lead.id, counselor)}
          />
        </div>

        <div className={sectionDividerCls}>
          <h3 className={sectionTitleCls}>Visa Portal</h3>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <InfoField
              label="Username"
              value={lead.visaCredentials?.username?.trim() ?? ""}
            />
            <InfoField
              label="Password"
              value={lead.visaCredentials?.password?.trim() ?? ""}
            />
          </div>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
            Edit visa portal credentials in the Settings tab.
          </p>
        </div>

        {isUsa ? (
          <div className={sectionDividerCls}>
            <h3 className={sectionTitleCls}>USA Slot Portal</h3>
            <div className="space-y-4">
              <InfoField label="US Slot Tracking" value={deriveSlotStatusLabel(lead)} />

              <div className="space-y-3">
                <span className={fieldLabelCls}>Slot Portal</span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                  <InfoField
                    label="User ID"
                    value={lead.usaSlots?.slotPortalUsername?.trim() ?? ""}
                  />
                  <InfoField
                    label="Password"
                    value={lead.usaSlots?.slotPortalPassword?.trim() ?? ""}
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                Edit slot portal details in the Settings tab.
              </p>
            </div>
          </div>
        ) : null}

        <div className={sectionDividerCls}>
          <div className="flex items-center justify-between gap-2">
            <h3 className={sectionTitleCls}>Payments</h3>
            {paymentSummary.status ? (
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                  paymentSummary.status === "pending"
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                }`}
              >
                {paymentSummary.status === "pending" ? "Pending" : "Received"}
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-gray-500 dark:text-slate-400 font-semibold">Total package</span>
              <span className="font-bold text-gray-800 dark:text-slate-100 tabular-nums">
                {paymentSummary.totalPackage > 0
                  ? formatInr(paymentSummary.totalPackage)
                  : "Not set"}
              </span>
            </div>
            {paymentSummary.totalPackage <= 0 ? (
              <div className="space-y-2">
                <label className={fieldLabelCls} htmlFor={`mgmt-package-amount-${lead.id}`}>
                  Set package amount
                </label>
                <input
                  id={`mgmt-package-amount-${lead.id}`}
                  type="number"
                  min="1"
                  step="1"
                  value={packageDraft}
                  onChange={(e) => setPackageDraft(e.target.value)}
                  disabled={!canManagePayments}
                  placeholder="e.g. 50000"
                  className={fieldInputCls}
                />
                <button
                  type="button"
                  disabled={!canManagePayments || !packageDraft.trim()}
                  onClick={handleSetPackage}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 font-bold text-white text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Set package
                </button>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-gray-500 dark:text-slate-400 font-semibold">Received</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatInr(paymentSummary.received)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-gray-500 dark:text-slate-400 font-semibold">Pending</span>
              <span
                className={`font-bold tabular-nums ${
                  paymentSummary.pending > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-gray-800 dark:text-slate-100"
                }`}
              >
                {paymentSummary.totalPackage > 0
                  ? formatInr(paymentSummary.pending)
                  : formatInr(0)}
              </span>
            </div>
          </div>
          {canManagePayments && canRecordLeadDeposit(lead) ? (
            <button
              type="button"
              onClick={handleRecordDeposit}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 font-bold text-white text-xs rounded-xl cursor-pointer transition-colors"
            >
              Record deposit
            </button>
          ) : null}
        </div>
    </div>
  );

  return (
    <section
      className={`w-full rounded-2xl border border-gray-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(148,163,184,0.08)] transition-shadow duration-300 ${
        highlighted
          ? "ring-2 ring-violet-500/70 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 animate-lead-created-highlight"
          : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
          Lead Management
        </h2>
      </div>

      {fields}
    </section>
  );
}
