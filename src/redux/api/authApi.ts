import { baseApi } from "./baseApi";
import {
  RegisterIn,
  LoginIn,
  GoogleLoginIn,
  AuthResponseData,
  UserOut,
  VerifyOtpIn,
  SetPasswordIn,
  MessageOut,
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
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: ["User", "UserProfile"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data?.accessToken || data?.access_token;
          if (token) {
            dispatch(setCredentials({ token, user: data?.user || null }));
          }
        } catch {
          // Handled by caller
        }
      },
    }),

    googleLogin: builder.mutation<AuthResponseData, GoogleLoginIn>({
      query: (body) => ({
        url: "/api/v1/auth/google",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: ["User", "UserProfile"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data?.accessToken || data?.access_token;
          if (token) {
            dispatch(setCredentials({ token, user: data?.user || null }));
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
          ...(userData.address ? { address: userData.address.trim() } : {}),
        },
      }),
      transformResponse: (response: any) => response?.data || response,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data?.accessToken || data?.access_token;
          if (token) {
            dispatch(setCredentials({ token, user: data?.user || null }));
          }
        } catch {
          // Handled by caller
        }
      },
    }),

    verifyOtp: builder.mutation<{ user?: UserOut; message: string }, VerifyOtpIn>({
      query: (body) => ({
        url: "/api/v1/auth/verify-otp",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: ["User", "UserProfile"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) dispatch(setUser(data.user));
        } catch {
          // Handled by caller
        }
      },
    }),

    resendOtp: builder.mutation<MessageOut, void>({
      query: () => ({
        url: "/api/v1/auth/resend-otp",
        method: "POST",
      }),
      transformResponse: (response: any) => response?.data || response,
    }),

    setPassword: builder.mutation<MessageOut, SetPasswordIn>({
      query: (body) => ({
        url: "/api/v1/auth/set-password",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: ["User", "UserProfile"],
    }),

    getMe: builder.query<UserOut, void>({
      query: () => "/api/v1/auth/me",
      transformResponse: (response: any) => response?.data || response,
      providesTags: ["User", "UserProfile"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) dispatch(setUser(data));
        } catch {
          // Handled by caller
        }
      },
    }),

    updateProfile: builder.mutation<UserOut, { fullName?: string; phone?: string; address?: string; bio?: string; avatar?: string }>({
      query: (body) => ({
        url: "/api/v1/auth/profile",
        method: "PUT",
        body,
      }),
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: ["User", "UserProfile"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) dispatch(setUser(data));
        } catch {
          // Handled by caller
        }
      },
    }),

    changePassword: builder.mutation<MessageOut, { oldPassword: string; newPassword: string }>({
      query: (body) => ({
        url: "/api/v1/auth/change-password",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response?.data || response,
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

    checkHealth: builder.query<{ status: string; uptime: number; timestamp: string }, void>({
      query: () => "/health",
      providesTags: ["SystemHealth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useGoogleLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useSetPasswordMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useCheckHealthQuery,
} = authApiSlice;
