"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Home,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

type VerifyResponse = {
  success: boolean;
  message?: string;
};

export default function VerifyReviewPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("The verification token was not provided.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api"}/peace-seal/reviews/verify/${token}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const contentType = res.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        if (!res.ok) {
          if (isJson) {
            try {
              const data = (await res.json()) as VerifyResponse;
              setMessage(data.message || "Failed to verify review.");
            } catch {
              if (res.status === 404) {
                setMessage("The verification link was not found or is invalid.");
              } else if (res.status === 400) {
                setMessage("Invalid or expired verification link.");
              } else {
                setMessage(`An unexpected error occurred (${res.status}).`);
              }
            }
          } else {
            if (res.status === 404) {
              setMessage("The verification link was not found or is invalid.");
            } else if (res.status === 400) {
              setMessage("Invalid or expired verification link.");
            } else {
              setMessage(`An unexpected error occurred (${res.status}).`);
            }
          }
          setStatus("error");
          return;
        }

        // Success
        if (isJson) {
          try {
            const data = (await res.json()) as VerifyResponse;
            setMessage(
              data.message || "Your review has been verified successfully!"
            );
          } catch {
            setMessage("Your review has been verified successfully!");
          }
        } else {
          setMessage("Your review has been verified successfully!");
        }
        setStatus("success");
      } catch (err) {
        console.error("Error verifying review:", err);
        setMessage("Connection error. Please try again later.");
        setStatus("error");
      }
    })();
  }, [token]);

  return (
    <div className="flex items-center justify-center px-4 py-12 min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-[#548281]" />
              <p className="text-center text-gray-600">
                Verifying your review...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold text-center text-gray-900">
                Review Verified!
              </h2>
              <p className="text-center text-gray-600">{message}</p>
              <p className="text-sm text-center text-gray-500 mt-2">
                Thank you for taking the time to verify your review. Your feedback helps promote transparency and ethical business practices.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
                <Button
                  asChild
                  className="w-full bg-[#548281] hover:bg-[#2F4858]"
                >
                  <Link href="/peace-seal/directory">
                    <Home className="mr-2 h-4 w-4" />
                    Browse Companies
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <XCircle className="h-16 w-16 text-red-500" />
              <h2 className="text-2xl font-bold text-center text-gray-900">
                Verification Failed
              </h2>
              <p className="text-center text-gray-600">{message}</p>
              <p className="text-sm text-center text-gray-500 mt-2">
                If you believe this is an error, please contact support or try submitting a new review.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/peace-seal/directory">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

