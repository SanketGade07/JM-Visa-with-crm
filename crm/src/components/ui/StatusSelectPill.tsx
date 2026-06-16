"use client";

import React from "react";
import type { VisaStatus } from "@/context/CrmContext";
import { TablePillSelect } from "@/components/ui/TablePillSelect";
import { STATUS_PILL_DROPDOWN_MAX_HEIGHT } from "@/utils/dropdownConstants";
import {
  LEAD_STATUS_ORDER,
  getStatusLabel,
  getStatusPillStyle,
} from "@/utils/leadStatusConfig";

const STATUS_OPTIONS_LIST = LEAD_STATUS_ORDER.map((status) => ({
  value: status,
  label: getStatusLabel(status),
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
      getPillStyle={getStatusPillStyle}
      ariaLabel={`Status: ${getStatusLabel(value)}`}
      searchPlaceholder="Search status..."
      maxMenuHeight={STATUS_PILL_DROPDOWN_MAX_HEIGHT}
    />
  );
}
