import React from "react";
import { isDiscussionHtml, sanitizeDiscussionHtml } from "@/utils/discussionMessageFormat";

type FormattedDiscussionContentProps = {
  content: string;
  className?: string;
};

function parseInlineMarkdown(text: string, keyPrefix = "md"): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < text.length) {
    const rest = text.slice(index);

    const linkMatch = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      nodes.push(
        <a
          key={`${keyPrefix}-${key++}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:text-violet-700 dark:hover:text-violet-300"
        >
          {linkMatch[1]}
        </a>
      );
      index += linkMatch[0].length;
      continue;
    }

    const boldMatch = rest.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      nodes.push(
        <strong key={`${keyPrefix}-${key++}`}>
          {parseInlineMarkdown(boldMatch[1], `${keyPrefix}-b${key}`)}
        </strong>
      );
      index += boldMatch[0].length;
      continue;
    }

    const underlineMatch = rest.match(/^\+\+([^+]+)\+\+/);
    if (underlineMatch) {
      nodes.push(
        <u key={`${keyPrefix}-${key++}`}>
          {parseInlineMarkdown(underlineMatch[1], `${keyPrefix}-u${key}`)}
        </u>
      );
      index += underlineMatch[0].length;
      continue;
    }

    const italicMatch = rest.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      nodes.push(
        <em key={`${keyPrefix}-${key++}`}>
          {parseInlineMarkdown(italicMatch[1], `${keyPrefix}-i${key}`)}
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

function renderMarkdownContent(content: string, className: string) {
  const lines = content.split("\n");

  return (
    <div className={className}>
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
          >
            {isListItem ? (
              <span aria-hidden="true" className="shrink-0 text-gray-500 dark:text-slate-400">
                •
              </span>
            ) : null}
            <span className="min-w-0 break-words">{parseInlineMarkdown(lineContent)}</span>
          </p>
        );
      })}
    </div>
  );
}

export function FormattedDiscussionContent({
  content,
  className = "",
}: FormattedDiscussionContentProps) {
  if (isDiscussionHtml(content)) {
    const safeHtml = sanitizeDiscussionHtml(content);
    return (
      <div
        className={`discussion-message-content ${className}`}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  }

  return renderMarkdownContent(content, className);
}
