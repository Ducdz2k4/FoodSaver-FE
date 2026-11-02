"use client";

import React from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FlashSaleModal } from "@/components/common/FlashSaleModal";
import { DeliveryLocationProvider } from "@/context/DeliveryLocationContext";

export function GlobalClientProviders({ children }: { children?: React.ReactNode }) {
  return (
    <DeliveryLocationProvider>
      <TooltipProvider delayDuration={0}>
        {children}
        <FlashSaleModal />
        <Toaster richColors position="top-right" closeButton />
      </TooltipProvider>
    </DeliveryLocationProvider>
  );
}
