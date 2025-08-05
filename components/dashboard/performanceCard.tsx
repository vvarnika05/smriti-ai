"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartColumnBig } from "lucide-react";

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

function PerformanceChart() {
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

export default function PerformanceCard() {
  return (
    <Card className="pt-3 pb-0 gap-3">
      <div className="flex items-center gap-4 px-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <ChartColumnBig className="text-primary h-5 w-5" />
        </div>
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between">
            <p className="text-sm">Performance</p>
            <span className="text-xs font-medium text-[#adff2f] bg-[#adff2f]/10 px-3 py-1 rounded-full flex items-center gap-1 border border-[#adff2f]/20">
              7% from last month
            </span>
          </div>
        </div>
      </div>
      <CardContent className="px-2">
        <PerformanceChart />
      </CardContent>
    </Card>
  );
}
