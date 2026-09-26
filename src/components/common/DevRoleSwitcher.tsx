"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCredentials, logOut } from "@/redux/slices/authSlice";
import { MOCK_USERS } from "@/mocks/mockData";

export const DevRoleSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);

  const switchUser = (userKey: keyof typeof MOCK_USERS | "guest") => {
    if (userKey === "guest") {
      dispatch(logOut());
    } else {
      const u = MOCK_USERS[userKey];
      dispatch(
        setCredentials({
          user: u,
          token: "mock-access-token-" + u.id,
        })
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900/95 hover:bg-slate-900 border border-slate-700 rounded-full shadow-2xl backdrop-blur transition-all active:scale-95"
          title="Nhấn để đổi vai trò test"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Dev:{" "}
            <strong className="text-emerald-300">
              {currentUser?.fullName || "Khách vãng lai"}
            </strong>
          </span>
        </button>
      ) : (
        <div className="p-3.5 bg-slate-900/95 text-white border border-slate-700 rounded-2xl shadow-2xl w-80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>⚡</span> Chuyển Đổi Vai Trò Test (Mock)
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <button
              type="button"
              onClick={() => switchUser("guest")}
              className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                !currentUser
                  ? "bg-slate-800 text-white font-bold border border-slate-700"
                  : "hover:bg-slate-800/60 text-slate-300"
              }`}
            >
              <span>👤 Khách vãng lai (Chưa login)</span>
              {!currentUser && <span className="text-emerald-400 font-bold">✓</span>}
            </button>

            <button
              type="button"
              onClick={() => switchUser("customer")}
              className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                currentUser?.id === "usr-1"
                  ? "bg-slate-800 text-white font-bold border border-slate-700"
                  : "hover:bg-slate-800/60 text-slate-300"
              }`}
            >
              <span>🛒 Khách Hàng Thường (Customer)</span>
              {currentUser?.id === "usr-1" && (
                <span className="text-emerald-400 font-bold">✓</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchUser("pendingPartner")}
              className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                currentUser?.partnerCapability === "PENDING"
                  ? "bg-slate-800 text-amber-300 font-bold border border-slate-700"
                  : "hover:bg-slate-800/60 text-amber-200/80"
              }`}
            >
              <span>⏳ Đối Tác Chờ Thẩm Định (Pending)</span>
              {currentUser?.partnerCapability === "PENDING" && (
                <span className="text-amber-400 font-bold">✓</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchUser("rejectedPartner")}
              className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                currentUser?.partnerCapability === "REJECTED"
                  ? "bg-slate-800 text-rose-300 font-bold border border-slate-700"
                  : "hover:bg-slate-800/60 text-rose-200/80"
              }`}
            >
              <span>❌ Đối Tác Bị Từ Chối (Rejected)</span>
              {currentUser?.partnerCapability === "REJECTED" && (
                <span className="text-rose-400 font-bold">✓</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchUser("verifiedPartner")}
              className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                currentUser?.partnerCapability === "VERIFIED"
                  ? "bg-slate-800 text-emerald-300 font-bold border border-slate-700"
                  : "hover:bg-slate-800/60 text-emerald-200/80"
              }`}
            >
              <span>🏪 Đối Tác Đã Xác Thực (Partner Center)</span>
              {currentUser?.partnerCapability === "VERIFIED" && (
                <span className="text-emerald-400 font-bold">✓</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchUser("admin")}
              className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                currentUser?.role === "ADMIN"
                  ? "bg-slate-800 text-purple-300 font-bold border border-slate-700"
                  : "hover:bg-slate-800/60 text-purple-200/80"
              }`}
            >
              <span>🛡️ Quản Trị Viên (Admin Portal)</span>
              {currentUser?.role === "ADMIN" && (
                <span className="text-purple-400 font-bold">✓</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
