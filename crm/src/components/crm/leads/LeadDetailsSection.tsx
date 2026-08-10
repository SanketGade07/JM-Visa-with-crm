"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Activity, Lead, LeadSource } from "@/context/CrmContext";
import {
  FiBriefcase,
  FiFileText,
  FiGlobe,
  FiLink,
  FiMail,
  FiPaperclip,
  FiPhone,
  FiSend,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiX,
} from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
import {
  DEFAULT_EMPLOYMENT_CATEGORY,
  EMPLOYMENT_CATEGORY_OPTIONS,
} from "@/utils/documentChecklistConfig";
import { isUsaCountry } from "@/utils/countryUtils";
import { FormattedDiscussionContent } from "./FormattedDiscussionContent";
import {
  DiscussionMessageComposer,
  type DiscussionMessageComposerHandle,
} from "./DiscussionMessageComposer";
import { LeadManagementCard } from "./LeadManagementCard";

type LeadDetailsSectionProps = {
  lead: Lead;
  highlighted?: boolean;
};

function isSystemAuditNote(content: string): boolean {
  return (
    content.startsWith('Counselor changed from "') ||
    content.startsWith("Visa portal credentials ") ||
    content === "Email updated" ||
    content.startsWith('Country changed from "') ||
    content.startsWith('Visa service type changed from "') ||
    content.startsWith("Drive folder linked") ||
    content.startsWith("Drive folder unlinked") ||
    content === "Drive folder created for lead"
  );
}

function isDiscussionActivity(activity: Activity): boolean {
  return activity.type === "discussion";
}

const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  MANUAL: "Manual Entry",
  WEBSITE: "Website",
  REFERRAL: "Referral",
  WALK_IN: "Walk-In",
  SOCIAL_MEDIA: "Social Media",
};

function formatMessageTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

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

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <Icon className="text-sm text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 block">
          {label}
        </span>
        <span className="text-[13px] font-semibold text-gray-800 dark:text-slate-100 block mt-1 break-words">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

function InfoDetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 block">
        {label}
      </span>
      <span className="text-[13px] font-semibold text-gray-800 dark:text-slate-100 block break-words">
        {value || "—"}
      </span>
    </div>
  );
}

function DiscussionDivider() {
  return (
    <div className="relative py-3">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200 dark:border-slate-700/80" />
      </div>
      <div className="relative flex justify-center">
        <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-[#070712] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
          Discussion Started
        </span>
      </div>
    </div>
  );
}

function MessageBubble({ activity }: { activity: Activity }) {
  const { currentUser } = useCrmLayoutContext();
  
  const isMe =
    activity.createdBy === currentUser?.name ||
    (activity.createdBy === "ADMIN" && currentUser?.role === "ADMIN") ||
    (activity.createdBy === "STAFF" && currentUser?.role === "STAFF");

  const typeLabel =
    activity.type === "call"
      ? "Call"
      : activity.type === "email"
        ? "Email"
        : null;

  return (
    <article
      className={`rounded-2xl px-4 py-2.5 max-w-[85%] sm:max-w-[75%] shadow-sm flex flex-col ${
        isMe
          ? "self-end bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-none"
          : "self-start bg-slate-100/70 dark:bg-slate-800/25 border border-slate-200/60 dark:border-slate-800/40 text-gray-800 dark:text-slate-100 rounded-tl-none"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-0.5 mb-1.5 w-full">
        <span
          className={`text-[10px] font-bold ${
            isMe ? "text-violet-100" : "text-violet-600 dark:text-violet-400"
          }`}
        >
          {isMe ? "You" : activity.createdBy || "Team member"}
        </span>
        <time
          className={`text-[9px] font-semibold tabular-nums ${
            isMe ? "text-violet-200/75" : "text-gray-400 dark:text-slate-500"
          }`}
          dateTime={activity.createdAt}
        >
          {formatMessageTimestamp(activity.createdAt)}
        </time>
      </div>
      {typeLabel ? (
        <span className="inline-flex items-center rounded-md border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300 mb-1.5 self-start">
          {typeLabel}
        </span>
      ) : null}
      <FormattedDiscussionContent
        content={activity.content}
        isMe={isMe}
        className={`text-[13px] leading-relaxed w-full ${
          isMe ? "text-white" : "text-gray-700 dark:text-slate-200"
        }`}
      />
    </article>
  );
}

const sendBtnClass =
  "inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-500/10";

export function LeadDetailsSection({ lead, highlighted = false }: LeadDetailsSectionProps) {
  const {
    getLeadActivities,
    postLeadDiscussionMessage,
    showToast,
    currentUser,
    updateLeadNotes,
    canModifyLeads,
    patchLeadDriveFolder,
    isEditLeadOpen,
  } = useCrmLayoutContext();

  const [descriptionDraft, setDescriptionDraft] = useState(lead.notes ?? "");
  const [messageEmpty, setMessageEmpty] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    file: File;
    previewUrl: string;
    isImage: boolean;
  } | null>(null);
  const [attachmentCaption, setAttachmentCaption] = useState("");
  const composerRef = useRef<DiscussionMessageComposerHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousLeadIdRef = useRef(lead.id);
  const previousMessageCountRef = useRef<number | null>(null);

  const discussionMessages = useMemo(() => {
    return getLeadActivities(lead.id)
      .filter(isDiscussionActivity)
      .slice()
      .reverse();
  }, [getLeadActivities, lead.id]);

  useEffect(() => {
    setDescriptionDraft(lead.notes ?? "");
  }, [lead.id, lead.notes]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (previousLeadIdRef.current !== lead.id) {
      previousLeadIdRef.current = lead.id;
      previousMessageCountRef.current = discussionMessages.length;
      document.getElementById("crm-main-scroll")?.scrollTo({ top: 0, behavior: "auto" });
      container?.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const prevCount = previousMessageCountRef.current;
    previousMessageCountRef.current = discussionMessages.length;

    if (prevCount !== null && discussionMessages.length > prevCount && container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [lead.id, discussionMessages.length]);

  const handleDescriptionSave = () => {
    if (descriptionDraft === (lead.notes ?? "")) return;
    updateLeadNotes(lead.id, descriptionDraft);
  };

  const handleSendMessage = async () => {
    const trimmed = composerRef.current?.getContent().trim() ?? "";
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await postLeadDiscussionMessage(lead.id, trimmed);
      composerRef.current?.clear();
      setMessageEmpty(true);
    } catch {
      showToast("Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
  };

  const ensureLeadDriveFolder = async (): Promise<string | null> => {
    if (lead.driveFolderId) return lead.driveFolderId;

    const res = await fetch(`/api/leads/${lead.id}/drive-create`, { method: "POST" });
    const data = (await res.json()) as { driveFolderId?: string; error?: string };

    if (!res.ok || !data.driveFolderId) {
      showToast(
        data.error ?? "Could not access client Drive folder. Link or create one in Settings.",
        "error"
      );
      return null;
    }

    patchLeadDriveFolder(lead.id, data.driveFolderId);
    return data.driveFolderId;
  };

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(file.name);
    const previewUrl = URL.createObjectURL(file);

    setAttachmentPreview({
      file,
      previewUrl,
      isImage,
    });
    setAttachmentCaption("");
  };

  const handleSendAttachment = async () => {
    if (!attachmentPreview || isAttaching) return;
    const { file, previewUrl } = attachmentPreview;

    setIsAttaching(true);
    try {
      const folderId = await ensureLeadDriveFolder();
      if (!folderId) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("parentId", folderId);

      const res = await fetch("/api/drive/browse", { method: "POST", body: formData });
      const data = (await res.json()) as {
        file?: { id: string; name: string; webViewLink?: string };
        error?: string;
      };

      if (!res.ok || !data.file) {
        showToast(data.error ?? "Failed to upload file to client Drive", "error");
        return;
      }

      const fileLink =
        data.file.webViewLink ??
        `https://drive.google.com/file/d/${data.file.id}/view`;

      // Compose the message content
      const captionPrefix = attachmentCaption.trim() ? `${attachmentCaption.trim()}<br><br>` : "";
      const messageContent = `${captionPrefix}Attached file: <a href="${fileLink}" target="_blank" rel="noopener noreferrer">${file.name}</a>`;

      await postLeadDiscussionMessage(lead.id, messageContent);
      showToast("File posted in discussion", "success");

      // Cleanup
      URL.revokeObjectURL(previewUrl);
      setAttachmentPreview(null);
    } catch {
      showToast("Failed to send attachment", "error");
    } finally {
      setIsAttaching(false);
    }
  };

  const sourceLabel = LEAD_SOURCE_LABELS[lead.source] ?? lead.source;
  const employmentCategory = lead.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY;
  const employmentLabel =
    EMPLOYMENT_CATEGORY_OPTIONS.find((opt) => opt.value === employmentCategory)?.label ??
    employmentCategory;

  const formatAnnualIncome = (val?: string) => {
    if (!val) return "—";
    const num = parseFloat(val);
    if (Number.isNaN(num)) return val;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div
      className={
        isEditLeadOpen
          ? "grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start"
          : "grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start xl:items-stretch h-full min-h-0"
      }
    >
      <div
        className={
          isEditLeadOpen
            ? "min-w-0 flex flex-col"
            : "min-w-0 flex flex-col xl:h-full xl:min-h-0 xl:overflow-hidden"
        }
      >
        <section
          className={
            isEditLeadOpen
              ? "flex flex-col"
              : "flex flex-col xl:flex-1 xl:min-h-0 xl:h-full xl:overflow-hidden"
          }
        >
          <div
            id="lead-details-scroll"
            ref={scrollContainerRef}
            className={
              isEditLeadOpen
                ? "crm-slim-scrollbar pr-3"
                : "crm-slim-scrollbar xl:flex-1 xl:min-h-0 xl:overflow-y-auto pr-3"
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3">
              <DetailField icon={FiUser} label="Name" value={lead.name} />
              <DetailField icon={FiMail} label="Email" value={lead.email} />
              <DetailField icon={FiPhone} label="Phone" value={lead.phone} />
              <DetailField icon={FiGlobe} label="Country" value={lead.country} />
              <DetailField icon={FiFileText} label="Visa Type" value={lead.visaType} />
              <DetailField icon={FiLink} label="Source" value={sourceLabel} />
              <DetailField
                icon={FiBriefcase}
                label="Employment Category"
                value={employmentLabel}
              />
              <DetailField icon={FiDollarSign} label="Annual Income" value={formatAnnualIncome(lead.annualIncome)} />
              <DetailField icon={FiFileText} label="Passport Number" value={lead.passportNumber ?? ""} />
              <DetailField icon={FiCalendar} label="Passport Issue Date" value={lead.passportIssueDate ? formatDisplayDate(lead.passportIssueDate) : ""} />
              <DetailField icon={FiCalendar} label="Passport Expiry Date" value={lead.passportExpiryDate ? formatDisplayDate(lead.passportExpiryDate) : ""} />
              <DetailField icon={FiGlobe} label="Passport Place of Issue" value={lead.passportPlaceOfIssue ?? ""} />
            </div>



            <div className="mt-5">
              <label
                htmlFor={`lead-description-${lead.id}`}
                className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 block mb-2"
              >
                Description
              </label>
              <textarea
                id={`lead-description-${lead.id}`}
                rows={3}
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleDescriptionSave();
                    (e.target as HTMLTextAreaElement).blur();
                  }
                }}
                disabled={!canModifyLeads}
                placeholder="No description provided."
                className="lead-description-input w-full rounded-xl border border-gray-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-[#0f172a]/40 text-[13px] leading-relaxed p-3 focus:outline-none placeholder-gray-400 dark:placeholder-slate-500 text-gray-700 dark:text-slate-200 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <DiscussionDivider />

            <div className="flex flex-col gap-3.5 pb-2">
              {discussionMessages.length === 0 ? (
                <p className="text-center text-xs text-gray-400 dark:text-slate-500 py-8">
                  No messages yet
                </p>
              ) : (
                discussionMessages.map((activity) => (
                  <MessageBubble key={activity.id} activity={activity} />
                ))
              )}
            </div>
          </div>

          <div className="shrink-0 z-10 pt-4 pb-1 border-t border-gray-200/60 dark:border-slate-800/80 bg-[#070712]/95 backdrop-blur-sm">
            <div className="rounded-2xl border border-gray-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-[#0a0e1f]/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none px-4 py-4">
              <DiscussionMessageComposer
                ref={composerRef}
                placeholder="Message team members about this lead..."
                onEmptyChange={setMessageEmpty}
                onSend={() => void handleSendMessage()}
              />

              <div className="flex items-center justify-between gap-3 mt-3">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => void handleAttachFile(e)}
                    disabled={isAttaching}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAttaching}
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 border border-gray-200/80 dark:border-slate-600/80 rounded-xl disabled:opacity-50"
                  >
                    <FiPaperclip className="text-sm" />
                    {isAttaching ? "Attaching…" : "Attach File"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={messageEmpty || isSending}
                  className={sendBtnClass}
                >
                  <FiSend className="text-sm" />
                  {isSending ? "Sending…" : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div
        className={
          isEditLeadOpen
            ? "min-w-0 xl:sticky xl:top-4"
            : "min-w-0 xl:min-h-0 xl:h-full xl:overflow-y-auto crm-slim-scrollbar pr-0.5 overscroll-y-contain"
        }
      >
        <LeadManagementCard
          lead={lead}
          highlighted={highlighted}
          className="min-w-0 w-full"
        />
      </div>

      {attachmentPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-4 transition-all">
          <div className="w-full max-w-md bg-white dark:bg-[#0c0d21] border border-slate-200/80 dark:border-slate-800/80 rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.12)] flex flex-col h-[500px] animate-in fade-in zoom-in-95 duration-250 backdrop-blur-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-[#090a18]/50">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate max-w-[80%]">
                {attachmentPreview.file.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(attachmentPreview.previewUrl);
                  setAttachmentPreview(null);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {/* Preview Body */}
            <div className="flex-1 min-h-0 bg-white dark:bg-[#070712] flex items-center justify-center p-6 relative">
              {attachmentPreview.isImage ? (
                <div className="w-full h-full flex items-center justify-center p-2 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900">
                  <img
                    src={attachmentPreview.previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded-xl select-none"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900">
                  <div className="w-20 h-20 rounded-3xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm border border-violet-100/50 dark:border-violet-900/30">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center truncate max-w-[240px]" title={attachmentPreview.file.name}>
                    {attachmentPreview.file.name}
                  </span>
                  <span className="text-[10px] bg-violet-50 dark:bg-violet-900/40 px-3 py-1.5 rounded-full border border-violet-100/50 dark:border-violet-900/20 text-violet-600 dark:text-violet-400 font-semibold shadow-sm">
                    {(attachmentPreview.file.size / 1024).toFixed(1)} kB
                  </span>
                </div>
              )}

              {/* Uploading indicator overlay */}
              {isAttaching && (
                <div className="absolute inset-0 bg-white/90 dark:bg-[#070712]/90 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-t-violet-600 border-slate-200 dark:border-slate-800 animate-spin" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Uploading to Drive…</span>
                </div>
              )}
            </div>

            {/* Footer with Caption Input & Send */}
            <div className="p-4 bg-slate-50/50 dark:bg-[#0c0d21]/50 border-t border-slate-100 dark:border-slate-900 flex items-center gap-3.5">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={attachmentCaption}
                  onChange={(e) => setAttachmentCaption(e.target.value)}
                  placeholder="Type a message (caption)..."
                  className="w-full bg-white dark:bg-[#070712] border border-slate-200 dark:border-slate-800/80 text-slate-850 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-500 text-sm py-3.5 px-5 rounded-[20px] focus:outline-none focus:border-violet-500/80 transition-colors shadow-sm focus:shadow-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isAttaching) {
                      e.preventDefault();
                      void handleSendAttachment();
                    }
                  }}
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => void handleSendAttachment()}
                disabled={isAttaching}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 flex items-center justify-center text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)] active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all cursor-pointer shrink-0"
                title="Send attachment"
              >
                <FiSend className="text-base translate-x-[1px] -translate-y-[0.5px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
