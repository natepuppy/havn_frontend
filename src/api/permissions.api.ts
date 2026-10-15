import type { ApiResponse, Permission } from "@/typings";
import { api } from "./base.api";

export const getPermissions = async (scope: { roleId?: number; userId?: number }) => {
  const response = await api.get<ApiResponse<Permission[]>>("/permissions", {
    params: {
      role_id: scope.roleId,
      user_id: scope.userId,
    },
  });
  return response.data;
};

export const createPermissions = async (
  permissions: Array<Pick<Permission, "action" | "allowed" | "description"> & { role_id?: number; user_id?: number }>,
) => {
  const response = await api.post<ApiResponse<Permission[]>>("/permissions", { permissions });
  if (response.data.errors?.length) throw new Error(response.data.errors.join(", "));
  return response.data;
};

export const updatePermissions = async (
  permissions: Array<Pick<Permission, "id" | "allowed">>,
) => {
  const response = await api.put<ApiResponse<Permission[]>>("/permissions", { permissions });
  if (response.data.errors?.length) throw new Error(response.data.errors.join(", "));
  return response.data;
};
