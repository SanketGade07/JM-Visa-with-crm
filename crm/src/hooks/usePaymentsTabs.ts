"use client";

import { useMemo } from "react";
import type { PaymentDetails } from "@/context/CrmContext";
import { useCrmLayoutContext } from "@/components/crm/context/CrmLayoutContext";
import { getDeskCountriesFromLeads, scopeLeadsForUser } from "@/utils/leadHelpers";

function isDateRangeActive(startDate: string, endDate: string): boolean {
  return !!(startDate && endDate);
}

function isPaymentInRange(
  payment: PaymentDetails,
  startDate: string,
  endDate: string
): boolean {
  return payment.date >= startDate && payment.date <= endDate;
}

export function usePaymentsTabs() {
  const { leads, currentUser, startDate, endDate, paymentsView } =
    useCrmLayoutContext();

  const counselorScopedLeads = useMemo(
    () => scopeLeadsForUser(leads, currentUser),
    [leads, currentUser]
  );

  const dateFilterActive = isDateRangeActive(startDate, endDate);

  const ledgerCount = useMemo(() => {
    const active = counselorScopedLeads.filter((l) => l.status !== "DROPPED");
    if (!dateFilterActive) return active.length;
    return active.filter((l) =>
      l.payments.some((p) => isPaymentInRange(p, startDate, endDate))
    ).length;
  }, [counselorScopedLeads, startDate, endDate, dateFilterActive]);

  const deskRevenueCount = useMemo(
    () => getDeskCountriesFromLeads(counselorScopedLeads).length,
    [counselorScopedLeads]
  );

  const paymentsTabs = useMemo(
    () => [
      { id: "ledger", label: "Client Ledger", count: ledgerCount },
      { id: "desk-revenue", label: "Desks Revenue", count: deskRevenueCount },
    ],
    [ledgerCount, deskRevenueCount]
  );

  return { ledgerCount, deskRevenueCount, paymentsTabs, paymentsView };
}
