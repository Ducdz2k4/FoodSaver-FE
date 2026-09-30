"use client";

import React from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMockRealtimeEvents } from "@/hooks/useMockRealtimeEvents";
import { FlashSaleModal } from "@/components/common/FlashSaleModal";

export function GlobalClientProviders({ children }: { children?: React.ReactNode }) {
  useMockRealtimeEvents();

  return (
    <TooltipProvider delayDuration={0}>
      {children}
      <FlashSaleModal />
      <Toaster richColors position="top-right" closeButton />
    </TooltipProvider>
  );
}
