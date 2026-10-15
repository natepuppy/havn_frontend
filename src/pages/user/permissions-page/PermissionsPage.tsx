import { useManagedUsers, usePermissions, useRoles, useSavePermissions } from "@/hooks";
import { PERMISSION_ACTIONS } from "@/lib/permissions";
import { useGlobalStore } from "@/stores";
import type { PermissionMap } from "@/typings";
import { Button, Select, Switch, Tabs } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

export function PermissionsPage() {
  const currentUser = useGlobalStore((state) => state.user);
  const roles = useRoles();
  const users = useManagedUsers();
  const savePermissions = useSavePermissions();
  const [tab, setTab] = useState<"role" | "user">("role");
  const [roleId, setRoleId] = useState<number>();
  const [userId, setUserId] = useState<number>();
  const [draft, setDraft] = useState<Partial<Record<keyof PermissionMap, boolean>>>({});

  const selectedUser = (users.data?.data ?? []).find((user) => user.id === userId);
  const inheritedRoleId = tab === "role" ? roleId : selectedUser?.role_id;
  const rolePermissions = usePermissions({ roleId: inheritedRoleId });
  const userPermissions = usePermissions({ userId: tab === "user" ? userId : undefined });

  const roleRows = rolePermissions.data?.data ?? [];
  const userRows = userPermissions.data?.data ?? [];
  const scopeKey = `${tab}:${roleId ?? ""}:${userId ?? ""}:${roleRows.map((row) => `${row.id}:${row.allowed}`).join(",")}:${userRows.map((row) => `${row.id}:${row.allowed}`).join(",")}`;

  useEffect(() => {
    const next: Partial<Record<keyof PermissionMap, boolean>> = {};
    PERMISSION_ACTIONS.forEach((item) => {
      const inherited = roleRows.find((row) => row.action === item.action);
      const override = userRows.find((row) => row.action === item.action);
      next[item.action] = tab === "user" ? (override?.allowed ?? inherited?.allowed ?? false) : (inherited?.allowed ?? false);
    });
    setDraft(next);
    // scopeKey already captures the loaded rows, so this does not reset while a switch is toggled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey]);

  const ready = tab === "role" ? Boolean(roleId) : Boolean(userId);

  const dirty = useMemo(() => {
    return PERMISSION_ACTIONS.some((item) => {
      const inherited = roleRows.find((row) => row.action === item.action);
      const override = userRows.find((row) => row.action === item.action);
      const current = tab === "user" ? (override?.allowed ?? inherited?.allowed ?? false) : (inherited?.allowed ?? false);
      return draft[item.action] !== current;
    });
  }, [draft, roleRows, tab, userRows]);

  if (!currentUser?.permissions?.manage_permissions) {
    return <Navigate to="/reps" replace />;
  }

  const save = async () => {
    const create: Array<{
      action: keyof PermissionMap;
      allowed: boolean;
      description: string;
      role_id?: number;
      user_id?: number;
    }> = [];
    const update: Array<{ id: number; allowed: boolean }> = [];

    PERMISSION_ACTIONS.forEach((item) => {
      const desired = Boolean(draft[item.action]);
      if (tab === "role") {
        const existing = roleRows.find((row) => row.action === item.action);
        if (existing) {
          if (existing.allowed !== desired) update.push({ id: existing.id, allowed: desired });
        } else if (roleId) {
          create.push({ role_id: roleId, action: item.action, allowed: desired, description: item.description });
        }
        return;
      }

      const override = userRows.find((row) => row.action === item.action);
      const inherited = roleRows.find((row) => row.action === item.action);
      if (override) {
        if (override.allowed !== desired) update.push({ id: override.id, allowed: desired });
      } else if (desired !== Boolean(inherited?.allowed) && userId) {
        create.push({ user_id: userId, action: item.action, allowed: desired, description: item.description });
      }
    });

    await savePermissions.mutateAsync({ create, update });
    toast.success("Permissions saved.");
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Permissions</h1>
          <p>Role defaults apply to everyone in that role. A user row overrides the role.</p>
        </div>
        <Button type="primary" disabled={!ready || !dirty} loading={savePermissions.isPending} onClick={() => void save()}>
          Save
        </Button>
      </div>
      <Tabs
        activeKey={tab}
        onChange={(key) => setTab(key as "role" | "user")}
        items={[
          { key: "role", label: "Role" },
          { key: "user", label: "User" },
        ]}
      />
      {tab === "role" ? (
        <Select
          placeholder="Select a role"
          style={{ width: 280 }}
          value={roleId}
          onChange={setRoleId}
          options={(roles.data?.data ?? []).map((role) => ({ value: role.id, label: role.name }))}
        />
      ) : (
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="Select a user"
          style={{ width: 360 }}
          value={userId}
          onChange={setUserId}
          options={(users.data?.data ?? [])
            .filter((user) => !user.deleted_at)
            .map((user) => ({ value: user.id, label: `${user.full_name} · ${user.role}` }))}
        />
      )}
      {ready ? (
        <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
          {PERMISSION_ACTIONS.map((item) => (
            <div
              key={item.action}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                padding: "12px 16px",
                background: "white",
                borderRadius: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{item.label}</div>
                <div style={{ color: "#5d6b64" }}>{item.description}</div>
              </div>
              <Switch
                checked={Boolean(draft[item.action])}
                onChange={(checked) => setDraft((current) => ({ ...current, [item.action]: checked }))}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
