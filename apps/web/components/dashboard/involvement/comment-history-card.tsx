import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RecentComment } from "@/lib/api/user-involvement";
import { Clock } from "lucide-react";
import { useLocale } from "next-intl";

interface CommentCardProps {
  comment: RecentComment;
  campaignSlug?: string;
}

export function CommentHistoryCard({
  comment,
  campaignSlug,
}: CommentCardProps) {
  const locale = useLocale() as string;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 168) {
      // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      const weeks = Math.floor(diffInHours / 168);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="w-full h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1 text-lg">
            {comment.solutionTitle}
          </CardTitle>
          {/* {comment.rank && (
            <Badge className="bg-slate-100 text-slate-800">
              Rank #{comment.rank}
            </Badge>
          )} */}
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-4 text-sm text-slate-600">
          {truncateText(comment.content)}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="mr-1 h-3 w-3" /> {formatDate(comment.createdAt)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-full border-[#2f4858] text-[#2f4858]"
          onClick={() => {
            const prefix = locale ? `/${locale}` : "";
            const params = new URLSearchParams();
            params.set("solutionId", comment.solutionId);
            params.set("commentId", comment.id);
            params.set("action", "comment");
            const slugOrId = campaignSlug || "";
            const path = `${prefix}/campaigns/${slugOrId}${params.toString() ? `?${params.toString()}` : ""}`;
            window.open(path, "_blank");
          }}
        >
          View Full Discussion
        </Button>
      </CardFooter>
    </Card>
  );
}
