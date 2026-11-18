import { useCreateRole, useRoles, useUpdateRole } from "@/hooks";
import { can } from "@/lib/permissions";
import { useGlobalStore } from "@/stores";
import type { Role } from "@/typings";
import { Button, Form, Input, Modal, Table } from "antd";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

export function RolesPage() {
  const user = useGlobalStore((state) => state.user);
  const roles = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form] = Form.useForm<{ name: string }>();
  const [createForm] = Form.useForm<{ name: string }>();

  if (!can(user?.permissions, "manage_users")) {
    return <Navigate to="/reps" replace />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Roles</h1>
          <p>Add a role or rename one. The name is what people see. Permissions stay on the same role.</p>
        </div>
        <Button type="primary" onClick={() => setCreating(true)}>
          New role
        </Button>
      </div>
      <Table<Role>
        rowKey="id"
        loading={roles.isLoading}
        pagination={false}
        dataSource={roles.data?.data ?? []}
        columns={[
          { title: "Name", dataIndex: "name" },
          {
            title: "",
            width: 96,
            render: (_value: unknown, role) => (
              <Button
                type="link"
                onClick={() => {
                  setEditing(role);
                  form.setFieldsValue({ name: role.name });
                }}
              >
                Edit
              </Button>
            ),
          },
        ]}
      />
      <Modal
        title="New role"
        open={creating}
        forceRender
        onCancel={() => setCreating(false)}
        afterOpenChange={(open) => {
          if (open) createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        confirmLoading={createRole.isPending}
        okText="Create role"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(values) => {
            void createRole
              .mutateAsync(values.name.trim())
              .then(() => {
                toast.success("Role created.");
                setCreating(false);
              })
              .catch(() => undefined);
          }}
        >
          <Form.Item label="Name" name="name" rules={[{ required: true, message: "Enter a role name." }]}>
            <Input placeholder="Vice President" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit role"
        open={Boolean(editing)}
        onCancel={() => setEditing(null)}
        onOk={() => form.submit()}
        confirmLoading={updateRole.isPending}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (!editing) return;
            void updateRole.mutateAsync({ id: editing.id, name: values.name.trim() }).then(() => {
              toast.success("Role name updated.");
              setEditing(null);
            });
          }}
        >
          <Form.Item label="Name" name="name" rules={[{ required: true, message: "Enter a role name." }]}>
            <Input placeholder="Vice President" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
