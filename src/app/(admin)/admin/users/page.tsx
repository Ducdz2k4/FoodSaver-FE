"use client";

import React, { useState, useMemo } from "react";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from "@/redux/api/admin";
import {
  AdminUser,
  UserRole,
  UserStatus,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types/admin";
import {
  UserStatsCards,
  UserFilterBar,
  UserTable,
  CreateUserDialog,
  EditUserDialog,
  DeleteUserDialog,
} from "@/components/admin/users";
import { toast } from "sonner";

export default function AdminUsersPage() {
  // Query Filter & Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "ALL">("ALL");
  const [status, setStatus] = useState<UserStatus | "ALL">("ALL");

  // Modal Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  // Real RTK Query Call
  const { data: usersResponse, isLoading, isFetching, refetch } = useGetUsersQuery({
    page,
    limit,
    search,
    role,
    status,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = usersResponse?.data || [];
  const meta = usersResponse?.meta;

  // KPI Calculations
  const stats = useMemo(() => {
    const total = meta?.total ?? users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const partners = users.filter((u) => u.role === "PARTNER").length;
    const banned = users.filter((u) => u.status === "BANNED" || u.status === "INACTIVE").length;
    return { total, active, partners, banned };
  }, [meta, users]);

  // Create handler
  const handleCreateSubmit = async (payload: CreateUserPayload) => {
    try {
      await createUser(payload).unwrap();
      toast.success("Tạo người dùng mới thành công!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Không thể tạo tài khoản người dùng.");
      throw error;
    }
  };

  // Edit handler
  const handleEditSubmit = async (payload: UpdateUserPayload) => {
    try {
      await updateUser(payload).unwrap();
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Cập nhật thất bại.");
      throw error;
    }
  };

  // Quick Status change
  const handleStatusChange = async (id: string, newStatus: UserStatus) => {
    try {
      await updateUserStatus({ id, status: newStatus }).unwrap();
      toast.success(`Đã cập nhật trạng thái thành ${newStatus}`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Không thể đổi trạng thái.");
    }
  };

  // Quick Role change
  const handleRoleChange = async (id: string, newRole: UserRole) => {
    try {
      await updateUserRole({ id, role: newRole }).unwrap();
      toast.success(`Đã cập nhật vai trò thành ${newRole}`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Không thể đổi vai trò.");
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id).unwrap();
      toast.success("Đã xóa người dùng thành công.");
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Không thể xóa người dùng.");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Quản Lý Người Dùng &amp; Đối Tác
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Theo dõi và quản lý tài khoản khách hàng, tiệm bánh đối tác và phân quyền hệ thống FoodSaver.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <UserStatsCards
        total={stats.total}
        active={stats.active}
        partners={stats.partners}
        banned={stats.banned}
      />

      {/* Filter & Search Bar */}
      <UserFilterBar
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
        }}
        selectedRole={role}
        onRoleChange={(r) => {
          setRole(r);
          setPage(1);
        }}
        selectedStatus={status}
        onStatusChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
        onRefresh={() => refetch()}
        isFetching={isFetching}
        onCreateOpen={() => setCreateOpen(true)}
      />

      {/* Main Users Table with Pagination */}
      <UserTable
        users={users}
        meta={meta}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        onPageChange={setPage}
        onEdit={(u) => setEditTarget(u)}
        onStatusChange={handleStatusChange}
        onRoleChange={handleRoleChange}
        onDelete={(u) => setDeleteTarget(u)}
      />

      {/* Create Modal Dialog */}
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />

      {/* Edit Modal Dialog */}
      <EditUserDialog
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
        isLoading={isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
