"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Wallet,
  ShoppingCart,
  MapPin,
  ChefHat,
  Loader2,
  RotateCcw,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  Store,
  Calendar as CalendarIcon,
  Tag,
  CheckCircle2,
  Sliders,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSendChatMessageMutation,
  useGetChatMemoryQuery,
  useClearChatSessionMutation,
} from "@/redux/api/mealPlannerApi";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  richCards?: any;
  quickSuggestions?: string[];
}

const QUICK_PROMPTS = [
  { icon: Wallet, label: "Ăn 50K/ngày đủ chất không?", prompt: "Làm sao để ăn chỉ với 50.000đ một ngày mà vẫn đủ dinh dưỡng?" },
  { icon: ShoppingCart, label: "Kế hoạch chi tiêu 1.5 triệu/tháng", prompt: "Giúp mình lập kế hoạch tài chính chi tiêu ăn uống trong tháng với ngân sách 1.5 triệu" },
  { icon: MapPin, label: "Chợ nào rẻ nhất ở Sài Gòn?", prompt: "Những chợ đầu mối nào ở Sài Gòn bán rau củ, thịt cá giá rẻ nhất?" },
  { icon: ChefHat, label: "Thực đơn 1 tuần cho 2 người < 500K", prompt: "Lên thực đơn ăn uống 1 tuần cho 2 người với chi phí dưới 500K" },
  { icon: Sparkles, label: "Hôm nay ăn gì ngon bổ rẻ?", prompt: "Hôm nay ăn gì ngon bổ rẻ gợi ý cho mình với" },
];

function formatVND(n: number) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

export default function MealPlannerChatPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Xin chào! Mình là **Trợ lý Dinh dưỡng & Tài chính FoodSaver** 🌿\n\nMình luôn sẵn sàng hỗ trợ bạn:\n- 🥗 Lên thực đơn ăn uống ngon miệng, đủ chất theo khẩu vị và ngân sách.\n- 🛒 Lập kế hoạch đi chợ thông minh, tiết kiệm tối đa.\n- ⚡ Săn các suất ăn giải cứu giờ vàng giảm giá đến 50% từ đối tác quanh bạn.\n\nHôm nay bạn muốn ăn gì hoặc cần mình hỗ trợ kế hoạch thế nào?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Initialize unique sessionId from localStorage or generate one
  useEffect(() => {
    let sId = localStorage.getItem("foodsaver_chat_session_id");
    if (!sId) {
      sId = "session_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
      localStorage.setItem("foodsaver_chat_session_id", sId);
    }
    setSessionId(sId);
  }, []);

  // API Hooks
  const [sendMessageMutation] = useSendChatMessageMutation();
  const { data: memoryRes, refetch: refetchMemory } = useGetChatMemoryQuery(
    { sessionId },
    { skip: !sessionId }
  );
  const [clearSessionMutation] = useClearChatSessionMutation();

  const userFacts = memoryRes?.data || [];

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 96; // ~3 lines
    const scrollHeight = textarea.scrollHeight;
    if (!textarea.value || textarea.value.trim() === "") {
      textarea.style.height = "44px";
      textarea.style.overflowY = "hidden";
      return;
    }
    const nextHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${Math.max(44, nextHeight)}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "44px";
      inputRef.current.style.overflowY = "hidden";
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    // If user scrolled up by more than 60px from the bottom
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isUp = distanceFromBottom > 60;
    isUserScrolledUpRef.current = isUp;
    setShowScrollBottomBtn(isUp);
  };

  const scrollToBottom = (smooth = true) => {
    const container = messagesContainerRef.current;
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

  // Only auto-scroll down if user has NOT scrolled up to read earlier content
  // Directly modifies container.scrollTop so the outer window / main layout NEVER scrolls!
  useEffect(() => {
    if (!isUserScrolledUpRef.current) {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: "u_" + Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "44px";
      inputRef.current.style.overflowY = "hidden";
    }
    setIsTyping(true);

    try {
      // Attempt SSE Streaming first
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBase}/api/v1/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });

      if (!response.ok || !response.body) {
        throw new Error("SSE Stream fallback needed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedReply = "";
      let richCards: any = null;
      let quickSuggestions: string[] = [];

      const botMsgId = "bot_" + Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      let doneReading = false;
      while (!doneReading) {
        const { value, done } = await reader.read();
        doneReading = done;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.replace("data: ", "").trim());
                if (parsed.type === "token") {
                  streamedReply += parsed.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === botMsgId ? { ...m, content: streamedReply } : m
                    )
                  );
                } else if (parsed.type === "done") {
                  richCards = parsed.richCards;
                  quickSuggestions = parsed.quickSuggestions || [];
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === botMsgId
                        ? { ...m, richCards, quickSuggestions }
                        : m
                    )
                  );
                }
              } catch {
                // Ignore partial JSON
              }
            }
          }
        }
      }

      setIsTyping(false);
      refetchMemory();
    } catch {
      // Fallback to standard REST mutation
      try {
        const res = await sendMessageMutation({
          message: trimmed,
          sessionId,
        }).unwrap();

        const botReply: Message = {
          id: "bot_" + Date.now(),
          role: "assistant",
          content: res.data.reply,
          timestamp: new Date(),
          richCards: res.data.richCards,
          quickSuggestions: res.data.quickSuggestions,
        };
        setMessages((prev) => [...prev, botReply]);
        refetchMemory();
      } catch (err: any) {
        toast.error("Không thể kết nối đến Trợ lý AI. Vui lòng thử lại sau");
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleResetChat = async () => {
    try {
      await clearSessionMutation({ sessionId }).unwrap();
      setMessages([
        {
          id: "welcome-reset",
          role: "assistant",
          content: "Đã làm mới cuộc hội thoại! Bạn muốn mình hỗ trợ gì tiếp theo?",
          timestamp: new Date(),
        },
      ]);
      toast.success("Đã làm mới phiên hội thoại");
    } catch {
      setMessages([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* ══════ MAIN GRID: 4 COLS SIDEBAR + 8 COLS CHAT ══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Quick Prompts & AI Memory Badge */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Prompts Panel */}
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-[#00615f]" />
                <span>Câu hỏi gợi ý nhanh</span>
              </h3>
            </div>

            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.prompt)}
                    disabled={isTyping}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200/60 hover:border-[#00615f]/30 text-left transition-all group disabled:opacity-50 cursor-pointer"
                  >
                    <div className="shrink-0 size-7 rounded-lg bg-[#00615f]/10 text-[#00615f] flex items-center justify-center group-hover:bg-[#00615f] group-hover:text-white transition">
                      <Icon className="size-3.5" />
                    </div>
                    <span className="text-xs font-medium text-stone-700 group-hover:text-[#00615f] transition line-clamp-1">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Memory Transparency Card */}
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <Sliders className="size-3.5 text-[#00615f]" />
                <span>Bộ nhớ cá nhân hóa</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#00615f] border border-emerald-200/80">
                {userFacts.length} ký ức
              </span>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              Trợ lý JEV tự động ghi nhớ sở thích, xưng hô và ngân sách của bạn để tư vấn phù hợp hơn mà không làm lộ dữ liệu.
            </p>

            <button
              onClick={() => setIsMemoryModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="size-3.5 text-stone-500" />
              <span>Xem những gì bot đã nhớ</span>
            </button>
          </div>

          {/* Pro-Tips Callout */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 to-amber-50/50 border border-emerald-200/60 p-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="size-4 text-[#00615f]" />
              <h4 className="text-xs font-bold text-stone-900">Quy tắc vàng tiết kiệm</h4>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Kết hợp mua nguyên liệu giá sỉ tại chợ truyền thống đầu tuần + săn suất ăn cận date giờ vàng FoodSaver cuối ngày sẽ giảm ngay 40% chi phí ăn uống!
            </p>
          </div>
        </div>

        {/* Right: Interactive Chat Stream Feed */}
        <div className="lg:col-span-8 flex flex-col h-[680px] rounded-3xl bg-white border border-stone-200/90 shadow-xs overflow-hidden relative">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-[#00615f] text-white flex items-center justify-center shadow-xs">
                <Bot className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-stone-900">
                    Trợ lý Tài chính & Dinh dưỡng FoodSaver
                  </h2>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-[#00615f]">
                    JEV Engine
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-stone-500">
                    Trực tuyến · Tư vấn chi tiêu &amp; Suất ăn cận date
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleResetChat}
              className="p-2 rounded-xl hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              title="Làm mới trò chuyện"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`shrink-0 size-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    msg.role === "assistant"
                      ? "bg-[#00615f] text-white shadow-xs"
                      : "bg-stone-900 text-white"
                  }`}
                >
                  {msg.role === "assistant" ? <Bot className="size-4" /> : <User className="size-4" />}
                </div>

                <div className="max-w-[85%] sm:max-w-[80%] space-y-2.5">
                  {/* Bubble text */}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "assistant"
                        ? "bg-white border border-stone-200/90 text-stone-800 shadow-xs relative"
                        : "bg-[#00615f] text-white shadow-xs"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="text-xs sm:text-sm leading-relaxed streamdown-wrapper">
                        <Streamdown mode={isTyping && index === messages.length - 1 ? "streaming" : "static"}>
                          {msg.content}
                        </Streamdown>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    )}

                    <p
                      className={`text-[9px] mt-1.5 text-right ${
                        msg.role === "assistant" ? "text-stone-400" : "text-emerald-100"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* ══════ RICH CARDS EMBEDDED IN CHAT ══════ */}
                  {msg.richCards && (
                    <div className="space-y-2.5 animate-in fade-in zoom-in-95">
                      {/* Rich Card: Calendar Conflict Detected */}
                      {msg.richCards.type === "calendar_conflict" && msg.richCards.data && (
                        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-amber-200/80">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <AlertTriangle className="size-3.5 text-amber-700" />
                              <span>LỊCH ĂN ĐÃ CÓ MÓN ({msg.richCards.data.formattedDate || msg.richCards.data.date})</span>
                            </span>
                            <span className="text-[10px] font-semibold text-amber-800">
                              Phát hiện xung đột lịch
                            </span>
                          </div>

                          <p className="text-xs text-stone-700">
                            Ngày này trong hệ thống của bạn đã có các món ăn sau:
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {msg.richCards.data.existing?.breakfast && (
                              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                                <p className="text-[10px] font-semibold text-stone-500">🌅 Bữa sáng</p>
                                <p className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                                  {msg.richCards.data.existing.breakfast.meal}
                                </p>
                                <p className="text-[11px] text-[#00615f] font-semibold">
                                  {formatVND(msg.richCards.data.existing.breakfast.cost)}
                                </p>
                              </div>
                            )}
                            {msg.richCards.data.existing?.lunch && (
                              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                                <p className="text-[10px] font-semibold text-stone-500">☀️ Bữa trưa</p>
                                <p className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                                  {msg.richCards.data.existing.lunch.meal}
                                </p>
                                <p className="text-[11px] text-[#00615f] font-semibold">
                                  {formatVND(msg.richCards.data.existing.lunch.cost)}
                                </p>
                              </div>
                            )}
                            {msg.richCards.data.existing?.dinner && (
                              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                                <p className="text-[10px] font-semibold text-stone-500">🌙 Bữa tối</p>
                                <p className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                                  {msg.richCards.data.existing.dinner.meal}
                                </p>
                                <p className="text-[11px] text-[#00615f] font-semibold">
                                  {formatVND(msg.richCards.data.existing.dinner.cost)}
                                </p>
                              </div>
                            )}
                            {msg.richCards.data.existing?.snack && (
                              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                                <p className="text-[10px] font-semibold text-stone-500">🍎 Bữa phụ</p>
                                <p className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                                  {msg.richCards.data.existing.snack.meal}
                                </p>
                                <p className="text-[11px] text-[#00615f] font-semibold">
                                  {formatVND(msg.richCards.data.existing.snack.cost)}
                                </p>
                              </div>
                            )}
                          </div>

                          <p className="text-xs font-semibold text-stone-800 pt-1">
                            Bạn muốn thay thế như thế nào?
                          </p>

                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSend("Thay thế toàn bộ ngày mai")}
                              className="rounded-xl text-xs font-bold gap-1 shadow-xs"
                            >
                              <CheckCircle2 className="size-3.5" />
                              <span>Thay thế toàn bộ</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSend("Chỉ thay thế Bữa trưa")}
                              className="rounded-xl text-xs font-semibold"
                            >
                              Chỉ đổi Bữa trưa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSend("Chỉ thay thế Bữa tối")}
                              className="rounded-xl text-xs font-semibold"
                            >
                              Chỉ đổi Bữa tối
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSend("Chỉ thay thế Bữa sáng")}
                              className="rounded-xl text-xs font-semibold"
                            >
                              Chỉ đổi Bữa sáng
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSend("Giữ nguyên lịch cũ")}
                              className="rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900"
                            >
                              Giữ nguyên lịch cũ
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Rich Card: Calendar Applied Success */}
                      {msg.richCards.type === "calendar_applied" && msg.richCards.data && (
                        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-[#00615f] border border-emerald-300">
                              <CheckCircle2 className="size-3.5 text-emerald-600" />
                              <span>ĐÃ LƯU VÀO CƠ SỞ DỮ LIỆU THỰC</span>
                            </span>
                            <span className="text-[10px] font-bold text-[#00615f]">
                              Ngày: {msg.richCards.data.formattedDate || msg.richCards.data.date}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {msg.richCards.data.slots?.map((slot: any, sIdx: number) => (
                              <div
                                key={sIdx}
                                className="p-2.5 rounded-xl bg-white border border-emerald-200/70 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-stone-700">
                                    {slot.slot === "breakfast" ? "🌅 Sáng" : slot.slot === "lunch" ? "☀️ Trưa" : slot.slot === "dinner" ? "🌙 Tối" : "🍎 Phụ"}:
                                  </span>
                                  <span className="font-semibold text-stone-900">{slot.meal || slot.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[11px] font-bold text-[#00615f]">{formatVND(slot.cost)}</span>
                                  <span className="text-[10px] text-stone-500">({slot.calories} kcal)</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              asChild
                              size="sm"
                              variant="default"
                              className="flex-1 rounded-xl text-xs font-bold gap-1.5 shadow-xs"
                            >
                              <Link href="/meal-planner/calendar">
                                <CalendarIcon className="size-3.5" />
                                <span>Mở xem Lịch ăn tháng</span>
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSend("Tạo danh sách đi chợ cho ngày mai")}
                              className="rounded-xl text-xs font-semibold"
                            >
                              Lập danh sách đi chợ
                            </Button>
                          </div>
                        </div>
                      )}
                      {/* Rich Card Type 1: Feasibility Negotiation */}
                      {msg.richCards.type === "feasibility_negotiation" && (
                        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/60 p-3.5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <AlertTriangle className="size-3 text-amber-700" />
                              <span>ĐỀ XUẤT ĐIỀU CHỈNH KHẢ THI</span>
                            </span>
                            <span className="text-[10px] font-bold text-amber-900">
                              Điểm JEV: {msg.richCards.data.score}/1.0
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-white border border-amber-200/60">
                              <p className="text-[10px] text-stone-500">Phương án 1 (Rút ngắn ngày)</p>
                              <p className="text-xs font-bold text-stone-900 mt-0.5">
                                Ăn đủ chất trong {msg.richCards.data.realisticDays} ngày
                              </p>
                              <Button
                                size="xs"
                                variant="default"
                                onClick={() =>
                                  handleSend(
                                    `Lên thực đơn ăn đủ chất trong ${msg.richCards.data.realisticDays} ngày với ${formatVND(
                                      msg.richCards.data.requestedBudget
                                    )}`
                                  )
                                }
                                className="w-full mt-2 rounded-lg text-[10px] font-bold h-6"
                              >
                                Chọn phương án này
                              </Button>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white border border-amber-200/60">
                              <p className="text-[10px] text-stone-500">Phương án 2 (Đủ 30 ngày)</p>
                              <p className="text-xs font-bold text-[#00615f] mt-0.5">
                                Điều chỉnh lên {formatVND(msg.richCards.data.recommendedMinTotal)}
                              </p>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() =>
                                  handleSend(
                                    `Lập kế hoạch ăn uống 30 ngày với mức tối thiểu ${formatVND(
                                      msg.richCards.data.recommendedMinTotal
                                    )}`
                                  )
                                }
                                className="w-full mt-2 rounded-lg text-[10px] font-bold h-6"
                              >
                                Chọn phương án này
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rich Card Type 2: Deals List */}
                      {msg.richCards.type === "deals_list" && Array.isArray(msg.richCards.data) && (
                        <div className="rounded-2xl border border-stone-200 bg-white p-3 space-y-2">
                          <p className="text-[11px] font-bold text-stone-800 flex items-center gap-1.5">
                            <Store className="size-3.5 text-[#00615f]" />
                            <span>Suất ăn giải cứu khớp ngân sách:</span>
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.richCards.data.map((deal: any) => (
                              <div
                                key={deal.id}
                                className="p-2.5 rounded-xl border border-stone-200/80 bg-stone-50 flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-stone-900 truncate">
                                    {deal.title}
                                  </p>
                                  <p className="text-[11px] text-[#00615f] font-bold mt-0.5">
                                    {formatVND(deal.discountPrice)}
                                  </p>
                                </div>
                                <Button
                                  asChild
                                  size="xs"
                                  variant="default"
                                  className="rounded-lg text-[10px] font-bold h-6 px-2 shrink-0"
                                >
                                  <Link href={`/checkout/${deal.id}`}>Giữ món</Link>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rich Card Type 3: Schedule Preview with Interactive Action Skills */}
                      {msg.richCards.type === "schedule_preview" && (
                        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
                            <span className="text-xs font-bold text-[#00615f] flex items-center gap-1.5">
                              <CalendarIcon className="size-4" />
                              <span>Thực đơn {msg.richCards.data.days} ngày đề xuất</span>
                            </span>
                            <span className="text-xs font-bold text-stone-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
                              ~{formatVND(msg.richCards.data.dailyBudget)}/ngày
                            </span>
                          </div>

                          <p className="text-xs text-stone-700 font-medium">
                            Bạn có muốn lưu thực đơn này vào Lịch ăn tháng không? Bấm chọn phương án bên dưới để bot thực hiện ngay:
                          </p>

                          <div className="flex flex-wrap gap-2 pt-0.5">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSend("Áp dụng vào lịch ăn ngày mai cho t")}
                              className="rounded-xl text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="size-3.5" />
                              <span>Có, áp dụng vào ngày mai</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSend("Không, đổi món khác")}
                              className="rounded-xl text-xs font-semibold cursor-pointer bg-white hover:bg-stone-50"
                            >
                              <X className="size-3.5 text-stone-500" />
                              <span>Không, đổi món khác</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSend("Xem danh sách nguyên liệu đi chợ")}
                              className="rounded-xl text-xs font-semibold cursor-pointer bg-white hover:bg-stone-50"
                            >
                              <ShoppingCart className="size-3.5 text-[#00615f]" />
                              <span>Xem đồ đi chợ</span>
                            </Button>

                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="rounded-xl text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                            >
                              <Link href="/meal-planner/calendar">
                                <CalendarIcon className="size-3.5" />
                                <span>Xem lịch tháng</span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Suggestion Pills */}
                  {msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#00615f] hover:text-white text-stone-700 text-[11px] font-medium transition cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="shrink-0 size-8 rounded-xl bg-[#00615f] flex items-center justify-center text-white">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl bg-stone-50 border border-stone-200/80 px-4 py-3 flex items-center gap-2 text-xs text-stone-500">
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
              className="absolute bottom-24 right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#00615f] border border-stone-200/90 shadow-lg hover:bg-emerald-50 text-xs font-semibold cursor-pointer animate-in fade-in transition"
            >
              <ArrowDown className="size-3.5 animate-bounce text-[#00615f]" />
              <span>Cuộn xuống dưới</span>
            </button>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-stone-100 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi (ví dụ: thực đơn ăn chay ngày mai, ăn 50K/ngày đủ chất không...)..."
                rows={1}
                className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] transition resize-none overflow-hidden"
                style={{ minHeight: "44px", maxHeight: "96px", height: "44px" }}
              />
              <Button
                type="submit"
                variant="default"
                disabled={!input.trim() || isTyping}
                className="shrink-0 px-4 sm:px-5 rounded-2xl font-bold gap-1.5 shadow-md h-11 cursor-pointer"
              >
                <Send className="size-4" />
                <span className="hidden sm:inline">Gửi</span>
              </Button>
            </form>
            <p className="text-center text-[10px] text-stone-400 mt-2">
              Vận hành bởi FoodSaver Agent JEV System One · Không hard-code · Chấm điểm khả thi thực tế.
            </p>
          </div>
        </div>
      </div>

      {/* ══════ MODAL: USER AI MEMORY TRANSPARENCY ══════ */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-emerald-50 text-[#00615f] flex items-center justify-center">
                  <Sliders className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">
                  Bộ nhớ AI của bạn
                </h3>
              </div>
              <button
                onClick={() => setIsMemoryModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Đây là các thông tin và thói quen mà AI đã ghi nhận trong các cuộc hội thoại để cá nhân hóa câu trả lời.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {userFacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  Chưa có thông tin cá nhân nào được lưu.
                </div>
              ) : (
                userFacts.map((fact: any) => (
                  <div
                    key={fact.key}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-stone-800">{fact.key}</p>
                      <p className="text-stone-600 mt-0.5">"{fact.value}"</p>
                    </div>
                    <span className="text-[10px] font-semibold text-[#00615f] bg-emerald-50 px-2 py-0.5 rounded">
                      Độ tin cậy: {Math.round(fact.confidence * 100)}%
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMemoryModalOpen(false)}
                className="rounded-xl px-4"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
