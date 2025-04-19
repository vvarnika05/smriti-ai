"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
  { month: "January", marks: 186 },
  { month: "February", marks: 305 },
  { month: "March", marks: 237 },
  { month: "April", marks: 73 },
  { month: "May", marks: 209 },
  { month: "June", marks: 214 },
];

const chartConfig = {
  marks: {
    label: "marks",
    color: "hsl(90, 60%, 50%)", // vibrant yellow-green
  },
} satisfies ChartConfig;

export function PerformanceChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[80px] w-full"
    >
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="marks"
          type="natural"
          fill="var(--color-marks)"
          fillOpacity={0.4}
          stroke="var(--color-marks)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
