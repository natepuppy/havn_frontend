import type { ApiResponse } from "@/typings";
import { api } from "./base.api";

export type RecruitingGoalWeek = {
  id: number;
  week_number: number;
  starts_on: string;
  ends_on: string;
  projected_revenue: number | null;
  expenses: number | null;
  percent_to_goal: number | null;
  percent_into_season: number | null;
  calculated_percent_to_goal: number | null;
  calculated_percent_into_season: number | null;
  percent_to_goal_override: number | null;
  percent_into_season_override: number | null;
};

export type RecruitingGoalPeriod = {
  expenses: number;
  projected_revenue: number | null;
  percent_to_goal: number | null;
};

export type RecruitingGoals = {
  revenue_goal: number;
  season_start: string;
  season_end: string;
  total_weeks: number;
  current_projected_revenue: number;
  weeks: RecruitingGoalWeek[];
  totals: {
    previous_30_days: RecruitingGoalPeriod;
    previous_12_months: RecruitingGoalPeriod;
  };
};

export type RecruitingGoalInput = {
  revenue_goal: number;
  weeks: {
    week_number: number;
    projected_revenue: number | null;
    expenses: number | null;
    percent_to_goal_override: number | null;
    percent_into_season_override: number | null;
  }[];
};

export const getRecruitingGoals = async () => {
  const response = await api.get<ApiResponse<RecruitingGoals>>("/recruiting_goals");
  return response.data;
};

export const updateRecruitingGoals = async (goals: RecruitingGoalInput) => {
  const response = await api.put<ApiResponse<RecruitingGoals>>("/recruiting_goals", goals);
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};
