"use client";

import React from "react";
import type { VisaStatus } from "@/context/CrmContext";

const STATUS_OPTIONS: VisaStatus[] = [
  "New Lead",
  "Contacted",
  "Follow-Up",
  "Interested",
  "Documents Pending",
  "Documents Received",
  "Under Verification",
  "Ready For Submission",
  "Visa Submitted",
  "Approved / Rejected",
  "Closed",
  "Dropped",
];

type StatusSelectPillProps = {
  value: VisaStatus;
  disabled?: boolean;
  onChange: (value: VisaStatus) => void;
  onClick?: (e: React.MouseEvent<HTMLSelectElement>) => void;
};

export function StatusSelectPill({ value, disabled, onChange, onClick }: StatusSelectPillProps) {
  return (
    <span className={`relative inline-block${disabled ? " opacity-60" : ""}`}>
      <span
        data-status={value}
        className="status-select-pill inline-block whitespace-nowrap py-0.5 px-2.5 text-[11px] font-semibold rounded-full border leading-tight"
        aria-hidden
      >
        {value}
      </span>
      <select
        value={value}
        onClick={onClick}
        onChange={(e) => onChange(e.target.value as VisaStatus)}
        disabled={disabled}
        className="status-select-pill-input"
        aria-label={`Status: ${value}`}
      >
        {STATUS_OPTIONS.map((status) => (
          <option
            key={status}
            value={status}
            className="bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-50"
          >
            {status}
          </option>
        ))}
      </select>
    </span>
  );
}
