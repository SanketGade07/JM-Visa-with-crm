"use client";

import React from "react";

type StepHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function StepHeader({ title, subtitle, className = "" }: StepHeaderProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h4>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
