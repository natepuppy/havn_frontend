import type { ApiResponse, AppUser } from "@/typings";
import { removeStorageItem, setStorageItem } from "@/utils/safeStorage";
import { authApi } from "./base-auth.api";

type SignInResponse = {
  token: string;
  data: AppUser;
  status: { code: number; message: string };
};

export const signIn = async (email: string, password: string) => {
  const response = await authApi.post<SignInResponse>("/users/sign_in", {
    user: { email, password },
  });
  setStorageItem("token", response.data.token);
  authApi.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
  return response.data;
};

export const verifyToken = async () => {
  const response = await authApi.post("/users/verify_token");
  return response.data;
};

export const logout = async () => {
  removeStorageItem("token");
  removeStorageItem("user");
  delete authApi.defaults.headers.common.Authorization;
  window.location.assign("/login");
};

export const getCurrentUser = async () => {
  const response = await authApi.get<ApiResponse<AppUser>>("/users/me");
  return response.data;
};

export const sendResetLink = async (email: string) => {
  const response = await authApi.post<{ message?: string; errors?: string[] }>("/users/password", {
    user: { email },
  });
  return response.data;
};

export const resetPassword = async (
  password: string,
  passwordConfirmation: string,
  resetPasswordToken: string,
) => {
  const response = await authApi.put<{ message?: string; errors?: string[] }>("/users/password", {
    user: {
      password,
      password_confirmation: passwordConfirmation,
      reset_password_token: resetPasswordToken,
    },
  });
  return response.data;
};
