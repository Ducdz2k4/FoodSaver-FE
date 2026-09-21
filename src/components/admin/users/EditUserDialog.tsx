"use client";

import React, { useState, useEffect } from "react";
import { AdminUser, UserRole, UserStatus, UpdateUserPayload } from "@/types/admin";
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

interface EditUserDialogProps {
  user: AdminUser | null;
  onClose: () => void;
  onSubmit: (payload: UpdateUserPayload) => Promise<void>;
  isLoading: boolean;
}

export function EditUserDialog({
  user,
  onClose,
  onSubmit,
  isLoading,
}: EditUserDialogProps) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    bio: "",
    role: "USER" as UserRole,
    status: "ACTIVE" as UserStatus,
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await onSubmit({
        id: user.id,
        ...form,
      });
      onClose();
    } catch {
      // Handled by caller
    }
  };

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Chỉnh Sửa Người Dùng</DialogTitle>
            <DialogDescription className="text-xs">
              Cập nhật thông tin tài khoản <strong>{user?.email}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold block mb-1">Họ và tên</label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Số điện thoại</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
              <label className="font-semibold block mb-1">Trạng thái tài khoản</label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as UserStatus })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động (ACTIVE)</SelectItem>
                  <SelectItem value="INACTIVE">Tạm ngưng (INACTIVE)</SelectItem>
                  <SelectItem value="BANNED">Bị khóa (BANNED)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Địa chỉ</label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Ghi chú / Giới thiệu</label>
              <Input
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
