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
  if (activity.type === "discussion") return true;
  if (activity.type === "note" && !isSystemAuditNote(activity.content)) return true;
  return false;
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
        <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
          Discussion Started
        </span>
      </div>
    </div>
  );
}

function MessageBubble({ activity }: { activity: Activity }) {
  const typeLabel =
    activity.type === "call"
      ? "Call"
      : activity.type === "email"
        ? "Email"
        : null;

  return (
    <article className="rounded-lg bg-gray-100/70 dark:bg-slate-800/25 px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-1.5">
        <span className="text-xs font-bold text-gray-800 dark:text-slate-100">
          {activity.createdBy || "Team member"}
        </span>
        <time
          className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 tabular-nums"
          dateTime={activity.createdAt}
        >
          {formatMessageTimestamp(activity.createdAt)}
        </time>
      </div>
      {typeLabel ? (
        <span className="inline-flex items-center rounded-md border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300 mb-1.5">
          {typeLabel}
        </span>
      ) : null}
      <FormattedDiscussionContent
        content={activity.content}
        className="text-[13px] leading-relaxed text-gray-700 dark:text-slate-200"
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
  } = useCrmLayoutContext();

  const [descriptionDraft, setDescriptionDraft] = useState(lead.notes ?? "");
  const [messageEmpty, setMessageEmpty] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
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
    if (!container) return;

    if (previousLeadIdRef.current !== lead.id) {
      previousLeadIdRef.current = lead.id;
      previousMessageCountRef.current = discussionMessages.length;
      container.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const prevCount = previousMessageCountRef.current;
    previousMessageCountRef.current = discussionMessages.length;

    if (prevCount !== null && discussionMessages.length > prevCount) {
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

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isAttaching) return;

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

      await postLeadDiscussionMessage(
        lead.id,
        `Attached file: [${file.name}](${fileLink})`
      );
      showToast("File added to client Drive and discussion", "success");
    } catch {
      showToast("Failed to attach file", "error");
    } finally {
      setIsAttaching(false);
    }
  };

  const sourceLabel = LEAD_SOURCE_LABELS[lead.source] ?? lead.source;
  const employmentCategory = lead.employmentCategory ?? DEFAULT_EMPLOYMENT_CATEGORY;
  const employmentLabel =
    EMPLOYMENT_CATEGORY_OPTIONS.find((opt) => opt.value === employmentCategory)?.label ??
    employmentCategory;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-stretch flex-1 min-h-0 h-full">
      <div className="min-w-0 min-h-0 h-full flex flex-col">
        <section className="flex flex-col h-full min-h-0 overflow-hidden">
          <div
            id="lead-details-scroll"
            ref={scrollContainerRef}
            className="crm-slim-scrollbar flex-1 min-h-0 overflow-y-auto px-5 pt-2 pb-4"
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
            </div>

            {isUsaCountry(lead.country) ? (
              <div className="mt-5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">
                  USA Slot Tracking
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                  <InfoDetailField
                    label="Mobile Number"
                    value={lead.usaSlots?.trackingMobile?.trim() ?? ""}
                  />
                  <InfoDetailField
                    label="Car"
                    value={lead.usaSlots?.securityCar?.trim() ?? ""}
                  />
                  <InfoDetailField
                    label="Food"
                    value={lead.usaSlots?.securityFood?.trim() ?? ""}
                  />
                  <InfoDetailField
                    label="City"
                    value={lead.usaSlots?.securityCity?.trim() ?? ""}
                  />
                </div>
              </div>
            ) : null}

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

            <div className="space-y-3 pb-3">
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

          <div
            className="shrink-0 mx-5 mt-5 mb-0 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-[#0a0e1f]/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none px-4 py-4"
          >
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
            {currentUser?.name ? (
              <p className="mt-2 text-[10px] text-gray-400 dark:text-slate-500">
                Posting as {currentUser.name}
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <LeadManagementCard
        lead={lead}
        highlighted={highlighted}
        className="xl:sticky xl:top-4 min-w-0 h-fit self-start w-full"
      />
    </div>
  );
}
