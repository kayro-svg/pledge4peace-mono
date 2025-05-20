"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Modified data to show pledges, votes, and campaigns supported over time
const chartData = [
  { date: "2024-01-01", pledges: 12, votes: 28, campaigns: 5 },
  { date: "2024-01-15", pledges: 18, votes: 36, campaigns: 8 },
  { date: "2024-02-01", pledges: 25, votes: 42, campaigns: 10 },
  { date: "2024-02-15", pledges: 22, votes: 40, campaigns: 12 },
  { date: "2024-03-01", pledges: 28, votes: 50, campaigns: 15 },
  { date: "2024-03-15", pledges: 34, votes: 58, campaigns: 16 },
  { date: "2024-04-01", pledges: 42, votes: 65, campaigns: 18 },
  { date: "2024-04-15", pledges: 48, votes: 72, campaigns: 22 },
  { date: "2024-05-01", pledges: 55, votes: 88, campaigns: 25 },
  { date: "2024-05-15", pledges: 62, votes: 95, campaigns: 30 },
  { date: "2024-06-01", pledges: 70, votes: 105, campaigns: 35 },
  { date: "2024-06-15", pledges: 85, votes: 120, campaigns: 42 },
  { date: "2024-06-30", pledges: 95, votes: 140, campaigns: 50 },
];

// Updated chart configuration with new metrics
const chartConfig = {
  activity: {
    label: "User Activity",
  },
  pledges: {
    label: "Pledges Made",
    color: "hsl(var(--chart-1))",
  },
  votes: {
    label: "Votes Cast",
    color: "hsl(var(--chart-2))",
  },
  campaigns: {
    label: "Campaigns Supported",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("6m");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("3m");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let monthsToSubtract = 6;
    if (timeRange === "3m") {
      monthsToSubtract = 3;
    } else if (timeRange === "1m") {
      monthsToSubtract = 1;
    }
    const startDate = new Date(referenceDate);
    startDate.setMonth(startDate.getMonth() - monthsToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md">
      <CardHeader className="relative">
        <CardTitle>Peace Engagement Activity</CardTitle>
        <CardDescription>
          <span>User participation metrics over time</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="6m" className="h-8 px-2.5">
              Last 6 months
            </ToggleGroupItem>
            <ToggleGroupItem value="3m" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="1m" className="h-8 px-2.5">
              Last month
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 6 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="6m" className="rounded-lg">
                Last 6 months
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="1m" className="rounded-lg">
                Last month
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillPledges" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-pledges)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-pledges)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillVotes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-votes)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-votes)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCampaigns" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-campaigns)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-campaigns)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="campaigns"
              type="monotone"
              fill="url(#fillCampaigns)"
              stroke="var(--color-campaigns)"
              stackId="1"
            />
            <Area
              dataKey="pledges"
              type="monotone"
              fill="url(#fillPledges)"
              stroke="var(--color-pledges)"
              stackId="2"
            />
            <Area
              dataKey="votes"
              type="monotone"
              fill="url(#fillVotes)"
              stroke="var(--color-votes)"
              stackId="3"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
