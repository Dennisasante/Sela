"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyTrendPoint } from "@/lib/data/reports";
import { formatMoney } from "@/lib/format";

export function TrendChart({ data, currency }: { data: DailyTrendPoint[]; currency: string }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="var(--muted-foreground)"
          interval={4}
        />
        <YAxis hide />
        <Tooltip
          formatter={(value) => formatMoney(Number(value), currency)}
          labelFormatter={(day) => `Day ${day}`}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#incomeFill)"
          name="Income"
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="var(--chart-2)"
          strokeWidth={2}
          fill="url(#expenseFill)"
          name="Expense"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
