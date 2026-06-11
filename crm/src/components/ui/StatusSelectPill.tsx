"use client";

import React from "react";
import type { VisaStatus } from "@/context/CrmContext";
import { getPillClasses } from "@/components/ui/DataTable";
import { TablePillSelect } from "@/components/ui/TablePillSelect";
import { STATUS_PILL_DROPDOWN_MAX_HEIGHT } from "@/utils/dropdownConstants";

const STATUS_OPTIONS: VisaStatus[] = [
  "New Lead",
  "Lead Assigned",
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

const STATUS_OPTIONS_LIST = STATUS_OPTIONS.map((status) => ({
  value: status,
  label: status,
}));

type StatusSelectPillProps = {
  value: VisaStatus;
  disabled?: boolean;
  onChange: (value: VisaStatus) => void;
  portalId?: string;
};

export function StatusSelectPill({
  value,
  disabled,
  onChange,
  portalId = "status-pill-select",
}: StatusSelectPillProps) {
  return (
    <TablePillSelect
      value={value}
      options={STATUS_OPTIONS_LIST}
      onChange={(v) => onChange(v as VisaStatus)}
      disabled={disabled}
      portalId={portalId}
      getPillClassName={getPillClasses}
      ariaLabel={`Status: ${value}`}
      searchPlaceholder="Search status..."
      maxMenuHeight={STATUS_PILL_DROPDOWN_MAX_HEIGHT}
    />
  );
}
