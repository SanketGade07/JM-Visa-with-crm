"use client";

import React from "react";
import { TablePillSelect } from "@/components/ui/TablePillSelect";

export const COUNSELOR_OPTIONS = [
  { value: "Unassigned", label: "Unassigned" },
  { value: "Priya Mehta", label: "Priya Mehta" },
  { value: "Rohit Verma", label: "Rohit Verma" },
  { value: "Simran Kaur", label: "Simran Kaur" },
];

const getCounselorPillClass = () =>
  "bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-medium";

type CounselorSelectPillProps = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  portalId: string;
};

export function CounselorSelectPill({
  value,
  disabled,
  onChange,
  portalId,
}: CounselorSelectPillProps) {
  return (
    <TablePillSelect
      value={value}
      options={COUNSELOR_OPTIONS}
      onChange={onChange}
      disabled={disabled}
      portalId={portalId}
      getPillClassName={getCounselorPillClass}
      ariaLabel={`Counselor: ${value}`}
      searchPlaceholder="Search counselor..."
    />
  );
}
