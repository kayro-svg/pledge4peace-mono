import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Check,
  X,
  MoreHorizontal,
  Eye,
  Edit,
  Flag,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share,
  Clock,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: number;
  title: string;
  description: string;
  author: string;
  submittedAt: string;
  status: string;
  category: string;
  votes: { up: number; down: number };
  comments: number;
  shares: number;
  country: string;
  tags: string[];
  rejectionReason?: string;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = () => {
    toast.success(`Post "${post.title.slice(0, 30)}..." has been approved`);
    // Here you would typically update the post status in your database
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    toast.success(`Post "${post.title.slice(0, 30)}..." has been rejected`);
    setIsRejecting(false);
    setRejectionReason("");
    // Here you would typically update the post status in your database
  };

  const handleEdit = () => {
    toast.info("Opening post editor...");
    // Here you would open an edit modal or navigate to edit page
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "destructive";
      case "approved":
        return "default";
      case "rejected":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "approved":
        return <Check className="h-3 w-3" />;
      case "rejected":
        return <X className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Badge
                variant={getStatusColor(post.status)}
                className="capitalize"
              >
                {getStatusIcon(post.status)}
                {post.status}
              </Badge>
              <Badge variant="outline">{post.category}</Badge>
              <Badge variant="outline">{post.country}</Badge>
            </div>
            <h3 className="leading-7 tracking-tight">{post.title}</h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => toast.info("Opening detailed view...")}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.info("Flagging for admin review...")}
              >
                <Flag className="h-4 w-4 mr-2" />
                Flag for Review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-6">
          {post.description.length > 200
            ? `${post.description.slice(0, 200)}...`
            : post.description}
        </p>

        {post.rejectionReason && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-destructive">
              <strong>Rejection Reason:</strong> {post.rejectionReason}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {post.author}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(post.submittedAt)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              {post.votes.up}
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-4 w-4" />
              {post.votes.down}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {post.comments}
            </div>
            <div className="flex items-center gap-1">
              <Share className="h-4 w-4" />
              {post.shares}
            </div>
          </div>
        </div>
      </CardContent>

      {post.status === "pending" && (
        <CardFooter className="flex gap-3 pt-4 border-t">
          <Button onClick={handleApprove} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>

          <AlertDialog open={isRejecting} onOpenChange={setIsRejecting}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Post</AlertDialogTitle>
                <AlertDialogDescription>
                  Please provide a reason for rejecting this post. This will be
                  visible to the author.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Textarea
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Reject Post
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
}
