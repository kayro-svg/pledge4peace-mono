"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getMyReviews } from "@/lib/api/peace-seal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Star,
  Calendar,
  Building,
  Globe,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { logger } from "@/lib/utils/logger";
import { toast } from "@/hooks/use-toast";

type UserReview = {
  id: string;
  companyId: string;
  role: string;
  verificationStatus: "pending" | "verified" | "unverified";
  verificationMethod?: string;
  totalScore?: number | null;
  starRating?: number | null;
  createdAt: number | string;
  verifiedAt?: number | string | null;
  companyName?: string;
  companySlug?: string;
  companyCountry?: string;
  companyIndustry?: string;
};

function getVerificationIcon(status: string) {
  switch (status) {
    case "verified":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case "unverified":
      return <XCircle className="w-4 h-4 text-gray-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
  }
}

function getVerificationLabel(status: string): string {
  switch (status) {
    case "verified":
      return "Verified";
    case "pending":
      return "Pending Verification";
    case "unverified":
      return "Unverified";
    default:
      return "Unknown";
  }
}

function getVerificationColor(status: string): string {
  switch (status) {
    case "verified":
      return "bg-green-50 text-green-700 border-green-200";
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "unverified":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case "employee":
      return "Employee";
    case "customer":
      return "Customer";
    case "investor":
      return "Investor";
    case "supplier":
      return "Supplier";
    default:
      return role;
  }
}

function StarRating({ rating }: { rating?: number | null }) {
  if (!rating) return null;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
    </div>
  );
}

export default function MyReviewsDashboard() {
  const { session } = useAuthSession();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const isUser = session?.user?.role === "user";

  const loadReviews = useCallback(async () => {
    if (!isUser) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getMyReviews({
        page,
        limit: 10,
      });

      if (page === 1) {
        setReviews(result.items);
      } else {
        setReviews((prev) => [...prev, ...result.items]);
      }

      setTotal(result.total);
      setHasMore(
        result.items.length === 10 &&
          reviews.length + result.items.length < result.total
      );
    } catch (error) {
      logger.error("Failed to load reviews:", error);
      setError("Failed to load your reviews. Please try again.");
      toast({
        title: "Error loading reviews",
        description:
          "There was an error loading your reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isUser, page]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  // Check if user has the right role
  if (!isUser) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This dashboard is only available for regular users.
            </p>
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#548281] mb-4"></div>
        <p className="text-gray-600">Loading your reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadReviews} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 py-6">
        <div className="px-4 lg:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-[#548281]" />
                My Community Reviews
              </h1>
              <p className="text-gray-600 mt-2">
                Track your community reviews and their verification status
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <MessageSquare className="w-4 h-4" />
              <span>
                {total} review{total !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't submitted any community reviews yet. Start by
                  reviewing companies you've worked with or interacted with.
                </p>
                <Button
                  onClick={() => window.open("/peace-seal", "_blank")}
                  className="flex items-center gap-2 mx-auto"
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  Browse Companies to Review
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card
                  key={review.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {review.companyName}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {getRoleLabel(review.role)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          {review.companyCountry && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              <span>{review.companyCountry}</span>
                            </div>
                          )}
                          {review.companyIndustry && (
                            <div className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              <span>{review.companyIndustry}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getVerificationIcon(review.verificationStatus)}
                            <Badge
                              className={`${getVerificationColor(review.verificationStatus)} border text-xs px-2 py-1`}
                            >
                              {getVerificationLabel(review.verificationStatus)}
                            </Badge>
                          </div>

                          {review.starRating && (
                            <StarRating rating={review.starRating} />
                          )}

                          {review.totalScore && (
                            <div className="text-sm text-gray-600">
                              Score:{" "}
                              <span className="font-medium">
                                {review.totalScore}/100
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `/peace-seal/company/${review.companySlug}`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Company
                        </Button>
                      </div>
                    </div>

                    {review.verifiedAt && (
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✓ Verified on{" "}
                        {new Date(review.verifiedAt).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                  >
                    {loading ? "Loading..." : "Load More Reviews"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-6 py-4 flex flex-col items-start gap-2 hover:bg-white hover:text-black hover:border-gray-300 transition-all duration-300"
                  onClick={() => window.open("/peace-seal", "_blank")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <MessageSquare className="w-5 h-5 text-[#548281]" />
                    <span className="font-medium">Browse Companies</span>
                  </div>
                  <p className="text-sm text-gray-500 text-left">
                    Find companies to review
                  </p>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 py-4 flex flex-col items-start gap-2 hover:bg-white hover:text-black hover:border-gray-300 transition-all duration-300"
                  onClick={() => window.open("/contact", "_blank")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Building className="w-5 h-5 text-[#548281]" />
                    <span className="font-medium">Contact Support</span>
                  </div>
                  <p className="text-sm text-gray-500 text-left">
                    Get help with your reviews
                  </p>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 py-4 flex flex-col items-start gap-2 hover:bg-white hover:text-black hover:border-gray-300 transition-all duration-300"
                  onClick={() => window.open("/campaigns", "_blank")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Star className="w-5 h-5 text-[#548281]" />
                    <span className="font-medium">Support Our Work</span>
                  </div>
                  <p className="text-sm text-gray-500 text-left">
                    Help us achieve our mission
                  </p>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
