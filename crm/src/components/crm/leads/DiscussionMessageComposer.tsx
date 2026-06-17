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
    </div>
  );
});
