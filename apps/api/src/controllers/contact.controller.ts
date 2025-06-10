import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { logger } from "../utils/logger";

// Validation for contact form
const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export class ContactController {
  async submitContactForm(c: Context) {
    try {
      const body = await c.req.json();
      const validation = contactFormSchema.safeParse(body);

      if (!validation.success) {
        logger.error(
          "Contact form validation errors:",
          validation.error.format()
        );
        return c.json({ message: "Invalid input data" }, 400);
      }

      const { name, email, subject, message } = validation.data;
      const authService = c.get("authService");

      try {
        // Send confirmation email to the user
        await authService.emailService.sendContactConfirmation(
          email,
          name,
          subject
        );

        logger.log(
          "✅ Contact form submitted and confirmation email sent:",
          email
        );

        // Here you could also save the contact form to your database
        // or send it to another service for processing

        return c.json(
          {
            message: "Contact form submitted successfully",
            email: email,
            name: name,
          },
          200
        );
      } catch (emailError) {
        logger.error(
          "⚠️ Failed to send contact confirmation email:",
          emailError
        );

        return c.json(
          {
            message:
              "Contact form submitted but confirmation email could not be sent",
            email: email,
            name: name,
          },
          200
        );
      }
    } catch (error) {
      if (error instanceof HTTPException) {
        const body = (error as any).body || { message: (error as any).message };
        return c.json(body, error.status);
      }
      logger.error("Error submitting contact form:", error);
      return c.json({ message: "Error submitting contact form" }, 500);
    }
  }
}
