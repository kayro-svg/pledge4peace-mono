"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { FormField } from "./form-field";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/config";
import { useRouter } from "next/navigation";
import { PasswordInput } from "./password-input";

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch("newPassword");

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reset password");
      }

      toast.success("Password has been reset successfully");
      router.push("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="New Password"
        type="password"
        {...register("newPassword", {
          required: "Password is required",
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
        })}
        error={errors.newPassword?.message}
      />

      {/* <PasswordInput
        id="password"
        label="New Password"
        placeholder="Create new password"
        register={register}
        fieldName="newPassword"
        required
      /> */}
      {/* 
      <PasswordInput
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm new password"
        register={register}
        fieldName="confirmPassword"
        required
      /> */}
      <FormField
        label="Confirm Password"
        type="password"
        {...register("confirmPassword", {
          required: "Please confirm your password",
          validate: (value) =>
            value === password || "The passwords do not match",
        })}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}
