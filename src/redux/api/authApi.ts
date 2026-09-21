import { baseApi } from "./baseApi";
import {
  RegisterIn,
  LoginIn,
  TokenOut,
  UserOut,
} from "@/types/auth";
import { setCredentials, setUser } from "@/redux/slices/authSlice";

export const authApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TokenOut, LoginIn>({
      query: (credentials) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.access_token) {
            dispatch(setCredentials({ token: data.access_token }));
            dispatch(authApiSlice.endpoints.getMe.initiate());
          }
        } catch {
          // Handled by caller
        }
      },
    }),

    register: builder.mutation<UserOut, RegisterIn>({
      query: (userData) => ({
        url: "/api/v1/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    getMe: builder.query<UserOut, void>({
      query: () => "/api/v1/auth/me",
      providesTags: ["User"],
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
  useCheckHealthQuery,
} = authApiSlice;
