"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, RefreshCw, Home, LogIn } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";

export function AdminRoleGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <RefreshCw className="size-8 animate-spin text-primary mb-3.5" />
        <p className="text-sm font-medium text-foreground">Đang kiểm tra quyền truy cập hệ thống...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="max-w-md w-full text-center p-8 border-border shadow-lg">
          <CardContent className="space-y-4 pt-4">
            <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <LogIn className="size-7" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Yêu Cầu Đăng Nhập Quản Trị</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bạn cần đăng nhập tài khoản có quyền Quản trị viên để truy cập trang này.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button asChild className="gap-1.5 w-full sm:w-auto">
                <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
                  <LogIn className="size-4" />
                  <span>Đăng nhập ngay</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/">Về trang chủ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = user.role?.toLowerCase() === "admin";
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="max-w-md w-full text-center p-8 border-destructive/30 shadow-2xl">
          <CardContent className="space-y-4 pt-4">
            <div className="size-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <ShieldAlert className="size-9" />
            </div>
            <div>
              <Badge variant="destructive" className="mb-2 uppercase tracking-wider text-[10px]">
                403 Không có quyền
              </Badge>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                Từ Chối Quyền Truy Cập
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tài khoản <strong>{user.email}</strong> hiện không đủ thẩm quyền để vào trang quản trị.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button asChild variant="outline" className="gap-1.5 w-full sm:w-auto">
                <Link href="/">
                  <Home className="size-4" />
                  <span>Về trang chủ</span>
                </Link>
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  logout();
                  router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                }}
                className="gap-1.5 w-full sm:w-auto"
              >
                <LogIn className="size-4" />
                <span>Đổi tài khoản khác</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
