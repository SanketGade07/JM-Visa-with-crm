"use client";

import React, { useEffect, useMemo } from "react";
import type { Lead } from "@/context/CrmContext";
import { scopeLeadsForUser, timeAgo } from "@/utils/leadHelpers";
import { getCountryFlag } from "@/components/CountryFlags";
import { FiSend, FiCheckCircle, FiXCircle, FiRefreshCw } from "react-icons/fi";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { useColumnSearch } from "@/hooks/useColumnSearch";
import { applyColumnSearch } from "@/utils/columnSearch";
import {
  getCountryFilterOptions,
  getCounselorFilterOptions,
  getVisaServiceFilterOptions,
} from "@/utils/leadFilterOptions";
import { getCountryDisplayName } from "@/utils/countryUtils";

function CountryCell({ country }: { country: string }) {
  const displayCountry = getCountryDisplayName(country);
  return (
    <span
      className="inline-flex items-center gap-2 min-w-0 max-w-[140px]"
      title={displayCountry}
    >
      {getCountryFlag(country)}
      <span className="text-[13px] text-gray-700 dark:text-white truncate">{displayCountry}</span>
    </span>
  );
}

const leadNameLinkClass =
  "font-bold text-gray-900 dark:text-slate-100 text-[13px] truncate text-left hover:text-violet-600 dark:hover:text-violet-400 hover:underline cursor-pointer transition-colors";

export function SubmissionsTab() {
  const {
    leads,
    users,
    currentUser,
    updateLeadStatus,
    canSubmitVisa,
    openLeadDetail,
    submissionView,
  } = useCrmLayoutContext();

  const columnSearch = useColumnSearch();
  const { clearFilter, setActiveColumn, activeColumn } = columnSearch;
  const isCounselorView = currentUser?.role === "COUNSELOR";

  useEffect(() => {
    if (!isCounselorView) return;
    clearFilter("counselor");
    if (activeColumn === "counselor") {
      setActiveColumn(null);
    }
  }, [isCounselorView, clearFilter, setActiveColumn, activeColumn]);

  const leadSearchGetters = useMemo(
    () => ({
      lead: (lead: Lead) =>
        [lead.name, lead.phone, lead.email, lead.country]
          .filter(Boolean)
          .join(" "),
      service: (lead: Lead) => lead.visaType,
      country: (lead: Lead) => lead.country,
      counselor: (lead: Lead) => lead.counselor,
    }),
    []
  );

  const leadSearchColumns = useMemo(
    () => [
      { searchKey: "lead", getSearchValue: leadSearchGetters.lead },
      { searchKey: "service", getSearchValue: leadSearchGetters.service, filterMode: "exact" as const, filterClearValue: "All" },
      { searchKey: "country", getSearchValue: leadSearchGetters.country, filterMode: "exact" as const, filterClearValue: "All" },
      ...(!isCounselorView
        ? [
            {
              searchKey: "counselor",
              getSearchValue: leadSearchGetters.counselor,
              filterMode: "exact" as const,
              filterClearValue: "All",
            },
          ]
        : []),
    ],
    [leadSearchGetters, isCounselorView]
  );

  const serviceFilterOptions = useMemo(
    () => getVisaServiceFilterOptions(leads),
    [leads]
  );

  const counselorFilterOptions = useMemo(
    () => (isCounselorView ? [] : getCounselorFilterOptions(users)),
    [users, isCounselorView]
  );

  const countryFilterOptions = getCountryFilterOptions();

  const counselorScopedLeads = useMemo(
    () => scopeLeadsForUser(leads, currentUser),
    [leads, currentUser]
  );

  const readyLeads = useMemo(
    () => counselorScopedLeads.filter((l) => !l.isDeleted && l.status === "IN_PROGRESS"),
    [counselorScopedLeads]
  );

  const dispatchedLeads = useMemo(
    () => counselorScopedLeads.filter((l) => !l.isDeleted && l.status === "VISA_SUBMISSION"),
    [counselorScopedLeads]
  );

  const approvedLeads = useMemo(
    () => counselorScopedLeads.filter((l) => !l.isDeleted && l.status === "VISA_APPROVED"),
    [counselorScopedLeads]
  );

  const rejectedLeads = useMemo(
    () => counselorScopedLeads.filter((l) => !l.isDeleted && l.status === "VISA_REJECTED"),
    [counselorScopedLeads]
  );

  const baseRows = useMemo(() => {
    if (submissionView === "dispatched") return dispatchedLeads;
    if (submissionView === "approved") return approvedLeads;
    if (submissionView === "rejected") return rejectedLeads;
    return readyLeads;
  }, [submissionView, readyLeads, dispatchedLeads, approvedLeads, rejectedLeads]);

  const tableRows = useMemo(() => {
    return applyColumnSearch(
      baseRows,
      leadSearchColumns,
      columnSearch.debouncedFilters
    );
  }, [baseRows, leadSearchColumns, columnSearch.debouncedFilters]);

  const readyColumns = useMemo<Column<Lead>[]>(
    () => [
      {
        header: "Lead",
        searchKey: "lead",
        searchLabel: "Lead",
        getSearchValue: leadSearchGetters.lead,
        render: (lead) => (
          <div className="min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openLeadDetail(lead.id);
              }}
              className={leadNameLinkClass}
            >
              {lead.name}
            </button>
          </div>
        ),
      },
      {
        header: "Service",
        searchKey: "service",
        searchLabel: "Service",
        filterSelectOptions: serviceFilterOptions,
        filterSelectPlaceholder: "All Services",
        filterSelectClearValue: "All",
        getSearchValue: leadSearchGetters.service,
        render: (lead) => (
          <span className="font-medium text-gray-600 dark:text-slate-300 text-[13px] whitespace-nowrap">
            {lead.visaType}
          </span>
        ),
      },
      {
        header: "Country",
        searchKey: "country",
        searchLabel: "Country",
        filterSelectOptions: countryFilterOptions,
        filterSelectClearValue: "All",
        getSearchValue: leadSearchGetters.country,
        render: (lead) => <CountryCell country={lead.country} />,
      },
      {
        header: "Assign to",
        ...(isCounselorView
          ? {}
          : {
              searchKey: "counselor",
              searchLabel: "Assign to",
              filterSelectOptions: counselorFilterOptions,
              filterSelectPlaceholder: "All Counselors",
              filterSelectClearValue: "All",
              filterSelectShowSearch: false,
              getSearchValue: leadSearchGetters.counselor,
            }),
        render: (lead) => (
          <span className="font-medium text-gray-600 dark:text-slate-300 text-[13px] whitespace-nowrap">
            {lead.counselor || "Unassigned"}
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
            onClick={(e) => {
              e.stopPropagation();
              updateLeadStatus(lead.id, "VISA_SUBMISSION");
            }}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed max-w-full"
          >
            <FiSend className="text-[12px] shrink-0" />
            <span className="truncate">Mark as Dispatched</span>
          </button>
        ),
      },
    ],
    [leadSearchGetters, isCounselorView, serviceFilterOptions, countryFilterOptions, counselorFilterOptions, canSubmitVisa, updateLeadStatus, openLeadDetail]
  );

  const dispatchedColumns = useMemo<Column<Lead>[]>(
    () => [
      {
        header: "Lead",
        searchKey: "lead",
        searchLabel: "Lead",
        getSearchValue: leadSearchGetters.lead,
        render: (lead) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLeadDetail(lead.id);
            }}
            className={leadNameLinkClass}
          >
            {lead.name}
          </button>
        ),
      },
      {
        header: "Service",
        searchKey: "service",
        searchLabel: "Service",
        filterSelectOptions: serviceFilterOptions,
        filterSelectPlaceholder: "All Services",
        filterSelectClearValue: "All",
        getSearchValue: leadSearchGetters.service,
        render: (lead) => (
          <span className="font-medium text-gray-600 dark:text-slate-300 text-[13px] whitespace-nowrap">
            {lead.visaType}
          </span>
        ),
      },
      {
        header: "Country",
        searchKey: "country",
        searchLabel: "Country",
        filterSelectOptions: countryFilterOptions,
        filterSelectClearValue: "All",
        getSearchValue: leadSearchGetters.country,
        render: (lead) => <CountryCell country={lead.country} />,
      },
      {
        header: "Assign to",
        ...(isCounselorView
          ? {}
          : {
              searchKey: "counselor",
              searchLabel: "Assign to",
              filterSelectOptions: counselorFilterOptions,
              filterSelectPlaceholder: "All Counselors",
              filterSelectClearValue: "All",
              filterSelectShowSearch: false,
              getSearchValue: leadSearchGetters.counselor,
            }),
        render: (lead) => (
          <span className="font-medium text-gray-600 dark:text-slate-300 text-[13px] whitespace-nowrap">
            {lead.counselor || "Unassigned"}
          </span>
        ),
      },
      {
        header: "Dispatched",
        render: (lead) => (
          <span className="text-[12px] text-gray-600 dark:text-white truncate block font-medium">
            {timeAgo(lead.lastUpdated)}
          </span>
        ),
      },
      {
        header: "Action",
        align: "right",
        render: (lead) => (
          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              disabled={!canSubmitVisa}
              onClick={(e) => {
                e.stopPropagation();
                updateLeadStatus(lead.id, "IN_PROGRESS");
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed max-w-full"
            >
              <FiRefreshCw className="text-[12px] shrink-0" />
              <span className="truncate">Revert to Ready</span>
            </button>
            <button
              type="button"
              disabled={!canSubmitVisa}
              onClick={(e) => {
                e.stopPropagation();
                updateLeadStatus(lead.id, "VISA_APPROVED");
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed max-w-full"
            >
              <FiCheckCircle className="text-[12px] shrink-0" />
              <span className="truncate">Approve</span>
            </button>
            <button
              type="button"
              disabled={!canSubmitVisa}
              onClick={(e) => {
                e.stopPropagation();
                updateLeadStatus(lead.id, "VISA_REJECTED");
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed max-w-full"
            >
              <FiXCircle className="text-[12px] shrink-0" />
              <span className="truncate">Reject</span>
            </button>
          </div>
        ),
      },
    ],
    [leadSearchGetters, isCounselorView, serviceFilterOptions, countryFilterOptions, counselorFilterOptions, canSubmitVisa, updateLeadStatus, openLeadDetail]
  );

  const approvedColumns = useMemo<Column<Lead>[]>(
    () => [
      {
        header: "Lead",
        searchKey: "lead",
        searchLabel: "Lead",
        getSearchValue: leadSearchGetters.lead,
        render: (lead) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLeadDetail(lead.id);
            }}
            className={leadNameLinkClass}
          >
            {lead.name}
          </button>
        ),
      },
      {
        header: "Service",
        searchKey: "service",
        searchLabel: "Service",
        filterSelectOptions: serviceFilterOptions,
        filterSelectPlaceholder: "All Services",
        filterSelectClearValue: "All",
        getSearchValue: leadSearchGetters.service,
        render: (lead) => (
          <span className="font-medium text-gray-600 dark:text-slate-300 text-[13px] whitespace-nowrap">
            {lead.visaType}
          </span>
        ),
      },
      {
        header: "Country",
        searchKey: "country",
        searchLabel: "Country",
        filterSelectOptions: countryFilterOptions,
        filterSelectClearValue: "All",
        getSearchValue: leadSearchGetters.country,
        render: (lead) => <CountryCell country={lead.country} />,
      },
      {
        header: "Assign to",
        ...(isCounselorView
          ? {}
          : {
              searchKey: "counselor",
              searchLabel: "Assign to",
              filterSelectOptions: counselorFilterOptions,
              filterSelectPlaceholder: "All Counselors",
              filterSelectClearValue: "All",
              filterSelectShowSearch: false,
              getSearchValue: leadSearchGetters.counselor,
            }),
        render: (lead) => (
          <span className="font-medium text-gray-600 dark:text-slate-300 text-[13px] whitespace-nowrap">
            {lead.counselor || "Unassigned"}
          </span>
        ),
      },
      {
        header: "Approved Date",
        render: (lead) => (
          <span className="text-[12px] text-gray-600 dark:text-white truncate block font-medium">
            {timeAgo(lead.lastUpdated)}
          </span>
        ),
      },
      {
        header: "Status",
        render: () => (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-500 max-w-full">
            <FiCheckCircle className="text-[12px] shrink-0" />
            <span className="truncate">Approved</span>
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
            onClick={(e) => {
              e.stopPropagation();
              updateLeadStatus(lead.id, "VISA_SUBMISSION");
            }}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed max-w-full"
          >
            <FiRefreshCw className="text-[12px] shrink-0" />
            <span className="truncate">Revert to Dispatched</span>
          </button>
        ),
      },
    ],
    [leadSearchGetters, isCounselorView, serviceFilterOptions, countryFilterOptions, counselorFilterOptions, canSubmitVisa, updateLeadStatus, openLeadDetail]
  );

  const rejectedColumns = useMemo<Column<Lead>[]>(
    () => [
      {
        header: "Lead",
        searchKey: "lead",
        searchLabel: "Lead",
        getSearchValue: leadSearchGetters.lead,
        render: (lead) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLeadDetail(lead.id);
            }}
            className={leadNameLinkClass}
          >
            {lead.name}
          </button>
        ),
      },
      {
        header: "Service",
        searchKey: "service",
        searchLabel: "Service",
        filterSelectOptions: serviceFilterOptions,
        filterSelectPlaceholder: "All Services",
        filterSelectClearValue: "All",
        getSearchValue: leadSearchGetters.service,
        render: (lead) => (
          <span className="font-medium text-gray-600 dark:text-slate-300 text-[13px] whitespace-nowrap">
            {lead.visaType}
          </span>
        ),
      },
      {
        header: "Country",
        searchKey: "country",
        searchLabel: "Country",
        filterSelectOptions: countryFilterOptions,
        filterSelectClearValue: "All",
        getSearchValue: leadSearchGetters.country,
        render: (lead) => <CountryCell country={lead.country} />,
      },
      {
        header: "Assign to",
        ...(isCounselorView
          ? {}
          : {
              searchKey: "counselor",
              searchLabel: "Assign to",
              filterSelectOptions: counselorFilterOptions,
              filterSelectPlaceholder: "All Counselors",
              filterSelectClearValue: "All",
              filterSelectShowSearch: false,
              getSearchValue: leadSearchGetters.counselor,
            }),
        render: (lead) => (
          <span className="font-medium text-gray-600 dark:text-slate-300 text-[13px] whitespace-nowrap">
            {lead.counselor || "Unassigned"}
          </span>
        ),
      },
      {
        header: "Rejected Date",
        render: (lead) => (
          <span className="text-[12px] text-gray-600 dark:text-white truncate block font-medium">
            {timeAgo(lead.lastUpdated)}
          </span>
        ),
      },
      {
        header: "Status",
        render: () => (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-500 max-w-full">
            <FiXCircle className="text-[12px] shrink-0" />
            <span className="truncate">Rejected</span>
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
            onClick={(e) => {
              e.stopPropagation();
              updateLeadStatus(lead.id, "IN_PROGRESS");
            }}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed max-w-full"
          >
            <FiRefreshCw className="text-[12px] shrink-0" />
            <span className="truncate">Reapply</span>
          </button>
        ),
      },
    ],
    [leadSearchGetters, isCounselorView, serviceFilterOptions, countryFilterOptions, counselorFilterOptions, canSubmitVisa, updateLeadStatus, openLeadDetail]
  );

  const tableColumns = useMemo(() => {
    if (submissionView === "dispatched") return dispatchedColumns;
    if (submissionView === "approved") return approvedColumns;
    if (submissionView === "rejected") return rejectedColumns;
    return readyColumns;
  }, [submissionView, readyColumns, dispatchedColumns, approvedColumns, rejectedColumns]);

  return (
    <div className="-m-4 md:-m-8 p-4 md:p-6 bg-gray-50 dark:bg-transparent min-h-[calc(100vh-4rem)] space-y-5">
      <div className="min-w-0">
        <DataTable
          pagination={true}
          defaultPageSize={10}
          showToolbar={false}
          rows={tableRows}
          columnSearch={columnSearch}
          getRowId={(l) => l.id}
          columns={tableColumns}
          showCheckbox={false}
          showIndex={false}
          emptyText="No leads match your filters."
        />
      </div>
    </div>
  );
}
