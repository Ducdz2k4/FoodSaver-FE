"use client";

import React, { useState } from "react";
import { ShieldCheck, X } from "lucide-react";

interface Props {
  certUrl: string;
  partnerName: string;
  licenseNo?: string;
}

export const FoodSafetyBadge: React.FC<Props> = ({
  certUrl,
  partnerName,
  licenseNo,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-emerald-800 hover:bg-white transition-all shadow-sm border border-emerald-200 backdrop-blur-sm cursor-pointer"
        title="Nhấn để xem chứng nhận vệ sinh ATTP đã kiểm định"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Đã kiểm định ATTP</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 px-6 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Chứng Nhận Vệ Sinh An Toàn Thực Phẩm
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-gray-600 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100">
                <p>
                  <span className="font-bold text-gray-800">Cơ sở F&B:</span>{" "}
                  {partnerName}
                </p>
                {licenseNo && (
                  <p className="mt-1">
                    <span className="font-bold text-gray-800">Mã số ĐKKD:</span>{" "}
                    {licenseNo}
                  </p>
                )}
                <p className="text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
                  <span>✓</span> Đã được Ban Quản Trị FoodSaver đối chiếu và thẩm
                  định pháp lý
                </p>
              </div>

              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
                <img
                  src={certUrl}
                  alt={`Chứng nhận ATTP - ${partnerName}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="p-4 px-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
