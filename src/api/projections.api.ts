import type { ApiResponse } from "@/typings";
import { api } from "./base.api";

export type ProjectionRep = {
  id: number;
  full_name: string;
  level: string | null;
  active: boolean;
  last_year_revenue: number | null;
  projected_revenue: number | null;
  finish_rate: number | null;
  adjusted_projected_revenue: number | null;
};

export type FinishRate = {
  level: string;
  finish_rate: number;
};

export type Projections = {
  finish_rates: FinishRate[];
  reps: ProjectionRep[];
};

export type ProjectionInput = {
  finish_rates: FinishRate[];
  reps: { id: number; last_year_revenue: number | null; projected_revenue: number | null }[];
};

export const getProjections = async () => {
  const response = await api.get<ApiResponse<Projections>>("/projections");
  return response.data;
};

export const updateProjections = async (projections: ProjectionInput) => {
  const response = await api.put<ApiResponse<Projections>>("/projections", projections);
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};
