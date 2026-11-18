"use client";

import { useMemo } from "react";
import { useCrm } from "@/context/CrmContext";
import {
  buildCounselorFilterOptions,
  buildCounselorSelectOptions,
  type CounselorOption,
} from "@/utils/counselorOptions";

export function useCounselorSelectOptions(
  currentValue?: string | null,
  options?: { includeUnassigned?: boolean }
): CounselorOption[] {
  const { users } = useCrm();

  return useMemo(() => {
    const built = buildCounselorSelectOptions(users, options);
    const extra = currentValue?.trim() ?? "";
    if (extra && !built.some((option) => option.value === extra)) {
      built.push({ value: extra, label: extra });
    }
    return built;
  }, [users, options?.includeUnassigned, currentValue]);
}

export function useCounselorFilterOptions(): CounselorOption[] {
  const { users } = useCrm();

  return useMemo(() => buildCounselorFilterOptions(users), [users]);
}
