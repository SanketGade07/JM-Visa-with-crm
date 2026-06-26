"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useCreateLeadForm } from "@/hooks/useCreateLeadForm";
import { useCrmLayoutContext } from "./CrmLayoutContext";

type CreateLeadFormValue = ReturnType<typeof useCreateLeadForm>;

const CreateLeadFormContext = createContext<CreateLeadFormValue | null>(null);

/**
 * Holds the multi-step "Create Lead" wizard state ABOVE the tab views so it
 * survives unmounts. The wizard renders inside LeadsTab, which CrmTabViews
 * unmounts whenever the active sidebar tab changes — if the form state lived in
 * the wizard component, switching tabs (or collapsing the panel) would wipe it
 * and bounce the user back to step 1. Keeping it here preserves progress.
 *
 * A dedicated context (rather than the big layout context) is used on purpose:
 * the value changes on every keystroke, and `children` is passed through
 * untouched, so only the wizard re-renders while typing — not the whole app.
 */
export function CreateLeadFormProvider({ children }: { children: React.ReactNode }) {
  const form = useCreateLeadForm();
  const { createLeadSession } = useCrmLayoutContext();

  // Reset the wizard each time a fresh session is opened (the "Add Lead" button
  // bumps createLeadSession). This provider never unmounts on tab change, so a
  // plain tab switch leaves createLeadSession untouched and the data is kept.
  const formRef = useRef(form);
  formRef.current = form;
  useEffect(() => {
    formRef.current.reset();
  }, [createLeadSession]);

  return (
    <CreateLeadFormContext.Provider value={form}>
      {children}
    </CreateLeadFormContext.Provider>
  );
}

export function useCreateLeadFormContext(): CreateLeadFormValue {
  const ctx = useContext(CreateLeadFormContext);
  if (!ctx) {
    throw new Error(
      "useCreateLeadFormContext must be used within a CreateLeadFormProvider"
    );
  }
  return ctx;
}
