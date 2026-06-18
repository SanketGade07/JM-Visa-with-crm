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

  return useMemo(
    () => buildCounselorSelectOptions(users, { currentValue, ...options }),
    [users, currentValue, options?.includeUnassigned]
  );
}

export function useCounselorFilterOptions(): CounselorOption[] {
  const { users } = useCrm();

  return useMemo(() => buildCounselorFilterOptions(users), [users]);
}
