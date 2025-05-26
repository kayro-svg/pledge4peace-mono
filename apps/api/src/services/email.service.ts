import { Resend } from "resend";

export class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
  }

  async sendVerificationEmail(to: string, token: string, baseUrl: string) {
    const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: "Verify your email - Pledge4Peace",
        html: `
          <h1>Welcome to Pledge4Peace!</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationLink}">Verify Email</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
        `,
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }

  async sendPasswordResetEmail(to: string, token: string, baseUrl: string) {
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: "Reset your password - Pledge4Peace",
        html: `
          <h1>Password Reset Request</h1>
          <p>You have requested to reset your password. Click the link below to proceed:</p>
          <p><a href="${resetLink}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email and ensure your account is secure.</p>
        `,
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }
}
