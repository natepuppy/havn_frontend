import { useCreateMarket, useDeleteMarket, useMarkets } from "@/hooks";
import { can } from "@/lib/permissions";
import { useGlobalStore } from "@/stores";
import type { Market } from "@/typings";
import { Button, Form, Input, Modal, Popconfirm, Table } from "antd";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

export function MarketsPage() {
  const user = useGlobalStore((state) => state.user);
  const markets = useMarkets();
  const createMarket = useCreateMarket();
  const removeMarket = useDeleteMarket();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<{ name: string }>();

  if (!can(user?.permissions, "manage_reps")) {
    return <Navigate to="/reps" replace />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Markets</h1>
          <p>Markets a new rep can be assigned to.</p>
        </div>
        <Button type="primary" onClick={() => setOpen(true)}>
          Add market
        </Button>
      </div>
      <Table<Market>
        rowKey="id"
        loading={markets.isLoading}
        pagination={false}
        dataSource={markets.data?.data ?? []}
        columns={[
          { title: "Name", dataIndex: "name" },
          {
            title: "",
            width: 96,
            render: (_value: unknown, market) => (
              <Popconfirm
                title="Delete this market?"
                description="It will no longer be offered on a new rep."
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={() => void removeMarket.mutateAsync(market.id)}
              >
                <Button type="link" danger>
                  Delete
                </Button>
              </Popconfirm>
            ),
          },
        ]}
      />
      <Modal
        title="Add market"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMarket.isPending}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            void createMarket.mutateAsync(values.name.trim()).then(() => {
              toast.success("Market added.");
              form.resetFields();
              setOpen(false);
            });
          }}
        >
          <Form.Item label="Name" name="name" rules={[{ required: true, message: "Enter a market name." }]}>
            <Input placeholder="Wasatch Front" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
