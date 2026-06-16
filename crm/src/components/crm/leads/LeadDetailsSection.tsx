"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Activity, Lead, LeadSource } from "@/context/CrmContext";
import {
  FiBold,
  FiFileText,
  FiGlobe,
  FiItalic,
  FiLink,
  FiList,
  FiMail,
  FiPaperclip,
  FiPhone,
  FiSend,
  FiUnderline,
  FiUser,
} from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";
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
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-800/40 flex items-center justify-center shrink-0">
        <Icon className="text-sm text-blue-600 dark:text-blue-400" />
      </div>
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
    <article className="rounded-xl border border-gray-200 dark:border-slate-800/80 bg-gray-50/80 dark:bg-slate-800/30 px-4 py-3">
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
      <p className="text-[13px] leading-relaxed text-gray-700 dark:text-slate-200 whitespace-pre-wrap break-words">
        {activity.content}
      </p>
    </article>
  );
}

const sendBtnClass =
  "inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-violet-500/10";

export function LeadDetailsSection({ lead, highlighted = false }: LeadDetailsSectionProps) {
  const {
    getLeadActivities,
    postLeadDiscussionMessage,
    uploadDocument,
    showToast,
    currentUser,
  } = useCrmLayoutContext();

  const [messageDraft, setMessageDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threadContainerRef = useRef<HTMLDivElement>(null);

  const discussionMessages = useMemo(() => {
    return getLeadActivities(lead.id)
      .filter(isDiscussionActivity)
      .slice()
      .reverse();
  }, [getLeadActivities, lead.id]);

  useEffect(() => {
    const container = threadContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [discussionMessages.length]);

  const handleSendMessage = async () => {
    const trimmed = messageDraft.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await postLeadDiscussionMessage(lead.id, trimmed);
      setMessageDraft("");
    } catch {
      showToast("Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isAttaching) return;

    setIsAttaching(true);
    try {
      const res = await uploadDocument(lead.id, "discussion", file);
      if (!res.ok) {
        showToast(res.error ?? "Failed to attach file", "error");
        return;
      }
      await postLeadDiscussionMessage(lead.id, `Attached file: ${file.name}`);
      showToast("File attached to discussion", "success");
    } catch {
      showToast("Failed to attach file", "error");
    } finally {
      setIsAttaching(false);
    }
  };

  const sourceLabel = LEAD_SOURCE_LABELS[lead.source] ?? lead.source;
  const description = lead.notes?.trim() || "No description provided.";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start xl:items-stretch">
      <div className="min-w-0 min-h-0">
        <section className="rounded-2xl border border-gray-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col h-[calc(100dvh-8rem)] max-h-[calc(100dvh-8rem)] overflow-hidden">
          <div className="shrink-0 overflow-y-auto max-h-[min(38%,280px)] border-b border-gray-100 dark:border-slate-800/80 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField icon={FiUser} label="Name" value={lead.name} />
              <DetailField icon={FiMail} label="Email" value={lead.email} />
              <DetailField icon={FiPhone} label="Phone" value={lead.phone} />
              <DetailField icon={FiGlobe} label="Country" value={lead.country} />
              <DetailField icon={FiFileText} label="Visa Type" value={lead.visaType} />
              <DetailField icon={FiLink} label="Source" value={sourceLabel} />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 block mb-2">
                Description
              </span>
              <p className="text-[13px] leading-relaxed text-gray-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0">
            <div className="shrink-0 px-5">
              <DiscussionDivider />
            </div>

            <div
              ref={threadContainerRef}
              className="flex-1 min-h-0 overflow-y-auto px-5 pb-3 space-y-3"
            >
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

            <div className="shrink-0 p-4 pt-2">
              <div className="rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50/60 dark:bg-slate-800/30 overflow-hidden shadow-sm">
                <div
                  className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60"
                  aria-hidden="true"
                >
                  {[
                    { Icon: FiBold, label: "Bold" },
                    { Icon: FiItalic, label: "Italic" },
                    { Icon: FiUnderline, label: "Underline" },
                    { Icon: FiList, label: "List" },
                    { Icon: FiLink, label: "Link" },
                  ].map(({ Icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      tabIndex={-1}
                      aria-hidden="true"
                      className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors cursor-default"
                    >
                      <Icon className="text-sm" />
                    </button>
                  ))}
                </div>

                <textarea
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  rows={3}
                  placeholder="Message team members about this lead..."
                  className="w-full bg-white dark:bg-slate-900/40 border-0 text-sm p-3 focus:outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-slate-500 text-gray-700 dark:text-slate-200 resize-none"
                />

                <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-t border-gray-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60">
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
                      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/60 disabled:opacity-50 transition-colors"
                    >
                      <FiPaperclip className="text-sm" />
                      {isAttaching ? "Attaching…" : "Attach File"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={!messageDraft.trim() || isSending}
                    className={sendBtnClass}
                  >
                    <FiSend className="text-sm" />
                    {isSending ? "Sending…" : "Send Message"}
                  </button>
                </div>
              </div>
              {currentUser?.name ? (
                <p className="mt-2 text-[10px] text-gray-400 dark:text-slate-500">
                  Posting as {currentUser.name}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <LeadManagementCard
        lead={lead}
        highlighted={highlighted}
        className="xl:sticky xl:top-4"
      />
    </div>
  );
}
