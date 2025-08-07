"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitVolunteerApplication } from "@/lib/api/volunteer";
import { logger } from "@/lib/utils/logger";
import { useTranslations } from "next-intl";

interface VolunteerFormData {
  name: string;
  email: string;
  about: string;
  skills: string;
  availability: string;
}

export default function JoinOurTeamForm() {
  const t = useTranslations("Volunteering_Page");
  const form = useForm<VolunteerFormData>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: VolunteerFormData) => {
    logger.log("Volunteer form submitted:", data);
    setIsLoading(true);

    try {
      await submitVolunteerApplication(data);
      toast.success(
        "Thank you for your volunteer application! We'll be in touch soon."
      );
      form.reset();
    } catch (error) {
      logger.error("Error submitting volunteer application:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 bg-[#FDFDF0]" id="volunteer-form">
      <div className="  mx-auto max-w-3xl">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#2F4858] mb-4">
              {t("form_title")}
            </h2>
            <p className="text-gray-600">{t("form_description")}</p>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("form_name_label")}
              </label>
              <Input
                id="name"
                placeholder={t("form_name_placeholder")}
                {...form.register("name", { required: true })}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("form_email_label")}
              </label>
              <Input
                id="email"
                type="email"
                placeholder={t("form_email_placeholder")}
                {...form.register("email", { required: true })}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="about"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("form_about_label")}
              </label>
              <textarea
                id="about"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t("form_about_placeholder")}
                {...form.register("about", { required: true })}
              />
            </div>

            <div>
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("form_skills_label")}
              </label>
              <textarea
                id="skills"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t("form_skills_placeholder")}
                {...form.register("skills", { required: true })}
              />
            </div>

            <div>
              <label
                htmlFor="availability"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("form_availability_label")}
              </label>
              <textarea
                id="availability"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t("form_availability_placeholder")}
                {...form.register("availability", { required: true })}
              />
            </div>

            <div className="md:col-span-2">
              <Button
                type="submit"
                className="w-full bg-[#2f4858] hover:bg-[#1e2f38] text-white py-3"
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
      </div>
    </section>
  );
}
