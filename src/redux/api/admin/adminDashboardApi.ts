import { baseApi } from "../baseApi";

export interface DashboardMetricsResponse {
  success: boolean;
  data: {
    kpi: {
      totalRevenue: number;
      totalMealsRescued: number;
      totalSavedByUsers: number;
      activeListingsCount: number;
      verifiedPartnersCount: number;
      pendingPartnersCount: number;
      totalUsersCount: number;
    };
    recentActivity: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      customerEmail: string;
      listingTitle: string;
      amount: number;
      status: string;
      createdAt: string;
    }>;
  };
}

export interface ESGReportsResponse {
  success: boolean;
  data: {
    summary: {
      totalKgRescued: number;
      totalCo2Avoided: number;
      totalSavedMoney: number;
      treesEquivalent: number;
    };
    monthlyBreakdown: Array<{
      month: string;
      kg: number;
      co2: number;
      saved: number;
    }>;
  };
}

export const adminDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboardMetrics: builder.query<DashboardMetricsResponse["data"], void>({
      query: () => ({
        url: "/api/v1/admin/dashboard",
        method: "GET",
      }),
      transformResponse: (res: DashboardMetricsResponse) => res.data,
      providesTags: ["Admin", "Order", "Listing"],
    }),

    getAdminESGReports: builder.query<ESGReportsResponse["data"], void>({
      query: () => ({
        url: "/api/v1/admin/reports",
        method: "GET",
      }),
      transformResponse: (res: ESGReportsResponse) => res.data,
      providesTags: ["Admin", "Order"],
    }),
  }),
});

export const {
  useGetAdminDashboardMetricsQuery,
  useGetAdminESGReportsQuery,
} = adminDashboardApi;
