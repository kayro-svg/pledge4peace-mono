import { NextRequest, NextResponse } from "next/server";
import gateway from "@/lib/braintree";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest) {
  try {
    const {
      nonce,
      amount, // Keep for backward compatibility, but will derive from tier
      companyName,
      companyId,
      createSubscription = false,
      isQuotePayment = false,
      couponCode,
      tier, // New: "small" | "medium" | null (for quotes)
    } = await req.json();

    if (!nonce || !companyId) {
      return NextResponse.json(
        { error: "nonce and companyId are required" },
        { status: 400 }
      );
    }

    // Determine if this is a quote payment
    const isQuote = !!isQuotePayment;

    // For subscription payments, determine base amount from tier (hard-coded)
    // For quotes, use amount from request (backward compatibility)
    let baseAmount: number;
    if (createSubscription && !isQuote) {
      // Hard-code amounts based on tier (like donation route hard-codes validation)
      if (tier === "small") {
        baseAmount = 99;
      } else if (tier === "medium") {
        baseAmount = 499;
      } else {
        // Fallback: try to derive from amount for backward compatibility
        const numAmount = parseFloat(amount || "0");
        if (numAmount === 99) {
          baseAmount = 99;
        } else if (numAmount === 499) {
          baseAmount = 499;
        } else {
          return NextResponse.json(
            {
              error:
                "tier must be 'small' or 'medium' for subscription payments",
            },
            { status: 400 }
          );
        }
      }
    } else if (isQuote) {
      // For quote payments, use amount from request
      const numAmount = parseFloat(amount || "0");
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json(
          { error: "Invalid amount for quote payment" },
          { status: 400 }
        );
      }
      if (numAmount > 100000) {
        return NextResponse.json(
          { error: "Quote amount exceeds maximum allowed" },
          { status: 400 }
        );
      }
      baseAmount = numAmount;
    } else {
      // One-time payment (non-subscription)
      const numAmount = parseFloat(amount || "0");
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }
      if (numAmount !== 99 && numAmount !== 499) {
        return NextResponse.json(
          { error: "Peace Seal certification fee must be $99 or $499" },
          { status: 400 }
        );
      }
      baseAmount = numAmount;
    }

    // Normalize and validate coupon code
    const normalizedCoupon =
      typeof couponCode === "string"
        ? couponCode.trim().toUpperCase()
        : undefined;
    const isCyber30 = !isQuote && normalizedCoupon === "CYBER30";

    // If creating subscription for annual renewals
    if (createSubscription) {
      return await handleSubscriptionPayment(
        nonce,
        baseAmount,
        companyName,
        companyId,
        isQuote,
        isCyber30
          ? { couponCode: normalizedCoupon!, discountPercent: 30 }
          : undefined
      );
    }

    // Handle one-time payment for initial certification
    const transactionResult = await gateway.transaction.sale({
      amount: baseAmount.toString(),
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
        amount: baseAmount,
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
              amountCents: Math.round(baseAmount * 100),
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
// This function mirrors the pattern from /api/donations/recurring
// - Hard-coded base amounts: small=99, medium=499
// - Apply discount in code logic (30% for CYBER30)
// - Send effective amount to Braintree subscription.create (like donation route)
async function handleSubscriptionPayment(
  nonce: string,
  baseAmount: number, // Hard-coded: 99 for small, 499 for medium
  companyName: string,
  companyId: string,
  isQuote: boolean,
  promo?: { couponCode: string; discountPercent: number }
) {
  try {
    const customerResult = await gateway.customer.create({
      firstName: companyName?.split(" ")[0] || "Company",
      lastName: companyName?.split(" ").slice(1).join(" ") || "Admin",
      company: companyName,
      paymentMethodNonce: nonce,
      customFields: {
        company_id: companyId,
        payment_type: "peace_seal_annual",
      },
    });

    if (!customerResult.success) {
      const errorDetails = (customerResult as any).errors?.deepErrors?.() || [];
      logger.error("Failed to create customer:", {
        message: customerResult.message,
        errors: errorDetails,
        customerResult,
      });
      return NextResponse.json(
        {
          success: false,
          message: customerResult.message,
          errors: errorDetails.length > 0 ? errorDetails : undefined,
        },
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

    // Determine plan ID based on payment type (mirrors donation route pattern)
    let planId: string;
    if (isQuote) {
      // All quote payments (RFQ companies) use the large plan
      planId =
        process.env.BT_PEACE_SEAL_LARGE_PLAN_ID || "peace_seal_large_annual";
    } else {
      // Fixed-tier payments: small or medium based on hard-coded baseAmount
      // Small = 99, Medium = 499 (hard-coded in calling function)
      planId =
        baseAmount === 99
          ? process.env.BT_PEACE_SEAL_SMALL_PLAN_ID ||
            "peace_seal_small_annual_new"
          : process.env.BT_PEACE_SEAL_MEDIUM_PLAN_ID ||
            "peace_seal_medium_annual_new";
    }

    // Feature flag to enable/disable discount logic
    const discountsEnabled =
      process.env.NEXT_PUBLIC_BT_DISCOUNTS_ENABLED === "true";

    // Determine if discount should be applied (CYBER30 for small/medium only)
    const isCyber30 = !isQuote && promo && promo.couponCode === "CYBER30";
    const shouldApplyDiscount = discountsEnabled && isCyber30;

    // Calculate effective amount: apply 30% discount if CYBER30 is valid and enabled
    // This is done in code logic, not in Braintree (like donation route)
    let effectiveAmount = baseAmount;
    if (shouldApplyDiscount) {
      effectiveAmount = parseFloat((baseAmount * 0.7).toFixed(2));
    }
    logger.log("Peace Seal subscription plan selection:", {
      companyId,
      amount: baseAmount,
      isQuote,
      planId,
      discountsEnabled,
      shouldApplyDiscount,
      effectiveAmount,
      couponCode: promo?.couponCode,
    });

    // Check if plan exists
    let plansResponse;
    try {
      plansResponse = await gateway.plan.all();
    } catch (error: any) {
      logger.error("Failed to fetch plans:", {
        error: error.message,
        type: error.type,
        name: error.name,
        stack: error.stack,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Failed to validate subscription plan",
          error: error.message,
        },
        { status: 500 }
      );
    }

    const planList = plansResponse.plans || [];
    const planExists = planList.some((p: { id: string }) => p.id === planId);

    if (!planExists) {
      logger.error(`Peace Seal plan '${planId}' does not exist`, {
        availablePlans: planList.map((p: any) => p.id),
        requestedPlanId: planId,
      });
      // Fallback to one-time payment
      logger.log("Creating one-time payment instead of subscription");

      const salePayload = paymentMethod?.token
        ? { paymentMethodToken: paymentMethod.token }
        : { paymentMethodNonce: nonce };

      // Use effective amount (with discount if applicable) for one-time payment fallback
      const finalAmount = effectiveAmount.toFixed(2);

      const transactionResult = await gateway.transaction.sale({
        amount: finalAmount,
        ...salePayload,
        options: { submitForSettlement: true },
        customFields: {
          payment_type: "peace_seal_certification",
          company_id: companyId,
          company_name: companyName || "",
          coupon_code: shouldApplyDiscount ? promo.couponCode : undefined,
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
                amountCents: Math.round(effectiveAmount * 100),
                discountCode: shouldApplyDiscount
                  ? promo.couponCode
                  : undefined,
                discountPercent: shouldApplyDiscount
                  ? promo.discountPercent
                  : undefined,
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

      const errorDetails =
        (transactionResult as any).errors?.deepErrors?.() || [];
      logger.error("Failed to create one-time payment fallback:", {
        message: transactionResult.message,
        errors: errorDetails,
        transactionResult,
      });
      return NextResponse.json(
        {
          success: false,
          message: transactionResult.message,
          errors: errorDetails.length > 0 ? errorDetails : undefined,
        },
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
    // This matches the pattern from /api/donations/recurring exactly:
    // - Plans are $0.00 USD (like monthly_donation_plan)
    // - Send effective amount as price (user-selected amount with discount applied in code)
    // - Format as string (Braintree expects string for price)
    const subscriptionData = {
      paymentMethodToken: paymentMethod.token,
      planId,
      price: effectiveAmount.toString(), // Send effective amount (like donation route sends amount)
      customFields: {
        company_id: companyId,
        company_name: companyName || "",
        payment_type: isQuote ? "peace_seal_annual_quote" : "peace_seal_annual",
        coupon_code: shouldApplyDiscount ? promo?.couponCode : undefined,
      },
    };

    // Create subscription with effective price (plans are $0.00, so price is always required)
    let subscriptionResult;
    try {
      subscriptionResult = await gateway.subscription.create(subscriptionData);
    } catch (error: any) {
      logger.error("Braintree subscription.create threw exception:", {
        error: error.message,
        type: error.type,
        name: error.name,
        stack: error.stack,
        subscriptionData: {
          planId: subscriptionData.planId,
          price: subscriptionData.price,
          paymentMethodToken: subscriptionData.paymentMethodToken
            ? "present"
            : "missing",
          customFields: subscriptionData.customFields,
        },
      });
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create subscription",
          error: error.message,
          errorType: error.type || error.name,
        },
        { status: 500 }
      );
    }

    if (subscriptionResult.success) {
      const subscription = subscriptionResult.subscription;

      // Get the first transaction (initial payment)
      // In Braintree, the subscription response doesn't include transactions directly
      // We need to get the subscription details to find the initial transaction
      let initialTransactionId = null;

      try {
        const subscriptionDetails = await gateway.subscription.find(
          subscription.id
        );
        if (
          subscriptionDetails &&
          subscriptionDetails.transactions &&
          subscriptionDetails.transactions.length > 0
        ) {
          initialTransactionId = subscriptionDetails.transactions[0].id;
        }
      } catch (error) {
        logger.error("Error fetching subscription details:", error);
      }

      logger.log("Peace Seal subscription created:", {
        subscriptionId: subscription.id,
        companyId,
        baseAmount,
        effectiveAmount,
        shouldApplyDiscount,
        subscriptionPrice: subscription.price,
        initialTransactionId,
      });

      // Confirm payment with backend immediately
      // Try to confirm even if we don't have the transaction ID
      // Use effectiveAmount (which we calculated and sent to Braintree) for consistency
      try {
        const backendApiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api";

        // Use effectiveAmount (the price we sent to Braintree) for backend confirmation
        const confirmResponse = await fetch(
          `${backendApiUrl}/peace-seal/webhooks/applications/${companyId}/confirm-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.WEBHOOK_AUTH_TOKEN || ""}`,
            },
            body: JSON.stringify({
              transactionId: initialTransactionId || `sub_${subscription.id}`,
              amountCents: Math.round(effectiveAmount * 100),
              subscriptionId: subscription.id,
              discountCode: shouldApplyDiscount ? promo.couponCode : undefined,
              discountPercent: shouldApplyDiscount
                ? promo.discountPercent
                : undefined,
            }),
          }
        );

        if (confirmResponse.ok) {
          logger.log(
            "Peace Seal subscription payment confirmed with backend:",
            {
              subscriptionId: subscription.id,
              transactionId: initialTransactionId,
              companyId,
            }
          );
        } else {
          const errorText = await confirmResponse.text();
          logger.error("Failed to confirm subscription payment with backend:", {
            error: errorText,
            status: confirmResponse.status,
          });
        }
      } catch (error) {
        logger.error(
          "Error confirming subscription payment with backend:",
          error
        );
      }

      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
        transactionId: initialTransactionId,
        amount: effectiveAmount, // Return effective amount (with discount if applied)
        status: subscription.status,
        nextBillingDate: subscription.nextBillingDate,
        type: "peace_seal_annual_subscription",
      });
    } else {
      const errorDetails =
        (subscriptionResult as any).errors?.deepErrors?.() || [];
      logger.error("Failed to create subscription:", {
        message: subscriptionResult.message,
        errors: errorDetails,
        subscriptionResult,
        subscriptionData: {
          planId: subscriptionData.planId,
          price: subscriptionData.price,
          effectiveAmount,
          shouldApplyDiscount,
        },
      });
      return NextResponse.json(
        {
          success: false,
          message: subscriptionResult.message,
          errors: errorDetails.length > 0 ? errorDetails : undefined,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    logger.error("Error processing Peace Seal subscription:", {
      error: error.message,
      type: error.type,
      name: error.name,
      stack: error.stack,
      companyId,
      baseAmount,
      isQuote,
    });
    return NextResponse.json(
      {
        error: "Failed to process Peace Seal subscription",
        message: error.message,
        errorType: error.type || error.name,
      },
      { status: 500 }
    );
  }
}
