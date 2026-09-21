"use client";

import React from "react";
import { Users, UserCheck, Store, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/admin/ui/card";

interface UserStatsCardsProps {
  total: number;
  active: number;
  partners: number;
  banned: number;
}

export function UserStatsCards({ total, active, partners, banned }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-border">
        <CardContent className="p-4 flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Tổng người dùng</p>
            <h3 className="text-2xl font-black text-foreground tabular-nums">
              {total.toLocaleString()}
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4 flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Đang hoạt động</p>
            <h3 className="text-2xl font-black text-foreground tabular-nums">
              {active.toLocaleString()}
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4 flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Store className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Cửa hàng đối tác</p>
            <h3 className="text-2xl font-black text-foreground tabular-nums">
              {partners.toLocaleString()}
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4 flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <ShieldAlert className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Tạm dừng / Khóa</p>
            <h3 className="text-2xl font-black text-foreground tabular-nums">
              {banned.toLocaleString()}
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
