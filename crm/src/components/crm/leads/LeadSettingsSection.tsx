"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Lead } from "@/context/CrmContext";
import {
  DEFAULT_EMPLOYMENT_CATEGORY,
  getChecklistKeysForLead,
  EMPLOYMENT_CATEGORY_OPTIONS,
} from "@/utils/documentChecklistConfig";
import {
  getCountrySelectOptions,
  getVisaServiceSelectOptions,
} from "@/utils/leadFilterOptions";
import { CounselorSelectPill } from "@/components/ui/CounselorSelectPill";
import { SearchableFilterSelect } from "@/components/ui/FormInputs";
import { CompactRadioGroup } from "@/components/crm/leads/create/CompactRadioGroup";
import { isUsaCountry } from "@/utils/countryUtils";
import { getLeadPaymentSummary } from "@/utils/leadPaymentUtils";
import {
  FiCalendar,
  FiCopy,
  FiExternalLink,
  FiFileText,
  FiGlobe,
  FiLink,
  FiMail,
  FiUser,
  FiDollarSign,
  FiEdit2,
  FiBriefcase,
} from "react-icons/fi";
import {
  FaCheckCircle,
  FaCoins,
  FaExclamationTriangle,
  FaFolder,
  FaSpinner,
  FaUnlink,
  FaTimes,
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

const DAYS_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

const MONTHS_OPTIONS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const currentYear = new Date().getFullYear();
const ISSUE_YEARS = Array.from({ length: 100 }, (_, i) => String(currentYear - i));
const EXPIRY_YEARS = Array.from({ length: 50 }, (_, i) => String(currentYear + i));

const parseIsoDate = (dateStr: string) => {
  if (!dateStr) return { day: "", month: "", year: "" };
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return { year: parts[0], month: parts[1], day: parts[2] };
  }
  return { day: "", month: "", year: "" };
};

type SlotStatus = "available" | "paid";

const SLOT_STATUS_OPTIONS: { value: SlotStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "paid", label: "Paid" },
];

function deriveSlotStatus(lead: Lead): SlotStatus | "" {
  if (lead.usaSlots?.slotsPaid) return "paid";
  if (lead.usaSlots?.slotsAvailable) return "available";
  return "";
}

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
  required,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 flex items-center justify-center shrink-0">
          <Icon className="text-sm text-blue-600 dark:text-blue-400" />
        </div>
        <label className={fieldLabelCls} htmlFor={htmlFor}>
          {label}
          {required && <span className="text-rose-500 font-extrabold ml-1">*</span>}
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
    canAssignLeads,
    updateLeadProfile,
    assignCounselor,
    updateUsaSlots,
    addPayment,
    currentRole,
    updateEmploymentCategory,
    setLeadPackage,
    updateAmountReceived,
    openProfileDepositModal,
    canManagePayments,
    deleteLead,
    closeLeadDetail,
  } = useCrmLayoutContext();

  const isUsa = isUsaCountry(lead.country);

  const isAdmin = currentRole === "ADMIN";
  const canManageDrive = isAdmin;

  const countryOptions = useMemo(() => getCountrySelectOptions(), []);
  const visaServiceOptions = useMemo(
    () => getVisaServiceSelectOptions(leads, lead.visaType),
    [leads, lead.visaType]
  );

  const [emailDraft, setEmailDraft] = useState(lead.email);
  const isEmailValid = useMemo(() => {
    if (!emailDraft.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(emailDraft.trim());
  }, [emailDraft]);
  const [passportNumberDraft, setPassportNumberDraft] = useState(lead.passportNumber ?? "");
  const [passportIssueDateDraft, setPassportIssueDateDraft] = useState(lead.passportIssueDate ?? "");
  const [passportExpiryDateDraft, setPassportExpiryDateDraft] = useState(lead.passportExpiryDate ?? "");
  const [passportPlaceOfIssueDraft, setPassportPlaceOfIssueDraft] = useState(lead.passportPlaceOfIssue ?? "");
  const [annualIncomeDraft, setAnnualIncomeDraft] = useState(lead.annualIncome ?? "");
  const [referredByDraft, setReferredByDraft] = useState(lead.referredBy ?? "");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const predefinedServices = useMemo(() => [
    "Study Abroad",
    "Work Visa",
    "Business Visa",
    "Residence Visa",
    "Tourist Visa",
  ], []);

  const isPredefined = lead.visaType ? predefinedServices.includes(lead.visaType) : true;

  const [isOtherSelected, setIsOtherSelected] = useState(!isPredefined);
  const [customServiceDraft, setCustomServiceDraft] = useState(!isPredefined ? (lead.visaType ?? "") : "");

  useEffect(() => {
    const checkIsPredefined = lead.visaType ? predefinedServices.includes(lead.visaType) : true;
    setIsOtherSelected(!checkIsPredefined);
    setCustomServiceDraft(!checkIsPredefined ? (lead.visaType ?? "") : "");
  }, [lead.id, lead.visaType, predefinedServices]);

  const handleCustomServiceSave = () => {
    const val = customServiceDraft.trim();
    if (val) {
      updateLeadProfile(lead.id, { visaType: val });
      showToast("Profile updated", "success");
    }
  };

  const handleCustomServiceCancel = () => {
    const checkIsPredefined = lead.visaType ? predefinedServices.includes(lead.visaType) : true;
    setIsOtherSelected(!checkIsPredefined);
    setCustomServiceDraft(!checkIsPredefined ? (lead.visaType ?? "") : "");
  };

  const parsedIssue = parseIsoDate(passportIssueDateDraft);
  const parsedExpiry = parseIsoDate(passportExpiryDateDraft);

  const handleDatePartChange = (
    field: "passportIssueDate" | "passportExpiryDate",
    part: "day" | "month" | "year",
    value: string,
    currentVal: string,
    setDraft: (val: string) => void,
    toastMsg: string
  ) => {
    const parsed = parseIsoDate(currentVal);
    parsed[part] = value;
    const isoString = `${parsed.year || ""}-${parsed.month || ""}-${parsed.day || ""}`;
    setDraft(isoString);
    updateLeadProfile(lead.id, { [field]: isoString });
    if (parsed.day && parsed.month && parsed.year) {
      showToast(toastMsg, "success");
    }
  };

  useEffect(() => {
    setEmailDraft(lead.email);
    setPassportNumberDraft(lead.passportNumber ?? "");
    setPassportIssueDateDraft(lead.passportIssueDate ?? "");
    setPassportExpiryDateDraft(lead.passportExpiryDate ?? "");
    setPassportPlaceOfIssueDraft(lead.passportPlaceOfIssue ?? "");
    setAnnualIncomeDraft(lead.annualIncome ?? "");
    setReferredByDraft(lead.referredBy ?? "");
  }, [
    lead.id,
    lead.email,
    lead.passportNumber,
    lead.passportIssueDate,
    lead.passportExpiryDate,
    lead.passportPlaceOfIssue,
    lead.annualIncome,
    lead.referredBy,
  ]);

  const employmentCategory = lead.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY;
  const activeKeys = getChecklistKeysForLead(employmentCategory);
  const verifiedCount = activeKeys.filter((key) => lead.checklist[key]).length;
  const totalCount = activeKeys.length;
  const paymentSummary = useMemo(() => getLeadPaymentSummary(lead), [lead.payments]);
  const paymentStatValue =
    paymentSummary.totalPackage > 0
      ? `₹${paymentSummary.received.toLocaleString("en-IN")} / ₹${paymentSummary.totalPackage.toLocaleString("en-IN")}`
      : "Not set";

  const [packageAmountDraft, setPackageAmountDraft] = useState(
    paymentSummary.totalPackage > 0 ? String(paymentSummary.totalPackage) : ""
  );
  const [isEditingPackage, setIsEditingPackage] = useState(false);

  useEffect(() => {
    setPackageAmountDraft(paymentSummary.totalPackage > 0 ? String(paymentSummary.totalPackage) : "");
  }, [lead.id, paymentSummary.totalPackage]);

  const handlePackageAmountSave = () => {
    const amount = parseFloat(packageAmountDraft);
    if (Number.isNaN(amount) || amount <= 0) return;
    if (amount === paymentSummary.totalPackage) return;
    setLeadPackage(lead.id, amount);
    showToast("Package amount updated", "success");
  };

  const [depositAmountInput, setDepositAmountInput] = useState("");
  const handleRecordDirectDeposit = () => {
    if (!canManagePayments) return;
    const amount = parseFloat(depositAmountInput);
    if (Number.isNaN(amount) || amount <= 0) {
      showToast("Enter a valid deposit amount", "error");
      return;
    }
    const pending = paymentSummary.pending;
    if (amount > pending) {
      showToast(`Deposit cannot exceed outstanding balance of ₹${pending.toLocaleString("en-IN")}`, "error");
      return;
    }
    const nextPending = Math.max(0, paymentSummary.totalPackage - (paymentSummary.received + amount));
    addPayment(lead.id, {
      totalPackage: paymentSummary.totalPackage,
      amountPaid: amount,
      pendingAmount: nextPending,
      paymentMethod: "Direct Entry",
    });
    setDepositAmountInput("");
    showToast("Deposit recorded successfully", "success");
  };

  const [credUsername, setCredUsername] = useState(lead.visaCredentials?.username ?? "");
  const [credPassword, setCredPassword] = useState(lead.visaCredentials?.password ?? "");
  const [credPortalUrl, setCredPortalUrl] = useState(lead.visaCredentials?.portalUrl ?? "");
  const [savingCreds, setSavingCreds] = useState(false);

  const [slotPortalUsername, setSlotPortalUsername] = useState(
    lead.usaSlots?.slotPortalUsername ?? ""
  );
  const [slotPortalPassword, setSlotPortalPassword] = useState(
    lead.usaSlots?.slotPortalPassword ?? ""
  );
  const [savingSlotPortal, setSavingSlotPortal] = useState(false);

  const [trackingMobile, setTrackingMobile] = useState(lead.usaSlots?.trackingMobile ?? "");
  const [securityQuestions, setSecurityQuestions] = useState<Array<{ question: string; answer: string }>>([]);
  const [savingUsaTracking, setSavingUsaTracking] = useState(false);

  useEffect(() => {
    setCredUsername(lead.visaCredentials?.username ?? "");
    setCredPassword(lead.visaCredentials?.password ?? "");
    setCredPortalUrl(lead.visaCredentials?.portalUrl ?? "");
  }, [lead.id, lead.visaCredentials]);

  useEffect(() => {
    setSlotPortalUsername(lead.usaSlots?.slotPortalUsername ?? "");
    setSlotPortalPassword(lead.usaSlots?.slotPortalPassword ?? "");
  }, [lead.id, lead.usaSlots?.slotPortalUsername, lead.usaSlots?.slotPortalPassword]);

  useEffect(() => {
    setTrackingMobile(lead.usaSlots?.trackingMobile ?? "");
    const questions = lead.usaSlots?.securityQuestions || [
      { question: "Car", answer: lead.usaSlots?.securityCar ?? "" },
      { question: "Food", answer: lead.usaSlots?.securityFood ?? "" },
      { question: "City", answer: lead.usaSlots?.securityCity ?? "" }
    ];
    setSecurityQuestions(questions);
  }, [
    lead.id,
    lead.usaSlots?.trackingMobile,
    lead.usaSlots?.securityQuestions,
    lead.usaSlots?.securityCar,
    lead.usaSlots?.securityFood,
    lead.usaSlots?.securityCity,
  ]);

  const handleSecurityQuestionChange = (index: number, val: string) => {
    const list = [...securityQuestions];
    list[index] = { ...list[index], question: val };
    setSecurityQuestions(list);
  };

  const handleSecurityAnswerChange = (index: number, val: string) => {
    const list = [...securityQuestions];
    list[index] = { ...list[index], answer: val };
    setSecurityQuestions(list);
  };

  const handleAddSecurityQuestion = () => {
    setSecurityQuestions([
      ...securityQuestions,
      { question: "", answer: "" },
    ]);
  };

  const handleRemoveSecurityQuestion = (index: number) => {
    const list = securityQuestions.filter((_, i) => i !== index);
    setSecurityQuestions(list);
  };

  const handleSlotStatusChange = (value: SlotStatus) => {
    if (!canModifyLeads) return;
    updateUsaSlots(lead.id, {
      slotsAvailable: value === "available",
      slotsPaid: value === "paid",
    });
    showToast("Slot status updated", "success");
  };

  const handleSaveSlotPortal = () => {
    if (!canModifyLeads) return;
    setSavingSlotPortal(true);
    updateUsaSlots(lead.id, {
      slotPortalUsername: slotPortalUsername.trim(),
      slotPortalPassword: slotPortalPassword.trim(),
    });
    setSavingSlotPortal(false);
    showToast("Slot portal credentials saved", "success");
  };

  const handleSaveUsaTracking = () => {
    if (!canModifyLeads) return;
    setSavingUsaTracking(true);

    const legacyCar = (securityQuestions.find(q => q.question.toLowerCase().includes("car"))?.answer || "").trim();
    const legacyFood = (securityQuestions.find(q => q.question.toLowerCase().includes("food"))?.answer || "").trim();
    const legacyCity = (securityQuestions.find(q => q.question.toLowerCase().includes("city"))?.answer || "").trim();

    updateUsaSlots(lead.id, {
      trackingMobile: trackingMobile.trim(),
      securityCar: legacyCar,
      securityFood: legacyFood,
      securityCity: legacyCity,
      securityQuestions: securityQuestions.map(q => ({
        question: q.question.trim(),
        answer: q.answer.trim()
      }))
    });
    setSavingUsaTracking(false);
    showToast("USA tracking details saved", "success");
  };

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
  const [folderLinkStatus, setFolderLinkStatus] = useState<
    "idle" | "checking" | "valid" | "stale"
  >("idle");
  const [isValidatingFolder, setIsValidatingFolder] = useState(false);
  const [isUnlinkingFolder, setIsUnlinkingFolder] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  useEffect(() => {
    setFolderInput("");
    setConfirmUnlink(false);
    if (!lead.driveFolderId) {
      setLinkedFolderName(null);
      setFolderLinkStatus("idle");
      return;
    }

    let cancelled = false;
    setFolderLinkStatus("checking");
    void (async () => {
      try {
        const res = await fetch("/api/drive/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: lead.driveFolderId }),
        });
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setLinkedFolderName((data.folderName as string) || null);
          setFolderLinkStatus("valid");
          return;
        }

        setLinkedFolderName(null);
        setFolderLinkStatus("stale");
      } catch {
        if (!cancelled) {
          setLinkedFolderName(null);
          setFolderLinkStatus("stale");
        }
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
      setFolderLinkStatus("valid");
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
      setFolderLinkStatus("idle");
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
      setFolderLinkStatus("valid");
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

  const handleAnnualIncomeSave = () => {
    const trimmed = annualIncomeDraft.trim();
    if (trimmed === (lead.annualIncome ?? "")) return;
    updateLeadProfile(lead.id, { annualIncome: trimmed });
    showToast("Profile updated", "success");
  };

  const handleReferredBySave = () => {
    const trimmed = referredByDraft.trim();
    if (trimmed === (lead.referredBy ?? "")) return;
    updateLeadProfile(lead.id, { referredBy: trimmed });
    showToast("Referred by updated", "success");
  };

  const handlePassportNumberSave = () => {
    const trimmed = passportNumberDraft.trim();
    if (trimmed === (lead.passportNumber ?? "")) return;
    updateLeadProfile(lead.id, { passportNumber: trimmed });
    showToast("Passport number updated", "success");
  };

  const handlePassportIssueDateSave = () => {
    const val = passportIssueDateDraft;
    if (val === (lead.passportIssueDate ?? "")) return;
    updateLeadProfile(lead.id, { passportIssueDate: val });
    showToast("Passport issue date updated", "success");
  };

  const handlePassportExpiryDateSave = () => {
    const val = passportExpiryDateDraft;
    if (val === (lead.passportExpiryDate ?? "")) return;
    updateLeadProfile(lead.id, { passportExpiryDate: val });
    showToast("Passport expiry date updated", "success");
  };

  const handlePassportPlaceOfIssueSave = () => {
    const trimmed = passportPlaceOfIssueDraft.trim();
    if (trimmed === (lead.passportPlaceOfIssue ?? "")) return;
    updateLeadProfile(lead.id, { passportPlaceOfIssue: trimmed });
    showToast("Passport place of issue updated", "success");
  };

  return (
    <div className="space-y-6">
      <SettingsCard title="Lead Profile">
        <style>{SETTINGS_PROFILE_FIELD_THEME_CSS}</style>
        <div className="lead-settings-profile-fields grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <EditableProfileField icon={FiMail} label="Email" htmlFor={`profile-email-${lead.id}`}>
            <div className="space-y-2 w-full">
              <input
                id={`profile-email-${lead.id}`}
                type="email"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isEmailValid) {
                    handleEmailSave();
                  } else if (e.key === "Escape") {
                    setEmailDraft(lead.email);
                  }
                }}
                disabled={!canModifyLeads}
                placeholder="lead@example.com"
                className={profileEmailInputCls}
              />
              {emailDraft !== lead.email && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                  {!isEmailValid ? (
                    <span className="text-[10px] font-semibold text-rose-500">
                      Please enter a valid email address
                    </span>
                  ) : (
                    <span />
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleEmailSave}
                      disabled={!isEmailValid}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow transition-colors cursor-pointer select-none"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailDraft(lead.email)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer select-none"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
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
            <div className="space-y-2 w-full">
              <div
                className={`${profileSelectWrapperCls}${!canModifyLeads ? " opacity-60 pointer-events-none" : ""}`}
              >
                <SearchableFilterSelect
                  value={isOtherSelected ? "Other" : lead.visaType}
                  onChange={(visaType) => {
                    if (!visaType) return;
                    if (visaType === "Other") {
                      setIsOtherSelected(true);
                      setCustomServiceDraft("");
                    } else {
                      setIsOtherSelected(false);
                      updateLeadProfile(lead.id, { visaType });
                      showToast("Profile updated", "success");
                    }
                  }}
                  options={visaServiceOptions}
                  placeholder="Select service type…"
                  portalId={`settings-visa-type-${lead.id}`}
                  clearValue={isOtherSelected ? "Other" : lead.visaType}
                />
              </div>

              {isOtherSelected && (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={customServiceDraft}
                    onChange={(e) => setCustomServiceDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCustomServiceSave();
                      } else if (e.key === "Escape") {
                        handleCustomServiceCancel();
                      }
                    }}
                    placeholder="Specify service name…"
                    className={`${profileEmailInputCls} flex-1`}
                    autoFocus
                  />
                  {customServiceDraft !== (lead.visaType ?? "") && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCustomServiceSave}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer shrink-0"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCustomServiceCancel}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </EditableProfileField>

          <EditableProfileField icon={FiUser} label="Assigned Counselor">
            <div className="profile-counselor-select w-full">
              <CounselorSelectPill
                variant="field"
                value={lead.counselor}
                disabled={!canModifyLeads || !canAssignLeads}
                portalId={`settings-counselor-${lead.id}`}
                onChange={(counselor) => {
                  if (counselor === lead.counselor) return;
                  assignCounselor(lead.id, counselor);
                  showToast("Profile updated", "success");
                }}
              />
            </div>
          </EditableProfileField>

          <EditableProfileField icon={FiDollarSign} label="Annual Income (INR)" htmlFor={`profile-annual-income-${lead.id}`}>
            <div className="space-y-2 w-full">
              <input
                id={`profile-annual-income-${lead.id}`}
                type="number"
                min="0"
                value={annualIncomeDraft}
                onChange={(e) => setAnnualIncomeDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAnnualIncomeSave();
                  } else if (e.key === "Escape") {
                    setAnnualIncomeDraft(lead.annualIncome ?? "");
                  }
                }}
                disabled={!canModifyLeads}
                placeholder="e.g. 800000"
                className={profileEmailInputCls}
              />
              {annualIncomeDraft !== (lead.annualIncome ?? "") && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAnnualIncomeSave}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow transition-colors cursor-pointer select-none"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnualIncomeDraft(lead.annualIncome ?? "")}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer select-none"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </EditableProfileField>

          <EditableProfileField icon={FiLink} label="Lead Source">
            <div className="w-full">
              <select
                value={lead.source}
                onChange={(e) => {
                  const source = e.target.value as any;
                  updateLeadProfile(lead.id, { source });
                  showToast("Lead source updated", "success");
                }}
                disabled={!canModifyLeads}
                className={fieldInputCls}
              >
                <option value="MANUAL">Manual Entry</option>
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="WALK_IN">Walk-In</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
              </select>
            </div>
          </EditableProfileField>

          <EditableProfileField icon={FiBriefcase} label="Employment Category">
            <div className="w-full">
              <select
                value={lead.employmentCategory || DEFAULT_EMPLOYMENT_CATEGORY}
                onChange={(e) => {
                  const category = e.target.value as any;
                  updateEmploymentCategory(lead.id, category);
                  showToast("Employment category updated", "success");
                }}
                disabled={!canModifyLeads}
                className={fieldInputCls}
              >
                {EMPLOYMENT_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </EditableProfileField>



          {lead.source === "REFERRAL" && (
            <EditableProfileField icon={FiUser} label="Referred By" htmlFor={`profile-referred-by-${lead.id}`}>
              <div className="space-y-2 w-full">
                <input
                  id={`profile-referred-by-${lead.id}`}
                  type="text"
                  value={referredByDraft}
                  onChange={(e) => setReferredByDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleReferredBySave();
                    } else if (e.key === "Escape") {
                      setReferredByDraft(lead.referredBy ?? "");
                    }
                  }}
                  disabled={!canModifyLeads}
                  placeholder="e.g. Jane Doe"
                  className={profileEmailInputCls}
                />
                {referredByDraft !== (lead.referredBy ?? "") && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleReferredBySave}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow transition-colors cursor-pointer select-none"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setReferredByDraft(lead.referredBy ?? "")}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer select-none"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </EditableProfileField>
          )}
        </div>
      </SettingsCard>

      <SettingsCard title="Passport Details">
        <style>{SETTINGS_PROFILE_FIELD_THEME_CSS}</style>
        <div className="lead-settings-profile-fields grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <EditableProfileField icon={FiFileText} label="Passport Number" htmlFor={`profile-passport-number-${lead.id}`}>
            <div className="space-y-2 w-full">
              <input
                id={`profile-passport-number-${lead.id}`}
                type="text"
                value={passportNumberDraft}
                onChange={(e) => setPassportNumberDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePassportNumberSave();
                  } else if (e.key === "Escape") {
                    setPassportNumberDraft(lead.passportNumber ?? "");
                  }
                }}
                disabled={!canModifyLeads}
                placeholder="e.g. A1234567"
                className={profileEmailInputCls}
              />
              {passportNumberDraft !== (lead.passportNumber ?? "") && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePassportNumberSave}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow transition-colors cursor-pointer select-none"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassportNumberDraft(lead.passportNumber ?? "")}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer select-none"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </EditableProfileField>

          <EditableProfileField icon={FiCalendar} label="Passport Issue Date">
            <div className="grid grid-cols-3 gap-2">
              <select
                value={parsedIssue.day}
                onChange={(e) => handleDatePartChange("passportIssueDate", "day", e.target.value, passportIssueDateDraft, setPassportIssueDateDraft, "Passport issue date updated")}
                disabled={!canModifyLeads}
                className={profileEmailInputCls}
              >
                <option value="">Day</option>
                {DAYS_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={parsedIssue.month}
                onChange={(e) => handleDatePartChange("passportIssueDate", "month", e.target.value, passportIssueDateDraft, setPassportIssueDateDraft, "Passport issue date updated")}
                disabled={!canModifyLeads}
                className={profileEmailInputCls}
              >
                <option value="">Month</option>
                {MONTHS_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Year"
                value={parsedIssue.year}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ""); // Digits only
                  handleDatePartChange("passportIssueDate", "year", val, passportIssueDateDraft, setPassportIssueDateDraft, "Passport issue date updated");
                }}
                disabled={!canModifyLeads}
                className={profileEmailInputCls}
              />
            </div>
          </EditableProfileField>

          <EditableProfileField icon={FiCalendar} label="Passport Expiry Date">
            <div className="grid grid-cols-3 gap-2">
              <select
                value={parsedExpiry.day}
                onChange={(e) => handleDatePartChange("passportExpiryDate", "day", e.target.value, passportExpiryDateDraft, setPassportExpiryDateDraft, "Passport expiry date updated")}
                disabled={!canModifyLeads}
                className={profileEmailInputCls}
              >
                <option value="">Day</option>
                {DAYS_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={parsedExpiry.month}
                onChange={(e) => handleDatePartChange("passportExpiryDate", "month", e.target.value, passportExpiryDateDraft, setPassportExpiryDateDraft, "Passport expiry date updated")}
                disabled={!canModifyLeads}
                className={profileEmailInputCls}
              >
                <option value="">Month</option>
                {MONTHS_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Year"
                value={parsedExpiry.year}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ""); // Digits only
                  handleDatePartChange("passportExpiryDate", "year", val, passportExpiryDateDraft, setPassportExpiryDateDraft, "Passport expiry date updated");
                }}
                disabled={!canModifyLeads}
                className={profileEmailInputCls}
              />
            </div>
          </EditableProfileField>

          <EditableProfileField icon={FiGlobe} label="Place of Issue" htmlFor={`profile-passport-place-${lead.id}`}>
            <div className="space-y-2 w-full">
              <input
                id={`profile-passport-place-${lead.id}`}
                type="text"
                value={passportPlaceOfIssueDraft}
                onChange={(e) => setPassportPlaceOfIssueDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePassportPlaceOfIssueSave();
                  } else if (e.key === "Escape") {
                    setPassportPlaceOfIssueDraft(lead.passportPlaceOfIssue ?? "");
                  }
                }}
                disabled={!canModifyLeads}
                placeholder="e.g. Delhi"
                className={profileEmailInputCls}
              />
              {passportPlaceOfIssueDraft !== (lead.passportPlaceOfIssue ?? "") && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePassportPlaceOfIssueSave}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow transition-colors cursor-pointer select-none"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassportPlaceOfIssueDraft(lead.passportPlaceOfIssue ?? "")}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer select-none"
                  >
                    Cancel
                  </button>
                </div>
              )}
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
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FaCoins className="text-base" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 block animate-none">
                  Service Charges & Payments
                </span>
                {isEditingPackage ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={packageAmountDraft}
                      onChange={(e) => setPackageAmountDraft(e.target.value)}
                      className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-lg dark:bg-slate-900/60 dark:text-white border-slate-250 dark:border-slate-800 w-28"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handlePackageAmountSave();
                        setIsEditingPackage(false);
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg shadow cursor-pointer transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPackageAmountDraft(String(paymentSummary.totalPackage));
                        setIsEditingPackage(false);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span className="text-base font-bold text-gray-900 dark:text-white tabular-nums mt-0.5 block flex items-center gap-2">
                    <span>
                      {paymentSummary.totalPackage > 0
                        ? `Received: ₹${paymentSummary.received.toLocaleString("en-IN")} / ₹${paymentSummary.totalPackage.toLocaleString("en-IN")}`
                        : "Package not decided"}
                    </span>
                    {canManagePayments && paymentSummary.totalPackage > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsEditingPackage(true)}
                        className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                        title="Edit Package Amount"
                      >
                        <FiEdit2 className="text-xs" />
                      </button>
                    )}
                  </span>
                )}
              </div>
            </div>
            {paymentSummary.status && (
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                  paymentSummary.status === "pending"
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                }`}
              >
                {paymentSummary.status === "pending" ? "Pending" : "Received"}
              </span>
            )}
          </div>

          <div className="mt-3">
            {paymentSummary.totalPackage <= 0 ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={packageAmountDraft}
                  onChange={(e) => setPackageAmountDraft(e.target.value)}
                  disabled={!canManagePayments}
                  placeholder="Set package (e.g. 50000)"
                  className="flex-1 min-w-0 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 dark:border-slate-850 rounded-xl dark:bg-slate-900/60 dark:text-white border-slate-200 dark:border-slate-800"
                />
                <button
                  type="button"
                  disabled={!canManagePayments || !packageAmountDraft.trim()}
                  onClick={handlePackageAmountSave}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
                >
                  Set package
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {paymentSummary.pending > 0 ? (
                  <div className="flex items-center justify-between gap-4 mt-1">
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-slate-400">Pending outstanding: </span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        ₹{paymentSummary.pending.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {canManagePayments && (
                      <button
                        type="button"
                        onClick={() => openProfileDepositModal(lead.id)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
                      >
                        Record deposit
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-250 dark:border-emerald-500/20">
                    <FaCheckCircle className="text-sm shrink-0" />
                    <span>Payment completed in full.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isUsa ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SettingsCard title="USA Slot Portal">
            <div className="space-y-4">
              <fieldset disabled={!canModifyLeads} className="space-y-1.5 border-0 p-0 m-0 min-w-0">
                <legend className={`${fieldLabelCls} float-left mb-1.5`}>US Slot Tracking</legend>
                <div className="clear-both">
                  <CompactRadioGroup
                    name={`settings-slot-status-${lead.id}`}
                    value={deriveSlotStatus(lead)}
                    options={SLOT_STATUS_OPTIONS}
                    onChange={handleSlotStatusChange}
                    firstOptionId={`settings-slot-status-available-${lead.id}`}
                  />
                </div>
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={fieldLabelCls} htmlFor={`settings-slot-portal-user-${lead.id}`}>
                    User ID
                  </label>
                  <input
                    id={`settings-slot-portal-user-${lead.id}`}
                    type="text"
                    value={slotPortalUsername}
                    onChange={(e) => setSlotPortalUsername(e.target.value)}
                    disabled={!canModifyLeads}
                    placeholder="Slot portal username"
                    className={fieldInputCls}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={fieldLabelCls} htmlFor={`settings-slot-portal-password-${lead.id}`}>
                    Password
                  </label>
                  <input
                    id={`settings-slot-portal-password-${lead.id}`}
                    type="text"
                    value={slotPortalPassword}
                    onChange={(e) => setSlotPortalPassword(e.target.value)}
                    disabled={!canModifyLeads}
                    placeholder="Slot portal password"
                    className={fieldInputCls}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!canModifyLeads || savingSlotPortal}
                onClick={handleSaveSlotPortal}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 font-bold text-white text-xs rounded-xl cursor-pointer transition-colors"
              >
                {savingSlotPortal ? "Saving…" : "Save Slot Portal"}
              </button>
            </div>
          </SettingsCard>

          <SettingsCard title="USA Slot Tracking">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={fieldLabelCls} htmlFor={`settings-usa-mobile-${lead.id}`}>
                    Mobile Number
                  </label>
                  <input
                    id={`settings-usa-mobile-${lead.id}`}
                    type="text"
                    value={trackingMobile}
                    onChange={(e) => setTrackingMobile(e.target.value)}
                    disabled={!canModifyLeads}
                    placeholder="Tracking mobile number"
                    className={fieldInputCls}
                    autoComplete="off"
                  />
                </div>
                <div />
              </div>
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className={fieldLabelCls}>
                    Security Questions
                  </label>
                  <button
                    type="button"
                    disabled={!canModifyLeads}
                    onClick={handleAddSecurityQuestion}
                    className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Question
                  </button>
                </div>

                {securityQuestions.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    No security questions added. Click "Add Question" to add one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {securityQuestions.map((q, idx) => (
                      <div key={idx} className="flex gap-2 items-start bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              Question {idx + 1}
                            </label>
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => handleSecurityQuestionChange(idx, e.target.value)}
                              disabled={!canModifyLeads}
                              placeholder="e.g. Car"
                              className={fieldInputCls}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              Answer
                            </label>
                            <input
                              type="text"
                              value={q.answer}
                              onChange={(e) => handleSecurityAnswerChange(idx, e.target.value)}
                              disabled={!canModifyLeads}
                              placeholder="Enter answer"
                              className={fieldInputCls}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!canModifyLeads}
                          onClick={() => handleRemoveSecurityQuestion(idx)}
                          className="mt-5 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                          title="Remove question"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                disabled={!canModifyLeads || savingUsaTracking}
                onClick={handleSaveUsaTracking}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 font-bold text-white text-xs rounded-xl cursor-pointer transition-colors"
              >
                {savingUsaTracking ? "Saving…" : "Save Tracking Details"}
              </button>
            </div>
          </SettingsCard>
        </div>
      ) : null}

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
                  className={`p-3 rounded-xl border text-xs ${
                    folderLinkStatus === "stale"
                      ? "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10"
                      : `${DRIVE_SURFACE_SECONDARY} ${DRIVE_BORDER}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className={DRIVE_TEXT_MUTED}>
                        {folderLinkStatus === "stale" ? "Stale folder link" : "Linked folder"}
                      </p>
                      <p className={`font-semibold ${DRIVE_TEXT_PRIMARY} truncate`}>
                        {linkedFolderName || lead.name || "Client folder"}
                      </p>
                      <code
                        className={`block ${folderLinkStatus === "stale" ? "text-amber-700 dark:text-amber-300" : DRIVE_ACCENT_TEXT} font-mono text-[11px] break-all`}
                      >
                        {lead.driveFolderId}
                      </code>
                      {folderLinkStatus === "stale" ? (
                        <p className="text-[11px] text-amber-800 dark:text-amber-200/90 leading-relaxed mt-2">
                          This folder could not be found in Google Drive. It may be from a
                          previous account. Unlink it below, then link a new folder or create
                          one under Clients/.
                        </p>
                      ) : driveFolderUrl ? (
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
                    {folderLinkStatus === "checking" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 px-2 py-0.5 rounded-full shrink-0">
                        <FaSpinner className="text-[9px] animate-spin" />
                        Checking
                      </span>
                    ) : folderLinkStatus === "stale" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 px-2 py-0.5 rounded-full shrink-0">
                        <FaExclamationTriangle className="text-[9px]" />
                        Unreachable
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                        <FaCheckCircle className="text-[9px]" />
                        Connected
                      </span>
                    )}
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
                confirmUnlink || folderLinkStatus === "stale" ? (
                  <div className="space-y-3">
                    <p className={`text-xs ${DRIVE_TEXT_SECONDARY} leading-relaxed`}>
                      {folderLinkStatus === "stale" ? (
                        <>
                          Unlink the stale folder ID{" "}
                          <code className="font-mono text-[11px]">{lead.driveFolderId}</code>? The
                          Drive tab will stop erroring. You can then link a new folder or create
                          one under Clients/.
                        </>
                      ) : (
                        <>
                          Unlink{" "}
                          <span className={`font-semibold ${DRIVE_TEXT_PRIMARY}`}>
                            {linkedFolderName || "this folder"}
                          </span>
                          ? The Drive tab will no longer browse this folder until you link a new
                          one.
                        </>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {folderLinkStatus !== "stale" ? (
                        <button
                          type="button"
                          onClick={() => setConfirmUnlink(false)}
                          disabled={isUnlinkingFolder}
                          className={DRIVE_BTN_SECONDARY}
                        >
                          Cancel
                        </button>
                      ) : null}
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
                        {folderLinkStatus === "stale" ? "Unlink stale folder" : "Confirm unlink"}
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
                  ? folderLinkStatus === "stale"
                    ? "Unlinking clears the stored folder ID only — it does not delete anything in Google Drive."
                    : "This lead's Drive tab browses the linked folder. Unlinking does not delete files in Google Drive."
                  : "Share the folder with your Storage Owner Gmail as Editor before linking."}
              </p>
            </div>
        </SettingsCard>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 border-t border-rose-100/10 pt-6">
        <div className="rounded-2xl border border-red-200 dark:border-red-900/40 overflow-hidden bg-white dark:bg-slate-900/30 shadow-sm">
          {/* Header */}
          <div className="bg-red-50/50 dark:bg-red-950/10 px-5 py-3 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2">
            <FaExclamationTriangle className="text-red-600 dark:text-red-500 text-xs shrink-0" />
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
              Danger Zone
            </h2>
          </div>
          
          {/* Action Row */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-gray-800 dark:text-slate-200">
                Delete this lead
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                Permanently delete this lead and all associated documents, notes, credentials, and slot details from the database. This action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmationText("");
                setIsDeleteModalOpen(true);
              }}
              className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer shrink-0 self-start sm:self-center"
            >
              Delete Lead
            </button>
          </div>
        </div>
      </div>

      {/* Lead Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 text-left relative">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <FaTimes className="text-xs" />
            </button>

            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 border-b border-gray-100 dark:border-slate-800 pb-3 pr-8">
              <FaExclamationTriangle className="text-xl shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Confirm Lead Deletion</h3>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">&ldquo;{lead.name}&rdquo;</strong>? This will remove all checklists, credentials, tracking, and payments permanently from the database.
            </p>

            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl p-3 text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed font-semibold">
              Warning: This action cannot be undone. Please type <span className="font-mono bg-rose-100 dark:bg-rose-900/50 px-1 py-0.5 rounded text-rose-900 dark:text-rose-200">delete</span> in the input below to confirm.
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
                Verification Input
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder='Type "delete"'
                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-850 dark:text-slate-100 text-xs font-semibold py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                autoComplete="off"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="py-2 px-4 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText.trim().toLowerCase() !== "delete" || isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  const ok = await deleteLead(lead.id);
                  setIsDeleting(false);
                  if (ok) {
                    showToast("Lead deleted successfully", "success");
                    closeLeadDetail();
                  } else {
                    showToast("Failed to delete lead", "error");
                  }
                  setIsDeleteModalOpen(false);
                }}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition-colors"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
