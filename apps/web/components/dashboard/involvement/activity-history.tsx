import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, ExternalLink } from "lucide-react";

import { Share2, MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react";

const activityHistory = [
  {
    type: "upvote",
    title: "Strengthen Democracy & Accountability within Political Parties",
    category: "Democracy",
    date: "2 days ago",
  },
  {
    type: "comment",
    title:
      "Land Reforms, Eliminate Mafias, and Redistribute Resources in Pakistan",
    category: "Economy",
    date: "3 days ago",
  },
  {
    type: "downvote",
    title:
      "A Charter of Economy Should Be Signed and Supported by All Political Parties",
    category: "Economy",
    date: "5 days ago",
  },
  {
    type: "share",
    title: "Implement Nationwide Education Reform",
    category: "Education",
    date: "1 week ago",
  },
  {
    type: "upvote",
    title: "Environmental Protection Initiative",
    category: "Environment",
    date: "1 week ago",
  },
];

function getActivityIconBg(type: string) {
  switch (type) {
    case "upvote":
      return "bg-blue-100";
    case "downvote":
      return "bg-orange-100";
    case "comment":
      return "bg-purple-100";
    case "share":
      return "bg-emerald-100";
    default:
      return "bg-slate-100";
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case "upvote":
      return <ThumbsUp className="h-5 w-5 text-blue-600" />;
    case "downvote":
      return <ThumbsDown className="h-5 w-5 text-orange-600" />;
    case "comment":
      return <MessageSquare className="h-5 w-5 text-purple-600" />;
    case "share":
      return <Share2 className="h-5 w-5 text-emerald-600" />;
    default:
      return <Activity className="h-5 w-5 text-slate-600" />;
  }
}

export function ActivityHistory() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Activity History</CardTitle>
        <CardDescription>
          Your involvement in solutions and debates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {activityHistory.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b p-4 last:border-0 hover:bg-slate-50"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getActivityIconBg(
                  activity.type
                )}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{activity.title}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {activity.category}
                  </Badge>
                  <span className="flex items-center text-xs text-slate-500">
                    <Clock className="mr-1 h-3 w-3" /> {activity.date}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <Button variant="ghost">View more activity</Button>
      </CardFooter>
    </Card>
  );
}
