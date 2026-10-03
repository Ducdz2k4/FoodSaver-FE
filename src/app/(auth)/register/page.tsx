"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

type RegisterStep = "form" | "otp";

export default function RegisterPage() {
  const [step, setStep] = useState<RegisterStep>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPasswordValue] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, verifyOtp, resendOtp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setLoading(true);
      const result = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });

      if (result.requireOtp) {
        setStep("otp");
        toast.success("Tài khoản đã tạo. Mã OTP đã được gửi đến email của bạn.");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Đăng ký thất bại");
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
      toast.success("Đăng ký và xác thực email thành công!");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Mã OTP không hợp lệ");
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
    <div className="w-full max-w-lg p-8 sm:p-9 rounded-3xl bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 mb-1">
          <div className="size-8 rounded-full bg-[#00615f] text-white flex items-center justify-center font-black text-xs shadow-sm"><span className="text-[#79e4a7]">FS</span></div>
          <span className="font-black text-lg tracking-tight text-[#00615f] uppercase">FOODSAVER</span>
        </Link>
        <h2 className="text-2xl font-black text-foreground tracking-tight">{step === "form" ? "Tạo Tài Khoản Mới" : "Xác Thực Email"}</h2>
        <p className="text-xs text-muted-foreground">{step === "form" ? "Gia nhập cộng đồng giải cứu thực phẩm thông minh" : `Nhập mã OTP đã gửi tới ${email}`}</p>
      </div>

      {step === "form" && (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">Họ và tên *</label>
            <div className="relative"><User className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nguyễn Văn A" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white" /></div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">Email đăng nhập *</label>
            <div className="relative"><Mail className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ten@foodsaver.vn" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white" /></div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">Mật khẩu (tối thiểu 6 ký tự) *</label>
            <div className="relative"><Lock className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="password" value={password} onChange={(event) => setPasswordValue(event.target.value)} placeholder="••••••••" required minLength={6} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white" /></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><label className="font-bold text-foreground block">Số điện thoại</label><div className="relative"><Phone className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="text" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0912345678" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white" /></div></div>
            <div className="space-y-1.5"><label className="font-bold text-foreground block">Địa chỉ / Khu vực</label><div className="relative"><MapPin className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="text" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Quận/Huyện, Tỉnh/TP" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white" /></div></div>
          </div>

          <div className="pt-2"><button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#00615f] hover:bg-[#089184] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <Loader2 className="size-4 animate-spin" /> : <><span>Đăng ký và nhận OTP</span><ArrowRight className="size-4" /></>}</button></div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center text-xs text-emerald-800">Mã OTP có hiệu lực trong 5 phút. Hãy kiểm tra cả thư mục Spam.</div>
          <input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" className="w-full text-center tracking-[0.5em] text-2xl font-black py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20" />
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#00615f] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <Loader2 className="size-4 animate-spin" /> : <><ShieldCheck className="size-4" />Xác thực email</>}</button>
          <button type="button" onClick={handleResendOtp} className="w-full text-xs font-bold text-[#00615f] hover:underline">Gửi lại mã OTP</button>
        </form>
      )}

      <div className="text-center text-xs text-muted-foreground">Đã có tài khoản? <Link href="/login" className="font-bold text-[#00615f] hover:underline">Đăng nhập ngay</Link></div>
    </div>
  );
}
