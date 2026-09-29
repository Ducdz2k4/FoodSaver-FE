"use client";

import React from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DevRoleSwitcher } from "@/components/common/DevRoleSwitcher";
import { useMockRealtimeEvents } from "@/hooks/useMockRealtimeEvents";

export function GlobalClientProviders({ children }: { children?: React.ReactNode }) {
  useMockRealtimeEvents();

  return (
    <TooltipProvider delayDuration={0}>
      {children}
      <Toaster richColors position="top-right" closeButton />
      <DevRoleSwitcher />
    </TooltipProvider>
  );
}
