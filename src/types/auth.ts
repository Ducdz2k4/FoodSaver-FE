export type PartnerCapability = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface UserOut {
  id?: string;
  user_id?: number | string;
  fullName?: string;
  full_name?: string;
  email: string;
  role: string;
  status?: string;
  phone?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  address?: string | null;
  bio?: string | null;
  googleId?: string | null;
  emailVerified?: boolean;
  partnerCapability?: PartnerCapability;
  partnerProfileId?: string;
}

export interface AuthResponseData {
  user: UserOut;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string;
  requireOtp?: boolean;
  requirePassword?: boolean;
}

export interface TokenOut {
  access_token?: string;
  accessToken?: string;
  token_type?: string;
  user?: UserOut;
  requireOtp?: boolean;
  requirePassword?: boolean;
}

export interface LoginIn {
  email: string;
  password: string;
}

export interface GoogleLoginIn {
  idToken: string;
}

export interface RegisterIn {
  fullName?: string;
  full_name?: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface VerifyOtpIn {
  code: string;
}

export interface SetPasswordIn {
  password: string;
}

export interface MessageOut {
  message: string;
}