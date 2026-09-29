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

    // 3. Admin: Lấy danh sách hồ sơ đối tác đang chờ duyệt
    getPendingPartners: builder.query<PartnerProfileDTO[], void>({
      query: () => ({
        url: "/api/v1/admin/partners/pending",
        method: "GET",
      }),
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
  }),
});

export const {
  useApplyPartnerMutation,
  useGetMyPartnerProfileQuery,
  useGetPendingPartnersQuery,
  useVerifyPartnerMutation,
} = partnerApi;
