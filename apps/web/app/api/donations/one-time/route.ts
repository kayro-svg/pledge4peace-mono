import { NextRequest, NextResponse } from "next/server";
import gateway from "@/lib/braintree";

export async function POST(req: NextRequest) {
  try {
    const {
      nonce,
      amount,
      donorInfo,
      paymentMethod = "card_or_paypal",
    } = await req.json();

    if (!nonce || !amount) {
      return NextResponse.json(
        { error: "nonce and amount are required" },
        { status: 400 }
      );
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      return NextResponse.json(
        { error: "Amount must be at least $1" },
        { status: 400 }
      );
    }

    if (paymentMethod === "ach") {
      // 1) Create a customer (required for vault)
      const customerResult = await gateway.customer.create({
        firstName: donorInfo?.firstName ?? "ACH",
        lastName: donorInfo?.lastName ?? "Donor",
        email: donorInfo?.email ?? undefined,
      });

      if (!customerResult.success) {
        return NextResponse.json(
          { error: customerResult.message || "Failed to create customer" },
          { status: 400 }
        );
      }

      // 2) Vault + verify via Network Check
      const pmResult = await gateway.paymentMethod.create({
        customerId: customerResult.customer.id,
        paymentMethodNonce: nonce,
        options: {
          usBankAccountVerificationMethod: "network_check",
        },
      } as any);

      if (!pmResult.success) {
        return NextResponse.json(
          { error: pmResult.message || "Failed to vault bank account" },
          { status: 400 }
        );
      }

      const paymentMethodToken = (pmResult.paymentMethod as any).token;

      // 3) Sale
      const result = await gateway.transaction.sale({
        amount: amount,
        paymentMethodToken,
        options: { submitForSettlement: true },
      });

      if (result.success) {
        return NextResponse.json({
          success: true,
          transaction: {
            id: result.transaction.id,
            amount: result.transaction.amount,
            status: result.transaction.status,
            type: "one-time-donation",
          },
        });
      } else {
        return NextResponse.json(
          { success: false, message: result.message },
          { status: 400 }
        );
      }
    }

    // Default flow for cards/PayPal (use nonce directly)
    const result = await gateway.transaction.sale({
      amount: amount,
      paymentMethodNonce: nonce,
      options: { submitForSettlement: true },
      ...(donorInfo && {
        customer: {
          firstName: donorInfo.firstName,
          lastName: donorInfo.lastName,
          email: donorInfo.email,
        },
      }),
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        transaction: {
          id: result.transaction.id,
          amount: result.transaction.amount,
          status: result.transaction.status,
          type: "one-time-donation",
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing one-time donation:", error);
    return NextResponse.json(
      { error: "Failed to process donation" },
      { status: 500 }
    );
  }
}
