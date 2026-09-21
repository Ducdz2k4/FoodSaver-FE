import { baseApi } from "./baseApi";
import {
  RegisterIn,
  LoginIn,
  AuthResponseData,
  UserOut,
} from "@/types/auth";
import { setCredentials, setUser, logOut } from "@/redux/slices/authSlice";

export const authApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponseData, LoginIn>({
      query: (credentials) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: any) => {
        return response?.data || response;
      },
      invalidatesTags: ["User", "UserProfile"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data?.accessToken || (data as any)?.access_token;
          const user = data?.user;
          if (token) {
            dispatch(setCredentials({ token, user: user || null }));
            if (!user) {
              dispatch(authApiSlice.endpoints.getMe.initiate());
            }
          }
        } catch {
          // Handled by caller
        }
      },
    }),

    register: builder.mutation<AuthResponseData, RegisterIn>({
      query: (userData) => ({
        url: "/api/v1/auth/register",
        method: "POST",
        body: {
          fullName: (userData.fullName || userData.full_name || "").trim(),
          email: userData.email.trim(),
          password: userData.password,
          ...(userData.phone ? { phone: userData.phone.trim() } : {}),
          role: userData.role || "USER",
          ...(userData.address ? { address: userData.address.trim() } : {}),
        },
      }),
      transformResponse: (response: any) => {
        return response?.data || response;
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data?.accessToken || (data as any)?.access_token;
          const user = data?.user;
          if (token) {
            dispatch(setCredentials({ token, user: user || null }));
          }
        } catch {
          // Handled by caller
        }
      },
    }),

    getMe: builder.query<UserOut, void>({
      query: () => "/api/v1/auth/me",
      transformResponse: (response: any) => {
        return response?.data || response;
      },
      providesTags: ["User", "UserProfile"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setUser(data));
          }
        } catch {
          // Handled by caller
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User", "UserProfile", "AdminUsers"],
      async onQueryStarted(_arg, { dispatch }) {
        dispatch(logOut());
      },
    }),

    checkHealth: builder.query<{ status: string }, void>({
      query: () => "/health",
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,
  useCheckHealthQuery,
} = authApiSlice;
