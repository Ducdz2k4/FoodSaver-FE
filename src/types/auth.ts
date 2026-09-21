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
}

export interface AuthResponseData {
  user: UserOut;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string;
}

export interface TokenOut {
  access_token?: string;
  accessToken?: string;
  token_type?: string;
  user?: UserOut;
}

export interface LoginIn {
  email: string;
  password: string;
}

export interface RegisterIn {
  fullName?: string;
  full_name?: string;
  email: string;
  password: string;
  phone?: string;
  role?: "USER" | "PARTNER";
  address?: string;
}

export interface MessageOut {
  message: string;
}

export interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiErrorResponse {
  detail?: string | ValidationErrorItem[];
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}
