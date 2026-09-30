"use client";

import React from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMockRealtimeEvents } from "@/hooks/useMockRealtimeEvents";

export function GlobalClientProviders({ children }: { children?: React.ReactNode }) {
  useMockRealtimeEvents();

  return (
    <TooltipProvider delayDuration={0}>
      {children}
      <Toaster richColors position="top-right" closeButton />
    </TooltipProvider>
  );
}
