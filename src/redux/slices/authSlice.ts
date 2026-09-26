import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserOut } from "@/types/auth";

interface AuthState {
  user: UserOut | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getInitialToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getInitialUser = (): UserOut | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("mock_user");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  isLoading: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user?: UserOut | null; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.token = token;
      state.isAuthenticated = true;
      if (user) {
        state.user = user;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        if (user) {
          localStorage.setItem("mock_user", JSON.stringify(user));
        }
        document.cookie = `token=${encodeURIComponent(
          token
        )}; path=/; max-age=604800; SameSite=Lax`;
      }
    },
    setUser: (state, action: PayloadAction<UserOut | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (typeof window !== "undefined" && action.payload) {
        localStorage.setItem("mock_user", JSON.stringify(action.payload));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("mock_user");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    },
  },
});

export const { setCredentials, setUser, setLoading, logOut } = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

export default authSlice.reducer;
