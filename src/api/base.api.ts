import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { apiBaseUrl } from "@/config/env";
import { getStorageItem } from "@/utils/safeStorage";
import { logout, verifyToken } from "./auth.api";

export const api = axios.create({
  baseURL: apiBaseUrl,
});

let isVerifyingToken = false;
let tokenVerificationPromise: Promise<void> | null = null;

api.interceptors.request.use((config) => {
  const token = getStorageItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const handleError = (status: number | undefined, msg: string) => {
  const appToastId = `${status}-${msg}`;
  if (!toast.isActive(appToastId)) {
    toast.error(`${status ?? "Error"}: ${msg}`, { toastId: appToastId });
  }
};

api.interceptors.response.use(
  (response) => {
    const errors = response.data?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      errors.forEach((msg: string) => handleError(response.status, msg));
    }
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const errors = (error.response?.data as { errors?: string[] } | undefined)?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      errors.forEach((msg) => handleError(status, msg));
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (originalRequest?.url?.includes("/users/verify_token")) {
      return Promise.reject(error);
    }

    if (status === 401 && originalRequest && !originalRequest._retry) {
      const token = getStorageItem("token");
      if (!token) return Promise.reject(error);

      originalRequest._retry = true;
      if (!isVerifyingToken) {
        isVerifyingToken = true;
        tokenVerificationPromise = verifyToken()
          .then(() => undefined)
          .catch(async (verifyError) => {
            await logout();
            throw verifyError;
          })
          .finally(() => {
            isVerifyingToken = false;
            tokenVerificationPromise = null;
          });
      }

      try {
        await tokenVerificationPromise;
        return api(originalRequest);
      } catch (verifyError) {
        return Promise.reject(verifyError);
      }
    }

    return Promise.reject(error);
  },
);
