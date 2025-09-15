import { NextResponse } from "next/server";
import gateway from "@/lib/braintree";
import { logger } from "@/lib/utils/logger";

export async function GET() {
  try {
    const { clientToken } = await gateway.clientToken.generate({});
    return NextResponse.json({ clientToken });
  } catch (error) {
    logger.error("Error generating client token:", error);
    return NextResponse.json(
      { error: "Failed to generate client token" },
      { status: 500 }
    );
  }
}
