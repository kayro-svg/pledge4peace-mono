"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { FormField } from "./form-field";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/config";
import { logger } from "@/lib/utils/logger";

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.forgotPassword, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Intentamos extraer JSON del error, si existe.
        let errorMessage = "Failed to send reset email";
        try {
          const errorJson = await response.json();
          if (errorJson?.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // Si no hay JSON válido, simplemente usamos el mensaje por defecto
          logger.error(
            "Invalid JSON response:",
            response.status,
            response.statusText,
            response.body
          );
        }
        throw new Error(errorMessage);
      }

      setEmailSent(true);
      toast.success("Password reset instructions have been sent to your email");
    } catch (error) {
      logger.error("Error requesting password reset:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Check Your Email</h2>
        <p className="text-gray-600">
          We have sent password reset instructions to your email address.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Email"
        type="email"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        })}
        error={errors.email?.message}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Reset Password"}
      </Button>
    </form>
  );
}
