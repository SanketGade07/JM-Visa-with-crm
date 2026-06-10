"use client";

import React from "react";
import type { IconType } from "react-icons";

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

  const tabList = (
    <div
      className={`quick-status-tabs${isHeader ? " quick-status-tabs--header" : ""} ${className}`.trim()}
      role="tablist"
      aria-label="Lead status filters"
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <React.Fragment key={tab.id}>
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`quick-status-tab${isActive ? " quick-status-tab--active" : ""}${isHeader ? " quick-status-tab--header" : ""}`}
            >
              {isHeader && Icon ? (
                <span className="quick-status-tab__row">
                  <Icon className="quick-status-tab__icon" aria-hidden="true" />
                  <span className="quick-status-tab__label">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="quick-status-tab__badge" aria-hidden="true">
                      {tab.count}
                    </span>
                  )}
                </span>
              ) : (
                <span className="quick-status-tab__inner">
                  <span className="quick-status-tab__label">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="quick-status-tab__badge" aria-hidden="true">
                      {tab.count}
                    </span>
                  )}
                </span>
              )}
            </button>
            {isHeader && index < tabs.length - 1 ? (
              <span className="quick-status-tab__divider" aria-hidden="true" />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );

  if (scroll) {
    return <div className="quick-status-tabs-outer">{tabList}</div>;
  }

  return tabList;
}
