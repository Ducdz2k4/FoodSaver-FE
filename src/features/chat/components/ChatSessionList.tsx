"use client";

import React from "react";
import Link from "next/link";
import { Clock, Plus, MessageSquare, Trash2, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "../ChatContext";
import { formatSessionTime } from "../lib/chatUtils";

interface ChatSessionListProps {
  onSelectSession?: () => void;
  compact?: boolean;
}

export function ChatSessionList({ onSelectSession, compact = false }: ChatSessionListProps) {
  const { isAuthenticated } = useAuth();
  const {
    sessionId,
    sessions,
    isSessionsLoading,
    isTyping,
    switchSession,
    createNewSession,
    deleteSessionById,
  } = useChat();

  const handleSelect = async (id: string) => {
    await switchSession(id);
    if (onSelectSession) onSelectSession();
  };

  const handleNew = async () => {
    await createNewSession();
    if (onSelectSession) onSelectSession();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSessionById(id);
  };

  return (
    <div className="rounded-2xl bg-white border border-stone-200/90 shadow-2xs p-3.5 sm:p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 uppercase tracking-wider">
          <Clock className="size-3.5 text-[#00615f]" />
          <span>Lịch sử trò chuyện</span>
        </div>
        {isAuthenticated ? (
          <Button
            size="xs"
            variant="outline"
            onClick={handleNew}
            disabled={isTyping}
            className="h-7 px-2.5 rounded-lg text-xs font-bold gap-1 border-[#00615f]/30 text-[#00615f] hover:bg-emerald-50 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>+ Chat mới</span>
          </Button>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
            Khách
          </span>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/50 to-stone-50 border border-emerald-100/80 text-center space-y-2.5">
          <div className="size-8 rounded-full bg-emerald-100/70 text-[#00615f] flex items-center justify-center mx-auto">
            <User className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-800">Chế độ Khách (Ẩn danh)</p>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Đăng nhập để lưu lịch sử cuộc trò chuyện và tự động đồng bộ thực đơn vào Lịch ăn cá nhân.
            </p>
          </div>
          <Button
            asChild
            size="xs"
            className="w-full bg-[#00615f] hover:bg-[#004e4c] text-white text-xs font-bold rounded-lg h-7 shadow-xs cursor-pointer"
          >
            <Link href="/login?redirect=/meal-planner/chat">Đăng nhập tài khoản</Link>
          </Button>
        </div>
      ) : (
        <div className={`space-y-1.5 ${compact ? "max-h-60" : "max-h-[175px]"} overflow-y-auto pr-1`}>
          {isSessionsLoading ? (
            <div className="flex items-center justify-center py-6 text-xs text-stone-400 gap-2">
              <Loader2 className="size-3.5 animate-spin text-[#00615f]" />
              <span>Đang tải lịch sử...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-4 text-xs text-stone-400">
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === sessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => handleSelect(sess.id)}
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
                    {isActive && <span className="size-1.5 rounded-full bg-[#00615f]" />}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, sess.id)}
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
      )}
    </div>
  );
}
