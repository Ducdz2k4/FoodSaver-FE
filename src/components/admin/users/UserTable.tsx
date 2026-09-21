"use client";

import React from "react";
import { AdminUser, UserRole, UserStatus, PaginationMeta } from "@/types/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Skeleton } from "@/components/admin/ui/skeleton";
import {
  Users,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Ban,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface UserTableProps {
  users: AdminUser[];
  meta?: PaginationMeta;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (user: AdminUser) => void;
  onStatusChange: (id: string, status: UserStatus) => void;
  onRoleChange: (id: string, role: UserRole) => void;
  onDelete: (user: AdminUser) => void;
}

export function UserTable({
  users,
  meta,
  isLoading,
  isFetching,
  page,
  onPageChange,
  onEdit,
  onStatusChange,
  onRoleChange,
  onDelete,
}: UserTableProps) {
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge className="bg-primary/15 text-primary border-primary/30 font-bold hover:bg-primary/20">
            Quản trị viên
          </Badge>
        );
      case "PARTNER":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold hover:bg-emerald-500/20">
            Cửa hàng đối tác
          </Badge>
        );
      case "USER":
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground font-medium">
            Khách hàng
          </Badge>
        );
    }
  };

  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Hoạt động
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500">
            <span className="size-2 rounded-full bg-stone-400" />
            Tạm dừng
          </span>
        );
      case "BANNED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <span className="size-2 rounded-full bg-destructive" />
            Bị khóa
          </span>
        );
    }
  };

  return (
    <Card className="border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs font-bold">Người dùng</TableHead>
              <TableHead className="text-xs font-bold">Vai trò</TableHead>
              <TableHead className="text-xs font-bold">Trạng thái</TableHead>
              <TableHead className="text-xs font-bold">Liên hệ &amp; Địa chỉ</TableHead>
              <TableHead className="text-xs font-bold">Ngày tham gia</TableHead>
              <TableHead className="text-xs font-bold text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Users className="size-8 opacity-40" />
                    <p className="text-sm font-semibold">Không tìm thấy người dùng nào</p>
                    <p className="text-xs">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái/vai trò.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const initials = user.fullName
                  ? user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "FS";

                return (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-foreground truncate">
                            {user.fullName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{renderRoleBadge(user.role)}</TableCell>

                    <TableCell>{renderStatusBadge(user.status)}</TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        {user.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">Chưa có SĐT</span>
                        )}
                        {user.address && (
                          <div className="flex items-center gap-1 text-[11px] truncate max-w-xs">
                            <MapPin className="size-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{user.address}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Thao tác</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 text-xs">
                          <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>

                          <DropdownMenuItem
                            onClick={() => onEdit(user)}
                            className="gap-2 cursor-pointer"
                          >
                            <Edit2 className="size-3.5" />
                            <span>Chỉnh sửa thông tin</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">
                            Đổi vai trò
                          </DropdownMenuLabel>
                          {user.role !== "USER" && (
                            <DropdownMenuItem
                              onClick={() => onRoleChange(user.id, "USER")}
                              className="cursor-pointer"
                            >
                              Đổi thành Khách hàng (USER)
                            </DropdownMenuItem>
                          )}
                          {user.role !== "PARTNER" && (
                            <DropdownMenuItem
                              onClick={() => onRoleChange(user.id, "PARTNER")}
                              className="cursor-pointer"
                            >
                              Đổi thành Đối tác (PARTNER)
                            </DropdownMenuItem>
                          )}
                          {user.role !== "ADMIN" && (
                            <DropdownMenuItem
                              onClick={() => onRoleChange(user.id, "ADMIN")}
                              className="cursor-pointer font-bold text-primary"
                            >
                              Thăng cấp Quản trị (ADMIN)
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">
                            Đổi trạng thái
                          </DropdownMenuLabel>
                          {user.status !== "ACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => onStatusChange(user.id, "ACTIVE")}
                              className="gap-2 text-emerald-600 cursor-pointer"
                            >
                              <CheckCircle className="size-3.5" />
                              <span>Kích hoạt tài khoản</span>
                            </DropdownMenuItem>
                          )}
                          {user.status !== "INACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => onStatusChange(user.id, "INACTIVE")}
                              className="gap-2 cursor-pointer"
                            >
                              <Clock className="size-3.5" />
                              <span>Tạm ngưng hoạt động</span>
                            </DropdownMenuItem>
                          )}
                          {user.status !== "BANNED" && (
                            <DropdownMenuItem
                              onClick={() => onStatusChange(user.id, "BANNED")}
                              className="gap-2 text-destructive cursor-pointer"
                            >
                              <Ban className="size-3.5" />
                              <span>Khóa tài khoản (Ban)</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(user)}
                            className="gap-2 text-destructive focus:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Xóa người dùng</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            Hiển thị trang <strong>{meta.page}</strong> trên <strong>{meta.totalPages}</strong> ({meta.total} người dùng)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isFetching}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="size-3.5" />
              <span>Trước</span>
            </Button>

            <span className="px-2 font-mono font-bold text-foreground">
              {page} / {meta.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(meta.totalPages, page + 1))}
              disabled={page >= meta.totalPages || isFetching}
              className="gap-1 text-xs"
            >
              <span>Sau</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
