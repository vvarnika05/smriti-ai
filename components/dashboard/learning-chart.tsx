"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { status: "Completed", count: 1, fill: "hsl(90, 60%, 35%)" },
  { status: "Learning", count: 2, fill: "hsl(90, 60%, 50%)" },
  { status: "Paused", count: 1, fill: "hsl(90, 60%, 75%)" },
];

const chartConfig = {
  Completed: {
    label: "Completed",
    color: "hsl(90, 60%, 35%)",
  },
  Learning: {
    label: "Learning",
    color: "hsl(90, 60%, 50%)",
  },
  Paused: {
    label: "Paused",
    color: "hsl(90, 60%, 75%)",
  },
} satisfies ChartConfig;

export function LearningStatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Status</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="w-full overflow-visible">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="status"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={90} // Explicit width for YAxis
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
