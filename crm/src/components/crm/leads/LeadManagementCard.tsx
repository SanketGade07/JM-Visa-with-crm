"use client";

import React from "react";
import type { Lead, VisaStatus } from "@/context/CrmContext";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

type LeadManagementCardProps = {
  lead: Lead;
  className?: string;
};

const fieldLabelCls =
  "text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block";
const fieldInputCls =
  "w-full bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed";

export function LeadManagementCard({ lead, className = "" }: LeadManagementCardProps) {
  const { updateLeadStatus, assignCounselor, updateLeadNotes, canModifyLeads } =
    useCrmLayoutContext();

  return (
    <section
      className={`rounded-2xl border border-gray-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
          Lead Management
        </h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className={fieldLabelCls} htmlFor={`lead-status-${lead.id}`}>
            Transition Status
          </label>
          <select
            id={`lead-status-${lead.id}`}
            value={lead.status}
            onChange={(e) => updateLeadStatus(lead.id, e.target.value as VisaStatus)}
            disabled={!canModifyLeads}
            className={`${fieldInputCls} cursor-pointer`}
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
          <label className={fieldLabelCls} htmlFor={`lead-counselor-${lead.id}`}>
            Assigned Counselor
          </label>
          <select
            id={`lead-counselor-${lead.id}`}
            value={lead.counselor}
            onChange={(e) => assignCounselor(lead.id, e.target.value)}
            disabled={!canModifyLeads}
            className={`${fieldInputCls} cursor-pointer`}
          >
            <option value="Unassigned">Unassigned</option>
            <option value="Priya Mehta">Priya Mehta</option>
            <option value="Rohit Verma">Rohit Verma</option>
            <option value="Simran Kaur">Simran Kaur</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={fieldLabelCls} htmlFor={`lead-notes-${lead.id}`}>
            Counselor File Notes
          </label>
          <textarea
            id={`lead-notes-${lead.id}`}
            rows={4}
            value={lead.notes}
            onChange={(e) => updateLeadNotes(lead.id, e.target.value)}
            disabled={!canModifyLeads}
            placeholder="Type internal remarks here..."
            className="w-full bg-white dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700 text-xs p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 dark:placeholder-slate-500 text-gray-700 dark:text-slate-200 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </section>
  );
}
