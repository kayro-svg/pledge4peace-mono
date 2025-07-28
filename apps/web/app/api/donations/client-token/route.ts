import { NextResponse } from "next/server";
import gateway from "@/lib/braintree";

export async function GET() {
  try {
    const { clientToken } = await gateway.clientToken.generate({});
    return NextResponse.json({ clientToken });
  } catch (error) {
    console.error("Error generating client token:", error);
    return NextResponse.json(
      { error: "Failed to generate client token" },
      { status: 500 }
    );
  }
}
