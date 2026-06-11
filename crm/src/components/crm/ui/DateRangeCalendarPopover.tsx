"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useCrmLayoutContext } from "../context/CrmLayoutContext";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const POPOVER_WIDTH = 280;

function getDaysInMonth(year: number, month: number): (number | null)[] {
  const date = new Date(year, month, 1);
  const days: (number | null)[] = [];
  const startDay = date.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  const totalDays = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }
  return days;
}

function parseDateParts(dateStr: string): { year: number; month: number } | null {
  if (!dateStr) return null;
  const [year, month] = dateStr.split("-").map(Number);
  if (!year || !month) return null;
  return { year, month: month - 1 };
}

function computePopoverPosition(anchor: HTMLElement): { top: number; left: number } {
  const rect = anchor.getBoundingClientRect();
  const margin = 8;
  let left = rect.right - POPOVER_WIDTH;
  left = Math.max(margin, Math.min(left, window.innerWidth - POPOVER_WIDTH - margin));
  return {
    top: rect.bottom + 4,
    left,
  };
}

export type DateRangeCalendarPopoverProps = {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  onClear: () => void;
  active?: boolean;
};

export function DateRangeCalendarPopover({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onClear,
  active,
}: DateRangeCalendarPopoverProps) {
  const { theme } = useCrmLayoutContext();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const initialParts = parseDateParts(startDate) ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  };
  const [calYear, setCalYear] = useState(initialParts.year);
  const [calMonth, setCalMonth] = useState(initialParts.month);

  const isActive = active ?? !!(startDate || endDate);
  const hasRange = !!(startDate || endDate);

  const updatePopoverPosition = () => {
    if (!anchorRef.current) return;
    setPopoverPos(computePopoverPosition(anchorRef.current));
  };

  const closePopover = () => setOpen(false);

  const openPopover = () => {
    const parts = parseDateParts(startDate);
    if (parts) {
      setCalYear(parts.year);
      setCalMonth(parts.month);
    }
    updatePopoverPosition();
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePopoverPosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      closePopover();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePopover();
    };

    const handleReposition = () => updatePopoverPosition();

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (!startDate || (startDate && endDate)) {
      onStartChange(dateStr);
      onEndChange("");
    } else if (dateStr < startDate) {
      onStartChange(dateStr);
      onEndChange("");
    } else {
      onEndChange(dateStr);
    }
  };

  const handleClear = () => {
    onClear();
    closePopover();
  };

  const popover = open ? (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Date range calendar"
      style={{
        position: "fixed",
        top: popoverPos.top,
        left: popoverPos.left,
        width: POPOVER_WIDTH,
        zIndex: 99999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      className={`rounded-xl border p-3 shadow-lg ${
        theme === "light"
          ? "bg-white border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          : "bg-slate-900 border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`text-[13px] font-semibold tracking-tight ${
            theme === "light" ? "text-gray-900" : "text-white"
          }`}
        >
          Date Range
        </h3>
        {hasRange && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-blue-500 hover:text-blue-400 font-bold px-2 py-0.5 rounded-lg border border-blue-500/20 hover:border-blue-500/40 bg-blue-500/5 transition-all"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Previous month"
          className={`p-1 transition-colors ${
            theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <FiChevronLeft className="text-[13px]" />
        </button>
        <span
          className={`text-[13px] font-semibold tracking-wide ${
            theme === "light" ? "text-gray-800" : "text-slate-200"
          }`}
        >
          {MONTH_NAMES[calMonth]} {calYear}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Next month"
          className={`p-1 transition-colors ${
            theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <FiChevronRight className="text-[13px]" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center mb-2">
        {WEEKDAY_LABELS.map((day) => (
          <span
            key={day}
            className={`text-[11px] font-medium ${
              theme === "light" ? "text-gray-400/90" : "text-slate-500"
            }`}
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center items-center gap-y-1">
        {getDaysInMonth(calYear, calMonth).map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-8" />;
          }

          const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isStart = dateStr === startDate;
          const isEnd = dateStr === endDate;
          const inRange =
            startDate && endDate && dateStr > startDate && dateStr < endDate;
          const isToday = (() => {
            const t = new Date();
            return t.getFullYear() === calYear && t.getMonth() === calMonth && t.getDate() === day;
          })();

          return (
            <div key={day} className="flex justify-center items-center h-8 relative">
              {inRange && (
                <div className="absolute inset-y-1 left-0 right-0 bg-[#2563EB]/10 dark:bg-[#2563EB]/20" />
              )}
              {isStart && endDate && (
                <div className="absolute inset-y-1 left-1/2 right-0 bg-[#2563EB]/10 dark:bg-[#2563EB]/20" />
              )}
              {isEnd && startDate && (
                <div className="absolute inset-y-1 left-0 right-1/2 bg-[#2563EB]/10 dark:bg-[#2563EB]/20" />
              )}
              <button
                type="button"
                onClick={() => handleDateClick(day)}
                className={`w-[28px] h-[28px] flex items-center justify-center rounded-full text-[12px] font-medium transition-all duration-150 relative z-10 ${
                  isStart || isEnd
                    ? "bg-[#2563EB] text-white shadow-[0_3px_8px_rgba(37,99,235,0.4)] font-bold scale-105"
                    : inRange
                      ? "text-[#2563EB] dark:text-blue-400 font-semibold"
                      : isToday
                        ? "border border-[#2563EB] text-[#2563EB] dark:text-blue-400 font-semibold"
                        : theme === "light"
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        title="Date range"
        aria-label="Date range"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? closePopover() : openPopover())}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
          isActive
            ? "text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-sky-400/10 hover:bg-blue-100 dark:hover:bg-sky-400/15"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
        }`}
      >
        <FiCalendar className="text-[14.5px]" />
      </button>
      {typeof document !== "undefined" && popover ? createPortal(popover, document.body) : null}
    </>
  );
}
