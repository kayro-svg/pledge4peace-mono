import { logger } from "../utils/logger";
// apps/api/src/services/email.service.ts

export interface BrevoConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor({ apiKey, fromEmail, fromName = "Pledge4Peace" }: BrevoConfig) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  /**
   * Envía un correo de verificación de cuenta usando fetch hacia Brevo.
   */
  async sendVerificationEmail(to: string, token: string, baseUrl: string) {
    // const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;
    // después:
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    logger.log("🔗 [DEV] Verification link:", verificationLink);

    // Payload según la spec v3 de Brevo (Transactional Emails)
    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: to,
          name: to.split("@")[0], // nombre opcional
        },
      ],
      subject: "Verify your email – Pledge4Peace",
      htmlContent: `
        <h1>Welcome to Pledge4Peace!</h1>
        <p>To verify your account, click the button below:</p>
        <p>
          <a href="${verificationLink}"
             style="
               background-color: #548281;
               color: white;
               padding: 10px 20px;
               text-decoration: none;
               border-radius: 5px;
             ">
            Verify Email
          </a>
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error("Brevo sendVerificationEmail error:", response.status, text);
      throw new Error("Failed to send verification email");
    }

    return await response.json();
  }

  /**
   * Envía un correo para restablecer la contraseña usando fetch hacia Brevo.
   */
  async sendPasswordResetEmail(to: string, token: string, baseUrl: string) {
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: to,
          name: to.split("@")[0],
        },
      ],
      subject: "Reset your password – Pledge4Peace",
      htmlContent: `
        <h1>Password Reset Request</h1>
        <p>You have requested to reset your password. Click the button below to proceed:</p>
        <p>
          <a href="${resetLink}"
             style="
               background-color: #548281;
               color: white;
               padding: 10px 20px;
               text-decoration: none;
               border-radius: 5px;
             ">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error(
        "Brevo sendPasswordResetEmail error:",
        response.status,
        text
      );
      throw new Error("Failed to send password reset email");
    }

    return await response.json();
  }

  /**
   * Envía un correo de confirmación de registro a evento
   */
  async sendEventRegistrationConfirmation(
    to: string,
    eventTitle: string,
    userName?: string
  ) {
    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: to,
          name: userName || to.split("@")[0],
        },
      ],
      subject: `Registration Confirmed: ${eventTitle}`,
      htmlContent: `
        <h1>Registration Confirmed!</h1>
        <p>Hello ${userName ? userName : "there"},</p>
        <p>Thank you for registering for <strong>${eventTitle}</strong>!</p>
        <p>We're excited to have you join us. Here are the details:</p>
        <ul>
          <li><strong>Event:</strong> ${eventTitle}</li>
          <li><strong>Status:</strong> Successfully registered</li>
        </ul>
        <p>You'll receive more details about the event as we get closer to the date.</p>
        <p>In the meantime, feel free to explore more of our initiatives at Pledge4Peace.</p>
        <p>Thank you for being part of our mission for peace!</p>
        <br>
        <p>Best regards,<br>The Pledge4Peace Team</p>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error(
        "Brevo sendEventRegistrationConfirmation error:",
        response.status,
        text
      );
      throw new Error("Failed to send event registration confirmation email");
    }

    return await response.json();
  }

  /**
   * Envía un correo de confirmación de formulario de contacto
   */
  async sendContactConfirmation(to: string, userName: string, subject: string) {
    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: to,
          name: userName,
        },
      ],
      subject: "We've received your message - Pledge4Peace",
      htmlContent: `
        <h1>Thank you for contacting us!</h1>
        <p>Hello ${userName},</p>
        <p>We have received your contact form regarding: <strong>${subject}</strong></p>
        <p>One of our agents will be in contact with you shortly to address your inquiry.</p>
        <p>In the meantime, feel free to explore our website and learn more about our peace initiatives.</p>
        <p>We appreciate your interest in Pledge4Peace and look forward to connecting with you soon.</p>
        <br>
        <p>Best regards,<br>The Pledge4Peace Team</p>
        <p><small>This is an automated confirmation. Please do not reply to this email.</small></p>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error(
        "Brevo sendContactConfirmation error:",
        response.status,
        text
      );
      throw new Error("Failed to send contact confirmation email");
    }

    return await response.json();
  }

  /**
   * Envía un correo de confirmación de aplicación de voluntario
   */
  async sendVolunteerApplicationConfirmation(to: string, userName: string) {
    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: to,
          name: userName,
        },
      ],
      subject: "Thank you for your volunteer application - Pledge4Peace",
      htmlContent: `
        <h1>Thank you for volunteering with us!</h1>
        <p>Hello ${userName},</p>
        <p>We have received your volunteer application and are thrilled about your interest in joining our mission for peace.</p>
        <p>Our team will review your application and get back to you within the next few days with more information about volunteer opportunities that match your skills and availability.</p>
        <p>In the meantime, feel free to explore our website and learn more about our current initiatives and campaigns.</p>
        <p>Thank you for wanting to make a difference in the world. Together, we can build a more peaceful future!</p>
        <br>
        <p>Best regards,<br>The Pledge4Peace Team</p>
        <p><small>This is an automated confirmation. Please do not reply to this email.</small></p>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error(
        "Brevo sendVolunteerApplicationConfirmation error:",
        response.status,
        text
      );
      throw new Error(
        "Failed to send volunteer application confirmation email"
      );
    }

    return await response.json();
  }
}
