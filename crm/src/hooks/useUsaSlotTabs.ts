"use client";

import { useMemo } from "react";
import { useCrmLayoutContext } from "@/components/crm/context/CrmLayoutContext";
import { scopeLeadsForUser, getLeadCreatedTimestamp } from "@/utils/leadHelpers";

export function useUsaSlotTabs() {
  const { leads, currentUser, usaSlotView } = useCrmLayoutContext();

  const scopedLeads = useMemo(
    () => scopeLeadsForUser(leads, currentUser),
    [leads, currentUser]
  );

  const usaLeads = useMemo(
    () => scopedLeads.filter((l) => l.country === "USA" && l.status !== "DROPPED"),
    [scopedLeads]
  );

  const availableCount = useMemo(
    () => usaLeads.filter((l) => !l.usaSlots?.slotsPaid).length,
    [usaLeads]
  );

  const paidCount = useMemo(
    () => usaLeads.filter((l) => l.usaSlots?.slotsPaid === true).length,
    [usaLeads]
  );

  const filteredUsaLeads = useMemo(() => {
    const list =
      usaSlotView === "paid"
        ? usaLeads.filter((l) => l.usaSlots?.slotsPaid === true)
        : usaLeads.filter((l) => !l.usaSlots?.slotsPaid);
    
    return [...list].sort((a, b) => getLeadCreatedTimestamp(b) - getLeadCreatedTimestamp(a));
  }, [usaLeads, usaSlotView]);

  const usaSlotTabs = useMemo(
    () => [
      { id: "available", label: "Available", count: availableCount },
      { id: "paid", label: "Paid", count: paidCount },
    ],
    [availableCount, paidCount]
  );

  return { usaLeads, availableCount, paidCount, filteredUsaLeads, usaSlotTabs };
}
