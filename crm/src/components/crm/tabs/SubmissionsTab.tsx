"use client";

import React, { useMemo, useState } from "react";
import type { Lead } from "@/context/CrmContext";
import { timeAgo } from "@/utils/leadHelpers";
import { getCountryFlag } from "@/components/CountryFlags";
import {
  FiFilter,
  FiSend,
  FiEye,
  FiArchive,
  FiCheckCircle,
} from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

function CountryCell({ country }: { country: string }) {
  return (
    <span className="inline-flex items-center gap-2 min-w-0 max-w-full">
      {getCountryFlag(country)}
      <span className="text-[13px] text-gray-700 dark:text-white truncate">{country}</span>
    </span>
  );
}

function FilterButton({ active, onClick }: { active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
        active
          ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-400"
          : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 dark:border-slate-700/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600"
      }`}
      aria-label="Filter"
    >
      <FiFilter className="text-[14px]" />
    </button>
  );
}

function DeskFooter({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="border-t border-gray-200 dark:border-slate-800/80 px-5 py-3.5">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 text-[13px] font-medium text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
      >
        <FiEye className="text-[14px]" />
        {label}
      </button>
    </div>
  );
}

type DeskColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T, index: number) => React.ReactNode;
};

function SubmissionDeskTable<T>({
  columns,
  rows,
  emptyText,
  columnWidths,
}: {
  columns: DeskColumn<T>[];
  rows: T[];
  emptyText: string;
  columnWidths?: string[];
}) {
  return (
    <div className="w-full overflow-hidden">
      <table className="w-full table-fixed border-collapse">
        {columnWidths && (
          <colgroup>
            {columnWidths.map((width, i) => (
              <col key={i} style={{ width }} />
            ))}
          </colgroup>
        )}
        <thead>
          <tr className="border-b border-gray-200 dark:border-slate-800/80">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2.5 text-left text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-slate-800/50 dark:hover:bg-slate-800/20 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-2.5 align-middle max-w-0 ${col.className ?? ""}`}
                >
                  {col.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-[12px] text-gray-400 dark:text-slate-500">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SubmissionDeskCard({
  dotColor,
  title,
  subtitle,
  filterActive,
  onFilterToggle,
  children,
  footerLabel,
  onFooterClick,
}: {
  dotColor: "green" | "blue";
  title: string;
  subtitle: string;
  filterActive?: boolean;
  onFilterToggle: () => void;
  children: React.ReactNode;
  footerLabel: string;
  onFooterClick: () => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900/60 border border-gray-200/70 dark:border-slate-800/80 rounded-2xl flex flex-col overflow-hidden min-w-0 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)] dark:shadow-none">
      <div className="px-5 pt-5 pb-4 border-b border-gray-200 dark:border-slate-800/80">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  dotColor === "green" ? "bg-emerald-500" : "bg-sky-500"
                }`}
              />
              {title}
            </h3>
            <p className="text-[12px] text-gray-500 dark:text-slate-500 mt-1.5 leading-relaxed">{subtitle}</p>
          </div>
          <FilterButton active={filterActive} onClick={onFilterToggle} />
        </div>
      </div>

      <div className="flex-1">{children}</div>

      <DeskFooter label={footerLabel} onClick={onFooterClick} />
    </div>
  );
}

export function SubmissionsTab() {
  const {
    leads,
    updateLeadStatus,
    canSubmitVisa,
    setCurrentTab,
    setStatusFilter,
  } = useCrmLayoutContext();

  const [readyFilterOpen, setReadyFilterOpen] = useState(false);
  const [dispatchedFilterOpen, setDispatchedFilterOpen] = useState(false);
  const [readyCountryFilter, setReadyCountryFilter] = useState("All");
  const [dispatchedCountryFilter, setDispatchedCountryFilter] = useState("All");

  const readyLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          !l.isDeleted &&
          l.status === "Ready For Submission" &&
          (readyCountryFilter === "All" || l.country === readyCountryFilter)
      ),
    [leads, readyCountryFilter]
  );

  const dispatchedLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          !l.isDeleted &&
          l.status === "Visa Submitted" &&
          (dispatchedCountryFilter === "All" || l.country === dispatchedCountryFilter)
      ),
    [leads, dispatchedCountryFilter]
  );

  const readyCountries = useMemo(() => {
    const set = new Set(
      leads
        .filter((l) => !l.isDeleted && l.status === "Ready For Submission")
        .map((l) => l.country)
    );
    return ["All", ...Array.from(set).sort()];
  }, [leads]);

  const dispatchedCountries = useMemo(() => {
    const set = new Set(
      leads
        .filter((l) => !l.isDeleted && l.status === "Visa Submitted")
        .map((l) => l.country)
    );
    return ["All", ...Array.from(set).sort()];
  }, [leads]);

  const readyColumns: DeskColumn<Lead>[] = [
    {
      key: "index",
      header: "#",
      className: "w-10",
      render: (_, index) => (
        <span className="text-[12px] text-gray-400 dark:text-slate-500 tabular-nums">{index + 1}</span>
      ),
    },
    {
      key: "applicant",
      header: "Applicant",
      render: (lead) => (
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-gray-900 dark:text-white leading-snug truncate">{lead.name}</div>
          <div className="text-[11px] text-gray-500 dark:text-slate-500 mt-0.5 truncate">{lead.visaType}</div>
        </div>
      ),
    },
    {
      key: "visaType",
      header: "Visa Type",
      render: (lead) => (
        <span className="text-[13px] text-gray-700 dark:text-white truncate block">{lead.visaType}</span>
      ),
    },
    {
      key: "assigned",
      header: "Assigned To",
      render: (lead) => (
        <span className="text-[13px] text-gray-700 dark:text-white truncate block">{lead.counselor}</span>
      ),
    },
    {
      key: "country",
      header: "Country",
      render: (lead) => <CountryCell country={lead.country} />,
    },
    {
      key: "action",
      header: "Action",
      className: "text-right",
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
  ];

  const dispatchedColumns: DeskColumn<Lead>[] = [
    {
      key: "index",
      header: "#",
      className: "w-10",
      render: (_, index) => (
        <span className="text-[12px] text-gray-400 dark:text-slate-500 tabular-nums">{index + 1}</span>
      ),
    },
    {
      key: "applicant",
      header: "Applicant",
      render: (lead) => (
        <span className="text-[13px] font-semibold text-gray-900 dark:text-white truncate block">{lead.name}</span>
      ),
    },
    {
      key: "visaType",
      header: "Visa Type",
      render: (lead) => (
        <span className="text-[13px] text-gray-700 dark:text-white truncate block">{lead.visaType}</span>
      ),
    },
    {
      key: "dispatched",
      header: "Dispatched",
      render: (lead) => (
        <span className="text-[12px] text-gray-600 dark:text-white truncate block">{timeAgo(lead.lastUpdated)}</span>
      ),
    },
    {
      key: "assigned",
      header: "Assigned To",
      render: (lead) => (
        <span className="text-[13px] text-gray-700 dark:text-white truncate block">{lead.counselor}</span>
      ),
    },
    {
      key: "country",
      header: "Country",
      render: (lead) => <CountryCell country={lead.country} />,
    },
    {
      key: "status",
      header: "Status",
      render: () => (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-500 max-w-full">
          <FiCheckCircle className="text-[12px] shrink-0" />
          <span className="truncate">Consulate Approved</span>
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      className: "text-right",
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
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-w-0">
      <SubmissionDeskCard
        dotColor="green"
        title={`Applications Ready (${readyLeads.length})`}
        subtitle="Applications that are ready to be submitted to embassies."
        filterActive={readyFilterOpen}
        onFilterToggle={() => setReadyFilterOpen((v) => !v)}
        footerLabel="View All Ready Applications"
        onFooterClick={() => {
          setStatusFilter("Submitted");
          setCurrentTab("Leads");
        }}
      >
        {readyFilterOpen && (
          <div className="px-5 py-2.5 border-b border-gray-200 dark:border-slate-800/60 flex flex-wrap gap-2">
            {readyCountries.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => setReadyCountryFilter(country)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  readyCountryFilter === country
                    ? "bg-blue-500/10 text-blue-600 border border-blue-500/30 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30"
                    : "bg-gray-100 text-gray-500 border border-gray-200 hover:text-gray-700 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/60 dark:hover:text-slate-200"
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        )}
        <SubmissionDeskTable
          columns={readyColumns}
          rows={readyLeads}
          columnWidths={["4%", "22%", "16%", "16%", "18%", "24%"]}
          emptyText="No files ready for submission. Complete document verification first."
        />
      </SubmissionDeskCard>

      <SubmissionDeskCard
        dotColor="blue"
        title={`Dispatched to Embassy (${dispatchedLeads.length})`}
        subtitle="Applications that have been dispatched to embassies."
        filterActive={dispatchedFilterOpen}
        onFilterToggle={() => setDispatchedFilterOpen((v) => !v)}
        footerLabel="View All Dispatched Applications"
        onFooterClick={() => {
          setStatusFilter("Submitted");
          setCurrentTab("Leads");
        }}
      >
        {dispatchedFilterOpen && (
          <div className="px-5 py-2.5 border-b border-gray-200 dark:border-slate-800/60 flex flex-wrap gap-2">
            {dispatchedCountries.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => setDispatchedCountryFilter(country)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  dispatchedCountryFilter === country
                    ? "bg-blue-500/10 text-blue-600 border border-blue-500/30 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30"
                    : "bg-gray-100 text-gray-500 border border-gray-200 hover:text-gray-700 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/60 dark:hover:text-slate-200"
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        )}
        <SubmissionDeskTable
          columns={dispatchedColumns}
          rows={dispatchedLeads}
          columnWidths={["4%", "15%", "12%", "10%", "13%", "14%", "16%", "16%"]}
          emptyText="No active submissions currently at the embassy."
        />
      </SubmissionDeskCard>
    </div>
  );
}
