"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Lead } from "@/context/CrmContext";
import {
  DEFAULT_EMPLOYMENT_CATEGORY,
  getChecklistKeysForLead,
} from "@/utils/documentChecklistConfig";
import {
  getCountrySelectOptions,
  getVisaServiceSelectOptions,
} from "@/utils/leadFilterOptions";
import { CounselorSelectPill } from "@/components/ui/CounselorSelectPill";
import { SearchableFilterSelect } from "@/components/ui/FormInputs";
import {
  FiCalendar,
  FiCopy,
  FiExternalLink,
  FiFileText,
  FiGlobe,
  FiLink,
  FiMail,
  FiUser,
} from "react-icons/fi";
import {
  FaCheckCircle,
  FaCoins,
  FaFolder,
  FaSpinner,
  FaUnlink,
} from "react-icons/fa";
import {
  DRIVE_ACCENT_TEXT,
  DRIVE_BORDER,
  DRIVE_BTN_PRIMARY,
  DRIVE_BTN_SECONDARY,
  DRIVE_INPUT,
  DRIVE_SURFACE_SECONDARY,
  DRIVE_TEXT_MUTED,
  DRIVE_TEXT_PRIMARY,
  DRIVE_TEXT_SECONDARY,
} from "../drive/driveTheme";
import { extractFolderId, parseApiError } from "../drive/driveUtils";
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
/** Profile email: inner bg only — synced with dropdowns via settings field theme vars. */
const profileEmailInputCls = `${fieldInputCls} profile-email-input bg-transparent dark:bg-transparent`;
const profileSelectWrapperCls = "w-full profile-select-wrapper";

const SETTINGS_PROFILE_FIELD_THEME_CSS = `
  .lead-settings-profile-fields {
    --settings-field-bg: rgba(30, 41, 59, 0.4);
    --settings-field-border: #334155;
    --settings-field-text: #e2e8f0;
  }
  html.light .lead-settings-profile-fields {
    --settings-field-bg: #ffffff;
    --settings-field-border: #e5e7eb;
    --settings-field-text: #374151;
  }
  .lead-settings-profile-fields .profile-email-input {
    background-color: var(--settings-field-bg) !important;
  }
  .lead-settings-profile-fields .profile-select-wrapper .filter-react-select {
    width: 100%;
  }
  .lead-settings-profile-fields .profile-select-wrapper .filter-select__control {
    min-height: 40px !important;
    height: 40px !important;
    width: 100% !important;
    min-width: 100% !important;
    background-color: var(--settings-field-bg) !important;
    border-color: var(--settings-field-border) !important;
    border-radius: 0.75rem !important;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
    font-size: 12px !important;
    font-weight: 600 !important;
  }
  .lead-settings-profile-fields .profile-select-wrapper .filter-select__control--is-focused {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
  }
  .lead-settings-profile-fields .profile-select-wrapper .filter-select__single-value,
  .lead-settings-profile-fields .profile-select-wrapper .filter-select__placeholder {
    color: var(--settings-field-text) !important;
    font-size: 12px !important;
    font-weight: 600 !important;
  }
  .lead-settings-profile-fields .profile-select-wrapper .filter-select__value-container {
    padding: 0 12px !important;
  }
  .lead-settings-profile-fields .profile-counselor-select .table-pill-select button {
    background-color: var(--settings-field-bg) !important;
    border-color: var(--settings-field-border) !important;
    color: var(--settings-field-text) !important;
  }
`;

function CopyField({
  id,
  label,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder,
  onCopied,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  onCopied: () => void;
}) {
  const handleCopy = () => {
    if (!value.trim()) return;
    try {
      void navigator.clipboard.writeText(value);
      onCopied();
    } catch {
      onCopied();
    }
  };

  return (
    <div className="space-y-1.5">
      <label className={fieldLabelCls} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`${fieldInputCls} pr-10`}
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={disabled || !value.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          <FiCopy className="text-sm" />
        </button>
      </div>
    </div>
  );
}

function EditableProfileField({
  icon: Icon,
  label,
  htmlFor,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 flex items-center justify-center shrink-0">
          <Icon className="text-sm text-blue-600 dark:text-blue-400" />
        </div>
        <label className={fieldLabelCls} htmlFor={htmlFor}>
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

export function LeadSettingsSection({ lead }: LeadSettingsSectionProps) {
  const {
    leads,
    setLeadCredentials,
    setLeadDriveFolder,
    patchLeadDriveFolder,
    showToast,
    canEditCredentials,
    canModifyLeads,
    updateLeadProfile,
    assignCounselor,
    currentRole,
  } = useCrmLayoutContext();

  const isAdmin = currentRole === "ADMIN";
  const canManageDrive = isAdmin;

  const countryOptions = useMemo(() => getCountrySelectOptions(), []);
  const visaServiceOptions = useMemo(
    () => getVisaServiceSelectOptions(leads, lead.visaType),
    [leads, lead.visaType]
  );

  const [emailDraft, setEmailDraft] = useState(lead.email);

  useEffect(() => {
    setEmailDraft(lead.email);
  }, [lead.id, lead.email]);

  const employmentCategory = lead.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY;
  const activeKeys = getChecklistKeysForLead(employmentCategory);
  const verifiedCount = activeKeys.filter((key) => lead.checklist[key]).length;
  const totalCount = activeKeys.length;

  const [credUsername, setCredUsername] = useState(lead.visaCredentials?.username ?? "");
  const [credPassword, setCredPassword] = useState(lead.visaCredentials?.password ?? "");
  const [credPortalUrl, setCredPortalUrl] = useState(lead.visaCredentials?.portalUrl ?? "");
  const [savingCreds, setSavingCreds] = useState(false);

  useEffect(() => {
    setCredUsername(lead.visaCredentials?.username ?? "");
    setCredPassword(lead.visaCredentials?.password ?? "");
    setCredPortalUrl(lead.visaCredentials?.portalUrl ?? "");
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

  const [folderInput, setFolderInput] = useState("");
  const [linkedFolderName, setLinkedFolderName] = useState<string | null>(null);
  const [isValidatingFolder, setIsValidatingFolder] = useState(false);
  const [isUnlinkingFolder, setIsUnlinkingFolder] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  useEffect(() => {
    setFolderInput("");
    setConfirmUnlink(false);
    if (!lead.driveFolderId) {
      setLinkedFolderName(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/drive/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: lead.driveFolderId }),
        });
        if (res.ok && !cancelled) {
          const data = await res.json();
          setLinkedFolderName((data.folderName as string) || null);
        }
      } catch {
        if (!cancelled) setLinkedFolderName(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lead.id, lead.driveFolderId]);

  const handleValidateAndLink = async () => {
    if (!folderInput.trim()) {
      showToast("Enter a Drive folder URL or ID", "error");
      return;
    }
    setIsValidatingFolder(true);
    try {
      const folderId = extractFolderId(folderInput);
      const validateRes = await fetch("/api/drive/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (!validateRes.ok) {
        showToast(await parseApiError(validateRes), "error");
        return;
      }
      const validated = await validateRes.json();
      const ok = await setLeadDriveFolder(lead.id, validated.folderId as string);
      if (!ok) {
        showToast("Failed to link Drive folder", "error");
        return;
      }
      setLinkedFolderName((validated.folderName as string) || null);
      setFolderInput("");
      setConfirmUnlink(false);
      showToast(
        `Linked folder: ${(validated.folderName as string) || validated.folderId}`,
        "success"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Validation failed", "error");
    } finally {
      setIsValidatingFolder(false);
    }
  };

  const handleUnlinkFolder = async () => {
    setIsUnlinkingFolder(true);
    try {
      const ok = await setLeadDriveFolder(lead.id, null);
      if (!ok) {
        showToast("Failed to unlink Drive folder", "error");
        return;
      }
      setLinkedFolderName(null);
      setFolderInput("");
      setConfirmUnlink(false);
      showToast("Drive folder unlinked", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unlink failed", "error");
    } finally {
      setIsUnlinkingFolder(false);
    }
  };

  const handleCreateDriveFolder = async () => {
    setIsCreatingFolder(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/drive-create`, {
        method: "POST",
      });
      if (!res.ok) {
        showToast(await parseApiError(res), "error");
        return;
      }
      const data = await res.json();
      const folderId = data.driveFolderId as string;
      const folderName = (data.folderName as string) || lead.name;
      patchLeadDriveFolder(lead.id, folderId);
      setLinkedFolderName(folderName);
      setFolderInput("");
      showToast(`Drive folder created: ${folderName}`, "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to create Drive folder",
        "error"
      );
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const driveFolderUrl = lead.driveFolderId
    ? `https://drive.google.com/drive/folders/${lead.driveFolderId}`
    : null;

  const handleEmailSave = () => {
    const trimmed = emailDraft.trim();
    if (trimmed === lead.email) return;
    updateLeadProfile(lead.id, { email: trimmed });
    showToast("Profile updated", "success");
  };

  return (
    <div className="space-y-6">
      <SettingsCard title="Lead Profile">
        <style>{SETTINGS_PROFILE_FIELD_THEME_CSS}</style>
        <div className="lead-settings-profile-fields grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <EditableProfileField icon={FiMail} label="Email" htmlFor={`profile-email-${lead.id}`}>
            <input
              id={`profile-email-${lead.id}`}
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              onBlur={() => handleEmailSave()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              disabled={!canModifyLeads}
              placeholder="lead@example.com"
              className={profileEmailInputCls}
            />
          </EditableProfileField>

          <EditableProfileField icon={FiGlobe} label="Destination Country">
            <div
              className={`${profileSelectWrapperCls}${!canModifyLeads ? " opacity-60 pointer-events-none" : ""}`}
            >
              <SearchableFilterSelect
                value={lead.country}
                onChange={(country) => {
                  if (!country || country === lead.country) return;
                  updateLeadProfile(lead.id, { country });
                  showToast("Profile updated", "success");
                }}
                options={countryOptions}
                placeholder="Select country…"
                portalId={`settings-country-${lead.id}`}
                clearValue={lead.country}
              />
            </div>
          </EditableProfileField>

          <ProfileField
            icon={FiCalendar}
            label="Date Created"
            value={formatDisplayDate(lead.dateCreated)}
          />

          <EditableProfileField icon={FiFileText} label="Visa Service Type">
            <div
              className={`${profileSelectWrapperCls}${!canModifyLeads ? " opacity-60 pointer-events-none" : ""}`}
            >
              <SearchableFilterSelect
                value={lead.visaType}
                onChange={(visaType) => {
                  if (!visaType || visaType === lead.visaType) return;
                  updateLeadProfile(lead.id, { visaType });
                  showToast("Profile updated", "success");
                }}
                options={visaServiceOptions}
                placeholder="Select service type…"
                portalId={`settings-visa-type-${lead.id}`}
                clearValue={lead.visaType}
              />
            </div>
          </EditableProfileField>

          <EditableProfileField icon={FiUser} label="Assigned Counselor">
            <div className="profile-counselor-select w-full">
              <CounselorSelectPill
                variant="field"
                value={lead.counselor}
                disabled={!canModifyLeads}
                portalId={`settings-counselor-${lead.id}`}
                onChange={(counselor) => {
                  if (counselor === lead.counselor) return;
                  assignCounselor(lead.id, counselor);
                  showToast("Profile updated", "success");
                }}
              />
            </div>
          </EditableProfileField>
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
              <CopyField
                id={`cred-username-${lead.id}`}
                label="Username"
                value={credUsername}
                onChange={(e) => setCredUsername(e.target.value)}
                disabled={!canEditCredentials}
                placeholder="e.g. V2486037"
                onCopied={() => showToast("Copied to clipboard", "success")}
              />

              <CopyField
                id={`cred-password-${lead.id}`}
                label="Password"
                type="text"
                value={credPassword}
                onChange={(e) => setCredPassword(e.target.value)}
                disabled={!canEditCredentials}
                placeholder="Portal password"
                onCopied={() => showToast("Copied to clipboard", "success")}
              />

              <CopyField
                id={`cred-portal-${lead.id}`}
                label="Portal URL"
                type="url"
                value={credPortalUrl}
                onChange={(e) => setCredPortalUrl(e.target.value)}
                disabled={!canEditCredentials}
                placeholder="https://…"
                onCopied={() => showToast("Copied to clipboard", "success")}
              />

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
            <div className="space-y-4">
              {lead.driveFolderId ? (
                <div
                  className={`p-3 rounded-xl border text-xs ${DRIVE_SURFACE_SECONDARY} ${DRIVE_BORDER}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className={DRIVE_TEXT_MUTED}>Linked folder</p>
                      <p className={`font-semibold ${DRIVE_TEXT_PRIMARY} truncate`}>
                        {linkedFolderName || lead.name || "Client folder"}
                      </p>
                      <code
                        className={`block ${DRIVE_ACCENT_TEXT} font-mono text-[11px] break-all`}
                      >
                        {lead.driveFolderId}
                      </code>
                      {driveFolderUrl ? (
                        <a
                          href={driveFolderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold ${DRIVE_ACCENT_TEXT} hover:underline`}
                        >
                          <FiExternalLink className="text-xs" />
                          Open in Drive
                        </a>
                      ) : null}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                      <FaCheckCircle className="text-[9px]" />
                      Connected
                    </span>
                  </div>
                </div>
              ) : (
                <p className={`text-xs ${DRIVE_TEXT_SECONDARY} leading-relaxed`}>
                  {canManageDrive
                    ? "Link an existing Google Drive folder or create one under Clients/ for this lead's documents."
                    : "A Drive folder has not been set up for this lead yet."}
                </p>
              )}

              {canManageDrive ? (
                confirmUnlink ? (
                  <div className="space-y-3">
                    <p className={`text-xs ${DRIVE_TEXT_SECONDARY} leading-relaxed`}>
                      Unlink{" "}
                      <span className={`font-semibold ${DRIVE_TEXT_PRIMARY}`}>
                        {linkedFolderName || "this folder"}
                      </span>
                      ? The Drive tab will no longer browse this folder until you link a new one.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmUnlink(false)}
                        disabled={isUnlinkingFolder}
                        className={DRIVE_BTN_SECONDARY}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleUnlinkFolder()}
                        disabled={isUnlinkingFolder}
                        className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold text-[11px] transition-all flex items-center gap-2"
                      >
                        {isUnlinkingFolder ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaUnlink />
                        )}
                        Confirm unlink
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label
                        htmlFor={`lead-drive-folder-${lead.id}`}
                        className={`block text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${DRIVE_TEXT_SECONDARY}`}
                      >
                        {lead.driveFolderId ? "New folder URL or ID" : "Folder URL or ID"}
                      </label>
                      <input
                        id={`lead-drive-folder-${lead.id}`}
                        type="text"
                        value={folderInput}
                        onChange={(e) => setFolderInput(e.target.value)}
                        placeholder="Paste Drive folder URL or ID…"
                        className={`w-full text-sm py-2.5 px-4 shadow-sm ${DRIVE_INPUT}`}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => void handleValidateAndLink()}
                        disabled={isValidatingFolder || !folderInput.trim()}
                        className={`${DRIVE_BTN_PRIMARY} flex-1 justify-center`}
                      >
                        {isValidatingFolder ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FiLink className="text-xs" />
                        )}
                        {lead.driveFolderId ? "Update link" : "Validate & Link"}
                      </button>

                      {!lead.driveFolderId ? (
                        <button
                          type="button"
                          onClick={() => void handleCreateDriveFolder()}
                          disabled={isCreatingFolder}
                          className={`${DRIVE_BTN_SECONDARY} flex-1 justify-center`}
                        >
                          {isCreatingFolder ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaFolder className="text-xs" />
                          )}
                          Create folder
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmUnlink(true)}
                          disabled={isValidatingFolder || isUnlinkingFolder}
                          className={`${DRIVE_BTN_SECONDARY} flex-1 justify-center text-rose-600 dark:text-rose-400`}
                        >
                          <FaUnlink className="text-xs" />
                          Unlink
                        </button>
                      )}
                    </div>
                  </>
                )
              ) : null}

              <p className={`text-[11px] ${DRIVE_TEXT_MUTED} leading-relaxed border-t ${DRIVE_BORDER} pt-3`}>
                {lead.driveFolderId
                  ? "This lead's Drive tab browses the linked folder. Unlinking does not delete files in Google Drive."
                  : "Share the folder with your Storage Owner Gmail as Editor before linking."}
              </p>
            </div>
        </SettingsCard>
      </div>
    </div>
  );
}
