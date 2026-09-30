"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { UserOut, LoginIn, RegisterIn, TokenOut, PartnerCapability } from "@/types/auth";
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

  // Role & Capability Detection Helpers
  role: string | null;
  partnerCapability: PartnerCapability;
  isAdmin: boolean;
  isPartner: boolean;
  isPendingPartner: boolean;
  isRejectedPartner: boolean;
  isCustomer: boolean;
  hasRole: (...roles: string[]) => boolean;
  hasCapability: (...capabilities: PartnerCapability[]) => boolean;

  // Actions
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
  const [triggerGetMe] = useLazyGetMeQuery();
  const [logoutMutation] = useLogoutMutation();

  const [initialLoading, setInitialLoading] = useState(true);
  const hasInitializedRef = useRef(false);

  // Computed Role & Capability Detection
  const role = useMemo(() => user?.role?.toUpperCase() || null, [user?.role]);

  const partnerCapability: PartnerCapability = useMemo(
    () => user?.partnerCapability || "NONE",
    [user?.partnerCapability]
  );

  const isAdmin = useMemo(
    () => role === "ADMIN" || role === "SYS_ADMIN",
    [role]
  );

  const isPartner = useMemo(
    () => partnerCapability === "VERIFIED",
    [partnerCapability]
  );

  const isPendingPartner = useMemo(
    () => partnerCapability === "PENDING",
    [partnerCapability]
  );

  const isRejectedPartner = useMemo(
    () => partnerCapability === "REJECTED",
    [partnerCapability]
  );

  const isCustomer = useMemo(
    () => isAuthenticated && !isAdmin,
    [isAuthenticated, isAdmin]
  );

  const hasRole = useCallback(
    (...roles: string[]) => {
      if (!role) return false;
      return roles.map((r) => r.toUpperCase()).includes(role);
    },
    [role]
  );

  const hasCapability = useCallback(
    (...capabilities: PartnerCapability[]) => {
      return capabilities.includes(partnerCapability);
    },
    [partnerCapability]
  );

  const refreshUser = useCallback(async (): Promise<UserOut | null> => {
    const storedToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

    if (!storedToken) {
      setInitialLoading(false);
      return null;
    }

    // Skip remote check if using mock token
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
  }, [token, triggerGetMe, dispatch]); // user is intentionally omitted from dependencies to avoid infinite loop

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      refreshUser();
    }
  }, [refreshUser]);

  // Safety fallback: if initialLoading takes more than 3s, force release
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

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
        isLoading: initialLoading,
        isAuthenticated,
        role,
        partnerCapability,
        isAdmin,
        isPartner,
        isPendingPartner,
        isRejectedPartner,
        isCustomer,
        hasRole,
        hasCapability,
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
