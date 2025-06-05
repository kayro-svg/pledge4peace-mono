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

    console.log("🔗 [DEV] Verification link:", verificationLink);

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
      console.error(
        "Brevo sendVerificationEmail error:",
        response.status,
        text
      );
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
      console.error(
        "Brevo sendPasswordResetEmail error:",
        response.status,
        text
      );
      throw new Error("Failed to send password reset email");
    }

    return await response.json();
  }
}

// // apps/api/src/services/email.service.ts
// import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

// export class EmailService {
//   private apiInstance: TransactionalEmailsApi;

//   constructor(
//     apiKey: string,
//     private fromEmail: string,
//     private fromName: string = "Pledge4Peace"
//   ) {
//     const apiInstance = new TransactionalEmailsApi();
//     // La nueva biblioteca usa 'api-key' en lugar de 'apiKey'
//     apiInstance.setApiKey("api-key", apiKey);
//     this.apiInstance = apiInstance;
//   }

//   async sendVerificationEmail(to: string, token: string, baseUrl: string) {
//     const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;

//     try {
//       const sendSmtpEmail = new SendSmtpEmail();

//       // Configuración del email
//       sendSmtpEmail.to = [{ email: to, name: to.split("@")[0] }];
//       sendSmtpEmail.sender = { name: this.fromName, email: this.fromEmail };
//       sendSmtpEmail.subject = "Verify your email - Pledge4Peace";
//       sendSmtpEmail.htmlContent = `
//         <h1>Welcome to Pledge4Peace!</h1>
//         <p>Please verify your email address by clicking the link below:</p>
//         <p><a href="${verificationLink}"
//               style="background-color: #548281;
//                      color: white;
//                      padding: 10px 20px;
//                      text-decoration: none;
//                      border-radius: 5px;">
//            Verify Email
//            </a>
//         </p>
//         <p>This link will expire in 24 hours.</p>
//         <p>If you didn't create an account with us, please ignore this email.</p>
//       `;

//       console.log("Sending verification email to:", to);
//       const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
//       console.log("Email sent successfully:", result);

//       return result;
//     } catch (error) {
//       console.error("Error sending verification email:", error);
//       throw new Error("Failed to send verification email");
//     }
//   }

//   async sendPasswordResetEmail(to: string, token: string, baseUrl: string) {
//     const resetLink = `${baseUrl}/reset-password?token=${token}`;

//     try {
//       const sendSmtpEmail = new SendSmtpEmail();

//       // Configuración del email
//       sendSmtpEmail.to = [{ email: to, name: to.split("@")[0] }];
//       sendSmtpEmail.sender = { name: this.fromName, email: this.fromEmail };
//       sendSmtpEmail.subject = "Reset your password - Pledge4Peace";
//       sendSmtpEmail.htmlContent = `
//         <h1>Password Reset Request</h1>
//         <p>You have requested to reset your password. Click the link below to proceed:</p>
//         <p><a href="${resetLink}"
//               style="background-color: #548281;
//                      color: white;
//                      padding: 10px 20px;
//                      text-decoration: none;
//                      border-radius: 5px;">
//            Reset Password
//            </a>
//         </p>
//         <p>This link will expire in 1 hour.</p>
//         <p>If you didn't request a password reset, please ignore this email.</p>
//       `;

//       console.log("Sending password reset email to:", to);
//       const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
//       console.log("Email sent successfully:", result);

//       return result;
//     } catch (error) {
//       console.error("Error sending password reset email:", error);
//       throw new Error("Failed to send password reset email");
//     }
//   }
// }

///// RESEND /////

// import { Resend } from "resend";

// export class EmailService {
//   private resend: Resend;
//   private fromEmail: string;

//   constructor(apiKey: string, fromEmail: string) {
//     this.resend = new Resend(apiKey);
//     this.fromEmail = fromEmail;
//   }

//   async sendVerificationEmail(to: string, token: string, baseUrl: string) {
//     const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;

//     try {
//       await this.resend.emails.send({
//         from: this.fromEmail,
//         to,
//         subject: "Verify your email - Pledge4Peace",
//         html: `
//           <h1>Welcome to Pledge4Peace!</h1>
//           <p>Please verify your email address by clicking the link below:</p>
//           <p><a href="${verificationLink}">Verify Email</a></p>
//           <p>This link will expire in 24 hours.</p>
//           <p>If you didn't create an account with us, please ignore this email.</p>
//         `,
//       });
//     } catch (error) {
//       console.error("Error sending verification email:", error);
//       throw new Error("Failed to send verification email");
//     }
//   }

//   async sendPasswordResetEmail(to: string, token: string, baseUrl: string) {
//     const resetLink = `${baseUrl}/reset-password?token=${token}`;

//     try {
//       await this.resend.emails.send({
//         from: this.fromEmail,
//         to,
//         subject: "Reset your password - Pledge4Peace",
//         html: `
//           <h1>Password Reset Request</h1>
//           <p>You have requested to reset your password. Click the link below to proceed:</p>
//           <p><a href="${resetLink}">Reset Password</a></p>
//           <p>This link will expire in 1 hour.</p>
//           <p>If you didn't request a password reset, please ignore this email and ensure your account is secure.</p>
//         `,
//       });
//     } catch (error) {
//       console.error("Error sending password reset email:", error);
//       throw new Error("Failed to send password reset email");
//     }
//   }
// }

////////

// import * as SibApiV3Sdk from "@sendinblue/client";

// export class EmailService {
//   private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

//   constructor(
//     apiKey: string,
//     private fromEmail: string,
//     private fromName: string = "Pledge4Peace"
//   ) {
//     const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
//     apiInstance.setApiKey(
//       SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
//       apiKey
//     );
//     this.apiInstance = apiInstance;
//   }

//   async sendVerificationEmail(to: string, token: string, baseUrl: string) {
//     const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;

//     try {
//       const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
//       sendSmtpEmail.subject = "Verify your email - Pledge4Peace";
//       sendSmtpEmail.htmlContent = `
//         <h1>Welcome to Pledge4Peace!</h1>
//         <p>Please verify your email address by clicking the link below:</p>
//         <p><a href="${verificationLink}">Verify Email</a></p>
//         <p>This link will expire in 24 hours.</p>
//         <p>If you didn't create an account with us, please ignore this email.</p>
//       `;
//       sendSmtpEmail.sender = { name: this.fromName, email: this.fromEmail };
//       sendSmtpEmail.to = [{ email: to }];

//       await this.apiInstance.sendTransacEmail(sendSmtpEmail);
//     } catch (error) {
//       console.error("Error sending verification email:", error);
//       throw new Error("Failed to send verification email");
//     }
//   }

//   async sendPasswordResetEmail(to: string, token: string, baseUrl: string) {
//     const resetLink = `${baseUrl}/reset-password?token=${token}`;

//     try {
//       const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
//       sendSmtpEmail.subject = "Reset your password - Pledge4Peace";
//       sendSmtpEmail.htmlContent = `
//         <h1>Password Reset Request</h1>
//         <p>You have requested to reset your password. Click the link below to proceed:</p>
//         <p><a href="${resetLink}">Reset Password</a></p>
//         <p>This link will expire in 1 hour.</p>
//         <p>If you didn't request a password reset, please ignore this email and ensure your account is secure.</p>
//       `;
//       sendSmtpEmail.sender = { name: this.fromName, email: this.fromEmail };
//       sendSmtpEmail.to = [{ email: to }];

//       await this.apiInstance.sendTransacEmail(sendSmtpEmail);
//     } catch (error) {
//       console.error("Error sending password reset email:", error);
//       throw new Error("Failed to send password reset email");
//     }
//   }
// }
