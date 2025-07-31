import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  AlertTriangle,
} from "lucide-react";

interface ModerationStatsProps {
  pending: number;
  approved: number;
  rejected: number;
}

export function ModerationStats({
  pending,
  approved,
  rejected,
}: ModerationStatsProps) {
  const total = pending + approved + rejected;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;

  const stats = [
    {
      title: "Pending Review",
      value: pending,
      icon: Clock,
      description: `${pendingRate}% of total`,
      variant: "destructive" as const,
      urgent: pending > 5,
    },
    {
      title: "Approved",
      value: approved,
      icon: CheckCircle,
      description: `${approvalRate}% approval rate`,
      variant: "default" as const,
      urgent: false,
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      description: `${total > 0 ? Math.round((rejected / total) * 100) : 0}% of total`,
      variant: "secondary" as const,
      urgent: false,
    },
    {
      title: "Total Posts",
      value: total,
      icon: Users,
      description: "All time submissions",
      variant: "outline" as const,
      urgent: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm tracking-wide text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {stat.urgent && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl tracking-tight">{stat.value}</div>
                  {stat.urgent && (
                    <Badge variant="destructive" className="text-xs">
                      Action needed
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
