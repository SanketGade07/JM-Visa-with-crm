"use client";

import React from "react";
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
    <div className="relative flex min-h-screen bg-[#070712] text-slate-100 font-sans overflow-x-hidden">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <CrmSidebar />

      <main className="flex-1 flex flex-col min-w-0">
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
    <CrmLayoutProvider>
      <CrmLayoutContent />
    </CrmLayoutProvider>
  );
}
