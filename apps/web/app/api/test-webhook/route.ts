import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest) {
  try {
    const { companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    const backendApiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api";
    const webhookToken = process.env.WEBHOOK_AUTH_TOKEN;

    logger.log("Testing webhook connectivity:", {
      backendApiUrl,
      companyId,
      hasWebhookToken: !!webhookToken,
      tokenLength: webhookToken?.length || 0,
    });

    // Test the webhook endpoint
    const response = await fetch(
      `${backendApiUrl}/peace-seal/webhooks/applications/${companyId}/confirm-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${webhookToken || ""}`,
        },
        body: JSON.stringify({
          transactionId: "test-transaction-123",
          amountCents: 39900, // $399
        }),
      }
    );

    const responseText = await response.text();

    logger.log("Webhook test response:", {
      status: response.status,
      statusText: response.statusText,
      response: responseText,
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseText,
      config: {
        backendApiUrl,
        hasWebhookToken: !!webhookToken,
        tokenLength: webhookToken?.length || 0,
      },
    });
  } catch (error) {
    logger.error("Error testing webhook:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}
