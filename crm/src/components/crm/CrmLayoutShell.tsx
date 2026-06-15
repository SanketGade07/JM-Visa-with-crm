"use client";

import React, { Suspense } from "react";
import { CrmLayoutProvider, useCrmLayoutContext } from "./context/CrmLayoutContext";
import { CrmSidebar } from "./layout/CrmSidebar";
import { CrmHeader } from "./layout/CrmHeader";
import { CrmToast } from "./layout/CrmToast";
import { CrmTabViews } from "./CrmTabViews";
import { CrmModals } from "./modals/CrmModals";

function CrmLayoutContent() {
  const { isMounted, isMobileSidebarOpen, setIsMobileSidebarOpen } = useCrmLayoutContext();

  if (!isMounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="relative flex h-screen overflow-hidden w-full bg-[#070712] text-slate-100 font-sans">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <CrmSidebar />

      <main className="flex-1 flex flex-col min-w-0 min-h-0 w-full">
        <CrmHeader />
        <CrmTabViews />
      </main>

      <CrmModals />
      <CrmToast />
    </div>
  );
}

export default function CrmLayout() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CrmLayoutProvider>
        <CrmLayoutContent />
      </CrmLayoutProvider>
    </Suspense>
  );
}
