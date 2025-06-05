"use client";

import { ForgotPasswordForm } from "@/components/login/forgot-password-form";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we&apos;ll send you instructions to
            reset your password.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <ForgotPasswordForm />

          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="font-medium text-[#548281] hover:text-[#2f4858]"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
