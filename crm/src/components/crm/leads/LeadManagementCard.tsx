"use client";

import React, { useMemo, useState } from "react";
import type { Lead } from "@/context/CrmContext";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { StatusSelectPill } from "@/components/ui/StatusSelectPill";
import { CounselorSelectPill } from "@/components/ui/CounselorSelectPill";
import { isUsaCountry } from "@/utils/countryUtils";
import { canRecordLeadDeposit, getLeadPaymentSummary } from "@/utils/leadPaymentUtils";
import { FiUser, FiLock, FiPhone, FiHelpCircle } from "react-icons/fi";
import { FaCar, FaUtensils, FaCity } from "react-icons/fa";

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

function CredentialField({
  value,
  icon: Icon,
  iconColorClass = "text-slate-500 dark:text-slate-400",
  tooltipText,
  toastMessage,
  showToast,
}: {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  tooltipText: string;
  toastMessage: string;
  showToast: (message: string, type?: "success" | "error") => void;
}) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;
    try {
      navigator.clipboard.writeText(value);
      showToast(toastMessage, "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  return (
    <button
      type="button"
      data-tooltip={value ? tooltipText : undefined}
      onClick={handleCopy}
      disabled={!value}
      className="flex items-center gap-2.5 text-[13px] font-semibold text-gray-800 dark:text-slate-100 rounded-xl py-2 px-3 bg-slate-50 dark:bg-slate-800/10 border border-gray-100 dark:border-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 hover:border-gray-200 dark:hover:border-slate-700/50 cursor-pointer transition-all w-full text-left focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-text"
    >
      <Icon className={`text-[14px] shrink-0 ${iconColorClass}`} />
      <span className="truncate block flex-1">{value || "—"}</span>
    </button>
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

  const cardCls =
    "w-full rounded-2xl bg-white dark:bg-slate-900/60 p-5 transition-all duration-300";

  const highlightRingCls = highlighted
    ? "border border-violet-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] dark:shadow-[0_0_15px_rgba(37,99,235,0.3)] animate-lead-created-highlight"
    : "border border-gray-200 dark:border-transparent shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section 1: Lead Management */}
      <section className={`${cardCls} ${highlightRingCls}`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className={sectionTitleCls}>
            Lead Management
          </h2>
        </div>

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
        </div>
      </section>

      {/* Section 2: Visa Portal / US Slot Portal */}
      <section className={`${cardCls} ${highlightRingCls}`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className={sectionTitleCls}>
            Visa Portal
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3">
            <CredentialField
              value={lead.visaCredentials?.username?.trim() ?? ""}
              icon={FiUser}
              iconColorClass="text-slate-500 dark:text-slate-400"
              tooltipText="Copy visa username"
              toastMessage="Visa username copied"
              showToast={showToast}
            />
            <CredentialField
              value={lead.visaCredentials?.password?.trim() ?? ""}
              icon={FiLock}
              iconColorClass="text-slate-500 dark:text-slate-400"
              tooltipText="Copy visa password"
              toastMessage="Visa password copied"
              showToast={showToast}
            />
          </div>
        </div>

        {isUsa ? (
          <div className="border-t border-gray-200 dark:border-slate-800/80 pt-4 mt-4 space-y-4">
            <h3 className={sectionTitleCls}>USA Slot Portal</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3">
                <CredentialField
                  value={lead.usaSlots?.slotPortalUsername?.trim() ?? ""}
                  icon={FiUser}
                  iconColorClass="text-blue-500 dark:text-blue-400"
                  tooltipText="Copy slots username"
                  toastMessage="Slots portal username copied"
                  showToast={showToast}
                />
                <CredentialField
                  value={lead.usaSlots?.slotPortalPassword?.trim() ?? ""}
                  icon={FiLock}
                  iconColorClass="text-blue-500 dark:text-blue-400"
                  tooltipText="Copy slots password"
                  toastMessage="Slots portal password copied"
                  showToast={showToast}
                />
                <CredentialField
                  value={lead.usaSlots?.trackingMobile?.trim() ?? ""}
                  icon={FiPhone}
                  iconColorClass="text-blue-500 dark:text-blue-400"
                  tooltipText="Copy slots mobile number"
                  toastMessage="Slots tracking mobile number copied"
                  showToast={showToast}
                />
                {lead.usaSlots?.securityQuestions && lead.usaSlots.securityQuestions.length > 0 ? (
                  lead.usaSlots.securityQuestions.map((q, idx) => {
                    const icon = q.question.toLowerCase().includes("car") ? FaCar :
                                 q.question.toLowerCase().includes("food") ? FaUtensils :
                                 q.question.toLowerCase().includes("city") ? FaCity :
                                 FiHelpCircle;
                    return (
                      <CredentialField
                        key={idx}
                        value={q.answer?.trim() ?? ""}
                        icon={icon}
                        iconColorClass="text-blue-500 dark:text-blue-400"
                        tooltipText={`Copy ${q.question} security answer`}
                        toastMessage={`${q.question} answer copied`}
                        showToast={showToast}
                      />
                    );
                  })
                ) : (
                  <>
                    <CredentialField
                      value={lead.usaSlots?.securityCar?.trim() ?? ""}
                      icon={FaCar}
                      iconColorClass="text-blue-500 dark:text-blue-400"
                      tooltipText="Copy slots car security answer"
                      toastMessage="Car security answer copied"
                      showToast={showToast}
                    />
                    <CredentialField
                      value={lead.usaSlots?.securityFood?.trim() ?? ""}
                      icon={FaUtensils}
                      iconColorClass="text-blue-500 dark:text-blue-400"
                      tooltipText="Copy slots food security answer"
                      toastMessage="Food security answer copied"
                      showToast={showToast}
                    />
                    <CredentialField
                      value={lead.usaSlots?.securityCity?.trim() ?? ""}
                      icon={FaCity}
                      iconColorClass="text-blue-500 dark:text-blue-400"
                      tooltipText="Copy slots city security answer"
                      toastMessage="City security answer copied"
                      showToast={showToast}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Section 3: Payments */}
      <section className={`${cardCls} ${highlightRingCls}`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className={sectionTitleCls}>
            Payments
          </h2>
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

        <div className="space-y-4">
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
      </section>
    </div>
  );
}
