"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { MOCK_LISTINGS } from "@/mocks/mockData";
import { FoodCategory, ListingStatus } from "@/types/contract";
import { notFound } from "next/navigation";
import { useGetListingByIdQuery, useUpdateListingMutation } from "@/redux/api/listingApi";
import { toast } from "sonner";

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  const { data: realListing, isLoading: isFetchingListing } = useGetListingByIdQuery({
    id: resolvedParams.id,
  });

  const existing = realListing || MOCK_LISTINGS.find((item) => item.id === resolvedParams.id);
  const [updateListingMutation, { isLoading: isSubmitting }] = useUpdateListingMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FoodCategory>("BAKERY");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("phần");
  const [status, setStatus] = useState<ListingStatus>("AVAILABLE");
  const [expiryAt, setExpiryAt] = useState("");
  const [pickupStartTime, setPickupStartTime] = useState("18:00");
  const [pickupEndTime, setPickupEndTime] = useState("21:30");
  const [safetyNotes, setSafetyNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description || "");
      setCategory(existing.category);
      setOriginalPrice(existing.originalPrice);
      setDiscountPrice(existing.discountPrice);
      setQuantity(existing.quantity);
      setUnit(existing.unit);
      setStatus(existing.status);
      setExpiryAt(existing.expiryAt.slice(0, 16));
      setPickupStartTime(existing.pickupStartTime);
      setPickupEndTime(existing.pickupEndTime);
      setSafetyNotes(existing.safetyNotes || "");
      setImageUrl(existing.imageUrls[0] || "");
    }
  }, [existing]);

  if (isFetchingListing && !existing) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="size-6 animate-spin text-[#00615f]" />
      </div>
    );
  }

  if (!existing) {
    return notFound();
  }

  const discountPercent =
    originalPrice > 0 ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateListingMutation({
        id: existing.id,
        body: {
          title,
          description,
          category,
          originalPrice,
          discountPrice,
          quantity,
          unit,
          status,
          expiryAt: new Date(expiryAt).toISOString(),
          pickupStartTime,
          pickupEndTime,
          imageUrls: [imageUrl],
          safetyNotes,
        },
      }).unwrap();

      toast.success("Cập nhật thông tin món ăn thành công!");
      router.push("/partner/listings");
    } catch (err: any) {
      toast.error(err?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/partner/listings"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00615f] hover:underline"
      >
        <ArrowLeft className="size-4" /> Quay lại danh sách
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
          Chỉnh sửa món ăn giải cứu
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Điều chỉnh số lượng còn lại, gia hạn thời gian hoặc hạ giá sâu hơn trong giờ vàng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form (7 cols) */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm space-y-4"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Tên món ăn <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Mô tả chi tiết món ăn:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Danh mục:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-bold text-stone-800"
                >
                  <option value="BAKERY">Bánh mì & Bánh ngọt</option>
                  <option value="COOKED_MEAL">Món nấu chín & Cơm</option>
                  <option value="DRINKS">Đồ uống & Trà</option>
                  <option value="FRUITS">Trái cây & Rau củ</option>
                  <option value="GROCERIES">Tạp hóa</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Trạng thái bán:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-bold text-stone-800"
                >
                  <option value="AVAILABLE">Đang mở bán (Available)</option>
                  <option value="EXPIRING_SOON">Sắp hết hạn (Expiring Soon)</option>
                  <option value="SOLD_OUT">Hết hàng (Sold Out)</option>
                  <option value="UNAVAILABLE">Tạm dừng bán (Unavailable)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Giá bán gốc (đ):</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Giá giải cứu (đ):</label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-bold text-[#00615f]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Số lượng tồn:</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Hạn giải cứu (Expiry):</label>
                <input
                  type="datetime-local"
                  value={expiryAt}
                  onChange={(e) => setExpiryAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Giờ bắt đầu:</label>
                  <input
                    type="time"
                    value={pickupStartTime}
                    onChange={(e) => setPickupStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Giờ kết thúc:</label>
                  <input
                    type="time"
                    value={pickupEndTime}
                    onChange={(e) => setPickupEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Link ảnh món ăn:</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Ghi chú bảo quản & ATTP:</label>
              <input
                type="text"
                value={safetyNotes}
                onChange={(e) => setSafetyNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <Link
              href="/partner/listings"
              className="py-3 px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang cập nhật...</span>
                </span>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Lưu thay đổi món ăn</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
            <Sparkles className="size-3.5 text-emerald-600" />
            <span>Thẻ xem trước cập nhật</span>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-md">
            <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md">
                  -{discountPercent}%
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-emerald-800 shadow-sm border border-emerald-200">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  <span>Đã kiểm định ATTP</span>
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <span className="text-xs font-bold text-[#00615f] block">
                  {existing.partnerName || "Quán của bạn"}
                </span>
                <h3 className="font-bold text-stone-900 text-base line-clamp-1">{title}</h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{description}</p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-black text-[#00615f]">
                    {discountPrice.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs text-stone-400 line-through ml-1.5">
                    {originalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-500">
                  Còn {quantity} {unit}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
