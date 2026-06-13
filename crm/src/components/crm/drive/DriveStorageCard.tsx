"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiZap } from "react-icons/fi";
import { DriveStorageIcon } from "./DriveStorageIcon";
import { DRIVE_ACCENT_TEXT, DRIVE_BORDER, DRIVE_TEXT_SECONDARY } from "./driveTheme";

const UPGRADE_STORAGE_URL = "https://one.google.com/storage";

type QuotaResponse = {
  usedBytes: number;
  limitBytes: number;
  usedLabel: string;
  limitLabel: string;
  percent: number;
};

export function DriveStorageCard() {
  const [quota, setQuota] = useState<QuotaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/drive/quota");
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to load storage quota");
      }
      setQuota((await res.json()) as QuotaResponse);
    } catch (err) {
      setQuota(null);
      setError(err instanceof Error ? err.message : "Failed to load storage quota");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQuota();
  }, [fetchQuota]);

  const usageText =
    quota && quota.limitBytes > 0
      ? `${quota.usedLabel} of ${quota.limitLabel} used`
      : quota
        ? `${quota.usedLabel} used`
        : null;

  const progressPercent = quota?.limitBytes ? quota.percent : 0;

  return (
    <div
      className={`mx-4 mb-2 rounded-[14px] border p-4 bg-white dark:bg-[#0a0a1a] ${DRIVE_BORDER}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <DriveStorageIcon />
        <span className="text-[12px] font-semibold text-slate-800 dark:text-[#EDEDED]">
          Storage
        </span>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-slate-700/60" />
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-slate-700/60" />
        </div>
      ) : error ? (
        <p className={`text-[11px] font-medium ${DRIVE_TEXT_SECONDARY}`}>{error}</p>
      ) : quota ? (
        <>
          <p className={`text-[11px] font-medium mb-2 ${DRIVE_TEXT_SECONDARY}`}>{usageText}</p>
          {quota.limitBytes > 0 && (
            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-slate-700/60 mb-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </>
      ) : null}

      <button
        type="button"
        onClick={() => window.open(UPGRADE_STORAGE_URL, "_blank", "noopener,noreferrer")}
        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[11px] font-semibold transition-colors ${DRIVE_BORDER} bg-white dark:bg-[#0a0a1a] hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-600/40 dark:hover:border-blue-400/40 ${DRIVE_ACCENT_TEXT}`}
      >
        <FiZap className="text-sm shrink-0" aria-hidden />
        Upgrade Storage
      </button>
    </div>
  );
}
