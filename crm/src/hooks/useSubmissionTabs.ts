"use client";

import { useMemo } from "react";
import { useCrmLayoutContext } from "@/components/crm/context/CrmLayoutContext";
import { scopeLeadsForUser } from "@/utils/leadHelpers";

export function useSubmissionTabs() {
  const { leads, currentUser, submissionView } = useCrmLayoutContext();

  const counselorScopedLeads = useMemo(
    () => scopeLeadsForUser(leads, currentUser),
    [leads, currentUser]
  );

  const readyCount = useMemo(
    () => counselorScopedLeads.filter((l) => !l.isDeleted && l.status === "IN_PROGRESS").length,
    [counselorScopedLeads]
  );

  const dispatchedCount = useMemo(
    () => counselorScopedLeads.filter((l) => !l.isDeleted && l.status === "VISA_SUBMISSION").length,
    [counselorScopedLeads]
  );

  const approvedCount = useMemo(
    () => counselorScopedLeads.filter((l) => !l.isDeleted && l.status === "VISA_APPROVED").length,
    [counselorScopedLeads]
  );

  const rejectedCount = useMemo(
    () => counselorScopedLeads.filter((l) => !l.isDeleted && l.status === "VISA_REJECTED").length,
    [counselorScopedLeads]
  );

  const submissionTabs = useMemo(
    () => [
      { id: "ready", label: "Ready", count: readyCount },
      { id: "dispatched", label: "Dispatched", count: dispatchedCount },
      { id: "approved", label: "Approved", count: approvedCount },
      { id: "rejected", label: "Rejected", count: rejectedCount },
    ],
    [readyCount, dispatchedCount, approvedCount, rejectedCount]
  );

  return { readyCount, dispatchedCount, approvedCount, rejectedCount, submissionTabs, submissionView };
}
