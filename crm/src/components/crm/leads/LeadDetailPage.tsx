"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaChevronLeft, FaTimes } from "react-icons/fa";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { LeadChecklistSection } from "./LeadChecklistSection";
import { LeadDetailsSection } from "./LeadDetailsSection";
import { LeadDriveTab } from "./LeadDriveTab";
import { LeadManagementCard } from "./LeadManagementCard";
import { LeadSettingsSection } from "./LeadSettingsSection";

function TabPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] rounded-2xl border border-gray-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-8 text-center">
      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-xs text-gray-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

export function LeadDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createdHandledRef = useRef(false);
  const [showCreatedBanner, setShowCreatedBanner] = useState(false);
  const [highlightSummary, setHighlightSummary] = useState(false);

  const {
    leads,
    selectedLeadId,
    closeLeadDetail,
    leadDetailTab,
    canAccessLeadChecklist,
    canViewLeads,
  } = useCrmLayoutContext();

  const lead = selectedLeadId ? leads.find((l) => l.id === selectedLeadId) ?? null : null;
  useEffect(() => {
    if (searchParams.get("created") !== "1" || !selectedLeadId) return;
    if (createdHandledRef.current) return;
    createdHandledRef.current = true;

    setShowCreatedBanner(true);
    setHighlightSummary(true);

    const tab = searchParams.get("tab") || leadDetailTab;
    const stripTimer = window.setTimeout(() => {
      router.replace(`/leads/${encodeURIComponent(selectedLeadId)}?tab=${tab}`);
    }, 2800);
    const unhighlightTimer = window.setTimeout(() => {
      setHighlightSummary(false);
    }, 3600);

    return () => {
      window.clearTimeout(stripTimer);
      window.clearTimeout(unhighlightTimer);
    };
  }, [leadDetailTab, router, searchParams, selectedLeadId]);

  if (!canViewLeads) {
    return null;
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] text-center space-y-4">
        <p className="text-sm text-gray-500 dark:text-slate-400">Lead not found or no lead selected.</p>
        <button
          type="button"
          onClick={closeLeadDetail}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
        >
          <FaChevronLeft className="text-xs" />
          Back to Lead Management
        </button>
      </div>
    );
  }

  return (
    <div className={leadDetailTab === "details" ? "flex-1 min-h-0 flex flex-col" : "space-y-6"}>
      {showCreatedBanner && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 animate-premium-fade-in-up"
        >
          <div>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              Lead created successfully
            </p>
            <p className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-300/80">
              Review the request details and manage this lead from the panel on the right.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreatedBanner(false)}
            className="shrink-0 p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            aria-label="Dismiss success message"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      <div
        role="tabpanel"
        aria-label={leadDetailTab}
        className={leadDetailTab === "details" ? "flex-1 min-h-0 flex flex-col" : undefined}
      >
        {leadDetailTab === "details" && (
          <div className="flex-1 min-h-0 flex flex-col">
            <LeadDetailsSection lead={lead} highlighted={highlightSummary} />
          </div>
        )}
        {leadDetailTab === "checklist" && canAccessLeadChecklist && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
            <LeadChecklistSection lead={lead} />
            <LeadManagementCard
              lead={lead}
              highlighted={highlightSummary}
              className="xl:sticky xl:top-4"
            />
          </div>
        )}
        {leadDetailTab === "checklist" && !canAccessLeadChecklist && (
          <TabPlaceholder
            title="Checklist access restricted"
            description="You do not have permission to view or verify documents for this lead."
          />
        )}
        {leadDetailTab === "drive" && <LeadDriveTab lead={lead} />}
        {leadDetailTab === "settings" && <LeadSettingsSection lead={lead} />}
      </div>
    </div>
  );
}
