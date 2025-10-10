import { NextRequest, NextResponse } from "next/server";
import gateway from "@/lib/braintree";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest) {
  try {
    const {
      nonce,
      amount,
      companyName,
      companyId,
      createSubscription = false,
    } = await req.json();

    if (!nonce || !amount || !companyId) {
      return NextResponse.json(
        { error: "nonce, amount, and companyId are required" },
        { status: 400 }
      );
    }

    // Validate amount for Peace Seal certification
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 99 || numAmount > 499) {
      return NextResponse.json(
        { error: "Peace Seal certification fee must be $99 or $499" },
        { status: 400 }
      );
    }

    // If creating subscription for annual renewals
    if (createSubscription) {
      return await handleSubscriptionPayment(
        nonce,
        numAmount,
        companyName,
        companyId
      );
    }

    // Handle one-time payment for initial certification
    const transactionResult = await gateway.transaction.sale({
      amount: amount.toString(),
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
      customFields: {
        // Use custom fields to identify Peace Seal payments in webhooks
        payment_type: "peace_seal_certification",
        company_id: companyId,
        company_name: companyName || "",
      },
      // Add merchant descriptor for clear billing
      descriptor: {
        name: "PLEDGE4PEACE*SEAL",
        phone: "1234567890", // Replace with your phone
        url: "pledge4peace.org",
      },
    });

    if (transactionResult.success) {
      logger.log("Peace Seal payment successful:", {
        transactionId: transactionResult.transaction.id,
        companyId,
        amount: numAmount,
      });

      // Immediately confirm payment with backend as primary method
      // (webhook will serve as backup confirmation)
      try {
        const backendApiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api";
        const webhookToken = process.env.WEBHOOK_AUTH_TOKEN;

        logger.log("Attempting to confirm payment with backend:", {
          backendApiUrl,
          companyId,
          hasWebhookToken: !!webhookToken,
          transactionId: transactionResult.transaction.id,
        });

        const confirmResponse = await fetch(
          `${backendApiUrl}/peace-seal/webhooks/applications/${companyId}/confirm-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${webhookToken || ""}`,
            },
            body: JSON.stringify({
              transactionId: transactionResult.transaction.id,
              amountCents: Math.round(numAmount * 100),
            }),
          }
        );

        if (confirmResponse.ok) {
          logger.log("Peace Seal payment confirmed with backend immediately:", {
            transactionId: transactionResult.transaction.id,
            companyId,
          });
        } else {
          const errorText = await confirmResponse.text();
          logger.error("Failed to confirm payment with backend immediately:", {
            error: errorText,
            status: confirmResponse.status,
          });
          // Don't fail the payment - webhook will retry
        }
      } catch (error) {
        logger.error(
          "Error confirming payment with backend immediately:",
          error
        );
        // Don't fail the payment - webhook will retry
      }

      return NextResponse.json({
        success: true,
        transactionId: transactionResult.transaction.id,
        amount: parseFloat(transactionResult.transaction.amount),
        status: transactionResult.transaction.status,
        type: "peace_seal_certification",
      });
    } else {
      logger.error("Peace Seal payment failed:", transactionResult);
      return NextResponse.json(
        { success: false, message: transactionResult.message },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error("Error processing Peace Seal payment:", error);
    return NextResponse.json(
      { error: "Failed to process Peace Seal payment" },
      { status: 500 }
    );
  }
}

// Handle annual subscription for automatic renewals
async function handleSubscriptionPayment(
  nonce: string,
  amount: number,
  companyName: string,
  companyId: string
) {
  try {
    // First, create a customer with the payment method
    // const customerResult = await gateway.customer.create({
    //   firstName: companyName?.split(" ")[0] || "Company",
    //   lastName: companyName?.split(" ").slice(1).join(" ") || "Admin",
    //   company: companyName,
    //   paymentMethodNonce: nonce,
    //   customFields: {
    //     company_id: companyId,
    //     payment_type: "peace_seal_annual",
    //   },
    // });

    const customerResult = await gateway.customer.create({
      firstName: companyName?.split(" ")[0] || "Company",
      lastName: companyName?.split(" ").slice(1).join(" ") || "Admin",
      company: companyName,
      paymentMethodNonce: nonce,
      // creditCard: {
      //   options: { verifyCard: true, makeDefault: true },
      // },
      customFields: {
        company_id: companyId,
        payment_type: "peace_seal_annual",
      },
    });

    if (!customerResult.success) {
      return NextResponse.json(
        { success: false, message: customerResult.message },
        { status: 400 }
      );
    }

    const customer = customerResult.customer;
    const paymentMethod = customer.paymentMethods?.[0];

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: "No payment method found for customer" },
        { status: 400 }
      );
    }

    // Determine plan ID based on amount
    const planId =
      amount === 99
        ? process.env.BT_PEACE_SEAL_SMALL_PLAN_ID || "peace_seal_small_annual"
        : process.env.BT_PEACE_SEAL_MEDIUM_PLAN_ID ||
          "peace_seal_medium_annual";

    // Check if plan exists
    const plansResponse = await gateway.plan.all();
    const planList = plansResponse.plans || [];
    const planExists = planList.some((p: any) => p.id === planId);

    if (!planExists) {
      logger.error(`Peace Seal plan '${planId}' does not exist`);
      // Fallback to one-time payment
      logger.log("Creating one-time payment instead of subscription");

      const salePayload = paymentMethod?.token
        ? { paymentMethodToken: paymentMethod.token }
        : { paymentMethodNonce: nonce };

      // const transactionResult = await gateway.transaction.sale({
      //   amount: amount.toString(),
      //   paymentMethodToken: paymentMethod.token || "",
      //   options: {
      //     submitForSettlement: true,
      //   },
      //   customFields: {
      //     payment_type: "peace_seal_certification",
      //     company_id: companyId,
      //     company_name: companyName || "",
      //   },
      // });

      const transactionResult = await gateway.transaction.sale({
        amount: amount.toString(),
        ...salePayload,
        options: { submitForSettlement: true },
        customFields: {
          payment_type: "peace_seal_certification",
          company_id: companyId,
          company_name: companyName || "",
        },
      });

      if (transactionResult.success) {
        // Confirm payment with backend immediately
        try {
          const backendApiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api";
          const confirmResponse = await fetch(
            `${backendApiUrl}/peace-seal/webhooks/applications/${companyId}/confirm-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.WEBHOOK_AUTH_TOKEN || ""}`,
              },
              body: JSON.stringify({
                transactionId: transactionResult.transaction.id,
                amountCents: Math.round(amount * 100),
              }),
            }
          );

          if (confirmResponse.ok) {
            logger.log(
              "Peace Seal subscription payment confirmed with backend:",
              {
                transactionId: transactionResult.transaction.id,
                companyId,
              }
            );
          } else {
            logger.error("Failed to confirm subscription payment with backend");
          }
        } catch (error) {
          logger.error(
            "Error confirming subscription payment with backend:",
            error
          );
        }

        return NextResponse.json({
          success: true,
          transactionId: transactionResult.transaction.id,
          amount: parseFloat(transactionResult.transaction.amount),
          status: transactionResult.transaction.status,
          type: "peace_seal_certification",
          note: "Processed as one-time payment (subscription plan not found)",
        });
      }

      return NextResponse.json(
        { success: false, message: transactionResult.message },
        { status: 400 }
      );
    }

    if (!paymentMethod?.token) {
      return NextResponse.json(
        { success: false, message: "No payment method found for customer" },
        { status: 400 }
      );
    }

    // Create annual subscription
    const subscriptionResult = await gateway.subscription.create({
      paymentMethodToken: paymentMethod.token || "",
      planId,
      price: amount.toString(),
      id: `peace_seal_${companyId}_${Date.now()}`, // Unique subscription ID
    });

    if (subscriptionResult.success) {
      const subscription = subscriptionResult.subscription;

      // Get the first transaction (initial payment)
      const initialTransaction = subscription.transactions?.[0];

      logger.log("Peace Seal subscription created:", {
        subscriptionId: subscription.id,
        companyId,
        amount,
        initialTransactionId: initialTransaction?.id,
      });

      // Confirm payment with backend immediately
      if (initialTransaction?.id) {
        try {
          const backendApiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api";
          const confirmResponse = await fetch(
            `${backendApiUrl}/peace-seal/webhooks/applications/${companyId}/confirm-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.WEBHOOK_AUTH_TOKEN || ""}`,
              },
              body: JSON.stringify({
                transactionId: initialTransaction.id,
                amountCents: Math.round(amount * 100),
                subscriptionId: subscription.id,
              }),
            }
          );

          if (confirmResponse.ok) {
            logger.log(
              "Peace Seal subscription payment confirmed with backend:",
              {
                subscriptionId: subscription.id,
                transactionId: initialTransaction.id,
                companyId,
              }
            );
          } else {
            const errorText = await confirmResponse.text();
            logger.error(
              "Failed to confirm subscription payment with backend:",
              {
                error: errorText,
                status: confirmResponse.status,
              }
            );
          }
        } catch (error) {
          logger.error(
            "Error confirming subscription payment with backend:",
            error
          );
        }
      }

      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
        transactionId: initialTransaction?.id,
        amount: parseFloat(subscription.price || "0"),
        status: subscription.status,
        nextBillingDate: subscription.nextBillingDate,
        type: "peace_seal_annual_subscription",
      });
    } else {
      return NextResponse.json(
        { success: false, message: subscriptionResult.message },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error("Error processing Peace Seal subscription:", error);
    return NextResponse.json(
      { error: "Failed to process Peace Seal subscription" },
      { status: 500 }
    );
  }
}
