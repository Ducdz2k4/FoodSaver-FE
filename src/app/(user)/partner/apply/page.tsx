"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  ShieldCheck,
  MapPin,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useApplyPartnerMutation,
  useGetMyPartnerProfileQuery,
} from "@/redux/api/partnerApi";
import { ImageUploadInput } from "@/components/common/ImageUploadInput";
import { BusinessType } from "@/types/contract";
import { toast } from "sonner";

export default function PartnerApplyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: partnerProfile, isLoading: isProfileLoading } = useGetMyPartnerProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [applyPartnerMutation, { isLoading: isSubmitting }] = useApplyPartnerMutation();

  const [businessName, setBusinessName] = useState("");
  const [businessLicenseNo, setBusinessLicenseNo] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("BAKERY");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(10.7769);
  const [lng, setLng] = useState(106.7009);
  const [phone, setPhone] = useState("");
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState("");
  const [foodSafetyCertUrl, setFoodSafetyCertUrl] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);

  // Auto redirect if already verified or pending
  useEffect(() => {
    if (partnerProfile) {
      if (partnerProfile.verificationStatus === "VERIFIED") {
        router.replace("/partner/dashboard");
      } else if (partnerProfile.verificationStatus === "PENDING") {
        router.replace("/partner/apply/pending");
      } else if (partnerProfile.verificationStatus === "REJECTED") {
        // Prefill previous rejection data so partner can fix easily
        setBusinessName(partnerProfile.businessName || "");
        setBusinessLicenseNo(partnerProfile.businessLicenseNo || "");
        setBusinessType(partnerProfile.businessType || "BAKERY");
        setAddress(partnerProfile.address || "");
        setPhone(partnerProfile.phone || user?.phone || "");
        setBusinessLicenseUrl(partnerProfile.businessLicenseUrl || "");
        setFoodSafetyCertUrl(partnerProfile.foodSafetyCertUrl || "");
        if (partnerProfile.lat) setLat(Number(partnerProfile.lat));
        if (partnerProfile.lng) setLng(Number(partnerProfile.lng));
      }
    } else if (user) {
      if (user.address && !address) setAddress(user.address);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [partnerProfile, user, router]);

  const isRejected = partnerProfile?.verificationStatus === "REJECTED";

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Number(pos.coords.latitude.toFixed(6)));
          setLng(Number(pos.coords.longitude.toFixed(6)));
          toast.success("Đã lấy tọa độ GPS cửa hàng thành công!");
        },
        () => toast.error("Không thể truy cập GPS, đang dùng tọa độ mặc định.")
      );
    } else {
      toast.error("Trình duyệt không hỗ trợ Geolocation.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập trước khi nộp hồ sơ đối tác!");
      router.push("/login?redirect=/partner/apply");
      return;
    }

    if (!businessLicenseUrl) {
      toast.error("Vui lòng tải lên ảnh Giấy phép kinh doanh (GPKD)!");
      return;
    }

    if (!foodSafetyCertUrl) {
      toast.error("Vui lòng tải lên ảnh Giấy chứng nhận cơ sở đủ điều kiện ATTP!");
      return;
    }

    if (!hasAgreed) {
      toast.error("Vui lòng tích vào cam kết vệ sinh an toàn thực phẩm.");
      return;
    }

    try {
      await applyPartnerMutation({
        businessName: businessName.trim(),
        businessLicenseNo: businessLicenseNo.trim(),
        businessLicenseUrl,
        foodSafetyCertUrl,
        businessType,
        address: address.trim(),
        lat,
        lng,
        phone: phone.trim(),
      }).unwrap();

      toast.success("Nộp hồ sơ đối tác F&B thành công! Vui lòng chờ Ban Quản Trị thẩm định.");
      router.push("/partner/apply/pending");
    } catch (err: any) {
      toast.error(err?.data?.message || "Nộp hồ sơ thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#f9f3f0] flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-[#00615f] font-bold text-sm">
          <Loader2 className="size-6 animate-spin" />
          <span>Đang kiểm tra hồ sơ đối tác...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="size-3.5" />
            <span>MÔ HÌNH B2C • ĐỐI TÁC F&amp;B ĐÃ KIỂM ĐỊNH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
            Đăng Ký Hồ Sơ Đối Tác Bán Hàng
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Dành cho tiệm bánh, nhà hàng, quán ăn và cửa hàng tiện lợi có đầy đủ giấy phép kinh doanh &amp; chứng nhận ATTP.
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
                Lý do từ Admin: <em>"{partnerProfile?.rejectionReason || "Thiếu hoặc mờ giấy tờ pháp lý"}"</em>. Vui lòng tải lại bản chụp rõ nét hơn.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Thông tin cơ sở kinh doanh */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
            <h2 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <Store className="size-4 text-[#00615f]" />
              <span>1. Thông tin cơ sở kinh doanh F&amp;B</span>
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
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-bold text-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value="BAKERY">Tiệm bánh (Bakery)</option>
                  <option value="COOKED_MEAL">Quán ăn / Cơm văn phòng</option>
                  <option value="CONVENIENCE_STORE">Cửa hàng tiện lợi</option>
                  <option value="RESTAURANT">Nhà hàng</option>
                  <option value="SUPERMARKET">Siêu thị thực phẩm</option>
                  <option value="OTHER">Khác</option>
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
                  placeholder="Nhập số điện thoại quán"
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
                  className="w-full py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 flex items-center justify-center gap-1.5 transition border border-stone-200 cursor-pointer"
                >
                  <MapPin className="size-3.5 text-[#00615f]" />
                  <span>Cập nhật vị trí GPS ({lat}, {lng})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Hồ sơ pháp lý bắt buộc (Upload trực tiếp lên Cloudinary) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
            <h2 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <FileCheck2 className="size-4 text-[#00615f]" />
              <span>2. Hồ sơ pháp lý &amp; Chứng nhận ATTP (Bắt buộc)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ImageUploadInput
                label="Ảnh Scan Giấy phép kinh doanh (GPKD) *:"
                value={businessLicenseUrl}
                onChange={(url) => setBusinessLicenseUrl(url)}
                folder="foodsaver/licenses"
                aspectRatio="portrait"
              />

              <div>
                <ImageUploadInput
                  label="Ảnh Giấy chứng nhận cơ sở đủ điều kiện ATTP *:"
                  value={foodSafetyCertUrl}
                  onChange={(url) => setFoodSafetyCertUrl(url)}
                  folder="foodsaver/certificates"
                  aspectRatio="portrait"
                />
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Ảnh chứng nhận này sẽ được hiển thị minh bạch cho khách hàng khi họ bấm vào huy hiệu ATTP trên món ăn.
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
            className="w-full py-4 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                <span>Đang gửi hồ sơ xét duyệt...</span>
              </span>
            ) : (
              <>
                <CheckCircle2 className="size-5" />
                <span>{isRejected ? "Nộp Lại Hồ Sơ Thẩm Định" : "Nộp Hồ Sơ Thẩm Định Đối Tác"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
