"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Trash2, Edit3, Power, AlertCircle } from "lucide-react";
import { MOCK_LISTINGS } from "@/mocks/mockData";
import { ExpiryCountdown } from "@/components/common/ExpiryCountdown";
import { ListingStatus } from "@/types/contract";

export default function PartnerListingsPage() {
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [filterStatus, setFilterStatus] = useState<ListingStatus | "ALL">("ALL");

  const toggleStatus = (id: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus: ListingStatus =
            item.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const filtered = listings.filter((item) => {
    if (filterStatus === "ALL") return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00615f] tracking-tight">
            Quản lý món ăn giải cứu
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Kiểm soát số lượng tồn kho, thời hạn hết hạn và trạng thái hiển thị của các món.
          </p>
        </div>

        <Link
          href="/partner/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00615f] hover:bg-[#089184] text-white text-xs font-bold shadow-md transition shrink-0 active:scale-95"
        >
          <PlusCircle className="size-4" />
          <span>+ Đăng món mới</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(["ALL", "AVAILABLE", "EXPIRING_SOON", "SOLD_OUT", "UNAVAILABLE"] as const).map(
          (status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterStatus === status
                  ? "bg-[#00615f] text-white shadow-sm"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {status === "ALL" && "Tất cả món"}
              {status === "AVAILABLE" && "Đang mở bán"}
              {status === "EXPIRING_SOON" && "⚡ Sắp hết hạn"}
              {status === "SOLD_OUT" && "Đã bán hết"}
              {status === "UNAVAILABLE" && "Tạm ngưng"}
            </button>
          )
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">Món ăn</th>
                <th className="p-4">Giá gốc / Giải cứu</th>
                <th className="p-4">Tồn kho</th>
                <th className="p-4">Hạn giải cứu</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 pr-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/60 transition">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <strong className="text-stone-900 block font-bold text-xs sm:text-sm">
                          {item.title}
                        </strong>
                        <span className="text-[11px] text-stone-400 capitalize">
                          {item.category.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-[#00615f] block">
                        {item.discountPrice.toLocaleString("vi-VN")}đ
                      </span>
                      <span className="text-[11px] text-stone-400 line-through">
                        {item.originalPrice.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-stone-800">
                      {item.quantity} {item.unit}
                    </span>
                  </td>

                  <td className="p-4">
                    <ExpiryCountdown expiryAt={item.expiryAt} compact />
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "EXPIRING_SOON"
                          ? "bg-rose-100 text-rose-800 animate-pulse"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/partner/listings/${item.id}/edit`}
                        className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 transition"
                        title="Chỉnh sửa món"
                      >
                        <Edit3 className="size-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleStatus(item.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          item.status === "AVAILABLE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"
                        }`}
                        title="Bật/Tắt hiển thị món"
                      >
                        <Power className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

