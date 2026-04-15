import { NextRequest, NextResponse } from "next/server";
import { linkReceiptToUser } from "@/lib/kv";

export async function POST(request: NextRequest) {
  try {
    const { receiptId, userId } = await request.json();

    if (!receiptId || !userId) {
      return NextResponse.json(
        { error: "Receipt ID and user ID are required" },
        { status: 400 }
      );
    }

    const linked = await linkReceiptToUser(receiptId, userId);
    if (!linked) {
      return NextResponse.json(
        { error: "Failed to link receipt" },
        { status: 400 }
      );
    }

    return NextResponse.json({ linked: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
