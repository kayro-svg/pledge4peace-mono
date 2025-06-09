"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "../login/form-field";
import { TextAreaField } from "./text-area-field";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { logger } from "@/lib/utils/logger";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm() {
  const form = useForm<ContactFormData>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: ContactFormData) => {
    logger.log("Contact form submitted:", data);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    // Handle form submission
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Send Us a Message
      </h2>
      <p className="text-gray-600 mb-8">
        Have questions about our initiatives or want to get involved? Send us a
        message and we&apos;ll get back to you as soon as possible.
      </p>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6"
      >
        <FormField
          id="name"
          label="Name"
          placeholder="Your full name"
          {...form.register("name", { required: true })}
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="Your email address"
          {...form.register("email", { required: true })}
        />

        <FormField
          id="subject"
          label="Subject"
          placeholder="Message subject"
          {...form.register("subject", { required: true })}
        />

        <TextAreaField
          id="message"
          label="Message"
          placeholder="Your message"
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
              "Send Message"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
