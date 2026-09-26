"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  UploadCloud,
  ShieldCheck,
  MapPin,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCredentials } from "@/redux/slices/authSlice";

export default function PartnerApplyPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [businessName, setBusinessName] = useState("Tiệm Bánh Mì Artisan Bakery");
  const [businessLicenseNo, setBusinessLicenseNo] = useState("0314892019");
  const [businessType, setBusinessType] = useState("BAKERY");
  const [address, setAddress] = useState("128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM");
  const [lat, setLat] = useState("10.7712");
  const [lng, setLng] = useState("106.6908");
  const [phone, setPhone] = useState(currentUser?.phone || "0934567890");
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState(
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800"
  );
  const [foodSafetyCertUrl, setFoodSafetyCertUrl] = useState(
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800"
  );
  const [hasAgreed, setHasAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRejected = currentUser?.partnerCapability === "REJECTED";

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
          alert("Đã lấy tọa độ GPS thành công!");
        },
        () => alert("Không thể truy cập GPS, sử dụng tọa độ mặc định.")
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreed) {
      alert("Vui lòng tích vào cam kết vệ sinh an toàn thực phẩm.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Cập nhật mock state sang PENDING
      if (currentUser) {
        dispatch(
          setCredentials({
            user: {
              ...currentUser,
              partnerCapability: "PENDING",
            },
            token: "mock-token-pending",
          })
        );
      }
      router.push("/partner/apply/pending");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="size-3.5" />
            <span>MÔ HÌNH B2C • ĐỐI TÁC F&B ĐÃ KIỂM ĐỊNH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
            Đăng Ký Hồ Sơ Đối Tác Bán Hàng
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Dành cho tiệm bánh, nhà hàng, quán ăn và cửa hàng tiện lợi có đầy đủ giấy phép kinh doanh & chứng nhận ATTP.
          </p>
        </div>

        {/* Banner nếu bị từ chối trước đó */}
        {isRejected && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex items-start gap-3">
            <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <strong className="text-rose-900 font-bold block">
                Hồ sơ của bạn bị từ chối xét duyệt trước đó:
              </strong>
              <p className="text-rose-700">
                Lý do: Giấy chứng nhận ATTP chụp bị mờ hoặc đã quá hạn hiệu lực. Vui lòng tải lại bản chụp rõ nét hơn.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Thông tin cơ sở kinh doanh */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
            <h2 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <Store className="size-4 text-[#00615f]" />
              <span>1. Thông tin cơ sở kinh doanh F&B</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Tên thương hiệu / quán ăn <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ví dụ: Tiệm Bánh Mì Artisan Bakery"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Mã số thuế / Giấy phép ĐKKD <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={businessLicenseNo}
                  onChange={(e) => setBusinessLicenseNo(e.target.value)}
                  placeholder="Ví dụ: 0314892019"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Loại hình kinh doanh <span className="text-rose-500">*</span>:
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-bold text-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value="BAKERY">Tiệm bánh (Bakery)</option>
                  <option value="COOKED_MEAL">Quán ăn / Cơm văn phòng</option>
                  <option value="CONVENIENCE_STORE">Cửa hàng tiện lợi</option>
                  <option value="RESTAURANT">Nhà hàng</option>
                  <option value="SUPERMARKET">Siêu thị thực phẩm</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Địa chỉ cửa hàng đón khách lấy món <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường, quận..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Số điện thoại hotline <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Tọa độ vị trí (GPS Geohash):
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 flex items-center justify-center gap-1.5 transition border border-stone-200"
                >
                  <MapPin className="size-3.5 text-[#00615f]" />
                  <span>Cập nhật vị trí hiện tại</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Hồ sơ pháp lý bắt buộc (B2C chuẩn) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
            <h2 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <FileCheck2 className="size-4 text-[#00615f]" />
              <span>2. Hồ sơ pháp lý & Chứng nhận ATTP (Bắt buộc)</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Ảnh Scan Giấy phép kinh doanh (GPKD) <span className="text-rose-500">*</span>:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    required
                    value={businessLicenseUrl}
                    onChange={(e) => setBusinessLicenseUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-mono focus:outline-none"
                  />
                  <div className="size-10 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img src={businessLicenseUrl} alt="GPKD" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Ảnh Giấy chứng nhận cơ sở đủ điều kiện ATTP <span className="text-rose-500">*</span>:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    required
                    value={foodSafetyCertUrl}
                    onChange={(e) => setFoodSafetyCertUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-mono focus:outline-none"
                  />
                  <div className="size-10 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img src={foodSafetyCertUrl} alt="ATTP" className="w-full h-full object-cover" />
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Ảnh giấy chứng nhận này sẽ được hiển thị minh bạch cho khách hàng khi họ bấm vào huy hiệu ATTP trên món ăn.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Cam kết */}
          <div className="bg-emerald-50/80 p-5 rounded-3xl border border-emerald-100 flex items-start gap-3">
            <input
              type="checkbox"
              id="agree"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-1 size-4 rounded accent-[#00615f] cursor-pointer"
            />
            <label htmlFor="agree" className="text-xs text-stone-700 leading-relaxed cursor-pointer">
              <strong className="text-[#00615f] font-bold">Cam kết đối tác:</strong> Tôi xin cam kết toàn bộ thực phẩm đăng tải giải cứu trên nền tảng FoodSaver đều đảm bảo an toàn vệ sinh thực phẩm, chưa hết hạn sử dụng, và được bảo quản theo đúng tiêu chuẩn pháp lý đã quy định.
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-98 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Đang gửi hồ sơ...</span>
            ) : (
              <>
                <CheckCircle2 className="size-5" />
                <span>Nộp Hồ Sơ Thẩm Định Đối Tác</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
