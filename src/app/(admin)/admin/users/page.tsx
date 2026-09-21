import React from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { UsersIcon, UserCheckIcon, UserXIcon } from "lucide-react";
import { DataTable } from "@/components/data-table";
import data from "../data.json";

export default function AdminUsersPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <AdminPageHeader
        title="Quản Lý Người Dùng"
        description="Xem và quản lý danh sách tài khoản trong hệ thống."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Tổng người dùng"
          value="1,240"
          description="+8% so với tháng trước"
          icon={<UsersIcon className="size-5" />}
        />
        <AdminStatCard
          title="Đang hoạt động"
          value="1,180"
          description="95% tỷ lệ hoạt động"
          icon={<UserCheckIcon className="size-5" />}
        />
        <AdminStatCard
          title="Chưa kích hoạt"
          value="60"
          description="Cần xác thực"
          icon={<UserXIcon className="size-5" />}
        />
      </div>

      <DataTable data={data} />
    </div>
  );
}
