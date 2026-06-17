"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Lead } from "@/context/CrmContext";
import {
  canRecordLeadDeposit,
  formatLeadDepositLabel,
  getDepositPickerLeads,
} from "@/utils/leadPaymentUtils";

export { getDepositLeadSummary } from "@/utils/leadPaymentUtils";

type DepositLeadSearchSelectProps = {
  leads: Lead[];
  value: string;
  onChange: (leadId: string) => void;
};

export function DepositLeadSearchSelect({
  leads,
  value,
  onChange,
}: DepositLeadSearchSelectProps) {
  const pickerLeads = useMemo(() => getDepositPickerLeads(leads), [leads]);
  const options = useMemo(
    () =>
      pickerLeads.map((lead) => ({
        id: lead.id,
        label: formatLeadDepositLabel(lead),
        canDeposit: canRecordLeadDeposit(lead),
        searchText: `${lead.name} ${lead.id} ${lead.country}`.toLowerCase(),
      })),
    [pickerLeads]
  );
  const selected = options.find((option) => option.id === value) ?? null;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.searchText.includes(q) || option.label.toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative space-y-1">
      <label className="text-gray-500 dark:text-slate-400 font-bold block">
        Search client file
      </label>
      <input
        type="text"
        value={open ? query : selected?.label ?? ""}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onClick={() => {
          setOpen(true);
          setQuery("");
        }}
        placeholder="Search by name, ID, or country..."
        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:border-violet-500/50 text-gray-900 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-600"
        autoComplete="off"
      />
      {open ? (
        <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto crm-slim-scrollbar bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl shadow-xl">
          {filtered.length > 0 ? (
            filtered.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  disabled={!option.canDeposit}
                  onClick={() => {
                    if (!option.canDeposit) return;
                    onChange(option.id);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${
                    option.canDeposit
                      ? "hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  } ${
                    option.id === value
                      ? "text-violet-600 dark:text-blue-400 font-semibold bg-violet-50 dark:bg-blue-500/15 ring-1 ring-inset ring-violet-200 dark:ring-blue-500/30"
                      : "text-gray-700 dark:text-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2.5 text-xs text-gray-500 dark:text-slate-500">
              No matching clients
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
