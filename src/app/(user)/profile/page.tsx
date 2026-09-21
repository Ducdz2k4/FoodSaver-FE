"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { CrownAvatar } from "@/components/user-component/common";

export default function UserProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Hồ Sơ Cá Nhân</h1>

      <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <CrownAvatar
            size="lg"
            initials={user?.full_name?.charAt(0) || "U"}
            src={user?.avatar_url}
          />
          <div>
            <h2 className="text-lg font-bold text-stone-900">{user?.full_name || "Chưa cập nhật tên"}</h2>
            <p className="text-xs text-stone-500">{user?.email || "Chưa có email"}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 uppercase">
              {user?.role || "User"}
            </span>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-stone-400 block mb-1">Email</span>
            <span className="font-medium text-stone-800">{user?.email || "user@example.com"}</span>
          </div>
          <div>
            <span className="text-stone-400 block mb-1">Trạng thái</span>
            <span className="font-medium text-emerald-600">Đang hoạt động</span>
          </div>
        </div>
      </div>
    </div>
  );
}
