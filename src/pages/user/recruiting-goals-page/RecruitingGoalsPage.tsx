import { useRecruitingGoals, useUpdateRecruitingGoals } from "@/hooks";
import { useGlobalStore } from "@/stores";
import { Button, Card, InputNumber, Statistic, Table, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const TOTAL_WEEKS = 25;

type Draft = {
  id: number;
  weekNumber: number;
  startsOn: string;
  endsOn: string;
  projected: number | null;
  expenses: number | null;
  percentToGoalOverride: number | null;
  percentIntoSeasonOverride: number | null;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function calculatedPercentToGoal(projected: number | null, goal: number | null) {
  if (projected == null || !goal) return null;
  return roundPercent((projected / goal) * 100);
}

function calculatedPercentIntoSeason(weekNumber: number) {
  return roundPercent((weekNumber / TOTAL_WEEKS) * 100);
}

function formatPercent(value: number | null) {
  return value == null ? "" : `${value}%`;
}

function csvCell(value: string | number | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function overlaps(row: Draft, windowStart: dayjs.Dayjs, today: dayjs.Dayjs) {
  const starts = dayjs(row.startsOn);
  const ends = dayjs(row.endsOn);
  return !starts.isAfter(today, "day") && !ends.isBefore(windowStart, "day");
}

function periodTotal(rows: Draft[], goal: number | null, windowStart: dayjs.Dayjs, today: dayjs.Dayjs) {
  const selected = rows.filter((row) => overlaps(row, windowStart, today));
  const latest = [...selected].reverse().find((row) => row.projected != null);
  const expenses = selected.reduce((sum, row) => sum + (row.expenses ?? 0), 0);
  const projected = latest?.projected ?? null;
  const percent = latest
    ? (latest.percentToGoalOverride ?? calculatedPercentToGoal(latest.projected, goal))
    : null;
  return { expenses, projected, percent };
}

export function RecruitingGoalsPage() {
  const user = useGlobalStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const goals = useRecruitingGoals(isAdmin);
  const save = useUpdateRecruitingGoals();
  const [goal, setGoal] = useState<number | null>(15_000_000);
  const [currentProjected, setCurrentProjected] = useState(0);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    const data = goals.data?.data;
    if (!data) return;
    setGoal(data.revenue_goal);
    setCurrentProjected(data.current_projected_revenue);
    setDrafts(
      data.weeks.map((week) => ({
        id: week.id,
        weekNumber: week.week_number,
        startsOn: week.starts_on,
        endsOn: week.ends_on,
        projected: week.projected_revenue,
        expenses: week.expenses,
        percentToGoalOverride: week.percent_to_goal_override,
        percentIntoSeasonOverride: week.percent_into_season_override,
      })),
    );
  }, [goals.data]);

  const today = dayjs().startOf("day");
  const totals = useMemo(
    () => ({
      previous30: periodTotal(drafts, goal, today.subtract(30, "day"), today),
      previous12: periodTotal(drafts, goal, today.subtract(12, "month"), today),
    }),
    [drafts, goal, today],
  );

  if (!isAdmin) {
    return <Navigate to="/reps" replace />;
  }

  const updateDraft = (id: number, patch: Partial<Draft>) => {
    setDrafts((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const percentToGoal = (row: Draft) => row.percentToGoalOverride ?? calculatedPercentToGoal(row.projected, goal);
  const percentIntoSeason = (row: Draft) => row.percentIntoSeasonOverride ?? calculatedPercentIntoSeason(row.weekNumber);

  const download = () => {
    const rows = [
      ["Revenue Goal", goal ?? ""],
      [],
      ["Week", "Starts", "Ends", "Projected Revenue", "Percent to Goal", "Percent into Season", "Expenses"],
      ...drafts.map((row) => [
        row.weekNumber,
        row.startsOn,
        row.endsOn,
        row.projected ?? "",
        formatPercent(percentToGoal(row)),
        formatPercent(percentIntoSeason(row)),
        row.expenses ?? "",
      ]),
      [],
      ["Previous 30 days expenses", totals.previous30.expenses],
      ["Previous 30 days projected revenue", totals.previous30.projected ?? ""],
      ["Previous 30 days percent to goal", formatPercent(totals.previous30.percent)],
      ["Previous 12 months expenses", totals.previous12.expenses],
      ["Previous 12 months projected revenue", totals.previous12.projected ?? ""],
      ["Previous 12 months percent to goal", formatPercent(totals.previous12.percent)],
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "recruiting-goals.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentWeek = drafts.find((row) => !dayjs(row.startsOn).isAfter(today, "day") && !dayjs(row.endsOn).isBefore(today, "day"));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Recruiting Goals</h1>
          <p>Week by week progress from the last week of October 2026 through April 24, 2027.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={download} disabled={!drafts.length}>
            Download CSV
          </Button>
          <Button
            type="primary"
            loading={save.isPending}
            onClick={() => {
              if (goal == null) {
                toast.error("Enter a revenue goal.");
                return;
              }
              void save
                .mutateAsync({
                  revenue_goal: goal,
                  weeks: drafts.map((row) => ({
                    week_number: row.weekNumber,
                    projected_revenue: row.projected,
                    expenses: row.expenses,
                    percent_to_goal_override: row.percentToGoalOverride,
                    percent_into_season_override: row.percentIntoSeasonOverride,
                  })),
                })
                .then(() => toast.success("Recruiting goals saved."));
            }}
          >
            Save
          </Button>
        </div>
      </div>

      <Card>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "end" }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span>Revenue goal</span>
            <InputNumber
              min={1}
              step={100000}
              prefix="$"
              value={goal}
              style={{ width: 220 }}
              onChange={(value) => setGoal(value)}
            />
          </label>
          <div>
            <Typography.Text type="secondary">Projected revenue on the Projections page</Typography.Text>
            <div>{money.format(currentProjected)}</div>
            {currentWeek ? (
              <Button
                type="link"
                style={{ padding: 0 }}
                onClick={() => updateDraft(currentWeek.id, { projected: currentProjected })}
              >
                Use it for this week
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        Percent to the goal is that week's projected revenue divided by the goal. Percent into the season is the week number out of 25. Change either percentage to override it.
      </Typography.Paragraph>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <Card title="Previous 30 days">
          <Statistic title="Expenses" value={totals.previous30.expenses} prefix="$" precision={0} />
          <Statistic title="Projected revenue" value={totals.previous30.projected ?? "—"} prefix={totals.previous30.projected == null ? undefined : "$"} precision={totals.previous30.projected == null ? undefined : 0} />
          <Statistic title="Percent to goal" value={totals.previous30.percent ?? "—"} suffix={totals.previous30.percent == null ? undefined : "%"} precision={totals.previous30.percent == null ? undefined : 1} />
        </Card>
        <Card title="Previous 12 months">
          <Statistic title="Expenses" value={totals.previous12.expenses} prefix="$" precision={0} />
          <Statistic title="Projected revenue" value={totals.previous12.projected ?? "—"} prefix={totals.previous12.projected == null ? undefined : "$"} precision={totals.previous12.projected == null ? undefined : 0} />
          <Statistic title="Percent to goal" value={totals.previous12.percent ?? "—"} suffix={totals.previous12.percent == null ? undefined : "%"} precision={totals.previous12.percent == null ? undefined : 1} />
        </Card>
      </div>

      <Table<Draft>
        rowKey="id"
        loading={goals.isLoading}
        pagination={false}
        dataSource={drafts}
        scroll={{ x: 1100 }}
        columns={[
          { title: "Week", dataIndex: "weekNumber", width: 80 },
          {
            title: "Dates",
            width: 200,
            render: (_value: unknown, row) => `${dayjs(row.startsOn).format("MMM D")} – ${dayjs(row.endsOn).format("MMM D, YYYY")}`,
          },
          {
            title: "Projected revenue",
            width: 180,
            render: (_value: unknown, row) => (
              <InputNumber
                min={0}
                step={10000}
                prefix="$"
                value={row.projected}
                style={{ width: "100%" }}
                onChange={(value) => updateDraft(row.id, { projected: value })}
              />
            ),
          },
          {
            title: "% to goal",
            width: 170,
            render: (_value: unknown, row) => (
              <div>
                <InputNumber
                  min={0}
                  step={0.1}
                  addonAfter="%"
                  value={percentToGoal(row)}
                  style={{ width: "100%" }}
                  onChange={(value) => updateDraft(row.id, { percentToGoalOverride: value })}
                />
                {row.percentToGoalOverride != null ? (
                  <Button type="link" size="small" style={{ padding: 0 }} onClick={() => updateDraft(row.id, { percentToGoalOverride: null })}>
                    Use calculated
                  </Button>
                ) : null}
              </div>
            ),
          },
          {
            title: "% into season",
            width: 170,
            render: (_value: unknown, row) => (
              <div>
                <InputNumber
                  min={0}
                  step={0.1}
                  addonAfter="%"
                  value={percentIntoSeason(row)}
                  style={{ width: "100%" }}
                  onChange={(value) => updateDraft(row.id, { percentIntoSeasonOverride: value })}
                />
                {row.percentIntoSeasonOverride != null ? (
                  <Button type="link" size="small" style={{ padding: 0 }} onClick={() => updateDraft(row.id, { percentIntoSeasonOverride: null })}>
                    Use calculated
                  </Button>
                ) : null}
              </div>
            ),
          },
          {
            title: "Expenses",
            width: 160,
            render: (_value: unknown, row) => (
              <InputNumber
                min={0}
                step={100}
                prefix="$"
                value={row.expenses}
                style={{ width: "100%" }}
                onChange={(value) => updateDraft(row.id, { expenses: value })}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
