import { baseApi } from "./baseApi";
import { NotificationDTO } from "@/types/contract";

export interface ListNotificationsResponse {
  success: boolean;
  message: string;
  data: NotificationDTO[];
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationDTO[], void>({
      query: () => ({
        url: "/api/v1/notifications",
        method: "GET",
      }),
      transformResponse: (response: ListNotificationsResponse) => response.data || [],
      providesTags: ["Notification"],
    }),

    markAsRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/v1/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/api/v1/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
