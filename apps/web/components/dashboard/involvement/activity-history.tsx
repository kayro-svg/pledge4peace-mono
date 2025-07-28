"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink } from "lucide-react";
import { useUserActivities } from "@/hooks/useUserInvolvement";
import {
  formatActivityDescription,
  getActivityIcon,
  getActivityColor,
  RecentActivity,
  formatActivityType,
} from "@/lib/api/user-involvement";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityHistoryProps {
  showAllVotes: boolean;
  showAllComments: boolean;
  showAllUpvotes: boolean;
  showAllDownvotes: boolean;
  resetAllFilters: () => void;
}

export function ActivityHistory({
  showAllVotes,
  showAllComments,
  showAllUpvotes,
  showAllDownvotes,
  resetAllFilters,
}: ActivityHistoryProps) {
  const [showAll, setShowAll] = useState(false);

  const router = useRouter();
  const {
    activities,
    isActivitiesLoading: isLoading,
    activitiesError: error,
    refetchActivities,
    campaignDetails,
    isCampaignsLoading,
  } = useUserActivities(showAll ? 20 : 5);

  const [activitiesToShow, setActivitiesToShow] =
    useState<RecentActivity[]>(activities);

  useEffect(() => {
    // Aplicar filtros a las actividades
    const filtered = activities.filter((activity) => {
      // Si no hay filtros activos, mostrar todas las actividades
      if (
        !showAllVotes &&
        !showAllComments &&
        !showAllUpvotes &&
        !showAllDownvotes
      ) {
        return true;
      }

      // Filtrar por tipo específico
      if (showAllVotes) {
        return activity.type === "like" || activity.type === "dislike";
      }
      if (showAllComments) {
        return activity.type === "comment";
      }
      if (showAllUpvotes) {
        return activity.type === "like";
      }
      if (showAllDownvotes) {
        return activity.type === "dislike";
      }

      return false;
    });

    setActivitiesToShow(filtered);

    // Si cualquiera de los filtros está activo, forzar la vista completa
    if (showAllVotes || showAllComments || showAllUpvotes || showAllDownvotes) {
      setShowAll(true);
    }
  }, [
    activities,
    showAllVotes,
    showAllComments,
    showAllUpvotes,
    showAllDownvotes,
  ]);

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

  const getCategoryBadgeColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "democracy":
        return "bg-blue-100 text-blue-800";
      case "economy":
        return "bg-green-100 text-green-800";
      case "environment":
        return "bg-emerald-100 text-emerald-800";
      case "education":
        return "bg-purple-100 text-purple-800";
      case "peace":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading || isCampaignsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Activity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border border-slate-200"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
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
            <Clock className="w-5 h-5" />
            Activity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 mb-2">
              Error loading activity history: {error}
            </p>
            <Button onClick={refetchActivities} variant="outline" size="sm">
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
          <Clock className="w-5 h-5" />
          {showAllVotes && "Votes History"}
          {showAllComments && "Comments History"}
          {showAllUpvotes && "Upvotes History"}
          {showAllDownvotes && "Downvotes History"}
          {!showAllVotes &&
            !showAllComments &&
            !showAllUpvotes &&
            !showAllDownvotes &&
            "Activity History"}
        </CardTitle>
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">
            {showAllVotes && "All your votes on solutions and campaigns"}
            {showAllComments && "All your comments on solutions and campaigns"}
            {showAllUpvotes && "All your upvotes on solutions"}
            {showAllDownvotes && "All your downvotes on solutions"}
            {!showAllVotes &&
              !showAllComments &&
              !showAllUpvotes &&
              !showAllDownvotes &&
              "Your involvement in solutions and debates"}
          </p>
          {(showAllVotes ||
            showAllComments ||
            showAllUpvotes ||
            showAllDownvotes) && (
            <Button variant="ghost" size="sm" onClick={resetAllFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-slate-500 mb-2">No activity yet</p>
            <p className="text-sm text-slate-400">
              Start engaging with solutions to see your activity history here.
            </p>
          </div>
        ) : activitiesToShow.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-slate-500 mb-2">No matching activities found</p>
            <p className="text-sm text-slate-400">
              Try selecting a different filter or clear the current filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activitiesToShow.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => {
                  router.push(
                    `/campaigns/${campaignDetails[activity.campaignId]?.slug}`
                  );
                }}
              >
                {/* Activity Icon */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${getActivityColor(activity.type).replace("text-", "bg-").replace("-600", "-100")}`}
                >
                  <span className="text-sm">
                    {getActivityIcon(activity.type)}
                  </span>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {formatActivityDescription(activity, campaignDetails)}
                      </p>

                      {activity.content && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          "{activity.content}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        {activity.category && (
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getCategoryBadgeColor(activity.category)}`}
                          >
                            {activity.category}
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Link to solution/campaign */}
                    {campaignDetails[activity.campaignId] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6"
                        onClick={() => {
                          router.push(
                            `/campaigns/${
                              campaignDetails[activity.campaignId]?.slug
                            }`
                          );
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* View More/Less Button */}
            {activities.length >= 5 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAll(!showAll);
                  }}
                  disabled={isLoading}
                >
                  {showAll ? "View less activity" : "View more activity"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
