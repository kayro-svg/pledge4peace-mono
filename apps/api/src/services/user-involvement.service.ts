import { comments } from "../db/schema/comments";
import { solutionInteractions } from "../db/schema/interactions";
import { solutions } from "../db/schema/solutions";
import { pledges } from "../db/schema/pledges";
import { users } from "../db/schema/users";
import type { DbClient } from "../types";
import { eq, and, inArray, sql, desc, gte, isNotNull } from "drizzle-orm";

interface UserStats {
  totalVotes: number;
  totalLikes: number;
  totalDislikes: number;
  totalShares: number;
  totalComments: number;
  totalPledges: number;
  monthlyVotes: number;
  monthlyComments: number;
  monthlyPledges: number;
}

interface RecentActivity {
  id: string;
  type: "like" | "dislike" | "share" | "comment" | "pledge";
  solutionId?: string;
  campaignId: string;
  solutionTitle?: string;
  campaignTitle?: string;
  category?: string;
  content?: string;
  createdAt: Date;
  rank?: number;
}

interface RecentComment {
  id: string;
  content: string;
  createdAt: Date;
  solutionId: string;
  solutionTitle: string;
  campaignId: string;
  campaignTitle?: string;
  category?: string;
  rank?: number;
  likes?: number;
  dislikes?: number;
}

interface UserInvolvementData {
  userId: string;
  stats: UserStats;
  recentActivities: RecentActivity[];
  recentComments: RecentComment[];
  solutionLiked: string[];
  solutionDisliked: string[];
  solutionShared: string[];
  campaignStats: {
    [campaignId: string]: {
      campaignTitle?: string;
      category?: string;
      likes: number;
      dislikes: number;
      shares: number;
      comments: number;
      pledges: number;
    };
  };
  userProfileDashboard?: {
    profileStats: {
      participationScore: number;
      consistencyScore: number;
      engagementScore: number;
    };
    userInfo: {
      name: string;
      email: string;
      avatar: string;
    };
    userInterests: {
      category: string;
      color: string;
    }[];
    userAddress: {
      country: string;
      city: string;
      state: string;
    };
    userSocialMedia: {
      facebook: string;
      twitter: string;
      linkedin: string;
      instagram: string;
    };
    achievements: { icon: string; title: string; description: string }[];
  };
}

// Define types for query results
interface SolutionData {
  id: string;
  title: string;
  campaignId: string;
  createdAt: Date;
}

interface InteractionWithSolution {
  id: string;
  solutionId: string;
  userId: string;
  type: "like" | "dislike" | "share";
  createdAt: Date;
  status: string;
  solution: SolutionData;
}

interface CommentWithSolution {
  id: string;
  solutionId: string;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  parentId: string | null;
  solution: SolutionData;
}

export class UserInvolvementService {
  constructor(private db: DbClient) {}

  /**
   * Calculate user profile metrics based on activity and engagement
   */
  private calculateProfileMetrics(
    stats: UserStats,
    userCreatedAt: Date,
    campaignStats: Record<string, any>
  ): {
    participationScore: number;
    consistencyScore: number;
    engagementScore: number;
  } {
    const now = new Date();
    const daysSinceRegistration = Math.max(
      1,
      Math.floor(
        (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    // Participation Score (0-100): Based on total activity and campaigns involved
    const totalActivities =
      stats.totalVotes +
      stats.totalComments +
      stats.totalPledges +
      stats.totalShares;
    const campaignCount = Object.keys(campaignStats).length;
    const participationScore = Math.min(
      100,
      Math.floor(totalActivities * 2 + campaignCount * 10)
    );

    // Consistency Score (0-100): Based on monthly activity vs total activity
    const monthlyActivities =
      stats.monthlyVotes + stats.monthlyComments + stats.monthlyPledges;
    const consistencyScore =
      totalActivities > 0
        ? Math.min(
            100,
            Math.floor(
              (monthlyActivities /
                Math.max(
                  1,
                  totalActivities / Math.min(daysSinceRegistration / 30, 12)
                )) *
                100
            )
          )
        : 0;

    // Engagement Score (0-100): Based on quality of interactions (comments have higher weight)
    const engagementScore = Math.min(
      100,
      Math.floor(
        stats.totalComments * 15 +
          stats.totalVotes * 5 +
          stats.totalPledges * 10 +
          stats.totalShares * 8
      )
    );

    return {
      participationScore: Math.max(0, participationScore),
      consistencyScore: Math.max(0, consistencyScore),
      engagementScore: Math.max(0, engagementScore),
    };
  }

  /**
   * Calculate user interests based on campaign categories they engage with
   */
  private calculateUserInterests(
    campaignStats: Record<
      string,
      {
        category?: string;
        likes: number;
        dislikes: number;
        shares: number;
        comments: number;
        pledges: number;
      }
    >
  ): { category: string; color: string }[] {
    const categoryEngagement: Record<string, number> = {};

    // Count engagement per category
    Object.values(campaignStats).forEach((campaign) => {
      if (campaign.category) {
        const engagementScore =
          campaign.likes +
          campaign.dislikes +
          campaign.shares +
          campaign.comments * 2 + // Comments have higher weight
          campaign.pledges * 3; // Pledges have highest weight

        categoryEngagement[campaign.category] =
          (categoryEngagement[campaign.category] || 0) + engagementScore;
      }
    });

    // Sort categories by engagement and take top 5
    const sortedCategories = Object.entries(categoryEngagement)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Map to interests with colors
    const colorMap: Record<string, string> = {
      Democracy: "bg-emerald-100 text-emerald-800",
      Economy: "bg-blue-100 text-blue-800",
      Education: "bg-purple-100 text-purple-800",
      Environment: "bg-orange-100 text-orange-800",
      "Human Rights": "bg-red-100 text-red-800",
      Healthcare: "bg-green-100 text-green-800",
      Technology: "bg-indigo-100 text-indigo-800",
      "Social Justice": "bg-pink-100 text-pink-800",
      Security: "bg-yellow-100 text-yellow-800",
      Culture: "bg-teal-100 text-teal-800",
    };

    return sortedCategories.map(([category]) => ({
      category,
      color: colorMap[category] || "bg-gray-100 text-gray-800",
    }));
  }

  /**
   * Calculate user achievements based on activity
   */
  private calculateUserAchievements(
    stats: UserStats,
    userCreatedAt: Date,
    campaignStats: Record<string, any>
  ): { icon: string; title: string; description: string }[] {
    const achievements: { icon: string; title: string; description: string }[] =
      [];
    const now = new Date();
    const daysSinceRegistration = Math.floor(
      (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Veteran Member (based on registration date)
    if (daysSinceRegistration > 365) {
      achievements.push({
        icon: "Users",
        title: "Veteran Member",
        description: `Joined ${Math.floor(daysSinceRegistration / 365)} year${Math.floor(daysSinceRegistration / 365) > 1 ? "s" : ""} ago`,
      });
    } else if (daysSinceRegistration > 30) {
      achievements.push({
        icon: "Users",
        title: "Community Member",
        description: `Active for ${Math.floor(daysSinceRegistration / 30)} month${Math.floor(daysSinceRegistration / 30) > 1 ? "s" : ""}`,
      });
    }

    // Active Participant (based on campaign involvement)
    const campaignCount = Object.keys(campaignStats).length;
    if (campaignCount >= 10) {
      achievements.push({
        icon: "Award",
        title: "Super Activist",
        description: `Participated in ${campaignCount} campaigns`,
      });
    } else if (campaignCount >= 5) {
      achievements.push({
        icon: "Award",
        title: "Active Participant",
        description: `Participated in ${campaignCount} campaigns`,
      });
    } else if (campaignCount >= 1) {
      achievements.push({
        icon: "Award",
        title: "Peace Supporter",
        description: `Participated in ${campaignCount} campaign${campaignCount > 1 ? "s" : ""}`,
      });
    }

    // Top Commenter (based on comments)
    if (stats.totalComments >= 100) {
      achievements.push({
        icon: "TrendingUp",
        title: "Top Commenter",
        description: `Commented on ${stats.totalComments} solutions`,
      });
    } else if (stats.totalComments >= 50) {
      achievements.push({
        icon: "TrendingUp",
        title: "Active Commenter",
        description: `Commented on ${stats.totalComments} solutions`,
      });
    } else if (stats.totalComments >= 10) {
      achievements.push({
        icon: "TrendingUp",
        title: "Engaged User",
        description: `Commented on ${stats.totalComments} solutions`,
      });
    }

    // Ensure we always have at least one achievement
    if (achievements.length === 0) {
      achievements.push({
        icon: "Users",
        title: "New Member",
        description: "Welcome to the community!",
      });
    }

    return achievements.slice(0, 3); // Return max 3 achievements
  }

  async getUserInvolvement(
    userId: string,
    campaignTitles?: Record<string, { title: string; category: string }>
  ): Promise<UserInvolvementData> {
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    try {
      // Get user information
      const user = await this.db.query.users
        .findFirst({
          where: eq(users.id, userId),
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
          return null;
        });

      // Get all user interactions with better error handling
      const userInteractions = await this.db.query.solutionInteractions
        .findMany({
          where: and(
            eq(solutionInteractions.userId, userId),
            isNotNull(solutionInteractions.solutionId)
          ),
          with: {
            solution: {
              columns: {
                id: true,
                title: true,
                campaignId: true,
                createdAt: true,
              },
            },
          },
          orderBy: [desc(solutionInteractions.createdAt)],
        })
        .catch((error) => {
          console.error("Error fetching user interactions:", error);
          return [];
        });

      // Get all user comments with better error handling
      const userComments = await this.db.query.comments
        .findMany({
          where: and(
            eq(comments.userId, userId),
            isNotNull(comments.solutionId)
          ),
          with: {
            solution: {
              columns: {
                id: true,
                title: true,
                campaignId: true,
              },
            },
          },
          orderBy: [desc(comments.createdAt)],
        })
        .catch((error) => {
          console.error("Error fetching user comments:", error);
          return [];
        });

      // Get all user pledges with better error handling
      const userPledges = await this.db.query.pledges
        .findMany({
          where: and(eq(pledges.userId, userId), isNotNull(pledges.campaignId)),
          columns: {
            id: true,
            campaignId: true,
            createdAt: true,
          },
          orderBy: [desc(pledges.createdAt)],
        })
        .catch((error) => {
          console.error("Error fetching user pledges:", error);
          return [];
        });

      // Calculate stats
      const stats: UserStats = {
        totalVotes: userInteractions.filter(
          (i) => i.type === "like" || i.type === "dislike"
        ).length,
        totalLikes: userInteractions.filter((i) => i.type === "like").length,
        totalDislikes: userInteractions.filter((i) => i.type === "dislike")
          .length,
        totalShares: userInteractions.filter((i) => i.type === "share").length,
        totalComments: userComments.length,
        totalPledges: userPledges.length,
        monthlyVotes: userInteractions.filter(
          (i) =>
            (i.type === "like" || i.type === "dislike") &&
            new Date(i.createdAt) >= oneMonthAgo
        ).length,
        monthlyComments: userComments.filter(
          (c) => new Date(c.createdAt) >= oneMonthAgo
        ).length,
        monthlyPledges: userPledges.filter(
          (p) => new Date(p.createdAt) >= oneMonthAgo
        ).length,
      };

      // Build recent activities with null checks
      const recentActivities: RecentActivity[] = [];

      // Process interactions
      userInteractions
        .filter(
          (i) =>
            i.solution &&
            typeof i.solution === "object" &&
            "campaignId" in i.solution
        )
        .slice(0, 20)
        .forEach((interaction) => {
          const solution = interaction.solution as any;
          recentActivities.push({
            id: interaction.id,
            type: interaction.type,
            solutionId: interaction.solutionId,
            campaignId: solution.campaignId || "",
            solutionTitle: solution.title || "",
            campaignTitle: campaignTitles?.[solution.campaignId || ""]?.title,
            category: campaignTitles?.[solution.campaignId || ""]?.category,
            createdAt: new Date(interaction.createdAt),
          });
        });

      // Process comments
      userComments
        .filter(
          (c) =>
            c.solution &&
            typeof c.solution === "object" &&
            "campaignId" in c.solution
        )
        .slice(0, 10)
        .forEach((comment) => {
          const solution = comment.solution as any;
          recentActivities.push({
            id: comment.id,
            type: "comment" as const,
            solutionId: comment.solutionId,
            campaignId: solution.campaignId || "",
            solutionTitle: solution.title || "",
            campaignTitle: campaignTitles?.[solution.campaignId || ""]?.title,
            category: campaignTitles?.[solution.campaignId || ""]?.category,
            content: comment.content,
            createdAt: new Date(comment.createdAt),
          });
        });

      // Process pledges
      userPledges.slice(0, 10).forEach((pledge) => {
        recentActivities.push({
          id: pledge.id,
          type: "pledge" as const,
          campaignId: pledge.campaignId,
          campaignTitle: campaignTitles?.[pledge.campaignId]?.title,
          category: campaignTitles?.[pledge.campaignId]?.category,
          createdAt: new Date(pledge.createdAt),
        });
      });

      // Sort recent activities by date
      recentActivities.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      // Build recent comments with more details and null checks
      const recentComments: RecentComment[] = [];
      userComments
        .filter(
          (c) =>
            c.solution &&
            typeof c.solution === "object" &&
            "campaignId" in c.solution
        )
        .slice(0, 15)
        .forEach((comment, index) => {
          const solution = comment.solution as any;
          recentComments.push({
            id: comment.id,
            content: comment.content,
            createdAt: new Date(comment.createdAt),
            solutionId: comment.solutionId,
            solutionTitle: solution.title || "",
            campaignId: solution.campaignId || "",
            campaignTitle: campaignTitles?.[solution.campaignId || ""]?.title,
            category: campaignTitles?.[solution.campaignId || ""]?.category,
            rank: index + 1,
          });
        });

      // Build campaign stats
      const campaignStats: UserInvolvementData["campaignStats"] = {};

      // Process interactions
      userInteractions
        .filter(
          (i) =>
            i.solution &&
            typeof i.solution === "object" &&
            "campaignId" in i.solution
        )
        .forEach((interaction) => {
          const solution = interaction.solution as any;
          const campaignId = solution.campaignId;
          if (!campaignId) return;

          if (!campaignStats[campaignId]) {
            campaignStats[campaignId] = {
              campaignTitle: campaignTitles?.[campaignId]?.title,
              category: campaignTitles?.[campaignId]?.category,
              likes: 0,
              dislikes: 0,
              shares: 0,
              comments: 0,
              pledges: 0,
            };
          }

          if (interaction.type === "like") campaignStats[campaignId].likes++;
          else if (interaction.type === "dislike")
            campaignStats[campaignId].dislikes++;
          else if (interaction.type === "share")
            campaignStats[campaignId].shares++;
        });

      // Process comments
      userComments
        .filter(
          (c) =>
            c.solution &&
            typeof c.solution === "object" &&
            "campaignId" in c.solution
        )
        .forEach((comment) => {
          const solution = comment.solution as any;
          const campaignId = solution.campaignId;
          if (!campaignId) return;

          if (!campaignStats[campaignId]) {
            campaignStats[campaignId] = {
              campaignTitle: campaignTitles?.[campaignId]?.title,
              category: campaignTitles?.[campaignId]?.category,
              likes: 0,
              dislikes: 0,
              shares: 0,
              comments: 0,
              pledges: 0,
            };
          }

          campaignStats[campaignId].comments++;
        });

      // Process pledges
      userPledges.forEach((pledge) => {
        const campaignId = pledge.campaignId;
        if (!campaignId) return;

        if (!campaignStats[campaignId]) {
          campaignStats[campaignId] = {
            campaignTitle: campaignTitles?.[campaignId]?.title,
            category: campaignTitles?.[campaignId]?.category,
            likes: 0,
            dislikes: 0,
            shares: 0,
            comments: 0,
            pledges: 0,
          };
        }

        campaignStats[campaignId].pledges++;
      });

      // Calculate profile dashboard data
      let userProfileDashboard:
        | UserInvolvementData["userProfileDashboard"]
        | undefined;

      if (user) {
        const profileStats = this.calculateProfileMetrics(
          stats,
          new Date(user.createdAt),
          campaignStats
        );

        const userInterests = this.calculateUserInterests(campaignStats);

        const achievements = this.calculateUserAchievements(
          stats,
          new Date(user.createdAt),
          campaignStats
        );

        userProfileDashboard = {
          profileStats,
          userInfo: {
            name: user.name,
            email: user.email,
            avatar: user.image || "",
          },
          userInterests,
          achievements,
          // TODO: These fields should be populated from user profile when implemented
          userAddress: {
            country: "",
            city: "",
            state: "",
          },
          userSocialMedia: {
            facebook: "",
            twitter: "",
            linkedin: "",
            instagram: "",
          },
        };
      }

      return {
        userId,
        stats,
        recentActivities: recentActivities.slice(0, 50),
        recentComments,
        solutionLiked: userInteractions
          .filter((i) => i.type === "like")
          .map((i) => i.solutionId),
        solutionDisliked: userInteractions
          .filter((i) => i.type === "dislike")
          .map((i) => i.solutionId),
        solutionShared: userInteractions
          .filter((i) => i.type === "share")
          .map((i) => i.solutionId),
        campaignStats,
        userProfileDashboard,
      };
    } catch (error) {
      console.error("Error in getUserInvolvement:", error);
      // Return empty data structure if everything fails
      return {
        userId,
        stats: {
          totalVotes: 0,
          totalLikes: 0,
          totalDislikes: 0,
          totalShares: 0,
          totalComments: 0,
          totalPledges: 0,
          monthlyVotes: 0,
          monthlyComments: 0,
          monthlyPledges: 0,
        },
        recentActivities: [],
        recentComments: [],
        solutionLiked: [],
        solutionDisliked: [],
        solutionShared: [],
        campaignStats: {},
        userProfileDashboard: undefined,
      };
    }
  }

  async getUserInvolvementStats(userId: string): Promise<UserStats> {
    const data = await this.getUserInvolvement(userId);
    return data.stats;
  }

  async getUserRecentActivity(
    userId: string,
    limit: number = 20
  ): Promise<RecentActivity[]> {
    const data = await this.getUserInvolvement(userId);
    return data.recentActivities.slice(0, limit);
  }

  async getUserRecentComments(
    userId: string,
    limit: number = 10
  ): Promise<RecentComment[]> {
    const data = await this.getUserInvolvement(userId);
    return data.recentComments.slice(0, limit);
  }
}
