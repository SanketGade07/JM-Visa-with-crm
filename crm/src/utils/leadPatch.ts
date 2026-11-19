/** Fields that differ between two lead snapshots. The server merges this onto the stored row. */
export function leadPatch(
  prev: Record<string, unknown>,
  next: Record<string, unknown>
): Record<string, unknown> {
  const patch: Record<string, unknown> = { id: next.id };
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of keys) {
    if (key === "id") continue;
    const before = prev[key];
    const after = next[key];
    if (after === undefined) continue;
    if (before === after) continue;
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    patch[key] = after;
  }
  return patch;
}
