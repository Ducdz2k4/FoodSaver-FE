"use client";

import React from "react";
import { Toaster } from "sonner";
import { DevRoleSwitcher } from "@/components/common/DevRoleSwitcher";
import { useMockRealtimeEvents } from "@/hooks/useMockRealtimeEvents";

export function GlobalClientProviders() {
  useMockRealtimeEvents();

  return (
    <>
      <Toaster richColors position="top-right" closeButton />
      <DevRoleSwitcher />
    </>
  );
}
