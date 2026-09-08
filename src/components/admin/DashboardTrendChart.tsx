"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { formatMoney } from "@/lib/currency";

export function DashboardTrendChart({ data }: { data: { date: string; revenueMinor: number; orders: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
        <YAxis yAxisId="revenue" tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatMoney(v).replace(/\.00$/, "")} width={70} />
        <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} width={40} />
        <Tooltip
          // Recharts' Formatter type is awkward to satisfy exactly (value/name
          // are typed as possibly undefined in the generic, but never actually
          // are for a simple two-line chart like this) — cast rather than
          // chase the generic.
          formatter={
            ((value: number, name: string) => (name === "Revenue" ? [formatMoney(value), name] : [value, name])) as never
          }
          labelFormatter={(label) => (typeof label === "string" ? label : "")}
        />
        <Legend />
        <Line yAxisId="revenue" type="monotone" dataKey="revenueMinor" stroke="#0f7a3d" strokeWidth={2} dot={false} name="Revenue" />
        <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#e7b008" strokeWidth={2} dot={false} name="Orders" />
      </LineChart>
    </ResponsiveContainer>
  );
}
