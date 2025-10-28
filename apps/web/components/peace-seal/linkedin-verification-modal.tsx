"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface LinkedInVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expectedEmail: string;
  onVerificationComplete: (idToken: string, accessToken: string) => void;
  onVerificationError: (error: string) => void;
  onBeforeOAuth?: () => void; // Callback to save state before OAuth
}

export function LinkedInVerificationModal({
  open,
  onOpenChange,
  expectedEmail,
  onVerificationComplete,
  onVerificationError,
  onBeforeOAuth,
}: LinkedInVerificationModalProps) {
  const { data: session } = useSession();
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Check for LinkedIn verification when session updates
  useEffect(() => {
    if (!open || verificationStatus !== "loading") return;

    interface LinkedInSession {
      linkedin?: {
        idToken: string;
        accessToken: string;
        sub: string;
        email?: string;
        emailVerified?: boolean;
      };
    }

    const linkedinSession = session as unknown as LinkedInSession;

    if (linkedinSession?.linkedin) {
      const linkedinEmail = linkedinSession.linkedin.email;

      if (!linkedinEmail) {
        setVerificationStatus("error");
        setErrorMessage(
          "LinkedIn did not share your email. Please ensure your LinkedIn account has a verified email address and try again."
        );
        onVerificationError(
          "LinkedIn did not share email. Please try again or use a different verification method."
        );
        return;
      }

      const actualEmail = linkedinEmail.toLowerCase();
      const expected = expectedEmail.trim().toLowerCase();

      if (actualEmail === expected) {
        setVerificationStatus("success");
        onVerificationComplete(
          linkedinSession.linkedin.idToken,
          linkedinSession.linkedin.accessToken
        );
        // Close modal after 1.5 seconds
        setTimeout(() => {
          onOpenChange(false);
          // Reset status for next time
          setTimeout(() => setVerificationStatus("idle"), 300);
        }, 1500);
      } else {
        setVerificationStatus("error");
        setErrorMessage(
          `Email mismatch: LinkedIn email (${linkedinEmail}) does not match the entered email (${expectedEmail}).`
        );
        onVerificationError(
          `LinkedIn email does not match. Please check your email address.`
        );
      }
    }
  }, [
    session,
    open,
    verificationStatus,
    expectedEmail,
    onVerificationComplete,
    onVerificationError,
    onOpenChange,
  ]);

  const handleLinkedInLogin = async () => {
    setVerificationStatus("loading");
    setErrorMessage("");

    try {
      // Call the callback to save form state before OAuth redirect
      if (onBeforeOAuth) {
        onBeforeOAuth();
      }

      // Store email in localStorage for post-callback verification
      localStorage.setItem("reviewerEmailForLinkedIn", expectedEmail);

      // Redirect to our custom LinkedIn verification endpoint
      const verifyUrl = `/api/linkedin-verify/start?callbackUrl=${encodeURIComponent(window.location.href)}`;
      window.location.href = verifyUrl;
    } catch {
      setVerificationStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again.");
      onVerificationError("Unexpected error during LinkedIn authentication");
      localStorage.removeItem("reviewerEmailForLinkedIn");
    }
  };

  const handleRetry = () => {
    setVerificationStatus("idle");
    setErrorMessage("");
  };

  const handleCancel = () => {
    setVerificationStatus("idle");
    setErrorMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify with LinkedIn</DialogTitle>
          <DialogDescription>
            We&apos;ll verify that your LinkedIn account email matches: <br />
            <strong className="text-foreground">{expectedEmail}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {verificationStatus === "idle" && (
            <>
              <div className="text-center space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Click below to sign in with LinkedIn. We&apos;ll verify your
                  identity by comparing your LinkedIn email with the email you
                  entered.
                </p>
              </div>
              <Button
                onClick={handleLinkedInLogin}
                className="w-full bg-[#0077b5] hover:bg-[#005885] text-white"
                size="lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Sign in with LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full"
              >
                Cancel
              </Button>
            </>
          )}

          {verificationStatus === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-[#0077b5] animate-spin" />
              <p className="text-sm text-muted-foreground text-center">
                Verifying your LinkedIn account...
              </p>
              <p className="text-xs text-muted-foreground text-center">
                You may be redirected to LinkedIn to authorize this app.
              </p>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600" />
              <p className="text-sm font-semibold text-green-600 text-center">
                LinkedIn account verified successfully!
              </p>
              <p className="text-xs text-muted-foreground text-center">
                You can now continue with your review.
              </p>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <AlertCircle className="w-12 h-12 text-destructive" />
              <p className="text-sm font-semibold text-destructive text-center">
                Verification Failed
              </p>
              <p className="text-xs text-muted-foreground text-center">
                {errorMessage}
              </p>
              <div className="flex gap-2 w-full mt-4">
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center border-t pt-4">
          <p>
            Your LinkedIn login is only used for verification. We don&apos;t
            store your LinkedIn credentials and your review remains anonymous.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
