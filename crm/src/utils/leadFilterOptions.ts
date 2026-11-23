import type { Lead } from "@/context/CrmContext";
import type { CrmUser } from "@/context/CrmContext";
import { buildCounselorFilterOptions } from "@/utils/counselorOptions";
import { destinationFilterOptions } from "@/components/ui/FormInputs";
import { USA_VISA_CATEGORIES } from "@/utils/countryUtils";

export type LeadFilterOption = { value: string; label: string };

export function getCountrySelectOptions(): LeadFilterOption[] {
  return destinationFilterOptions.filter((option) => option.value !== "All");
}

export function getCountryFilterOptions(): LeadFilterOption[] {
  return destinationFilterOptions;
}

export function getVisaServiceSelectOptions(
  _leads?: Lead[],
  _currentValue?: string,
  isUsa?: boolean
): LeadFilterOption[] {
  if (isUsa) {
    return [
      ...USA_VISA_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
      { value: "Other", label: "Other" },
    ];
  }
  return [
    { value: "Business Visa", label: "Business Visa" },
    { value: "Residence Visa", label: "Residence Visa" },
    { value: "Student Visa", label: "Student Visa" },
    { value: "Study Abroad", label: "Study Abroad" },
    { value: "Tourist Visa", label: "Tourist Visa" },
    { value: "USA Visa", label: "USA Visa" },
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
