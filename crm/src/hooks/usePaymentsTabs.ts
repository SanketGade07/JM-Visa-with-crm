"use client";

import { useMemo } from "react";
import type { PaymentDetails } from "@/context/CrmContext";
import { useCrmLayoutContext } from "@/components/crm/context/CrmLayoutContext";
import { getDeskCountriesFromLeads } from "@/utils/leadHelpers";

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
  const { leads, startDate, endDate, paymentsView } = useCrmLayoutContext();

  const dateFilterActive = isDateRangeActive(startDate, endDate);

  const ledgerCount = useMemo(() => {
    const active = leads.filter((l) => l.status !== "DROPPED");
    if (!dateFilterActive) return active.length;
    return active.filter((l) =>
      l.payments.some((p) => isPaymentInRange(p, startDate, endDate))
    ).length;
  }, [leads, startDate, endDate, dateFilterActive]);

  const deskRevenueCount = useMemo(
    () => getDeskCountriesFromLeads(leads).length,
    [leads]
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
