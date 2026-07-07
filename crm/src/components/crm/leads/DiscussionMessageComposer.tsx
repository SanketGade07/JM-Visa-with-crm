"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FiBold, FiItalic, FiLink, FiList, FiUnderline } from "react-icons/fi";
import {
  applyEditorFormat,
  getActiveEditorFormats,
  isDiscussionEditorEmpty,
  serializeDiscussionContent,
  type DiscussionFormatAction,
} from "@/utils/discussionMessageFormat";

export type DiscussionMessageComposerHandle = {
  getContent: () => string;
  clear: () => void;
  isEmpty: () => boolean;
};

type DiscussionMessageComposerProps = {
  onEmptyChange?: (isEmpty: boolean) => void;
  onSend?: () => void;
  placeholder?: string;
};

const TOOLBAR_ITEMS = [
  { Icon: FiBold, label: "Bold", action: "bold" as const },
  { Icon: FiItalic, label: "Italic", action: "italic" as const },
  { Icon: FiUnderline, label: "Underline", action: "underline" as const },
  { Icon: FiList, label: "Bullet list", action: "list" as const },
  { Icon: FiLink, label: "Link", action: "link" as const },
] as const;

export const DiscussionMessageComposer = forwardRef<
  DiscussionMessageComposerHandle,
  DiscussionMessageComposerProps
>(function DiscussionMessageComposer({ onEmptyChange, onSend, placeholder }, ref) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<DiscussionFormatAction>>(
    () => new Set()
  );
  const [isEmpty, setIsEmpty] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const syncEmpty = () => {
    const empty = isDiscussionEditorEmpty(editorRef.current);
    setIsEmpty(empty);
    onEmptyChange?.(empty);
  };

  const syncActiveFormats = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!selection || !editor || selection.rangeCount === 0) return;

    const anchor = selection.anchorNode;
    if (!anchor || !editor.contains(anchor)) return;

    const formats = getActiveEditorFormats(editor);

    setActiveFormats(formats);
  };

  useImperativeHandle(ref, () => ({
    getContent: () => serializeDiscussionContent(editorRef.current?.innerHTML ?? ""),
    clear: () => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
      syncEmpty();
      setActiveFormats(new Set());
    },
    isEmpty: () => isDiscussionEditorEmpty(editorRef.current),
  }));

  useEffect(() => {
    const onSelectionChange = () => syncActiveFormats();
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  const handleFormat = (action: DiscussionFormatAction) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (action === "link") {
      const selection = window.getSelection();
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      setSavedRange(range);
      setLinkUrl("https://");
      setShowLinkModal(true);
      return;
    }

    applyEditorFormat(editor, action);
    syncActiveFormats();
    syncEmpty();
  };

  return (
    <div>
      <div className="flex items-center gap-1 mb-2" role="toolbar" aria-label="Message formatting">
        {TOOLBAR_ITEMS.map(({ Icon, label, action }) => {
          const isActive = activeFormats.has(action);
          return (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={isActive}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleFormat(action)}
              className={`discussion-format-btn p-2 rounded-lg transition-colors ${
                isActive ? "discussion-format-btn--active" : ""
              } ${
                isActive
                  ? "bg-violet-600 text-white shadow-sm ring-2 ring-violet-400/50 dark:bg-violet-500 dark:ring-violet-300/40"
                  : "text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/80"
              }`}
            >
              <Icon className="text-sm" />
            </button>
          );
        })}
      </div>

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Message"
        data-placeholder={placeholder}
        onInput={syncEmpty}
        onBlur={syncEmpty}
        onFocus={syncActiveFormats}
        onKeyUp={syncActiveFormats}
        onMouseUp={syncActiveFormats}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSend?.();
          }
        }}
        className={`discussion-rich-editor discussion-message-input crm-slim-scrollbar w-full min-h-[5.5rem] max-h-40 overflow-y-auto rounded-xl border border-gray-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-[#0f172a]/40 text-[13px] leading-relaxed p-3 focus:outline-none placeholder-gray-400 dark:placeholder-slate-500 text-gray-700 dark:text-slate-200 ${
          isEmpty ? "is-empty" : ""
        }`}
      />

      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-[#020207]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0a0a1a] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-white">Insert Link URL</h3>
            <div className="space-y-1.5 text-left text-xs">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-slate-950 border border-slate-800 py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 font-mono text-[11px]"
              />
            </div>
            <div className="flex justify-end space-x-2 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setSavedRange(null);
                }}
                className="px-3 py-1.5 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const editor = editorRef.current;
                  if (!editor) return;
                  editor.focus();
                  if (savedRange) {
                    const selection = window.getSelection();
                    if (selection) {
                      selection.removeAllRanges();
                      selection.addRange(savedRange);
                    }
                  }
                  if (linkUrl.trim()) {
                    document.execCommand("createLink", false, linkUrl.trim());
                  }
                  setShowLinkModal(false);
                  setLinkUrl("https://");
                  setSavedRange(null);
                  syncActiveFormats();
                  syncEmpty();
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
