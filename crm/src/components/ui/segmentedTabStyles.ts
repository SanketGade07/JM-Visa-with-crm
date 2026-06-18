export const segmentedTabListClass =
  "flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900";

const segmentedTabButtonBaseClass =
  "relative flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all duration-200 sm:px-4";

const segmentedTabButtonActiveClass =
  "border-blue-600 bg-white text-slate-900 shadow-sm dark:border-blue-400 dark:bg-slate-800 dark:text-white";

const segmentedTabButtonInactiveClass =
  "border-transparent text-slate-500 hover:bg-white hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200";

export function segmentedTabButtonClass(isActive: boolean): string {
  return `${segmentedTabButtonBaseClass} ${
    isActive ? segmentedTabButtonActiveClass : segmentedTabButtonInactiveClass
  }`;
}

const segmentedTabBadgeBaseClass =
  "tabular-nums rounded-md px-1.5 py-0.5 text-[10px] font-bold";

const segmentedTabBadgeActiveClass =
  "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";

const segmentedTabBadgeInactiveClass =
  "bg-slate-200 text-slate-700 dark:bg-slate-950 dark:text-slate-400";

export function segmentedTabBadgeClass(isActive: boolean): string {
  return `${segmentedTabBadgeBaseClass} ${
    isActive ? segmentedTabBadgeActiveClass : segmentedTabBadgeInactiveClass
  }`;
}

/** Header quick-status tabs — CRM-tuned colors; avoids html.light bg-slate-9xx substring overrides */
export const segmentedTabListHeaderClass =
  "inline-flex w-fit max-w-full shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 py-1 pl-1 pr-0.5 dark:border-[#1a2332] dark:bg-[#070b12]";

const segmentedTabButtonActiveHeaderClass =
  "border-blue-600 bg-white text-slate-900 shadow-sm dark:border-blue-400 dark:bg-[#151c28] dark:text-white";

const segmentedTabButtonInactiveHeaderClass =
  "border-transparent text-slate-500 hover:bg-white hover:text-slate-800 dark:text-slate-400 dark:hover:bg-[#151c28]/70 dark:hover:text-slate-200";

export function segmentedTabButtonHeaderClass(isActive: boolean): string {
  return `${segmentedTabButtonBaseClass} ${
    isActive ? segmentedTabButtonActiveHeaderClass : segmentedTabButtonInactiveHeaderClass
  }`;
}

const segmentedTabBadgeActiveHeaderClass =
  "crm-header-tab-count crm-header-tab-count--active bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";

const segmentedTabBadgeInactiveHeaderClass =
  "crm-header-tab-count crm-header-tab-count--inactive bg-slate-200 text-slate-700 dark:bg-[#1a2436] dark:text-slate-400";

export function segmentedTabBadgeHeaderClass(isActive: boolean): string {
  return `${segmentedTabBadgeBaseClass} ${
    isActive ? segmentedTabBadgeActiveHeaderClass : segmentedTabBadgeInactiveHeaderClass
  }`;
}
