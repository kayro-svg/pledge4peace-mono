import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Heart, MessageCircle } from "lucide-react";

interface CommentCardProps {
  comment: {
    title: string;
    comment: string;
    date: string;
    likes: number;
    replies: number;
    solution: {
      category: string;
      rank: number;
    };
  };
}

export function CommentHistoryCard({ comment }: CommentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
            {comment.solution.category}
          </Badge>
          <Badge className="bg-slate-100 text-slate-800">
            Rank #{comment.solution.rank}
          </Badge>
        </div>
        <CardTitle className="line-clamp-1 text-base">
          {comment.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-4 text-sm text-slate-600">{comment.comment}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>{comment.date}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Heart className="mr-1 h-3 w-3 text-red-500" /> {comment.likes}
            </div>
            <div className="flex items-center">
              <MessageCircle className="mr-1 h-3 w-3" /> {comment.replies}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-full border-[#2f4858] text-[#2f4858]"
        >
          View Full Discussion
        </Button>
      </CardFooter>
    </Card>
  );
}
