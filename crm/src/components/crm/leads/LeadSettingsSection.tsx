"use client";

import React, { useEffect, useState } from "react";
import type { Lead } from "@/context/CrmContext";
import {
  DEFAULT_EMPLOYMENT_CATEGORY,
  getChecklistKeysForLead,
} from "@/utils/documentChecklistConfig";
import {
  FiCalendar,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiGlobe,
  FiLink,
  FiMail,
  FiUser,
} from "react-icons/fi";
import { FaCoins } from "react-icons/fa";
import {
  DRIVE_BORDER,
  DRIVE_BTN_PRIMARY,
  DRIVE_INPUT,
  DRIVE_TEXT_MUTED,
  DRIVE_TEXT_SECONDARY,
} from "../drive/driveTheme";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

type LeadSettingsSectionProps = {
  lead: Lead;
};

function formatDisplayDate(iso: string): string {
  if (!iso) return "—";
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

function SettingsCard({
  title,
  badge,
  children,
  className = "",
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
          {title}
        </h2>
        {badge ? (
          <span className="inline-flex items-center rounded-full border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 flex items-center justify-center shrink-0">
        <Icon className="text-sm text-blue-600 dark:text-blue-400" />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 block">
          {label}
        </span>
        <span className="text-[13px] font-semibold text-gray-800 dark:text-slate-100 block mt-1 truncate">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accentClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  accentClass: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${accentClass}`}
        >
          <Icon className="text-base" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 block">
            {label}
          </span>
          <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums mt-0.5 block">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

const fieldLabelCls =
  "text-gray-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider block";
const fieldInputCls =
  "w-full bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed";

export function LeadSettingsSection({ lead }: LeadSettingsSectionProps) {
  const { setLeadCredentials, showToast, canEditCredentials } = useCrmLayoutContext();

  const employmentCategory = lead.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY;
  const activeKeys = getChecklistKeysForLead(employmentCategory);
  const verifiedCount = activeKeys.filter((key) => lead.checklist[key]).length;
  const totalCount = activeKeys.length;

  const [credUsername, setCredUsername] = useState(lead.visaCredentials?.username ?? "");
  const [credPassword, setCredPassword] = useState(lead.visaCredentials?.password ?? "");
  const [credPortalUrl, setCredPortalUrl] = useState(lead.visaCredentials?.portalUrl ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);

  useEffect(() => {
    setCredUsername(lead.visaCredentials?.username ?? "");
    setCredPassword(lead.visaCredentials?.password ?? "");
    setCredPortalUrl(lead.visaCredentials?.portalUrl ?? "");
    setShowPassword(false);
  }, [lead.id, lead.visaCredentials]);

  const handleSaveCredentials = async () => {
    setSavingCreds(true);
    const ok = await setLeadCredentials(lead.id, {
      username: credUsername.trim() || undefined,
      password: credPassword.trim() || undefined,
      portalUrl: credPortalUrl.trim() || undefined,
    });
    setSavingCreds(false);
    showToast(
      ok ? "Portal credentials saved" : "Failed to save credentials",
      ok ? "success" : "error"
    );
  };

  return (
    <div className="space-y-6">
      <SettingsCard title="Lead Profile">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <ProfileField icon={FiMail} label="Email" value={lead.email} />
          <ProfileField icon={FiGlobe} label="Destination Country" value={lead.country} />
          <ProfileField
            icon={FiCalendar}
            label="Date Created"
            value={formatDisplayDate(lead.dateCreated)}
          />
          <ProfileField icon={FiFileText} label="Visa Service Type" value={lead.visaType} />
          <ProfileField icon={FiUser} label="Assigned Counselor" value={lead.counselor} />
        </div>
      </SettingsCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={FiFileText}
          label="Documents Verified"
          value={`${verifiedCount}/${totalCount}`}
          accentClass="border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={FaCoins}
          label="Payments"
          value={lead.payments.length}
          accentClass="border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SettingsCard title="Visa Portal Credentials">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={fieldLabelCls} htmlFor={`cred-username-${lead.id}`}>
                  Username
                </label>
                <input
                  id={`cred-username-${lead.id}`}
                  type="text"
                  value={credUsername}
                  onChange={(e) => setCredUsername(e.target.value)}
                  disabled={!canEditCredentials}
                  placeholder="e.g. V2486037"
                  className={fieldInputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelCls} htmlFor={`cred-password-${lead.id}`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id={`cred-password-${lead.id}`}
                    type={showPassword ? "text" : "password"}
                    value={credPassword}
                    onChange={(e) => setCredPassword(e.target.value)}
                    disabled={!canEditCredentials}
                    placeholder="Portal password"
                    className={`${fieldInputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={!canEditCredentials}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FiEyeOff className="text-sm" />
                    ) : (
                      <FiEye className="text-sm" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelCls} htmlFor={`cred-portal-${lead.id}`}>
                  Portal URL
                </label>
                <input
                  id={`cred-portal-${lead.id}`}
                  type="url"
                  value={credPortalUrl}
                  onChange={(e) => setCredPortalUrl(e.target.value)}
                  disabled={!canEditCredentials}
                  placeholder="https://…"
                  className={fieldInputCls}
                />
              </div>

              <button
                type="button"
                disabled={!canEditCredentials || savingCreds}
                onClick={() => void handleSaveCredentials()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold text-white text-xs rounded-xl cursor-pointer transition-colors"
              >
                {savingCreds ? "Saving…" : "Save Credentials"}
              </button>

              <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                Updates the lead&apos;s visa portal login used by the USA slots workflow.
              </p>
            </div>
        </SettingsCard>

        <SettingsCard title="Drive Storage">
            <div className="space-y-4 opacity-70 pointer-events-none select-none">
              <p className={`text-xs ${DRIVE_TEXT_SECONDARY} leading-relaxed`}>
                Paste a Google Drive folder URL or ID to link this lead&apos;s document storage.
              </p>

              <div>
                <label
                  htmlFor={`lead-drive-folder-${lead.id}`}
                  className={`block text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${DRIVE_TEXT_SECONDARY}`}
                >
                  Folder URL or ID
                </label>
                <input
                  id={`lead-drive-folder-${lead.id}`}
                  type="text"
                  disabled
                  placeholder="Paste Drive folder URL or ID…"
                  className={`w-full text-sm py-2.5 px-4 shadow-sm ${DRIVE_INPUT}`}
                />
              </div>

              <button type="button" disabled className={`${DRIVE_BTN_PRIMARY} w-full justify-center`}>
                <FiLink className="text-xs" />
                Validate &amp; Link
              </button>

              <p className={`text-[11px] ${DRIVE_TEXT_MUTED} leading-relaxed border-t ${DRIVE_BORDER} pt-3`}>
                Per-lead folder linking will override where this lead&apos;s files are stored once
                available.
              </p>
            </div>
        </SettingsCard>
      </div>
    </div>
  );
}
