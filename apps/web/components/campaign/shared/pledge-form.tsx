"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createPledge, checkExistingPledge } from "@/lib/api/pledges";
import { toast } from "sonner";
import { useSimpleAuth } from "@/hooks/use-simple-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthContainer from "@/components/login/auth-container";
import { Loader2 } from "lucide-react";
import { CheckCircle, CircleHelp } from "lucide-react";
import { logger } from "@/lib/utils/logger";
import Link from "next/link";
import { useLocaleContent } from "@/hooks/use-locale-content";
import { useTranslations } from "next-intl";

interface PledgeFormProps {
  pledgeCommitmentItems: string[];
  campaignId: string;
  campaignTitle: string;
  onPledgeCreated?: (newCount: number) => void;
  onNavigateToSolutions?: () => void; // NEW PROP: callback to navigate to solutions
  onDonateIntent?: () => void; // NEW PROP: callback to open donation modal
}

export default function PledgeForm({
  pledgeCommitmentItems,
  campaignId,
  campaignTitle,
  onPledgeCreated,
  onNavigateToSolutions,
  onDonateIntent, // NEW PROP
}: PledgeFormProps) {
  const { session, isAuthenticated } = useSimpleAuth();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPledged, setHasPledged] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { getString } = useLocaleContent();
  const t = useTranslations("SingleCampaign_Page");
  const [shouldAttemptPledgeAfterAuth, setShouldAttemptPledgeAfterAuth] =
    useState(false);
  // Check if user has already pledged to this campaign
  useEffect(() => {
    const checkPledgeStatus = async () => {
      if (isAuthenticated && campaignId) {
        try {
          const pledged = await checkExistingPledge(campaignId);
          setHasPledged(pledged);
        } catch (error) {
          logger.error("Error checking pledge status:", error);
          // Don't show error to user, just log it
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkPledgeStatus();
  }, [isAuthenticated, campaignId]);

  // If we're not loading and user is not authenticated, show the pledge form
  // The login modal will be shown when they try to submit

  const performPledge = useCallback(async () => {
    // Guard against duplicate submissions
    if (isSubmitting) return;

    // Validate form
    if (!agreeToTerms) {
      toast.error("You must agree to the terms to make a pledge");
      return;
    }

    if (!campaignId) {
      toast.error("Campaign ID is missing");
      return;
    }

    // CRITICAL: Only attempt to create pledge if user is authenticated
    if (!isAuthenticated) {
      toast.error("You must be logged in to make a pledge");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createPledge({
        campaignId,
        campaignTitle,
        agreeToTerms,
        subscribeToUpdates,
      });

      setHasPledged(true);

      if (session?.user?.name) {
        toast.success(`Thank you for your pledge, ${session.user.name}!`);
      } else {
        toast.success("Thank you for your pledge!");
      }

      setAgreeToTerms(false);
      setSubscribeToUpdates(false);

      if (onPledgeCreated && response.pledgeCount) {
        onPledgeCreated(response.pledgeCount);
      }

      if (onNavigateToSolutions) {
        setTimeout(() => {
          onNavigateToSolutions();
        }, 1500);
      }
    } catch (error) {
      logger.error("Error creating pledge:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create pledge. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    agreeToTerms,
    campaignId,
    campaignTitle,
    isAuthenticated,
    isSubmitting,
    onNavigateToSolutions,
    onPledgeCreated,
    session?.user?.name,
    subscribeToUpdates,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (process.env.NODE_ENV === "development") {
      logger.log("[PledgeForm] handleSubmit called:", {
        isAuthenticated,
        agreeToTerms,
        campaignId,
      });
    }

    if (!isAuthenticated) {
      setShouldAttemptPledgeAfterAuth(true);
      setShowLoginModal(true);
      return;
    }

    await performPledge();
  };

  // After successful login/registration inside modal, attempt pledge and close modal
  useEffect(() => {
    if (shouldAttemptPledgeAfterAuth && isAuthenticated) {
      setShowLoginModal(false);
      // Small delay to ensure the session is fully loaded
      setTimeout(() => {
        performPledge();
      }, 100);
      setShouldAttemptPledgeAfterAuth(false);
    }
  }, [shouldAttemptPledgeAfterAuth, isAuthenticated, performPledge, session]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasPledged) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center mt-4">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium">{t("thankYouForYourPledge")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("yourSupportMeansALotToUs")}
          </p>
          {/* Donation CTA */}
          <div className="mt-2 flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-gray-700">
              {t("wouldYouLikeToAmplifyYourImpact")}
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              {t("considerMakingADonation")}
            </p>
            <Button
              className="bg-[#548281] hover:bg-[#3c6665] w-full sm:w-auto mt-2"
              onClick={() => onDonateIntent && onDonateIntent()}
            >
              {t("supportWithADonation")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-3 md:p-6 bg-[#f8f9f0]">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800">I pledge to:</h3>
        {/* <p className="text-sm text-gray-700 mt-2">
          {pledgeCommitmentItems.join("\n")}
        </p> */}
      </div>

      <div className="space-y-4">
        {pledgeCommitmentItems.map((item, index) => (
          <div className="flex items-start space-x-2" key={index}>
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
              className="mt-1 data-[state=checked]:bg-[#548281] data-[state=checked]:text-primary-foreground"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-xs leading-snug text-gray-600"
              >
                {getString(item) || (typeof item === "string" ? item : "")}
              </label>
            </div>
          </div>
        ))}
        <Button
          className="w-full bg-[#548281] hover:bg-[#3c6665] group"
          onClick={handleSubmit}
          disabled={isSubmitting || !agreeToTerms}
        >
          {isSubmitting ? t("processing") : t("makeMyPledge")}{" "}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Link
          href="/pledge-details"
          className="w-full text-xs text-[#548281] hover:text-[#3c6665] flex items-center justify-center"
        >
          {t("learnMoreAboutMyPledge")}
          <CircleHelp className="ml-2 h-4 w-4" />
        </Link>
      </div>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-lg w-full max-h-[80vh] md:h-[fit-content]">
          <DialogHeader>
            <DialogTitle>
              <p className="text-lg font-semibold mb-4 text-center">
                {t("toMakeAPledgeYouMustLogin")}
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <AuthContainer
              onLoginSuccess={() => {
                // Don't close modal immediately - let the useEffect handle it
                // This ensures the session is fully loaded before attempting pledge
                setShouldAttemptPledgeAfterAuth(true);
              }}
              isModal
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
