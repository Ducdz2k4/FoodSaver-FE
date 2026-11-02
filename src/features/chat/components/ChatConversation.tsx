"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bot, User, ArrowDown, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";
import { useChat } from "../ChatContext";
import { ChatRichCard } from "./ChatRichCard";

interface ChatConversationProps {
  compact?: boolean;
}

export function ChatConversation({ compact = false }: ChatConversationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { messages, isTyping, sendMessage } = useChat();

  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Auto-scroll logic
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isUp = distanceFromBottom > 60;
    isUserScrolledUpRef.current = isUp;
    setShowScrollBottomBtn(isUp);
  };

  const scrollToBottom = (smooth = true) => {
    const container = containerRef.current;
    if (!container) return;
    isUserScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);
    if (smooth) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    if (!isUserScrolledUpRef.current) {
      const container = containerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  const handleSuggestionClick = (sug: string) => {
    if (sug === "Đăng nhập ngay") {
      const returnUrl = pathname || "/meal-planner/chat";
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    } else {
      sendMessage(sug);
    }
  };

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto ${compact ? "p-3 sm:p-4 space-y-3" : "p-4 sm:p-5 space-y-4"}`}
      >
        {messages.map((msg, index) => {
          const isLastAssistant = msg.role === "assistant" && index === messages.length - 1;
          const isCurrentlyStreaming = isTyping && isLastAssistant;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 sm:gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`shrink-0 ${compact ? "size-7 rounded-lg text-[10px]" : "size-8 rounded-xl text-xs"} flex items-center justify-center font-bold ${
                  msg.role === "assistant"
                    ? "bg-[#00615f] text-white shadow-2xs"
                    : "bg-stone-900 text-white"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className={compact ? "size-3.5" : "size-4"} />
                ) : (
                  <User className={compact ? "size-3.5" : "size-4"} />
                )}
              </div>

              <div className={`${compact ? "max-w-[88%]" : "max-w-[85%] sm:max-w-[80%]"} space-y-2`}>
                {/* Bubble text */}
                <div
                  className={`rounded-2xl ${compact ? "px-3 py-2.5 text-xs" : "px-4 py-3 text-xs sm:text-sm"} ${
                    msg.role === "assistant"
                      ? "bg-white border border-stone-200/90 text-stone-800 shadow-2xs relative"
                      : "bg-[#00615f] text-white shadow-2xs"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="leading-relaxed streamdown-wrapper">
                      <Streamdown mode={isCurrentlyStreaming ? "streaming" : "static"}>
                        {msg.content}
                      </Streamdown>
                    </div>
                  ) : (
                    <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                  )}

                  <p
                    className={`text-[9px] mt-1 text-right ${
                      msg.role === "assistant" ? "text-stone-400" : "text-emerald-100"
                    }`}
                  >
                    {msg.timestamp instanceof Date && !isNaN(msg.timestamp.getTime())
                      ? msg.timestamp.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>

                {/* Embedded Rich Card */}
                {msg.richCards && (
                  <div className="space-y-2 animate-in fade-in zoom-in-95">
                    <ChatRichCard
                      card={msg.richCards}
                      compact={compact}
                      onSendPrompt={sendMessage}
                    />
                  </div>
                )}

                {/* Quick Suggestion Pills */}
                {msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {msg.quickSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(sug)}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#00615f] hover:text-white text-stone-700 text-[11px] font-medium transition cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2.5 items-center">
            <div className={`shrink-0 ${compact ? "size-7 rounded-lg" : "size-8 rounded-xl"} bg-[#00615f] flex items-center justify-center text-white`}>
              <Bot className={compact ? "size-3.5" : "size-4"} />
            </div>
            <div className="rounded-2xl bg-stone-50 border border-stone-200/80 px-3.5 py-2.5 flex items-center gap-2 text-xs text-stone-500">
              <Loader2 className="size-3.5 animate-spin text-[#00615f]" />
              <span>JEV Guard đang phân tích tính khả thi và tính toán chi phí...</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottomBtn && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#00615f] border border-stone-200/90 shadow-lg hover:bg-emerald-50 text-xs font-semibold cursor-pointer animate-in fade-in transition"
        >
          <ArrowDown className="size-3.5 animate-bounce text-[#00615f]" />
          <span>Cuộn xuống dưới</span>
        </button>
      )}
    </div>
  );
}
