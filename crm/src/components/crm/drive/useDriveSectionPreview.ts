"use client";

import { useEffect, useMemo, useState } from "react";
import type { DriveItem } from "./driveUtils";

/** Collapsible preview for long folder/file lists — resets when item set changes. */
export function useDriveSectionPreview(items: DriveItem[], limit: number) {
  const [expanded, setExpanded] = useState(false);
  const resetKey = useMemo(() => items.map((item) => item.id).join(","), [items]);

  useEffect(() => {
    setExpanded(false);
  }, [resetKey]);

  const total = items.length;
  const hasMore = total > limit;
  const visible = expanded ? items : items.slice(0, limit);
  const visibleCount = visible.length;

  const toggle = () => setExpanded((value) => !value);

  return { expanded, toggle, hasMore, visible, total, visibleCount };
}
