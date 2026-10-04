"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
  Plus,
  MessageSquare,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSendChatMessageMutation,
  useGetChatMemoryQuery,
  useClearChatSessionMutation,
  useGetMonthMealPlansQuery,
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

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string | Date;
    richCards?: any;
    quickSuggestions?: string[];
  }>;
}

const SESSIONS_STORAGE_KEY = "foodsaver_chat_sessions_v3";
const ACTIVE_SESSION_KEY = "foodsaver_active_session_id_v3";

const DEFAULT_WELCOME_MSG: Message = {
  id: "welcome-1",
  role: "assistant",
  content:
    "Xin chào! Mình là **Trợ lý Dinh dưỡng & Tài chính FoodSaver** 🌿\n\nMình luôn sẵn sàng hỗ trợ bạn:\n- 🥗 Lên thực đơn ăn uống ngon miệng, đủ chất theo khẩu vị và ngân sách.\n- 🛒 Lập kế hoạch đi chợ thông minh, tiết kiệm tối đa.\n- ⚡ Săn các suất ăn giải cứu giờ vàng giảm giá đến 50% từ đối tác quanh bạn.\n\nHôm nay bạn muốn ăn gì hoặc cần mình hỗ trợ kế hoạch thế nào?",
  timestamp: new Date(),
};

const QUICK_PROMPTS = [
  { icon: Wallet, label: "Ăn 50K/ngày đủ chất không?", prompt: "Làm sao để ăn chỉ với 50.000đ một ngày mà vẫn đủ dinh dưỡng?" },
  { icon: ShoppingCart, label: "Kế hoạch chi tiêu 1.5 triệu/tháng", prompt: "Giúp mình lập kế hoạch tài chính chi tiêu ăn uống trong tháng với ngân sách 1.5 triệu" },
  { icon: ChefHat, label: "Thực đơn ăn chay ngày mai", prompt: "Tạo thực đơn ăn chay ngày mai cho t đi" },
  { icon: Sparkles, label: "Hôm nay ăn gì ngon bổ rẻ?", prompt: "Hôm nay ăn gì ngon bổ rẻ gợi ý cho mình với" },
];

function formatVND(n: number) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

function getDishImage(dishName: string, slotImage?: string | null): string {
  if (slotImage && slotImage.trim() && slotImage !== "null") return slotImage;
  const lower = (dishName || "").toLowerCase();
  if (lower.includes("bánh mì")) return "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800";
  if (lower.includes("phở")) return "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800";
  if (lower.includes("bún")) return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800";
  if (lower.includes("cơm tấm") || lower.includes("cơm sườn")) return "/images/img-foodsaver/C%C6%A1m%20s%C6%B0%E1%BB%9Dn%20n%C6%B0%E1%BB%9Bng%20tr%E1%BB%A9ng%20%E1%BB%91p%20la.png";
  if (lower.includes("cơm") || lower.includes("chiên")) return "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800";
  if (lower.includes("đậu hũ") || lower.includes("đậu phụ")) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
  if (lower.includes("nấm") || lower.includes("canh")) return "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800";
  if (lower.includes("rau") || lower.includes("kho quẹt")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800";
  if (lower.includes("chè") || lower.includes("xôi")) return "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800";
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
}

function formatSessionTime(timestamp: number | string | Date): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins}p trước`;
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Hôm qua";
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

export default function MealPlannerChatPage() {
  const router = useRouter();

  // Sessions and persistence state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MSG]);
  const [isInitialized, setIsInitialized] = useState(false);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Initialize and load chat sessions from localStorage
  useEffect(() => {
    try {
      const rawSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);
      let parsedSessions: ChatSession[] = [];
      if (rawSessions) {
        parsedSessions = JSON.parse(rawSessions);
      }

      if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
        let active = parsedSessions.find((s) => s.id === savedActiveId);
        if (!active) {
          active = parsedSessions[0];
        }
        setSessions(parsedSessions);
        setSessionId(active.id);
        setMessages(
          active.messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
        localStorage.setItem(ACTIVE_SESSION_KEY, active.id);
      } else {
        const newId = "session_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
        const initialSession: ChatSession = {
          id: newId,
          title: "Cuộc trò chuyện mới",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [DEFAULT_WELCOME_MSG],
        };
        setSessions([initialSession]);
        setSessionId(newId);
        setMessages([DEFAULT_WELCOME_MSG]);
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([initialSession]));
        localStorage.setItem(ACTIVE_SESSION_KEY, newId);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
      const fallbackId = "session_" + Date.now();
      setSessionId(fallbackId);
      setMessages([DEFAULT_WELCOME_MSG]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync messages into active session and localStorage whenever messages update
  useEffect(() => {
    if (!isInitialized || !sessionId) return;

    setSessions((prevSessions) => {
      let found = false;
      const updated = prevSessions.map((s) => {
        if (s.id !== sessionId) return s;
        found = true;

        let title = s.title;
        if (!title || title === "Cuộc trò chuyện mới") {
          const firstUser = messages.find((m) => m.role === "user");
          if (firstUser) {
            const clean = firstUser.content.replace(/\n/g, " ").trim();
            title = clean.slice(0, 32).trim() + (clean.length > 32 ? "..." : "");
          }
        }

        return {
          ...s,
          title,
          updatedAt: Date.now(),
          messages,
        };
      });

      if (!found) {
        const firstUser = messages.find((m) => m.role === "user");
        let title = "Cuộc trò chuyện mới";
        if (firstUser) {
          const clean = firstUser.content.replace(/\n/g, " ").trim();
          title = clean.slice(0, 32).trim() + (clean.length > 32 ? "..." : "");
        }
        updated.unshift({
          id: sessionId,
          title,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages,
        });
      }

      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("localStorage quota exceeded:", err);
      }
      return updated;
    });
  }, [messages, sessionId, isInitialized]);

  // API Hooks
  const [sendMessageMutation] = useSendChatMessageMutation();
  const { data: memoryRes, refetch: refetchMemory } = useGetChatMemoryQuery(
    { sessionId },
    { skip: !sessionId }
  );
  const [clearSessionMutation] = useClearChatSessionMutation();

  // AI Meal Planner Calendar Query for Interactive Widget
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const { data: monthMealPlansRes, refetch: refetchMealPlans } = useGetMonthMealPlansQuery({
    year: currentYear,
    month: currentMonth + 1,
  });

  const monthPlans = monthMealPlansRes?.data || {};
  const userFacts = memoryRes?.data || [];

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const formatDateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  const tomorrowDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const tomorrowKey = useMemo(() => formatDateKey(tomorrowDate), [tomorrowDate]);
  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  const featuredDateInfo = useMemo(() => {
    if (monthPlans[tomorrowKey] && Object.keys(monthPlans[tomorrowKey]).length > 0) {
      return {
        dateKey: tomorrowKey,
        label: "Ngày mai",
        displayDate: `${pad2(tomorrowDate.getDate())}/${pad2(tomorrowDate.getMonth() + 1)}`,
        plan: monthPlans[tomorrowKey],
      };
    }
    if (monthPlans[todayKey] && Object.keys(monthPlans[todayKey]).length > 0) {
      const today = new Date();
      return {
        dateKey: todayKey,
        label: "Hôm nay",
        displayDate: `${pad2(today.getDate())}/${pad2(today.getMonth() + 1)}`,
        plan: monthPlans[todayKey],
      };
    }
    const sortedDates = Object.keys(monthPlans).sort();
    const nextDate = sortedDates.find((d) => d >= todayKey && Object.keys(monthPlans[d]).length > 0);
    if (nextDate) {
      const [y, m, d] = nextDate.split("-");
      return {
        dateKey: nextDate,
        label: `Ngày ${d}/${m}`,
        displayDate: `${d}/${m}`,
        plan: monthPlans[nextDate],
      };
    }
    if (sortedDates.length > 0) {
      const lastDate = sortedDates[sortedDates.length - 1];
      const [y, m, d] = lastDate.split("-");
      return {
        dateKey: lastDate,
        label: `Ngày ${d}/${m}`,
        displayDate: `${d}/${m}`,
        plan: monthPlans[lastDate],
      };
    }
    return {
      dateKey: tomorrowKey,
      label: "Ngày mai",
      displayDate: `${pad2(tomorrowDate.getDate())}/${pad2(tomorrowDate.getMonth() + 1)}`,
      plan: null,
    };
  }, [monthPlans, tomorrowKey, todayKey, tomorrowDate]);

  const featuredSlots = useMemo(() => {
    if (!featuredDateInfo.plan) return [];
    const list: Array<{
      slotKey: "breakfast" | "lunch" | "dinner" | "snack";
      label: string;
      icon: string;
      data: any;
    }> = [];

    if (featuredDateInfo.plan.breakfast) {
      list.push({ slotKey: "breakfast", label: "Sáng", icon: "🌅", data: featuredDateInfo.plan.breakfast });
    }
    if (featuredDateInfo.plan.lunch) {
      list.push({ slotKey: "lunch", label: "Trưa", icon: "☀️", data: featuredDateInfo.plan.lunch });
    }
    if (featuredDateInfo.plan.dinner) {
      list.push({ slotKey: "dinner", label: "Tối", icon: "🌙", data: featuredDateInfo.plan.dinner });
    }
    if (featuredDateInfo.plan.snack) {
      list.push({ slotKey: "snack", label: "Phụ", icon: "🍎", data: featuredDateInfo.plan.snack });
    }
    return list;
  }, [featuredDateInfo]);

  const dayTotalCost = useMemo(() => {
    return featuredSlots.reduce((sum, item) => sum + (item.data?.cost || 0), 0);
  }, [featuredSlots]);

  const dayTotalCalories = useMemo(() => {
    return featuredSlots.reduce((sum, item) => sum + (item.data?.calories || 0), 0);
  }, [featuredSlots]);

  const handleNewChat = () => {
    const newId = "session_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
    const freshMsg: Message = {
      ...DEFAULT_WELCOME_MSG,
      id: "welcome_" + Date.now(),
      timestamp: new Date(),
    };
    const newSession: ChatSession = {
      id: newId,
      title: "Cuộc trò chuyện mới",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [freshMsg],
    };

    const nextSessions = [newSession, ...sessions.filter((s) => s.id !== newId)];
    setSessions(nextSessions);
    setSessionId(newId);
    setMessages([freshMsg]);
    localStorage.setItem(ACTIVE_SESSION_KEY, newId);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(nextSessions));
    toast.success("Đã mở cuộc trò chuyện mới");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSelectSession = (s: ChatSession) => {
    if (s.id === sessionId) return;
    setSessionId(s.id);
    setMessages(
      s.messages.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }))
    );
    localStorage.setItem(ACTIVE_SESSION_KEY, s.id);
  };

  const handleDeleteSession = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== idToDelete);

    if (filtered.length === 0) {
      const newId = "session_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
      const freshSession: ChatSession = {
        id: newId,
        title: "Cuộc trò chuyện mới",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [DEFAULT_WELCOME_MSG],
      };
      setSessions([freshSession]);
      setSessionId(newId);
      setMessages([DEFAULT_WELCOME_MSG]);
      localStorage.setItem(ACTIVE_SESSION_KEY, newId);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([freshSession]));
    } else {
      setSessions(filtered);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));
      if (idToDelete === sessionId) {
        const next = filtered[0];
        setSessionId(next.id);
        setMessages(
          next.messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
        localStorage.setItem(ACTIVE_SESSION_KEY, next.id);
      }
    }
    toast.success("Đã xóa đoạn trò chuyện");
  };

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 96;
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
                  if (richCards?.type === "calendar_applied") {
                    refetchMealPlans();
                  }
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
        if (res.data.richCards?.type === "calendar_applied") {
          refetchMealPlans();
        }
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
      const freshMsg: Message = {
        id: "welcome-reset",
        role: "assistant",
        content: "Đã làm mới cuộc hội thoại! Bạn muốn mình hỗ trợ gì tiếp theo?",
        timestamp: new Date(),
      };
      setMessages([freshMsg]);
      toast.success("Đã làm mới phiên hội thoại");
    } catch {
      setMessages([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* ══════ MAIN GRID: 4 COLS INTERACTIVE SIDEBAR + 8 COLS CHAT ══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Chat Sessions History + AI Meal Plan Interactive Widget + Memory */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* SECTION 1: LỊCH SỬ TRÒ CHUYỆN (SESSIONS MANAGER) */}
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 uppercase tracking-wider">
                <Clock className="size-3.5 text-[#00615f]" />
                <span>Lịch sử trò chuyện</span>
              </div>
              <Button
                size="xs"
                variant="outline"
                onClick={handleNewChat}
                disabled={isTyping}
                className="h-7 px-2.5 rounded-lg text-xs font-bold gap-1 border-[#00615f]/30 text-[#00615f] hover:bg-emerald-50 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>+ Chat mới</span>
              </Button>
            </div>

            <div className="space-y-1.5 max-h-[175px] overflow-y-auto pr-1">
              {sessions.length === 0 ? (
                <div className="text-center py-4 text-xs text-stone-400">
                  Chưa có cuộc trò chuyện nào
                </div>
              ) : (
                sessions.map((sess) => {
                  const isActive = sess.id === sessionId;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectSession(sess)}
                      className={`group flex items-center justify-between gap-2 p-2 rounded-xl text-left transition-all cursor-pointer border ${
                        isActive
                          ? "bg-emerald-50/80 border-[#00615f]/40 text-[#00615f] shadow-2xs font-semibold"
                          : "bg-stone-50 hover:bg-stone-100/80 border-stone-200/60 text-stone-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare
                          className={`size-3.5 shrink-0 ${
                            isActive ? "text-[#00615f]" : "text-stone-400 group-hover:text-stone-600"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs truncate leading-snug">
                            {sess.title || "Cuộc trò chuyện mới"}
                          </p>
                          <p className="text-[10px] text-stone-400 font-normal">
                            {formatSessionTime(sess.updatedAt || sess.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isActive && (
                          <span className="size-1.5 rounded-full bg-[#00615f]" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, sess.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-50 hover:text-rose-600 text-stone-400 transition cursor-pointer"
                          title="Xóa cuộc trò chuyện"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SECTION 2: WIDGET KẾ HOẠCH ĂN UỐNG AI GẦN NHẤT (INTERACTIVE MEAL WIDGET) */}
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 uppercase tracking-wider">
                <Sparkles className="size-3.5 text-[#00615f]" />
                <span>Kế hoạch ăn uống AI</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#00615f] border border-emerald-200/80">
                {featuredDateInfo.label} · {featuredDateInfo.displayDate}
              </span>
            </div>

            {featuredSlots.length > 0 ? (
              <div className="space-y-2.5">
                {/* Daily Total Summary Strip */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs">
                  <span className="font-semibold text-stone-700">Dự kiến ngày:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#00615f]">{formatVND(dayTotalCost)}</span>
                    <span className="text-[11px] text-stone-500">({dayTotalCalories} kcal)</span>
                  </div>
                </div>

                {/* Slots with authentic food images, fully clickable */}
                <div className="space-y-1.5">
                  {featuredSlots.map((item) => {
                    const dish = item.data;
                    const imgSrc = getDishImage(dish.meal, dish.image);
                    return (
                      <Link
                        key={item.slotKey}
                        href={`/meal-planner/calendar?date=${featuredDateInfo.dateKey}`}
                        className="group flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200/60 hover:border-[#00615f]/40 transition-all cursor-pointer shadow-2xs"
                        title={`Bấm để xem chi tiết trên Lịch ăn tháng`}
                      >
                        <div className="relative shrink-0 size-11 rounded-lg overflow-hidden bg-stone-200 border border-stone-200/80">
                          <img
                            src={imgSrc}
                            alt={dish.meal}
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
                            }}
                          />
                          <span className="absolute bottom-0 right-0 px-1 py-0.2 rounded-tl text-[8px] font-bold bg-black/60 text-white backdrop-blur-2xs">
                            {item.icon}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500">
                              {item.label}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-stone-900 group-hover:text-[#00615f] truncate transition-colors">
                            {dish.meal}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-bold text-[#00615f]">
                              {formatVND(dish.cost)}
                            </span>
                            <span className="text-[10px] text-stone-400">·</span>
                            <span className="text-[10px] text-stone-500">
                              {dish.calories} kcal
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="size-4 text-stone-400 group-hover:text-[#00615f] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    );
                  })}
                </div>

                {/* Direct Action Link */}
                <Link
                  href={`/meal-planner/calendar?date=${featuredDateInfo.dateKey}`}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-[#00615f] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <CalendarIcon className="size-3.5 text-[#00615f]" />
                  <span>Mở xem chi tiết Lịch ăn tháng</span>
                  <ArrowRight className="size-3 text-[#00615f]" />
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 p-4 text-center space-y-2.5 bg-stone-50/50">
                <div className="size-10 rounded-full bg-emerald-50 text-[#00615f] flex items-center justify-center mx-auto">
                  <ChefHat className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">Chưa có thực đơn ngày mai</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Nhờ AI lên kế hoạch ăn uống ngon bổ rẻ và đồng bộ 1-chạm vào lịch:
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleSend("Tạo thực đơn ăn chay ngày mai cho t đi")}
                  disabled={isTyping}
                  className="w-full rounded-xl text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Sparkles className="size-3.5" />
                  <span>✨ Lên thực đơn ngày mai ngay</span>
                </Button>
              </div>
            )}
          </div>

          {/* SECTION 3: AI MEMORY TRANSPARENCY CARD */}
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-2xs p-4 sm:p-5 space-y-2.5">
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
        </div>

        {/* Right Column: Interactive Chat Stream Feed */}
        <div className="lg:col-span-8 flex flex-col h-[680px] rounded-3xl bg-white border border-stone-200/90 shadow-2xs overflow-hidden relative">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-[#00615f] text-white flex items-center justify-center shadow-2xs">
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

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleNewChat}
                className="p-2 rounded-xl hover:bg-stone-200/60 text-stone-500 hover:text-stone-800 transition cursor-pointer"
                title="Mở đoạn chat mới"
              >
                <Plus className="size-4" />
              </button>
              <button
                onClick={handleResetChat}
                className="p-2 rounded-xl hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                title="Làm mới cuộc hội thoại"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>
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
                      ? "bg-[#00615f] text-white shadow-2xs"
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
                        ? "bg-white border border-stone-200/90 text-stone-800 shadow-2xs relative"
                        : "bg-[#00615f] text-white shadow-2xs"
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
                      {msg.timestamp instanceof Date && !isNaN(msg.timestamp.getTime())
                        ? msg.timestamp.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>

                  {/* ══════ RICH CARDS EMBEDDED IN CHAT ══════ */}
                  {msg.richCards && (
                    <div className="space-y-2.5 animate-in fade-in zoom-in-95">
                      {/* Rich Card: Calendar Conflict Detected */}
                      {msg.richCards.type === "calendar_conflict" && msg.richCards.data && (
                        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 space-y-3 shadow-2xs">
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

                          <p className="text-xs text-stone-700 font-medium">
                            Bạn muốn thay thế như thế nào?
                          </p>

                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSend("Thay thế toàn bộ ngày mai")}
                              className="rounded-xl text-xs font-bold gap-1 shadow-2xs"
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
                        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 space-y-3 shadow-2xs">
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
                            {msg.richCards.data.slots?.map((slot: any, sIdx: number) => {
                              const slotImg = getDishImage(slot.meal || slot.name, slot.image);
                              return (
                                <div
                                  key={sIdx}
                                  className="p-2.5 rounded-xl bg-white border border-emerald-200/70 flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={slotImg}
                                      alt={slot.meal || slot.name}
                                      className="size-8 rounded-lg object-cover border border-stone-100 shrink-0"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
                                      }}
                                    />
                                    <div className="truncate">
                                      <span className="font-bold text-stone-700 mr-1.5">
                                        {slot.slot === "breakfast" ? "🌅 Sáng:" : slot.slot === "lunch" ? "☀️ Trưa:" : slot.slot === "dinner" ? "🌙 Tối:" : "🍎 Phụ:"}
                                      </span>
                                      <span className="font-semibold text-stone-900">{slot.meal || slot.name}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 ml-2">
                                    <span className="text-[11px] font-bold text-[#00615f]">{formatVND(slot.cost)}</span>
                                    <span className="text-[10px] text-stone-500">({slot.calories} kcal)</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              asChild
                              size="sm"
                              variant="default"
                              className="flex-1 rounded-xl text-xs font-bold gap-1.5 shadow-2xs"
                            >
                              <Link href={`/meal-planner/calendar?date=${msg.richCards.data.date || tomorrowKey}`}>
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
                          <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                              <Store className="size-3.5 text-[#00615f]" />
                              <span>Suất ăn giải cứu cận date gần bạn</span>
                            </span>
                            <span className="text-[10px] font-semibold text-stone-400">
                              {msg.richCards.data.length} deal giờ vàng
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {msg.richCards.data.map((deal: any) => (
                              <div
                                key={deal.id}
                                className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="min-w-0">
                                  <p className="font-bold text-stone-900 truncate">{deal.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-bold text-[#00615f]">
                                      {formatVND(deal.discountPrice)}
                                    </span>
                                    <span className="line-through text-stone-400 text-[10px]">
                                      {formatVND(deal.originalPrice)}
                                    </span>
                                    <span className="text-[10px] text-stone-500">· {deal.partnerName}</span>
                                  </div>
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
                        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 space-y-3 shadow-2xs">
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
                              className="rounded-xl text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
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
                              <Link href={`/meal-planner/calendar?date=${tomorrowKey}`}>
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
            {/* Quick Prompts mini-strip if newly opened */}
            {messages.length <= 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
                {QUICK_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(item.prompt)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
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
