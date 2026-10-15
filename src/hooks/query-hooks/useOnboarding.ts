import {
  createDocument,
  createMarket,
  createRole,
  createTeam,
  deleteDocument,
  createManagedUser,
  createPermissions,
  createRep,
  getDocuments,
  getMarkets,
  getManagedUsers,
  getPermissions,
  getRecruiters,
  getRecruitingTree,
  getRep,
  getReps,
  getRoles,
  getTeams,
  resetManagedUserPassword,
  sendRepDocuments,
  updateDocument,
  updateManagedUser,
  updatePermissions,
  updateRep,
} from "@/api";
import { QueryKeys } from "@/config";
import type { RepFilters } from "@/api/reps.api";
import type { NewManagedUser } from "@/api/users.api";
import type { NewRepInput, OnboardingDocument, Permission } from "@/typings";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useReps(filters: RepFilters = {}) {
  return useQuery({
    queryKey: [QueryKeys.REPS, filters],
    queryFn: () => getReps(filters),
    placeholderData: keepPreviousData,
  });
}

export function useRep(id: string | undefined) {
  return useQuery({
    queryKey: [QueryKeys.REP, id],
    queryFn: () => getRep(id!),
    enabled: Boolean(id),
  });
}

export function useRecruitingTree(id: string | undefined) {
  return useQuery({
    queryKey: [QueryKeys.REP, id, "tree"],
    queryFn: () => getRecruitingTree(id!),
    enabled: Boolean(id),
  });
}

export function useCreateRep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rep: NewRepInput) => createRep(rep),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.REPS] });
    },
  });
}

export function useSendRepDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sendRepDocuments(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.REPS] });
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.REP, String(id)] });
    },
  });
}

export function useDocuments() {
  return useQuery({
    queryKey: [QueryKeys.DOCUMENTS],
    queryFn: getDocuments,
  });
}

export function useMarkets() {
  return useQuery({
    queryKey: [QueryKeys.MARKETS],
    queryFn: getMarkets,
  });
}

export function useCreateMarket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createMarket(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.MARKETS] });
    },
  });
}

export function useRecruiters() {
  return useQuery({
    queryKey: [QueryKeys.RECRUITERS],
    queryFn: getRecruiters,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (document: Pick<OnboardingDocument, "name" | "description" | "body" | "active" | "send_by_default" | "required">) =>
      createDocument(document),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENTS] });
    },
  });
}

export function useManagedUsers() {
  return useQuery({
    queryKey: [QueryKeys.USERS],
    queryFn: getManagedUsers,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: [QueryKeys.ROLES],
    queryFn: getRoles,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createRole(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.ROLES] });
    },
  });
}

export function useTeams() {
  return useQuery({
    queryKey: [QueryKeys.TEAMS],
    queryFn: getTeams,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createTeam(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.TEAMS] });
    },
  });
}

export function useUpdateRep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRep,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.REPS] });
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.REP, String(variables.id)] });
    },
  });
}

export function usePermissions(scope: { roleId?: number; userId?: number }) {
  return useQuery({
    queryKey: [QueryKeys.PERMISSIONS, scope],
    queryFn: () => getPermissions(scope),
    enabled: Boolean(scope.roleId || scope.userId),
  });
}

export function useCreateManagedUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: NewManagedUser) => createManagedUser(user),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.RECRUITERS] });
    },
  });
}

export function useUpdateManagedUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: { id: number; role?: string; deleted_at?: string | null; team_ids?: number[] }) =>
      updateManagedUser(user),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
    },
  });
}

export function useResetManagedUserPassword() {
  return useMutation({
    mutationFn: resetManagedUserPassword,
  });
}

export function useSavePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (changes: {
      create: Array<Pick<Permission, "action" | "allowed" | "description"> & { role_id?: number; user_id?: number }>;
      update: Array<Pick<Permission, "id" | "allowed">>;
    }) => {
      if (changes.update.length) await updatePermissions(changes.update);
      if (changes.create.length) await createPermissions(changes.create);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.PERMISSIONS] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENTS] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (document: Partial<OnboardingDocument> & { id: number }) =>
      updateDocument(document),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.DOCUMENTS] });
    },
  });
}
