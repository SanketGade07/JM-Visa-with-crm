"use client";

import { useMemo } from "react";
import { useCrmLayoutContext } from "@/components/crm/context/CrmLayoutContext";

export function useSubmissionTabs() {
  const { leads, submissionView } = useCrmLayoutContext();

  const readyCount = useMemo(
    () => leads.filter((l) => !l.isDeleted && l.status === "IN_PROGRESS").length,
    [leads]
  );

  const dispatchedCount = useMemo(
    () => leads.filter((l) => !l.isDeleted && l.status === "VISA_SUBMISSION").length,
    [leads]
  );

  const approvedCount = useMemo(
    () => leads.filter((l) => !l.isDeleted && l.status === "VISA_APPROVED").length,
    [leads]
  );

  const rejectedCount = useMemo(
    () => leads.filter((l) => !l.isDeleted && l.status === "VISA_REJECTED").length,
    [leads]
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
