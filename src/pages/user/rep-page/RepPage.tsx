import { useRecruitingTree, useRep, useSendRepDocuments, useUpdateRep } from "@/hooks";
import { can } from "@/lib/permissions";
import { useGlobalStore } from "@/stores";
import type { DocumentDelivery, RecruitingNode } from "@/typings";
import { Button, Card, Checkbox, Descriptions, Drawer, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

function OrgNodes({
  nodes,
  currentRepId,
  onSelect,
}: {
  nodes: RecruitingNode[];
  currentRepId: number;
  onSelect: (node: RecruitingNode) => void;
}) {
  return (
    <ul>
      {nodes.map((node) => {
        const current = node.rep_id === currentRepId;
        return (
          <li key={node.key}>
            <div className="org-node">
              <button
                type="button"
                className={current ? "org-person is-current" : "org-person"}
                onClick={() => onSelect(node)}
              >
                <span className="org-person-name">{node.name}</span>
                <span className="org-person-role">{node.market || node.role}</span>
              </button>
            </div>
            {node.children.length ? (
              <div className="org-children">
                <OrgNodes nodes={node.children} currentRepId={currentRepId} onSelect={onSelect} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function formatWhen(value: number | string | null) {
  if (value == null || value === "") return "—";
  if (typeof value === "number") return dayjs.unix(value).format("MMM D, YYYY h:mm A");
  return dayjs(value).format("MMM D, YYYY h:mm A");
}

export function RepPage() {
  const { repId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useRep(repId);
  const tree = useRecruitingTree(repId);
  const resend = useSendRepDocuments();
  const updateRep = useUpdateRep();
  const canManage = can(useGlobalStore((state) => state.user)?.permissions, "manage_reps");
  const [person, setPerson] = useState<RecruitingNode | null>(null);
  const rep = data?.data;
  const nodes = tree.data?.data ?? [];

  if (isLoading || !rep || Array.isArray(rep)) {
    return <Typography.Paragraph>Loading rep…</Typography.Paragraph>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{rep.full_name}</h1>
          <p>
            Recruited by {rep.recruiter_name}.{" "}
            {rep.documents_sent_count === 1
              ? "1 document delivered."
              : `${rep.documents_sent_count} documents delivered.`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {canManage ? (
            <Button
              danger={rep.active}
              loading={updateRep.isPending}
              onClick={() =>
                void updateRep
                  .mutateAsync({ id: rep.id, active: !rep.active })
                  .then(() => toast.success(rep.active ? "Rep deactivated." : "Rep restored."))
              }
            >
              {rep.active ? "Deactivate" : "Restore"}
            </Button>
          ) : null}
          <Button
            onClick={() => {
              void resend.mutateAsync(rep.id).then(() => {
                toast.success("Documents sent again.");
              });
            }}
            loading={resend.isPending}
          >
            Resend documents
          </Button>
        </div>
      </div>
      <Card title="Recruiting">
        <Typography.Paragraph type="secondary">
          Select a person to open their record.
        </Typography.Paragraph>
        {nodes.length ? (
          <div className="org-chart">
            <OrgNodes
              nodes={nodes}
              currentRepId={rep.id}
              onSelect={(node) => {
                if (node.rep_id === rep.id) return;
                if (node.visible && node.rep_id) {
                  navigate(`/reps/${node.rep_id}`);
                  return;
                }
                setPerson(node);
              }}
            />
          </div>
        ) : (
          <Typography.Paragraph>
            {tree.isLoading ? "Loading the recruiting line…" : "No recruiting line yet."}
          </Typography.Paragraph>
        )}
      </Card>
      <Card>
        <Descriptions column={2}>
          <Descriptions.Item label="Email">{rep.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{rep.phone}</Descriptions.Item>
          <Descriptions.Item label="Start date">
            {rep.start_date ? dayjs(rep.start_date).format("MMM D, YYYY") : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="End date">
            {rep.end_date ? dayjs(rep.end_date).format("MMM D, YYYY") : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Shirt size">{rep.shirt_size || "—"}</Descriptions.Item>
          <Descriptions.Item label="Driver's license">{rep.drivers_license_number || "—"}</Descriptions.Item>
          <Descriptions.Item label="Market">{rep.market || "—"}</Descriptions.Item>
          <Descriptions.Item label="Level">{rep.level || "—"}</Descriptions.Item>
          <Descriptions.Item label="Housing">{rep.housing || "—"}</Descriptions.Item>
          <Descriptions.Item label="Address">
            {[rep.street, rep.city, rep.state, rep.zip].filter(Boolean).join(", ") || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={rep.active ? "green" : "default"}>{rep.active ? "Active" : "Deactivated"}</Tag>
            <Tag color={rep.status === "docs_sent" ? "green" : "gold"}>
              {rep.status === "docs_sent" ? "Docs sent" : "Pending"}
            </Tag>
            {rep.agreement_completed ? <Tag color="green">Agreement sent</Tag> : <Tag>Agreement not sent</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="Onboarding" span={2}>
            <Checkbox
              checked={rep.onboarding_completed}
              disabled={!canManage || updateRep.isPending}
              onChange={(event) => {
                void updateRep
                  .mutateAsync({ id: rep.id, onboarding_completed: event.target.checked })
                  .then(() => toast.success(event.target.checked ? "Onboarding marked complete." : "Onboarding marked open."));
              }}
            >
              Onboarding and documents are complete
            </Checkbox>
          </Descriptions.Item>
          <Descriptions.Item label="Notes" span={2}>
            {rep.notes || "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Drawer title={person?.name} open={Boolean(person)} onClose={() => setPerson(null)}>
        <Descriptions column={1}>
          <Descriptions.Item label="Email">{person?.email || "—"}</Descriptions.Item>
          <Descriptions.Item label="Phone">{person?.phone || "—"}</Descriptions.Item>
          <Descriptions.Item label="Role">{person?.role || "—"}</Descriptions.Item>
          <Descriptions.Item label="Market">{person?.market || "—"}</Descriptions.Item>
        </Descriptions>
      </Drawer>
      <Card title="Documents sent">
        <Table<DocumentDelivery>
          rowKey="id"
          pagination={false}
          dataSource={rep.deliveries ?? []}
          columns={[
            { title: "Document", dataIndex: "document_name" },
            { title: "Sent to", dataIndex: "recipient_email" },
            {
              title: "Status",
              dataIndex: "status",
              render: (status: DocumentDelivery["status"]) => (
                <Tag color={status === "sent" ? "green" : status === "failed" ? "red" : "blue"}>
                  {status}
                </Tag>
              ),
            },
            {
              title: "When",
              dataIndex: "sent_at",
              render: (value: DocumentDelivery["sent_at"]) => formatWhen(value),
            },
          ]}
        />
      </Card>
    </div>
  );
}
