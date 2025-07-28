"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ExternalLink, Clock } from "lucide-react";
import { useUserComments } from "@/hooks/useUserInvolvement";
import { CommentHistoryCard } from "./comment-history-card";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export function CommentariesHistory() {
  const [showAll, setShowAll] = useState(false);
  const {
    comments,
    isCommentsLoading: isLoading,
    commentsError: error,
    refetchComments,
    campaignDetails,
    isCampaignsLoading,
  } = useUserComments(showAll ? 20 : 3);

  if (isLoading || isCampaignsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="w-full border border-gray-200">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
                <div className="p-4 pt-0">
                  <Skeleton className="h-9 w-full rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 mb-2">Error loading comments: {error}</p>
            <Button onClick={refetchComments} variant="outline" size="sm">
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Recent Comments
        </CardTitle>
        <p className="text-sm text-slate-500">
          Your latest comments on solutions
        </p>
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-slate-500 mb-2">No comments yet</p>
            <p className="text-sm text-slate-400">
              Start commenting on solutions to see your comments here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            {comments.map((comment) => (
              <div key={comment.id} className="w-full h-full">
                <CommentHistoryCard
                  comment={comment}
                  campaignSlug={campaignDetails[comment.campaignId]?.slug}
                />
              </div>
            ))}

            {/* View More/Less Button */}
            {comments.length >= 3 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  disabled={isLoading}
                >
                  {showAll ? "View less comments" : "View more comments"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
