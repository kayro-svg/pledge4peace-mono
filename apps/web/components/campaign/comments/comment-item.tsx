import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
}

export default function CommentItem({
  id,
  author,
  content,
  createdAt,
}: CommentItemProps) {
  // Get initials for avatar fallback
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-3 py-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={author.avatar} alt={author.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{author.name}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm mt-1 text-gray-700">{content}</p>
      </div>
    </div>
  );
}
