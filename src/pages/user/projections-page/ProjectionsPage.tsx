import { useProjections, useUpdateProjections } from "@/hooks";
import { LEVELS } from "@/lib/levels";
import { useGlobalStore } from "@/stores";
import { Button, Card, InputNumber, Statistic, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

type Draft = {
  id: number;
  full_name: string;
  level: string | null;
  active: boolean;
  lastYear: number | null;
  projected: number | null;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function adjustedRevenue(projected: number | null, level: string | null, rates: Record<string, number | null>) {
  if (projected == null || !level) return null;
  const rate = rates[level];
  if (rate == null) return null;
  return Math.round(projected * (rate / 100) * 100) / 100;
}

function csvCell(value: string | number | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function levelProjectedRevenue(rows: Draft[], level: string, rates: Record<string, number | null>) {
  return rows
    .filter((row) => row.active && row.level === level)
    .reduce((sum, row) => sum + (adjustedRevenue(row.projected, row.level, rates) ?? 0), 0);
}

export function ProjectionsPage() {
  const user = useGlobalStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const projections = useProjections(isAdmin);
  const save = useUpdateProjections();
  const [rates, setRates] = useState<Record<string, number | null>>({ Rookie: 0, Pro: 0 });
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    const data = projections.data?.data;
    if (!data) return;
    const nextRates: Record<string, number | null> = { Rookie: 0, Pro: 0 };
    data.finish_rates.forEach((rate) => {
      nextRates[rate.level] = rate.finish_rate;
    });
    setRates(nextRates);
    setDrafts(
      data.reps.map((rep) => ({
        id: rep.id,
        full_name: rep.full_name,
        level: rep.level,
        active: rep.active,
        lastYear: rep.last_year_revenue,
        projected: rep.projected_revenue,
      })),
    );
  }, [projections.data]);

  if (!isAdmin) {
    return <Navigate to="/reps" replace />;
  }

  const updateDraft = (id: number, patch: Partial<Pick<Draft, "lastYear" | "projected">>) => {
    setDrafts((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const rookieProjected = levelProjectedRevenue(drafts, "Rookie", rates);
  const proProjected = levelProjectedRevenue(drafts, "Pro", rates);
  const combinedProjected = rookieProjected + proProjected;

  const download = () => {
    const rows = [
      ["Rookie Projected Revenue", rookieProjected],
      ["Pro Projected Revenue", proProjected],
      ["Combined Projected Revenue", combinedProjected],
      ["Rookie Finish Rate", rates.Rookie ?? ""],
      ["Pro Finish Rate", rates.Pro ?? ""],
      [],
      ["Rep", "Level", "Last Year Revenue", "Projected Revenue Next Year", "Projected Finish Rate", "Adjusted Projected Revenue"],
      ...drafts.map((row) => {
        const rate = row.level ? rates[row.level] : null;
        const adjusted = adjustedRevenue(row.projected, row.level, rates);
        return [
          row.full_name,
          row.level ?? "",
          row.lastYear ?? "",
          row.projected ?? "",
          rate ?? "",
          adjusted ?? "",
        ];
      }),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "projections.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Projections</h1>
          <p>Last year's revenue, next year's projection, and the finish rate for each level.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={download} disabled={!drafts.length}>
            Download CSV
          </Button>
          <Button
            type="primary"
            loading={save.isPending}
            onClick={() => {
              void save
                .mutateAsync({
                  finish_rates: LEVELS.map((level) => ({ level, finish_rate: rates[level] ?? 0 })),
                  reps: drafts.map((row) => ({
                    id: row.id,
                    last_year_revenue: row.lastYear,
                    projected_revenue: row.projected,
                  })),
                })
                .then(() => toast.success("Projections saved."));
            }}
          >
            Save
          </Button>
        </div>
      </div>

      <Card title="Projected finish rate">
        <Typography.Paragraph type="secondary">
          Each level's projected revenue is the sum of active reps at that level, multiplied by the finish rate. Changing a finish rate updates all three totals.
        </Typography.Paragraph>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
          <Statistic title="Rookie projected revenue" value={rookieProjected} prefix="$" precision={0} />
          <Statistic title="Pro projected revenue" value={proProjected} prefix="$" precision={0} />
          <Statistic title="Combined projected revenue" value={combinedProjected} prefix="$" precision={0} />
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {LEVELS.map((level) => (
            <label key={level} style={{ display: "grid", gap: 4 }}>
              <span>{level}</span>
              <InputNumber
                min={0}
                max={100}
                step={1}
                addonAfter="%"
                value={rates[level]}
                onChange={(value) => setRates((current) => ({ ...current, [level]: value }))}
                style={{ width: 160 }}
              />
            </label>
          ))}
        </div>
      </Card>

      <Table<Draft>
        rowKey="id"
        loading={projections.isLoading}
        pagination={false}
        dataSource={drafts}
        locale={{ emptyText: "No reps yet." }}
        columns={[
          {
            title: "Rep",
            dataIndex: "full_name",
            render: (name: string, row) => (
              <span>
                {name} {row.active ? null : <Tag>Deactivated</Tag>}
              </span>
            ),
          },
          { title: "Level", dataIndex: "level", render: (level: string | null) => level || "—" },
          {
            title: "Last year",
            dataIndex: "lastYear",
            width: 180,
            render: (value: number | null, row) => (
              <InputNumber
                min={0}
                step={100}
                prefix="$"
                value={value}
                style={{ width: "100%" }}
                onChange={(next) => updateDraft(row.id, { lastYear: next })}
              />
            ),
          },
          {
            title: "Projected next year",
            dataIndex: "projected",
            width: 200,
            render: (value: number | null, row) => (
              <InputNumber
                min={0}
                step={100}
                prefix="$"
                value={value}
                style={{ width: "100%" }}
                onChange={(next) => updateDraft(row.id, { projected: next })}
              />
            ),
          },
          {
            title: "Adjusted projected revenue",
            render: (_value: unknown, row) => {
              const amount = adjustedRevenue(row.projected, row.level, rates);
              return amount == null ? "—" : money.format(amount);
            },
          },
        ]}
      />
    </div>
  );
}
