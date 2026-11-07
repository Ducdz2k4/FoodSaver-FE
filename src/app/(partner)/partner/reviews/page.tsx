"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  useGetMyPartnerReviewsQuery,
  useReplyPartnerReviewMutation,
  PartnerReviewItem,
} from "@/redux/api/partnerApi";
import { toast } from "sonner";
import {
  Star,
  MessageSquareReply,
  ShieldCheck,
  PackageCheck,
  Loader2,
  Filter,
  CheckCircle2,
  Calendar,
  UtensilsCrossed,
  User,
} from "lucide-react";

export default function PartnerReviewsPage() {
  const [page, setPage] = useState(1);
  const [selectedStar, setSelectedStar] = useState<number | "ALL">("ALL");
  const [replyFilter, setReplyFilter] = useState<"ALL" | "REPLIED" | "NOT_REPLIED">("ALL");

  // Reply Dialog State
  const [replyTarget, setReplyTarget] = useState<PartnerReviewItem | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data, isLoading, isFetching, refetch } = useGetMyPartnerReviewsQuery({
    page,
    limit: 15,
  });

  const [replyReviewMutation, { isLoading: isReplying }] = useReplyPartnerReviewMutation();

  const reviews = data?.reviews || [];
  const total = data?.total || 0;
  const avgRating = data?.avgRating || 5.0;
  const totalReviews = data?.totalReviews || 0;
  const packagingCleanPercentage = data?.packagingCleanPercentage ?? 100;
  const totalPages = data?.totalPages || 1;

  // Star Breakdown calculation
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const s = Math.round(r.rating);
    if (starCounts[s] !== undefined) starCounts[s]++;
  });

  // Client-side filtering
  const filteredReviews = reviews.filter((r) => {
    if (selectedStar !== "ALL" && Math.round(r.rating) !== selectedStar) return false;
    if (replyFilter === "REPLIED" && !r.replyText) return false;
    if (replyFilter === "NOT_REPLIED" && r.replyText) return false;
    return true;
  });

  const handleOpenReplyDialog = (review: PartnerReviewItem) => {
    setReplyTarget(review);
    setReplyText(review.replyText || "");
  };

  const handleSendReply = async () => {
    if (!replyTarget) return;
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      await replyReviewMutation({
        reviewId: replyTarget.id,
        replyText: replyText.trim(),
      }).unwrap();

      toast.success("Đã gửi phản hồi đánh giá của khách hàng thành công!");
      setReplyTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Không thể gửi phản hồi");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`size-4 ${
              s <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-stone-200 text-stone-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#00615f] tracking-tight">
          Đánh giá & Phản hồi khách hàng
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Lắng nghe ý kiến thực khách sau khi trải nghiệm thực phẩm để duy trì chất lượng và xây dựng uy tín cho quán.
        </p>
      </div>

      {/* Summary Rating Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Rating Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Điểm đánh giá trung bình
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-[#00615f]">{avgRating.toFixed(1)}</span>
              <span className="text-sm font-bold text-stone-400">/ 5.0</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {renderStars(avgRating)}
              <span className="text-xs text-stone-500 font-medium">({totalReviews} lượt đánh giá)</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-4 pt-4 border-t border-stone-100">
            Dựa trên toàn bộ đơn hàng cứu trợ thực phẩm đã hoàn tất tại quán.
          </p>
        </div>

        {/* Packaging Cleanliness Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Chỉ số bao bì & vệ sinh
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-emerald-600">{packagingCleanPercentage}%</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit">
              <ShieldCheck className="size-4 shrink-0" />
              <span>Bao bì sạch sẽ, niêm phong tốt</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-4 pt-4 border-t border-stone-100">
            Được đánh giá tích cực bởi thực khách khi đến nhận đồ hoặc qua giao hàng.
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-3">
            Phân bố số sao
          </span>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star] || 0;
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 w-12 text-stone-600 font-bold">
                    <span>{star}</span>
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-stone-400 text-[11px] font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mr-2">
            <Filter className="size-4" />
            <span>Bộ lọc:</span>
          </div>

          {/* Star Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedStar("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedStar === "ALL"
                  ? "bg-[#00615f] text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Tất cả sao
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStar(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  selectedStar === s
                    ? "bg-[#00615f] text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <span>{s}</span>
                <Star className={`size-3 ${selectedStar === s ? "fill-amber-300 text-amber-300" : "fill-amber-400 text-amber-400"}`} />
              </button>
            ))}
          </div>

          {/* Reply Status Filter */}
          <div className="flex items-center gap-1.5 ml-0 sm:ml-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
            <button
              onClick={() => setReplyFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                replyFilter === "ALL"
                  ? "bg-stone-800 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Tất cả phản hồi
            </button>
            <button
              onClick={() => setReplyFilter("NOT_REPLIED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                replyFilter === "NOT_REPLIED"
                  ? "bg-amber-600 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Chưa phản hồi
            </button>
            <button
              onClick={() => setReplyFilter("REPLIED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                replyFilter === "REPLIED"
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Đã phản hồi
            </button>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs font-bold text-[#00615f] hover:text-[#004e4c] flex items-center gap-1.5 self-end sm:self-center"
        >
          {isFetching ? <Loader2 className="size-3.5 animate-spin" /> : null}
          <span>Làm mới</span>
        </button>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-stone-100">
            <Loader2 className="size-8 animate-spin text-[#00615f]" />
            <p className="text-sm font-medium text-stone-500">Đang tải đánh giá từ khách hàng...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-stone-100 p-8">
            <div className="size-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
              <Star className="size-6" />
            </div>
            <h3 className="text-base font-bold text-stone-700">Chưa có đánh giá nào phù hợp</h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Khi khách hàng hoàn tất đơn hàng và gửi đánh giá, phản hồi sẽ hiển thị chi tiết tại đây.
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-sm space-y-4 transition hover:border-[#00615f]/20"
            >
              {/* Top Row: Customer Info & Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                    {review.customer?.avatar ? (
                      <Image
                        src={review.customer.avatar}
                        alt={review.customer.fullName}
                        width={40}
                        height={40}
                        className="object-cover size-full"
                      />
                    ) : (
                      <User className="size-5 text-stone-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-800">
                      {review.customer?.fullName || "Khách hàng"}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      {renderStars(review.rating)}
                      <span className="text-[11px] text-stone-400 flex items-center gap-1 font-medium">
                        <Calendar className="size-3" />
                        {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Packaging badge */}
                {review.packagingClean !== false && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 self-start sm:self-center">
                    <PackageCheck className="size-3.5" />
                    <span>Bao bì đóng gói sạch sẽ</span>
                  </div>
                )}
              </div>

              {/* Order Info */}
              {review.order && (
                <div className="flex items-center gap-2 text-xs bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-100 text-stone-600">
                  <UtensilsCrossed className="size-3.5 text-stone-400 shrink-0" />
                  <span className="font-semibold text-stone-800 truncate">
                    {review.order.listing?.title || "Món ăn"}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="font-mono text-stone-500">#{review.order.orderNumber}</span>
                </div>
              )}

              {/* Customer Comment */}
              {review.comment ? (
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100/50">
                  "{review.comment}"
                </p>
              ) : (
                <p className="text-xs text-stone-400 italic">Khách hàng không để lại nhận xét chi tiết.</p>
              )}

              {/* Store Reply Box */}
              {review.replyText ? (
                <div className="bg-[#00615f]/5 border border-[#00615f]/15 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#00615f] flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5" />
                      Phản hồi từ cửa hàng
                    </span>
                    {review.repliedAt && (
                      <span className="text-[10px] text-stone-400">
                        {new Date(review.repliedAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    {review.replyText}
                  </p>
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handleOpenReplyDialog(review)}
                      className="text-[11px] font-bold text-[#00615f] hover:underline"
                    >
                      Chỉnh sửa câu trả lời
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleOpenReplyDialog(review)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#00615f] hover:bg-[#004e4c] text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    <MessageSquareReply className="size-3.5" />
                    <span>Phản hồi khách hàng</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-stone-500 pt-4">
          <span>
            Trang {page} / {totalPages} (Tổng số {total} đánh giá)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl font-bold disabled:opacity-40"
            >
              Trang trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl font-bold disabled:opacity-40"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {/* Reply Modal Dialog */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-stone-100 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center gap-2 text-[#00615f]">
              <MessageSquareReply className="size-5" />
              <h3 className="font-black text-base">
                Phản hồi đánh giá của {replyTarget.customer?.fullName || "khách hàng"}
              </h3>
            </div>

            {/* Customer Review Recap */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 text-xs text-stone-600 space-y-1">
              <div className="flex items-center gap-1.5">
                {renderStars(replyTarget.rating)}
                <span className="font-bold text-stone-800">
                  {replyTarget.order?.listing?.title || "Món ăn"}
                </span>
              </div>
              {replyTarget.comment && (
                <p className="italic text-stone-700">"{replyTarget.comment}"</p>
              )}
            </div>

            {/* Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Nội dung phản hồi từ quán <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={1000}
                placeholder="Ví dụ: Cảm ơn bạn đã ủng hộ quán! Quán rất vui vì bạn hài lòng với món ăn và hẹn gặp lại bạn trong những đơn hàng tiếp theo..."
                className="w-full p-3 rounded-2xl border border-stone-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] leading-relaxed"
              />
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>Khách hàng sẽ nhìn thấy câu trả lời này công khai trên gian hàng.</span>
                <span>{replyText.length} / 1000</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSendReply}
                disabled={isReplying}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00615f] hover:bg-[#004e4c] shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isReplying ? <Loader2 className="size-3.5 animate-spin" /> : null}
                <span>Gửi phản hồi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
