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

    const txns: any[] = await new Promise((resolve, reject) => {
      const items: any[] = [];
      // Braintree returns a Readable stream; collect items via events
      (search as any)
        .on("data", (item: any) => items.push(item))
        .on("end", () => resolve(items))
        .on("error", (err: any) => reject(err));
    });

    const totalAmount = txns.reduce(
      (sum, t) => sum + parseFloat(t.amount || 0),
      0
    );
    const count = txns.length;
    const byDay: Record<string, number> = {};
    for (const t of txns) {
      const key = new Date(t.createdAt).toISOString().split("T")[0];
      byDay[key] = (byDay[key] || 0) + parseFloat(t.amount || 0);
    }

    return NextResponse.json({
      success: true,
      data: {
        count,
        totalAmount,
        byDay,
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
