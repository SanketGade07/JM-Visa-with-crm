"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Lead } from "@/context/CrmContext";
import { FaTimes, FaTrash, FaCar, FaUtensils, FaCity } from "react-icons/fa";
import { FiSettings, FiPhone, FiMail, FiCopy, FiUser, FiLock, FiSmartphone } from "react-icons/fi";
import DataTable, { exportRowsToCsv } from "@/components/ui/DataTable";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import { useUsaSlotTabs } from "@/hooks/useUsaSlotTabs";
import { useColumnSearch } from "@/hooks/useColumnSearch";
import { applyColumnSearch } from "@/utils/columnSearch";

// function formatDisplayDate(iso: string): string {
//   if (!iso) return "";
//   try {
//     return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   } catch {
//     return iso;
//   }
// }

// function paidBadge(slotsPaid: boolean) {
//   return slotsPaid
//     ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
//     : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
// }

// function interviewBadge(booked: boolean) {
//   return booked
//     ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
//     : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
// }

function CopyableCredentialCell({
  value,
  label,
  showToast,
  icon,
  variant = "gray",
}: {
  value: string | undefined;
  label: string;
  showToast: ReturnType<typeof useCrmLayoutContext>["showToast"];
  icon?: React.ReactNode;
  variant?: "blue" | "gray";
}) {
  if (!value) {
    return <span className="text-gray-400 dark:text-slate-500 text-[11px]">—</span>;
  }

  const btnClassName = variant === "blue"
    ? "w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
    : "w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer";

  return (
    <div className="inline-flex items-center gap-0.5 max-w-full min-w-0">
      <span className="text-gray-600 dark:text-slate-300 font-medium text-[12px] font-mono truncate min-w-0">
        {value}
      </span>
      <button
        type="button"
        data-tooltip={`Copy ${label}`}
        onClick={(e) => {
          e.stopPropagation();
          try {
            navigator.clipboard.writeText(value);
            showToast(`${label} copied`);
          } catch {
            showToast("Copied", "success");
          }
        }}
        className={btnClassName}
      >
        {icon || <FiCopy className="text-[13px]" />}
      </button>
    </div>
  );
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
  const [slotPortalUsername, setSlotPortalUsername] = useState(
    lead.usaSlots?.slotPortalUsername ?? ""
  );
  const [slotPortalPassword, setSlotPortalPassword] = useState(
    lead.usaSlots?.slotPortalPassword ?? ""
  );
  const [savingSlotPortal, setSavingSlotPortal] = useState(false);
  const [securityCar, setSecurityCar] = useState(lead.usaSlots?.securityCar ?? "");
  const [securityFood, setSecurityFood] = useState(lead.usaSlots?.securityFood ?? "");
  const [securityCity, setSecurityCity] = useState(lead.usaSlots?.securityCity ?? "");
  const [trackingMobile, setTrackingMobile] = useState(lead.usaSlots?.trackingMobile ?? "");

  useEffect(() => {
    setCredUsername(lead.visaCredentials?.username ?? "");
    setCredPassword(lead.visaCredentials?.password ?? "");
    setSecurityCar(lead.usaSlots?.securityCar ?? "");
    setSecurityFood(lead.usaSlots?.securityFood ?? "");
    setSecurityCity(lead.usaSlots?.securityCity ?? "");
    setTrackingMobile(lead.usaSlots?.trackingMobile ?? "");
  }, [lead.id, lead.visaCredentials, lead.usaSlots]);

  useEffect(() => {
    setSlotPortalUsername(lead.usaSlots?.slotPortalUsername ?? "");
    setSlotPortalPassword(lead.usaSlots?.slotPortalPassword ?? "");
  }, [lead.id, lead.usaSlots?.slotPortalUsername, lead.usaSlots?.slotPortalPassword]);

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

  const handleSaveSlotPortal = () => {
    setSavingSlotPortal(true);
    updateUsaSlots(lead.id, {
      slotPortalUsername: slotPortalUsername.trim(),
      slotPortalPassword: slotPortalPassword.trim(),
    });
    setSavingSlotPortal(false);
    showToast("Slot portal credentials saved", "success");
  };

  const handleSaveSecurity = () => {
    updateUsaSlots(lead.id, {
      securityCar: securityCar.trim(),
      securityFood: securityFood.trim(),
      securityCity: securityCity.trim(),
      trackingMobile: trackingMobile.trim(),
    });
    showToast("Security answers & mobile saved", "success");
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Paid Dates */}
        {/* <section className="space-y-3">
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
        </section> */}

        {/* Visa portal credentials */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Visa Portal</h4>
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

        {/* Slot portal credentials */}
        <section className="space-y-3 border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Slot Portal</h4>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Username</label>
            <input
              type="text"
              value={slotPortalUsername}
              onChange={(e) => setSlotPortalUsername(e.target.value)}
              placeholder="Slot portal username"
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Password</label>
            <input
              type="text"
              value={slotPortalPassword}
              onChange={(e) => setSlotPortalPassword(e.target.value)}
              placeholder="Slot portal password"
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <button
            type="button"
            disabled={savingSlotPortal}
            onClick={handleSaveSlotPortal}
            className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 font-bold text-white text-xs rounded-xl cursor-pointer transition-colors"
          >
            {savingSlotPortal ? "Saving…" : "Save Slot Portal"}
          </button>
        </section>

        {/* DS-160 security answers & mobile */}
        <section className="space-y-4 border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
            DS-160 Security & Mobile
          </h4>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Tracking Mobile</label>
              <input
                type="text"
                value={trackingMobile}
                onChange={(e) => setTrackingMobile(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          </div>
          <button
            type="button"
            onClick={handleSaveSecurity}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 text-xs rounded-xl cursor-pointer transition-colors"
          >
            Save Security & Mobile
          </button>
        </section>

        {/* Slot workflow */}
        <section className="space-y-3 border-t border-slate-800 pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Slot Workflow</h4>
          {(
            [
              { key: "credentialsProvided", label: "Credentials Provided by Client" },
              { key: "ds160Submitted", label: "DS-160 Form Dispatched" },
              // { key: "slotsPaid", label: "Embassy Visa Fee Paid" },
              // { key: "slotsBooked", label: "Visa Slot Booked" },
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
          {/* <div className="space-y-1.5 pt-1">
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
          </div> */}
        </section>
      </div>
    </div>
  );
}

export function USASlotsTab() {
  const {
    setSelectedLeadId,
    isMobileSlotSettingsOpen,
    setIsMobileSlotSettingsOpen,
    selectedLead,
    updateUsaSlots,
    setLeadCredentials,
    showToast,
    openLeadDetail,
    registerUsaSlotsExport,
    canModifyLeads,
    deleteLead,
    deleteLeads,
    showConfirm,
    showAlert,
    isAdmin,
  } = useCrmLayoutContext();

  const { usaLeads, filteredUsaLeads } = useUsaSlotTabs();
  const columnSearch = useColumnSearch();

  const clientSearchGetter = useMemo(
    () => (lead: Lead) =>
      [lead.name, lead.phone, lead.email].filter(Boolean).join(" "),
    []
  );

  const tableRows = useMemo(
    () =>
      applyColumnSearch(
        filteredUsaLeads,
        [{ searchKey: "client", getSearchValue: clientSearchGetter }],
        columnSearch.debouncedFilters
      ),
    [filteredUsaLeads, clientSearchGetter, columnSearch.debouncedFilters]
  );

  useEffect(() => {
    registerUsaSlotsExport(() =>
      exportRowsToCsv(
        "usa-slots",
        ["Client", "Phone", "Visa User", "Visa Pass", "Slot User", "Slot Pass", "Mobile", "Car", "Food", "City"],
        usaLeads.map((l) => [
          l.name,
          l.phone ?? "",
          l.visaCredentials?.username ?? "",
          l.visaCredentials?.password ?? "",
          l.usaSlots?.slotPortalUsername ?? "",
          l.usaSlots?.slotPortalPassword ?? "",
          l.usaSlots?.trackingMobile ?? "",
          l.usaSlots?.securityCar ?? "",
          l.usaSlots?.securityFood ?? "",
          l.usaSlots?.securityCity ?? "",
        ])
      )
    );
    return () => registerUsaSlotsExport(null);
  }, [registerUsaSlotsExport, usaLeads]);

  const openSlotSettings = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setIsMobileSlotSettingsOpen(true);
  };

  return (
    <div className="-m-4 md:-m-8 pt-0 pl-0 pr-0 pb-4 md:pt-0 md:pl-0 md:pr-0 md:pb-6 space-y-6">
      <DataTable
        borderless={true}
        pagination={true}
        defaultPageSize={10}
        showToolbar={false}
        columnSearch={columnSearch}
        rows={tableRows}
        getRowId={(l) => l.id}
        columns={[
          {
            header: "Client",
            searchKey: "client",
            searchLabel: "Client",
            getSearchValue: clientSearchGetter,
            render: (lead) => (
              <div className="flex flex-col gap-0.5 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLeadDetail(lead.id);
                  }}
                  className="font-semibold text-gray-900 dark:text-slate-100 text-[13px] truncate text-left hover:text-violet-600 dark:hover:text-violet-400 hover:underline cursor-pointer transition-colors"
                >
                  {lead.name}
                </button>
                <span className="text-gray-500 dark:text-slate-400 text-[11px]">{lead.phone || "—"}</span>
              </div>
            ),
          },
          {
            header: "Visa User",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.visaCredentials?.username}
                label="Visa username"
                showToast={showToast}
                icon={<FiUser className="text-[13.5px]" />}
              />
            ),
          },
          {
            header: "Visa Pass",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.visaCredentials?.password}
                label="Visa password"
                showToast={showToast}
                icon={<FiLock className="text-[13.5px]" />}
              />
            ),
          },
          {
            header: "Slot User",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.usaSlots?.slotPortalUsername}
                label="Slot username"
                showToast={showToast}
                icon={<FiUser className="text-[13.5px]" />}
                variant="blue"
              />
            ),
          },
          {
            header: "Slot Pass",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.usaSlots?.slotPortalPassword}
                label="Slot password"
                showToast={showToast}
                icon={<FiLock className="text-[13.5px]" />}
                variant="blue"
              />
            ),
          },
          {
            header: "Mobile",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.usaSlots?.trackingMobile}
                label="Tracking mobile"
                showToast={showToast}
                icon={<FiSmartphone className="text-[13.5px]" />}
                variant="blue"
              />
            ),
          },
          {
            header: "Car",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.usaSlots?.securityCar}
                label="Car"
                showToast={showToast}
                icon={<FaCar className="text-[12.5px]" />}
                variant="blue"
              />
            ),
          },
          {
            header: "Food",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.usaSlots?.securityFood}
                label="Food"
                showToast={showToast}
                icon={<FaUtensils className="text-[12px]" />}
                variant="blue"
              />
            ),
          },
          {
            header: "City",
            render: (lead) => (
              <CopyableCredentialCell
                value={lead.usaSlots?.securityCity}
                label="City"
                showToast={showToast}
                icon={<FaCity className="text-[12px]" />}
                variant="blue"
              />
            ),
          },
          // {
          //   header: "Paid",
          //   render: (lead) => (
          //     <div className="flex flex-col gap-0.5">
          //       <span
          //         className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${paidBadge(!!lead.usaSlots?.slotsPaid)}`}
          //       >
          //         {lead.usaSlots?.slotsPaid ? "Paid" : "Unpaid"}
          //       </span>
          //       {lead.usaSlots?.paidDate ? (
          //         <span className="text-gray-500 dark:text-slate-400 text-[10px]">
          //           {formatDisplayDate(lead.usaSlots.paidDate)}
          //         </span>
          //       ) : null}
          //     </div>
          //   ),
          // },
          // {
          //   header: "Interview",
          //   render: (lead) => (
          //     <span className="text-gray-600 dark:text-slate-300 font-medium text-[12px] whitespace-nowrap">
          //       {lead.usaSlots?.interviewScheduled && lead.usaSlots.interviewDate
          //         ? formatDisplayDate(lead.usaSlots.interviewDate)
          //         : "N/A"}
          //     </span>
          //   ),
          // },
          // {
          //   header: "Status",
          //   render: (lead) => (
          //     <span
          //       className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${interviewBadge(!!lead.usaSlots?.slotsBooked)}`}
          //     >
          //       {lead.usaSlots?.slotsBooked ? "Booked" : "No Booking"}
          //     </span>
          //   ),
          // },
        ]}
        actions={(lead) => [
          {
            icon: FiSettings,
            title: "Slot settings",
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
