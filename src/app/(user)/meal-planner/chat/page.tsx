"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  Wallet,
  ShoppingCart,
  MapPin,
  ChefHat,
  Loader2,
  RotateCcw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: Wallet, label: "Ăn 50K/ngày được không?", prompt: "Làm sao để ăn chỉ với 50.000đ một ngày mà vẫn đủ dinh dưỡng?" },
  { icon: ShoppingCart, label: "Lên kế hoạch chi tiêu tháng", prompt: "Giúp mình lập kế hoạch tài chính chi tiêu ăn uống trong tháng với ngân sách 1.5 triệu" },
  { icon: MapPin, label: "Chợ nào rẻ nhất gần đây?", prompt: "Những chợ đầu mối nào ở Sài Gòn bán rau củ, thịt cá giá rẻ nhất?" },
  { icon: ChefHat, label: "Thực đơn 1 tuần cho 2 người", prompt: "Lên thực đơn ăn uống 1 tuần cho 2 người với chi phí dưới 500K" },
];

const MOCK_RESPONSES: Record<string, string> = {
  "Làm sao để ăn chỉ với 50.000đ một ngày mà vẫn đủ dinh dưỡng?": `**Hoàn toàn được!** Đây là gợi ý phân bổ 50K/ngày:

🌅 **Bữa sáng (10K):**
- Xôi đậu xanh tự nấu hoặc bánh mì trứng

☀️ **Bữa trưa (20K):**
- Cơm rang trứng + canh rau
- Hoặc bún xào thịt heo

🌙 **Bữa tối (15K):**
- Mì gói nấu thêm rau, trứng
- Hoặc cháo thịt bằm

🍎 **Snack (5K):**
- Chuối hoặc khoai lang luộc

💡 **Mẹo tiết kiệm:**
- Mua rau củ ở chợ truyền thống, tránh siêu thị
- Nấu cơm gạo giá rẻ (15K/kg)
- Mua trứng theo vỉ 30 quả (giá ~85K, chỉ ~2.8K/quả)
- Meal prep cuối tuần để tiết kiệm gas/điện`,

  "Giúp mình lập kế hoạch tài chính chi tiêu ăn uống trong tháng với ngân sách 1.5 triệu": `**Kế hoạch chi tiêu 1.5 triệu/tháng** 📊

📌 **Ngân sách hàng ngày:** ~50K/ngày × 30 ngày = 1.5 triệu

**Phân bổ theo tuần (375K/tuần):**

🛒 **Đi chợ 1 lần/tuần:**
- Gạo (5kg): 60K → dùng 2 tuần = 30K/tuần
- Thịt heo/gà: 80K (mua theo kg, chia nhỏ cấp đông)
- Trứng (vỉ 30): 85K → dùng 2 tuần = 42K/tuần
- Rau củ quả: 50K/tuần
- Gia vị, dầu ăn: 20K/tuần
- Bún/mì/phở: 30K/tuần
- Dự phòng: 43K/tuần

**💡 Mẹo quan trọng:**
1. Ghi chép chi tiêu mỗi ngày
2. Mua đồ khô số lượng lớn (gạo, mì, dầu)
3. Tận dụng combo FoodSaver giảm giá
4. Nấu nhiều chia thành nhiều bữa (meal prep)
5. Hạn chế ăn ngoài, trà sữa`,

  "Những chợ đầu mối nào ở Sài Gòn bán rau củ, thịt cá giá rẻ nhất?": `**Top chợ đầu mối giá rẻ tại TP.HCM** 🏪

1. **Chợ đầu mối Hóc Môn** 🥇
   - Rau củ, trái cây rẻ nhất
   - Giá sỉ, mở từ 2h sáng
   - Rẻ hơn chợ lẻ 30-40%

2. **Chợ đầu mối Thủ Đức**
   - Hải sản, thịt tươi sống
   - Mở sớm từ 3h sáng

3. **Chợ đầu mối Bình Điền** (Q8)
   - Hải sản lớn nhất miền Nam
   - Giá sỉ cực tốt nếu mua >5kg

4. **Chợ Bà Chiểu** (Bình Thạnh)
   - Tiện cho SV khu trung tâm
   - Giá khá cạnh tranh

💡 **Lưu ý:** Nên đi vào sáng sớm (5-7h) để chọn được hàng tươi nhất. Mua theo nhóm 3-4 bạn để chia giá sỉ!`,
};

function getAIResponse(input: string): string {
  const match = Object.entries(MOCK_RESPONSES).find(([key]) =>
    input.toLowerCase().includes(key.toLowerCase().slice(0, 20))
  );
  if (match) return match[1];

  return `Cảm ơn câu hỏi của bạn! 🤖

Mình đang xử lý yêu cầu: "${input}"

Hiện tại tính năng AI đang được phát triển. Trong lúc chờ, bạn có thể:

1. 📋 Xem **thực đơn gợi ý** tại trang Hôm nay ăn gì
2. 📅 Lên **lịch ăn tháng** để quản lý chi phí
3. 👥 Tham khảo **cộng đồng sinh viên** để học hỏi kinh nghiệm

Bạn có thể thử các câu hỏi gợi ý bên dưới nhé!`;
}

export default function MealChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Xin chào! 👋 Mình là **Trợ lý Tài chính Ăn uống** của FoodSaver.

Mình có thể giúp bạn:
- 💰 Lập kế hoạch chi tiêu ăn uống hàng tháng
- 🔍 Tìm nơi mua nguyên liệu giá rẻ
- 📋 Gợi ý thực đơn theo ngân sách
- 🧮 Tính toán chi phí ăn uống tối ưu

Hãy hỏi mình bất kỳ điều gì nhé!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(text.trim());
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: "Chat đã được reset! 🔄 Hỏi mình bất kỳ điều gì về chi tiêu ăn uống nhé.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f3f0] to-[#fef9f6] flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/meal-planner" className="p-2 rounded-xl hover:bg-stone-100 transition">
              <ArrowLeft className="size-4 text-stone-600" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-full bg-gradient-to-br from-[#00615f] to-[#089184] flex items-center justify-center shadow-md">
                <Bot className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black text-stone-900">Trợ lý Tài chính Ăn uống</h1>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-stone-500">Luôn sẵn sàng</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={resetChat} className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition" title="Reset chat">
            <RotateCcw className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white/60 backdrop-blur border border-stone-200/80 shadow-sm p-4 space-y-4 mb-4 min-h-[400px]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`shrink-0 size-8 rounded-full flex items-center justify-center ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-[#00615f] to-[#089184]"
                  : "bg-stone-200"
              }`}>
                {msg.role === "assistant" ? (
                  <Bot className="size-4 text-white" />
                ) : (
                  <User className="size-4 text-stone-600" />
                )}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "assistant"
                  ? "bg-white/80 border border-stone-200/60 shadow-sm"
                  : "bg-[#00615f] text-white"
              }`}>
                <div className={`text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === "assistant" ? "text-stone-700" : "text-white"
                }`}>
                  {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, idx) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={idx}>{part}</span>;
                  })}
                </div>
                <p className={`text-[9px] mt-1.5 ${msg.role === "assistant" ? "text-stone-400" : "text-white/60"}`}>
                  {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="shrink-0 size-8 rounded-full bg-gradient-to-br from-[#00615f] to-[#089184] flex items-center justify-center">
                <Bot className="size-4 text-white" />
              </div>
              <div className="rounded-2xl bg-white/80 border border-stone-200/60 shadow-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin text-[#00615f]" />
                  <span className="text-xs text-stone-400">Đang suy nghĩ...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {QUICK_PROMPTS.map((qp, idx) => {
              const Icon = qp.icon;
              return (
                <button
                  key={idx}
                  onClick={() => sendMessage(qp.prompt)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm hover:shadow-md hover:border-[#00615f]/30 text-left transition-all group"
                >
                  <div className="shrink-0 size-8 rounded-lg bg-[#00615f]/10 text-[#00615f] flex items-center justify-center group-hover:bg-[#00615f]/20 transition">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-stone-700 leading-snug">{qp.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về chi tiêu, thực đơn, nơi mua rẻ..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/80 backdrop-blur border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f]/40 transition resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="shrink-0 size-11 rounded-xl bg-[#00615f] text-white flex items-center justify-center hover:bg-[#004d4b] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
          >
            <Send className="size-4" />
          </button>
        </form>

        <p className="text-center text-[9px] text-stone-400 mt-2 pb-2">
          Trợ lý AI cung cấp gợi ý tham khảo. Giá cả có thể thay đổi theo khu vực.
        </p>
      </div>
    </div>
  );
}
