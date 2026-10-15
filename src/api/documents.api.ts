import type { ApiResponse, OnboardingDocument } from "@/typings";
import { api } from "./base.api";

export const getDocuments = async () => {
  const response = await api.get<ApiResponse<OnboardingDocument[]>>("/onboarding_documents");
  return response.data;
};

export const createDocument = async (
  document: Pick<OnboardingDocument, "name" | "description" | "body" | "active" | "send_by_default" | "required">,
) => {
  const response = await api.post<ApiResponse<OnboardingDocument[]>>("/onboarding_documents", {
    onboarding_documents: [document],
  });
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};

export const updateDocument = async (document: Partial<OnboardingDocument> & { id: number }) => {
  const response = await api.put<ApiResponse<OnboardingDocument[]>>("/onboarding_documents", {
    onboarding_documents: [document],
  });
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};

export const deleteDocument = async (id: number) => {
  const response = await api.delete<ApiResponse<OnboardingDocument[]>>("/onboarding_documents", {
    params: { ids: JSON.stringify([id]) },
  });
  if (response.data.errors?.length) {
    throw new Error(response.data.errors.join(", "));
  }
  return response.data;
};
