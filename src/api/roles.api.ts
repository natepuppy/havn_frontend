import type { ApiResponse, Role } from "@/typings";
import { api } from "./base.api";

export const getRoles = async () => {
  const response = await api.get<ApiResponse<Role[]>>("/roles");
  return response.data;
};

export const createRole = async (name: string) => {
  const response = await api.post<ApiResponse<Role>>("/roles", { role: { name } });
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};

export const updateRole = async (role: { id: number; name: string }) => {
  const response = await api.put<ApiResponse<Role>>("/roles", { role });
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};
