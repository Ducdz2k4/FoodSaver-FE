import { baseApi } from "../baseApi";
import { FoodSafetyReportDTO, SafetyReportStatus, SafetyReportIssueType } from "@/types/contract";

export interface GetAdminSafetyReportsParams {
  status?: SafetyReportStatus | "ALL";
  issueType?: SafetyReportIssueType | "ALL";
  page?: number;
  limit?: number;
}

export interface AdminSafetyReportsResponse {
  reports: FoodSafetyReportDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateAdminSafetyReportPayload {
  id: string;
  status: SafetyReportStatus;
  resolution?: string;
  adminNotes?: string;
  actionOnListing?: "HIDE_LISTING" | "KEEP";
}

export const adminSafetyReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSafetyReports: builder.query<AdminSafetyReportsResponse, GetAdminSafetyReportsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status && params.status !== "ALL") queryParams.append("status", params.status);
        if (params?.issueType && params.issueType !== "ALL") queryParams.append("issueType", params.issueType);
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.limit) queryParams.append("limit", String(params.limit));

        const qs = queryParams.toString();
        return {
          url: `/api/v1/admin/safety-reports${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (res: any) => ({
        reports: res.data || [],
        meta: res.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
      }),
      providesTags: ["Order", "Admin"],
    }),

    getAdminSafetyReportById: builder.query<FoodSafetyReportDTO, string>({
      query: (id) => ({
        url: `/api/v1/admin/safety-reports/${id}`,
        method: "GET",
      }),
      transformResponse: (res: any) => res.data,
      providesTags: (_res, _err, id) => [{ type: "Order", id }],
    }),

    updateAdminSafetyReport: builder.mutation<FoodSafetyReportDTO, UpdateAdminSafetyReportPayload>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/admin/safety-reports/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["Order", "Admin", "Listing"],
    }),
  }),
});

export const {
  useGetAdminSafetyReportsQuery,
  useGetAdminSafetyReportByIdQuery,
  useUpdateAdminSafetyReportMutation,
} = adminSafetyReportApi;
