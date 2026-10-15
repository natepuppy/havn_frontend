import { useCreateMarket, useMarkets } from "@/hooks";
import { can } from "@/lib/permissions";
import { useGlobalStore } from "@/stores";
import type { Market } from "@/typings";
import { Button, Form, Input, Modal, Table } from "antd";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

export function MarketsPage() {
  const user = useGlobalStore((state) => state.user);
  const markets = useMarkets();
  const createMarket = useCreateMarket();
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
        columns={[{ title: "Name", dataIndex: "name" }]}
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
