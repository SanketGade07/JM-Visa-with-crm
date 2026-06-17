"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { DriveToolbarProps } from "./DriveToolbar";

type MainDriveToolbarContextValue = {
  toolbarProps: DriveToolbarProps | null;
  setToolbarProps: (props: DriveToolbarProps | null) => void;
};

const MainDriveToolbarContext = createContext<MainDriveToolbarContextValue | null>(null);

function areBreadcrumbsEqual(
  a: DriveToolbarProps["breadcrumbs"],
  b: DriveToolbarProps["breadcrumbs"]
) {
  if (a.length !== b.length) return false;
  return a.every((crumb, index) => {
    const other = b[index];
    return crumb.id === other.id && crumb.name === other.name;
  });
}

function areToolbarPropsEqual(
  prev: DriveToolbarProps | null,
  next: DriveToolbarProps | null
) {
  if (prev === next) return true;
  if (prev === null || next === null) return false;

  return (
    prev.search === next.search &&
    prev.viewMode === next.viewMode &&
    prev.typeFilter === next.typeFilter &&
    prev.isAdmin === next.isAdmin &&
    prev.isUploading === next.isUploading &&
    prev.refreshing === next.refreshing &&
    Boolean(prev.onCopyFolderLink) === Boolean(next.onCopyFolderLink) &&
    Boolean(prev.onOpenLinkSettings) === Boolean(next.onOpenLinkSettings) &&
    areBreadcrumbsEqual(prev.breadcrumbs, next.breadcrumbs)
  );
}

export function MainDriveToolbarProvider({ children }: { children: React.ReactNode }) {
  const [toolbarProps, setToolbarPropsState] = useState<DriveToolbarProps | null>(null);
  const setToolbarProps = useCallback((props: DriveToolbarProps | null) => {
    setToolbarPropsState((prev) => {
      if (areToolbarPropsEqual(prev, props)) {
        return prev;
      }
      return props;
    });
  }, []);

  const value = useMemo(
    () => ({ toolbarProps, setToolbarProps }),
    [toolbarProps, setToolbarProps]
  );

  return (
    <MainDriveToolbarContext.Provider value={value}>
      {children}
    </MainDriveToolbarContext.Provider>
  );
}

export function useMainDriveToolbar(): MainDriveToolbarContextValue {
  const ctx = useContext(MainDriveToolbarContext);
  if (!ctx) {
    throw new Error("useMainDriveToolbar must be used within MainDriveToolbarProvider");
  }
  return ctx;
}
