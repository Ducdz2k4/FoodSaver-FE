import { request } from "../apiClient";
import {
  AdminUser,
  ListUsersQuery,
  ListUsersResponse,
  SingleUserResponse,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UpdateUserRolePayload,
} from "@/types/admin";

export const adminUserService = {
  getAllUsers(params?: ListUsersQuery): Promise<ListUsersResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.role && params.role !== "ALL") searchParams.set("role", params.role);
    if (params?.status && params.status !== "ALL") searchParams.set("status", params.status);

    const query = searchParams.toString();
    return request<ListUsersResponse>(`/api/v1/users${query ? `?${query}` : ""}`);
  },

  getUserById(id: string): Promise<SingleUserResponse> {
    return request<SingleUserResponse>(`/api/v1/users/${id}`);
  },

  createUser(payload: CreateUserPayload): Promise<SingleUserResponse> {
    return request<SingleUserResponse>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateUser({ id, ...payload }: UpdateUserPayload): Promise<SingleUserResponse> {
    return request<SingleUserResponse>(`/api/v1/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  updateStatus({ id, status }: UpdateUserStatusPayload): Promise<SingleUserResponse> {
    return request<SingleUserResponse>(`/api/v1/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  updateRole({ id, role }: UpdateUserRolePayload): Promise<SingleUserResponse> {
    return request<SingleUserResponse>(`/api/v1/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  deleteUser(id: string): Promise<{ success: boolean; message: string; data: { id: string } }> {
    return request<{ success: boolean; message: string; data: { id: string } }>(
      `/api/v1/users/${id}`,
      { method: "DELETE" }
    );
  },
};
