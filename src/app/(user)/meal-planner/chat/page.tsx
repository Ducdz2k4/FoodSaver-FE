"use client";

import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: Wallet, label: "Ăn 50K/ngày đủ chất không?", prompt: "Làm sao để ăn chỉ với 50.000đ một ngày mà vẫn đủ dinh dưỡng?" },
  { icon: ShoppingCart, label: "Kế hoạch chi tiêu 1.5 triệu/tháng", prompt: "Giúp mình lập kế hoạch tài chính chi tiêu ăn uống trong tháng với ngân sách 1.5 triệu" },
  { icon: MapPin, label: "Chợ nào rẻ nhất ở Sài Gòn?", prompt: "Những chợ đầu mối nào ở Sài Gòn bán rau củ, thịt cá giá rẻ nhất?" },
  { icon: ChefHat, label: "Thực đơn 1 tuần cho 2 người < 500K", prompt: "Lên thực đơn ăn uống 1 tuần cho 2 người với chi phí dưới 500K" },
];

const MOCK_RESPONSES: Record<string, string> = {
  "Làm sao để ăn chỉ với 50.000đ một ngày mà vẫn đủ dinh dưỡng?": `**Hoàn toàn được!** Đây là gợi ý phân bổ 50K/ngày cho 1 người:

🌅 **Bữa sáng (10K):**
- Xôi đậu xanh tự nấu hoặc bánh mì trứng ốp la

☀️ **Bữa trưa (20K):**
- Cơm rang trứng dưa bò + canh rau
- Hoặc bún xào thịt heo / đậu hũ xào rau củ

🌙 **Bữa tối (15K):**
- Canh chua cá lóc + cơm trắng
- Hoặc mì gói nấu thêm rau, trứng, đậu hũ

🍎 **Snack (5K):**
- 1 quả chuối hoặc khoai lang luộc

💡 **Mẹo tiết kiệm:**
- Mua rau củ ở chợ truyền thống vào sáng sớm, tránh siêu thị
- Nấu cơm gạo giá rẻ (15K - 18K/kg)
- Mua trứng theo vỉ 30 quả (giá ~85K, chỉ ~2.8K/quả)
- Meal prep cuối tuần để tiết kiệm gas/điện và thời gian`,

  "Giúp mình lập kế hoạch tài chính chi tiêu ăn uống trong tháng với ngân sách 1.5 triệu": `**Kế hoạch chi tiêu 1.5 triệu/tháng** 📊

📌 **Ngân sách bình quân:** ~50K/ngày × 30 ngày = 1.5 triệu

**Phân bổ theo tuần (375K/tuần):**

🛒 **Đi chợ 1 lần/tuần:**
- Gạo (5kg): 70K → dùng 2 tuần = 35K/tuần
- Thịt heo/gà: 100K (mua theo kg, chia nhỏ từng túi cấp đông)
- Trứng (vỉ 30): 85K → dùng 2 tuần = 42K/tuần
- Rau củ quả theo mùa: 60K/tuần
- Gia vị, dầu ăn, nước mắm: 25K/tuần
- Đậu hũ, bún, mì: 35K/tuần
- Quỹ dự phòng: 78K/tuần

**💡 Nguyên tắc vàng:**
1. Ghi chép chi tiêu mỗi ngày
2. Mua đồ khô số lượng lớn (gạo, mì, dầu ăn)
3. Tận dụng các deal giảm giá giải cứu thực phẩm FoodSaver
4. Nấu 1 lần ăn 2 bữa (meal-prep)
5. Hạn chế tối đa đặt đồ ăn ngoài và nước ngọt`,

  "Những chợ đầu mối nào ở Sài Gòn bán rau củ, thịt cá giá rẻ nhất?": `**Top chợ đầu mối giá rẻ tại TP.HCM** 🏪

1. **Chợ đầu mối Hóc Môn** 🥇
   - Rau củ quả, thịt heo lớn nhất phía Tây Bắc
   - Giá sỉ cực tốt, mở từ 2h sáng
   - Rẻ hơn chợ lẻ 30-40%

2. **Chợ đầu mối Nông sản Thủ Đức**
   - Trái cây, rau củ khu vực phía Đông
   - Giá sỉ trái cây theo thùng/rổ rất rẻ

3. **Chợ đầu mối Bình Điền** (Quận 8)
   - Chợ hải sản, thịt tươi sống lớn nhất miền Nam
   - Hải sản tươi rói, giá siêu mềm khi mua từ 3-5kg

4. **Chợ Bà Chiểu & Chợ Tân Định**
   - Tiện cho người sống ở khu trung tâm, nhiều sạp bán rau củ bình dân

💡 **Lưu ý:** Nên đi vào khung 5h - 7h sáng để chọn đồ mới về tươi nhất. Rủ bạn bè hoặc hàng xóm mua chung để chia giá sỉ!`,
};

function getAIResponse(input: string): string {
  const match = Object.entries(MOCK_RESPONSES).find(([key]) =>
    input.toLowerCase().includes(key.toLowerCase().slice(0, 15))
  );
  if (match) return match[1];

  return `Cảm ơn câu hỏi của bạn! 🤖

Mình đã ghi nhận câu hỏi: "${input}"

Để tối ưu chi tiêu ăn uống hàng ngày, bạn có thể:
1. 🍳 Xem **công thức & thực đơn** tại tab Thực đơn
2. 📅 Theo dõi **lịch ăn tháng** để kiểm soát chi phí từng ngày
3. 👥 Tham khảo kinh nghiệm từ **cộng đồng chia sẻ**
4. 💡 Thử các câu hỏi gợi ý bên cạnh để nhận phân bổ ngân sách chi tiết!`;
}

export default function MealChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Xin chào! 👋 Mình là **Trợ lý Tài chính Ăn uống** của FoodSaver.

Mình có thể hỗ trợ bạn:
- 💰 Lập kế hoạch chi tiêu ăn uống hàng tháng theo ngân sách
- 🔍 Tìm nơi mua nguyên liệu giá rẻ & chợ đầu mối uy tín
- 📋 Gợi ý thực đơn tiết kiệm (ví dụ: làm sao ăn 50K/ngày)
- 🧮 Tính toán chi phí ăn uống tối ưu cho cá nhân và gia đình

Hãy chọn câu hỏi gợi ý hoặc nhập thắc mắc bên dưới nhé!`,
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
    }, 700 + Math.random() * 800);
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
        content: "Cuộc trò chuyện đã được làm mới! 🔄 Hãy hỏi mình bất kỳ câu hỏi nào về chi tiêu hoặc thực đơn nhé.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Prompts & Tips */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#00615f]" />
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Câu hỏi tài chính thường gặp
              </h3>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Bấm nhanh vào các câu hỏi bên dưới để nhận ngay lời khuyên phân bổ ngân sách:
            </p>
            <div className="space-y-2 pt-1">
              {QUICK_PROMPTS.map((qp, idx) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => sendMessage(qp.prompt)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-50/80 hover:bg-emerald-50/70 border border-stone-200/60 hover:border-[#00615f]/30 text-left transition-all group"
                  >
                    <div className="shrink-0 size-8 rounded-lg bg-[#00615f]/10 text-[#00615f] flex items-center justify-center group-hover:bg-[#00615f] group-hover:text-white transition">
                      <Icon className="size-4" />
                    </div>
                    <span className="text-xs font-semibold text-stone-700 leading-snug group-hover:text-[#00615f]">
                      {qp.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200/50 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-stone-800">Mẹo lập ngân sách</h4>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Áp dụng quy tắc <strong>50/30/20</strong>: Tối đa 50% thu nhập cho nhu cầu thiết yếu (bao gồm ăn uống). Tiết kiệm chi phí ăn uống là cách nhanh nhất để tăng số dư cuối tháng!
            </p>
          </div>
        </div>

        {/* Right: Interactive Chat */}
        <div className="lg:col-span-8 flex flex-col h-[650px] rounded-2xl bg-white/80 backdrop-blur border border-stone-200/80 shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-gradient-to-br from-[#00615f] to-[#089184] flex items-center justify-center text-white shadow-sm">
                <Bot className="size-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-stone-900">Trợ lý Tài chính Ăn uống AI</h2>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-stone-500">Trực tuyến · Sẵn sàng tư vấn chi tiêu</span>
                </div>
              </div>
            </div>
            <button
              onClick={resetChat}
              className="p-2 rounded-xl hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition"
              title="Làm mới trò chuyện"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`shrink-0 size-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-[#00615f] to-[#089184] text-white shadow-sm"
                      : "bg-stone-800 text-white"
                  }`}
                >
                  {msg.role === "assistant" ? <Bot className="size-4" /> : <User className="size-4" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 ${
                    msg.role === "assistant"
                      ? "bg-stone-50 border border-stone-200/80 text-stone-800"
                      : "bg-[#00615f] text-white shadow-sm"
                  }`}
                >
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, idx) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                          <strong key={idx} className="font-bold">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return <span key={idx}>{part}</span>;
                    })}
                  </div>
                  <p
                    className={`text-[9px] mt-1.5 ${
                      msg.role === "assistant" ? "text-stone-400" : "text-emerald-100"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="shrink-0 size-8 rounded-full bg-gradient-to-br from-[#00615f] to-[#089184] flex items-center justify-center text-white">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl bg-stone-50 border border-stone-200/80 px-4 py-3 flex items-center gap-2 text-xs text-stone-500">
                  <Loader2 className="size-3.5 animate-spin text-[#00615f]" />
                  <span>Đang tính toán ngân sách và câu trả lời...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-stone-100 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi (ví dụ: làm sao ăn 50K một ngày, thực đơn 1 tháng 2 triệu...)..."
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] transition resize-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="shrink-0 px-4 sm:px-5 rounded-xl bg-[#00615f] text-white flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-[#004d4b] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
              >
                <Send className="size-4" />
                <span className="hidden sm:inline">Gửi</span>
              </button>
            </form>
            <p className="text-center text-[10px] text-stone-400 mt-2">
              Trợ lý tài chính hỗ trợ phân bổ chi phí và gợi ý địa điểm mua sắm thông minh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
