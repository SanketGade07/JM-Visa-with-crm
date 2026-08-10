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
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { CreateLeadWizardPage } from "./create/CreateLeadWizardPage";

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
    canAccessChecklistForLead,
    canViewLeads,
    userAllowedTabs,
    isEditLeadOpen,
    editLeadSession,
    closeEditLead,
  } = useCrmLayoutContext();

  const lead = selectedLeadId ? leads.find((l) => l.id === selectedLeadId) ?? null : null;
  const canAccessLeadChecklist = canAccessChecklistForLead(lead);
  const isDetailsAllowed = userAllowedTabs.includes("LeadDetails_Details");
  const isChecklistAllowed = userAllowedTabs.includes("LeadDetails_Checklist") && canAccessLeadChecklist;
  const isDriveAllowed = userAllowedTabs.includes("LeadDetails_Drive");
  const isSettingsAllowed = userAllowedTabs.includes("LeadDetails_Settings");

  useEffect(() => {
    if (searchParams.get("created") !== "1" || !selectedLeadId) return;
    if (createdHandledRef.current) return;
    createdHandledRef.current = true;

    setShowCreatedBanner(true);
    setHighlightSummary(true);

    const tab = searchParams.get("tab") || leadDetailTab;
    // Strip the created parameter from the URL immediately
    router.replace(`/leads/${encodeURIComponent(selectedLeadId)}?tab=${tab}`);

    const unhighlightTimer = window.setTimeout(() => {
      setHighlightSummary(false);
    }, 3600);

    const bannerTimer = window.setTimeout(() => {
      setShowCreatedBanner(false);
    }, 5000);

    return () => {
      window.clearTimeout(unhighlightTimer);
      window.clearTimeout(bannerTimer);
    };
  }, [selectedLeadId, router]);

  useEffect(() => {
    if (leadDetailTab !== "details" && isEditLeadOpen) {
      closeEditLead();
    }
  }, [leadDetailTab, isEditLeadOpen, closeEditLead]);

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
    <div className="flex-1 min-h-0 flex flex-col space-y-4">
      {showCreatedBanner && (
        <div className="relative overflow-hidden py-3 px-4 w-full max-w-md rounded-2xl bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-900/20 text-emerald-800 dark:text-emerald-400 shadow-sm flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Lead created successfully!</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCreatedBanner(false)}
            aria-label="Dismiss banner"
            className="p-1 rounded-lg text-emerald-600/70 hover:text-emerald-800 dark:text-emerald-400/70 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center justify-center shrink-0"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      {/* Edit wizard panel */}
      <CollapsiblePanel open={isEditLeadOpen}>
        <div className="mb-4">
          <CreateLeadWizardPage
            key={editLeadSession}
            variant="inline"
            onClose={closeEditLead}
            editLeadId={selectedLeadId}
          />
        </div>
      </CollapsiblePanel>

      {/* Tabs panels */}
      <div
        role="tabpanel"
        aria-label={leadDetailTab}
        className={leadDetailTab === "details" && !isEditLeadOpen ? "flex-1 min-h-0 flex flex-col" : undefined}
      >
        {leadDetailTab === "details" && isDetailsAllowed && (
          <div className={!isEditLeadOpen ? "flex-1 min-h-0 flex flex-col" : undefined}>
            <LeadDetailsSection lead={lead} highlighted={highlightSummary} />
          </div>
        )}
        {leadDetailTab === "details" && !isDetailsAllowed && (
          <TabPlaceholder
            title="Details access restricted"
            description="You do not have permission to view this lead's profile details."
          />
        )}
        {leadDetailTab === "checklist" && isChecklistAllowed && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
            <LeadChecklistSection lead={lead} />
            <LeadManagementCard
              lead={lead}
              highlighted={highlightSummary}
              className="xl:sticky xl:top-4"
            />
          </div>
        )}
        {leadDetailTab === "checklist" && !isChecklistAllowed && (
          <TabPlaceholder
            title="Checklist access restricted"
            description="You do not have permission to view or verify documents for this lead."
          />
        )}
        {leadDetailTab === "drive" && isDriveAllowed && <LeadDriveTab lead={lead} />}
        {leadDetailTab === "drive" && !isDriveAllowed && (
          <TabPlaceholder
            title="Drive access restricted"
            description="You do not have permission to view files in this lead's drive storage."
          />
        )}
        {leadDetailTab === "settings" && isSettingsAllowed && <LeadSettingsSection lead={lead} />}
        {leadDetailTab === "settings" && !isSettingsAllowed && (
          <TabPlaceholder
            title="Settings access restricted"
            description="You do not have permission to configure settings for this lead."
          />
        )}
      </div>
    </div>
  );
}
