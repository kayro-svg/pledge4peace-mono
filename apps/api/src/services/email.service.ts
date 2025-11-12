import { logger } from "../utils/logger";
import { markdownToHtml } from "../config/agreement-templates";
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
    if (!apiKey || !fromEmail) {
      throw new Error(
        "EmailService requires apiKey and fromEmail to be provided"
      );
    }
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  /**
   * Notifica al usuario que su rol ha cambiado
   */
  async sendRoleChangedEmail(
    to: string,
    newRole: "user" | "moderator" | "admin" | "superAdmin"
  ) {
    const roleLabel =
      newRole === "superAdmin"
        ? "Super Admin"
        : newRole.charAt(0).toUpperCase() + newRole.slice(1);
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
      subject: `Your role has been updated to ${roleLabel} – Pledge4Peace`,
      htmlContent: `
        <h1>Role Updated</h1>
        <p>Hello,</p>
        <p>Your account role on <strong>Pledge4Peace</strong> has been updated to <strong>${roleLabel}</strong>.</p>
        <p>This grants you new permissions within the platform. If you did not expect this change, please contact support.</p>
        <p>Thank you for supporting our mission.</p>
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
      logger.error("Brevo sendRoleChangedEmail error:", response.status, text);
      throw new Error("Failed to send role changed email");
    }

    return await response.json();
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
   * Welcome + Notification Preferences Email on registration
   * Explains defaults (enabled) and links to settings so user can change them.
   */
  async sendWelcomeNotificationsPrefsEmail(
    to: string,
    baseUrl: string,
    userName?: string
  ) {
    const prefsLink = `${baseUrl}/dashboard/notifications#prefs`;
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
      subject: "Welcome! Manage your notification preferences – Pledge4Peace",
      htmlContent: `
        <h1>Welcome to Pledge4Peace!</h1>
        <p>Hello ${userName || "there"},</p>
        <p>By default, <strong>email notifications</strong> and <strong>in‑app notifications</strong> are <strong>enabled</strong> so you don't miss important updates.</p>
        <p>If you prefer, you can adjust your preferences at any time here:</p>
        <p>
          <a href="${prefsLink}"
             style="
               background-color: #548281;
               color: white;
               padding: 10px 20px;
               text-decoration: none;
               border-radius: 5px;
             "
             target="_blank"
          >
            Open Notification Settings
          </a>
        </p>
        <p>You can toggle email or in‑app notifications according to your preferences.</p>
        <p>Thank you for joining us!</p>
      `,
    } as const;

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
        "Brevo sendWelcomeNotificationsPrefsEmail error:",
        response.status,
        text
      );
      throw new Error("Failed to send welcome preferences email");
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

  /**
   * Envía notificación de nuevo registro de usuario al admin
   */
  async sendNewUserRegistrationNotification(userData: {
    name: string;
    email: string;
    registrationDate: string;
  }) {
    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: "info@pledge4peace.org",
          // email: "kayrov@weversity.org",
          name: "Pledge4Peace Admin",
        },
        {
          email: "shelsys@pledge4peace.org",
          name: "Shelsys Rivera - Marketing Chief",
        },
      ],
      subject: "New User Registration - Pledge4Peace",
      htmlContent: `
        <h1>New User Registration</h1>
        <p>A new user has registered on the Pledge4Peace platform:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>User Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${userData.name}</li>
            <li><strong>Email:</strong> ${userData.email}</li>
            <li><strong>Registration Date:</strong> ${userData.registrationDate}</li>
          </ul>
        </div>
        <p>Please review the registration and take any necessary follow-up actions.</p>
        <br>
        <p>Best regards,<br>Pledge4Peace System</p>
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
        "Brevo sendNewUserRegistrationNotification error:",
        response.status,
        text
      );
      throw new Error("Failed to send user registration notification email");
    }

    return await response.json();
  }

  /**
   * Envía notificación de formulario de contacto al admin
   */
  async sendContactFormNotification(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
    submissionDate: string;
  }) {
    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: "info@pledge4peace.org",
          name: "Pledge4Peace Admin",
        },
        {
          email: "shelsys@pledge4peace.org",
          name: "Shelsys Rivera - Marketing Chief",
        },
      ],
      subject: `New Contact Form Submission: ${contactData.subject}`,
      htmlContent: `
        <h1>New Contact Form Submission</h1>
        <p>A new contact form has been submitted on the Pledge4Peace website:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Contact Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${contactData.name}</li>
            <li><strong>Email:</strong> ${contactData.email}</li>
            <li><strong>Subject:</strong> ${contactData.subject}</li>
            <li><strong>Submission Date:</strong> ${contactData.submissionDate}</li>
          </ul>
          <h3>Message:</h3>
          <div style="background-color: white; padding: 10px; border-left: 4px solid #548281; margin-top: 10px;">
            <p>${contactData.message.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
        <p>Please respond to this inquiry as soon as possible.</p>
        <br>
        <p>Best regards,<br>Pledge4Peace System</p>
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
        "Brevo sendContactFormNotification error:",
        response.status,
        text
      );
      throw new Error("Failed to send contact form notification email");
    }

    return await response.json();
  }

  /**
   * Envía notificación de aplicación de voluntario al admin
   */
  async sendVolunteerApplicationNotification(volunteerData: {
    name: string;
    email: string;
    about: string;
    skills: string;
    availability: string;
    submissionDate: string;
  }) {
    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: "info@pledge4peace.org",
          name: "Pledge4Peace Admin",
        },
        {
          email: "shelsys@pledge4peace.org",
          name: "Shelsys Rivera - Marketing Chief",
        },
      ],
      subject: `New Volunteer Application from ${volunteerData.name}`,
      htmlContent: `
        <h1>New Volunteer Application</h1>
        <p>A new volunteer application has been submitted:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Volunteer Information:</h3>
          <ul>
            <li><strong>Name:</strong> ${volunteerData.name}</li>
            <li><strong>Email:</strong> ${volunteerData.email}</li>
            <li><strong>Submission Date:</strong> ${volunteerData.submissionDate}</li>
          </ul>
          
          <h3>About:</h3>
          <div style="background-color: white; padding: 10px; border-left: 4px solid #548281; margin: 10px 0;">
            <p>${volunteerData.about.replace(/\n/g, "<br>")}</p>
          </div>
          
          <h3>Skills:</h3>
          <div style="background-color: white; padding: 10px; border-left: 4px solid #548281; margin: 10px 0;">
            <p>${volunteerData.skills.replace(/\n/g, "<br>")}</p>
          </div>
          
          <h3>Availability:</h3>
          <div style="background-color: white; padding: 10px; border-left: 4px solid #548281; margin: 10px 0;">
            <p>${volunteerData.availability.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
        <p>Please review this application and contact the volunteer to discuss next steps.</p>
        <br>
        <p>Best regards,<br>Pledge4Peace System</p>
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
        "Brevo sendVolunteerApplicationNotification error:",
        response.status,
        text
      );
      throw new Error(
        "Failed to send volunteer application notification email"
      );
    }

    return await response.json();
  }

  /**
   * Envía notificación de nuevo pledge al admin
   */
  async sendPledgeNotification(pledgeData: {
    userName: string;
    userEmail: string;
    campaignTitle: string;
    pledgeDate: string;
    subscribeToUpdates: boolean;
  }) {
    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: "info@pledge4peace.org",
          name: "Pledge4Peace Admin",
        },
        {
          email: "shelsys@pledge4peace.org",
          name: "Shelsys Rivera - Marketing Chief",
        },
        // {
        //   email: "kayrov@weversity.org",
        //   name: "kayro developer",
        // },
      ],
      subject: `New Pledge from ${pledgeData.userName}`,
      htmlContent: `
        <h1>New Pledge Received</h1>
        <p>A new pledge has been made on the Pledge4Peace platform:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Pledge Details:</h3>
          <ul>
            <li><strong>User Name:</strong> ${pledgeData.userName}</li>
            <li><strong>User Email:</strong> ${pledgeData.userEmail}</li>
            <li><strong>Campaign Title:</strong> ${pledgeData.campaignTitle}</li>
            <li><strong>Pledge Date:</strong> ${pledgeData.pledgeDate}</li>
          </ul>
        </div>
        <p>This user has successfully committed to supporting this campaign's peace initiatives.</p>
        <br>
        <p>Best regards,<br>Pledge4Peace System</p>
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
        "Brevo sendPledgeNotification error:",
        response.status,
        text
      );
      throw new Error("Failed to send pledge notification email");
    }

    return await response.json();
  }

  /**
   * Notifica al admin que hay una nueva solución para moderar
   */
  async sendNewSolutionModerationNotification(payload: {
    authorName: string;
    authorEmail: string;
    title: string;
    description?: string;
    campaignId: string;
    campaignTitle?: string;
    campaignSlug?: string;
  }) {
    const body = {
      sender: { name: this.fromName, email: this.fromEmail },
      to: [
        { email: "info@pledge4peace.org", name: "Pledge4Peace Admin" },
        { email: "shelsys@pledge4peace.org", name: "Shelsys Rivera" },
        // { email: "kayrov@weversity.org", name: "kayro developer" },
      ],
      subject: `New solution submitted for moderation – ${payload.title}`,
      htmlContent: `
        <h1>New Solution Submitted</h1>
        <p><strong>Author:</strong> ${payload.authorName} (${payload.authorEmail})</p>
        <p><strong>Campaign:</strong> ${payload.campaignTitle || payload.campaignSlug || "(unknown)"}</p>
        ${payload.campaignSlug ? `<p><a href="https://www.pledge4peace.org/campaigns/${payload.campaignSlug}" target="_blank">Open related campaign</a></p>` : ""}
        <p><strong>Title:</strong> ${payload.title}</p>
        ${payload.description ? `<p><strong>Description:</strong> ${payload.description}</p>` : ""}
        <p>Please review this solution in the <a href="https://pledge4peace.org/dashboard/moderate-campaigns-solutions" target="_blank">moderation dashboard</a>.</p>
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
        "Brevo sendNewSolutionModerationNotification error:",
        response.status,
        text
      );
      throw new Error("Failed to send moderation notification email");
    }

    return await response.json();
  }

  /**
   * Notifica al autor el resultado de la moderación (aprobado/rechazado)
   */
  async sendSolutionModerationResult(payload: {
    to: string;
    userName?: string;
    result: "approved" | "rejected";
    title: string;
    reason?: string;
    campaignTitle?: string;
    campaignId?: string;
    campaignSlug?: string;
  }) {
    const subjectPrefix =
      payload.result === "approved"
        ? "Your solution was approved"
        : "Your solution was rejected";
    const body = {
      sender: { name: this.fromName, email: this.fromEmail },
      to: [
        {
          email: payload.to,
          name: payload.userName || payload.to.split("@")[0],
        },
      ],
      subject: `${subjectPrefix} – ${payload.title}`,
      htmlContent: `
        <h1>${subjectPrefix}</h1>
        <p>Hello ${payload.userName || "there"},</p>
        <p>Your solution <strong>${payload.title}</strong> has been <strong>${payload.result}</strong> by our moderators.</p>
        ${payload.campaignTitle || payload.campaignSlug ? `<p><strong>Campaign:</strong> ${payload.campaignTitle || payload.campaignSlug}</p>` : ""}
        ${payload.campaignSlug ? `<p><a href="https://www.pledge4peace.org/campaigns/${payload.campaignSlug}" target="_blank">Open related campaign</a></p>` : ""}
        ${payload.result === "rejected" && payload.reason ? `<p><strong>Reason:</strong> ${payload.reason}</p>` : ""}
        <p>Thank you for contributing to Pledge4Peace.</p>
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
        "Brevo sendSolutionModerationResult error:",
        response.status,
        text
      );
      throw new Error("Failed to send moderation result email");
    }

    return await response.json();
  }

  async sendQuoteRequestEmailtoAdmin(
    companyName: string,
    employeeCount: number
  ) {
    const body = {
      sender: { name: this.fromName, email: this.fromEmail },
      to: [
        // { email: "info@pledge4peace.org", name: "Pledge4Peace Admin" },
        // {
        //   email: "shelsys@pledge4peace.org",
        //   name: "Shelsys Rivera - Marketing Chief",
        // },
        {
          email: "kayrov@weversity.org",
          name: "kayro developer",
        },
      ],
      subject: `Peace Seal Certification Quote Request for ${companyName}`,
      htmlContent: `
        <h1>New Quote Request</h1>
        <p>A new quote request has been submitted for Peace Seal certification.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Company Details:</h3>
          <ul>
            <li><strong>Company Name:</strong> ${companyName}</li>
            <li><strong>Employee Count:</strong> 50+ employees</li>
          </ul>
        </div>
        <p>Please review this request in the dashboard and set a custom quote amount for this company.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.pledge4peace.org/dashboard/peace-seal" target="_blank" style="background-color: #548281; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Quote Request in Dashboard</a>
        </div>
        <p>You can set the quote amount directly from the company's application in the dashboard.</p>
        <br>
        <p>Best regards,<br>Pledge4Peace System</p>
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
        "Brevo sendQuoteRequestEmailtoAdmin error:",
        response.status,
        text
      );
      throw new Error("Failed to send quote request email to admin");
    }

    return await response.json();
  }

  async sendQuoteAmountEmail(
    to: string,
    companyName: string,
    amountCents: number,
    paymentUrl: string
  ) {
    const amountDollars = (amountCents / 100).toFixed(2);
    const body = {
      sender: { name: this.fromName, email: this.fromEmail },
      to: [{ email: to, name: companyName }],
      subject: `Your Peace Seal Certification Quote is Ready`,
      htmlContent: `
        <h1>Your Custom Quote is Ready</h1>
        <p>Dear ${companyName},</p>
        <p>Thank you for your interest in Peace Seal certification. We have prepared a custom quote for your company.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h2 style="margin: 0 0 10px 0; color: #2F4858;">Quote Amount</h2>
          <p style="font-size: 32px; font-weight: bold; color: #548281; margin: 0;">$${amountDollars}</p>
          <p style="margin: 10px 0 0 0; color: #666;">Annual certification fee</p>
        </div>
        <p>To proceed with your Peace Seal certification, please complete the payment using the link below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentUrl}" target="_blank" style="background-color: #548281; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Pay Now</a>
        </div>
        <p>After payment is confirmed, you can continue with the questionnaire to complete your application.</p>
        <p>If you have any questions about this quote, please don't hesitate to contact us.</p>
        <br>
        <p>Best regards,<br>Pledge4Peace Team</p>
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
      logger.error("Brevo sendQuoteAmountEmail error:", response.status, text);
      throw new Error("Failed to send quote amount email");
    }

    return await response.json();
  }

  async sendCommunityReviewVerificationEmail(
    to: string,
    token: string,
    baseUrl: string
  ) {
    const verificationLink = `${baseUrl}/verify-review?token=${token}`;

    const body = {
      sender: { name: this.fromName, email: this.fromEmail },
      to: [{ email: to, name: to.split("@")[0] }],
      subject: "Verify your review – Pledge4Peace",
      htmlContent: `
        <h1>Thank you for your review!</h1>
        <p>Hello,</p>
        <p>We've received your review and want to thank you for taking the time to share your experience. Your feedback is valuable in helping us maintain transparency and accountability in the business community.</p>
        <p><strong>What happens next?</strong></p>
        <p>Our team will review your submission to ensure it meets our community guidelines. Once verified, your review will be published and contribute to the company's overall rating.</p>
        <p>To verify your email address and complete the review submission process, please click the button below:</p>
        <p>
          <a href="${verificationLink}"
             style="
               background-color: #548281;
               color: white;
               padding: 10px 20px;
               text-decoration: none;
               border-radius: 5px;
               display: inline-block;
               margin: 10px 0;
             ">
            Verify Your Review
          </a>
        </p>
        <p>This verification link will expire in 24 hours.</p>
        <p>If you didn't submit a review, please ignore this email or contact us if you have any concerns.</p>
        <p>Thank you for supporting our mission to promote peace and ethical business practices!</p>
        <br>
        <p>Best regards,<br>The Pledge4Peace Team</p>
        <p><small>This is an automated email. Please do not reply to this message.</small></p>
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
        "Brevo sendCommunityReviewVerificationEmail error:",
        response.status,
        text
      );
      throw new Error("Failed to send community review verification email");
    }

    return await response.json();
  }

  /**
   * Envía confirmación de pago exitoso para Peace Seal al usuario
   */
  async sendPeaceSealPaymentConfirmation(
    to: string,
    userName: string,
    companyName: string,
    baseUrl: string
  ) {
    const dashboardLink = `${baseUrl}/dashboard/company-peace-seal`;

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
      subject: `Welcome to Peace Seal Certification - ${companyName}`,
      htmlContent: `
        <h1>Payment Confirmed - Welcome to Peace Seal!</h1>
        <p>Hello ${userName},</p>
        <p>Congratulations! Your payment for the Peace Seal certification has been successfully processed for <strong>${companyName}</strong>.</p>

        <div style="background-color: #f0f9f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #548281;">
          <h3 style="color: #2F4858; margin-top: 0;">What's Next?</h3>
          <p>Your company is now officially part of the global Peace Seal network. Here's what you can expect:</p>
          <ul>
            <li><strong>Certification Process:</strong> Our team will begin the comprehensive ethical practices audit</li>
            <li><strong>Peace Seal Badge:</strong> You'll receive your official Peace Seal badge and certificate</li>
            <li><strong>Dashboard Access:</strong> Monitor your certification progress and manage your profile</li>
            <li><strong>Community Benefits:</strong> Access to exclusive networking opportunities and peace initiatives</li>
          </ul>
        </div>

        <p>Check your Peace Seal dashboard to view your certification status, upload required documents, and track your progress:</p>
        <p>
          <a href="${dashboardLink}"
             style="
               background-color: #548281;
               color: white;
               padding: 12px 24px;
               text-decoration: none;
               border-radius: 6px;
               display: inline-block;
               font-weight: bold;
             ">
            View Your Peace Seal Dashboard
          </a>
        </p>

        <p>If you have any questions about the certification process or need assistance, please don't hesitate to contact our support team.</p>

        <p>Thank you for choosing to be part of the Peace Seal movement and for your commitment to ethical business practices.</p>

        <br>
        <p>Best regards,<br>The Pledge4Peace Team</p>
        <p><small>This is an automated confirmation. Your annual certification fee has been processed successfully.</small></p>
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
        "Brevo sendPeaceSealPaymentConfirmation error:",
        response.status,
        text
      );
      throw new Error("Failed to send peace seal payment confirmation email");
    }

    return await response.json();
  }

  /**
   * Envía notificación a la empresa cuando se requiere respuesta a una evaluación de review
   */
  async sendCompanyIssueNotificationEmail(
    to: string,
    userName: string,
    companyName: string,
    reviewRole: string,
    reviewScore: number | null,
    reviewStarRating: number | null,
    evaluationNotes: string | null,
    deadlineDate: number,
    baseUrl: string
  ) {
    const dashboardLink = `${baseUrl}/dashboard/company-peace-seal`;
    const deadlineFormatted = new Date(deadlineDate).toLocaleDateString();
    const daysUntilDeadline = Math.ceil(
      (deadlineDate - Date.now()) / (1000 * 60 * 60 * 24)
    );

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
      subject: `Action Required: Response Needed for Community Review - ${companyName}`,
      htmlContent: `
        <h1>Action Required: Response Needed for Community Review</h1>
        <p>Hello ${userName},</p>
        <p>A community review for <strong>${companyName}</strong> requires your response.</p>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">Review Details</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Reviewer Role:</strong> ${reviewRole}</li>
            ${reviewScore !== null ? `<li><strong>Score:</strong> ${reviewScore}/100</li>` : ""}
            ${reviewStarRating !== null ? `<li><strong>Rating:</strong> ${reviewStarRating}/5 stars</li>` : ""}
          </ul>
          ${
            evaluationNotes
              ? `
            <div style="margin-top: 15px; padding: 10px; background-color: #fff; border-radius: 4px;">
              <strong>Advisor Notes:</strong>
              <p style="margin: 5px 0 0 0;">${evaluationNotes}</p>
            </div>
          `
              : ""
          }
        </div>

        <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="color: #721c24; margin-top: 0;">⚠️ Response Deadline</h3>
          <p style="margin: 0; font-size: 18px; font-weight: bold;">
            ${
              daysUntilDeadline > 0
                ? `You have ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? "s" : ""} to respond`
                : "⚠️ Deadline has passed - Please respond immediately"
            }
          </p>
          <p style="margin: 10px 0 0 0; color: #721c24;">
            Response due by: <strong>${deadlineFormatted}</strong>
          </p>
        </div>

        <p>Please log in to your Peace Seal dashboard to view the full review details and submit your response:</p>
        <p>
          <a href="${dashboardLink}"
             style="
               background-color: #548281;
               color: white;
               padding: 12px 24px;
               text-decoration: none;
               border-radius: 6px;
               display: inline-block;
               font-weight: bold;
             ">
            Respond to Review
          </a>
        </p>

        <p>Your response will be reviewed by our advisors and may be shared publicly if appropriate. Please provide a detailed response addressing the concerns raised in the review.</p>

        <p>If you have any questions or need assistance, please contact our support team.</p>

        <br>
        <p>Best regards,<br>The Pledge4Peace Team</p>
        <p><small>This is an automated notification. Please respond promptly to maintain your Peace Seal certification status.</small></p>
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
        "Brevo sendCompanyIssueNotificationEmail error:",
        response.status,
        text
      );
      throw new Error("Failed to send company issue notification email");
    }

    return await response.json();
  }

  /**
   * Sends beneficial ownership agreement email to owners/CEOs/board directors
   * when the agreement is signed on their behalf
   */
  async sendBeneficialOwnershipAgreementEmail(
    to: string,
    ownerName: string,
    representativeName: string,
    signedDate: Date,
    agreementBody: string
  ) {
    // Validate required fields
    if (!this.fromEmail || !this.apiKey) {
      throw new Error(
        "EmailService not properly configured. Missing fromEmail or apiKey."
      );
    }

    const formattedDate = signedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Convert markdown to HTML
    const agreementHtml = markdownToHtml(agreementBody);

    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: to,
          name: ownerName,
        },
      ],
      subject:
        "Anti-Corruption: Company Beneficial Ownership Policy - Signed on Your Behalf",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2F4858; margin-bottom: 20px;">Agreement Signed on Your Behalf</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
            Hi ${ownerName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
            You have successfully signed our Anti-Corruption: Company Beneficial Ownership Policy on Pledge4Peace.org. This was signed by your representative <strong>${representativeName}</strong> on <strong>${formattedDate}</strong>.
          </p>

          <div style="border: 2px solid #548281; border-radius: 8px; padding: 30px; margin: 30px 0; background-color: #fafafa;">
            <div style="color: #333; line-height: 1.8;">
              ${agreementHtml}
            </div>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 30px;">
            This is a copy of the agreement that was signed on your behalf. Please keep this for your records.
          </p>

          <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 20px;">
            If you have any questions about this agreement, please contact us at <a href="mailto:info@pledge4peace.org" style="color: #548281;">info@pledge4peace.org</a>.
          </p>

          <br>
          <p style="font-size: 14px; color: #666;">
            Best regards,<br>
            The Pledge4Peace Team
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
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
        "Brevo sendBeneficialOwnershipAgreementEmail error:",
        response.status,
        text
      );
      throw new Error("Failed to send beneficial ownership agreement email");
    }

    return await response.json();
  }

  /**
   * Sends employee survey invitation email
   */
  async sendEmployeeSurveyInvitationEmail(
    to: string,
    employeeName: string,
    companyName: string,
    companyId: string,
    baseUrl: string
  ) {
    const surveyLink = `${baseUrl}/peace-seal/community-review?companyId=${companyId}&companyName=${encodeURIComponent(companyName)}&role=employee`;

    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: to,
          name: employeeName,
        },
      ],
      subject: `${companyName} has requested your feedback – Employee Satisfaction Survey`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2F4858; margin-bottom: 20px;">Employee Satisfaction Survey</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
            Hello ${employeeName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
            <strong>${companyName}</strong> has requested your feedback as part of their Peace Seal certification process. Your honest, anonymous feedback is valuable in helping assess workplace satisfaction, fairness, and culture.
          </p>

          <div style="background-color: #f0f9f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #548281;">
            <h3 style="color: #2F4858; margin-top: 0;">What is this survey?</h3>
            <p style="margin: 0; color: #333;">
              This anonymous employee satisfaction survey helps measure your workplace experience, including satisfaction, fairness, and culture. Your responses will contribute to ${companyName}'s Peace Seal profile rating.
            </p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
            Your responses will remain anonymous and confidential. The survey takes approximately 5-10 minutes to complete.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${surveyLink}"
               style="
                 background-color: #548281;
                 color: white;
                 padding: 15px 30px;
                 text-decoration: none;
                 border-radius: 6px;
                 display: inline-block;
                 font-weight: bold;
                 font-size: 16px;
               ">
              Complete the Survey
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 30px;">
            If you have any questions about this survey, please contact your HR department or reach out to us at <a href="mailto:info@pledge4peace.org" style="color: #548281;">info@pledge4peace.org</a>.
          </p>

          <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 20px;">
            Thank you for taking the time to share your feedback. Your input helps promote ethical business practices and workplace transparency.
          </p>

          <br>
          <p style="font-size: 14px; color: #666;">
            Best regards,<br>
            The Pledge4Peace Team
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
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
        "Brevo sendEmployeeSurveyInvitationEmail error:",
        response.status,
        text
      );
      throw new Error("Failed to send employee survey invitation email");
    }

    return await response.json();
  }
}
