import type { ApiResponse, Team } from "@/typings";
import { api } from "./base.api";

export const getTeams = async () => {
  const response = await api.get<ApiResponse<Team[]>>("/teams");
  return response.data;
};

export const createTeam = async (name: string) => {
  const response = await api.post<ApiResponse<Team>>("/teams", { team: { name } });
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};
