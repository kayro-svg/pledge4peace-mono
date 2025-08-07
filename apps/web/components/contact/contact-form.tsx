"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "../login/form-field";
import { TextAreaField } from "./text-area-field";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { logger } from "@/lib/utils/logger";
import { submitContactForm } from "@/lib/api/contact";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm() {
  const form = useForm<ContactFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Contact_Page");
  const onSubmit = async (data: ContactFormData) => {
    logger.log("Contact form submitted:", data);
    setIsLoading(true);

    try {
      await submitContactForm(data);
      toast.success(
        "Thank you for your message! We've received your inquiry and will get back to you soon."
      );
      form.reset();
    } catch (error) {
      logger.error("Error submitting contact form:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit contact form. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {t("form_title")}
      </h2>
      <p className="text-gray-600 mb-8">{t("form_description")}</p>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6"
      >
        <FormField
          id="name"
          label={t("form_name_label")}
          placeholder={t("form_name_placeholder")}
          {...form.register("name", { required: true })}
        />

        <FormField
          id="email"
          label={t("form_email_label")}
          type="email"
          placeholder={t("form_email_placeholder")}
          {...form.register("email", { required: true })}
        />

        <FormField
          id="subject"
          label={t("form_subject_label")}
          placeholder={t("form_subject_placeholder")}
          {...form.register("subject", { required: true })}
        />

        <TextAreaField
          id="message"
          label={t("form_message_label")}
          placeholder={t("form_message_placeholder")}
          register={form.register}
          fieldName="message"
          required
        />

        <div>
          <Button
            type="submit"
            className="bg-[#2f4858] hover:bg-[#1e2f38] text-white w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("form_submit_label")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
