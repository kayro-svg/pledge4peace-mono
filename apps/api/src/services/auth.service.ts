import { eq } from "drizzle-orm";
import { users } from "../db/schema/users";
import { sign, verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import * as bcrypt from "bcryptjs";
import { BrevoConfig, EmailService } from "./email.service";
import { randomBytes } from "node:crypto";
import { Database } from "../db";
import { solutions } from "../db/schema/solutions";
import { comments } from "../db/schema/comments";
import { solutionInteractions } from "../db/schema/interactions";
import { pledges } from "../db/schema/pledges";
import { logger } from "../utils/logger";

export interface RegisterUserDTO {
  email: string;
  password: string;
  name: string;
  userType: string;
  office?: string;
  organization?: string;
  nonprofit?: string;
  institution?: string;
  otherRole?: string;
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
  public emailService: EmailService;

  constructor(
    private db: Database,
    private jwtSecret: string,
    private brevoConfig: BrevoConfig
  ) {
    // Aquí creamos la instancia de EmailService pasándole el objeto de configuración
    this.emailService = new EmailService(this.brevoConfig);
  }

  async register(data: RegisterUserDTO, baseUrl: string) {
    // 1) Normalizar y limpiar el email
    const emailNormalized = data.email.trim().toLowerCase();

    // 2) Chequear duplicado lo antes posible
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, emailNormalized),
    });
    if (existingUser) {
      // Si el email ya está en BD, respondemos 400 sin hacer hash ni nada más
      throw new HTTPException(400, { message: "Email already registered" });
    }

    // 3) Hacer hash de la contraseña (ya que no existe duplicado)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 4) Generar token de verificación
    const verificationToken = randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

    // 5) Insertar el usuario con el email ya normalizado
    const newUser = await this.db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: emailNormalized,
        name: data.name.trim(),
        password: hashedPassword,
        userType: data.userType as
          | "citizen"
          | "politician"
          | "organization"
          | "nonprofit"
          | "student"
          | "other",
        office: data.office || null,
        organization: data.organization || null,
        nonprofit: data.nonprofit || null,
        institution: data.institution || null,
        otherRole: data.otherRole || null,
        createdAt: now,
        updatedAt: now,
        emailVerified: 0,
        verificationToken,
        verificationTokenExpiresAt: expiresAt,
      })
      .returning();

    const user = newUser[0];

    // 6) Intentar enviar email de verificación + welcome prefs (no bloqueante)
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        baseUrl
      );
      // Welcome + preferences info (best-effort)
      try {
        await this.emailService.sendWelcomeNotificationsPrefsEmail(
          user.email,
          baseUrl,
          user.name
        );
      } catch (e) {
        logger.warn("Welcome prefs email failed:", e as any);
      }
    } catch (error) {
      logger.error("Error sending verification email:", error);
      // No interrumpimos el registro por culpa del email
    }

    // 7) Generar token JWT
    const token = await this.generateToken(user);

    // 8) Devolver el usuario y el JWT
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: false, // siempre empieza en false
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
        role: user.role || "user",
        createdAt: user.createdAt,
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
    // Marcar emailVerified = 1 y limpiar token de verificación
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
      userType: user.userType || null,
    };
  }

  /**
   * If the user exists and is not verified, generates a new verification token,
   * updates the database and sends an email. If it is already verified or does not exist, handles the case.
   */
  async resendVerificationEmail(email: string, baseUrl: string) {
    // 1) Normalizar el email
    const emailNormalized = email.trim().toLowerCase();

    // 2) Buscar usuario por email
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, emailNormalized),
    });

    // 3) Si no existe, devolvemos mensaje genérico (por seguridad, no revelamos nada)
    if (!user) {
      return {
        message:
          "If your email is registered, you will receive a verification link in a few minutes.",
      };
    }

    // 4) Si ya está verificado, devolvemos error 400
    if (user.emailVerified === 1) {
      throw new HTTPException(400, {
        message: "This email is already verified.",
      });
    }

    // 5) Generar nuevo token de verificación y nueva expiración
    const newToken = randomBytes(32).toString("hex");
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    // 6) Actualizar el registro del usuario con el nuevo token
    await this.db
      .update(users)
      .set({
        verificationToken: newToken,
        verificationTokenExpiresAt: newExpiresAt,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    // 7) Intentar enviar el nuevo correo de verificación
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        newToken,
        baseUrl
      );
    } catch (error) {
      logger.error("Error sending the re-verification email:", error as any);
      throw new HTTPException(500, {
        message:
          "The verification email could not be sent. Please try again later.",
      });
    }

    // 8) Devolver mensaje de éxito
    return {
      message:
        "A new verification link has been sent to your email. Please check your inbox.",
    };
  }

  private async generateToken(user: typeof users.$inferSelect) {
    return await sign(
      {
        sub: user.id, // Use 'sub' as the standard JWT identifier for the user ID
        id: user.id, // Keep 'id' for compatibility
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified === 1,
        image: user.image,
        // Incluir role en el JWT para verificación de permisos
        role: user.role || "user",
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
      },
      this.jwtSecret,
      "HS256"
    );
  }

  /**
   * Mint a fresh JWT for the given user id using current DB role/state
   */
  async refreshTokenForUser(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }
    const token = await this.generateToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified === 1,
        role: user.role || "user",
        createdAt: user.createdAt,
      },
      token,
    };
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
      userType: user.userType || null,
      office: user.office || null,
      organization: user.organization || null,
      nonprofit: user.nonprofit || null,
      institution: user.institution || null,
      otherRole: user.otherRole || null,
      // Incluir role en la respuesta del perfil
      role: user.role || "user",
    };
  }

  async requestPasswordResetService(
    data: RequestPasswordResetDTO,
    baseUrl: string
  ) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!user) {
      // For security, we do not reveal if the email exists or not
      return {
        message:
          "If your email is registered, you will receive a password reset link",
      };
    }

    // Generar token de reset
    const resetToken = randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

    // Update user with the token
    await this.db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiresAt: expiresAt,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    // Send email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        baseUrl
      );
    } catch (error) {
      logger.error("Error sending password reset email:", error);
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

    // Hash the new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update user
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

  async deleteUser(userId: string) {
    const now = new Date();

    // Start a transaction to ensure all updates are atomic
    await this.db.transaction(async (tx) => {
      // 1. Mark user as deleted
      await tx
        .update(users)
        .set({
          status: "deleted",
          updatedAt: now,
          // Anonymize personal data
          email: `deleted_${userId}@deleted.com`,
          name: "Deleted User",
          password: "",
          image: null,
          verificationToken: null,
          verificationTokenExpiresAt: null,
          resetToken: null,
          resetTokenExpiresAt: null,
        })
        .where(eq(users.id, userId));

      // 2. Update solutions
      await tx
        .update(solutions)
        .set({
          status: "archived",
          updatedAt: now,
        })
        .where(eq(solutions.userId, userId));

      // 3. Update comments
      await tx
        .update(comments)
        .set({
          status: "deleted",
          updatedAt: now,
          userName: "Deleted User",
          userAvatar: null,
        })
        .where(eq(comments.userId, userId));

      // 4. Update solution interactions
      await tx
        .update(solutionInteractions)
        .set({
          status: "removed",
        })
        .where(eq(solutionInteractions.userId, userId));

      // 5. Update pledges
      await tx
        .update(pledges)
        .set({
          status: "removed",
        })
        .where(eq(pledges.userId, userId));
    });

    return { message: "User deleted successfully" };
  }
}
