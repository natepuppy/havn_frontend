import type { ApiResponse, Market } from "@/typings";
import { api } from "./base.api";

export const getMarkets = async () => {
  const response = await api.get<ApiResponse<Market[]>>("/markets");
  return response.data;
};

export const deleteMarket = async (id: number) => {
  const response = await api.delete<ApiResponse<Market[]>>("/markets", {
    params: { ids: JSON.stringify([id]) },
  });
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};

export const createMarket = async (name: string) => {
  const response = await api.post<ApiResponse<Market[]>>("/markets", {
    markets: [{ name }],
  });
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};
