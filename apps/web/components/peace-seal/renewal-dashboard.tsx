"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  getCompanyRenewals,
  getCompanyRewards,
  requestPhysicalBadge,
  generateDigitalBadge,
  type PeaceSealRenewal,
  type PeaceSealReward,
  type BadgeLevel,
} from "@/lib/api/peace-seal";
import {
  Calendar,
  DollarSign,
  Download,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  FileText,
  Users,
  Globe,
  Shield,
} from "lucide-react";

interface RenewalDashboardProps {
  companyId: string;
}

export function RenewalDashboard({ companyId }: RenewalDashboardProps) {
  const [renewals, setRenewals] = useState<PeaceSealRenewal[]>([]);
  const [rewards, setRewards] = useState<PeaceSealReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [badgeLevel, setBadgeLevel] = useState<BadgeLevel>(null);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [renewalsResult, rewardsResult] = await Promise.all([
        getCompanyRenewals(companyId),
        getCompanyRewards(companyId),
      ]);

      setRenewals(renewalsResult.renewals);
      setRewards(rewardsResult.rewards);

      // Extract badge level from rewards
      const badgeReward = rewardsResult.rewards.find(
        (r) => r.rewardType === "digital_badge"
      );
      if (badgeReward?.metadata?.badgeLevel) {
        setBadgeLevel(badgeReward.metadata.badgeLevel);
      }
    } catch (error) {
      toast({
        title: "Error loading renewal data",
        description:
          "Failed to load renewal and reward information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const handleRequestPhysicalBadge = async () => {
    try {
      await requestPhysicalBadge(companyId);
      toast({
        title: "Physical badge requested",
        description:
          "Your physical badge request has been submitted and will be processed.",
      });
      loadData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error requesting badge",
        description: "Failed to request physical badge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDigitalBadge = async () => {
    try {
      const result = await generateDigitalBadge(companyId);
      window.open(result.badgeUrl, "_blank");
    } catch (error) {
      toast({
        title: "Error downloading badge",
        description: "Failed to generate digital badge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getBadgeColor = (level: BadgeLevel) => {
    switch (level) {
      case "gold":
        return "bg-yellow-500 text-white";
      case "silver":
        return "bg-gray-400 text-white";
      case "bronze":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "digital_badge":
        return <Award className="w-5 h-5" />;
      case "physical_badge":
        return <Award className="w-5 h-5" />;
      case "certificate":
        return <FileText className="w-5 h-5" />;
      case "brand_toolkit":
        return <Shield className="w-5 h-5" />;
      case "network_access":
        return <Users className="w-5 h-5" />;
      case "survey_access":
        return <Globe className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "used":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "expired":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const currentRenewal = renewals.find(
    (r) => r.paymentStatus === "paid" && r.expiresAt > Date.now()
  );
  const upcomingRenewal = renewals.find(
    (r) =>
      r.paymentStatus === "paid" &&
      r.expiresAt <= Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#548281]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2F4858]">Renewal & Rewards</h1>
        <p className="text-gray-600 mt-1">
          Manage your Peace Seal renewal and access your rewards
        </p>
      </div>

      {/* Renewal Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentRenewal ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Until</span>
                  <span className="font-medium">
                    {new Date(currentRenewal.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Renewal Year</span>
                  <span className="font-medium">
                    {currentRenewal.renewalYear}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount Paid</span>
                  <span className="font-medium">
                    ${(currentRenewal.amountCents / 100).toFixed(2)}
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </>
            ) : (
              <div className="text-center py-4">
                <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No active renewal found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Badge Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {badgeLevel ? (
              <>
                <div className="text-center">
                  <Badge
                    className={`${getBadgeColor(badgeLevel)} text-lg px-4 py-2`}
                  >
                    {badgeLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadDigitalBadge}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Digital Badge
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRequestPhysicalBadge}
                    className="flex-1"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Physical Badge
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No badge level assigned</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Renewal Alerts */}
      {upcomingRenewal && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Renewal Due Soon:</strong> Your Peace Seal certification
            expires on{" "}
            {new Date(upcomingRenewal.expiresAt).toLocaleDateString()}. Please
            renew to maintain your certification and access to rewards.
          </AlertDescription>
        </Alert>
      )}

      {/* Renewal History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Renewal History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renewals.length > 0 ? (
            <div className="space-y-3">
              {renewals.map((renewal) => (
                <div
                  key={renewal.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">
                        Renewal {renewal.renewalYear}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${(renewal.amountCents / 100).toFixed(2)} •{" "}
                        {new Date(renewal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        renewal.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : renewal.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {renewal.paymentStatus}
                    </Badge>
                    {renewal.expiresAt && (
                      <span className="text-sm text-gray-500">
                        Expires:{" "}
                        {new Date(renewal.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No renewal history found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Your Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getRewardIcon(reward.rewardType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium capitalize">
                      {reward.rewardType.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {reward.metadata?.description || "Peace Seal reward"}
                    </p>
                    {reward.expiresAt && (
                      <p className="text-xs text-gray-500">
                        Expires:{" "}
                        {new Date(reward.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(reward.status)}>
                    {reward.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No rewards available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
