import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { createPledge } from "@/lib/api/pledges";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface PledgeFormProps {
  commitmentText: string | undefined;
  campaignId: string;
  onPledgeCreated?: (newCount: number) => void;
}

export default function PledgeForm({ 
  commitmentText, 
  campaignId,
  onPledgeCreated 
}: PledgeFormProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
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
        subscribeToUpdates
      });

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
      console.error("Error creating pledge:", error);
      toast.error("Failed to submit your pledge. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-[#f8f9f0]">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800">I pledge that:</h3>
        <p className="text-sm text-gray-700 mt-2">{commitmentText}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
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
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="contact"
            checked={subscribeToUpdates}
            onCheckedChange={(checked) => setSubscribeToUpdates(checked === true)}
            className="mt-1 data-[state=checked]:bg-[#548281] data-[state=checked]:text-primary-foreground"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="contact"
              className="text-xs leading-snug text-gray-600"
            >
              I&apos;d like to receive occasional updates about this campaign and
              other related initiatives.
            </label>
          </div>
        </div>

        <Button 
          className="w-full bg-[#548281] hover:bg-[#3c6665] group"
          onClick={handleSubmit}
          disabled={isSubmitting || !agreeToTerms}
        >
          {isSubmitting ? "Processing..." : "Make my pledge"}{" "}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
