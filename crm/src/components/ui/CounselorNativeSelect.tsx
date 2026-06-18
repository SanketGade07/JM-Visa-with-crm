"use client";

import React from "react";
import { useCounselorSelectOptions } from "@/hooks/useCounselorOptions";

type CounselorNativeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  includeUnassigned?: boolean;
};

type CounselorFormSelectProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  includeUnassigned?: boolean;
  required?: boolean;
};

export function CounselorFormSelect({
  name,
  defaultValue,
  className,
  includeUnassigned = false,
  required,
}: CounselorFormSelectProps) {
  const options = useCounselorSelectOptions(defaultValue, { includeUnassigned });

  return (
    <select
      name={name}
      defaultValue={defaultValue || options[0]?.value}
      className={className}
      required={required}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function CounselorNativeSelect({
  value,
  onChange,
  disabled,
  className,
  includeUnassigned = true,
}: CounselorNativeSelectProps) {
  const options = useCounselorSelectOptions(value, { includeUnassigned });

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className={className}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
