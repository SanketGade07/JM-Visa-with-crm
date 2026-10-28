"use client";

import { useMemo } from "react";
import { useCrmLayoutContext } from "@/components/crm/context/CrmLayoutContext";
import { scopeLeadsForUser, getLeadCreatedTimestamp } from "@/utils/leadHelpers";
import { isUsaCountry } from "@/utils/countryUtils";

export function useUsaSlotTabs() {
  const { leads, currentUser, usaSlotView } = useCrmLayoutContext();

  const scopedLeads = useMemo(
    () => scopeLeadsForUser(leads, currentUser),
    [leads, currentUser]
  );

  const usaLeads = useMemo(
    () => scopedLeads.filter((l) => isUsaCountry(l.country) && l.status !== "DROPPED"),
    [scopedLeads]
  );

  const bookedCount = useMemo(
    () => usaLeads.filter((l) => l.usaSlots?.slotsBooked === true).length,
    [usaLeads]
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
    let list: typeof usaLeads;
    if (usaSlotView === "booked") {
      list = usaLeads.filter((l) => l.usaSlots?.slotsBooked === true);
    } else if (usaSlotView === "paid") {
      list = usaLeads.filter((l) => l.usaSlots?.slotsPaid === true);
    } else {
      list = usaLeads.filter((l) => !l.usaSlots?.slotsPaid);
    }
    
    return [...list].sort((a, b) => getLeadCreatedTimestamp(b) - getLeadCreatedTimestamp(a));
  }, [usaLeads, usaSlotView]);

  const usaSlotTabs = useMemo(
    () => [
      { id: "available", label: "Available", count: availableCount },
      { id: "paid", label: "Paid", count: paidCount },
      { id: "booked", label: "Booked", count: bookedCount },
    ],
    [availableCount, paidCount, bookedCount]
  );

  return { usaLeads, availableCount, paidCount, bookedCount, filteredUsaLeads, usaSlotTabs };
}
