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
        <Toaster
          richColors
          position="top-right"
          closeButton
          visibleToasts={3}
          duration={3500}
          toastOptions={{
            classNames: {
              toast: "rounded-2xl shadow-xl border font-sans py-3.5 px-4 text-xs sm:text-sm font-medium",
              title: "font-bold text-xs sm:text-sm",
              description: "text-[11px] sm:text-xs opacity-90 mt-0.5",
              closeButton: "!bg-white/80 !border !border-stone-200 !text-stone-700 hover:!bg-white",
            },
          }}
        />
      </TooltipProvider>
    </DeliveryLocationProvider>
  );
}
