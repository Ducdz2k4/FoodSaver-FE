"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { UserOut, LoginIn, RegisterIn, TokenOut, PartnerCapability } from "@/types/auth";
import {
  useLoginMutation,
  useGoogleLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useSetPasswordMutation,
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
  role: string | null;
  partnerCapability: PartnerCapability;
  isAdmin: boolean;
  isPartner: boolean;
  isPendingPartner: boolean;
  isRejectedPartner: boolean;
  isCustomer: boolean;
  hasRole: (...roles: string[]) => boolean;
  hasCapability: (...capabilities: PartnerCapability[]) => boolean;
  login: (payload: LoginIn) => Promise<TokenOut>;
  googleLogin: (idToken: string) => Promise<TokenOut>;
  register: (payload: RegisterIn) => Promise<TokenOut>;
  verifyOtp: (code: string) => Promise<UserOut | null>;
  resendOtp: () => Promise<void>;
  setPassword: (password: string) => Promise<void>;
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
  const [googleLoginMutation] = useGoogleLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [verifyOtpMutation] = useVerifyOtpMutation();
  const [resendOtpMutation] = useResendOtpMutation();
  const [setPasswordMutation] = useSetPasswordMutation();
  const [triggerGetMe] = useLazyGetMeQuery();
  const [logoutMutation] = useLogoutMutation();

  const [initialLoading, setInitialLoading] = useState(true);
  const hasInitializedRef = useRef(false);

  const role = useMemo(() => user?.role?.toUpperCase() || null, [user?.role]);
  const partnerCapability: PartnerCapability = useMemo(
    () => user?.partnerCapability || "NONE",
    [user?.partnerCapability]
  );
  const isAdmin = useMemo(() => role === "ADMIN" || role === "SYS_ADMIN", [role]);
  const isPartner = useMemo(() => partnerCapability === "VERIFIED", [partnerCapability]);
  const isPendingPartner = useMemo(() => partnerCapability === "PENDING", [partnerCapability]);
  const isRejectedPartner = useMemo(() => partnerCapability === "REJECTED", [partnerCapability]);
  const isCustomer = useMemo(() => isAuthenticated && !isAdmin, [isAuthenticated, isAdmin]);

  const hasRole = useCallback(
    (...roles: string[]) => Boolean(role && roles.map((value) => value.toUpperCase()).includes(role)),
    [role]
  );

  const hasCapability = useCallback(
    (...capabilities: PartnerCapability[]) => capabilities.includes(partnerCapability),
    [partnerCapability]
  );

  const refreshUser = useCallback(async (): Promise<UserOut | null> => {
    const storedToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

    if (!storedToken) {
      setInitialLoading(false);
      return null;
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
  }, [token, triggerGetMe, dispatch]);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      refreshUser();
    }
  }, [refreshUser]);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const toTokenOut = (response: { accessToken?: string; access_token?: string; user?: UserOut; requireOtp?: boolean; requirePassword?: boolean }): TokenOut => ({
    access_token: response.accessToken || response.access_token,
    accessToken: response.accessToken || response.access_token,
    user: response.user,
    requireOtp: response.requireOtp,
    requirePassword: response.requirePassword,
  });

  const login = async (payload: LoginIn): Promise<TokenOut> => {
    const response = await loginMutation(payload).unwrap();
    return toTokenOut(response);
  };

  const googleLogin = async (idToken: string): Promise<TokenOut> => {
    const response = await googleLoginMutation({ idToken }).unwrap();
    return toTokenOut(response);
  };

  const register = async (payload: RegisterIn): Promise<TokenOut> => {
    const response = await registerMutation(payload).unwrap();
    return toTokenOut(response);
  };

  const verifyOtp = async (code: string): Promise<UserOut | null> => {
    const response = await verifyOtpMutation({ code }).unwrap();
    if (response.user) dispatch(setUser(response.user));
    return response.user || null;
  };

  const resendOtp = async (): Promise<void> => {
    await resendOtpMutation().unwrap();
  };

  const setPassword = async (password: string): Promise<void> => {
    await setPasswordMutation({ password }).unwrap();
  };

  const updateUserLocal = (updated: Partial<UserOut>) => {
    if (user) dispatch(setUser({ ...user, ...updated }));
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
        googleLogin,
        register,
        verifyOtp,
        resendOtp,
        setPassword,
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
