"use client";

import React from "react";
import { SearchableCountrySelect } from "@/components/ui/FormInputs";
import { FormSection } from "./FormSection";

type CountrySelectorProps = {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  label?: string;
};

export function CountrySelector({
  name = "country",
  value,
  onChange,
  required,
  label = "Immigration Country",
}: CountrySelectorProps) {
  return (
    <FormSection label={label}>
      <SearchableCountrySelect name={name} value={value} onChange={onChange} required={required} />
    </FormSection>
  );
}
