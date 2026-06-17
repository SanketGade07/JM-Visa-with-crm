"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { DriveToolbarProps } from "./DriveToolbar";

type MainDriveToolbarContextValue = {
  toolbarProps: DriveToolbarProps | null;
  setToolbarProps: (props: DriveToolbarProps | null) => void;
};

const MainDriveToolbarContext = createContext<MainDriveToolbarContextValue | null>(null);

export function MainDriveToolbarProvider({ children }: { children: React.ReactNode }) {
  const [toolbarProps, setToolbarPropsState] = useState<DriveToolbarProps | null>(null);
  const setToolbarProps = useCallback((props: DriveToolbarProps | null) => {
    setToolbarPropsState(props);
  }, []);

  return (
    <MainDriveToolbarContext.Provider value={{ toolbarProps, setToolbarProps }}>
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
