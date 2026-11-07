import { baseApi } from "./baseApi";
import { PartnerProfileDTO, BusinessType } from "@/types/contract";

export interface ApplyPartnerPayload {
  businessName: string;
  businessLicenseNo: string;
  businessLicenseUrl: string;
  foodSafetyCertUrl: string;
  businessType: BusinessType;
  address: string;
  lat: number;
  lng: number;
  phone: string;
}

export interface SinglePartnerResponse {
  success: boolean;
  message: string;
  data: PartnerProfileDTO;
}

export interface ListPartnersResponse {
  success: boolean;
  message: string;
  data: PartnerProfileDTO[];
}


export interface UpdatePartnerPayload {
  businessName?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  defaultPickupStart?: string;
  defaultPickupEnd?: string;
  pickupInstructions?: string;
  isOpen?: boolean;
}

export interface PartnerReviewItem {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  customer?: {
    fullName: string;
    avatar?: string;
  };
  order?: {
    orderNumber: string;
    listing?: {
      title: string;
      imageUrls?: string | string[];
    };
  };
}

export interface PartnerReviewsResponse {
  reviews: PartnerReviewItem[];
  total: number;
  avgRating: number;
  totalReviews: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const partnerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. User: Nộp hoặc sửa lại hồ sơ đối tác
    applyPartner: builder.mutation<PartnerProfileDTO, ApplyPartnerPayload>({
      query: (body) => ({
        url: "/api/v1/partners/apply",
        method: "POST",
        body,
      }),
      transformResponse: (response: SinglePartnerResponse) => response.data,
      invalidatesTags: ["PartnerProfile", "User", "UserProfile"],
    }),

    // 2. User: Lấy thông tin hồ sơ đối tác của mình
    getMyPartnerProfile: builder.query<PartnerProfileDTO, void>({
      query: () => ({
        url: "/api/v1/partners/me",
        method: "GET",
      }),
      transformResponse: (response: SinglePartnerResponse) => response.data,
      providesTags: ["PartnerProfile"],
    }),

    // 8. Partner: Cập nhật cài đặt cửa hàng
    updateMyPartnerProfile: builder.mutation<PartnerProfileDTO, UpdatePartnerPayload>({
      query: (body) => ({
        url: "/api/v1/partners/me",
        method: "PUT",
        body,
      }),
      transformResponse: (response: SinglePartnerResponse) => response.data,
      invalidatesTags: ["PartnerProfile"],
    }),

    // 9. Partner: Lấy danh sách đánh giá từ khách hàng
    getMyPartnerReviews: builder.query<PartnerReviewsResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/api/v1/partners/me/reviews",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["PartnerProfile"],
    }),

    // 3. Admin: Lấy danh sách hồ sơ đối tác đang chờ duyệt
    getPendingPartners: builder.query<PartnerProfileDTO[], void>({
      query: () => ({
        url: "/api/v1/admin/partners/pending",
        method: "GET",
      }),
      transformResponse: (response: ListPartnersResponse) => response.data || [],
      providesTags: ["PartnerProfile"],
    }),

    // 3b. Admin: Lấy danh sách toàn bộ hồ sơ đối tác (hỗ trợ filter status)
    getAllPartners: builder.query<PartnerProfileDTO[], { status?: string } | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.status && params.status !== "ALL") queryParams.status = params.status;
        return {
          url: "/api/v1/admin/partners",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response: ListPartnersResponse) => response.data || [],
      providesTags: ["PartnerProfile"],
    }),

    // 4. Admin: Phê duyệt hoặc từ chối hồ sơ
    verifyPartner: builder.mutation<PartnerProfileDTO, { id: string; status: "VERIFIED" | "REJECTED"; rejectionReason?: string }>({
      query: ({ id, status, rejectionReason }) => ({
        url: `/api/v1/admin/partners/${id}/verify`,
        method: "PATCH",
        body: { status, rejectionReason },
      }),
      transformResponse: (response: SinglePartnerResponse) => response.data,
      invalidatesTags: ["PartnerProfile", "User", "UserProfile", "Admin"],
    }),

    // 5. User: Theo dõi hoặc bỏ theo dõi quán (Follow Partner)
    toggleFollowPartner: builder.mutation<{ isFollowing: boolean; followerCount: number }, string>({
      query: (partnerId) => ({
        url: `/api/v1/partners/${partnerId}/follow`,
        method: "POST",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["PartnerProfile"],
    }),

    // 6. User: Kiểm tra trạng thái theo dõi quán
    getFollowStatus: builder.query<{ isFollowing: boolean; followerCount: number }, string>({
      query: (partnerId) => ({
        url: `/api/v1/partners/${partnerId}/follow-status`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (_res, _err, partnerId) => [{ type: "PartnerProfile", id: partnerId }],
    }),

    // 7. User: Danh sách quán đang theo dõi
    getFollowedPartners: builder.query<any[], void>({
      query: () => ({
        url: "/api/v1/users/me/followed-partners",
        method: "GET",
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: ["PartnerProfile"],
    }),
  }),
});

export const {
  useApplyPartnerMutation,
  useGetMyPartnerProfileQuery,
  useGetPendingPartnersQuery,
  useGetAllPartnersQuery,
  useVerifyPartnerMutation,
  useToggleFollowPartnerMutation,
  useGetFollowStatusQuery,
  useGetFollowedPartnersQuery,
  useUpdateMyPartnerProfileMutation,
  useGetMyPartnerReviewsQuery,
} = partnerApi;
