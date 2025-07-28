"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  BarChart3,
  MessageSquare,
  Trophy,
  Award,
  TrendingUp,
  Users,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { User } from "next-auth";
import UserMetaCard from "./user-meta-card";
import { useUserProfileDashboard } from "@/hooks/useUserInvolvement";
import { logger } from "@/lib/utils/logger";

// Icon mapping for achievements
const iconMap = {
  Award,
  TrendingUp,
  Users,
  BarChart3,
  Calendar,
  MessageSquare,
  Trophy,
};

// Define Achievement type to include id
interface Achievement {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}

export default function UserProfilePage({ user }: { user: User }) {
  const {
    dashboardData,
    isDashboardLoading,
    dashboardError,
    refetchDashboard,
  } = useUserProfileDashboard();

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen">
        <UserMetaCard user={user} />
        <div className="max-w-7xl mx-auto py-8">
          <div className="grid gap-6">
            {/* Loading state for achievements */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Achievements
                  </h2>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center py-8">
                    <Skeleton className="h-24 w-24 rounded-full" />
                  </div>
                  <div className="space-y-2 text-center">
                    <Skeleton className="h-6 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Loading state for main stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="h-5 w-5 text-gray-700" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Profile Stats
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Loading state for interests */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Interests
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-6 w-16 rounded-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen">
        <UserMetaCard user={user} />
        <div className="max-w-7xl mx-auto py-8">
          <div className="grid gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-red-600 mb-4">
                    Error loading profile data: {dashboardError}
                  </p>
                  <button
                    onClick={refetchDashboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Use dynamic data if available, otherwise fall back to static data
  const profileData = dashboardData?.userProfileDashboard;

  const userStats = profileData
    ? [
        {
          label: "Participation Score",
          value: profileData.profileStats.participationScore,
          icon: BarChart3,
          color: "text-blue-600",
        },
        {
          label: "Consistency",
          value: profileData.profileStats.consistencyScore,
          icon: Calendar,
          color: "text-green-600",
        },
        {
          label: "Comments",
          value: profileData.profileStats.engagementScore,
          icon: MessageSquare,
          color: "text-purple-600",
        },
      ]
    : [
        {
          label: "Participation Score",
          value: 0,
          icon: BarChart3,
          color: "text-blue-600",
        },
        {
          label: "Consistency",
          value: 0,
          icon: Calendar,
          color: "text-green-600",
        },
        {
          label: "Comments",
          value: 0,
          icon: MessageSquare,
          color: "text-purple-600",
        },
      ];

  logger.log("profileData userInterests", profileData?.userInterests);

  const interests = profileData?.userInterests || [
    {
      category: "Democracy",
      color: "bg-green-50 text-green-700 border-green-200",
    },
    { category: "Economy", color: "bg-blue-50 text-blue-700 border-blue-200" },
    {
      category: "Education",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      category: "Environment",
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      category: "Human Rights",
      color: "bg-red-50 text-red-700 border-red-200",
    },
  ];

  // Map API achievements to our component's Achievement type with generated IDs
  const achievements: Achievement[] = profileData?.achievements
    ? profileData.achievements.map((achievement, index) => ({
        id: `achievement-${index}`,
        icon: iconMap[achievement.icon as keyof typeof iconMap] || Trophy,
        title: achievement.title,
        description: achievement.description,
        color: "bg-blue-500",
      }))
    : [
        {
          id: "default-achievement",
          icon: Trophy,
          title: "Peace Supporter",
          description: "Participated in 4 campaigns",
          color: "bg-blue-500",
        },
        {
          id: "default-achievement-2",
          icon: Trophy,
          title: "Peace Supporter",
          description: "Participated in 4 campaigns",
          color: "bg-blue-500",
        },
        {
          id: "default-achievement-3",
          icon: Trophy,
          title: "Peace Supporter",
          description: "Participated in 4 campaigns",
          color: "bg-blue-500",
        },
      ];

  logger.log("profileData", profileData);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <UserMetaCard user={user} />
      {/* Content */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="grid gap-6">
          {/* Achievements Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Achievements
                </h2>
              </div>
              {achievements.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Badge
                    variant="secondary"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {achievements.length} earned
                  </Badge>
                </div>
              )}
            </div>

            {achievements.length === 0 ? (
              // Empty state
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
                <CardContent className="p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No achievements yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start participating in campaigns and activities to unlock
                    your first achievement and showcase your impact!
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Trophy className="h-4 w-4 mr-2" />
                    Explore Activities
                  </Button>
                </CardContent>
              </Card>
            ) : achievements.length === 1 ? (
              // Single achievement design
              <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
                <CardContent className="p-10">
                  <div className="text-center max-w-lg mx-auto">
                    {/* Featured Achievement Badge */}
                    <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      Your first achievement!
                    </Badge>

                    {/* Icon with glow effect */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                      <div
                        className={`relative w-24 h-24 ${achievements[0].color} rounded-full flex items-center justify-center mx-auto shadow-xl`}
                      >
                        {(() => {
                          const IconComponent = achievements[0].icon;
                          return (
                            <IconComponent className="h-12 w-12 text-white" />
                          );
                        })()}
                      </div>
                    </div>

                    {/* Title and description */}
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">
                      {achievements[0].title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-8">
                      {achievements[0].description}
                    </p>

                    {/* Additional info */}
                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Earned recently</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : achievements.length === 2 ? (
              // Two achievements design
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <Card
                      key={achievement.id}
                      className="bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md group"
                    >
                      <CardContent className="p-8">
                        <div className="text-center">
                          <div
                            className={`w-16 h-16 ${achievement.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {achievement.title}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {achievement.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // Multiple achievements (3+)
              <div className="space-y-6">
                {/* Featured achievement (first one) */}
                {/* <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        {(() => {
                          const Icon = achievements[0].icon;
                          return <Icon className="h-8 w-8 text-white" />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-yellow-400 text-yellow-900 border-0">
                            🏆 Top Achievement
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">
                          {achievements[0].title}
                        </h3>
                        <p className="text-blue-100">
                          {achievements[0].description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}

                {/* Rest of achievements in grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                      <Card
                        key={achievement.id}
                        className="bg-white hover:shadow-lg transition-all duration-300 border-0 shadow-sm group hover:-translate-y-1"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-12 h-12 ${achievement.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                            >
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {achievement.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Grid of two columns for Profile Stats and Interests */}
          <div className="flex flex-row gap-6">
            {/* Profile Stats */}
            <Card className="bg-white w-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="h-5 w-5 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Stats
                  </h2>
                </div>
                <div className="space-y-6">
                  {userStats.map((stat, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {stat.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {stat.value}%
                        </span>
                      </div>
                      <Progress value={stat.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {interests.length > 0 && (
              <Card className="bg-white w-full">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Interests
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {interests.length > 0 ? (
                      interests.map((interest, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={interest.color}
                        >
                          {interest.category}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Start participating in campaigns to discover your
                        interests!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
