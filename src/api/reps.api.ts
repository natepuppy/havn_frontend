import type { ApiResponse, NewRepInput, RecruitingNode, Rep } from "@/typings";
import { api } from "./base.api";

export type RepFilters = {
  q?: string;
  recruitedByIds?: number[];
  markets?: string[];
  active?: "true" | "false" | "all";
  paperwork?: "none" | "sent" | "agreement" | "completed";
  role?: string;
};

export const getReps = async (filters: RepFilters = {}) => {
  const response = await api.get<ApiResponse<Rep[]>>("/reps", {
    params: {
      q: filters.q || undefined,
      recruited_by_id: filters.recruitedByIds?.length ? filters.recruitedByIds : undefined,
      market: filters.markets?.length ? filters.markets : undefined,
      active: filters.active || "true",
      paperwork: filters.paperwork || undefined,
      role: filters.role || undefined,
    },
  });
  return response.data;
};

export const getRep = async (id: string) => {
  const response = await api.get<ApiResponse<Rep>>(`/reps/${id}`);
  return response.data;
};

export const createRep = async (rep: NewRepInput) => {
  const response = await api.post<ApiResponse<Rep[]>>("/reps", { reps: [rep] });
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};

export const getRecruitingTree = async (id: string) => {
  const response = await api.get<ApiResponse<RecruitingNode[]>>(`/reps/${id}/recruiting_tree`);
  return response.data;
};

export const updateRep = async (rep: { id: number; active?: boolean; onboarding_completed?: boolean }) => {
  const response = await api.put<ApiResponse<Rep[]>>("/reps", { reps: [rep] });
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};

export const sendRepDocuments = async (id: number) => {
  const response = await api.post<ApiResponse<Rep>>(`/reps/${id}/send_documents`);
  return response.data;
};
