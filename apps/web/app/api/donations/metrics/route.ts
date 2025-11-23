import { NextRequest, NextResponse } from "next/server";
import gateway from "@/lib/braintree";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const role = (token?.userRole as string) || (token as any)?.role || "user";
    if (!["moderator", "admin", "superAdmin"].includes(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const days = Math.max(
      1,
      Math.min(90, parseInt(url.searchParams.get("days") || "30"))
    );

    // Fetch recent transactions via Braintree – sandbox friendly
    const search = gateway.transaction.search((s) => {
      const start = new Date();
      start.setDate(start.getDate() - days);
      // createdAt min
      s.createdAt().min(start);
    });

    const allTxns: any[] = await new Promise((resolve, reject) => {
      const items: any[] = [];
      // Braintree returns a Readable stream; collect items via events
      (search as any)
        .on("data", (item: any) => items.push(item))
        .on("end", () => resolve(items))
        .on("error", (err: any) => reject(err));
    });

    // Fetch full transaction details to get customFields (search results don't include them)
    const txnsWithDetails = await Promise.all(
      allTxns.map(async (t) => {
        try {
          const fullTxn = await gateway.transaction.find(t.id);
          return fullTxn;
        } catch (error) {
          console.error(`Error fetching transaction ${t.id}:`, error);
          return null;
        }
      })
    );



    // Filter out Peace Seal payments and null results
    const txns = txnsWithDetails.filter((t) => {
      if (!t) return false;

      // Check Plan ID (Peace Seal plans start with "peace_seal")
      if (t.planId && t.planId.includes("peace_seal")) return false;

      // Check Subscription ID (Peace Seal subscriptions start with "peace_seal")
      if (t.subscriptionId && t.subscriptionId.includes("peace_seal"))
        return false;

      // Fallback: Check Custom Fields (if available)
      const customFields = t.customFields || {};
      const paymentType = customFields.payment_type || "";
      const companyId = customFields.company_id;

      if (paymentType.includes("peace_seal")) return false;
      if (companyId) return false;

      return true;
    });



    const totalAmount = txns.reduce(
      (sum, t) => sum + parseFloat(t.amount || "0"),
      0
    );
    const count = txns.length;
    const byDay: Record<string, number> = {};
    for (const t of txns) {
      const key = new Date(t.createdAt).toISOString().split("T")[0];
      byDay[key] = (byDay[key] || 0) + parseFloat(t.amount || "0");
    }

    const donors = txns.map((t) => ({
      id: t?.id,
      amount: t?.amount,
      date: t?.createdAt,
      firstName: t?.customer?.firstName || "Anonymous",
      lastName: t?.customer?.lastName || "",
      email: t?.customer?.email || "No email",
      type: t?.type, // "sale" usually
      paymentInstrumentType: t?.paymentInstrumentType,
    }));



    return NextResponse.json({
      success: true,
      data: {
        count,
        totalAmount,
        byDay,
        donors,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to load donation metrics",
      },
      { status: 500 }
    );
  }
}
