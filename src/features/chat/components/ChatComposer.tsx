"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Square, Wallet, ShoppingCart, ChefHat, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "../ChatContext";

const QUICK_PROMPTS = [
  { icon: Wallet, label: "Ăn 50K/ngày đủ chất không?", prompt: "Làm sao để ăn chỉ với 50.000đ một ngày mà vẫn đủ dinh dưỡng?" },
  { icon: ShoppingCart, label: "Chi tiêu 1.5 triệu/tháng", prompt: "Giúp mình lập kế hoạch tài chính chi tiêu ăn uống trong tháng với ngân sách 1.5 triệu" },
  { icon: ChefHat, label: "Thực đơn ăn chay ngày mai", prompt: "Tạo thực đơn ăn chay ngày mai cho t đi" },
  { icon: Sparkles, label: "Hôm nay ăn gì ngon bổ rẻ?", prompt: "Hôm nay ăn gì ngon bổ rẻ gợi ý cho mình với" },
];

interface ChatComposerProps {
  compact?: boolean;
}

export function ChatComposer({ compact = false }: ChatComposerProps) {
  const { messages, isTyping, sendMessage, abortStreaming } = useChat();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const minHeight = compact ? 40 : 44;
    const maxHeight = 96;
    const scrollHeight = textarea.scrollHeight;

    if (!textarea.value || textarea.value.trim() === "") {
      textarea.style.height = `${minHeight}px`;
      textarea.style.overflowY = "hidden";
      return;
    }
    const nextHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${Math.max(minHeight, nextHeight)}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [compact]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    sendMessage(trimmed);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = `${compact ? 40 : 44}px`;
      inputRef.current.style.overflowY = "hidden";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`border-t border-stone-100 bg-white ${compact ? "p-2.5 sm:p-3" : "p-3 sm:p-4"}`}>
      {/* Quick Prompts mini-strip if newly opened */}
      {messages.length <= 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(item.prompt)}
              disabled={isTyping}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-[#00615f] border border-stone-200/60 text-stone-600 text-[11px] font-medium transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi (thực đơn, đi chợ, suất ăn cận date...)..."
          rows={1}
          className={`flex-1 ${
            compact ? "px-3 py-2.5 text-xs rounded-xl" : "px-4 py-3 text-xs sm:text-sm rounded-2xl"
          } bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] transition resize-none overflow-hidden`}
          style={{ minHeight: compact ? "40px" : "44px", maxHeight: "96px" }}
        />

        {isTyping ? (
          <Button
            type="button"
            variant="destructive"
            onClick={abortStreaming}
            title="Dừng phản hồi"
            className={`shrink-0 ${compact ? "px-3 rounded-xl h-10" : "px-4 rounded-2xl h-11"} font-bold gap-1 shadow-xs cursor-pointer`}
          >
            <Square className="size-3.5 fill-current" />
            <span className="text-xs hidden sm:inline">Dừng</span>
          </Button>
        ) : (
          <Button
            type="submit"
            variant="default"
            disabled={!input.trim() || isTyping}
            className={`shrink-0 ${
              compact ? "px-3 rounded-xl h-10" : "px-4 sm:px-5 rounded-2xl h-11"
            } font-bold gap-1.5 shadow-md cursor-pointer`}
          >
            <Send className="size-4" />
            <span className="hidden sm:inline text-xs">Gửi</span>
          </Button>
        )}
      </form>

      {!compact && (
        <p className="text-center text-[10px] text-stone-400 mt-2">
          Vận hành bởi FoodSaver Agent JEV System One · Không hard-code · Chấm điểm khả thi thực tế.
        </p>
      )}
    </div>
  );
}
