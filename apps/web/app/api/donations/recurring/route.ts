import { NextRequest, NextResponse } from "next/server";
import gateway from "@/lib/braintree";

export async function POST(req: NextRequest) {
  try {
    const { nonce, amount, donorInfo, planId: bodyPlanId } = await req.json();

    if (!nonce || !amount) {
      return NextResponse.json(
        { error: "nonce and amount are required" },
        { status: 400 }
      );
    }

    // Validate amount for recurring donations
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 5 || numAmount > 250) {
      return NextResponse.json(
        { error: "Monthly donation amount must be between $5 and $250" },
        { status: 400 }
      );
    }

    // First, create a customer
    const customerResult = await gateway.customer.create({
      firstName: donorInfo?.firstName,
      lastName: donorInfo?.lastName,
      email: donorInfo?.email,
      paymentMethodNonce: nonce,
      customFields: { payment_type: "donation" },
    });

    if (!customerResult.success) {
      return NextResponse.json(
        { success: false, message: customerResult.message },
        { status: 400 }
      );
    }

    const customer = customerResult.customer;

    if (!customer.paymentMethods || customer.paymentMethods.length === 0) {
      return NextResponse.json(
        { success: false, message: "No payment method found for customer" },
        { status: 400 }
      );
    }

    const paymentMethod = customer.paymentMethods[0];

    // Determine planId: priority -> request body -> env variable -> default string
    const planId =
      bodyPlanId || process.env.BT_MONTHLY_PLAN_ID || "monthly_donation_plan";

    // Check if plan exists to avoid invalid plan error
    const plansResponse = await gateway.plan.all();
    const planList = plansResponse.plans || [];
    const planExists = planList.some((p: any) => p.id === planId);

    if (!planExists) {
      return NextResponse.json(
        {
          success: false,
          message: `Plan ID '${planId}' is invalid. Create the plan in Braintree Control Panel or set BT_MONTHLY_PLAN_ID to a valid plan.`,
        },
        { status: 400 }
      );
    }

    // Create subscription
    const subscriptionResult = await gateway.subscription.create({
      paymentMethodToken: paymentMethod.token,
      planId,
      price: amount,
    });

    if (subscriptionResult.success) {
      return NextResponse.json({
        success: true,
        subscription: {
          id: subscriptionResult.subscription.id,
          amount: subscriptionResult.subscription.price,
          status: subscriptionResult.subscription.status,
          nextBillingDate: subscriptionResult.subscription.nextBillingDate,
          type: "recurring-donation",
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: subscriptionResult.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing recurring donation:", error);
    return NextResponse.json(
      { error: "Failed to process recurring donation" },
      { status: 500 }
    );
  }
}
