"use client";

import React from "react";
import type { Lead, VisaStatus } from "@/context/CrmContext";
import { StatusPill } from "@/components/ui/DataTable";
import {
  DEFAULT_EMPLOYMENT_CATEGORY,
  getChecklistKeysForLead,
} from "@/utils/documentChecklistConfig";

type LeadDetailPanelProps = {
  lead: Lead;
  canModifyLeads: boolean;
  onStatusChange: (leadId: string, status: VisaStatus) => void;
  onCounselorChange: (leadId: string, counselor: string) => void;
  onNotesChange: (leadId: string, notes: string) => void;
};

export function LeadDetailPanel({
  lead,
  canModifyLeads,
  onStatusChange,
  onCounselorChange,
  onNotesChange,
}: LeadDetailPanelProps) {
  const category = lead.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY;
  const activeKeys = getChecklistKeysForLead(category);
  const verifiedCount = activeKeys.filter((key) => lead.checklist[key]).length;
  const totalCount = activeKeys.length;

  return (
    <div className="p-5 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800/80 rounded-2xl flex flex-col h-full space-y-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate leading-snug">
              {lead.name}
            </h4>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold tracking-wider uppercase block truncate mt-0.5">
              {lead.id}
            </span>
          </div>
          <StatusPill status={lead.status} />
        </div>

        <div className="space-y-4 border-t border-gray-100 dark:border-slate-800/80 pt-4">
          <div className="space-y-1.5">
            <label className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block">
              Transition Status
            </label>
            <select
              value={lead.status}
              onChange={(e) => onStatusChange(lead.id, e.target.value as VisaStatus)}
              disabled={!canModifyLeads}
              className="w-full bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="New Lead">New Lead</option>
              <option value="Lead Assigned">Lead Assigned</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow-Up">Follow-Up</option>
              <option value="Interested">Interested</option>
              <option value="Documents Pending">Documents Pending</option>
              <option value="Documents Received">Documents Received</option>
              <option value="Under Verification">Under Verification</option>
              <option value="Ready For Submission">Ready For Submission</option>
              <option value="Visa Submitted">Visa Submitted</option>
              <option value="Approved / Rejected">Approved / Rejected</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block">
              Assigned Counselor
            </label>
            <select
              value={lead.counselor}
              onChange={(e) => onCounselorChange(lead.id, e.target.value)}
              disabled={!canModifyLeads}
              className="w-full bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="Unassigned">Unassigned</option>
              <option value="Priya Mehta">Priya Mehta</option>
              <option value="Rohit Verma">Rohit Verma</option>
              <option value="Simran Kaur">Simran Kaur</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 border-t border-gray-100 dark:border-slate-800/80 pt-4">
            <div className="min-w-0">
              <span className="text-[10px] uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider block">
                Email Address
              </span>
              <span className="text-gray-700 dark:text-slate-200 text-[12px] font-bold select-all block mt-1 truncate">
                {lead.email}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider block">
                Contact Number
              </span>
              <span className="text-gray-700 dark:text-slate-200 text-[12px] font-bold select-all block mt-1 truncate">
                {lead.phone}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-gray-100 dark:border-slate-800/80 pt-4">
            <label className="text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block">
              Counselor File Notes
            </label>
            <textarea
              rows={3}
              value={lead.notes}
              onChange={(e) => onNotesChange(lead.id, e.target.value)}
              disabled={!canModifyLeads}
              placeholder="Type internal remarks here..."
              className="w-full bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700 text-xs p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 dark:placeholder-slate-500 text-gray-700 dark:text-slate-200 resize-none h-[100px] disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50/50 dark:bg-slate-800/20 border border-gray-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between mt-auto">
        <div>
          <span className="text-[10px] uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider block">
            Completed Scans
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-0.5 block">
            {verifiedCount} / {totalCount} Files
          </span>
        </div>
        <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 tabular-nums">
          {totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0}%
        </span>
      </div>
    </div>
  );
}
