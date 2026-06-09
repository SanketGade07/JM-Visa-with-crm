"use client";

import React from "react";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

export function CrmToast() {
  const { toast } = useCrmLayoutContext();
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center space-x-2.5 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 animate-fade-in ${
      toast.type === "success"
        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
    }`}>
      {toast.type === "success" ? (
        <FaCheckCircle className="text-base shrink-0" />
      ) : (
        <FaInfoCircle className="text-base shrink-0" />
      )}
      <span className="text-xs font-bold">{toast.message}</span>
    </div>
  );
}
