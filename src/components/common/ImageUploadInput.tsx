"use client";

import React, { useRef } from "react";
import { UploadCloud, Loader2, X, Image as ImageIcon } from "lucide-react";
import { useUploadImageMutation } from "@/redux/api/uploadApi";
import { toast } from "sonner";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  aspectRatio?: "video" | "square" | "portrait";
}

export const ImageUploadInput: React.FC<Props> = ({
  value,
  onChange,
  label,
  folder = "foodsaver/uploads",
  aspectRatio = "video",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadImage, { isLoading }] = useUploadImageMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước tệp quá lớn (Tối đa 10MB)!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    try {
      const res = await uploadImage(formData).unwrap();
      onChange(res.url);
      toast.success("Tải ảnh lên Cloudinary thành công!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Tải ảnh thất bại. Vui lòng thử lại!");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const aspectClass =
    aspectRatio === "video"
      ? "aspect-[16/10]"
      : aspectRatio === "square"
      ? "aspect-square"
      : "aspect-[4/3]";

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-bold text-stone-700 block">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        <div className={`relative ${aspectClass} rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 group shadow-sm`}>
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-stone-800 hover:bg-stone-100 shadow transition"
            >
              Đổi ảnh
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow transition"
              title="Xóa ảnh"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-stone-300 hover:border-[#00615f] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-stone-50/70 hover:bg-emerald-50/30 ${aspectClass}`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-[#00615f]">
              <Loader2 className="size-6 animate-spin" />
              <span className="text-xs font-bold">Đang tải ảnh lên Cloudinary...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-stone-500">
              <div className="size-10 rounded-full bg-white shadow-sm border border-stone-200 flex items-center justify-center text-[#00615f]">
                <UploadCloud className="size-5" />
              </div>
              <span className="text-xs font-bold text-stone-800">
                Bấm vào đây để tải ảnh từ máy
              </span>
              <span className="text-[11px] text-stone-400">
                Hỗ trợ JPG, PNG, WEBP tối đa 10MB
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
