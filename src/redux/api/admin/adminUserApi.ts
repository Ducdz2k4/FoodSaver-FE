import { baseApi } from "../baseApi";
import {
  AdminUser,
  ListUsersQuery,
  ListUsersResponse,
  SingleUserResponse,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UpdateUserRolePayload,
} from "@/types/admin";

export const adminUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get all users with search, role/status filters, pagination
    getUsers: builder.query<ListUsersResponse, ListUsersQuery | void>({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.search && params.search.trim()) {
          queryParams.search = params.search.trim();
        }
        if (params?.role && params.role !== "ALL") {
          queryParams.role = params.role;
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.status = params.status;
        }

        return {
          url: "/api/v1/users",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "AdminUsers" as const,
                id,
              })),
              { type: "AdminUsers", id: "LIST" },
            ]
          : [{ type: "AdminUsers", id: "LIST" }],
    }),

    // 2. Get single user details by ID
    getUserById: builder.query<SingleUserResponse, string>({
      query: (id) => `/api/v1/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AdminUsers", id }],
    }),

    // 3. Create a new user
    createUser: builder.mutation<SingleUserResponse, CreateUserPayload>({
      query: (body) => ({
        url: "/api/v1/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdminUsers", id: "LIST" }],
    }),

    // 4. Update basic user info
    updateUser: builder.mutation<SingleUserResponse, UpdateUserPayload>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminUsers", id },
        { type: "AdminUsers", id: "LIST" },
      ],
    }),

    // 5. Update user status (ACTIVE, INACTIVE, BANNED)
    updateUserStatus: builder.mutation<SingleUserResponse, UpdateUserStatusPayload>({
      query: ({ id, status }) => ({
        url: `/api/v1/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminUsers", id },
        { type: "AdminUsers", id: "LIST" },
      ],
    }),

    // 6. Update user role (USER, PARTNER, ADMIN)
    updateUserRole: builder.mutation<SingleUserResponse, UpdateUserRolePayload>({
      query: ({ id, role }) => ({
        url: `/api/v1/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminUsers", id },
        { type: "AdminUsers", id: "LIST" },
      ],
    }),

    // 7. Delete user
    deleteUser: builder.mutation<{ success: boolean; message: string; data: { id: string } }, string>({
      query: (id) => ({
        url: `/api/v1/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminUsers", id },
        { type: "AdminUsers", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = adminUserApi;
