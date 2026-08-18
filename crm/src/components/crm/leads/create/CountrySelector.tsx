"use client";

import React from "react";
import { SearchableCountrySelect } from "@/components/ui/FormInputs";
import { FormSection } from "./FormSection";

type CountrySelectorProps = {
  name?: string;
  value?: string | string[];
  onChange?: (value: string) => void;
  required?: boolean;
  isMulti?: boolean;
  label?: string;
  inputId?: string;
  error?: string;
};

export function CountrySelector({
  name = "country",
  value,
  onChange,
  required,
  isMulti = true,
  label = "Immigration Country",
  inputId,
  error,
}: CountrySelectorProps) {
  return (
    <FormSection label={label} htmlFor={inputId} error={error} required={required}>
      <SearchableCountrySelect
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        isMulti={isMulti}
        inputId={inputId}
      />
    </FormSection>
  );
}

