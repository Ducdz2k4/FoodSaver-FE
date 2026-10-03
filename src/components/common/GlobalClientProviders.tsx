"use client";

import React from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FlashSaleModal } from "@/components/common/FlashSaleModal";

export function GlobalClientProviders({ children }: { children?: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={0}>
      {children}
      <FlashSaleModal />
      <Toaster richColors position="top-right" closeButton />
    </TooltipProvider>
  );
}
