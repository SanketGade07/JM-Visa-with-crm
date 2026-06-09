"use client";

import React, { createContext, useContext } from "react";
import { useCrmLayoutState, type CrmLayoutState } from "../hooks/useCrmLayoutState";

const CrmLayoutContext = createContext<CrmLayoutState | null>(null);

export function CrmLayoutProvider({ children }: { children: React.ReactNode }) {
  const state = useCrmLayoutState();
  return (
    <CrmLayoutContext.Provider value={state}>{children}</CrmLayoutContext.Provider>
  );
}

export function useCrmLayoutContext(): CrmLayoutState {
  const ctx = useContext(CrmLayoutContext);
  if (!ctx) throw new Error("useCrmLayoutContext must be used within CrmLayoutProvider");
  return ctx;
}
