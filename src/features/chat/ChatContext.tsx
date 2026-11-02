"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  useSendChatMessageMutation,
  useGetChatMemoryQuery,
  useClearChatSessionMutation,
  useGetMonthMealPlansQuery,
  useGetChatSessionsQuery,
  useLazyGetChatSessionByIdQuery,
  useCreateChatSessionMutation,
  useDeleteChatSessionMutation,
} from "@/redux/api/mealPlannerApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ChatMessage, ChatSessionItem } from "./types";
import { streamChatMessage } from "./lib/streamChat";

export const DEFAULT_WELCOME_MSG: ChatMessage = {
  id: "welcome-1",
  role: "assistant",
  content:
    "Xin chào! Mình là **Trợ lý Dinh dưỡng & Tài chính FoodSaver** 🌿\n\nMình luôn sẵn sàng hỗ trợ bạn:\n- 🥗 Lên thực đơn ăn uống ngon miệng, đủ chất theo khẩu vị và ngân sách.\n- 🛒 Lập kế hoạch đi chợ thông minh, tiết kiệm tối đa.\n- ⚡ Săn các suất ăn giải cứu giờ vàng giảm giá đến 50% từ đối tác quanh bạn.\n\nHôm nay bạn muốn ăn gì hoặc cần mình hỗ trợ kế hoạch thế nào?",
  timestamp: new Date(),
};

interface ChatContextValue {
  sessionId: string;
  sessions: ChatSessionItem[];
  messages: ChatMessage[];
  isTyping: boolean;
  isSessionsLoading: boolean;
  isFetchingSession: boolean;
  isDockOpen: boolean;
  isDockMinimized: boolean;
  isMemoryModalOpen: boolean;
  userFacts: any[];
  setIsDockOpen: (open: boolean) => void;
  setIsDockMinimized: (minimized: boolean) => void;
  toggleDock: () => void;
  openDock: () => void;
  closeDock: () => void;
  setIsMemoryModalOpen: (open: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
  abortStreaming: () => void;
  switchSession: (targetSessionId: string) => Promise<void>;
  createNewSession: () => Promise<void>;
  deleteSessionById: (id: string) => Promise<void>;
  resetCurrentChat: () => Promise<void>;
  refetchMemory: () => void;
  refetchMealPlans: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Active chat state
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MSG]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);

  // Dock presentation state
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [isDockMinimized, setIsDockMinimized] = useState(false);

  // Streaming abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // RTK Query API Hooks
  const {
    data: sessionsRes,
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
  } = useGetChatSessionsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [fetchSessionDetail, { isFetching: isFetchingSession }] = useLazyGetChatSessionByIdQuery();
  const [createChatSession] = useCreateChatSessionMutation();
  const [deleteChatSession] = useDeleteChatSessionMutation();
  const [sendMessageMutation] = useSendChatMessageMutation();
  const [clearSessionMutation] = useClearChatSessionMutation();

  const { data: memoryRes, refetch: refetchMemory } = useGetChatMemoryQuery(
    { sessionId },
    { skip: !sessionId }
  );

  const now = new Date();
  const { refetch: refetchMealPlans } = useGetMonthMealPlansQuery({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const sessionsList = useMemo(() => sessionsRes?.data || [], [sessionsRes?.data]);
  const userFacts = useMemo(() => memoryRes?.data || [], [memoryRes?.data]);

  // Clean legacy shared localStorage entries
  useEffect(() => {
    try {
      localStorage.removeItem("foodsaver_chat_sessions_v3");
      localStorage.removeItem("foodsaver_active_session_id_v3");
      localStorage.removeItem("foodsaver_chat_sessions_v2");
      localStorage.removeItem("foodsaver_chat_sessions");
    } catch {
      // Ignore
    }
  }, []);

  // Account switch isolation: immediately flush state when user ID changes
  const prevUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    const currentUserId = user?.id || null;
    if (prevUserIdRef.current !== null && prevUserIdRef.current !== currentUserId) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setSessionId("");
      setMessages([DEFAULT_WELCOME_MSG]);
      setIsTyping(false);
    }
    prevUserIdRef.current = currentUserId;
  }, [user?.id]);

  // Session lifecycle synchronization
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      if (!sessionId || !sessionId.startsWith("guest_")) {
        const guestId = "guest_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
        setSessionId(guestId);
        setMessages([DEFAULT_WELCOME_MSG]);
      }
      return;
    }

    // Authenticated mode: wait for server sessions
    if (!isSessionsLoading) {
      if (sessionsList.length > 0) {
        const currentExists = sessionsList.some((s) => s.id === sessionId);
        if (!currentExists) {
          const firstSession = sessionsList[0];
          setSessionId(firstSession.id);
          fetchSessionDetail(firstSession.id)
            .unwrap()
            .then((res) => {
              if (res.data?.messages && res.data.messages.length > 0) {
                setMessages(
                  res.data.messages.map((m: any) => ({
                    id: m.id,
                    role: m.role as "user" | "assistant",
                    content: m.content,
                    timestamp: new Date(m.timestamp),
                    richCards: m.richCards,
                    quickSuggestions: m.quickSuggestions,
                  }))
                );
              } else {
                setMessages([DEFAULT_WELCOME_MSG]);
              }
            })
            .catch(() => {
              setMessages([DEFAULT_WELCOME_MSG]);
            });
        }
      } else {
        // No server sessions exist -> create initial persistent session
        createChatSession({ title: "Cuộc trò chuyện mới" })
          .unwrap()
          .then((res) => {
            if (res.data?.id) {
              setSessionId(res.data.id);
              setMessages([DEFAULT_WELCOME_MSG]);
            }
          })
          .catch((err) => {
            console.error("Auto-create initial session error:", err);
            const fallbackId = "session_" + Date.now();
            setSessionId(fallbackId);
            setMessages([DEFAULT_WELCOME_MSG]);
          });
      }
    }
  }, [isAuthenticated, isAuthLoading, isSessionsLoading, sessionsList, sessionId, fetchSessionDetail, createChatSession]);

  // Dock toggles
  const toggleDock = useCallback(() => {
    setIsDockOpen((prev) => {
      if (!prev) setIsDockMinimized(false);
      return !prev;
    });
  }, []);

  const openDock = useCallback(() => {
    setIsDockOpen(true);
    setIsDockMinimized(false);
  }, []);

  const closeDock = useCallback(() => {
    setIsDockOpen(false);
  }, []);

  // Stop / abort streaming
  const abortStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = {
        id: "u_" + Date.now(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

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

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      let streamedReply = "";
      let flushTimer: ReturnType<typeof setTimeout> | null = null;

      const flushStreamedReply = () => {
        flushTimer = null;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId ? { ...m, content: streamedReply } : m
          )
        );
      };

      const scheduleStreamFlush = () => {
        if (flushTimer === null) {
          flushTimer = setTimeout(flushStreamedReply, 40);
        }
      };

      try {
        await streamChatMessage({
          message: trimmed,
          sessionId,
          token,
          signal: abortController.signal,
          onToken: (chunk) => {
            streamedReply += chunk;
            scheduleStreamFlush();
          },
          onDone: ({ richCards, quickSuggestions }) => {
            if (flushTimer !== null) {
              clearTimeout(flushTimer);
              flushTimer = null;
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMsgId
                  ? { ...m, content: streamedReply, richCards, quickSuggestions }
                  : m
              )
            );
            if (richCards?.type === "calendar_applied") {
              refetchMealPlans();
            }
            if (isAuthenticated) {
              refetchSessions();
            }
          },
          onError: () => {
            throw new Error("Stream encountered error, requesting fallback");
          },
        });

        if (flushTimer !== null) {
          clearTimeout(flushTimer);
          flushTimer = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, content: streamedReply } : m
            )
          );
        }

        setIsTyping(false);
        abortControllerRef.current = null;
        refetchMemory();
        if (isAuthenticated) {
          refetchSessions();
        }
      } catch {
        if (abortController.signal.aborted) {
          setIsTyping(false);
          abortControllerRef.current = null;
          return;
        }

        // Fallback via RTK Query
        try {
          const res = await sendMessageMutation({
            message: trimmed,
            sessionId,
          }).unwrap();

          const botReply: ChatMessage = {
            id: botMsgId,
            role: "assistant",
            content: res.data.reply,
            timestamp: new Date(),
            richCards: res.data.richCards,
            quickSuggestions: res.data.quickSuggestions,
          };

          setMessages((prev) =>
            prev.map((m) => (m.id === botMsgId ? botReply : m))
          );

          if (res.data.richCards?.type === "calendar_applied") {
            refetchMealPlans();
          }
          if (isAuthenticated) {
            refetchSessions();
          }
          refetchMemory();
        } catch {
          toast.error("Không thể kết nối đến Trợ lý AI. Vui lòng thử lại sau");
        } finally {
          setIsTyping(false);
          abortControllerRef.current = null;
        }
      }
    },
    [
      isTyping,
      sessionId,
      token,
      isAuthenticated,
      sendMessageMutation,
      refetchMealPlans,
      refetchSessions,
      refetchMemory,
    ]
  );

  // Switch session
  const switchSession = useCallback(
    async (targetSessionId: string) => {
      if (targetSessionId === sessionId || isTyping) return;
      setSessionId(targetSessionId);

      try {
        const res = await fetchSessionDetail(targetSessionId).unwrap();
        if (res.data?.messages && res.data.messages.length > 0) {
          setMessages(
            res.data.messages.map((m: any) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              timestamp: new Date(m.timestamp),
              richCards: m.richCards,
              quickSuggestions: m.quickSuggestions,
            }))
          );
        } else {
          setMessages([DEFAULT_WELCOME_MSG]);
        }
      } catch (err) {
        console.error("Failed to load session details:", err);
        toast.error("Không thể tải tin nhắn của cuộc trò chuyện");
      }
    },
    [sessionId, isTyping, fetchSessionDetail]
  );

  // Create new session
  const createNewSession = useCallback(async () => {
    if (isTyping) return;

    if (isAuthenticated) {
      try {
        const res = await createChatSession({ title: "Cuộc trò chuyện mới" }).unwrap();
        if (res.data?.id) {
          setSessionId(res.data.id);
          setMessages([DEFAULT_WELCOME_MSG]);
          toast.success("Đã mở cuộc trò chuyện mới");
        }
      } catch (err) {
        console.error("Create chat session error:", err);
        toast.error("Không thể tạo cuộc trò chuyện mới");
      }
    } else {
      const newGuestId = "guest_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
      setSessionId(newGuestId);
      setMessages([DEFAULT_WELCOME_MSG]);
      toast.success("Đã mở phiên trò chuyện mới");
    }
  }, [isTyping, isAuthenticated, createChatSession]);

  // Delete session
  const deleteSessionById = useCallback(
    async (idToDelete: string) => {
      if (!idToDelete) return;

      if (isAuthenticated) {
        try {
          await deleteChatSession(idToDelete).unwrap();
          toast.success("Đã xóa cuộc trò chuyện");

          if (idToDelete === sessionId) {
            const remaining = sessionsList.filter((s) => s.id !== idToDelete);
            if (remaining.length > 0) {
              await switchSession(remaining[0].id);
            } else {
              await createNewSession();
            }
          }
        } catch (err) {
          console.error("Delete session error:", err);
          toast.error("Không thể xóa cuộc trò chuyện");
        }
      }
    },
    [isAuthenticated, sessionId, sessionsList, deleteChatSession, switchSession, createNewSession]
  );

  // Reset current chat
  const resetCurrentChat = useCallback(async () => {
    try {
      if (sessionId) {
        await clearSessionMutation({ sessionId }).unwrap();
      }
      const freshMsg: ChatMessage = {
        id: "welcome-reset-" + Date.now(),
        role: "assistant",
        content: "Đã làm mới cuộc hội thoại! Bạn muốn mình hỗ trợ gì tiếp theo?",
        timestamp: new Date(),
      };
      setMessages([freshMsg]);
      toast.success("Đã làm mới phiên hội thoại");
    } catch {
      setMessages([DEFAULT_WELCOME_MSG]);
    }
  }, [sessionId, clearSessionMutation]);

  const value: ChatContextValue = {
    sessionId,
    sessions: sessionsList,
    messages,
    isTyping,
    isSessionsLoading,
    isFetchingSession,
    isDockOpen,
    isDockMinimized,
    isMemoryModalOpen,
    userFacts,
    setIsDockOpen,
    setIsDockMinimized,
    toggleDock,
    openDock,
    closeDock,
    setIsMemoryModalOpen,
    sendMessage,
    abortStreaming,
    switchSession,
    createNewSession,
    deleteSessionById,
    resetCurrentChat,
    refetchMemory,
    refetchMealPlans,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
