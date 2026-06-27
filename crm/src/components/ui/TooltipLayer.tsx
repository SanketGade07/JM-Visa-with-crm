"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type TooltipPosition = "top" | "bottom" | "top-left";

type TipState = {
  text: string;
  x: number;
  y: number;
  position: TooltipPosition;
};

/**
 * Global tooltip renderer for `[data-tooltip]` elements.
 *
 * The CSS pseudo-element tooltips ([data-tooltip]::before) are positioned
 * relative to their trigger, so they get clipped by any scrollable ancestor —
 * e.g. the horizontally-scrolling DataTable wrapper (`overflow-x: auto` forces
 * `overflow-y` to clip too). This layer instead renders the tooltip into
 * document.body with `position: fixed`, so it escapes every overflow boundary.
 *
 * It adds `js-tooltips` to <html> while mounted; globals.css uses that to hide
 * the pseudo-element tooltips (so they don't double up), with the CSS version
 * remaining as a no-JS fallback.
 */
export function TooltipLayer() {
  const [tip, setTip] = useState<TipState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add("js-tooltips");
    return () => document.documentElement.classList.remove("js-tooltips");
  }, []);

  useEffect(() => {
    const showFor = (el: Element) => {
      const text = el.getAttribute("data-tooltip");
      if (!text) {
        setTip(null);
        return;
      }
      const position =
        (el.getAttribute("data-tooltip-position") as TooltipPosition | null) ?? "top";
      const rect = el.getBoundingClientRect();
      setTip({
        text,
        // top-left anchors the tooltip's right edge to the trigger's right edge
        // (used for the last action icon so it never spills past the card edge).
        x: position === "top-left" ? rect.right : rect.left + rect.width / 2,
        y: position === "bottom" ? rect.bottom : rect.top,
        position,
      });
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const el = target.closest("[data-tooltip]");
      if (!el) return;
      // Ignore moves that stay inside the same trigger (avoids flicker).
      const related = e.relatedTarget as Node | null;
      if (related && el.contains(related)) return;
      showFor(el);
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const el = target.closest("[data-tooltip]");
      if (!el) return;
      const related = e.relatedTarget as Node | null;
      if (related && el.contains(related)) return;
      setTip(null);
    };

    const clear = () => setTip(null);

    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("mouseout", onOut, true);
    document.addEventListener("click", clear, true);
    window.addEventListener("scroll", clear, true);
    window.addEventListener("resize", clear);

    return () => {
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("mouseout", onOut, true);
      document.removeEventListener("click", clear, true);
      window.removeEventListener("scroll", clear, true);
      window.removeEventListener("resize", clear);
    };
  }, []);

  if (!mounted || !tip) return null;

  const transform =
    tip.position === "bottom"
      ? "translate(-50%, 8px)"
      : tip.position === "top-left"
      ? "translate(-100%, calc(-100% - 8px))"
      : "translate(-50%, calc(-100% - 8px))";

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[10000] px-2.5 py-1.5 text-[11px] font-semibold leading-tight whitespace-nowrap rounded-lg border shadow-md bg-white border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
      style={{ left: tip.x, top: tip.y, transform }}
    >
      {tip.text}
    </div>,
    document.body
  );
}
