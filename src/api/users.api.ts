import type { ApiResponse, AppUser } from "@/typings";
import { api } from "./base.api";

export type NewManagedUser = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  password: string;
  password_confirmation: string;
  team_ids?: number[];
};

export const getManagedUsers = async () => {
  const response = await api.get<ApiResponse<AppUser[]>>("/managed_users");
  return response.data;
};

export const createManagedUser = async (user: NewManagedUser) => {
  const response = await api.post<ApiResponse<AppUser[]>>("/managed_users", { users: [user] });
  if (response.data.errors?.length) throw new Error(response.data.errors.join(", "));
  return response.data;
};

export const updateManagedUser = async (user: {
  id: number;
  role?: string;
  deleted_at?: string | null;
  team_ids?: number[];
}) => {
  const response = await api.put<ApiResponse<AppUser>>("/managed_users", { users: [user] });
  if (response.data.errors?.length) throw new Error(response.data.errors.join(", "));
  return response.data;
};

export const resetManagedUserPassword = async (params: {
  userId: number;
  password: string;
  passwordConfirmation: string;
}) => {
  const response = await api.post<{ message: string; errors?: string[] }>("/managed_users/reset_password", {
    user_id: params.userId,
    password: params.password,
    password_confirmation: params.passwordConfirmation,
  });
  if (response.data.errors?.length) throw new Error(response.data.errors.join(", "));
  return response.data;
};
