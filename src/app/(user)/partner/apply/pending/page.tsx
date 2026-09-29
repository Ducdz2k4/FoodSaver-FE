"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, Loader2, Store } from "lucide-react";
import { useGetMyPartnerProfileQuery } from "@/redux/api/partnerApi";
import { useAuth } from "@/context/AuthContext";

export default function PartnerPendingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Poll profile every 5 seconds to catch live approval from Admin
  const { data: profile, isLoading: isProfileLoading, refetch } = useGetMyPartnerProfileQuery(undefined, {
    pollingInterval: 5000,
    skip: !isAuthenticated,
  });

  const isVerified = profile?.verificationStatus === "VERIFIED";
  const isRejected = profile?.verificationStatus === "REJECTED";
  const hasNotApplied = !profile || profile.verificationStatus === "NONE";

  useEffect(() => {
    if (isVerified) {
      // Auto refresh user auth state
      refetch();
    }
  }, [isVerified, refetch]);

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#f9f3f0] flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-[#00615f] font-bold text-sm">
          <Loader2 className="size-6 animate-spin" />
          <span>Đang kiểm tra tiến trình thẩm định...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 text-center">
          <div className="bg-white rounded-3xl p-8 max-w-md mx-auto border border-stone-200/90 shadow-sm space-y-4">
            <h1 className="text-xl font-black text-stone-900">Vui Lòng Đăng Nhập</h1>
            <p className="text-xs text-stone-500">
              Bạn cần đăng nhập để theo dõi trạng thái hồ sơ đối tác của mình.
            </p>
            <Link
              href="/login?redirect=/partner/apply/pending"
              className="inline-block px-6 py-2.5 rounded-full bg-[#00615f] text-white font-bold text-xs hover:bg-[#089184] transition"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (hasNotApplied) {
    return (
      <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 text-center">
          <div className="bg-white rounded-3xl p-8 max-w-md mx-auto border border-stone-200/90 shadow-sm space-y-4">
            <div className="size-14 rounded-2xl bg-[#00615f]/10 text-[#00615f] flex items-center justify-center mx-auto">
              <Store className="size-7" />
            </div>
            <h1 className="text-xl font-black text-stone-900">Chưa Nộp Hồ Sơ</h1>
            <p className="text-xs text-stone-500">
              Bạn chưa đăng ký làm đối tác kinh doanh FoodSaver. Hãy nộp hồ sơ GPKD &amp; ATTP ngay nhé!
            </p>
            <Link
              href="/partner/apply"
              className="inline-block px-6 py-2.5 rounded-full bg-[#00615f] text-white font-bold text-xs hover:bg-[#089184] transition"
            >
              Nộp hồ sơ đối tác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f3f0] pt-28 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-sm text-center space-y-5 max-w-2xl mx-auto">
          <div
            className={`size-16 rounded-full flex items-center justify-center mx-auto ${
              isVerified
                ? "bg-emerald-100 text-emerald-700"
                : isRejected
                ? "bg-rose-100 text-rose-700"
                : "bg-amber-100 text-amber-700 animate-pulse"
            }`}
          >
            {isVerified ? (
              <CheckCircle2 className="size-8" />
            ) : isRejected ? (
              <AlertCircle className="size-8" />
            ) : (
              <Clock className="size-8" />
            )}
          </div>

          <div className="space-y-1">
            <span
              className={`text-xs font-bold uppercase tracking-widest block ${
                isVerified
                  ? "text-emerald-700"
                  : isRejected
                  ? "text-rose-700"
                  : "text-amber-700"
              }`}
            >
              Trạng thái:{" "}
              {isVerified
                ? "Đã xác thực thành công"
                : isRejected
                ? "Bị từ chối xét duyệt"
                : "Đang xét duyệt"}
            </span>

            <h1 className="text-2xl font-black text-[#00615f]">
              {isVerified
                ? "Chúc mừng! Bạn đã là đối tác chính thức"
                : isRejected
                ? "Hồ sơ của bạn bị từ chối xét duyệt"
                : "Hồ Sơ Của Bạn Đang Được Thẩm Định!"}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              {isVerified
                ? "Cơ sở kinh doanh của bạn đã vượt qua thẩm định ATTP và có thể đăng bán món ăn ngay bây giờ."
                : isRejected
                ? `Lý do: "${profile?.rejectionReason || "Thiếu giấy tờ hợp lệ"}". Vui lòng chỉnh sửa và nộp lại.`
                : "Ban Quản Trị FoodSaver đang tiến hành kiểm tra tính hợp lệ của Giấy phép kinh doanh và Chứng nhận Vệ sinh ATTP."}
            </p>
          </div>

          {/* Timeline 3 bước */}
          <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl text-left space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <strong className="text-stone-900 block">Bước 1: Tiếp nhận hồ sơ</strong>
                <span className="text-stone-500">
                  {profile.businessName} (MST: {profile.businessLicenseNo})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isVerified ? (
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              ) : isRejected ? (
                <AlertCircle className="size-5 text-rose-600 shrink-0" />
              ) : (
                <Clock className="size-5 text-amber-600 shrink-0 animate-spin" />
              )}
              <div className="text-xs">
                <strong
                  className={`block ${
                    isVerified
                      ? "text-emerald-800"
                      : isRejected
                      ? "text-rose-800"
                      : "text-amber-800"
                  }`}
                >
                  Bước 2: Đối chiếu pháp lý &amp; Chứng nhận ATTP
                </strong>
                <span className="text-stone-500">
                  {isVerified
                    ? "Đã xác nhận tính hợp lệ của cơ sở"
                    : isRejected
                    ? "Hồ sơ chưa đạt yêu cầu kiểm định"
                    : "Đang đối chiếu (Thời gian ước tính: 2 - 24 giờ)"}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-3 ${!isVerified ? "opacity-50" : ""}`}>
              {isVerified ? (
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              ) : (
                <ShieldCheck className="size-5 text-stone-400 shrink-0" />
              )}
              <div className="text-xs">
                <strong className="text-stone-700 block">Bước 3: Mở khóa Partner Center</strong>
                <span className="text-stone-500">
                  {isVerified ? "Đã sẵn sàng đăng bán món giải cứu" : "Chờ mở khóa"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isVerified ? (
              <Link
                href="/partner/dashboard"
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>Vào Partner Center ngay</span>
                <ArrowRight className="size-3.5" />
              </Link>
            ) : isRejected ? (
              <Link
                href="/partner/apply"
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
              >
                Chỉnh sửa và nộp lại hồ sơ
              </Link>
            ) : (
              <Link
                href="/"
                className="px-6 py-2.5 rounded-full bg-[#00615f] hover:bg-[#089184] text-white font-bold text-xs shadow-md transition"
              >
                Về trang chủ khám phá
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
