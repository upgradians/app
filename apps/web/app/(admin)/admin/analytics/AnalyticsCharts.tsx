"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

interface Props {
  statusData: { name: string; value: number }[];
  langData:   { name: string; value: number }[];
  dailyData:  { date: string; submissions: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  accepted:      "#34d399",
  wrong_answer:  "#f87171",
  timeout:       "#fbbf24",
  time_limit:    "#fbbf24",
  runtime_error: "#fb923c",
  compile_error: "#f472b6",
  pending:       "#94a3b8",
  running:       "#60a5fa",
};

const LANG_COLORS = [
  "#6366f1", "#22d3ee", "#a78bfa", "#34d399",
  "#fbbf24", "#f87171", "#fb923c", "#e879f9",
];

export function AnalyticsCharts({ statusData, langData, dailyData }: Props) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">

      {/* Submission status pie */}
      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-5">
        <h2 className="font-bold text-sm text-[var(--text-1)] mb-4">Submission Status (last 500)</h2>
        {statusData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-[var(--text-3)] text-sm">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} ${Math.round((percent as number) * 100)}%`
                }
                labelLine={false}
              >
                {statusData.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] ?? LANG_COLORS[i % LANG_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: "12px" }}
                labelStyle={{ color: "var(--text-1)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Language popularity bar */}
      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-5">
        <h2 className="font-bold text-sm text-[var(--text-1)] mb-4">Language Popularity (last 500)</h2>
        {langData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-[var(--text-3)] text-sm">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={langData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-3)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: "12px" }}
                labelStyle={{ color: "var(--text-1)" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {langData.map((entry, i) => (
                  <Cell key={entry.name} fill={LANG_COLORS[i % LANG_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Daily submissions line chart */}
      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-5 lg:col-span-2">
        <h2 className="font-bold text-sm text-[var(--text-1)] mb-4">Daily Submissions (last 14 days)</h2>
        {dailyData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-[var(--text-3)] text-sm">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text-3)", fontSize: 11 }}
                tickFormatter={v => (v as string).slice(5)}
              />
              <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: "12px" }}
                labelStyle={{ color: "var(--text-1)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-2)" }} />
              <Line
                type="monotone"
                dataKey="submissions"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3, fill: "#6366f1" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
