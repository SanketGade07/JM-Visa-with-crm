"use client";

import React from "react";
import { FaCheckCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

const TOAST_DURATION_MS = { success: 5000, error: 6000 } as const;

export function CrmToast() {
  const { toast, setToast } = useCrmLayoutContext();
  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const durationMs = TOAST_DURATION_MS[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden fixed top-20 left-1/2 -translate-x-1/2 z-[350] flex items-start gap-3 px-4 py-3 rounded-xl border border-l-4 min-w-[280px] max-w-[480px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-toast-slide-down max-sm:top-4 max-sm:inset-x-4 max-sm:left-auto max-sm:translate-x-0 ${
        isSuccess
          ? "bg-white dark:bg-[#1D1F23] border-[#D7DEE8] dark:border-[#2A2D33] border-l-emerald-500 text-emerald-700 dark:text-emerald-400"
          : "bg-white dark:bg-[#1D1F23] border-[#D7DEE8] dark:border-[#2A2D33] border-l-rose-500 text-rose-700 dark:text-rose-400"
      }`}
    >
      {isSuccess ? (
        <FaCheckCircle className="text-base shrink-0 mt-0.5" aria-hidden />
      ) : (
        <FaInfoCircle className="text-base shrink-0 mt-0.5" aria-hidden />
      )}
      <span className="text-sm font-bold flex-1 pt-0.5">{toast.message}</span>
      <button
        type="button"
        onClick={() => setToast(null)}
        className="shrink-0 p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <FaTimes className="text-xs" />
      </button>
      <div
        className="absolute bottom-0 left-0 h-0.5 rounded-b-xl animate-toast-progress"
        style={{
          animationDuration: `${durationMs}ms`,
          backgroundColor: isSuccess ? "#10b981" : "#f43f5e",
        }}
      />
    </div>
  );
}
