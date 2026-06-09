"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type ColumnSearchState = {
  filters: Record<string, string>;
  debouncedFilters: Record<string, string>;
  activeColumn: string | null;
  setActiveColumn: (key: string | null) => void;
  setFilter: (key: string, value: string) => void;
  clearFilter: (key: string) => void;
};

type UseColumnSearchOptions = {
  debounceMs?: number;
};

export function useColumnSearch(options: UseColumnSearchOptions = {}): ColumnSearchState {
  const { debounceMs = 200 } = options;
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, string>>({});
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), debounceMs);
    return () => clearTimeout(timer);
  }, [filters, debounceMs]);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      filters,
      debouncedFilters,
      activeColumn,
      setActiveColumn,
      setFilter,
      clearFilter,
    }),
    [filters, debouncedFilters, activeColumn, setFilter, clearFilter]
  );
}
