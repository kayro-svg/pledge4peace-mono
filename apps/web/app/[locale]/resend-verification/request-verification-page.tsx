"use client";

import type React from "react";
import { logger } from "@/lib/utils/logger";

import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RequestResponse = {
  message: string;
};

export default function RequestVerificationPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!res.ok) {
        let json: RequestResponse | null = null;
        try {
          json = (await res.json()) as RequestResponse;
        } catch {
          // Si no viene JSON válido, dejamos mensaje genérico
        }
        setMessage(
          json?.message || `Unexpected error: ${res.status} ${res.statusText}`
        );
        setStatus("error");
        return;
      }

      const data = (await res.json()) as RequestResponse;
      setMessage(data.message);
      setStatus("success");
    } catch (err) {
      logger.error("Error requesting verification:", err);
      setMessage("Connection error. Please try again later.");
      setStatus("error");
    }
  };

  const handleBackToLogin = () => {
    window.location.href = "/login";
  };

  const handleTryAgain = () => {
    setStatus("idle");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-8">
            {/* Idle/Loading State - Form */}
            {(status === "idle" || status === "loading") && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                    <Mail className="w-8 h-8 text-teal-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Need a new verification email?
                  </h1>
                  <p className="text-gray-600 leading-relaxed">
                    Enter your email address and we&apos;ll send you a new
                    verification link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      disabled={status === "loading"}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                    size="lg"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending verification email...
                      </>
                    ) : (
                      "Send verification email"
                    )}
                  </Button>
                </form>

                <div className="text-center mt-6">
                  <button
                    onClick={handleBackToLogin}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors duration-200 inline-flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to login
                  </button>
                </div>
              </>
            )}

            {/* Success State */}
            {status === "success" && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Verification email sent!
                </h1>
                <p className="text-gray-600 mb-4 leading-relaxed">{message}</p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Please check your email inbox and click the verification link
                  to activate your account. Don&apos;t forget to check your spam
                  folder if you don&apos;t see it.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={handleTryAgain}
                    variant="outline"
                    className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 py-3 rounded-lg font-medium transition-colors duration-200"
                    size="lg"
                  >
                    Send another email
                  </Button>

                  <button
                    onClick={handleBackToLogin}
                    className="w-full text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center py-2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to login
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {status === "error" && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h1>
                <p className="text-red-600 mb-4 leading-relaxed font-medium">
                  {message}
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  We couldn&apos;t send the verification email. Please check
                  your email address and try again.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={handleTryAgain}
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                    size="lg"
                  >
                    Try again
                  </Button>

                  <button
                    onClick={handleBackToLogin}
                    className="w-full text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center py-2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to login
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Still having trouble?{" "}
            <a
              href="/contact"
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
