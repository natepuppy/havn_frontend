import axios from "axios";
import { authApiBaseUrl } from "@/config/env";
import { getStorageItem } from "@/utils/safeStorage";

export const authApi = axios.create({
  baseURL: authApiBaseUrl,
});

authApi.interceptors.request.use((config) => {
  const token = getStorageItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
