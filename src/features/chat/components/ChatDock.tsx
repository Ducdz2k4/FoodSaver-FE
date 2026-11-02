"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Sparkles,
  X,
  Minus,
  Maximize2,
  Clock,
  RotateCcw,
  Plus,
} from "lucide-react";
import { useChat } from "../ChatContext";
import { ChatConversation } from "./ChatConversation";
import { ChatComposer } from "./ChatComposer";
import { ChatSessionList } from "./ChatSessionList";

export function ChatDock() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isDockOpen,
    isDockMinimized,
    openDock,
    closeDock,
    setIsDockMinimized,
    createNewSession,
    resetCurrentChat,
  } = useChat();

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Close dock on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDockOpen) {
        if (showHistoryDrawer) {
          setShowHistoryDrawer(false);
        } else {
          closeDock();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDockOpen, showHistoryDrawer, closeDock]);

  // Do not show the floating ChatDock on the dedicated chat page to avoid duplicate chat UI
  if (pathname?.startsWith("/meal-planner/chat")) {
    return null;
  }

  // 1. Minimized floating pill
  if (isDockOpen && isDockMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#00615f] text-white shadow-xl border border-emerald-400/30">
          <button
            type="button"
            onClick={() => setIsDockMinimized(false)}
            className="flex items-center gap-2 text-xs font-bold hover:text-emerald-100 transition cursor-pointer"
          >
            <div className="size-6 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="size-3.5" />
            </div>
            <span>Trợ lý FoodSaver AI</span>
          </button>
          <div className="flex items-center gap-1 pl-1 border-l border-white/20">
            <button
              type="button"
              onClick={() => setIsDockMinimized(false)}
              className="p-1 rounded-full hover:bg-white/20 transition cursor-pointer text-white"
              title="Phóng to cửa sổ"
            >
              <Maximize2 className="size-3" />
            </button>
            <button
              type="button"
              onClick={closeDock}
              className="p-1 rounded-full hover:bg-white/20 transition cursor-pointer text-white"
              title="Đóng chat"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Closed launcher button
  if (!isDockOpen) {
    return (
      <div className="fixed bottom-5 right-5 z-40 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={openDock}
          aria-label="Mở trợ lý AI FoodSaver"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#00615f] hover:bg-[#004e4c] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border border-emerald-400/40"
        >
          <div className="relative">
            <Bot className="size-5 transition-transform duration-300 group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            Hỏi Trợ lý AI
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
            <Sparkles className="size-2.5" />
            AI
          </span>
        </button>
      </div>
    );
  }

  // 3. Open Dock Panel (Desktop popup / Mobile sheet)
  return (
    <div className="fixed inset-x-2 bottom-2 sm:inset-auto sm:bottom-5 sm:right-5 z-50 flex flex-col w-auto sm:w-[410px] h-[calc(100vh-20px)] sm:h-[580px] max-h-[660px] rounded-3xl bg-white border border-stone-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Dock Header */}
      <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-xl bg-[#00615f] text-white flex items-center justify-center shadow-2xs shrink-0">
            <Bot className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-stone-900 truncate">
                Trợ lý FoodSaver
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-100 text-[#00615f]">
                AI
              </span>
            </div>
            <p className="text-[10px] text-stone-500 truncate flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tư vấn thực đơn &amp; chi tiêu</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* History drawer toggle */}
          <button
            type="button"
            onClick={() => setShowHistoryDrawer((prev) => !prev)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              showHistoryDrawer
                ? "bg-[#00615f] text-white"
                : "text-stone-500 hover:text-stone-800 hover:bg-stone-200/60"
            }`}
            title="Lịch sử trò chuyện"
          >
            <Clock className="size-3.5" />
          </button>

          {/* New chat button */}
          <button
            type="button"
            onClick={createNewSession}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition cursor-pointer"
            title="Mở cuộc trò chuyện mới"
          >
            <Plus className="size-3.5" />
          </button>

          {/* Reset chat */}
          <button
            type="button"
            onClick={resetCurrentChat}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
            title="Làm mới hội thoại"
          >
            <RotateCcw className="size-3.5" />
          </button>

          {/* Expand to full page */}
          <button
            type="button"
            onClick={() => {
              closeDock();
              router.push("/meal-planner/chat");
            }}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition cursor-pointer"
            title="Mở toàn trang (/meal-planner/chat)"
          >
            <Maximize2 className="size-3.5" />
          </button>

          {/* Minimize to pill */}
          <button
            type="button"
            onClick={() => setIsDockMinimized(true)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition cursor-pointer"
            title="Thu nhỏ"
          >
            <Minus className="size-3.5" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={closeDock}
            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Đóng"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Dock Content Body */}
      <div className="relative flex-1 flex flex-col min-h-0 bg-stone-50/20">
        {/* Slide-over Session History Drawer */}
        {showHistoryDrawer && (
          <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900">Danh sách phiên chat</span>
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <ChatSessionList
              compact
              onSelectSession={() => setShowHistoryDrawer(false)}
            />
          </div>
        )}

        {/* Conversation Stream */}
        <ChatConversation compact />

        {/* Composer */}
        <ChatComposer compact />
      </div>
    </div>
  );
}
