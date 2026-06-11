"use client";

import React, { useMemo, useState } from "react";
import type { Lead } from "@/context/CrmContext";
import { timeAgo } from "@/utils/leadHelpers";
import { getCountryFlag } from "@/components/CountryFlags";
import { FiSend, FiArchive, FiCheckCircle } from "react-icons/fi";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { TableViewToggle } from "@/components/crm/ui/TableViewToggle";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

type SubmissionView = "ready" | "dispatched";

function CountryCell({ country }: { country: string }) {
  return (
    <span className="inline-flex items-center gap-2 min-w-0 max-w-full">
      {getCountryFlag(country)}
      <span className="text-[13px] text-gray-700 dark:text-white truncate">{country}</span>
    </span>
  );
}

export function SubmissionsTab() {
  const { leads, updateLeadStatus, canSubmitVisa } = useCrmLayoutContext();

  const [submissionView, setSubmissionView] = useState<SubmissionView>("ready");
  const [countryFilter, setCountryFilter] = useState("All");
  const [countryFilterOpen, setCountryFilterOpen] = useState(false);

  const handleSubmissionViewChange = (view: SubmissionView) => {
    setSubmissionView(view);
    setCountryFilter("All");
    setCountryFilterOpen(false);
  };

  const readyLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          !l.isDeleted &&
          l.status === "Ready For Submission" &&
          (countryFilter === "All" || l.country === countryFilter)
      ),
    [leads, countryFilter]
  );

  const dispatchedLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          !l.isDeleted &&
          l.status === "Visa Submitted" &&
          (countryFilter === "All" || l.country === countryFilter)
      ),
    [leads, countryFilter]
  );

  const readyLeadsUnfiltered = useMemo(
    () =>
      leads.filter((l) => !l.isDeleted && l.status === "Ready For Submission"),
    [leads]
  );

  const dispatchedLeadsUnfiltered = useMemo(
    () => leads.filter((l) => !l.isDeleted && l.status === "Visa Submitted"),
    [leads]
  );

  const availableCountries = useMemo(() => {
    const source =
      submissionView === "ready" ? readyLeadsUnfiltered : dispatchedLeadsUnfiltered;
    const set = new Set(source.map((l) => l.country));
    return ["All", ...Array.from(set).sort()];
  }, [submissionView, readyLeadsUnfiltered, dispatchedLeadsUnfiltered]);

  const tableRows = submissionView === "ready" ? readyLeads : dispatchedLeads;

  const readyColumns = useMemo<Column<Lead>[]>(
    () => [
      {
        header: "Applicant",
        render: (lead) => (
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-gray-900 dark:text-white leading-snug truncate">
              {lead.name}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-slate-500 mt-0.5 truncate">
              {lead.visaType}
            </div>
          </div>
        ),
      },
      {
        header: "Visa Type",
        render: (lead) => (
          <span className="text-[13px] text-gray-700 dark:text-white truncate block">
            {lead.visaType}
          </span>
        ),
      },
      {
        header: "Assigned To",
        render: (lead) => (
          <span className="text-[13px] text-gray-700 dark:text-white truncate block">
            {lead.counselor}
          </span>
        ),
      },
      {
        header: "Country",
        render: (lead) => <CountryCell country={lead.country} />,
      },
      {
        header: "Action",
        align: "right",
        render: (lead) => (
          <button
            type="button"
            disabled={!canSubmitVisa}
            onClick={() => updateLeadStatus(lead.id, "Visa Submitted")}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed max-w-full"
          >
            <FiSend className="text-[12px] shrink-0" />
            <span className="truncate">Mark as Dispatched</span>
          </button>
        ),
      },
    ],
    [canSubmitVisa, updateLeadStatus]
  );

  const dispatchedColumns = useMemo<Column<Lead>[]>(
    () => [
      {
        header: "Applicant",
        render: (lead) => (
          <span className="text-[13px] font-semibold text-gray-900 dark:text-white truncate block">
            {lead.name}
          </span>
        ),
      },
      {
        header: "Visa Type",
        render: (lead) => (
          <span className="text-[13px] text-gray-700 dark:text-white truncate block">
            {lead.visaType}
          </span>
        ),
      },
      {
        header: "Dispatched",
        render: (lead) => (
          <span className="text-[12px] text-gray-600 dark:text-white truncate block">
            {timeAgo(lead.lastUpdated)}
          </span>
        ),
      },
      {
        header: "Assigned To",
        render: (lead) => (
          <span className="text-[13px] text-gray-700 dark:text-white truncate block">
            {lead.counselor}
          </span>
        ),
      },
      {
        header: "Country",
        render: (lead) => <CountryCell country={lead.country} />,
      },
      {
        header: "Status",
        render: () => (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-500 max-w-full">
            <FiCheckCircle className="text-[12px] shrink-0" />
            <span className="truncate">Consulate Approved</span>
          </span>
        ),
      },
      {
        header: "Action",
        align: "right",
        render: (lead) => (
          <button
            type="button"
            disabled={!canSubmitVisa}
            onClick={() => updateLeadStatus(lead.id, "Closed")}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed max-w-full"
          >
            <FiArchive className="text-[12px] shrink-0" />
            <span className="truncate">Close Case</span>
          </button>
        ),
      },
    ],
    [canSubmitVisa, updateLeadStatus]
  );

  const tableColumns = submissionView === "ready" ? readyColumns : dispatchedColumns;

  const cardMeta =
    submissionView === "ready"
      ? {
          title: "Applications Ready",
          subtitle: "Applications that are ready to be submitted to embassies.",
          emptyText: "No files ready for submission. Complete document verification first.",
        }
      : {
          title: "Dispatched to Embassy",
          subtitle: "Applications that have been dispatched to embassies.",
          emptyText: "No active submissions currently at the embassy.",
        };

  const viewToggle = (
    <TableViewToggle
      value={submissionView}
      onChange={handleSubmissionViewChange}
      options={[
        {
          id: "ready",
          label: "Ready",
          count: readyLeadsUnfiltered.length,
          icon: FiCheckCircle,
        },
        {
          id: "dispatched",
          label: "Dispatched",
          count: dispatchedLeadsUnfiltered.length,
          icon: FiSend,
        },
      ]}
    />
  );

  const countryChips = countryFilterOpen ? (
    <div className="px-5 py-2.5 border-b border-gray-200 dark:border-slate-800/60 flex flex-wrap gap-2">
      {availableCountries.map((country) => (
        <button
          key={country}
          type="button"
          onClick={() => setCountryFilter(country)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
            countryFilter === country
              ? "bg-blue-500/10 text-blue-600 border border-blue-500/30 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30"
              : "bg-gray-100 text-gray-500 border border-gray-200 hover:text-gray-700 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/60 dark:hover:text-slate-200"
          }`}
        >
          {country}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div className="min-w-0">
      <DataTable
        title={cardMeta.title}
        subtitle={cardMeta.subtitle}
        pagination={true}
        defaultPageSize={8}
        rows={tableRows}
        getRowId={(l) => l.id}
        filters={viewToggle}
        onFilter={() => setCountryFilterOpen((v) => !v)}
        filterActive={countryFilterOpen || countryFilter !== "All"}
        belowTitle={countryChips}
        columns={tableColumns}
        showCheckbox={false}
        showIndex={false}
        emptyText={cardMeta.emptyText}
      />
    </div>
  );
}
