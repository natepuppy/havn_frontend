import type { ApiResponse, AppUser } from "@/typings";
import { api } from "./base.api";

export const getRecruiters = async () => {
  const response = await api.get<ApiResponse<AppUser[]>>("/recruiters");
  return response.data;
};
