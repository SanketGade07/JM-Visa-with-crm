"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

type CollapsiblePanelProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  durationMs?: number;
  /** Bottom spacing inside the collapsing area (default: 1rem / gap-4). */
  contentSpacingClassName?: string;
};

export function CollapsiblePanel({
  open,
  children,
  className = "",
  durationMs = 300,
  contentSpacingClassName = "pb-4",
}: CollapsiblePanelProps) {
  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState(open);
  const gridRef = useRef<HTMLDivElement>(null);
  const expandFrameRef = useRef<number | null>(null);
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearUnmountTimer = () => {
    if (unmountTimerRef.current !== null) {
      clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }
  };

  const scheduleUnmount = () => {
    clearUnmountTimer();
    unmountTimerRef.current = setTimeout(() => {
      unmountTimerRef.current = null;
      setMounted(false);
    }, durationMs + 50);
  };

  useLayoutEffect(() => {
    if (expandFrameRef.current !== null) {
      cancelAnimationFrame(expandFrameRef.current);
      expandFrameRef.current = null;
    }

    if (open) {
      clearUnmountTimer();
      setMounted(true);
      setExpanded(false);
      expandFrameRef.current = requestAnimationFrame(() => {
        expandFrameRef.current = requestAnimationFrame(() => {
          expandFrameRef.current = null;
          setExpanded(true);
        });
      });
      return () => {
        if (expandFrameRef.current !== null) {
          cancelAnimationFrame(expandFrameRef.current);
          expandFrameRef.current = null;
        }
      };
    }

    setExpanded(false);
    scheduleUnmount();
    return clearUnmountTimer;
  }, [open, durationMs]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== gridRef.current) return;
    if (event.propertyName !== "grid-template-rows") return;
    if (!open) {
      clearUnmountTimer();
      setMounted(false);
    }
  };

  if (!mounted && !open) {
    return null;
  }

  const opacityDurationMs = Math.min(200, durationMs);
  const opacityCloseDelayMs = Math.max(0, durationMs - opacityDurationMs);

  return (
    <div
      ref={gridRef}
      className={`grid ${className}`.trim()}
      style={{
        gridTemplateRows: expanded ? "1fr" : "0fr",
        transitionProperty: "grid-template-rows",
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: EASE,
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={`${contentSpacingClassName} ${expanded ? "opacity-100" : "opacity-0"}`.trim()}
          style={{
            transitionProperty: "opacity",
            transitionDuration: `${opacityDurationMs}ms`,
            transitionTimingFunction: EASE,
            transitionDelay: expanded ? "50ms" : `${opacityCloseDelayMs}ms`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
