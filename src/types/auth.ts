export interface UserOut {
  user_id: number | string;
  full_name: string;
  email: string;
  role: string;
  status?: string;
  avatar_url?: string | null;
}

export interface TokenOut {
  access_token: string;
  token_type?: string;
  user?: UserOut;
}

export interface LoginIn {
  email: string;
  password: string;
}

export interface RegisterIn {
  full_name: string;
  email: string;
  password: string;
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
