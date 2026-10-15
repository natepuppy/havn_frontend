import { useCreateDocument, useDeleteDocument, useDocuments, useUpdateDocument } from "@/hooks";
import { can } from "@/lib/permissions";
import { useGlobalStore } from "@/stores";
import type { OnboardingDocument } from "@/typings";
import { Button, Form, Input, Modal, Popconfirm, Switch, Table, Tag } from "antd";
import { useState } from "react";

type NewDocument = {
  name: string;
  description?: string | null;
  body: string;
  active: boolean;
  send_by_default: boolean;
  required: boolean;
};

export function DocumentsPage() {
  const user = useGlobalStore((state) => state.user);
  const documents = useDocuments();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const removeDocument = useDeleteDocument();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<NewDocument>();
  const canManageDocuments = can(user?.permissions, "manage_documents");

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Documents</h1>
          <p>Active documents can be sent. Required ones stay on a new rep. Default ones start checked.</p>
        </div>
        {canManageDocuments ? (
          <Button type="primary" onClick={() => setOpen(true)}>
            Add document
          </Button>
        ) : null}
      </div>
      <Table<OnboardingDocument>
        rowKey="id"
        loading={documents.isLoading}
        pagination={false}
        dataSource={documents.data?.data ?? []}
        columns={[
          { title: "Name", dataIndex: "name" },
          { title: "Description", dataIndex: "description" },
          {
            title: "Active",
            dataIndex: "active",
            render: (active: boolean, document) =>
              canManageDocuments ? (
                <Switch
                  checked={active}
                  onChange={(checked) => {
                    void updateDocument.mutateAsync({ id: document.id, active: checked });
                  }}
                />
              ) : (
                <Tag color={active ? "green" : "default"}>{active ? "Active" : "Off"}</Tag>
              ),
          },
          {
            title: "Default",
            dataIndex: "send_by_default",
            render: (sendByDefault: boolean, document) =>
              canManageDocuments ? (
                <Switch
                  checked={sendByDefault}
                  onChange={(checked) => {
                    void updateDocument.mutateAsync({ id: document.id, send_by_default: checked });
                  }}
                />
              ) : (
                <Tag color={sendByDefault ? "green" : "default"}>{sendByDefault ? "Default" : "Optional"}</Tag>
              ),
          },
          {
            title: "Required",
            dataIndex: "required",
            render: (required: boolean, document) =>
              canManageDocuments ? (
                <Switch
                  checked={required}
                  onChange={(checked) => {
                    void updateDocument.mutateAsync({ id: document.id, required: checked });
                  }}
                />
              ) : (
                <Tag color={required ? "green" : "default"}>{required ? "Required" : "Optional"}</Tag>
              ),
          },
          {
            title: "",
            width: 96,
            render: (_value: unknown, document) =>
              canManageDocuments ? (
                <Popconfirm
                  title="Delete this document?"
                  description="It will no longer be offered on a new rep."
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => void removeDocument.mutateAsync(document.id)}
                >
                  <Button type="link" danger>
                    Delete
                  </Button>
                </Popconfirm>
              ) : null,
          },
        ]}
      />
      <Modal
        title="Add onboarding document"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => {
          form.submit();
        }}
        confirmLoading={createDocument.isPending}
        destroyOnClose
      >
        <Form<NewDocument>
          form={form}
          layout="vertical"
          initialValues={{ active: true, send_by_default: true, required: false }}
          onFinish={(values) => {
            void createDocument.mutateAsync({
              name: values.name,
              description: values.description ?? null,
              body: values.body,
              active: values.active,
              send_by_default: values.send_by_default,
              required: values.required,
            }).then(() => {
              form.resetFields();
              setOpen(false);
            });
          }}
        >
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="Body" name="body" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item label="Active" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Send by default" name="send_by_default" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Required" name="required" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
