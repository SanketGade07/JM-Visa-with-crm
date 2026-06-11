"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Lead } from "@/context/CrmContext";
import { FaTimes } from "react-icons/fa";
import { FiSettings, FiPhone, FiMail, FiUser, FiLock } from "react-icons/fi";
import DataTable from "@/components/ui/DataTable";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function paidBadge(slotsPaid: boolean) {
  return slotsPaid
    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
    : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
}

function interviewBadge(booked: boolean) {
  return booked
    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
    : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
}

type UsaSlotSettingsModalProps = {
  lead: Lead;
  onClose: () => void;
  updateUsaSlots: ReturnType<typeof useCrmLayoutContext>["updateUsaSlots"];
  setLeadCredentials: ReturnType<typeof useCrmLayoutContext>["setLeadCredentials"];
  showToast: ReturnType<typeof useCrmLayoutContext>["showToast"];
};

function UsaSlotSettingsModal({
  lead,
  onClose,
  updateUsaSlots,
  setLeadCredentials,
  showToast,
}: UsaSlotSettingsModalProps) {
  const [credUsername, setCredUsername] = useState(lead.visaCredentials?.username ?? "");
  const [credPassword, setCredPassword] = useState(lead.visaCredentials?.password ?? "");
  const [savingCreds, setSavingCreds] = useState(false);
  const [securityCar, setSecurityCar] = useState(lead.usaSlots?.securityCar ?? "");
  const [securityFood, setSecurityFood] = useState(lead.usaSlots?.securityFood ?? "");
  const [securityCity, setSecurityCity] = useState(lead.usaSlots?.securityCity ?? "");

  useEffect(() => {
    setCredUsername(lead.visaCredentials?.username ?? "");
    setCredPassword(lead.visaCredentials?.password ?? "");
    setSecurityCar(lead.usaSlots?.securityCar ?? "");
    setSecurityFood(lead.usaSlots?.securityFood ?? "");
    setSecurityCity(lead.usaSlots?.securityCity ?? "");
  }, [lead.id, lead.visaCredentials, lead.usaSlots]);

  const handleSaveCredentials = async () => {
    setSavingCreds(true);
    const ok = await setLeadCredentials(lead.id, {
      username: credUsername.trim() || undefined,
      password: credPassword.trim() || undefined,
      portalUrl: lead.visaCredentials?.portalUrl,
    });
    setSavingCreds(false);
    showToast(ok ? "Portal credentials saved" : "Failed to save credentials", ok ? "success" : "error");
  };

  const handleSaveSecurity = () => {
    updateUsaSlots(lead.id, {
      securityCar: securityCar.trim(),
      securityFood: securityFood.trim(),
      securityCity: securityCity.trim(),
    });
    showToast("Security answers saved", "success");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">Slot Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-800"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Paid Dates */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Paid Dates</h4>
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
            <p className="text-sm font-semibold text-white">{lead.name}</p>
            <p className="text-xs text-slate-400">{lead.phone || "—"}</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-900 rounded-xl">
            <span className="font-semibold text-slate-300 text-xs">Embassy Visa Fee Paid</span>
            <input
              type="checkbox"
              checked={!!lead.usaSlots?.slotsPaid}
              onChange={() => {
                updateUsaSlots(lead.id, { slotsPaid: !lead.usaSlots?.slotsPaid });
              }}
              className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
              Fee Paid Date
            </label>
            <input
              type="date"
              value={lead.usaSlots?.paidDate || ""}
              onChange={(e) => {
                updateUsaSlots(lead.id, { paidDate: e.target.value });
              }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none"
            />
          </div>
        </section>

        {/* Portal credentials */}
        <section className="space-y-3 border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Portal Credentials</h4>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Username</label>
            <input
              type="text"
              value={credUsername}
              onChange={(e) => setCredUsername(e.target.value)}
              placeholder="e.g. V2486037"
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Password</label>
            <input
              type="text"
              value={credPassword}
              onChange={(e) => setCredPassword(e.target.value)}
              placeholder="Portal password"
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <button
            type="button"
            disabled={savingCreds}
            onClick={handleSaveCredentials}
            className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 font-bold text-white text-xs rounded-xl cursor-pointer transition-colors"
          >
            {savingCreds ? "Saving…" : "Save Credentials"}
          </button>
        </section>

        {/* DS-160 security answers */}
        <section className="space-y-3 border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
            DS-160 Security Answers
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Car</label>
              <input
                type="text"
                value={securityCar}
                onChange={(e) => setSecurityCar(e.target.value)}
                placeholder="e.g. BMW"
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Food</label>
              <input
                type="text"
                value={securityFood}
                onChange={(e) => setSecurityFood(e.target.value)}
                placeholder="e.g. FISH"
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">City</label>
              <input
                type="text"
                value={securityCity}
                onChange={(e) => setSecurityCity(e.target.value)}
                placeholder="e.g. MUMBAI"
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveSecurity}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 text-xs rounded-xl cursor-pointer transition-colors"
          >
            Save Security Answers
          </button>
        </section>

        {/* Slot workflow */}
        <section className="space-y-3 border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Slot Workflow</h4>
          {(
            [
              { key: "credentialsProvided", label: "Credentials Provided by Client" },
              { key: "ds160Submitted", label: "DS-160 Form Dispatched" },
              { key: "slotsPaid", label: "Embassy Visa Fee Paid" },
              { key: "slotsBooked", label: "Visa Slot Booked" },
            ] as const
          ).map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 bg-slate-950 border border-slate-900 rounded-xl"
            >
              <span className="font-semibold text-slate-300 text-xs">{item.label}</span>
              <input
                type="checkbox"
                checked={!!lead.usaSlots?.[item.key]}
                onChange={() => {
                  updateUsaSlots(lead.id, {
                    [item.key]: !lead.usaSlots?.[item.key],
                  });
                }}
                className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
              />
            </div>
          ))}
          <div className="space-y-1.5 pt-1">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">
              Consulate Interview Details
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={lead.usaSlots?.interviewDate || ""}
                onChange={(e) => {
                  updateUsaSlots(lead.id, {
                    interviewDate: e.target.value,
                    interviewScheduled: !!e.target.value,
                    slotsBooked: !!e.target.value,
                  });
                }}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none"
              />
              <select
                value={lead.usaSlots?.slotLocation || "Delhi"}
                onChange={(e) => {
                  updateUsaSlots(lead.id, { slotLocation: e.target.value });
                }}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none"
              >
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function USASlotsTab() {
  const {
    leads,
    selectedLeadId,
    setSelectedLeadId,
    isMobileSlotSettingsOpen,
    setIsMobileSlotSettingsOpen,
    selectedLead,
    updateUsaSlots,
    setLeadCredentials,
    showToast,
  } = useCrmLayoutContext();

  const usaLeads = useMemo(
    () => leads.filter((l) => l.country === "USA" && l.status !== "Dropped"),
    [leads]
  );

  const paidClients = useMemo(
    () =>
      usaLeads
        .filter((l) => l.usaSlots?.slotsPaid)
        .sort((a, b) => (b.usaSlots?.paidDate || "").localeCompare(a.usaSlots?.paidDate || "")),
    [usaLeads]
  );

  const confirmedSlots = usaLeads.filter((l) => l.usaSlots?.interviewScheduled).length;

  const openSlotSettings = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setIsMobileSlotSettingsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1">USA Embassy Slot Coordinator</h3>
          <p className="text-xs text-slate-400">
            Track DS-160 applications, embassy fees, portal credentials, and booked interviews.
          </p>
        </div>
        <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 font-extrabold text-sm rounded-xl">
          {confirmedSlots} Confirmed Slots
        </div>
      </div>

      {paidClients.length > 0 && (
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Paid Dates</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {paidClients.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => openSlotSettings(lead)}
                className="w-full text-left p-3 bg-slate-950 border border-slate-900 rounded-xl hover:border-violet-500/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{lead.name}</p>
                    <p className="text-xs text-slate-400">{lead.phone || "—"}</p>
                  </div>
                  {lead.usaSlots?.paidDate ? (
                    <span className="text-[11px] font-medium text-emerald-400 whitespace-nowrap">
                      {formatDisplayDate(lead.usaSlots.paidDate)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-400">Paid</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <DataTable
        title="USA Client Profiles"
        pagination={true}
        defaultPageSize={8}
        rows={usaLeads}
        getRowId={(l) => l.id}
        onRowClick={openSlotSettings}
        selectedRowId={selectedLeadId}
        columns={[
          {
            header: "Client",
            render: (lead) => (
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-gray-900 dark:text-slate-100 text-[13px]">{lead.name}</span>
                <span className="text-gray-500 dark:text-slate-400 text-[11px]">{lead.phone || "—"}</span>
              </div>
            ),
          },
          {
            header: "Username",
            render: (lead) => (
              <span className="text-gray-600 dark:text-slate-300 font-medium text-[12px] font-mono">
                {lead.visaCredentials?.username || "—"}
              </span>
            ),
          },
          {
            header: "Password",
            render: (lead) =>
              lead.visaCredentials?.password ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-slate-400 text-[12px] tracking-widest">••••••••</span>
                  <button
                    type="button"
                    data-tooltip="Copy password"
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        navigator.clipboard.writeText(lead.visaCredentials?.password || "");
                        showToast("Password copied");
                      } catch {
                        showToast("Copied", "success");
                      }
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                  >
                    <FiLock className="text-[13.5px]" />
                  </button>
                </div>
              ) : (
                <span className="text-gray-400 dark:text-slate-500 text-[11px]">—</span>
              ),
          },
          {
            header: "Car",
            render: (lead) => (
              <span className="text-gray-600 dark:text-slate-300 text-[12px]">
                {lead.usaSlots?.securityCar || "—"}
              </span>
            ),
          },
          {
            header: "Food",
            render: (lead) => (
              <span className="text-gray-600 dark:text-slate-300 text-[12px]">
                {lead.usaSlots?.securityFood || "—"}
              </span>
            ),
          },
          {
            header: "City",
            render: (lead) => (
              <span className="text-gray-600 dark:text-slate-300 text-[12px]">
                {lead.usaSlots?.securityCity || "—"}
              </span>
            ),
          },
          {
            header: "Paid",
            render: (lead) => (
              <div className="flex flex-col gap-0.5">
                <span
                  className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${paidBadge(!!lead.usaSlots?.slotsPaid)}`}
                >
                  {lead.usaSlots?.slotsPaid ? "Paid" : "Unpaid"}
                </span>
                {lead.usaSlots?.paidDate ? (
                  <span className="text-gray-500 dark:text-slate-400 text-[10px]">
                    {formatDisplayDate(lead.usaSlots.paidDate)}
                  </span>
                ) : null}
              </div>
            ),
          },
          {
            header: "Interview",
            render: (lead) => (
              <span className="text-gray-600 dark:text-slate-300 font-medium text-[12px] whitespace-nowrap">
                {lead.usaSlots?.interviewScheduled && lead.usaSlots.interviewDate
                  ? formatDisplayDate(lead.usaSlots.interviewDate)
                  : "N/A"}
              </span>
            ),
          },
          {
            header: "Status",
            render: (lead) => (
              <span
                className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${interviewBadge(!!lead.usaSlots?.slotsBooked)}`}
              >
                {lead.usaSlots?.slotsBooked ? "Booked" : "No Booking"}
              </span>
            ),
          },
        ]}
        actions={(lead) => [
          {
            icon: FiSettings,
            title: "Edit slot",
            onClick: openSlotSettings,
          },
          { icon: FiPhone, title: "Call", onClick: (l) => window.open(`tel:${l.phone}`) },
          { icon: FiMail, title: "Email", onClick: (l) => window.open(`mailto:${l.email}`) },
        ]}
        emptyText="No USA leads yet."
      />

      {isMobileSlotSettingsOpen && selectedLead?.country === "USA" && (
        <UsaSlotSettingsModal
          lead={selectedLead}
          onClose={() => setIsMobileSlotSettingsOpen(false)}
          updateUsaSlots={updateUsaSlots}
          setLeadCredentials={setLeadCredentials}
          showToast={showToast}
        />
      )}
    </div>
  );
}
