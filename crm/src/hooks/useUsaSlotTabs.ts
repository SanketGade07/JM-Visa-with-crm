"use client";

import { useMemo } from "react";
import { useCrmLayoutContext } from "@/components/crm/context/CrmLayoutContext";

export function useUsaSlotTabs() {
  const { leads, usaSlotView } = useCrmLayoutContext();

  const usaLeads = useMemo(
    () => leads.filter((l) => l.country === "USA" && l.status !== "DROPPED"),
    [leads]
  );

  const availableCount = useMemo(
    () => usaLeads.filter((l) => !l.usaSlots?.slotsPaid).length,
    [usaLeads]
  );

  const paidCount = useMemo(
    () => usaLeads.filter((l) => l.usaSlots?.slotsPaid === true).length,
    [usaLeads]
  );

  const filteredUsaLeads = useMemo(
    () =>
      usaSlotView === "paid"
        ? usaLeads.filter((l) => l.usaSlots?.slotsPaid === true)
        : usaLeads.filter((l) => !l.usaSlots?.slotsPaid),
    [usaLeads, usaSlotView]
  );

  const usaSlotTabs = useMemo(
    () => [
      { id: "available", label: "Available", count: availableCount },
      { id: "paid", label: "Paid", count: paidCount },
    ],
    [availableCount, paidCount]
  );

  return { usaLeads, availableCount, paidCount, filteredUsaLeads, usaSlotTabs };
}
