import React from "react";
import { isDiscussionHtml, sanitizeDiscussionHtml } from "@/utils/discussionMessageFormat";

type FormattedDiscussionContentProps = {
  content: string;
  className?: string;
  isMe?: boolean;
};

function parseInlineMarkdown(text: string, isMe = false, keyPrefix = "md"): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < text.length) {
    const rest = text.slice(index);

    const linkMatch = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const label = linkMatch[1];
      const url = linkMatch[2];
      nodes.push(
        <a
          key={`${keyPrefix}-${key++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isMe
              ? "text-violet-200 underline hover:text-violet-100 transition-colors"
              : "text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:text-violet-700 dark:hover:text-violet-300"
          }
          style={isMe ? { color: "#e9d5ff", textDecoration: "underline" } : undefined}
        >
          {label}
        </a>
      );
      index += linkMatch[0].length;
      continue;
    }

    const boldMatch = rest.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      nodes.push(
        <strong key={`${keyPrefix}-${key++}`}>
          {parseInlineMarkdown(boldMatch[1], isMe, `${keyPrefix}-b${key}`)}
        </strong>
      );
      index += boldMatch[0].length;
      continue;
    }

    const underlineMatch = rest.match(/^\+\+([^+]+)\+\+/);
    if (underlineMatch) {
      nodes.push(
        <u key={`${keyPrefix}-${key++}`}>
          {parseInlineMarkdown(underlineMatch[1], isMe, `${keyPrefix}-u${key}`)}
        </u>
      );
      index += underlineMatch[0].length;
      continue;
    }

    const italicMatch = rest.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      nodes.push(
        <em key={`${keyPrefix}-${key++}`}>
          {parseInlineMarkdown(italicMatch[1], isMe, `${keyPrefix}-i${key}`)}
        </em>
      );
      index += italicMatch[0].length;
      continue;
    }

    const nextSpecial = rest.search(/[\[*+]/);
    const plainLength = nextSpecial === -1 ? rest.length : nextSpecial === 0 ? 1 : nextSpecial;
    nodes.push(rest.slice(0, plainLength));
    index += plainLength;
  }

  return nodes.length > 0 ? nodes : [text];
}

function renderMarkdownContent(content: string, className: string, isMe = false, forceWhiteRef?: any) {
  const lines = content.split("\n");

  return (
    <div
      ref={forceWhiteRef}
      className={`discussion-message-content ${className} ${isMe ? "discussion-message-content--me" : ""}`}
      style={isMe ? { color: "#ffffff" } : undefined}
    >
      {lines.map((line, lineIndex) => {
        const isListItem = line.startsWith("- ");
        const lineContent = isListItem ? line.slice(2) : line;

        return (
          <p
            key={lineIndex}
            className={
              isListItem
                ? "flex gap-2 pl-1"
                : lineIndex > 0
                  ? "mt-1"
                  : undefined
            }
            style={isMe ? { color: "#ffffff" } : undefined}
          >
            {isListItem ? (
              <span aria-hidden="true" className="shrink-0 text-gray-500 dark:text-slate-400">
                •
              </span>
            ) : null}
            <span
              className="min-w-0 break-words"
              style={isMe ? { color: "#ffffff" } : undefined}
            >
              {parseInlineMarkdown(lineContent, isMe)}
            </span>
          </p>
        );
      })}
    </div>
  );
}

export function FormattedDiscussionContent({
  content,
  className = "",
  isMe = false,
}: FormattedDiscussionContentProps) {
  const normalizedContent = (content || "").replace(/&nbsp;/g, " ");
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const forceWhiteRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      if (!el || !isMe) return;
      el.style.setProperty("color", "#ffffff", "important");
      const children = el.querySelectorAll("*");
      children.forEach((child) => {
        if (child instanceof HTMLElement) {
          if (child.tagName === "A") {
            child.style.setProperty("color", "#e9d5ff", "important");
            child.style.setProperty("text-decoration", "underline", "important");
          } else {
            child.style.setProperty("color", "#ffffff", "important");
          }
        }
      });
    },
    [isMe, content]
  );

  if (isDiscussionHtml(normalizedContent)) {
    const safeHtml = sanitizeDiscussionHtml(normalizedContent);

    if (!isMounted) {
      return (
        <div
          className={`discussion-message-content ${className} ${isMe ? "discussion-message-content--me" : ""}`}
          style={isMe ? { color: "#ffffff" } : undefined}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      );
    }

    // Client-side DOM parsing to detect links and apply styles
    const doc = new DOMParser().parseFromString(`<div>${safeHtml}</div>`, "text/html");
    const container = doc.body.firstElementChild;

    if (container) {
      if (isMe) {
        // Force ALL child elements inside my messages to have white text color
        const allElements = Array.from(container.querySelectorAll("*"));
        for (const el of allElements) {
          if (el.tagName === "A") {
            el.className = "text-violet-200 underline hover:text-violet-100 transition-colors";
            el.setAttribute("style", "color: #e9d5ff !important; text-decoration: underline !important;");
          } else {
            el.setAttribute("style", "color: #ffffff !important;");
          }
        }
      }
      return (
        <div
          ref={forceWhiteRef}
          className={`discussion-message-content ${className} ${isMe ? "discussion-message-content--me" : ""}`}
          style={isMe ? { color: "#ffffff" } : undefined}
          dangerouslySetInnerHTML={{ __html: container.innerHTML }}
        />
      );
    }
  }

  return renderMarkdownContent(normalizedContent, className, isMe, forceWhiteRef);
}
