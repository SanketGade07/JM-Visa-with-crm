"use client";

import React from "react";

type FormSectionProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
};

export function FormSection({
  label,
  children,
  className = "",
  htmlFor,
  error,
  required,
}: FormSectionProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-slate-500 dark:text-slate-400 font-bold block"
      >
        {label}
        {required && <span className="text-rose-500 font-extrabold ml-1">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-red-500 dark:text-red-400 text-[10px] font-medium">{error}</p>
      ) : null}
    </div>
  );
}

type FormSectionGridProps = {
  children: React.ReactNode;
  className?: string;
};

export function FormSectionGrid({ children, className = "" }: FormSectionGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      {children}
    </div>
  );
}

/** Shared 40px field shell — matches PhoneInput and SearchableCountrySelect height. */
export const FORM_FIELD_CLASS =
  "w-full h-10 box-border bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/40";

export const FORM_INPUT_CLASS = FORM_FIELD_CLASS;

export const FORM_FIELD_ERROR_CLASS =
  "border-red-500 dark:border-red-500 focus:ring-red-500/40";

export const FORM_SELECT_CLASS = `${FORM_FIELD_CLASS} cursor-pointer`;

export const FORM_TEXTAREA_CLASS =
  "w-full min-h-[2.5rem] box-border bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500/40";
