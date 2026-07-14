"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Lead, PaymentDetails } from "@/context/CrmContext";
import { FaEnvelope, FaFileInvoiceDollar, FaTag } from "react-icons/fa";

import DataTable, { type Column, exportRowsToCsv } from "@/components/ui/DataTable";
import { TableViewToggle } from "@/components/crm/ui/TableViewToggle";
import { UpdatePackageModal } from "@/components/crm/modals/UpdatePackageModal";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { getDeskCountriesFromLeads, scopeLeadsForUser, sortLeadsByRecency } from "@/utils/leadHelpers";
import { getCountryDisplayName } from "@/utils/countryUtils";
import { getDepositPickerLeads, getLeadPaymentSummary } from "@/utils/leadPaymentUtils";
import { useColumnSearch } from "@/hooks/useColumnSearch";
import { applyColumnSearch } from "@/utils/columnSearch";

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

function isLeadPaid(lead: Lead): boolean {
  const { totalPackage, pending } = getLeadPaymentSummary(lead);
  return totalPackage > 0 && pending <= 0;
}

function isLeadUnpaid(lead: Lead): boolean {
  const { totalPackage, pending } = getLeadPaymentSummary(lead);
  return totalPackage > 0 && pending > 0;
}

type LedgerPaymentFilter = "all" | "paid" | "unpaid";

type DeskRevenueRow = {
  id: string;
  country: string;
  realizedRevenue: number;
  clientCount: number;
};

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PaymentsTab() {
  const {
    leads,
    currentUser,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    paymentsCountryFilter,
    setPaymentsCountryFilter,
    openPickerDepositModal,
    setInvoiceLeadId,
    setLeadPackage,
    canManagePayments,
    showToast,
    openLeadDetail,
    paymentsView,
    canModifyLeads,
    deleteLeads,
    showConfirm,
    showAlert,
    isAdmin,
    registerPaymentsExport,
    theme,
  } = useCrmLayoutContext();

  const columnSearch = useColumnSearch();
  const [ledgerPaymentFilter, setLedgerPaymentFilter] =
    useState<LedgerPaymentFilter>("all");
  const [packageLeadId, setPackageLeadId] = useState<string | null>(null);

  useEffect(() => {
    if (paymentsView === "desk-revenue") {
      setLedgerPaymentFilter("all");
    }
  }, [paymentsView]);

  const counselorScopedLeads = useMemo(
    () => scopeLeadsForUser(leads, currentUser),
    [leads, currentUser]
  );

  const availableCountries = useMemo(() => {
    return getDeskCountriesFromLeads(counselorScopedLeads);
  }, [counselorScopedLeads]);

  const packageLead = useMemo(
    () =>
      packageLeadId
        ? counselorScopedLeads.find((l) => l.id === packageLeadId) ?? null
        : null,
    [counselorScopedLeads, packageLeadId]
  );

  const dateFilterActive = isDateRangeActive(startDate, endDate);

  const ledgerRows = useMemo(() => {
    let active = counselorScopedLeads.filter((l) => l.status !== "DROPPED");
    if (paymentsCountryFilter !== "All") {
      active = active.filter((l) => l.country === paymentsCountryFilter);
    }
    if (!dateFilterActive) return active;
    return active.filter((l) =>
      l.payments.some((p) => isPaymentInRange(p, startDate, endDate))
    );
  }, [counselorScopedLeads, startDate, endDate, dateFilterActive, paymentsCountryFilter]);

  const allCount = useMemo(() => ledgerRows.length, [ledgerRows]);

  const paidCount = useMemo(
    () => ledgerRows.filter(isLeadPaid).length,
    [ledgerRows]
  );

  const unpaidCount = useMemo(
    () => ledgerRows.filter(isLeadUnpaid).length,
    [ledgerRows]
  );

  const ledgerFilteredRows = useMemo(() => {
    if (ledgerPaymentFilter === "paid") {
      return ledgerRows.filter(isLeadPaid);
    }
    if (ledgerPaymentFilter === "unpaid") {
      return ledgerRows.filter(isLeadUnpaid);
    }
    return ledgerRows;
  }, [ledgerRows, ledgerPaymentFilter]);

  const clientSearchGetter = useMemo(
    () => (lead: Lead) =>
      [lead.name, lead.country, lead.email].filter(Boolean).join(" "),
    []
  );

  const deskSearchGetter = useMemo(
    () => (row: DeskRevenueRow) => row.country,
    []
  );

  const ledgerTableRows = useMemo(
    () => {
      const searched = applyColumnSearch(
        ledgerFilteredRows,
        [{ searchKey: "client", getSearchValue: clientSearchGetter }],
        columnSearch.debouncedFilters
      );
      return sortLeadsByRecency(searched);
    },
    [ledgerFilteredRows, clientSearchGetter, columnSearch.debouncedFilters]
  );

  const financeMetrics = useMemo(() => {
    let filteredLeads = counselorScopedLeads.filter((l) => l.status !== "DROPPED");

    if (paymentsCountryFilter !== "All") {
      filteredLeads = filteredLeads.filter((l) => l.country === paymentsCountryFilter);
    }

    if (dateFilterActive) {
      filteredLeads = filteredLeads.filter((l) =>
        l.payments.some((p) => isPaymentInRange(p, startDate, endDate))
      );
    }

    const grossInvoiced = filteredLeads.reduce(
      (acc, l) => acc + (l.payments[0]?.totalPackage || 0),
      0
    );

    const deposited = filteredLeads.reduce(
      (acc, l) =>
        acc +
        paymentsInRange(l.payments, startDate, endDate).reduce(
          (a, p) => a + p.amountPaid,
          0
        ),
      0
    );

    const pending = filteredLeads.reduce((acc, l) => {
      const total = l.payments[0]?.totalPackage || 0;
      const paid = paymentsInRange(l.payments, startDate, endDate).reduce(
        (a, p) => a + p.amountPaid,
        0
      );
      return acc + (total > 0 ? Math.max(0, total - paid) : 0);
    }, 0);

    return { grossInvoiced, deposited, pending };
  }, [counselorScopedLeads, paymentsCountryFilter, startDate, endDate, dateFilterActive]);

  const deskRevenueRows = useMemo<DeskRevenueRow[]>(
    () =>
      getDeskCountriesFromLeads(counselorScopedLeads).map((country) => {
        const cLeads = counselorScopedLeads.filter(
          (l) => l.country === country && l.status !== "DROPPED"
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
          realizedRevenue,
          clientCount: relevantLeads.length,
        };
      }),
    [counselorScopedLeads, startDate, endDate, dateFilterActive]
  );

  const filteredDeskRevenueRows = useMemo(() => {
    if (paymentsCountryFilter === "All") return deskRevenueRows;
    return deskRevenueRows.filter((row) => row.country === paymentsCountryFilter);
  }, [deskRevenueRows, paymentsCountryFilter]);

  const deskTableRows = useMemo(
    () =>
      applyColumnSearch(
        filteredDeskRevenueRows,
        [{ searchKey: "desk", getSearchValue: deskSearchGetter }],
        columnSearch.debouncedFilters
      ),
    [filteredDeskRevenueRows, deskSearchGetter, columnSearch.debouncedFilters]
  );

  const totalDeskRevenue = useMemo(
    () => filteredDeskRevenueRows.reduce((sum, row) => sum + row.realizedRevenue, 0),
    [filteredDeskRevenueRows]
  );

  useEffect(() => {
    registerPaymentsExport(() => {
      if (paymentsView === "ledger") {
        exportRowsToCsv(
          "payments-ledger",
          ["Client Name", "Destination", "Service Charges", "Realized Paid", "Remaining Balance", "Payment Status"],
          ledgerRows.map((l) => {
            const total = l.payments[0]?.totalPackage || 0;
            const scoped = paymentsInRange(l.payments, startDate, endDate);
            const paid = scoped.reduce((acc, pay) => acc + pay.amountPaid, 0);
            const balance = total > 0 ? Math.max(0, total - paid) : 0;
            const status = isLeadPaid(l) ? "Paid" : "Unpaid";
            return [
              l.name,
              getCountryDisplayName(l.country),
              total > 0 ? total : "",
              paid,
              balance,
              status,
            ];
          })
        );
      } else {
        exportRowsToCsv(
          "payments-desk-revenue",
          ["Destination Desk", "Active Clients", "Realized Revenue", "Revenue Share"],
          filteredDeskRevenueRows.map((row) => {
            const sharePct = totalDeskRevenue > 0 ? (row.realizedRevenue / totalDeskRevenue) * 100 : 0;
            return [
              row.country,
              row.clientCount,
              row.realizedRevenue,
              `${sharePct.toFixed(1)}%`,
            ];
          })
        );
      }
    });
    return () => registerPaymentsExport(null);
  }, [
    registerPaymentsExport,
    paymentsView,
    ledgerRows,
    filteredDeskRevenueRows,
    startDate,
    endDate,
    totalDeskRevenue,
  ]);

  const ledgerColumns = useMemo<Column<Lead>[]>(
    () => [
      {
        header: "Client Name",
        searchKey: "client",
        searchLabel: "Client",
        getSearchValue: clientSearchGetter,
        render: (lead) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLeadDetail(lead.id);
            }}
            className="font-semibold text-gray-900 dark:text-slate-100 text-[13px] text-left hover:text-violet-600 dark:hover:text-violet-400 hover:underline cursor-pointer transition-colors"
          >
            {lead.name}
          </button>
        ),
      },
      {
        header: "Destination",
        render: (lead) => {
          const displayCountry = getCountryDisplayName(lead.country);
          return (
            <span
              className="text-gray-600 dark:text-slate-300 text-[13px] block truncate max-w-[130px]"
              title={displayCountry}
            >
              {displayCountry}
            </span>
          );
        },
      },
      {
        header: "Service Charges",
        render: (lead) => {
          const total = lead.payments[0]?.totalPackage || 0;
          return (
            <button
              type="button"
              disabled={!canManagePayments}
              onClick={(event) => {
                event.stopPropagation();
                if (!canManagePayments) return;
                setPackageLeadId(lead.id);
              }}
              className={`font-semibold text-left transition-colors ${
                canManagePayments
                  ? "text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  : "text-gray-700 dark:text-slate-200 cursor-default"
              }`}
              title={canManagePayments ? "Set or update package" : undefined}
            >
              {total > 0 ? `₹${total.toLocaleString()}` : "Not Decided"}
            </button>
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
    [startDate, endDate, canManagePayments, openLeadDetail, clientSearchGetter]
  );

  const showRecordButton = paymentsView === "ledger" && ledgerPaymentFilter !== "paid";

  const toolbarRight = showRecordButton ? (
    <button
      onClick={() => {
        if (!canManagePayments) return;
        if (getDepositPickerLeads(counselorScopedLeads).length === 0) {
          showToast("No active clients to record a deposit", "error");
          return;
        }
        openPickerDepositModal();
      }}
      disabled={!canManagePayments}
      className="py-2 px-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[11px] rounded-full transition-all disabled:opacity-40"
    >
      Record Client Deposit
    </button>
  ) : null;

  const paidUnpaidToggle = (
    <TableViewToggle
      value={ledgerPaymentFilter}
      onChange={setLedgerPaymentFilter}
      options={[
        { id: "all", label: "All", count: allCount },
        { id: "paid", label: "Paid", count: paidCount },
        { id: "unpaid", label: "Unpaid", count: unpaidCount },
      ]}
    />
  );

  const deskRevenueColumns = useMemo<Column<DeskRevenueRow>[]>(
    () => [
      {
        header: "Destination Desk",
        searchKey: "desk",
        searchLabel: "Desk",
        getSearchValue: deskSearchGetter,
        render: (row) => (
          <span className="font-semibold text-gray-900 dark:text-slate-100 text-[13px]">
            {row.country}
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
        render: (row) => {
          const sharePct =
            totalDeskRevenue > 0
              ? (row.realizedRevenue / totalDeskRevenue) * 100
              : 0;
          return (
            <span className="text-gray-600 dark:text-slate-300 font-medium tabular-nums">
              {sharePct.toFixed(1)}%
            </span>
          );
        },
      },
    ],
    [totalDeskRevenue, deskSearchGetter]
  );

  const summaryCards = [
    {
      label: "Payment Received",
      value: financeMetrics.deposited,
      description: "Collected cash realized in bank",
    },
    {
      label: "Payment Pending",
      value: financeMetrics.pending,
      description: "Remaining balance to be collected",
    },
    {
      label: "Total Invoiced",
      value: financeMetrics.grossInvoiced,
      description: "Total value of all client packages",
    },
  ];

  return (
    <div className="-m-4 md:-m-8 pt-0 pl-0 pr-0 pb-4 md:pt-0 md:pl-0 md:pr-0 md:pb-6 bg-gray-50 dark:bg-transparent min-h-[calc(100vh-4rem)] space-y-5">
      <div className="min-w-0 space-y-6">

        {/* ── Summary cards row ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8 pt-4 md:pt-6">
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
            borderless={true}
            className="payments-ledger-table overflow-visible"
            pagination={true}
            defaultPageSize={10}
            rows={ledgerTableRows}
            getRowId={(l) => l.id}
            filters={paidUnpaidToggle}
            columnSearch={columnSearch}
            rightSlot={toolbarRight}
            columns={ledgerColumns}
            onBulkDelete={
              isAdmin
                ? (ids) => {
                    showConfirm(
                      "Delete Multiple Leads",
                      `Are you sure you want to permanently delete the ${ids.length} selected lead(s) from the database? This action cannot be undone.`,
                      async () => {
                        const ok = await deleteLeads(ids);
                        if (ok) {
                          showAlert("Delete Success", `${ids.length} lead(s) have been permanently deleted from the database.`);
                        } else {
                          showAlert("Delete Failed", "Failed to delete the selected leads.");
                        }
                      }
                    );
                  }
                : undefined
            }
            actions={(lead) => [
              {
                icon: FaTag,
                title: "Edit package",
                hidden: () => !canManagePayments,
                onClick: (l) => setPackageLeadId(l.id),
              },
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
            actionsHeader="Actions"
            emptyText="No active client accounts."
          />
        ) : (
          <DataTable
            borderless={true}
            className="payments-desk-table overflow-visible"
            pagination={true}
            defaultPageSize={10}
            showToolbar={false}
            rows={deskTableRows}
            getRowId={(row) => row.id}
            columnSearch={columnSearch}
            columns={deskRevenueColumns}
            showCheckbox={false}
            showIndex={true}
            emptyText="No desk revenue data available."
          />
        )}
        {packageLead ? (
          <UpdatePackageModal
            lead={packageLead}
            onClose={() => setPackageLeadId(null)}
            onSave={setLeadPackage}
            showToast={showToast}
          />
        ) : null}
      </div>
    </div>
  );
}
