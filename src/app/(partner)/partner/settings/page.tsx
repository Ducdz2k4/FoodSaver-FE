"use client";

import React, { useState } from "react";
import {
  Store,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  FileText,
  Save,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_PARTNER_PROFILES } from "@/mocks/mockData";

export default function PartnerSettingsPage() {
  const profile = MOCK_PARTNER_PROFILES[0];

  const [businessName, setBusinessName] = useState(profile.businessName);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [defaultPickupStart, setDefaultPickupStart] = useState("18:00");
  const [defaultPickupEnd, setDefaultPickupEnd] = useState("21:30");
  const [pickupInstructions, setPickupInstructions] = useState(
    "Quý khách vui lòng gửi xe trước cửa tiệm (miễn phí), vào quầy thu ngân đưa mã QR đơn hàng cho nhân viên để nhận đồ."
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã lưu thông tin cài đặt cửa hàng thành công!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
          Cài đặt & Thông tin cửa hàng
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Quản lý thông tin hiển thị, khung giờ đón khách và hồ sơ an toàn thực phẩm đã được xác thực.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Pháp lý & ATTP (Read-only verified status) */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-600" />
              <h2 className="text-sm font-extrabold text-stone-900">
                Hồ sơ pháp lý & Chứng nhận ATTP đã kiểm định
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              ✓ Đã xác thực
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-stone-400 block mb-1 font-bold">Mã số ĐKKD / MST:</span>
              <span className="font-mono font-bold text-stone-800">{profile.businessLicenseNo}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-stone-400 block mb-1 font-bold">Mã vùng Geohash GPS:</span>
              <span className="font-mono font-bold text-[#00615f]">{profile.geohash}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-600 block">Ảnh Giấy phép kinh doanh:</span>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                <img src={profile.businessLicenseUrl} alt="GPKD" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-600 block">Ảnh Chứng nhận Vệ sinh ATTP:</span>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                <img src={profile.foodSafetyCertUrl} alt="ATTP" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Thông tin liên hệ & Đón khách */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
            <Store className="size-4 text-[#00615f]" />
            <span>Thông tin liên hệ & Điểm nhận hàng</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Tên thương hiệu hiển thị:
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Số điện thoại liên hệ:
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Địa chỉ đón khách:
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Khung giờ nhận hàng mặc định & Hướng dẫn */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
            <Clock className="size-4 text-[#00615f]" />
            <span>Khung giờ đón khách nhận đồ cố định</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Giờ bắt đầu:</label>
              <input
                type="time"
                value={defaultPickupStart}
                onChange={(e) => setDefaultPickupStart(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Giờ kết thúc:</label>
              <input
                type="time"
                value={defaultPickupEnd}
                onChange={(e) => setDefaultPickupEnd(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Hướng dẫn gửi xe & nhận hàng cho khách:
            </label>
            <textarea
              rows={3}
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00615f]/20"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-md transition flex items-center gap-2 active:scale-95"
          >
            <Save className="size-4" />
            <span>Lưu thay đổi cài đặt</span>
          </button>
        </div>
      </form>
    </div>
  );
}
