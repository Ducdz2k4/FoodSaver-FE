"use client";

import React from "react";
import { AdminUser } from "@/types/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import { Button } from "@/components/admin/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteUserDialogProps {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteUserDialog({
  user,
  onClose,
  onConfirm,
  isLoading,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="flex flex-col items-center">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
            <AlertTriangle className="size-6" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            Xác nhận xóa người dùng?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Hành động này sẽ xóa vĩnh viễn tài khoản{" "}
            <strong className="text-foreground">{user?.fullName}</strong> ({user?.email}). Không thể khôi phục lại sau khi xóa!
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row gap-2 justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isLoading}
            onClick={onConfirm}
            className="flex-1 font-bold"
          >
            {isLoading ? "Đang xóa..." : "Xóa ngay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
