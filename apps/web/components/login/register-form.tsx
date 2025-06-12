"use client";

import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import Link from "next/link";
import { FormField } from "./form-field";
import { PasswordInput } from "./password-input";
import { OrDivider } from "./or-divider";
import { SocialButton } from "./social-button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { register as registerUser } from "@/lib/api/register";
import { useRouter } from "next/navigation";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  isModal?: boolean;
}

export default function RegisterForm({
  onSwitchToLogin,
  isModal,
}: RegisterFormProps) {
  const form = useForm<RegisterFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      setIsLoading(true);

      // Register the user usando la función reutilizable
      const registerResponse = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || "Registration failed");
      }

      toast.success(
        "Registration successful! Please check your email to verify your account."
      );

      // Automatically sign in after registration
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Failed to sign in after registration");
        return;
      }

      // Redirigir a la ruta deseada tras login exitoso
      router.push("/"); // Cambia "/" por la ruta que desees
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full ${isModal ? "mt-0" : "mt-14"}`}>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1 text-center">
        Create Account
      </h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Join us and start making a difference today
      </p>

      <p className="text-center text-sm text-gray-600 mb-6">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="font-medium text-[#698D8B] hover:text-[#548281]"
        >
          Sign In
        </button>
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          id="name"
          label="Full Name"
          placeholder="Enter your full name"
          {...form.register("name", { required: true })}
          required
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          {...form.register("email", { required: true })}
          // fieldName="email"
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
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </div>
      </form>

      {/* <OrDivider text="Or continue with" />

      <div className="mt-6">
        <SocialButton provider="google">Sign up with Google</SocialButton>
      </div> */}
    </div>
  );
}
