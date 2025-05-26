"use client";

import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import Link from "next/link";
import { FormField } from "./form-field";
import { PasswordInput } from "./password-input";
import { OrDivider } from "./or-divider";
import { SocialButton } from "./social-button";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const form = useForm<LoginFormData>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      toast.success("Login successful");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1 text-center">
        Welcome
      </h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Enter your email and password and start making a difference.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          placeholder="Enter your password"
          register={form.register}
          fieldName="password"
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              {...form.register("rememberMe")}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#2F4858] focus:ring-[#698D8B]"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-[#698D8B] hover:text-[#548281]"
            >
              Forgot Password
            </Link>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full bg-[#548281] hover:bg-[#2F4858] text-white font-medium py-2.5"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>

      <OrDivider text="Or continue with" />

      <div className="mt-6">
        <SocialButton provider="google">Sign in with Google</SocialButton>
      </div>

      <p className="absolute bottom-5 left-0 right-0 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <button
          onClick={onSwitchToRegister}
          className="font-medium text-[#698D8B] hover:text-[#548281]"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
