import { NextRequest, NextResponse } from "next/server";
import { updateReceipt } from "@/lib/kv";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiptId, name } = body;

    if (!receiptId || !name?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const trimmedName = name.trim();

    const updated = await updateReceipt(receiptId, (receipt) => {
      const paidBy = receipt.paidBy || [];
      if (paidBy.includes(trimmedName)) {
        // Toggle off
        receipt.paidBy = paidBy.filter((n) => n !== trimmedName);
      } else {
        receipt.paidBy = [...paidBy, trimmedName];
      }
      return receipt;
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Receipt not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({ receipt: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
