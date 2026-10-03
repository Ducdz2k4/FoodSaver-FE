"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type AuthStep = "login" | "otp" | "password";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPasswordValue] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<AuthStep>("login");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin, verifyOtp, resendOtp, setPassword, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const goAfterLogin = async () => {
    const currentUser = await refreshUser();
    const isAdmin = currentUser?.role?.toUpperCase() === "ADMIN" || currentUser?.role?.toUpperCase() === "SYS_ADMIN";
    const isPartner = currentUser?.partnerCapability === "VERIFIED";
    router.push(redirectUrl || (isAdmin ? "/admin" : isPartner ? "/partner/dashboard" : "/"));
    router.refresh();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      const result = await login({ email: email.trim(), password });
      if (result.requireOtp) {
        setStep("otp");
        toast.info("Email chưa được xác thực. Mã OTP mới đã được gửi.");
        return;
      }
      toast.success("Đăng nhập thành công!");
      await goAfterLogin();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Email hoặc mật khẩu không chính xác");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    try {
      setLoading(true);
      const result = await googleLogin(credential);
      if (result.requirePassword) {
        setStep("password");
        toast.info("Đây là lần đầu bạn đăng nhập bằng Google. Hãy tạo mật khẩu cho tài khoản.");
        return;
      }
      toast.success("Đăng nhập Google thành công!");
      await goAfterLogin();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Đăng nhập Google thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Mã OTP phải gồm đúng 6 chữ số.");
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(otp);
      toast.success("Xác thực email thành công!");
      await goAfterLogin();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Mã OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setLoading(true);
      await setPassword(newPassword);
      toast.success("Đã tạo mật khẩu. Tài khoản của bạn đã sẵn sàng.");
      await goAfterLogin();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Không thể tạo mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp();
      toast.success("Đã gửi lại mã OTP.");
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Không thể gửi lại OTP");
    }
  };

  return (
    <div className="w-full max-w-lg p-7 sm:p-9 rounded-3xl bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-2xl space-y-5">
      <div className="text-center space-y-1.5">
        <Link href="/" className="inline-flex items-center gap-2 mb-1">
          <div className="size-8 rounded-full bg-[#00615f] text-white flex items-center justify-center font-black text-xs shadow-sm">
            <span className="text-[#79e4a7]">FS</span>
          </div>
          <span className="font-black text-lg tracking-tight text-[#00615f] uppercase">FOODSAVER</span>
        </Link>
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          {step === "login" ? "Chào Mừng Trở Lại" : step === "otp" ? "Xác Thực Email" : "Tạo Mật Khẩu"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {step === "login" && "Đăng nhập tài khoản để quản lý hoặc giải cứu thực phẩm"}
          {step === "otp" && "Nhập mã OTP đã được gửi đến email của bạn"}
          {step === "password" && "Mật khẩu này dùng cho các lần đăng nhập sau"}
        </p>
      </div>

      {step === "login" && (
        <>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">Email đăng nhập</label>
              <div className="relative">
                <Mail className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nhap-email@foodsaver.vn" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">Mật khẩu</label>
              <div className="relative">
                <Lock className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPasswordValue(event.target.value)} placeholder="••••••••" required className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#00615f] hover:bg-[#089184] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <><span>Đăng nhập ngay</span><ArrowRight className="size-4" /></>}
            </button>
          </form>

          <div className="relative flex items-center gap-3 text-[11px] text-stone-400">
            <div className="h-px flex-1 bg-stone-200" /><span>HOẶC</span><div className="h-px flex-1 bg-stone-200" />
          </div>

          {googleClientId ? (
            <div className="flex justify-center">
              <GoogleLogin onSuccess={(response) => response.credential && handleGoogleSuccess(response.credential)} onError={() => toast.error("Đăng nhập Google thất bại")} useOneTap={false} theme="outline" size="large" width="380" />
            </div>
          ) : (
            <button type="button" onClick={() => toast.error("Google OAuth chưa được cấu hình. Hãy thêm NEXT_PUBLIC_GOOGLE_CLIENT_ID.")} className="w-full py-3 rounded-xl border border-stone-300 bg-white text-stone-700 font-bold text-sm flex items-center justify-center gap-2">
              Tiếp tục với Google
            </button>
          )}
        </>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center text-xs text-emerald-800">Mã OTP có hiệu lực trong 5 phút.</div>
          <input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" className="w-full text-center tracking-[0.5em] text-2xl font-black py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20" />
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#00615f] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <Loader2 className="size-4 animate-spin" /> : <><ShieldCheck className="size-4" />Xác thực OTP</>}</button>
          <button type="button" onClick={handleResendOtp} className="w-full text-xs font-bold text-[#00615f] hover:underline">Gửi lại mã OTP</button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4 text-center text-xs text-sky-800">Bạn đã đăng nhập Google thành công. Tạo mật khẩu để lần sau có thể đăng nhập bằng email.</div>
          <div className="relative">
            <KeyRound className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={6} required placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#00615f] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <Loader2 className="size-4 animate-spin" /> : "Lưu mật khẩu và tiếp tục"}</button>
        </form>
      )}

      <div className="pt-1 text-center text-xs text-muted-foreground">Chưa có tài khoản? <Link href="/register" className="font-bold text-[#00615f] hover:underline">Đăng ký ngay</Link></div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="size-8 animate-spin text-[#00615f]" /></div>}><LoginForm /></Suspense>;
}
