import { baseApi } from "./baseApi";
import { ListingDTO, FoodCategory, ListingStatus } from "@/types/contract";

export interface QueryListingsParams {
  search?: string;
  category?: FoodCategory | "ALL";
  lat?: number;
  lng?: number;
  radiusKm?: number;
  urgentOnly?: boolean;
  sortBy?: "EXPIRY" | "PRICE_ASC" | "PRICE_DESC" | "URGENCY" | "NEWEST";
  page?: number;
  limit?: number;
}

export interface ListListingsResponse {
  success: boolean;
  message: string;
  data: ListingDTO[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleListingResponse {
  success: boolean;
  message: string;
  data: ListingDTO;
}

export interface CreateListingPayload {
  title: string;
  description?: string;
  category: FoodCategory;
  originalPrice: number;
  discountPrice: number;
  quantity: number;
  unit?: string;
  expiryAt: string;
  pickupStartTime: string;
  pickupEndTime: string;
  pickupAddress?: string;
  lat?: number;
  lng?: number;
  imageUrls: string[];
  safetyNotes?: string;
}

export const listingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Khách hàng: Lấy danh sách món khám phá công khai
    getListings: builder.query<ListingDTO[], QueryListingsParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.search && params.search.trim()) queryParams.search = params.search.trim();
        if (params?.category && params.category !== "ALL") queryParams.category = params.category;
        if (params?.lat !== undefined) queryParams.lat = params.lat;
        if (params?.lng !== undefined) queryParams.lng = params.lng;
        if (params?.radiusKm !== undefined) queryParams.radiusKm = params.radiusKm;
        if (params?.urgentOnly) queryParams.urgentOnly = true;
        if (params?.sortBy) queryParams.sortBy = params.sortBy;
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;

        return {
          url: "/api/v1/listings",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response: ListListingsResponse) => response.data || [],
      providesTags: ["Listing"],
    }),

    // 2. Khách hàng: Chi tiết món ăn
    getListingById: builder.query<ListingDTO, { id: string; lat?: number; lng?: number }>({
      query: ({ id, lat, lng }) => {
        const params: Record<string, any> = {};
        if (lat !== undefined) params.lat = lat;
        if (lng !== undefined) params.lng = lng;
        return {
          url: `/api/v1/listings/${id}`,
          method: "GET",
          params,
        };
      },
      transformResponse: (response: SingleListingResponse) => response.data,
      providesTags: (_result, _error, { id }) => [{ type: "Listing", id }],
    }),

    // 3. Đối tác: Lấy danh sách món của quán mình
    getPartnerListings: builder.query<ListingDTO[], { status?: ListingStatus | "ALL"; page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.status && params.status !== "ALL") queryParams.status = params.status;
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;

        return {
          url: "/api/v1/partner/listings",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response: ListListingsResponse) => response.data || [],
      providesTags: ["PartnerListing"],
    }),

    // 4. Đối tác: Đăng món mới (Tích hợp Jev AI chấm điểm ngầm)
    createListing: builder.mutation<ListingDTO, CreateListingPayload>({
      query: (body) => ({
        url: "/api/v1/partner/listings",
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleListingResponse) => response.data,
      invalidatesTags: ["PartnerListing", "Listing"],
    }),

    // 5. Đối tác: Chỉnh sửa món ăn
    updateListing: builder.mutation<ListingDTO, { id: string; body: Partial<CreateListingPayload & { status: ListingStatus }> }>({
      query: ({ id, body }) => ({
        url: `/api/v1/partner/listings/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: SingleListingResponse) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        "PartnerListing",
        "Listing",
        { type: "Listing", id },
      ],
    }),

    // 6. Đối tác / Admin: Bật/Tắt trạng thái
    toggleListingStatus: builder.mutation<ListingDTO, { id: string; status: ListingStatus }>({
      query: ({ id, status }) => ({
        url: `/api/v1/partner/listings/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: SingleListingResponse) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        "PartnerListing",
        "Listing",
        "AdminListings",
        { type: "Listing", id },
      ],
    }),

    // 7. Đối tác: Xóa món ăn
    deleteListing: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/v1/partner/listings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PartnerListing", "Listing"],
    }),

    // 8. Admin: Danh sách kiểm duyệt món toàn sàn
    getAdminListings: builder.query<ListingDTO[], { search?: string; status?: ListingStatus | "ALL"; page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.search && params.search.trim()) queryParams.search = params.search.trim();
        if (params?.status && params.status !== "ALL") queryParams.status = params.status;
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;

        return {
          url: "/api/v1/admin/listings",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response: ListListingsResponse) => response.data || [],
      providesTags: ["AdminListings"],
    }),
  }),
});

export const {
  useGetListingsQuery,
  useGetListingByIdQuery,
  useGetPartnerListingsQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useToggleListingStatusMutation,
  useDeleteListingMutation,
  useGetAdminListingsQuery,
} = listingApi;
