import React from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";

export default function AdminSettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
      <AdminPageHeader
        title="Cài Đặt Hệ Thống"
        description="Quản lý cấu hình chung cho ứng dụng."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Cấu hình tên và thông tin liên hệ hệ thống.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Tên ứng dụng</Label>
            <Input id="appName" defaultValue="FoodSaver" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email quản trị</Label>
            <Input id="adminEmail" defaultValue="admin@foodsaver.local" />
          </div>
          <Button>Lưu thay đổi</Button>
        </CardContent>
      </Card>
    </div>
  );
}
