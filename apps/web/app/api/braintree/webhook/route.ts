import { NextRequest, NextResponse } from "next/server";
import gateway from "@/lib/braintree";
import { logger } from "@/lib/utils/logger";

const Kind = {
  TransactionSettled: "transaction_settled",
  TransactionSettlementDeclined: "transaction_settlement_declined",
  TransactionDisbursed: "transaction_disbursed",
  SubscriptionChargedSuccessfully: "subscription_charged_successfully",
  SubscriptionChargedUnsuccessfully: "subscription_charged_unsuccessfully",
  SubscriptionCanceled: "subscription_canceled",
  PaymentMethodRevokedByCustomer: "payment_method_revoked_by_customer",
} as const;

// Adjust these emails as needed
const ADMIN_EMAILS = [
  //   "info@pledge4peace.org",
  "kayrov@weversity.org",
  // Agrega más correos si fuese necesario
];

/**
 * Helper para enviar correos a través de Brevo (Sendinblue)
 */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL || "no-reply@pledge4peace.org";
  const fromName = process.env.BREVO_FROM_NAME || "Pledge4Peace";

  if (!apiKey) {
    logger.error("[Webhook] Missing BREVO_API_KEY env var – e-mail not sent");
    return;
  }

  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { email: fromEmail, name: fromName },
        to: to.map((email) => ({ email })),
        subject,
        htmlContent: html,
      }),
    });
  } catch (err) {
    logger.error("[Webhook] Error sending email via Brevo", err);
  }
}

/**
 * Helper to identify Peace Seal payments
 */
function isPeaceSealPayment(notification: unknown): boolean {
  const notif = notification as Record<string, any>;
  const customFields =
    notif.transaction?.customFields ||
    notif.subscription?.transactions?.[0]?.customFields;
  return customFields?.payment_type?.includes("peace_seal") || false;
}

/**
 * Helper to get company info from Peace Seal payments
 */
function getPeaceSealCompanyInfo(notification: unknown) {
  const notif = notification as Record<string, any>;
  const customFields =
    notif.transaction?.customFields ||
    notif.subscription?.transactions?.[0]?.customFields;
  return {
    companyId: customFields?.company_id,
    companyName: customFields?.company_name,
    paymentType: customFields?.payment_type,
  };
}

/**
 * Process Peace Seal payment confirmation with backend
 */
async function processPeaceSealPayment(notification: unknown) {
  try {
    const { companyId, companyName } = getPeaceSealCompanyInfo(notification);

    if (!companyId) {
      logger.error(
        "Peace Seal payment webhook missing company_id:",
        notification
      );
      return;
    }

    const notif = notification as Record<string, any>;
    const transaction =
      notif.transaction || notif.subscription?.transactions?.[0];
    if (!transaction) {
      logger.error(
        "Peace Seal payment webhook missing transaction:",
        notification
      );
      return;
    }

    // Call backend to confirm payment and assign advisor
    const backendApiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api";
    const backendResponse = await fetch(
      `${backendApiUrl}/peace-seal/webhooks/applications/${companyId}/confirm-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WEBHOOK_AUTH_TOKEN || ""}`, // Use service token for webhook calls
        },
        body: JSON.stringify({
          transactionId: transaction.id,
          amountCents: Math.round(parseFloat(transaction.amount) * 100),
          subscriptionId: notif.subscription?.id,
        }),
      }
    );

    if (backendResponse.ok) {
      logger.log("Peace Seal payment confirmed with backend:", {
        companyId,
        transactionId: transaction.id,
        companyName,
        status: backendResponse.status,
      });
    } else {
      const error = await backendResponse.text();
      logger.error("Failed to confirm Peace Seal payment with backend:", {
        error,
        status: backendResponse.status,
        companyId,
        transactionId: transaction.id,
      });
    }
  } catch (error) {
    logger.error("Error processing Peace Seal payment webhook:", error);
  }
}

/**
 * Mapea kinds de webhook → mensajes personalizados.
 * Devuelve el correo del donante si está disponible en el objeto notificación.
 */
function buildNotificationMessages(notification: unknown) {
  const notif = notification as Record<string, any>;
  let donorEmail: string | undefined;
  let donorSubject = "";
  let donorHtml = "";

  let adminSubject = `Braintree webhook: ${notif.kind}`;
  const adminHtml = `<pre>${JSON.stringify(notification, null, 2)}</pre>`;

  // Check if this is a Peace Seal payment
  const isPeaceSeal = isPeaceSealPayment(notification);
  if (isPeaceSeal) {
    const { companyName } = getPeaceSealCompanyInfo(notification);
    adminSubject = `Peace Seal Payment: ${notif.kind} - ${companyName}`;
  }

  switch (notif.kind) {
    case Kind.TransactionSettled:
      donorEmail =
        notif.transaction?.customer?.email ??
        notif.transaction?.customerDetails?.email;
      donorSubject = "¡Tu donación se ha liquidado con éxito!";
      donorHtml = `<p>Queremos confirmarte que tu donación de <strong>$${notif.transaction?.amount}</strong> se ha liquidado correctamente.</p><p>¡Gracias por apoyar nuestra misión por la paz!</p>`;
      break;
    case Kind.TransactionSettlementDeclined:
      donorEmail =
        notif.transaction?.customer?.email ??
        notif.transaction?.customerDetails?.email;
      donorSubject = "Hubo un problema al liquidar tu donación";
      donorHtml = `<p>Intentamos liquidar tu donación de <strong>$${notif.transaction?.amount}</strong> pero fue rechazada durante el proceso de liquidación.</p><p>Por favor, contacta a tu banco o intenta nuevamente con otro método de pago.</p>`;
      break;
    case Kind.TransactionDisbursed:
      donorEmail =
        notif.transaction?.customer?.email ??
        notif.transaction?.customerDetails?.email;
      donorSubject = "Tu donación se ha procesado completamente";
      donorHtml = `<p>Tu donación de <strong>$${notif.transaction?.amount}</strong> ya fue desembolsada a nuestra cuenta bancaria. ¡Gracias de nuevo!</p>`;
      break;
    case Kind.SubscriptionChargedSuccessfully:
      donorEmail =
        notif.subscription?.transactions?.[0]?.customer?.email ??
        notif.subscription?.transactions?.[0]?.customerDetails?.email;
      donorSubject = "¡Gracias! Se procesó tu donación mensual";
      donorHtml = `<p>Cobramos con éxito tu donación mensual de <strong>$${notif.subscription?.price}</strong>.</p><p>Tu apoyo constante es invaluable.</p>`;
      break;
    case Kind.SubscriptionChargedUnsuccessfully:
      donorEmail =
        notif.subscription?.transactions?.[0]?.customer?.email ??
        notif.subscription?.transactions?.[0]?.customerDetails?.email;
      donorSubject = "No pudimos procesar tu donación mensual";
      donorHtml = `<p>Intentamos cobrar tu donación mensual de <strong>$${notif.subscription?.price}</strong>, pero falló.</p><p>Por favor, actualiza tu método de pago para que podamos seguir contando con tu apoyo.</p>`;
      break;
    case Kind.SubscriptionCanceled:
      donorEmail = undefined; // no need to mail donor (probablemente ya lo sabe)
      break;
    case Kind.PaymentMethodRevokedByCustomer:
      donorEmail = notif.revokedPaymentMethodMetadata?.email;
      donorSubject = "Tu método de pago fue eliminado";
      donorHtml = `<p>Confirmamos que eliminaste tu método de pago de tu cuenta. Si esto fue un error o quieres seguir apoyándonos, añade un nuevo método en tu próximo ingreso.</p>`;
      break;
    // Otros casos se manejan de forma genérica
    default:
      donorEmail = undefined;
  }

  return {
    donorEmail,
    donorSubject,
    donorHtml,
    adminSubject,
    adminHtml,
  };
}

export async function GET(req: NextRequest) {
  // Endpoint de verificación inicial (challenge)
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("bt_challenge");

  if (!challenge) {
    return NextResponse.json(
      { error: "Missing bt_challenge param" },
      { status: 400 }
    );
  }

  // @ts-expect-error - el SDK no define los tipos de verify con promesa pero funciona
  const verification = await gateway.webhookNotification.verify(challenge);
  return new NextResponse(verification, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Braintree envía x-www-form-urlencoded con bt_signature y bt_payload
    const raw = await req.text();
    const params = new URLSearchParams(raw);
    const btSignature = params.get("bt_signature");
    const btPayload = params.get("bt_payload");

    if (!btSignature || !btPayload) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const notification = await gateway.webhookNotification.parse(
      btSignature,
      btPayload
    );

    logger.log("notification 🔥 brought to you by braintree: ", notification);

    // Check if this is a Peace Seal payment and process accordingly
    if (isPeaceSealPayment(notification)) {
      // Process Peace Seal payment confirmation with backend
      await processPeaceSealPayment(notification);
    }

    // Construir mensajes
    const { donorEmail, donorSubject, donorHtml, adminSubject, adminHtml } =
      buildNotificationMessages(notification);

    // Enviar correo a admin siempre
    await sendEmail({
      to: ADMIN_EMAILS,
      subject: adminSubject,
      html: adminHtml,
    });

    // Enviar al donante si tenemos correo y mensaje
    if (donorEmail && donorSubject) {
      await sendEmail({
        to: [donorEmail],
        subject: donorSubject,
        html: donorHtml,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    logger.error("[Webhook] Error processing notification", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
