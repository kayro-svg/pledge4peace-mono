"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  BarChart3,
  MessageSquare,
  Trophy,
  Award,
  TrendingUp,
  Users,
} from "lucide-react";
import { User } from "next-auth";
import UserMetaCard from "./user-meta-card";

export default function UserProfilePage({ user }: { user: User }) {
  const userStats = [
    {
      label: "Participation Score",
      value: 85,
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      label: "Consistency",
      value: 72,
      icon: Calendar,
      color: "text-green-600",
    },
    {
      label: "Comments",
      value: 94,
      icon: MessageSquare,
      color: "text-purple-600",
    },
  ];

  const interests = [
    { name: "Democracy", color: "bg-emerald-100 text-emerald-800" },
    { name: "Economy", color: "bg-blue-100 text-blue-800" },
    { name: "Education", color: "bg-purple-100 text-purple-800" },
    { name: "Environment", color: "bg-orange-100 text-orange-800" },
    { name: "Human Rights", color: "bg-red-100 text-red-800" },
  ];

  const achievements = [
    {
      icon: Award,
      title: "Active Participant",
      description: "Participated in 10 events",
    },
    {
      icon: TrendingUp,
      title: "Top Commenter",
      description: "Commented on 100 posts",
    },
    {
      icon: Users,
      title: "Veteran member",
      description: "Joined in 2023",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <UserMetaCard user={user} />
      {/* Content */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="grid gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div key={index} className="flex items-start gap-3">
                    <achievement.icon className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  {/* <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {achievement.description}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {achievement.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600">
                        {achievement.description}
                      </span>
                    </div>
                  </div> */}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Stats */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Profile Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {userStats.map((stat, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}
                        >
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">
                              {stat.label}
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                              {stat.value}%
                            </span>
                          </div>
                          <Progress value={stat.value} className="h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Contact Info */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">+09 363 398 46</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">Ciudad, País</span>
                  </div>
                </CardContent>
              </Card> */}

              {/* Interests */}
              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest, index) => (
                      <Badge key={index} className={interest.color}>
                        {interest.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
