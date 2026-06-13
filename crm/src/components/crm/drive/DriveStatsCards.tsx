"use client";

import React from "react";
import { FaFolder, FaFile, FaHdd } from "react-icons/fa";
import { formatFileSize } from "./driveUtils";

type DriveStatsCardsProps = {
  folderCount: number;
  fileCount: number;
  totalBytes: number;
};

export function DriveStatsCards({
  folderCount,
  fileCount,
  totalBytes,
}: DriveStatsCardsProps) {
  const cards = [
    {
      label: "Folders",
      value: folderCount,
      subtext: "in current directory",
      icon: FaFolder,
      iconClass: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
    },
    {
      label: "Files",
      value: fileCount,
      subtext: "documents & media",
      icon: FaFile,
      iconClass: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
    },
    {
      label: "Folder Size",
      value: formatFileSize(totalBytes),
      subtext: "combined file size",
      icon: FaHdd,
      iconClass: "text-violet-500 dark:text-violet-400",
      iconBg: "bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="p-5 rounded-2xl border bg-white dark:bg-slate-900/60 border-gray-200/70 dark:border-slate-800/80 hover:-translate-y-0.5 transition-all shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:shadow-none"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-xl border ${card.iconBg}`}
              >
                <Icon className={`text-sm ${card.iconClass}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white tabular-nums truncate">
                  {card.value}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-500 dark:text-slate-400">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
