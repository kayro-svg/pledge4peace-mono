"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Home,
  ArrowRight,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

type VerifyResponse = {
  message: string;
};

export default function VerifyEmailPage() {
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
      setMessage("The verification token was not sent.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const contentType = res.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        if (!res.ok) {
          // Intentamos leer el JSON, pero protegemos con try/catch
          if (isJson) {
            try {
              const data = (await res.json()) as VerifyResponse;
              setMessage(data.message);
            } catch {
              // Si el JSON no es válido o está vacío, usamos un texto según res.status
              if (res.status === 404) {
                setMessage("The verification link was not found.");
              } else if (res.status === 400) {
                setMessage("Invalid or expired verification link.");
              } else {
                setMessage(`An unexpected error occurred (${res.status}).`);
              }
            }
          } else {
            // No vino JSON
            if (res.status === 404) {
              setMessage("The verification link was not found.");
            } else if (res.status === 400) {
              setMessage("Invalid or expired verification link.");
            } else {
              setMessage(`An unexpected error occurred (${res.status}).`);
            }
          }
          setStatus("error");
          return;
        }

        // Si res.ok:
        if (isJson) {
          try {
            const data = (await res.json()) as VerifyResponse;
            setMessage(
              data.message || "Your email has been verified successfully!"
            );
          } catch {
            // Si recibimos 200 pero sin JSON válido, mostramos mensaje genérico
            setMessage("Your email has been verified successfully!");
          }
        } else {
          // Caso improbable, pero cubrimos la posibilidad de recibir 200 sin JSON
          setMessage("Your email has been verified successfully!");
        }
        setStatus("success");
      } catch (err) {
        console.error("Error verifying email:", err);
        setMessage("Connection error. Try again later.");
        setStatus("error");
      }
    })();
  }, [token]);

  const handleRetry = () => {
    setStatus("loading");
    // Trigger the verification again
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center px-4 py-12 min-h-[60vh]">
      <div className="max-w-md w-full">
        {/* Loading State */}
        {status === "loading" && (
          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 px-8 py-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Verifying Email
                </h1>
                <p className="text-blue-50 text-lg">Please wait a moment...</p>
              </div>
              <div className="px-8 py-8 text-center">
                <p className="text-gray-600 leading-relaxed">
                  We&apos;re confirming your email address. This should only
                  take a few seconds.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {status === "success" && (
          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-teal-500 to-green-500 px-8 py-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Email Verified!
                </h1>
                <p className="text-teal-50 text-lg">
                  Welcome to the movement 🎉
                </p>
              </div>

              <div className="px-8 py-8 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  You&apos;re all set to make a difference
                </h2>
                <p className="text-gray-600 mb-2 leading-relaxed">{message}</p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  You can now start creating pledges and join our community of
                  peace advocates working to solve the world&apos;s problems,
                  one pledge at a time.
                </p>

                <div className="flex flex-col gap-4">
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                    size="lg"
                    onClick={() => router.push("/")}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Home
                  </Button>

                  <Link href="/#projects-section" scroll={false}>
                    <Button
                      variant="outline"
                      className="w-full border-teal-200 text-teal-700 hover:bg-[#008080] py-3 rounded-lg font-medium transition-colors duration-200"
                      size="lg"
                    >
                      Make Your First Pledge
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Need help getting started?{" "}
                    <a
                      href="/guide"
                      className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Visit our guide
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {status === "error" && (
          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-8 py-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Verification Failed
                </h1>
                <p className="text-red-50 text-lg">Something went wrong</p>
              </div>

              <div className="px-8 py-8 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Unable to verify your email
                </h2>
                <p className="text-red-600 mb-6 leading-relaxed font-medium">
                  {message}
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  This could happen if the verification link has expired or has
                  already been used. Don&apos;t worry, you can request a new
                  verification email.
                </p>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                    size="lg"
                    onClick={handleRetry}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-teal-200 text-teal-700 hover:bg-[#008080] py-3 rounded-lg font-medium transition-colors duration-200"
                    size="lg"
                    onClick={() => router.push("/resend-verification")}
                  >
                    Request New Verification
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Still having trouble?{" "}
                    <a
                      href="/contact"
                      className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Contact support
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Message */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            {status === "success"
              ? "You can safely close this page or continue exploring Pledge4Peace"
              : "Having issues? Try refreshing the page or contact our support team"}
          </p>
        </div>
      </div>
    </div>
  );
}
