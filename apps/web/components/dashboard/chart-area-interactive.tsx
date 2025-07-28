"use client";

import { useEffect, useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import { useUserActivities } from "@/hooks/useUserInvolvement";
import { RecentActivity } from "@/lib/api/user-involvement";
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
import { Skeleton } from "@/components/ui/skeleton";

// Chart configuration
const chartConfig = {
  activity: {
    label: "User Activity",
  },
  pledges: {
    label: "Pledges Made",
    color: "#10b981", // Emerald-500
  },
  votes: {
    label: "Votes Cast",
    color: "#3498db", // Blue-500
  },
  comments: {
    label: "Comments Made",
    color: "#f97316", // Orange-500
  },
  shares: {
    label: "Shares Made",
    color: "#8b5cf6", // Purple-500
  },
} satisfies ChartConfig;

interface ChartDataPoint {
  date: string;
  pledges: number;
  votes: number;
  comments: number;
  shares: number;
}

function transformActivitiesToChartData(
  activities: RecentActivity[],
  timeRange: string
): ChartDataPoint[] {
  // Filter activities based on time range
  const now = new Date();
  const monthsToSubtract = timeRange === "6m" ? 6 : timeRange === "3m" ? 3 : 1;
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - monthsToSubtract);

  const filteredActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.createdAt);
    return activityDate >= startDate;
  });

  console.log("filteredActivities in chart", filteredActivities);

  // Group activities by week
  const groupedByWeek: Record<
    string,
    { pledges: number; votes: number; comments: number; shares: number }
  > = {};

  // First, process all activities to determine which weeks we need
  const weekKeys = new Set<string>();

  filteredActivities.forEach((activity) => {
    const activityDate = new Date(activity.createdAt);
    const weekStart = new Date(activityDate);

    // Calculate the start of the week (Sunday)
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);

    // Reset time to start of day
    weekStart.setHours(0, 0, 0, 0);

    const weekKey = weekStart.toISOString().split("T")[0];
    weekKeys.add(weekKey);
  });

  // Initialize all weeks with zero counts
  weekKeys.forEach((weekKey) => {
    groupedByWeek[weekKey] = {
      pledges: 0,
      votes: 0,
      comments: 0,
      shares: 0,
    };
  });

  // Also add empty weeks for the time range to show continuity
  const currentDate = new Date(startDate);
  while (currentDate <= now) {
    const weekStart = new Date(currentDate);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const weekKey = weekStart.toISOString().split("T")[0];

    if (!groupedByWeek[weekKey]) {
      groupedByWeek[weekKey] = {
        pledges: 0,
        votes: 0,
        comments: 0,
        shares: 0,
      };
    }

    currentDate.setDate(currentDate.getDate() + 7); // Move to next week
  }

  // Count activities by type and week
  filteredActivities.forEach((activity) => {
    const activityDate = new Date(activity.createdAt);
    const weekStart = new Date(activityDate);

    // Calculate the start of the week (Sunday)
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const weekKey = weekStart.toISOString().split("T")[0];

    console.log(
      `Activity ${activity.id} (${activity.type}) on ${activity.createdAt} -> week ${weekKey}`
    );

    if (groupedByWeek[weekKey]) {
      switch (activity.type) {
        case "pledge":
          groupedByWeek[weekKey].pledges++;
          break;
        case "like":
        case "dislike":
          groupedByWeek[weekKey].votes++;
          break;
        case "comment":
          groupedByWeek[weekKey].comments++;
          break;
        case "share":
          groupedByWeek[weekKey].shares++;
          break;
      }
    }
  });

  console.log("groupedByWeek in chart", groupedByWeek);

  // Convert to array and sort by date
  const chartData = Object.entries(groupedByWeek)
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log("chartData in chart", chartData);

  return chartData;
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState("6m");

  // Fetch user activities with a reasonable limit
  const { activities, isActivitiesLoading, activitiesError } =
    useUserActivities(100);

  useEffect(() => {
    if (isMobile) {
      setTimeRange("3m");
    }
  }, [isMobile]);

  // Transform activities to chart data
  const chartData = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [];
    }
    return transformActivitiesToChartData(activities, timeRange);
  }, [activities, timeRange]);

  // Handle loading state
  if (isActivitiesLoading) {
    return (
      <Card className="@container/card rounded-xl bg-white border-none shadow-sm">
        <CardHeader className="relative">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (activitiesError) {
    return (
      <Card className="@container/card rounded-xl bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle>Peace Engagement Activity</CardTitle>
          <CardDescription>Unable to load activity data</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            <p>Error loading activity data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty state
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="@container/card rounded-xl bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle>Peace Engagement Activity</CardTitle>
          <CardDescription>
            Your participation metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="mb-2">No activity data available</p>
              <p className="text-sm">
                Start engaging with campaigns to see your activity timeline
                here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card rounded-xl bg-white border-none shadow-sm transition-all hover:shadow-md">
      <CardHeader className="relative">
        <CardTitle>Peace Engagement Activity</CardTitle>
        <CardDescription>
          <span>Your participation metrics over time</span>
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
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillPledges" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillVotes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3498db" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3498db" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillShares" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
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
                    const date = new Date(value);
                    return `Week of ${date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}`;
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="pledges"
              type="monotone"
              fill="url(#fillPledges)"
              stroke="#10b981"
              stackId="1"
            />
            <Area
              dataKey="votes"
              type="monotone"
              fill="url(#fillVotes)"
              stroke="#3498db"
              stackId="1"
            />
            <Area
              dataKey="comments"
              type="monotone"
              fill="url(#fillComments)"
              stroke="#f97316"
              stackId="1"
            />
            <Area
              dataKey="shares"
              type="monotone"
              fill="url(#fillShares)"
              stroke="#8b5cf6"
              stackId="1"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
