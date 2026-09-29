"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Store, Clock, AlertCircle, RefreshCw, LogIn, ArrowRight, ShieldCheck } from "lucide-react";

export function PartnerRoleGuard({ children }: { children: React.ReactNode }) {
  const {
    user,
    isLoading,
    isAuthenticated,
    isPartner,
    isPendingPartner,
    isRejectedPartner,
  } = useAuth();

  const pathname = usePathname();
  const router = useRouter();

  // Allow open access to onboarding apply pages
  const isApplyPage = pathname.startsWith("/partner/apply");

  useEffect(() => {
    if (isApplyPage) return;
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, isApplyPage, pathname, router]);

  if (isApplyPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-800 p-4">
        <RefreshCw className="size-8 animate-spin text-[#00615f] mb-3.5" />
        <p className="text-sm font-bold">Đang kiểm tra quyền đối tác F&B...</p>
      </div>
    );
  }

  // Case 1: Unauthenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl border border-stone-200 shadow-xl space-y-4">
          <div className="size-14 rounded-2xl bg-[#00615f]/10 text-[#00615f] flex items-center justify-center mx-auto">
            <LogIn className="size-7" />
          </div>
          <h2 className="text-xl font-black text-stone-900">Yêu Cầu Đăng Nhập</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Bạn cần đăng nhập tài khoản đối tác F&B để truy cập Partner Center.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="px-5 py-2.5 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#089184] transition"
            >
              Đăng nhập ngay
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Verified Partner -> Full Access granted
  if (isPartner) {
    return <>{children}</>;
  }

  // Case 3: Pending Partner
  if (isPendingPartner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl border border-amber-200 shadow-xl space-y-4">
          <div className="size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
            <Clock className="size-7" />
          </div>
          <h2 className="text-xl font-black text-stone-900">Hồ Sơ Đang Xét Duyệt</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Hồ sơ pháp lý GPKD &amp; Chứng nhận ATTP của bạn đang được Ban Quản Trị thẩm định. Bạn sẽ mở khóa Partner Center ngay sau khi được phê duyệt.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/partner/apply/pending"
              className="px-5 py-2.5 rounded-full bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition"
            >
              Xem tiến trình duyệt
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: Rejected Partner
  if (isRejectedPartner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl border border-rose-200 shadow-xl space-y-4">
          <div className="size-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-7" />
          </div>
          <h2 className="text-xl font-black text-stone-900">Hồ Sơ Bị Từ Chối</h2>
          <p className="text-xs text-rose-700 leading-relaxed">
            Hồ sơ đối tác của bạn chưa đạt chuẩn kiểm định ATTP. Vui lòng kiểm tra lại lý do và bổ sung tài liệu.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/partner/apply"
              className="px-5 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
            >
              Chỉnh sửa và nộp lại
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 5: Normal customer user (not a partner yet)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl border border-stone-200 shadow-xl space-y-4">
        <div className="size-14 rounded-2xl bg-[#00615f]/10 text-[#00615f] flex items-center justify-center mx-auto">
          <Store className="size-7" />
        </div>
        <h2 className="text-xl font-black text-stone-900">Trở Thành Đối Tác F&amp;B</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          Tài khoản của bạn hiện là khách hàng. Hãy đăng ký thông tin cơ sở kinh doanh, tải GPKD và chứng nhận ATTP để mở khóa Partner Center.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            href="/partner/apply"
            className="px-5 py-2.5 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#089184] transition flex items-center justify-center gap-1.5"
          >
            <span>Đăng ký đối tác ngay</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
