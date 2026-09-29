import { baseApi } from "./baseApi";
import { OrderDTO, OrderStatus } from "@/types/contract";

export interface CreateOrderPayload {
  listingId: string;
  quantity: number;
  pickupTimeWindow: string;
  customerNotes?: string;
  customerPhone?: string;
}

export interface ListOrdersResponse {
  success: boolean;
  message: string;
  data: OrderDTO[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleOrderResponse {
  success: boolean;
  message: string;
  data: OrderDTO;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Khách hàng: Tạo đơn đặt giữ món ăn (ACID transaction)
    createOrder: builder.mutation<OrderDTO, CreateOrderPayload>({
      query: (body) => ({
        url: "/api/v1/orders",
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleOrderResponse) => response.data,
      invalidatesTags: ["Order", "Listing", "PartnerOrder", "PartnerListing"],
    }),

    // 2. Khách hàng: Lấy danh sách đơn của mình
    getMyOrders: builder.query<OrderDTO[], { page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        return {
          url: "/api/v1/orders",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response: ListOrdersResponse) => response.data || [],
      providesTags: ["Order"],
    }),

    // 3. Khách hàng hoặc Đối tác: Xem chi tiết 1 đơn hàng
    getOrderById: builder.query<OrderDTO, string>({
      query: (id) => ({
        url: `/api/v1/orders/${id}`,
        method: "GET",
      }),
      transformResponse: (response: SingleOrderResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

    // 4. Khách hàng: Hủy đơn hàng khi còn PENDING
    cancelOrder: builder.mutation<OrderDTO, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/api/v1/orders/${id}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      transformResponse: (response: SingleOrderResponse) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        "Order",
        "Listing",
        "PartnerOrder",
        "PartnerListing",
        { type: "Order", id },
      ],
    }),

    // 5. Đối tác: Lấy danh sách đơn hàng đến quán
    getPartnerOrders: builder.query<OrderDTO[], { status?: OrderStatus | "ALL"; page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.status && params.status !== "ALL") queryParams.status = params.status;
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        return {
          url: "/api/v1/partner/orders",
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (response: ListOrdersResponse) => response.data || [],
      providesTags: ["PartnerOrder"],
    }),

    // 6. Đối tác: Cập nhật trạng thái đơn (ACCEPTED, REJECTED, COMPLETED)
    updatePartnerOrderStatus: builder.mutation<OrderDTO, { id: string; status: "ACCEPTED" | "REJECTED" | "COMPLETED" }>({
      query: ({ id, status }) => ({
        url: `/api/v1/partner/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: SingleOrderResponse) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        "PartnerOrder",
        "Order",
        "Listing",
        "PartnerListing",
        { type: "Order", id },
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useGetPartnerOrdersQuery,
  useUpdatePartnerOrderStatusMutation,
} = orderApi;
