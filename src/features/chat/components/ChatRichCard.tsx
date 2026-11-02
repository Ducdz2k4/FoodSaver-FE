"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Calendar as CalendarIcon,
  Store,
  ArrowRight,
  X,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVND, getDishImage } from "../lib/chatUtils";

interface ChatRichCardProps {
  card: {
    type: string;
    data?: any;
  };
  compact?: boolean;
  onSendPrompt: (prompt: string) => void;
}

export function ChatRichCard({ card, compact = false, onSendPrompt }: ChatRichCardProps) {
  if (!card || !card.type) return null;

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = `${tomorrow.getFullYear()}-${pad2(tomorrow.getMonth() + 1)}-${pad2(tomorrow.getDate())}`;

  // 1. Rich Card: Auth Required (Guest attempted calendar mutation)
  if (card.type === "auth_required") {
    return (
      <div className={`rounded-2xl border border-amber-300 bg-amber-50/80 ${compact ? "p-3 space-y-2.5" : "p-4 sm:p-5 space-y-3"} shadow-2xs`}>
        <div className="flex items-center gap-2 pb-2 border-b border-amber-200/80">
          <div className="size-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              Cần đăng nhập tài khoản
            </h4>
            <p className="text-[10px] text-amber-700">
              Chức năng lưu và đồng bộ lịch ăn chỉ áp dụng cho thành viên
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-700 leading-relaxed">
          {card.data?.message ||
            "Vui lòng đăng nhập tài khoản FoodSaver để lưu thực đơn vào Lịch ăn cá nhân của bạn và theo dõi dinh dưỡng hàng tháng."}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            asChild
            size="sm"
            className="bg-[#00615f] hover:bg-[#004e4c] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer gap-1.5"
          >
            <Link href={`/login?redirect=${encodeURIComponent(card.data?.returnUrl || "/meal-planner/chat")}`}>
              <span>Đăng nhập ngay</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs font-semibold text-stone-700 hover:text-stone-900 rounded-xl border-amber-300/80 bg-white hover:bg-amber-100/50 cursor-pointer"
          >
            <Link href="/register">Tạo tài khoản mới</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 2. Rich Card: Calendar Conflict Detected
  if (card.type === "calendar_conflict" && card.data) {
    return (
      <div className={`rounded-2xl border border-amber-300 bg-amber-50/70 ${compact ? "p-3 space-y-2.5" : "p-4 space-y-3"} shadow-2xs`}>
        <div className="flex items-center justify-between pb-2 border-b border-amber-200/80">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="size-3.5 text-amber-700" />
            <span>LỊCH ĂN ĐÃ CÓ MÓN ({card.data.formattedDate || card.data.date})</span>
          </span>
          <span className="text-[10px] font-semibold text-amber-800">
            Phát hiện xung đột lịch
          </span>
        </div>

        <p className="text-xs text-stone-700">
          Ngày này trong hệ thống của bạn đã có các món ăn sau:
        </p>

        <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"} gap-2 text-xs`}>
          {card.data.existing?.breakfast && (
            <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
              <p className="text-[10px] font-semibold text-stone-500">🌅 Bữa sáng</p>
              <p className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                {card.data.existing.breakfast.meal}
              </p>
              <p className="text-[11px] text-[#00615f] font-semibold">
                {formatVND(card.data.existing.breakfast.cost)}
              </p>
            </div>
          )}
          {card.data.existing?.lunch && (
            <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
              <p className="text-[10px] font-semibold text-stone-500">☀️ Bữa trưa</p>
              <p className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                {card.data.existing.lunch.meal}
              </p>
              <p className="text-[11px] text-[#00615f] font-semibold">
                {formatVND(card.data.existing.lunch.cost)}
              </p>
            </div>
          )}
          {card.data.existing?.dinner && (
            <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
              <p className="text-[10px] font-semibold text-stone-500">🌙 Bữa tối</p>
              <p className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                {card.data.existing.dinner.meal}
              </p>
              <p className="text-[11px] text-[#00615f] font-semibold">
                {formatVND(card.data.existing.dinner.cost)}
              </p>
            </div>
          )}
          {card.data.existing?.snack && (
            <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
              <p className="text-[10px] font-semibold text-stone-500">🍎 Bữa phụ</p>
              <p className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                {card.data.existing.snack.meal}
              </p>
              <p className="text-[11px] text-[#00615f] font-semibold">
                {formatVND(card.data.existing.snack.cost)}
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-stone-700 font-medium">
          Bạn muốn thay thế như thế nào?
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button
            size="sm"
            variant="default"
            onClick={() => onSendPrompt("Thay thế toàn bộ ngày mai")}
            className="rounded-xl text-xs font-bold gap-1 shadow-2xs cursor-pointer"
          >
            <CheckCircle2 className="size-3.5" />
            <span>Thay thế toàn bộ</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendPrompt("Chỉ thay thế Bữa trưa")}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Chỉ đổi Bữa trưa
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendPrompt("Chỉ thay thế Bữa tối")}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Chỉ đổi Bữa tối
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendPrompt("Chỉ thay thế Bữa sáng")}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Chỉ đổi Bữa sáng
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSendPrompt("Giữ nguyên lịch cũ")}
            className="rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Giữ nguyên lịch cũ
          </Button>
        </div>
      </div>
    );
  }

  // 3. Rich Card: Calendar Applied Success
  if (card.type === "calendar_applied" && card.data) {
    return (
      <div className={`rounded-2xl border border-emerald-300 bg-emerald-50/80 ${compact ? "p-3 space-y-2.5" : "p-4 space-y-3"} shadow-2xs`}>
        <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-[#00615f] border border-emerald-300">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            <span>ĐÃ LƯU VÀO CƠ SỞ DỮ LIỆU THỰC</span>
          </span>
          <span className="text-[10px] font-bold text-[#00615f]">
            Ngày: {card.data.formattedDate || card.data.date}
          </span>
        </div>

        <div className="space-y-1.5">
          {card.data.slots?.map((slot: any, sIdx: number) => {
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
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
                    }}
                  />
                  <div className="truncate">
                    <span className="font-bold text-stone-700 mr-1.5">
                      {slot.slot === "breakfast"
                        ? "🌅 Sáng:"
                        : slot.slot === "lunch"
                        ? "☀️ Trưa:"
                        : slot.slot === "dinner"
                        ? "🌙 Tối:"
                        : "🍎 Phụ:"}
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

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            asChild
            size="sm"
            variant="default"
            className="flex-1 rounded-xl text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
          >
            <Link href={`/meal-planner/calendar?date=${card.data.date || tomorrowKey}`}>
              <CalendarIcon className="size-3.5" />
              <span>Mở xem Lịch ăn tháng</span>
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendPrompt("Tạo danh sách đi chợ cho ngày mai")}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Lập danh sách đi chợ
          </Button>
        </div>
      </div>
    );
  }

  // 4. Rich Card: Feasibility Negotiation
  if (card.type === "feasibility_negotiation" && card.data) {
    return (
      <div className={`rounded-2xl border border-amber-200/90 bg-amber-50/60 ${compact ? "p-3 space-y-2.5" : "p-3.5 space-y-3"}`}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <AlertTriangle className="size-3 text-amber-700" />
            <span>ĐỀ XUẤT ĐIỀU CHỈNH KHẢ THI</span>
          </span>
          <span className="text-[10px] font-bold text-amber-900">
            Điểm JEV: {card.data.score}/1.0
          </span>
        </div>

        <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-2"} gap-2 text-xs`}>
          <div className="p-2.5 rounded-xl bg-white border border-amber-200/60">
            <p className="text-[10px] text-stone-500">Phương án 1 (Rút ngắn ngày)</p>
            <p className="text-xs font-bold text-stone-900 mt-0.5">
              Ăn đủ chất trong {card.data.realisticDays} ngày
            </p>
            <Button
              size="xs"
              variant="default"
              onClick={() =>
                onSendPrompt(
                  `Lên thực đơn ăn đủ chất trong ${card.data.realisticDays} ngày với ${formatVND(
                    card.data.requestedBudget
                  )}`
                )
              }
              className="w-full mt-2 rounded-lg text-[10px] font-bold h-6 cursor-pointer"
            >
              Chọn phương án này
            </Button>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-amber-200/60">
            <p className="text-[10px] text-stone-500">Phương án 2 (Đủ 30 ngày)</p>
            <p className="text-xs font-bold text-[#00615f] mt-0.5">
              Điều chỉnh lên {formatVND(card.data.recommendedMinTotal)}
            </p>
            <Button
              size="xs"
              variant="outline"
              onClick={() =>
                onSendPrompt(
                  `Lập kế hoạch ăn uống 30 ngày với mức tối thiểu ${formatVND(
                    card.data.recommendedMinTotal
                  )}`
                )
              }
              className="w-full mt-2 rounded-lg text-[10px] font-bold h-6 cursor-pointer"
            >
              Chọn phương án này
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Rich Card: Deals List
  if (card.type === "deals_list" && Array.isArray(card.data)) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-3 space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Store className="size-3.5 text-[#00615f]" />
            <span>Suất ăn giải cứu cận date gần bạn</span>
          </span>
          <span className="text-[10px] font-semibold text-stone-400">
            {card.data.length} deal giờ vàng
          </span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
          {card.data.map((deal: any) => (
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
                  <span className="text-[10px] text-stone-500 truncate">· {deal.partnerName}</span>
                </div>
              </div>
              <Button
                asChild
                size="xs"
                variant="default"
                className="rounded-lg text-[10px] font-bold h-6 px-2 shrink-0 cursor-pointer"
              >
                <Link href={`/checkout/${deal.id}`}>Giữ món</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. Rich Card: Schedule Preview
  if (card.type === "schedule_preview" && card.data) {
    return (
      <div className={`rounded-2xl border border-emerald-300 bg-emerald-50/70 ${compact ? "p-3 space-y-2.5" : "p-4 space-y-3"} shadow-2xs`}>
        <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
          <span className="text-xs font-bold text-[#00615f] flex items-center gap-1.5">
            <CalendarIcon className="size-4" />
            <span>Thực đơn {card.data.days} ngày đề xuất</span>
          </span>
          <span className="text-xs font-bold text-stone-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
            ~{formatVND(card.data.dailyBudget)}/ngày
          </span>
        </div>

        <p className="text-xs text-stone-700 font-medium">
          Bạn có muốn lưu thực đơn này vào Lịch ăn tháng không?
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button
            size="sm"
            variant="default"
            onClick={() => onSendPrompt("Áp dụng toàn bộ thực đơn này vào ngày mai")}
            className="rounded-xl text-xs font-bold gap-1 shadow-2xs cursor-pointer"
          >
            <CheckCircle2 className="size-3.5" />
            <span>Có, áp dụng vào ngày mai</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendPrompt("Không, đổi món khác")}
            className="rounded-xl text-xs font-semibold cursor-pointer bg-white hover:bg-stone-50"
          >
            <X className="size-3.5 text-stone-500" />
            <span>Không, đổi món khác</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendPrompt("Xem danh sách nguyên liệu đi chợ")}
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
    );
  }

  return null;
}
