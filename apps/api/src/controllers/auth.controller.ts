import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { logger } from '../utils/logger';

// Validation for registration
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

// Validation for login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Validation for email verification
const verifyEmailSchema = z.object({
  token: z.string(),
});

// Validation for resending verification email
const resendVerificationSchema = z.object({
  email: z.string().email(),
});

// Validation for password reset request
const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

// Validation for password reset
const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export class AuthController {
  async register(c: Context) {
    try {
      const body = await c.req.json();
      logger.log("Payload recibido en registro:", body);
      const validation = registerSchema.safeParse(body);

      if (!validation.success) {
        logger.error("Errores de validación:", validation.error.format());
        // Devolvemos JSON 400
        return c.json({ message: "Invalid input data" }, 400);
      }
      const frontendBase = c.env.FRONTEND_URL; // ej. "http://localhost:3000"
      if (!frontendBase) {
        logger.warn(
          "⚠️ FRONTEND_URL no definida; usando http://localhost:3000 por defecto"
        );
      }

      const baseUrl = frontendBase || "http://localhost:3000";

      const authService = c.get("authService");
      const brevoListsService = c.get("brevoListsService");

      const result = await authService.register(validation.data, baseUrl);

      // Si el registro fue exitoso, agregar usuario a Brevo Subscribers
      if (result && result.user) {
        try {
          // Preparar datos del contacto para Brevo
          const [firstName, ...lastNameParts] = validation.data.name.split(" ");
          const lastName = lastNameParts.join(" ");

          await brevoListsService.addToSubscribersList({
            email: validation.data.email,
            attributes: {
              FIRSTNAME: firstName || "",
              LASTNAME: lastName || "",
              EXT_ID: result.user?.id || "", // ID del usuario en nuestra DB
            },
          });

          logger.log(
            "✅ User added to Brevo Subscribers list:",
            validation.data.email
          );
        } catch (brevoError) {
          // No fallar el registro si Brevo falla, solo loggear el error
          logger.error(
            "⚠️ Failed to add user to Brevo Subscribers:",
            brevoError
          );
        }
      }

      return c.json(result, 201);
    } catch (error) {
      if (error instanceof HTTPException) {
        // Si authService arrojó HTTPException, devolvemos su body y status
        const body = (error as any).body || { message: (error as any).message };
        return c.json(body, error.status);
      }
      logger.error("Error registering user:", error);
      return c.json({ message: "Error registering user" }, 500);
    }
  }

  async login(c: Context) {
    try {
      const raw = await c.req.json();
      const validation = loginSchema.safeParse(raw);

      if (!validation.success) {
        return c.json({ message: "Invalid input data" }, 400);
      }

      const authService = c.get("authService");
      const result = await authService.login(validation.data);
      return c.json(result, 200);
    } catch (error) {
      if (error instanceof HTTPException) {
        return c.json((error as any).body, error.status);
      }
      logger.error("Error logging in:", error);
      return c.json({ message: "Error logging in" }, 500);
    }
  }

  async verifyEmail(c: Context) {
    try {
      const token = c.req.query("token");
      if (!token) {
        return c.json({ message: "Verification token is required" }, 400);
      }

      const validation = verifyEmailSchema.safeParse({ token });
      if (!validation.success) {
        return c.json({ message: "Invalid verification token" }, 400);
      }

      const authService = c.get("authService");
      const result = await authService.verifyEmail(token);
      return c.json(result, 200);
    } catch (error) {
      if (error instanceof HTTPException) {
        return c.json((error as any).body, error.status);
      }
      logger.error("Error verifying email:", error);
      return c.json({ message: "Error verifying email" }, 500);
    }
  }

  /**
   * POST /auth/resend-verification
   * Receives { email } and resends a verification link
   */
  async resendVerification(c: Context) {
    try {
      // 1) Read the JSON of the request
      const raw = await c.req.json();
      const validation = resendVerificationSchema.safeParse(raw);

      if (!validation.success) {
        return c.json({ message: "Invalid email" }, 400);
      }

      // 2) Call the service
      const authService = c.get("authService");
      // Reuse FRONTEND_URL to generate the link
      const frontendBase = c.env.FRONTEND_URL || "http://localhost:3000";
      const result = await authService.resendVerificationEmail(
        validation.data.email,
        frontendBase
      );

      // 3) If the user does not exist, result.message = “If your email is…”
      return c.json(result, 200);
    } catch (error) {
      // 4) If an HTTPException was thrown, return the body and status
      if (error instanceof HTTPException) {
        const body = (error as any).body || { message: (error as any).message };
        return c.json(body, error.status);
      }

      logger.error("Error in resendVerification:", error);
      return c.json({ message: "Internal error in resendVerification" }, 500);
    }
  }

  async getProfile(c: Context) {
    try {
      const userId = c.get("user").id;
      const authService = c.get("authService");
      const user = await authService.getUserById(userId);
      return c.json(user, 200);
    } catch (error) {
      if (error instanceof HTTPException) {
        return c.json((error as any).body, error.status);
      }
      logger.error("Error getting profile:", error);
      return c.json({ message: "Error getting profile" }, 500);
    }
  }

  async requestPasswordReset(c: Context) {
    logger.log("🚀 [AuthController] requestPasswordReset invoked");
    try {
      // 1) Read and validate incoming JSON
      const raw = await c.req.json();
      const validation = requestPasswordResetSchema.safeParse(raw);
      if (!validation.success) {
        return c.json({ message: "Invalid input data" }, 400);
      }

      // 2) Call the service
      const authService = c.get("authService");
      const baseUrl = new URL(c.req.url).origin;
      const result = await authService.requestPasswordReset(
        validation.data,
        baseUrl
      );

      // 3) Responder 200 + JSON
      return c.json(result, 200);
    } catch (error) {
      logger.error("🔴 Caught error in requestPasswordReset:", error);

      // 4) If it is an HTTPException, return a JSON with the message extracted from error.message
      if (error instanceof HTTPException) {
        const errMsg =
          (error as any).message ||
          ((error as any).body?.message as string) ||
          "Internal server error";

        logger.error("🔴 It was an HTTPException:", errMsg);
        return c.json({ message: errMsg }, error.status);
      }

      // 5) Any other exception → 500 + generic JSON
      logger.error("🔴 Unhandled exception in requestPasswordReset:", error);
      return c.json({ message: "Error requesting password reset" }, 500);
    }
  }

  async resetPassword(c: Context) {
    try {
      const raw = await c.req.json();
      const validation = resetPasswordSchema.safeParse(raw);
      if (!validation.success) {
        return c.json({ message: "Invalid input data" }, 400);
      }

      const authService = c.get("authService");
      const result = await authService.resetPassword(validation.data);
      return c.json(result, 200);
    } catch (error) {
      if (error instanceof HTTPException) {
        return c.json((error as any).body, error.status);
      }
      logger.error("Error resetting password:", error);
      return c.json({ message: "Error resetting password" }, 500);
    }
  }
}
