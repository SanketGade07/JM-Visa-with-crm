"use client";

import React from "react";
import type { IconType } from "react-icons";
import {
  segmentedTabBadgeHeaderClass,
  segmentedTabButtonHeaderClass,
  segmentedTabListHeaderClass,
} from "@/components/ui/segmentedTabStyles";

export type QuickStatusTab = {
  id: string;
  label: string;
  count: number;
  icon?: IconType;
};

type QuickStatusTabsProps = {
  tabs: QuickStatusTab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  scroll?: boolean;
  variant?: "default" | "header";
};

export function QuickStatusTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  scroll = false,
  variant = "default",
}: QuickStatusTabsProps) {
  const isHeader = variant === "header";

  const tabList = isHeader ? (
    <div
      className={`${segmentedTabListHeaderClass} ${className}`.trim()}
      // When scrollable, force the list to its intrinsic width (overriding the
      // base `max-w-full`) so it overflows the scroll wrapper and scrolls
      // instead of squishing the tabs.
      style={scroll ? { width: "max-content", maxWidth: "none" } : undefined}
      role="tablist"
      aria-label="Lead status filters"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={segmentedTabButtonHeaderClass(isActive)}
          >
            {Icon ? <Icon size={13} aria-hidden="true" /> : null}
            <span>{tab.label.toUpperCase()}</span>
            <span className={segmentedTabBadgeHeaderClass(isActive)} aria-hidden="true">
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  ) : (
    <div
      className={`quick-status-tabs ${className}`.trim()}
      role="tablist"
      aria-label="Lead status filters"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`quick-status-tab${isActive ? " quick-status-tab--active" : ""}`}
          >
            <span className="quick-status-tab__inner">
              <span className="quick-status-tab__label">{tab.label}</span>
              {tab.count > 0 && (
                <span className="quick-status-tab__badge" aria-hidden="true">
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );

  if (scroll) {
    return <div className="quick-status-tabs-outer">{tabList}</div>;
  }

  return tabList;
}
