"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/components/user-component/toast";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      await register({ full_name: fullName, email, password });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-stone-200/80 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block text-xl font-bold tracking-tight text-stone-900">
          ✦ FoodSaver
        </Link>
        <h2 className="text-2xl font-bold text-stone-900">Tạo Tài Khoản Mới</h2>
        <p className="text-xs text-stone-500">Bắt đầu hành trình cùng FoodSaver hôm nay</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-700">Họ và tên</label>
          <div className="relative">
            <User className="size-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-700">Email</label>
          <div className="relative">
            <Mail className="size-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@example.com"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-700">Mật khẩu</label>
          <div className="relative">
            <Lock className="size-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#211914] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <span>Đăng ký</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-stone-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-stone-900 hover:underline">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
