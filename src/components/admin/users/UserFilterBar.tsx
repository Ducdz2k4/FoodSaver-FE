"use client";

import React, { useState } from "react";
import { Search, Plus, RefreshCw } from "lucide-react";
import { UserRole, UserStatus } from "@/types/admin";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";

interface UserFilterBarProps {
  onSearch: (query: string) => void;
  selectedRole: UserRole | "ALL";
  onRoleChange: (role: UserRole | "ALL") => void;
  selectedStatus: UserStatus | "ALL";
  onStatusChange: (status: UserStatus | "ALL") => void;
  onRefresh: () => void;
  isFetching: boolean;
  onCreateOpen: () => void;
}

export function UserFilterBar({
  onSearch,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onRefresh,
  isFetching,
  onCreateOpen,
}: UserFilterBarProps) {
  const [inputVal, setInputVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputVal);
  };

  const handleClear = () => {
    setInputVal("");
    onSearch("");
  };

  return (
    <Card className="border-border">
      <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="text-xs font-semibold">
            Tìm
          </Button>
          {inputVal && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-muted-foreground"
            >
              Xóa
            </Button>
          )}
        </form>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-40">
            <Select
              value={selectedRole}
              onValueChange={(val) => onRoleChange(val as UserRole | "ALL")}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="Tất cả vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                <SelectItem value="USER">Khách hàng (USER)</SelectItem>
                <SelectItem value="PARTNER">Đối tác (PARTNER)</SelectItem>
                <SelectItem value="ADMIN">Quản trị (ADMIN)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select
              value={selectedStatus}
              onValueChange={(val) => onStatusChange(val as UserStatus | "ALL")}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Hoạt động (ACTIVE)</SelectItem>
                <SelectItem value="INACTIVE">Tạm ngưng (INACTIVE)</SelectItem>
                <SelectItem value="BANNED">Bị khóa (BANNED)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className="text-xs gap-1.5 h-9"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={onCreateOpen}
            className="text-xs font-bold gap-1.5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="size-4" />
            <span>Thêm mới</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
