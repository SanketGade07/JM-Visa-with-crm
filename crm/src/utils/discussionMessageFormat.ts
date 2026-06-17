export type DiscussionFormatAction = "bold" | "italic" | "underline" | "list" | "link";

const FORMAT_COMMANDS: Record<Exclude<DiscussionFormatAction, "link">, string> = {
  bold: "bold",
  italic: "italic",
  underline: "underline",
  list: "insertUnorderedList",
};

const ALLOWED_TAGS = new Set([
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "A",
  "UL",
  "OL",
  "LI",
  "BR",
  "P",
  "DIV",
]);

const HTML_CONTENT_PATTERN = /<\/?(?:b|strong|i|em|u|a|ul|ol|li|br|p|div)\b/i;

export function applyEditorFormat(editor: HTMLElement, action: DiscussionFormatAction): void {
  editor.focus();

  if (action === "link") {
    const url = window.prompt("Enter URL:", "https://");
    if (url?.trim()) {
      document.execCommand("createLink", false, url.trim());
    }
    return;
  }

  document.execCommand(FORMAT_COMMANDS[action], false);
}

export function getActiveEditorFormats(editor: HTMLElement | null): Set<DiscussionFormatAction> {
  const active = new Set<DiscussionFormatAction>();

  try {
    if (document.queryCommandState("bold")) active.add("bold");
    if (document.queryCommandState("italic")) active.add("italic");
    if (document.queryCommandState("underline")) active.add("underline");
    if (document.queryCommandState("insertUnorderedList")) active.add("list");
  } catch {
    // queryCommandState can throw when the editor is not focused
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !editor) {
    return active;
  }

  const anchor = selection.anchorNode;
  if (!anchor || !editor.contains(anchor)) {
    return active;
  }

  let node: Node | null = anchor;
  while (node && node !== editor) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tag = element.tagName;

      if (tag === "B" || tag === "STRONG") active.add("bold");
      if (tag === "I" || tag === "EM") active.add("italic");
      if (tag === "U") active.add("underline");
      if (tag === "A") active.add("link");
      if (tag === "UL" || tag === "OL" || tag === "LI") active.add("list");

      const style = element.getAttribute("style") ?? "";
      if (isBoldStyle(style)) active.add("bold");
      if (isItalicStyle(style)) active.add("italic");
      if (isUnderlineStyle(style)) active.add("underline");
    }
    node = node.parentNode;
  }

  return active;
}

export function isDiscussionEditorEmpty(editor: HTMLElement | null): boolean {
  if (!editor) return true;
  return (editor.innerText ?? "").replace(/\u00a0/g, " ").trim().length === 0;
}

export function isDiscussionHtml(content: string): boolean {
  return HTML_CONTENT_PATTERN.test(content);
}

function unwrapElement(element: Element) {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

function isBoldStyle(style: string): boolean {
  return /font-weight:\s*(bold|[6-9]00)/i.test(style);
}

function isItalicStyle(style: string): boolean {
  return /font-style:\s*italic/i.test(style);
}

function isUnderlineStyle(style: string): boolean {
  return /text-decoration(?:-line)?:\s*[^;]*underline/i.test(style);
}

function wrapHtml(content: string, tag: "b" | "i" | "u"): string {
  return `<${tag}>${content}</${tag}>`;
}

function normalizeStyledElements(root: Element) {
  const styled = Array.from(root.querySelectorAll("span[style], font")).reverse();

  for (const element of styled) {
    const style = element.getAttribute("style") ?? "";
    let html = element.innerHTML;

    if (isUnderlineStyle(style)) html = wrapHtml(html, "u");
    if (isItalicStyle(style)) html = wrapHtml(html, "i");
    if (isBoldStyle(style)) html = wrapHtml(html, "b");

    const template = root.ownerDocument.createElement("template");
    template.innerHTML = html;
    element.replaceWith(...Array.from(template.content.childNodes));
  }
}

function sanitizeDiscussionTree(root: Element) {
  const elements = Array.from(root.querySelectorAll("*")).reverse();

  for (const element of elements) {
    if (!ALLOWED_TAGS.has(element.tagName)) {
      unwrapElement(element);
      continue;
    }

    if (element.tagName === "A") {
      const href = element.getAttribute("href") ?? "";
      if (!/^https?:\/\//i.test(href)) {
        unwrapElement(element);
        continue;
      }

      for (const attr of Array.from(element.attributes)) {
        if (attr.name !== "href") {
          element.removeAttribute(attr.name);
        }
      }
      element.setAttribute("rel", "noopener noreferrer");
      continue;
    }

    for (const attr of Array.from(element.attributes)) {
      element.removeAttribute(attr.name);
    }
  }
}

export function sanitizeDiscussionHtml(html: string): string {
  if (!html.trim()) return "";

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";

  normalizeStyledElements(root);
  sanitizeDiscussionTree(root);

  return root.innerHTML.trim();
}

export function serializeDiscussionContent(html: string): string {
  return sanitizeDiscussionHtml(html);
}
