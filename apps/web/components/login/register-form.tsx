"use client";

import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import Link from "next/link";
import { FormField } from "./form-field";
import { PasswordInput } from "./password-input";
import { OrDivider } from "./or-divider";
import { SocialButton } from "./social-button";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const form = useForm<RegisterFormData>();

  const onSubmit = (data: RegisterFormData) => {
    console.log("Registration submitted:", data);
    // Handle registration
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1 text-center">
        Create Account
      </h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Join us and start making a difference today
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          id="name"
          label="Full Name"
          placeholder="Enter your full name"
          register={form.register}
          fieldName="name"
          required
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          register={form.register}
          fieldName="email"
          required
          autoComplete="email"
        />

        <PasswordInput
          id="password"
          label="Password"
          placeholder="Create a password"
          register={form.register}
          fieldName="password"
          required
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          register={form.register}
          fieldName="confirmPassword"
          required
        />

        <div className="flex items-center">
          <input
            id="agree-terms"
            {...form.register("agreeTerms", { required: true })}
            type="checkbox"
            required
            className="h-4 w-4 rounded border-gray-300 text-[#2F4858] focus:ring-[#2F4858]"
          />
          <label
            htmlFor="agree-terms"
            className="ml-2 block text-sm text-gray-700"
          >
            I agree to the{" "}
            <Link href="/terms" className="text-[#698D8B] hover:text-[#548281]">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-[#698D8B] hover:text-[#548281]"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full bg-[#548281] hover:bg-[#2F4858] text-white font-medium py-2.5"
          >
            Sign Up
          </Button>
        </div>
      </form>

      <OrDivider text="Or continue with" />

      <div className="mt-6">
        <SocialButton provider="google">Sign up with Google</SocialButton>
      </div>

      <p className="absolute bottom-5 left-0 right-0 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="font-medium text-[#698D8B] hover:text-[#548281]"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}
