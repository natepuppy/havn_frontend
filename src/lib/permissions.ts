import type { PermissionMap } from "@/typings";

export const PERMISSION_ACTIONS: Array<{ action: keyof PermissionMap; label: string; description: string }> = [
  { action: "view_reps", label: "View reps", description: "See the reps list." },
  {
    action: "view_all_reps",
    label: "View all reps",
    description: "See every rep. Without this, a person only sees the reps they recruited.",
  },
  { action: "manage_reps", label: "Manage reps", description: "Onboard a rep and send their documents." },
  { action: "manage_documents", label: "Manage documents", description: "Add documents and turn them on or off." },
  {
    action: "manage_users",
    label: "Manage users",
    description: "Create users, change roles, deactivate accounts, and reset passwords.",
  },
  {
    action: "manage_permissions",
    label: "Manage permissions",
    description: "Change what each role and user is allowed to do.",
  },
];

export function can(permissions: PermissionMap | undefined, action: keyof PermissionMap) {
  return Boolean(permissions?.[action]);
}
