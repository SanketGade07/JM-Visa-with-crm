"use client";

import { useMemo } from "react";
import { useCrmLayoutContext } from "@/components/crm/context/CrmLayoutContext";
import { scopeLeadsForUser } from "@/utils/leadHelpers";
import {
  QUICK_TAB_FILTERS,
  filterScopedLeads,
  matchesQuickTab,
} from "@/utils/leadQuickFilters";

export function useLeadQuickStatusTabs() {
  const { leads, kpiFilter, countryFilter, searchTerm, currentUser } = useCrmLayoutContext();

  const counselorScopedLeads = useMemo(
    () => scopeLeadsForUser(leads, currentUser),
    [leads, currentUser]
  );

  const scopedLeads = useMemo(
    () => filterScopedLeads(counselorScopedLeads, kpiFilter, countryFilter, searchTerm),
    [counselorScopedLeads, kpiFilter, countryFilter, searchTerm]
  );

  const quickStatusTabs = useMemo(
    () =>
      QUICK_TAB_FILTERS.map((tab) => ({
        id: tab.id,
        label: tab.label,
        count: scopedLeads.filter((l) => matchesQuickTab(l, tab.id)).length,
      })),
    [scopedLeads]
  );

  return { quickStatusTabs, scopedLeads };
}
