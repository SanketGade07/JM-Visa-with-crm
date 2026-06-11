import React from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 8, 10, 20, 50];

export type PaginationProps = {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

export function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageSizeChange,
  onPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className = "",
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const activePage = Math.max(1, Math.min(currentPage, totalPages));

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-end px-5 py-3 border-t border-gray-100 dark:border-slate-800 text-[12px] text-slate-500 dark:text-slate-400 gap-4 select-none ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-gray-450 dark:text-slate-500">Rows per page</span>
        <div className="relative flex items-center">
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="appearance-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-750 dark:text-slate-200 text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 shadow-sm cursor-pointer transition-colors hover:border-gray-300 dark:hover:border-slate-700"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5 text-gray-455" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="font-medium tabular-nums text-slate-600 dark:text-slate-350">
        {`${(activePage - 1) * pageSize + 1}-${Math.min(
          activePage * pageSize,
          totalItems
        )} of ${totalItems}`}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={activePage === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
          title="First Page"
        >
          <FiChevronsLeft className="text-sm" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, activePage - 1))}
          disabled={activePage === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
          title="Previous Page"
        >
          <FiChevronLeft className="text-sm" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, activePage + 1))}
          disabled={activePage === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
          title="Next Page"
        >
          <FiChevronRight className="text-sm" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={activePage === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
          title="Last Page"
        >
          <FiChevronsRight className="text-sm" />
        </button>
      </div>
    </div>
  );
}
