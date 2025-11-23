"use client";

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
  Flag,
  Clock,
  User,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import {
  approveSolution,
  rejectSolution,
  revertSolutionToDraft,
} from "@/lib/api/solutions";
import { logger } from "@/lib/utils/logger";
import { EditSolutionModal } from "./edit-solution-modal";

interface Post {
  id: string | number;
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
  campaignId?: string;
}

interface PostCardProps {
  post: Post;
  onStatusChange?: (
    id: string | number,
    newStatus: "approved" | "rejected" | "pending"
  ) => void;
  onContentUpdate?: (
    id: string | number,
    updatedContent: { title: string; description: string }
  ) => void;
  campaignTitle?: string;
}

export function PostCard({
  post,
  onStatusChange,
  onContentUpdate,
  campaignTitle,
}: PostCardProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  logger.log("post card", post);

  const handleApprove = async () => {
    try {
      await approveSolution(String(post.id));
      toast.success(`Post "${post.title.slice(0, 30)}..." approved`);
      onStatusChange?.(post.id, "approved");
    } catch {
      toast.error("Failed to approve post");
    }
  };

  const handleReject = async () => {
    try {
      await rejectSolution(String(post.id));
      toast.success(`Post "${post.title.slice(0, 30)}..." rejected`);
      onStatusChange?.(post.id, "rejected");
    } catch {
      toast.error("Failed to reject post");
      return;
    } finally {
      setIsRejecting(false);
    }
  };

  // const handleEdit = () => {
  //   toast.info("Opening post editor...");
  // };

  const handleReopenToPending = async () => {
    try {
      setIsReopening(true);
      await revertSolutionToDraft(String(post.id));
      toast.success(`Post "${post.title.slice(0, 30)}..." moved to pending`);
      onStatusChange?.(post.id, "pending");
    } catch {
      toast.error("Failed to move post to pending");
    } finally {
      setIsReopening(false);
    }
  };

  const handleContentUpdate = (updatedContent: {
    title: string;
    description: string;
  }) => {
    onContentUpdate?.(post.id, updatedContent);
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
        return <Clock className="h-3 w-3 mr-1" />;
      case "approved":
        return <Check className="h-3 w-3 mr-1" />;
      case "rejected":
        return <X className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-3 pb-2 md:p-4 md:pb-0">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`space-y-2 flex justify-between w-full ${
              post.status === "pending" || post.status === "rejected"
                ? "flex-row-reverse items-center justify-between"
                : "flex-col  items-start"
            }`}
          >
            <div
              className={`flex flex-row gap-0 items-center justify-between ${
                post.status === "approved" ? "w-full" : "w-auto"
              }`}
            >
              <Badge
                variant={getStatusColor(post.status)}
                className="capitalize"
              >
                {getStatusIcon(post.status)}
                {post.status} {post.category}
              </Badge>
              {post.status !== "pending" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isReopening}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuSeparator />
                    {post.status === "approved" && (
                      <DropdownMenuItem onClick={handleReopenToPending}>
                        <Flag className="h-4 w-4 mr-2" />
                        Flag for Review
                      </DropdownMenuItem>
                    )}
                    {post.status === "rejected" && (
                      <DropdownMenuItem onClick={handleReopenToPending}>
                        <Flag className="h-4 w-4 mr-2" />
                        Reopen to Pending
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex flex-row items-center gap-2 flex-1">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    {post.author}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(post.submittedAt)}
                  </span>
                </div>
                {campaignTitle && (
                  <span className="text-xs text-muted-foreground">
                    Campaign: {campaignTitle}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-3 md:p-4">
        <h3 className="leading-7 tracking-tight">{post.title}</h3>

        <p className="text-muted-foreground leading-6">
          {isExpanded || post.description.length <= 200
            ? post.description
            : `${post.description.slice(0, 200)}...`}
        </p>

        {post.description.length > 200 && (
          <Button
            variant="link"
            size="sm"
            className="px-0"
            onClick={() => setIsExpanded((v) => !v)}
          >
            {isExpanded ? "Read less" : "Read more"}
          </Button>
        )}

        {post.rejectionReason && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-destructive">
              <strong>Rejection Reason:</strong> {post.rejectionReason}
            </p>
          </div>
        )}
      </CardContent>

      {post.status === "pending" && (
        <CardFooter className="flex gap-3 pt-4 border-t p-3 md:p-4">
          <Button onClick={handleApprove} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
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
                  Are you sure you want to reject this post?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-1" />
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

      <EditSolutionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        solution={{
          id: String(post.id),
          title: post.title,
          description: post.description,
        }}
        onSave={handleContentUpdate}
      />
    </Card>
  );
}
