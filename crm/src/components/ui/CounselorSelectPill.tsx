"use client";

import React from "react";
import { TablePillSelect } from "@/components/ui/TablePillSelect";
import { useCounselorSelectOptions } from "@/hooks/useCounselorOptions";

const getCounselorPillClass = () =>
  "bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-medium";

type CounselorSelectPillProps = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  portalId: string;
  variant?: "pill" | "field";
};

export function CounselorSelectPill({
  value,
  disabled,
  onChange,
  portalId,
  variant = "pill",
}: CounselorSelectPillProps) {
  const options = useCounselorSelectOptions(value);

  return (
    <TablePillSelect
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      portalId={portalId}
      variant={variant}
      getPillClassName={getCounselorPillClass}
      ariaLabel={`Counselor: ${value}`}
      searchPlaceholder="Search counselor..."
    />
  );
}
