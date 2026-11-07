"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw, LogIn, ArrowLeft } from "lucide-react";

/**
 * Danh sách tiền tố đường dẫn yêu cầu đăng nhập đối với khu vực User / Customer
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/orders",
  "/notifications",
  "/checkout",
  "/partner/apply",
];

export function isProtectedUserRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function UserRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isProtected = useMemo(() => isProtectedUserRoute(pathname), [pathname]);

  useEffect(() => {
    if (!hasMounted || !isProtected) return;

    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${returnUrl}`);
    }
  }, [hasMounted, isLoading, isAuthenticated, isProtected, pathname, router]);

  // Nếu là route công khai (trang chủ, search, map, listing, meal-planner...), cho phép hiển thị ngay lập tức
  if (!isProtected) {
    return <>{children}</>;
  }

  // Nếu là route yêu cầu login và chưa mount ở client hoặc đang tải auth
  if (!hasMounted || (isLoading && !user)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-stone-700">
        <RefreshCw className="size-8 animate-spin text-[#00615f] mb-3.5" />
        <p className="text-sm font-semibold text-stone-700">Đang kiểm tra trạng thái đăng nhập...</p>
      </div>
    );
  }

  // Nếu không đăng nhập trên route được bảo vệ
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-md w-full text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/90 shadow-xl space-y-4">
          <div className="size-14 rounded-2xl bg-[#00615f]/10 text-[#00615f] flex items-center justify-center mx-auto">
            <LogIn className="size-7" />
          </div>
          <h2 className="text-xl font-black text-stone-900">Yêu Cầu Đăng Nhập</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Bạn cần đăng nhập tài khoản FoodSaver để truy cập tính năng và nội dung cá nhân này.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="px-5 py-2.5 rounded-full bg-[#00615f] text-white text-xs font-bold hover:bg-[#089184] transition inline-flex items-center justify-center gap-1.5"
            >
              <LogIn className="size-4" />
              <span>Đăng nhập ngay</span>
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition inline-flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="size-4" />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
