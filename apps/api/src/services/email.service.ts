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
}
