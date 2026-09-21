"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Lock, Mail, Phone, MapPin, ArrowRight, Loader2, Store, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<"USER" | "PARTNER">("USER");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ Họ và tên, Email và Mật khẩu.");
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      toast.error("Mật khẩu quá ngắn (tối thiểu 6 ký tự)");
      return;
    }

    try {
      setLoading(true);
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        role,
      });

      toast.success("Đăng ký tài khoản thành công!");
      router.push("/");
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "Đăng ký thất bại. Email có thể đã tồn tại.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-8 sm:p-9 rounded-3xl bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-2xl space-y-6">
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
          Tạo Tài Khoản Mới
        </h2>
        <p className="text-xs text-muted-foreground">
          Gia nhập cộng đồng giải cứu thực phẩm thông minh
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-2.5 p-1 bg-stone-100 rounded-2xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setRole("USER")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
            role === "USER"
              ? "bg-white text-[#00615f] shadow-sm font-black"
              : "text-stone-600 hover:text-foreground"
          }`}
        >
          <ShoppingBag className="size-4" />
          <span>Khách hàng cá nhân</span>
        </button>

        <button
          type="button"
          onClick={() => setRole("PARTNER")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
            role === "PARTNER"
              ? "bg-white text-[#00615f] shadow-sm font-black"
              : "text-stone-600 hover:text-foreground"
          }`}
        >
          <Store className="size-4" />
          <span>Cửa hàng / Đối tác</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center font-medium">
          {errorMessage}
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">
            {role === "PARTNER" ? "Tên cửa hàng / Tiệm bánh *" : "Họ và tên *"}
          </label>
          <div className="relative">
            <User className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={role === "PARTNER" ? "Ví dụ: Tiệm Bánh Hoàn Kiếm" : "Nguyễn Văn A"}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">Email đăng nhập *</label>
          <div className="relative">
            <Mail className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@foodsaver.vn"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">Mật khẩu (tối thiểu 6 ký tự) *</label>
          <div className="relative">
            <Lock className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">Số điện thoại</label>
            <div className="relative">
              <Phone className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">Địa chỉ / Khu vực</label>
            <div className="relative">
              <MapPin className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Quận/Huyện, Tỉnh/TP"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#00615f]/20 focus:border-[#00615f] text-xs transition bg-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#00615f] hover:bg-[#089184] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <span>Đăng ký tài khoản ngay</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-bold text-[#00615f] hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
