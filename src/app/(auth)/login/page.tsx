"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ email và mật khẩu.");
      toast.error("Vui lòng điền đầy đủ email và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email: email.trim(), password });
      toast.success("Đăng nhập thành công!");

      // Smart redirect: if redirect param exists -> go there, else if admin -> /admin, else -> /
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (res.user?.role?.toUpperCase() === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Email hoặc mật khẩu không chính xác";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo credentials
  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Admin@123456");
    setErrorMessage("");
  };

  return (
    <div className="w-full max-w-md p-8 sm:p-9 rounded-3xl bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-2xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 group mb-1">
          <div className="size-8 rounded-full bg-[#00615f] text-white flex items-center justify-center font-black text-xs shadow-sm">
            <span className="text-[#79e4a7]">FS</span>
          </div>
          <span className="font-black text-lg tracking-tight text-[#00615f] uppercase">
            FOODSAVER
          </span>
        </Link>
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          Chào Mừng Trở Lại
        </h2>
        <p className="text-xs text-muted-foreground">
          Đăng nhập tài khoản để quản lý hoặc giải cứu thực phẩm
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center font-medium">
          {errorMessage}
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">Email đăng nhập</label>
          <div className="relative">
            <Mail className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@foodsaver.vn"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">Mật khẩu</label>
          <div className="relative">
            <Lock className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#00615f] hover:bg-[#089184] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <span>Đăng nhập ngay</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick-Fill Chips */}
      <div className="pt-2 border-t border-stone-200/70 space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground text-center">
          Tài khoản mẫu thử nghiệm (Click để điền nhanh):
        </p>
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <button
            type="button"
            onClick={() => fillDemo("admin@foodsaver.vn")}
            className="p-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary hover:bg-primary/15 font-bold transition text-center"
          >
            Quản trị (Admin)
          </button>
          <button
            type="button"
            onClick={() => fillDemo("partner@foodsaver.vn")}
            className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 font-bold transition text-center"
          >
            Đối tác (Store)
          </button>
          <button
            type="button"
            onClick={() => fillDemo("user@foodsaver.vn")}
            className="p-1.5 rounded-lg border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition text-center"
          >
            Khách hàng (User)
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-bold text-[#00615f] hover:underline">
          Đăng ký đối tác hoặc khách hàng
        </Link>
      </div>
    </div>
  );
}
