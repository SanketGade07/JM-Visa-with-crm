export type SearchableColumn<T> = {
  searchKey?: string;
  getSearchValue?: (row: T) => string;
};

export function applyColumnSearch<T>(
  rows: T[],
  columns: SearchableColumn<T>[],
  debouncedFilters: Record<string, string>
): T[] {
  const activeQueries = Object.entries(debouncedFilters).filter(([, value]) => value.trim().length > 0);
  if (activeQueries.length === 0) return rows;

  const getters = new Map<string, (row: T) => string>();
  for (const col of columns) {
    if (col.searchKey && col.getSearchValue) {
      getters.set(col.searchKey, col.getSearchValue);
    }
  }

  return rows.filter((row) =>
    activeQueries.every(([key, query]) => {
      const getValue = getters.get(key);
      if (!getValue) return true;
      return getValue(row).toLowerCase().includes(query.trim().toLowerCase());
    })
  );
}
