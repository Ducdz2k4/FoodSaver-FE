"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Store,
  Bell,
  Lock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function UserProfilePage() {
  const { user, updateUserLocal } = useAuth();

  const [activeTab, setActiveTab] = useState<"PROFILE" | "PARTNER" | "NOTIFICATIONS" | "SECURITY">("PROFILE");

  // Profile form state
  const [fullName, setFullName] = useState(user?.full_name || "Nguyễn Văn Khách");
  const [phone, setPhone] = useState(user?.phone || "0901234567");
  const [address, setAddress] = useState(user?.address || "128 Nguyễn Trãi, Quận 1, TP.HCM");
  const [defaultRadius, setDefaultRadius] = useState<number>(3);

  // Notification settings
  const [notifNearby, setNotifNearby] = useState(true);
  const [notifExpiry, setNotifExpiry] = useState(true);
  const [notifOrders, setNotifOrders] = useState(true);

  // Password state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserLocal({ full_name: fullName, phone, address });
    toast.success("Đã cập nhật thông tin cá nhân thành công!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      toast.error("Mật khẩu mới không trùng khớp!");
      return;
    }
    toast.success("Đổi mật khẩu thành công!");
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };

  const partnerStatus = user?.partnerCapability || "NONE";

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
            Tài khoản của bạn
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Quản lý hồ sơ cá nhân, năng lực đối tác F&B, thông báo và bảo mật.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab("PROFILE")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "PROFILE"
                ? "bg-[#00615f] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            <User className="size-3.5" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("PARTNER")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "PARTNER"
                ? "bg-[#00615f] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Store className="size-3.5" />
            <span>Năng lực đối tác F&B</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("NOTIFICATIONS")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "NOTIFICATIONS"
                ? "bg-[#00615f] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Bell className="size-3.5" />
            <span>Cài đặt thông báo & Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SECURITY")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "SECURITY"
                ? "bg-[#00615f] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Lock className="size-3.5" />
            <span>Bảo mật</span>
          </button>
        </div>

        {/* Tab 1: Profile */}
        {activeTab === "PROFILE" && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-4 pb-4 border-b border-stone-100">
              <div className="size-16 rounded-full bg-[#00615f] text-white flex items-center justify-center font-black text-2xl shadow-sm">
                {fullName ? fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-stone-900">{fullName}</h2>
                <p className="text-xs text-stone-500">{user?.email || "user@foodsaver.vn"}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                  Vai trò: {user?.role || "USER"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Họ và tên:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Email (Cố định):</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || "user@foodsaver.vn"}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-xs sm:text-sm text-stone-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Số điện thoại:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Địa chỉ nhận hàng mặc định:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-md transition"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Partner Capability */}
        {activeTab === "PARTNER" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="space-y-0.5">
                <h2 className="text-base font-extrabold text-stone-900">
                  Tình trạng năng lực đối tác F&B
                </h2>
                <p className="text-xs text-stone-500">
                  Chỉ các cơ sở F&B có GPKD và Chứng nhận An toàn thực phẩm mới được cấp quyền đăng bài.
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  partnerStatus === "VERIFIED"
                    ? "bg-emerald-100 text-emerald-800"
                    : partnerStatus === "PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : partnerStatus === "REJECTED"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {partnerStatus === "VERIFIED" && "✓ Đã xác thực (Verified)"}
                {partnerStatus === "PENDING" && "⏳ Đang xét duyệt (Pending)"}
                {partnerStatus === "REJECTED" && "✕ Bị từ chối (Rejected)"}
                {partnerStatus === "NONE" && "Chưa đăng ký đối tác"}
              </span>
            </div>

            {partnerStatus === "NONE" && (
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h3 className="font-extrabold text-sm text-stone-900">
                  Bạn là chủ tiệm bánh, nhà hàng, quán ăn hoặc cửa hàng tiện lợi?
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Đăng ký tham gia hệ sinh thái FoodSaver để giải cứu thực phẩm cận date, thu hồi chi phí và giảm thiểu phát thải rác hữu cơ bảo vệ môi trường.
                </p>
                <Link
                  href="/partner/apply"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-md transition"
                >
                  <Store className="size-4" />
                  <span>Nộp hồ sơ đối tác ngay</span>
                </Link>
              </div>
            )}

            {partnerStatus === "PENDING" && (
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs sm:text-sm">
                  <Clock className="size-4 text-amber-600" />
                  <span>Hồ sơ của bạn đang được Ban Quản Trị thẩm định</span>
                </div>
                <p className="text-xs text-amber-900">
                  Giấy phép kinh doanh và Chứng nhận ATTP đang được đối chiếu. Bạn sẽ nhận được thông báo ngay khi có kết quả.
                </p>
                <Link
                  href="/partner/apply/pending"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#00615f] hover:underline"
                >
                  <span>Xem tiến trình xét duyệt</span>
                  <ExternalLink className="size-3" />
                </Link>
              </div>
            )}

            {partnerStatus === "REJECTED" && (
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs sm:text-sm">
                  <AlertCircle className="size-4 text-rose-600" />
                  <span>Hồ sơ đối tác bị từ chối xét duyệt</span>
                </div>
                <p className="text-xs text-rose-700">
                  Lý do: Chứng nhận ATTP đã hết hạn hoặc ảnh chụp giấy phép không rõ ràng. Vui lòng cập nhật lại tài liệu để được duyệt.
                </p>
                <Link
                  href="/partner/apply"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
                >
                  <span>Chỉnh sửa và nộp lại hồ sơ</span>
                </Link>
              </div>
            )}

            {partnerStatus === "VERIFIED" && (
              <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                  <ShieldCheck className="size-5 text-emerald-600" />
                  <span>Chúc mừng! Bạn là đối tác F&B đã được xác thực an toàn</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Cửa hàng của bạn đã mở khóa đầy đủ tính năng đăng tải món ăn giải cứu, quản lý đơn hàng và theo dõi chỉ số giảm lãng phí thực phẩm.
                </p>
                <Link
                  href="/partner/dashboard"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                >
                  <Store className="size-4" />
                  <span>Truy cập Partner Center</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Notifications & Radar Settings */}
        {activeTab === "NOTIFICATIONS" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                Bán kính Radar tìm kiếm & Thông báo
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Thiết lập khoảng cách địa lý (Geofence) để nhận thông báo món cứu trợ quanh bạn.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span>Bán kính Radar thông báo:</span>
                <span className="text-sm font-black text-[#00615f]">{defaultRadius} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={defaultRadius}
                onChange={(e) => setDefaultRadius(Number(e.target.value))}
                className="w-full accent-[#00615f] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-bold">
                <span>1 km (Gần nhất)</span>
                <span>5 km</span>
                <span>10 km (Rộng rãi)</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200 cursor-pointer transition">
                <div>
                  <strong className="text-xs text-stone-900 block font-bold">
                    Thông báo món giải cứu mới gần bạn
                  </strong>
                  <span className="text-[11px] text-stone-500">
                    Bắn thông báo khi có cửa hàng đăng món trong bán kính radar.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifNearby}
                  onChange={(e) => setNotifNearby(e.target.checked)}
                  className="size-4 accent-[#00615f]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200 cursor-pointer transition">
                <div>
                  <strong className="text-xs text-stone-900 block font-bold">
                    Cảnh báo món sắp hết hạn (&lt; 2 giờ)
                  </strong>
                  <span className="text-[11px] text-stone-500">
                    Nhắc nhở giờ vàng cuối cùng để giải cứu món ăn với giá giảm sâu.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifExpiry}
                  onChange={(e) => setNotifExpiry(e.target.checked)}
                  className="size-4 accent-[#00615f]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200 cursor-pointer transition">
                <div>
                  <strong className="text-xs text-stone-900 block font-bold">
                    Cập nhật trạng thái đơn hàng thời gian thực
                  </strong>
                  <span className="text-[11px] text-stone-500">
                    Nhận thông báo ngay khi quán xác nhận hoặc chuẩn bị xong món.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifOrders}
                  onChange={(e) => setNotifOrders(e.target.checked)}
                  className="size-4 accent-[#00615f]"
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast.success("Đã lưu cấu hình thông báo radar thành công!")}
                className="px-6 py-2.5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-md transition"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Security */}
        {activeTab === "SECURITY" && (
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4 animate-in fade-in duration-150"
          >
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                Bảo mật & Đổi mật khẩu
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Đảm bảo mật khẩu của bạn có độ dài tối thiểu 8 ký tự.
              </p>
            </div>

            <div className="space-y-3 max-w-md pt-2">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Mật khẩu hiện tại:
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Mật khẩu mới:
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Xác nhận mật khẩu mới:
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-md transition"
              >
                Cập nhật mật khẩu
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
