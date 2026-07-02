"use client";

import React from "react";
import { FaCheck } from "react-icons/fa";

export const WIZARD_STEPS = [
  { id: 1, label: "Service Selection", shortLabel: "Service" },
  { id: 2, label: "Client Information", shortLabel: "Client" },
  { id: 3, label: "Passport Details", shortLabel: "Passport" },
  { id: 4, label: "Application Credentials", shortLabel: "Credentials" },
  { id: 5, label: "Case Information", shortLabel: "Case Info" },
  { id: 6, label: "Review & Submit", shortLabel: "Review" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

type WizardProgressProps = {
  currentStep: WizardStepId;
  onStepClick?: (step: WizardStepId) => void;
  allowFullNavigation?: boolean;
  completedSteps?: ReadonlySet<WizardStepId>;
  activeStepIds?: WizardStepId[];
  className?: string;
};

function getStepState(
  stepId: WizardStepId,
  currentStep: WizardStepId,
  allowFullNavigation: boolean,
  completedSteps: ReadonlySet<WizardStepId>
) {
  const isComplete =
    stepId !== currentStep &&
    stepId !== 6 &&
    (completedSteps.has(stepId) || (!allowFullNavigation && stepId < currentStep));

  return {
    isComplete,
    isCurrent: stepId === currentStep,
    isFuture: !allowFullNavigation && stepId > currentStep,
  };
}

export function WizardProgress({
  currentStep,
  onStepClick,
  allowFullNavigation = false,
  completedSteps = new Set(),
  activeStepIds = [1, 2, 4, 5, 6],
  className = "",
}: WizardProgressProps) {
  const handleStepClick = (stepId: WizardStepId) => {
    if (stepId === currentStep || !onStepClick) return;

    if (allowFullNavigation) {
      onStepClick(stepId);
      return;
    }

    if (stepId >= currentStep) return;
    onStepClick(stepId);
  };

  const renderedSteps = WIZARD_STEPS.filter((step) => activeStepIds.includes(step.id));
  const currentStepIndex = activeStepIds.indexOf(currentStep);
  const currentStepDisplayNumber = currentStepIndex !== -1 ? currentStepIndex + 1 : 1;

  return (
    <div className={className}>
      {/* Desktop: horizontal stepper */}
      <ol className="hidden sm:flex items-center w-full">
        {renderedSteps.map((step, index) => {
          const { isComplete, isCurrent } = getStepState(
            step.id,
            currentStep,
            allowFullNavigation,
            completedSteps
          );
          const isClickable =
            step.id !== currentStep &&
            Boolean(onStepClick) &&
            (allowFullNavigation || step.id < currentStep);
          const isLast = index === renderedSteps.length - 1;

          const circleClassName = `flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-colors ${
            isComplete
              ? "bg-violet-600 text-[#ffffff] dark:text-white group-hover:bg-violet-700"
              : isCurrent
                ? "bg-violet-600/15 text-violet-700 dark:text-violet-400 ring-2 ring-violet-600/40"
                : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-500"
          }`;

          const labelClassName = `mt-1.5 text-[10px] font-bold text-center leading-tight max-w-[5.5rem] transition-colors ${
            isCurrent
              ? "text-violet-700 dark:text-violet-400"
              : isComplete
                ? "text-slate-700 dark:text-slate-300 group-hover:text-violet-700 dark:group-hover:text-violet-400"
                : "text-slate-500 dark:text-slate-500"
          }`;

          const stepContent = (
            <>
              <div className={circleClassName}>
                {isComplete ? <FaCheck className="text-[10px]" /> : index + 1}
              </div>
              <span className={labelClassName}>{step.label}</span>
            </>
          );

          return (
            <li
              key={step.id}
              className={`flex items-center ${isLast ? "flex-none" : "flex-1"}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className="group flex flex-col items-center min-w-0 cursor-pointer rounded-lg px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0a0a1a]"
                  aria-label={`Edit step ${step.id}: ${step.label}`}
                >
                  {stepContent}
                </button>
              ) : (
                <div
                  className={`flex flex-col items-center min-w-0 ${
                    isCurrent ? "cursor-default" : "cursor-not-allowed"
                  }`}
                  aria-disabled={!isCurrent}
                >
                  {stepContent}
                </div>
              )}
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
                    isComplete ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact progress */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-white">
            Step {currentStepDisplayNumber} of {activeStepIds.length}
          </span>
          <span className="text-slate-700 dark:text-slate-400 font-semibold">
            {WIZARD_STEPS.find((s) => s.id === currentStep)?.label}
          </span>
        </div>
        <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentStepDisplayNumber / activeStepIds.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between gap-1">
          {renderedSteps.map((step, index) => {
            const { isComplete, isCurrent } = getStepState(
              step.id,
              currentStep,
              allowFullNavigation,
              completedSteps
            );
            const isClickable =
              step.id !== currentStep &&
              Boolean(onStepClick) &&
              (allowFullNavigation || step.id < currentStep);

            const labelClassName = `flex-1 text-center text-[9px] font-bold truncate transition-colors ${
              isCurrent
                ? "text-violet-700 dark:text-violet-400 cursor-default"
                : isClickable
                  ? "text-slate-600 dark:text-slate-400 cursor-pointer hover:text-violet-700 dark:hover:text-violet-400"
                  : isComplete
                    ? "text-slate-600 dark:text-slate-400"
                    : "text-slate-500 dark:text-slate-600 cursor-not-allowed"
            }`;

            if (isClickable) {
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className={`${labelClassName} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 rounded dark:focus-visible:ring-offset-[#0a0a1a]`}
                  aria-label={`Edit step ${step.id}: ${step.label}`}
                >
                  {step.shortLabel}
                </button>
              );
            }

            return (
              <div key={step.id} className={labelClassName} aria-disabled={!isCurrent}>
                {step.shortLabel}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
