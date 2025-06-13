import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { createPledge, checkExistingPledge } from "@/lib/api/pledges";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
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

interface PledgeFormProps {
  pledgeCommitmentItems: string[];
  campaignId: string;
  onPledgeCreated?: (newCount: number) => void;
}

export default function PledgeForm({
  pledgeCommitmentItems,
  campaignId,
  onPledgeCreated,
}: PledgeFormProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPledged, setHasPledged] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not authenticated, show login modal
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Validate form
    if (!agreeToTerms) {
      toast.error("You must agree to the terms to make a pledge");
      return;
    }

    if (!campaignId) {
      toast.error("Campaign ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the pledge
      const response = await createPledge({
        campaignId,
        agreeToTerms,
        subscribeToUpdates,
      });

      // Update the UI to show the thank you message
      setHasPledged(true);

      // Show success message with personalized text if user is logged in
      if (isAuthenticated && session?.user?.name) {
        toast.success(`Thank you for your pledge, ${session.user.name}!`);
      } else {
        toast.success("Thank you for your pledge!");
      }

      // Reset form
      setAgreeToTerms(false);
      setSubscribeToUpdates(false);

      // Notify parent component about the new pledge
      if (onPledgeCreated && response.pledgeCount) {
        onPledgeCreated(response.pledgeCount);
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
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasPledged) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium">Thank you for your pledge!</h3>
          <p className="text-sm text-muted-foreground">
            Your support means a lot to us. You&apos;ve successfully pledged to
            this campaign.
          </p>
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
                {item}
              </label>
            </div>
          </div>
        ))}

        {/* <div className="flex items-start space-x-2">
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
              I agree to the terms of service and privacy policy. I understand
              that my information will be used as described.
            </label>
          </div>
        </div> */}

        {/* <div className="flex items-start space-x-2">
          <Checkbox
            id="contact"
            checked={subscribeToUpdates}
            onCheckedChange={(checked) =>
              setSubscribeToUpdates(checked === true)
            }
            className="mt-1 data-[state=checked]:bg-[#548281] data-[state=checked]:text-primary-foreground"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="contact"
              className="text-xs leading-snug text-gray-600"
            >
              I&apos;d like to receive occasional updates about this campaign
              and other related initiatives.
            </label>
          </div>
        </div> */}

        <Button
          className="w-full bg-[#548281] hover:bg-[#3c6665] group"
          onClick={handleSubmit}
          disabled={isSubmitting || !agreeToTerms}
        >
          {isSubmitting ? "Processing..." : "Make my pledge"}{" "}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Link
          href="/pledge-details"
          className="w-full text-xs text-[#548281] hover:text-[#3c6665] flex items-center justify-center"
        >
          Learn more about my pledge
          <CircleHelp className="ml-2 h-4 w-4" />
        </Link>
      </div>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-lg w-full max-h-[100vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <p className="text-lg font-semibold mb-4 text-center">
                To make a pledge you must login
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <AuthContainer
              onLoginSuccess={() => setShowLoginModal(false)}
              isModal
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
