import { baseApi } from "../baseApi";

export type PayoutStatus = "REQUESTED" | "PROCESSING" | "COMPLETED" | "REJECTED";

export interface AdminPayoutItem {
  id: string;
  payoutNumber: string;
  partnerId: string;
  amount: number;
  bankName?: string;
  bankAccountNo?: string;
  bankAccountName?: string;
  bankReferenceCode?: string;
  status: PayoutStatus;
  rejectionReason?: string;
  processedAt?: string;
  createdAt: string;
  partner?: {
    id: string;
    userId: string;
    businessName: string;
    phone: string;
    businessType: string;
    address: string;
    user?: {
      id: string;
      email: string;
      fullName: string;
    };
  };
}

export interface AdminPayoutsResponse {
  success: boolean;
  message: string;
  data: AdminPayoutItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminPayoutFilterParams {
  status?: PayoutStatus | "ALL";
  search?: string;
  page?: number;
  limit?: number;
}

export const adminPayoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminPayouts: builder.query<{ payouts: AdminPayoutItem[]; meta: AdminPayoutsResponse["meta"] }, AdminPayoutFilterParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.status && params.status !== "ALL") queryParams.status = params.status;
        if (params?.search && params.search.trim()) queryParams.search = params.search.trim();
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        return {
          url: "/api/v1/admin/payouts",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response: any) => ({
        payouts: response.data || [],
        meta: response.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
      }),
      providesTags: ["Admin"],
    }),

    processPayout: builder.mutation<AdminPayoutItem, string>({
      query: (id) => ({
        url: `/api/v1/admin/payouts/${id}/process`,
        method: "POST",
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["Admin"],
    }),

    completePayout: builder.mutation<AdminPayoutItem, { id: string; bankReferenceCode: string }>({
      query: ({ id, bankReferenceCode }) => ({
        url: `/api/v1/admin/payouts/${id}/complete`,
        method: "POST",
        body: { bankReferenceCode },
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["Admin"],
    }),

    rejectPayout: builder.mutation<AdminPayoutItem, { id: string; rejectionReason: string }>({
      query: ({ id, rejectionReason }) => ({
        url: `/api/v1/admin/payouts/${id}/reject`,
        method: "POST",
        body: { rejectionReason },
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["Admin"],
    }),
  }),
});

export const {
  useGetAdminPayoutsQuery,
  useProcessPayoutMutation,
  useCompletePayoutMutation,
  useRejectPayoutMutation,
} = adminPayoutApi;
