import { eq } from "drizzle-orm";
import { users } from "../db/schema/users";
import { sign, verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import * as bcrypt from "bcryptjs";
import { EmailService } from "./email.service";
import { randomBytes } from "node:crypto";
import { Database } from "../db";

export interface RegisterUserDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RequestPasswordResetDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export class AuthService {
  private emailService: EmailService;

  constructor(
    private db: Database,
    private jwtSecret: string,
    resendApiKey: string,
    fromEmail: string
  ) {
    this.emailService = new EmailService(resendApiKey, fromEmail);
  }

  async register(data: RegisterUserDTO, baseUrl: string) {
    // Verificar si el email ya existe
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      throw new HTTPException(400, { message: "Email already registered" });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generar token de verificación
    const verificationToken = randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear el usuario
    const newUser = await this.db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
        emailVerified: 0,
        verificationToken: verificationToken,
        verificationTokenExpiresAt: expiresAt,
      })
      .returning();

    const user = newUser[0];

    // Enviar email de verificación
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        baseUrl
      );
    } catch (error) {
      console.error("Error sending verification email:", error);
      // No lanzamos el error para no interrumpir el registro
    }

    // Generar token JWT
    const token = await this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified === 1,
      },
      token,
    };
  }

  async login(data: LoginDTO) {
    // Buscar usuario por email
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!user) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    // Verificar estado del usuario
    if (user.status !== "active") {
      throw new HTTPException(401, { message: "Account is not active" });
    }

    // Generar token JWT
    const token = await this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified === 1,
      },
      token,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.verificationToken, token),
    });

    if (!user) {
      throw new HTTPException(400, { message: "Invalid verification token" });
    }

    if (user.emailVerified === 1) {
      throw new HTTPException(400, { message: "Email already verified" });
    }

    const now = new Date();
    if (
      user.verificationTokenExpiresAt &&
      user.verificationTokenExpiresAt < now
    ) {
      throw new HTTPException(400, {
        message: "Verification token has expired",
      });
    }

    await this.db
      .update(users)
      .set({
        emailVerified: 1,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    return {
      message: "Email verified successfully",
    };
  }

  private async generateToken(user: typeof users.$inferSelect) {
    return await sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified === 1,
        image: user.image,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 días
      },
      this.jwtSecret,
      "HS256"
    );
  }

  async getUserById(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified === 1,
      image: user.image,
    };
  }

  async requestPasswordReset(data: RequestPasswordResetDTO, baseUrl: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        message:
          "If your email is registered, you will receive a password reset link",
      };
    }

    // Generar token de reset
    const resetToken = randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora

    // Actualizar usuario con el token
    await this.db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiresAt: expiresAt,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    // Enviar email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        baseUrl
      );
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new HTTPException(500, {
        message: "Failed to send password reset email",
      });
    }

    return {
      message:
        "If your email is registered, you will receive a password reset link",
    };
  }

  async resetPassword(data: ResetPasswordDTO) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.resetToken, data.token),
    });

    if (!user) {
      throw new HTTPException(400, {
        message: "Invalid or expired reset token",
      });
    }

    const now = new Date();
    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < now) {
      throw new HTTPException(400, { message: "Reset token has expired" });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Actualizar usuario
    await this.db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    return { message: "Password reset successful" };
  }
}
