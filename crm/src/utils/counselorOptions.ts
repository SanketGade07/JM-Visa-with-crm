import type { CrmUser } from "@/context/CrmContext";

export const UNASSIGNED_COUNSELOR = "Unassigned";

export type CounselorOption = { value: string; label: string };

export function isAssignableCounselorStaff(user: CrmUser): boolean {
  return user.role !== "ADMIN" && user.id !== "user-admin";
}

export function getAssignableCounselorNames(users: CrmUser[]): string[] {
  return users
    .filter(isAssignableCounselorStaff)
    .map((user) => user.name.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function withLegacyCounselor(names: string[], currentValue?: string | null): string[] {
  const uniqueNames = new Set(names);
  const value = currentValue?.trim();
  if (value && value !== UNASSIGNED_COUNSELOR && !uniqueNames.has(value)) {
    uniqueNames.add(value);
  }
  return [...uniqueNames].sort((a, b) => a.localeCompare(b));
}

export function buildCounselorSelectOptions(
  users: CrmUser[],
  options?: { currentValue?: string | null; includeUnassigned?: boolean }
): CounselorOption[] {
  const { currentValue, includeUnassigned = true } = options ?? {};
  const names = withLegacyCounselor(getAssignableCounselorNames(users), currentValue);
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
