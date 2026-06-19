import type { CrmUser, Lead } from "@/context/CrmContext";

export const UNASSIGNED_COUNSELOR = "Unassigned";

export type CounselorOption = { value: string; label: string };

export function isCounselorAssigned(counselor: string | undefined | null): boolean {
  const value = counselor?.trim() ?? "";
  return value !== "" && value.toLowerCase() !== UNASSIGNED_COUNSELOR.toLowerCase();
}

export function isAssignableCounselorStaff(user: CrmUser): boolean {
  return user.role === "COUNSELOR" && user.id !== "user-admin";
}

export function getAssignableCounselorNames(users: CrmUser[]): string[] {
  return users
    .filter(isAssignableCounselorStaff)
    .map((user) => user.name.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function buildCounselorSelectOptions(
  users: CrmUser[],
  options?: { includeUnassigned?: boolean }
): CounselorOption[] {
  const { includeUnassigned = true } = options ?? {};
  const names = getAssignableCounselorNames(users);
  const result: CounselorOption[] = [];

  if (includeUnassigned) {
    result.push({ value: UNASSIGNED_COUNSELOR, label: UNASSIGNED_COUNSELOR });
  }

  result.push(...names.map((name) => ({ value: name, label: name })));
  return result;
}

export function buildCounselorFilterOptions(
  users: CrmUser[],
  options?: { excludeUnassigned?: boolean }
): CounselorOption[] {
  const names = getAssignableCounselorNames(users);
  const result: CounselorOption[] = [{ value: "All", label: "All Counselors" }];
  if (!options?.excludeUnassigned) {
    result.push({ value: UNASSIGNED_COUNSELOR, label: UNASSIGNED_COUNSELOR });
  }
  result.push(...names.map((name) => ({ value: name, label: name })));
  return result;
}

/** Leads assigned to a counselor no longer in staff — returns copies with counselor set to Unassigned. */
export function reconcileOrphanCounselorAssignments(users: CrmUser[], leads: Lead[]): Lead[] {
  const activeCounselors = new Set(
    getAssignableCounselorNames(users).map((name) => name.toLowerCase())
  );

  return leads
    .filter((lead) => {
      const counselor = lead.counselor?.trim() ?? "";
      if (!counselor) return false;
      if (counselor.toLowerCase() === UNASSIGNED_COUNSELOR.toLowerCase()) return false;
      return !activeCounselors.has(counselor.toLowerCase());
    })
    .map((lead) => ({ ...lead, counselor: UNASSIGNED_COUNSELOR }));
}
