"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserOut, LoginIn, RegisterIn, TokenOut } from "@/types/auth";
import {
  useLoginMutation,
  useRegisterMutation,
  useLazyGetMeQuery,
  useLogoutMutation,
} from "@/redux/api/authApi";
import {
  selectCurrentUser,
  selectCurrentToken,
  selectIsAuthenticated,
  setUser,
  logOut,
} from "@/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

interface AuthContextType {
  user: UserOut | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginIn) => Promise<TokenOut>;
  register: (payload: RegisterIn) => Promise<UserOut>;
  updateUserLocal: (updated: Partial<UserOut>) => void;
  logout: () => void;
  refreshUser: () => Promise<UserOut | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const token = useAppSelector(selectCurrentToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [triggerGetMe, { isFetching: isFetchingMe }] = useLazyGetMeQuery();
  const [logoutMutation] = useLogoutMutation();

  const [initialLoading, setInitialLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<UserOut | null> => {
    const storedToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

    if (!storedToken) {
      setInitialLoading(false);
      return null;
    }

    // Nếu là mock token của DevRoleSwitcher -> không gọi BE /auth/me để tránh bị 401 rồi tự logout
    if (storedToken.startsWith("mock-")) {
      setInitialLoading(false);
      return user;
    }

    try {
      const profile = await triggerGetMe().unwrap();
      dispatch(setUser(profile));
      return profile;
    } catch {
      dispatch(logOut());
      return null;
    } finally {
      setInitialLoading(false);
    }
  }, [token, triggerGetMe, dispatch, user]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (payload: LoginIn): Promise<TokenOut> => {
    const res = await loginMutation(payload).unwrap();
    const accessToken = res.accessToken || (res as any).access_token;
    const userData = res.user;
    if (accessToken && !userData) {
      try {
        await triggerGetMe().unwrap();
      } catch {
        // Ignored
      }
    }
    return {
      access_token: accessToken,
      accessToken,
      user: userData || undefined,
    };
  };

  const register = async (payload: RegisterIn): Promise<UserOut> => {
    const res = await registerMutation(payload).unwrap();
    return res.user;
  };

  const updateUserLocal = (updated: Partial<UserOut>) => {
    if (user) {
      dispatch(setUser({ ...user, ...updated }));
    }
  };

  const logout = () => {
    logoutMutation().catch(() => {});
    dispatch(logOut());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: initialLoading || isFetchingMe,
        isAuthenticated,
        login,
        register,
        updateUserLocal,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
