import { useMarkets, useRecruiters, useReps, useRoles, useUpdateRep } from "@/hooks";
import { can } from "@/lib/permissions";
import { useGlobalStore } from "@/stores";
import type { Rep } from "@/typings";
import { Button, Input, Select, Table, Tag } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function RepsPage() {
  const navigate = useNavigate();
  const user = useGlobalStore((state) => state.user);
  const canViewAll = can(user?.permissions, "view_all_reps");
  const recruiters = useRecruiters();
  const markets = useMarkets();
  const roles = useRoles();
  const updateRep = useUpdateRep();
  const canManage = can(user?.permissions, "manage_reps");
  const [nameQuery, setNameQuery] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [recruitedByIds, setRecruitedByIds] = useState<number[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [active, setActive] = useState<"true" | "false" | "all">("true");
  const [paperwork, setPaperwork] = useState<string>();
  const [role, setRole] = useState<string>();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedName(nameQuery.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [nameQuery]);

  const { data, isLoading } = useReps({
    q: debouncedName,
    recruitedByIds,
    markets: selectedMarkets,
    active,
    paperwork: paperwork as "none" | "sent" | "agreement" | "completed" | undefined,
    role,
  });
  const reps = data?.data ?? [];
  const filtersActive = Boolean(
    debouncedName || recruitedByIds.length || selectedMarkets.length || paperwork || role || active !== "true",
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Reps</h1>
          <p>People onboarded into the pest control team.</p>
        </div>
        <Button type="primary" onClick={() => navigate("/reps/new")}>
          Onboard a rep
        </Button>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Input.Search
          allowClear
          placeholder="Search by name"
          value={nameQuery}
          onChange={(event) => setNameQuery(event.target.value)}
          style={{ width: 280 }}
        />
        {canViewAll ? (
          <Select
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Recruited by"
            loading={recruiters.isLoading}
            value={recruitedByIds}
            onChange={(value) => setRecruitedByIds(value)}
            style={{ minWidth: 240 }}
            options={(recruiters.data?.data ?? []).map((recruiter) => ({
              value: recruiter.id,
              label: recruiter.full_name,
            }))}
          />
        ) : null}
        <Select
          mode="multiple"
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Market"
          loading={markets.isLoading}
          value={selectedMarkets}
          onChange={(value) => setSelectedMarkets(value)}
          style={{ minWidth: 220 }}
          options={(markets.data?.data ?? []).map((market) => ({ value: market.name, label: market.name }))}
        />
        <Select
          allowClear
          virtual={false}
          placeholder="Paperwork"
          value={paperwork}
          onChange={(value) => setPaperwork(value)}
          style={{ minWidth: 220 }}
          options={[
            { value: "none", label: "No paperwork sent" },
            { value: "sent", label: "Paperwork sent" },
            { value: "agreement", label: "Agreement sent" },
            { value: "completed", label: "Onboarding complete" },
          ]}
        />
        <Select
          allowClear
          virtual={false}
          showSearch
          optionFilterProp="label"
          placeholder="Role"
          loading={roles.isLoading}
          value={role}
          onChange={(value) => setRole(value)}
          style={{ minWidth: 180 }}
          options={(roles.data?.data ?? []).map((item) => ({ value: item.code, label: item.name }))}
        />
        <Select
          virtual={false}
          value={active}
          onChange={(value) => setActive(value)}
          style={{ minWidth: 160 }}
          options={[
            { value: "true", label: "Active" },
            { value: "false", label: "Deactivated" },
            { value: "all", label: "Active and deactivated" },
          ]}
        />
      </div>
      <Table<Rep>
        rowKey="id"
        loading={isLoading}
        dataSource={reps}
        pagination={false}
        onRow={(rep) => ({
          onClick: () => navigate(`/reps/${rep.id}`),
          style: { cursor: "pointer" },
        })}
        locale={{
          emptyText: filtersActive
            ? "No reps match that search."
            : "No reps yet. Start with the onboarding form.",
        }}
        columns={[
          { title: "Rep", dataIndex: "full_name", sorter: (a, b) => a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name), defaultSortOrder: "ascend" },
          { title: "Email", dataIndex: "email" },
          { title: "Role", dataIndex: "role", render: (value: string | null) => value || "—" },
          { title: "Recruited by", dataIndex: "recruiter_name" },
          { title: "Market", dataIndex: "market" },
          { title: "Level", dataIndex: "level" },
          { title: "Housing", dataIndex: "housing" },
          {
            title: "Start",
            dataIndex: "start_date",
            render: (value: string) => (value ? dayjs(value).format("MMM D, YYYY") : ""),
          },
          {
            title: "Docs sent",
            dataIndex: "documents_sent_count",
          },
          {
            title: "Agreement",
            dataIndex: "agreement_completed",
            render: (sent: boolean) => (sent ? <Tag color="green">Sent</Tag> : <Tag>Not sent</Tag>),
          },
          {
            title: "Onboarding",
            dataIndex: "onboarding_completed",
            render: (done: boolean) => (done ? <Tag color="green">Complete</Tag> : <Tag color="gold">Open</Tag>),
          },
          {
            title: "Status",
            dataIndex: "active",
            render: (isActive: boolean, rep) => (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }} onClick={(event) => event.stopPropagation()}>
                <Tag color={isActive ? "green" : "default"}>{isActive ? "Active" : "Deactivated"}</Tag>
                {canManage ? (
                  <Button
                    size="small"
                    danger={isActive}
                    loading={updateRep.isPending}
                    onClick={() =>
                      void updateRep
                        .mutateAsync({ id: rep.id, active: !isActive })
                        .then(() => toast.success(isActive ? "Rep deactivated." : "Rep restored."))
                    }
                  >
                    {isActive ? "Deactivate" : "Restore"}
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
