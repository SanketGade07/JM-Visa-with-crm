"use client";

import { useEffect, useState } from "react";

/** Portal host for custom dropdowns (e.g. phone country list). Scrollbar styles live in globals.css. */
export function useDropdownPortal(id: string, removeOnUnmount = false) {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.setAttribute("id", id);
      el.style.position = "fixed";
      el.style.top = "0";
      el.style.left = "0";
      el.style.width = "0";
      el.style.height = "0";
      el.style.zIndex = "99999";
      el.style.overflow = "visible";
      el.style.pointerEvents = "none";
      document.body.appendChild(el);
    }
    setPortalNode(el);

    return () => {
      if (removeOnUnmount && document.body.contains(el!)) {
        document.body.removeChild(el!);
      }
    };
  }, [id, removeOnUnmount]);

  return portalNode;
}
