"use client";

import React, { useState } from "react";
import { UserRole, UserStatus, CreateUserPayload } from "@/types/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import { toast } from "sonner";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateUserPayload) => Promise<void>;
  isLoading: boolean;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateUserDialogProps) {
  const [form, setForm] = useState<CreateUserPayload>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "USER",
    status: "ACTIVE",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Vui lòng điền họ tên, email và mật khẩu.");
      return;
    }

    try {
      await onSubmit(form);
      setForm({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "USER",
        status: "ACTIVE",
      });
      onOpenChange(false);
    } catch {
      // Error handled by caller
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Thêm Người Dùng Mới</DialogTitle>
            <DialogDescription className="text-xs">
              Tạo tài khoản khách hàng hoặc đối tác mới trên hệ thống FoodSaver.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold block mb-1">Họ và tên *</label>
              <Input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Email đăng nhập *</label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@foodsaver.vn"
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Mật khẩu ban đầu *</label>
              <Input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Số điện thoại</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0912345678"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Vai trò</label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v as UserRole })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Khách hàng (USER)</SelectItem>
                    <SelectItem value="PARTNER">Đối tác (PARTNER)</SelectItem>
                    <SelectItem value="ADMIN">Quản trị viên (ADMIN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Địa chỉ</label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Số nhà, đường, quận/huyện..."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {isLoading ? "Đang tạo..." : "Xác nhận tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
