import { NextRequest, NextResponse } from "next/server";
import { updateReceipt } from "@/lib/kv";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiptId, name } = body;

    if (typeof receiptId !== "string" || !receiptId || !name?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const trimmedName = name.trim().slice(0, 100);

    const updated = await updateReceipt(receiptId, (receipt) => {
      const paidBy = receipt.paidBy || [];
      const match = paidBy.find((n) => n.toLowerCase() === trimmedName.toLowerCase());
      if (match) {
        // Toggle off
        receipt.paidBy = paidBy.filter((n) => n.toLowerCase() !== trimmedName.toLowerCase());
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
