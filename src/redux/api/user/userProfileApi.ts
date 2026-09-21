import { baseApi } from "../baseApi";
import { UserOut } from "@/types/auth";

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar?: string;
}

export const userProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserOut, void>({
      query: () => "/api/v1/auth/me",
      providesTags: ["UserProfile"],
    }),

    updateUserProfile: builder.mutation<UserOut, UpdateProfilePayload>({
      query: (body) => ({
        url: "/api/v1/auth/me",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["UserProfile", "User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = userProfileApi;
