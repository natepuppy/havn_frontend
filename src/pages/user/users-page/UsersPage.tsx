import {
  useCreateManagedUser,
  useCreateRole,
  useCreateTeam,
  useManagedUsers,
  useResetManagedUserPassword,
  useRoles,
  useTeams,
  useUpdateManagedUser,
} from "@/hooks";
import { useGlobalStore } from "@/stores";
import type { AppUser } from "@/typings";
import { Button, Form, Input, Modal, Select, Table, Tag } from "antd";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

type UserForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  team_ids?: number[];
  password?: string;
  password_confirmation?: string;
};

export function UsersPage() {
  const currentUser = useGlobalStore((state) => state.user);
  const users = useManagedUsers();
  const roles = useRoles();
  const teams = useTeams();
  const createRole = useCreateRole();
  const createTeam = useCreateTeam();
  const createUser = useCreateManagedUser();
  const updateUser = useUpdateManagedUser();
  const resetPassword = useResetManagedUserPassword();
  const [open, setOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [form] = Form.useForm<UserForm>();
  const selectedRole = Form.useWatch("role", form);

  if (!currentUser?.permissions?.manage_users) {
    return <Navigate to="/reps" replace />;
  }

  const roleOptions = (roles.data?.data ?? []).map((role) => ({
    value: role.code,
    label: role.name,
  }));

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (user: AppUser) => {
    setEditing(user);
    form.setFieldsValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone ?? undefined,
      role: user.role,
      team_ids: user.managed_team_ids ?? [],
    });
    setOpen(true);
  };

  const handleFinish = async (values: UserForm) => {
    if (editing) {
      await updateUser.mutateAsync({
        id: editing.id,
        role: values.role,
        ...(values.role === "manager" ? { team_ids: values.team_ids ?? [] } : {}),
      });
      if (values.password) {
        await resetPassword.mutateAsync({
          userId: editing.id,
          password: values.password,
          passwordConfirmation: values.password_confirmation || "",
        });
      }
      toast.success("User updated.");
    } else {
      await createUser.mutateAsync({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim(),
        role: values.role,
        team_ids: values.role === "manager" ? values.team_ids ?? [] : undefined,
        password: values.password || "",
        password_confirmation: values.password_confirmation || "",
      });
      toast.success("User created.");
    }
    setOpen(false);
  };

  const addTeam = async () => {
    const name = teamName.trim();
    if (!name) return;
    const created = await createTeam.mutateAsync(name);
    const current = form.getFieldValue("team_ids") ?? [];
    form.setFieldValue("team_ids", [...current, created.data.id]);
    setTeamName("");
    toast.success("Team added.");
  };

  const addRole = async () => {
    const name = roleName.trim();
    if (!name) return;
    await createRole.mutateAsync(name);
    setRoleName("");
    setRoleOpen(false);
    toast.success("Role created.");
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Accounts that can sign in. Creating a rep also creates a login.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => setRoleOpen(true)}>New role</Button>
          <Button type="primary" onClick={openCreate}>
            Add user
          </Button>
        </div>
      </div>
      <Table<AppUser>
        rowKey="id"
        loading={users.isLoading}
        pagination={false}
        dataSource={users.data?.data ?? []}
        columns={[
          { title: "Name", dataIndex: "full_name" },
          { title: "Email", dataIndex: "email" },
          {
            title: "Role",
            dataIndex: "role",
            render: (role: string) => roleOptions.find((option) => option.value === role)?.label || role,
          },
          {
            title: "Teams",
            render: (_value, user) => {
              if (user.role !== "manager") return "—";
              const names = (user.managed_team_ids ?? [])
                .map((id) => teams.data?.data.find((team) => team.id === id)?.name)
                .filter(Boolean);
              return names.length ? names.join(", ") : "—";
            },
          },
          {
            title: "Status",
            dataIndex: "deleted_at",
            render: (deletedAt: number | null) => (
              <Tag color={deletedAt ? "default" : "green"}>{deletedAt ? "Inactive" : "Active"}</Tag>
            ),
          },
          {
            title: "",
            render: (_value, user) => (
              <div style={{ display: "flex", gap: 8 }}>
                <Button onClick={() => openEdit(user)}>Edit</Button>
                {user.deleted_at ? (
                  <Button onClick={() => void updateUser.mutateAsync({ id: user.id, deleted_at: null }).then(() => toast.success("User restored."))}>
                    Restore
                  </Button>
                ) : (
                  <Button
                    danger
                    disabled={user.id === currentUser.id}
                    onClick={() =>
                      void updateUser
                        .mutateAsync({ id: user.id, deleted_at: "deactivate" })
                        .then(() => toast.success("User deactivated."))
                    }
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />
      <Modal
        title={editing ? "Edit user" : "Add user"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createUser.isPending || updateUser.isPending || resetPassword.isPending}
        destroyOnClose
      >
        <Form<UserForm> form={form} layout="vertical" onFinish={(values) => void handleFinish(values)}>
          <Form.Item label="First name" name="first_name" rules={[{ required: !editing }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item label="Last name" name="last_name" rules={[{ required: !editing }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: !editing, type: "email" }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select options={roleOptions} />
          </Form.Item>
          {selectedRole === "manager" ? (
            <>
              <Form.Item label="Teams they manage" name="team_ids">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select teams"
                  loading={teams.isLoading}
                  options={(teams.data?.data ?? []).map((team) => ({ value: team.id, label: team.name }))}
                />
              </Form.Item>
              <Form.Item label="Add a team">
                <Input
                  value={teamName}
                  placeholder="Team name"
                  onChange={(event) => setTeamName(event.target.value)}
                  onPressEnter={(event) => {
                    event.preventDefault();
                    void addTeam();
                  }}
                  addonAfter={
                    <Button type="link" size="small" loading={createTeam.isPending} onClick={() => void addTeam()}>
                      Add
                    </Button>
                  }
                />
              </Form.Item>
            </>
          ) : null}
          <Form.Item
            label={editing ? "New password" : "Password"}
            name="password"
            rules={editing ? [] : [{ required: true, min: 8, message: "Use at least 8 characters." }]}
          >
            <Input.Password autoComplete="new-password" placeholder={editing ? "Leave blank to keep the current password" : ""} />
          </Form.Item>
          <Form.Item
            label="Confirm password"
            name="password_confirmation"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_rule, value) {
                  const password = getFieldValue("password");
                  if (!password || value === password) return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match."));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="New role"
        open={roleOpen}
        onCancel={() => setRoleOpen(false)}
        onOk={() => void addRole()}
        confirmLoading={createRole.isPending}
        okText="Create role"
      >
        <Input
          value={roleName}
          placeholder="Role name"
          onChange={(event) => setRoleName(event.target.value)}
          onPressEnter={() => void addRole()}
        />
      </Modal>
    </div>
  );
}
