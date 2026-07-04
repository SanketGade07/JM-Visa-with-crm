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
  _leads?: Lead[],
  _currentValue?: string
): LeadFilterOption[] {
  return [
    { value: "Business Visa", label: "Business Visa" },
    { value: "Residence Visa", label: "Residence Visa" },
    { value: "Study Abroad", label: "Study Abroad" },
    { value: "Tourist Visa", label: "Tourist Visa" },
    { value: "Work Visa", label: "Work Visa" },
    { value: "Other", label: "Other" },
  ];
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
