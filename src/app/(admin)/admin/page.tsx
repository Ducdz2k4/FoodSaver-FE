import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { RecentSales } from "@/components/admin";
import data from "./data.json";

export default function AdminDashboardPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-6 py-4 md:py-6">
        {/* Top 4 KPI Metrics */}
        <SectionCards />

        {/* Analytics Chart & Recent Activity Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 lg:px-6 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <ChartAreaInteractive />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <RecentSales />
          </div>
        </div>

        {/* Live Inventory & Countdown Management Data Table */}
        <div className="px-4 lg:px-6">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Quản Lý Danh Mục &amp; Thời Gian Hết Hạn
            </h2>
            <p className="text-xs text-muted-foreground">
              Theo dõi và kiểm soát trạng thái tự động theo thời gian thực.
            </p>
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
