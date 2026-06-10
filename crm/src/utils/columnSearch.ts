export type SearchableColumn<T> = {
  searchKey?: string;
  getSearchValue?: (row: T) => string;
  filterMode?: "includes" | "exact";
  filterClearValue?: string;
};

export function applyColumnSearch<T>(
  rows: T[],
  columns: SearchableColumn<T>[],
  debouncedFilters: Record<string, string>
): T[] {
  const activeQueries = Object.entries(debouncedFilters).filter(([, value]) => value.trim().length > 0);
  if (activeQueries.length === 0) return rows;

  const columnByKey = new Map<string, SearchableColumn<T>>();
  const getters = new Map<string, (row: T) => string>();
  for (const col of columns) {
    if (col.searchKey && col.getSearchValue) {
      columnByKey.set(col.searchKey, col);
      getters.set(col.searchKey, col.getSearchValue);
    }
  }

  return rows.filter((row) =>
    activeQueries.every(([key, query]) => {
      const getValue = getters.get(key);
      if (!getValue) return true;

      const trimmed = query.trim();
      const col = columnByKey.get(key);
      if (col?.filterMode === "exact") {
        if (col.filterClearValue && trimmed === col.filterClearValue) return true;
        return getValue(row) === trimmed;
      }

      return getValue(row).toLowerCase().includes(trimmed.toLowerCase());
    })
  );
}
