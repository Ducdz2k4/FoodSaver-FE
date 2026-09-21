import { request, setStoredToken, removeStoredToken } from "./apiClient";
import {
  LoginIn,
  RegisterIn,
  TokenOut,
  UserOut,
} from "@/types/auth";

export const authApi = {
  login: async (payload: LoginIn): Promise<TokenOut> => {
    const data = await request<TokenOut>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (data.access_token) {
      setStoredToken(data.access_token);
    }
    return data;
  },

  register: async (payload: RegisterIn): Promise<UserOut> => {
    return request<UserOut>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMe: async (): Promise<UserOut> => {
    return request<UserOut>("/api/v1/auth/me");
  },

  logout: () => {
    removeStoredToken();
  },
};
