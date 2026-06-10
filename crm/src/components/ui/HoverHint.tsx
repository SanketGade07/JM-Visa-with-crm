"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

type HoverHintProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

export function HoverHint({ label, onClick, disabled, children }: HoverHintProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onClick();
  };

  const tooltip =
    visible && !disabled && mounted ? (
      <div
        role="tooltip"
        className="pointer-events-none fixed z-[10000] px-2.5 py-1.5 text-[10px] font-semibold leading-tight whitespace-nowrap rounded-md border shadow-md bg-white border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, calc(-100% - 10px))",
        }}
      >
        {label}
        <span
          className="absolute left-1/2 top-full -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-white dark:border-t-slate-800"
          aria-hidden
        />
      </div>
    ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => {
          if (disabled) return;
          updatePos();
          setVisible(true);
        }}
        onMouseLeave={() => setVisible(false)}
        onClick={handleClick}
        className={disabled ? "cursor-default" : "cursor-pointer"}
      >
        {children}
      </div>
      {tooltip && createPortal(tooltip, document.body)}
    </>
  );
}
