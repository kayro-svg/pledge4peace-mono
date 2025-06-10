import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { logger } from "../utils/logger";

// Validation for volunteer application
const volunteerApplicationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  about: z.string().min(10),
  skills: z.string().min(10),
  availability: z.string().min(5),
});

export class VolunteerController {
  async submitApplication(c: Context) {
    try {
      const body = await c.req.json();
      const validation = volunteerApplicationSchema.safeParse(body);

      if (!validation.success) {
        logger.error(
          "Volunteer application validation errors:",
          validation.error.format()
        );
        return c.json({ message: "Invalid input data" }, 400);
      }

      const { name, email, about, skills, availability } = validation.data;
      const brevoListsService = c.get("brevoListsService");
      const authService = c.get("authService");

      try {
        // Split name into first and last name
        const [firstName, ...lastNameParts] = name.split(" ");
        const lastName = lastNameParts.join(" ");

        // Add to volunteers list in Brevo (ID 21) - only sending name, email and skills
        await brevoListsService.addToVolunteersList({
          email: email,
          attributes: {
            FIRSTNAME: firstName || "",
            LASTNAME: lastName || "",
            SKILLS: skills,
            SOURCE: "volunteer_application",
          },
        });

        logger.log(
          "✅ Volunteer application submitted and added to Brevo:",
          email
        );

        // Send confirmation email
        try {
          await authService.emailService.sendVolunteerApplicationConfirmation(
            email,
            name
          );
          logger.log("✅ Volunteer confirmation email sent to:", email);
        } catch (emailError) {
          logger.error(
            "⚠️ Failed to send volunteer confirmation email:",
            emailError
          );
          // Don't fail the application if email fails
        }

        return c.json(
          {
            message: "Volunteer application submitted successfully",
            email: email,
            name: name,
          },
          200
        );
      } catch (brevoError) {
        logger.error("⚠️ Failed to add volunteer to Brevo:", brevoError);

        return c.json(
          {
            message:
              "Application submitted but there was an issue with our system",
            email: email,
            name: name,
            brevoRegistered: false,
          },
          200
        );
      }
    } catch (error) {
      if (error instanceof HTTPException) {
        const body = (error as any).body || { message: (error as any).message };
        return c.json(body, error.status);
      }
      logger.error("Error submitting volunteer application:", error);
      return c.json({ message: "Error submitting volunteer application" }, 500);
    }
  }
}
