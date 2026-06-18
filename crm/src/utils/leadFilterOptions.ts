import type { Lead } from "@/context/CrmContext";
import type { CrmUser } from "@/context/CrmContext";
import { buildCounselorFilterOptions } from "@/utils/counselorOptions";
import { destinationFilterOptions } from "@/components/ui/FormInputs";

export type LeadFilterOption = { value: string; label: string };

export function getCountrySelectOptions(): LeadFilterOption[] {
  return destinationFilterOptions.filter((option) => option.value !== "All");
}

export function getCountryFilterOptions(): LeadFilterOption[] {
  return destinationFilterOptions;
}

export function getVisaServiceSelectOptions(
  leads: Lead[],
  currentValue?: string
): LeadFilterOption[] {
  const types = new Set(leads.map((lead) => lead.visaType).filter(Boolean));
  if (currentValue?.trim()) {
    types.add(currentValue.trim());
  }
  return [...types].sort().map((type) => ({ value: type, label: type }));
}

export function getVisaServiceFilterOptions(leads: Lead[]): LeadFilterOption[] {
  return [
    { value: "All", label: "All Services" },
    ...getVisaServiceSelectOptions(leads),
  ];
}

export function getCounselorFilterOptions(
  users: CrmUser[],
  options?: { excludeUnassigned?: boolean }
): LeadFilterOption[] {
  return buildCounselorFilterOptions(users, options);
}
