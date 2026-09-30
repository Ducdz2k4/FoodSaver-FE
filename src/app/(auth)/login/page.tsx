"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, ShieldAlert, Store, Clock, AlertCircle, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  {
    role: "ADMIN",
    label: "Quản trị viên (Admin)",
    email: "admin@foodsaver.vn",
    color: "border-primary/40 bg-primary/5 text-primary hover:bg-primary/15",
  },
  {
    role: "SYS_ADMIN",
    label: "Quản trị hệ thống",
    email: "sysadmin@foodsaver.vn",
    color: "border-purple-500/40 bg-purple-500/5 text-purple-700 hover:bg-purple-500/15",
  },
  {
    role: "PARTNER_VERIFIED",
    label: "Đối tác đã xác thực",
    email: "partner@foodsaver.vn",
    color: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/15",
  },
  {
    role: "PARTNER_PENDING",
    label: "Đối tác chờ duyệt",
    email: "pending@foodsaver.vn",
    color: "border-amber-500/40 bg-amber-500/5 text-amber-700 hover:bg-amber-500/15",
  },
  {
    role: "PARTNER_REJECTED",
    label: "Đối tác bị từ chối",
    email: "rejected@foodsaver.vn",
    color: "border-rose-500/40 bg-rose-500/5 text-rose-700 hover:bg-rose-500/15",
  },
  {
    role: "USER",
    label: "Khách hàng (User)",
    email: "user@foodsaver.vn",
    color: "border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700",
  },
];

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email: email.trim(), password });
      toast.success("Đăng nhập thành công!");

      const isUserAdmin =
        res.user?.role?.toUpperCase() === "ADMIN" ||
        res.user?.role?.toUpperCase() === "SYS_ADMIN";
      const isUserPartner = res.user?.partnerCapability === "VERIFIED";

      const target =
        redirectUrl ||
        (isUserAdmin ? "/admin" : isUserPartner ? "/partner/dashboard" : "/");

      router.push(target);
      router.refresh();
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "Email hoặc mật khẩu không chính xác";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword("Admin@123456");
    toast.info(`Đã điền tài khoản: ${account.label}`);
  };

  return (
    <div className="w-full max-w-lg p-7 sm:p-9 rounded-3xl bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-2xl space-y-5">
      {/* Brand Header */}
      <div className="text-center space-y-1.5">
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">Email đăng nhập</label>
          <div className="relative">
            <Mail className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhap-email@foodsaver.vn"
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
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

      {/* Demo Quick-Fill: 6 trường hợp thực tế */}
      <div className="pt-3 border-t border-stone-200/80 space-y-2.5">
        <p className="text-[11px] font-bold text-stone-600 text-center">
          Tài khoản mẫu thử nghiệm (Click để điền nhanh mật khẩu <span className="font-mono text-[#00615f]">Admin@123456</span>):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fillDemo(acc)}
              className={`p-2 rounded-xl border font-bold transition text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 ${acc.color}`}
              title={acc.email}
            >
              <span className="truncate w-full">{acc.label}</span>
              <span className="font-mono text-[9px] opacity-70 truncate w-full">{acc.email.split("@")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-1 text-center text-xs text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-bold text-[#00615f] hover:underline"
        >
          Đăng ký đối tác hoặc khách hàng
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="size-8 animate-spin text-[#00615f]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
