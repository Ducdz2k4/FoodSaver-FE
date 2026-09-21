export type UserRole = "USER" | "PARTNER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  address: string | null;
  bio: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "ALL";
  status?: UserStatus | "ALL";
}

export interface ListUsersResponse {
  success: boolean;
  message: string;
  data: AdminUser[];
  meta: PaginationMeta;
}

export interface SingleUserResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  address?: string;
}

export interface UpdateUserPayload {
  id: string;
  fullName?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserStatusPayload {
  id: string;
  status: UserStatus;
}

export interface UpdateUserRolePayload {
  id: string;
  role: UserRole;
}
