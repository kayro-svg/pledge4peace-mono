import { Context } from "hono";
import { AuthService } from "../services/auth.service";
import { createDb } from "../db";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

// Validación para registro
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

// Validación para login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Validación para verificación de email
const verifyEmailSchema = z.object({
  token: z.string(),
});

// Validación para solicitud de reset de contraseña
const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

// Validación para reset de contraseña
const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export class AuthController {
  async register(c: Context) {
    try {
      const body = await c.req.json();
      console.log("Payload recibido en registro:", body);
      const validation = registerSchema.safeParse(body);

      if (!validation.success) {
        console.error("Errores de validación:", validation.error.format());
        throw new HTTPException(400, { message: "Invalid input data" });
      }

      const db = createDb(c.env.DB);
      const service = new AuthService(
        db,
        c.env.JWT_SECRET,
        c.env.RESEND_API_KEY,
        c.env.FROM_EMAIL
      );

      const baseUrl = new URL(c.req.url).origin;
      const result = await service.register(validation.data, baseUrl);
      return c.json(result, 201);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error registering user:", error);
      throw new HTTPException(500, { message: "Error registering user" });
    }
  }

  async login(c: Context) {
    try {
      const validation = await c.req
        .json()
        .then((data) => loginSchema.safeParse(data));

      if (!validation.success) {
        throw new HTTPException(400, { message: "Invalid input data" });
      }

      const db = createDb(c.env.DB);
      const service = new AuthService(
        db,
        c.env.JWT_SECRET,
        c.env.RESEND_API_KEY,
        c.env.FROM_EMAIL
      );

      const result = await service.login(validation.data);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error logging in:", error);
      throw new HTTPException(500, { message: "Error logging in" });
    }
  }

  async verifyEmail(c: Context) {
    try {
      const token = c.req.query("token");

      if (!token) {
        throw new HTTPException(400, {
          message: "Verification token is required",
        });
      }

      const validation = verifyEmailSchema.safeParse({ token });

      if (!validation.success) {
        throw new HTTPException(400, { message: "Invalid verification token" });
      }

      const db = createDb(c.env.DB);
      const service = new AuthService(
        db,
        c.env.JWT_SECRET,
        c.env.RESEND_API_KEY,
        c.env.FROM_EMAIL
      );

      const result = await service.verifyEmail(token);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error verifying email:", error);
      throw new HTTPException(500, { message: "Error verifying email" });
    }
  }

  async getProfile(c: Context) {
    try {
      const userId = c.get("user").id;
      const db = createDb(c.env.DB);
      const service = new AuthService(
        db,
        c.env.JWT_SECRET,
        c.env.RESEND_API_KEY,
        c.env.FROM_EMAIL
      );

      const user = await service.getUserById(userId);
      return c.json(user);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error getting profile:", error);
      throw new HTTPException(500, { message: "Error getting profile" });
    }
  }

  async requestPasswordReset(c: Context) {
    try {
      const validation = await c.req
        .json()
        .then((data) => requestPasswordResetSchema.safeParse(data));

      if (!validation.success) {
        throw new HTTPException(400, { message: "Invalid input data" });
      }

      const db = createDb(c.env.DB);
      const service = new AuthService(
        db,
        c.env.JWT_SECRET,
        c.env.RESEND_API_KEY,
        c.env.FROM_EMAIL
      );

      const baseUrl = new URL(c.req.url).origin;
      const result = await service.requestPasswordReset(
        validation.data,
        baseUrl
      );
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error requesting password reset:", error);
      throw new HTTPException(500, {
        message: "Error requesting password reset",
      });
    }
  }

  async resetPassword(c: Context) {
    try {
      const validation = await c.req
        .json()
        .then((data) => resetPasswordSchema.safeParse(data));

      if (!validation.success) {
        throw new HTTPException(400, { message: "Invalid input data" });
      }

      const db = createDb(c.env.DB);
      const service = new AuthService(
        db,
        c.env.JWT_SECRET,
        c.env.RESEND_API_KEY,
        c.env.FROM_EMAIL
      );

      const result = await service.resetPassword(validation.data);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error resetting password:", error);
      throw new HTTPException(500, { message: "Error resetting password" });
    }
  }
}
