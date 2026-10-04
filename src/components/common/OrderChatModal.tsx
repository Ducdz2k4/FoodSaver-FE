"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, MessageSquare, Loader2, Phone } from "lucide-react";
import {
  useGetOrderChatQuery,
  useSendOrderChatMessageMutation,
  useRecordOrderCallMutation,
} from "@/redux/api/orderApi";
import { useSocket } from "@/context/SocketContext";
import { OrderChatMessageDTO } from "@/types/contract";
import { toast } from "sonner";

interface OrderChatModalProps {
  orderId: string;
  orderNumber: string;
  partnerName: string;
  customerName: string;
  targetPhone?: string;
  currentUserRole: "CUSTOMER" | "PARTNER";
  isOpen: boolean;
  onClose: () => void;
}

export function OrderChatModal({
  orderId,
  orderNumber,
  partnerName,
  customerName,
  targetPhone,
  currentUserRole,
  isOpen,
  onClose,
}: OrderChatModalProps) {
  const { data: chatData, isLoading } = useGetOrderChatQuery(orderId, {
    skip: !isOpen || !orderId,
  });
  const [sendMessageMutation, { isLoading: isSending }] = useSendOrderChatMessageMutation();
  const [recordCallMutation] = useRecordOrderCallMutation();
  const { socket } = useSocket();

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<OrderChatMessageDTO[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync initial messages from query
  useEffect(() => {
    if (chatData?.thread?.messages) {
      setMessages(chatData.thread.messages);
    }
  }, [chatData]);

  // Real-time socket listener
  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleIncomingMessage = (payload: any) => {
      if (payload.orderId === orderId && payload.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.message.id)) return prev;
          return [...prev, payload.message];
        });
      }
    };

    socket.on("RECEIVE_ORDER_CHAT_MESSAGE", handleIncomingMessage);

    return () => {
      socket.off("RECEIVE_ORDER_CHAT_MESSAGE", handleIncomingMessage);
    };
  }, [socket, isOpen, orderId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isSending) return;

    setInputMessage("");
    try {
      const res = await sendMessageMutation({
        orderId,
        message: text,
      }).unwrap();

      if (res && !messages.some((m) => m.id === res.id)) {
        setMessages((prev) => [...prev, res]);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể gửi tin nhắn");
      setInputMessage(text);
    }
  };

  const handlePhoneCall = async () => {
    try {
      await recordCallMutation({
        orderId,
        eventType: "CALL_INITIATED",
        durationSec: 0,
      }).unwrap();
    } catch {
      // Ignore call log errors
    }

    if (targetPhone) {
      window.location.href = `tel:${targetPhone}`;
    } else {
      toast.info("Không tìm thấy số điện thoại liên hệ");
    }
  };

  if (!isOpen) return null;

  const partnerTitle = partnerName || "Cửa hàng đối tác";
  const customerTitle = customerName || "Khách hàng";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg h-[550px] shadow-2xl flex flex-col overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#00615f] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-white/10 flex items-center justify-center">
              <MessageSquare className="size-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {currentUserRole === "CUSTOMER" ? partnerTitle : customerTitle}
              </h3>
              <p className="text-[11px] text-emerald-100 font-mono">
                Đơn hàng #{orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {targetPhone && (
              <button
                type="button"
                onClick={handlePhoneCall}
                title="Gọi điện trực tiếp"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <Phone className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fbf9f7]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-stone-400 gap-2 text-xs font-bold">
              <Loader2 className="size-4 animate-spin text-[#00615f]" />
              <span>Đang tải tin nhắn...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-xs text-center space-y-1">
              <MessageSquare className="size-8 text-stone-300 stroke-[1.5]" />
              <p className="font-bold">Chưa có tin nhắn nào</p>
              <p className="text-[11px]">Hãy trao đổi với {currentUserRole === "CUSTOMER" ? "quán" : "khách"} về thời gian lấy món hoặc giao hàng nhé!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine =
                (currentUserRole === "CUSTOMER" && msg.senderRole === "CUSTOMER") ||
                (currentUserRole === "PARTNER" && msg.senderRole === "PARTNER");

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                      isMine
                        ? "bg-[#00615f] text-white rounded-br-none"
                        : "bg-white text-stone-800 border border-stone-200/80 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed font-medium">
                      {msg.message}
                    </p>
                    <div
                      className={`text-[9px] mt-1 font-mono ${
                        isMine ? "text-emerald-200 text-right" : "text-stone-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập tin nhắn trao đổi..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="p-2.5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white disabled:opacity-40 transition shadow-sm active:scale-95"
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
