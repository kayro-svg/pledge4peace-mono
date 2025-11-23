"use client";

import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import Link from "next/link";
import { FormField } from "./form-field";
import { PasswordInput } from "./password-input";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";
import { useTranslations } from "next-intl";
import { TurnstileWidget } from "../ui/turnstile";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function LoginForm({
  onSwitchToRegister,
  onLoginSuccess,
  onLoadingChange,
}: LoginFormProps) {
  const form = useForm<LoginFormData>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Login_Page");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const handleLoginSuccess = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      // router.push("/dashboard");
      router.push("/");
      router.refresh();
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    logger.log("data", data);

    try {
      if (!turnstileToken) {
        toast.error("Please complete the captcha verification");
        return;
      }

      setIsLoading(true);
      onLoadingChange?.(true);
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        turnstileToken,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Login successful!");
        handleLoginSuccess();
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center mt-0 md:mt-14">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1 text-center">
        {t("login_title")}
      </h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        {t("login_description")}
      </p>

      <p className="text-center text-sm text-gray-600 mb-6">
        {t("dontHaveAccount")}{" "}
        <button
          onClick={onSwitchToRegister}
          className="font-medium text-[#698D8B] hover:text-[#548281]"
        >
          {t("signUp")}
        </button>
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          id="email"
          label={t("login_email_label")}
          type="email"
          placeholder={t("login_email_placeholder")}
          {...form.register("email", { required: true })}
          required
          autoComplete="email"
        />

        <PasswordInput
          id="password"
          label={t("login_password_label")}
          placeholder={t("login_password_placeholder")}
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
              {t("rememberMe")}
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-[#698D8B] hover:text-[#548281]"
            >
              {t("forgotPassword")}
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <TurnstileWidget onVerify={setTurnstileToken} />
        </div>
        <div>
          <Button
            type="submit"
            className="w-full bg-[#548281] hover:bg-[#2F4858] text-white font-medium py-2.5"
            disabled={isLoading}
          >
            {isLoading ? t("signingIn") : t("signIn")}
          </Button>
        </div>
      </form>
    </div>
  );
}
