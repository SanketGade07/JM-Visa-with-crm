"use client";

import React, { useMemo, useState } from "react";
import type { Lead, PaymentDetails } from "@/context/CrmContext";
import { FaEnvelope, FaFileInvoiceDollar } from "react-icons/fa";
import { FiFileText, FiGlobe } from "react-icons/fi";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { TableViewToggle } from "@/components/crm/ui/TableViewToggle";
import { DateRangeCalendarPopover } from "@/components/crm/ui/DateRangeCalendarPopover";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

const DESK_COUNTRIES = ["USA", "UK", "Canada", "Europe"] as const;

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

function paymentsInRange(
  payments: PaymentDetails[],
  startDate: string,
  endDate: string
): PaymentDetails[] {
  if (!isDateRangeActive(startDate, endDate)) return payments;
  return payments.filter((p) => isPaymentInRange(p, startDate, endDate));
}

type PaymentsView = "ledger" | "desk-revenue";

type DeskRevenueRow = {
  id: string;
  country: string;
  deskLabel: string;
  realizedRevenue: number;
  clientCount: number;
};

export function PaymentsTab() {
  const {
    leads,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    setIsAddPaymentOpen,
    setInvoiceLeadId,
    canManagePayments,
  } = useCrmLayoutContext();

  const [paymentsView, setPaymentsView] = useState<PaymentsView>("ledger");

  const dateFilterActive = isDateRangeActive(startDate, endDate);

  const ledgerRows = useMemo(() => {
    const active = leads.filter((l) => l.status !== "Dropped");
    if (!dateFilterActive) return active;
    return active.filter((l) =>
      l.payments.some((p) => isPaymentInRange(p, startDate, endDate))
    );
  }, [leads, startDate, endDate, dateFilterActive]);

  const financeMetrics = useMemo(() => {
    const activeLeads = leads.filter((l) => l.status !== "Dropped");

    const grossInvoiced = activeLeads.reduce(
      (acc, l) => acc + (l.payments[0]?.totalPackage || 0),
      0
    );

    const deposited = activeLeads.reduce(
      (acc, l) =>
        acc +
        paymentsInRange(l.payments, startDate, endDate).reduce(
          (a, p) => a + p.amountPaid,
          0
        ),
      0
    );

    const pending = activeLeads.reduce((acc, l) => {
      const total = l.payments[0]?.totalPackage || 0;
      const paid = paymentsInRange(l.payments, startDate, endDate).reduce(
        (a, p) => a + p.amountPaid,
        0
      );
      return acc + (total > 0 ? Math.max(0, total - paid) : 0);
    }, 0);

    return { grossInvoiced, deposited, pending };
  }, [leads, startDate, endDate]);

  const deskRevenueRows = useMemo<DeskRevenueRow[]>(
    () =>
      DESK_COUNTRIES.map((country) => {
        const cLeads = leads.filter(
          (l) => l.country === country && l.status !== "Dropped"
        );
        const relevantLeads = dateFilterActive
          ? cLeads.filter((l) =>
              l.payments.some((p) => isPaymentInRange(p, startDate, endDate))
            )
          : cLeads;
        const realizedRevenue = relevantLeads.reduce(
          (acc, l) =>
            acc +
            paymentsInRange(l.payments, startDate, endDate).reduce(
              (a, p) => a + p.amountPaid,
              0
            ),
          0
        );
        return {
          id: country,
          country,
          deskLabel: `${country} Desk`,
          realizedRevenue,
          clientCount: relevantLeads.length,
        };
      }),
    [leads, startDate, endDate, dateFilterActive]
  );

  const ledgerColumns = useMemo<Column<Lead>[]>(
    () => [
      {
        header: "Client Name",
        render: (lead) => (
          <span className="font-semibold text-gray-900 dark:text-slate-100 text-[13px]">
            {lead.name}
          </span>
        ),
      },
      {
        header: "Destination",
        render: (lead) => (
          <span className="text-gray-600 dark:text-slate-300">{lead.country}</span>
        ),
      },
      {
        header: "Invoiced Package",
        render: (lead) => {
          const total = lead.payments[0]?.totalPackage || 0;
          return (
            <span className="font-semibold text-gray-700 dark:text-slate-200">
              {total > 0 ? `₹${total.toLocaleString()}` : "Not Decided"}
            </span>
          );
        },
      },
      {
        header: "Realized Paid",
        render: (lead) => {
          const scoped = paymentsInRange(lead.payments, startDate, endDate);
          const paid = scoped.reduce((acc, pay) => acc + pay.amountPaid, 0);
          return (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              ₹{paid.toLocaleString()}
            </span>
          );
        },
      },
      {
        header: "Remaining Balance",
        render: (lead) => {
          const total = lead.payments[0]?.totalPackage || 0;
          const scoped = paymentsInRange(lead.payments, startDate, endDate);
          const paid = scoped.reduce((acc, pay) => acc + pay.amountPaid, 0);
          const balance = total > 0 ? Math.max(0, total - paid) : 0;
          return (
            <span
              className={`font-semibold ${
                balance > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              ₹{balance.toLocaleString()}
            </span>
          );
        },
      },
    ],
    [startDate, endDate]
  );

  const dateRangeCalendar = (
    <DateRangeCalendarPopover
      startDate={startDate}
      endDate={endDate}
      onStartChange={setStartDate}
      onEndChange={setEndDate}
      onClear={() => {
        setStartDate("");
        setEndDate("");
      }}
    />
  );

  const toolbarRight = (
    <button
      onClick={() => {
        if (!canManagePayments) return;
        setIsAddPaymentOpen(true);
      }}
      disabled={!canManagePayments}
      className="py-2 px-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[11px] rounded-full transition-all disabled:opacity-40"
    >
      Record Client Deposit
    </button>
  );

  const deskRevenueColumns = useMemo<Column<DeskRevenueRow>[]>(
    () => [
      {
        header: "Destination Desk",
        render: (row) => (
          <span className="font-semibold text-gray-900 dark:text-slate-100 text-[13px]">
            {row.deskLabel}
          </span>
        ),
      },
      {
        header: "Active Clients",
        render: (row) => (
          <span className="text-gray-600 dark:text-slate-300 tabular-nums">
            {row.clientCount}
          </span>
        ),
      },
      {
        header: "Realized Revenue",
        render: (row) => (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            ₹{row.realizedRevenue.toLocaleString()}
          </span>
        ),
      },
      {
        header: "Revenue Share",
        render: (row) => (
          <div className="w-full max-w-[200px] h-1.5 bg-gray-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (row.realizedRevenue / 100000) * 100)}%`,
              }}
            />
          </div>
        ),
      },
    ],
    []
  );

  const viewToggle = (
    <TableViewToggle
      value={paymentsView}
      onChange={setPaymentsView}
      options={[
        {
          id: "ledger",
          label: "Client Ledger",
          count: ledgerRows.length,
          icon: FiFileText,
        },
        {
          id: "desk-revenue",
          label: "Desks Revenue",
          count: deskRevenueRows.length,
          icon: FiGlobe,
        },
      ]}
    />
  );

  const summaryCards = [
    {
      label: "Gross Invoiced Revenue",
      value: financeMetrics.grossInvoiced,
      description: "Total value of all packaged contracts",
    },
    {
      label: "Deposited Payments",
      value: financeMetrics.deposited,
      description: "Total cash realized in bank",
    },
    {
      label: "Pending Receivables",
      value: financeMetrics.pending,
      description: "Outstanding credit from client packages",
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="p-6 rounded-2xl border bg-white dark:bg-slate-900/60 border-gray-200/70 dark:border-slate-800/80"
          >
            <p className="text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
              {card.label}
            </p>
            <p className="mt-2 text-xl font-extrabold text-gray-900 dark:text-white tabular-nums">
              ₹{card.value.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {paymentsView === "ledger" ? (
        <DataTable
          title="Clients Accounts Ledger"
          pagination={true}
          defaultPageSize={8}
          rows={ledgerRows}
          getRowId={(l) => l.id}
          filters={viewToggle}
          rightSlot={toolbarRight}
          toolbarEndSlot={dateRangeCalendar}
          columns={ledgerColumns}
          actions={(lead) => [
            {
              icon: FaFileInvoiceDollar,
              title: "View invoices",
              onClick: (l) => setInvoiceLeadId(l.id),
            },
            {
              icon: FaEnvelope,
              title: "Email",
              onClick: (l) => window.open(`mailto:${l.email}`),
            },
          ]}
          actionsHeader="Receipts"
          emptyText="No active client accounts."
        />
      ) : (
        <DataTable
          title="Destination Desk Revenue"
          pagination={true}
          defaultPageSize={8}
          rows={deskRevenueRows}
          getRowId={(row) => row.id}
          filters={viewToggle}
          rightSlot={toolbarRight}
          toolbarEndSlot={dateRangeCalendar}
          columns={deskRevenueColumns}
          showCheckbox={false}
          showIndex={false}
          emptyText="No desk revenue data available."
        />
      )}
    </div>
  );
}
