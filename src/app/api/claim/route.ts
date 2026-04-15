import { NextRequest, NextResponse } from "next/server";
import { updateReceipt } from "@/lib/kv";
import { remainingFraction } from "@/lib/receipt";
import { isValidFraction } from "@/lib/validate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiptId, itemId, name, fraction } = body;

    if (!receiptId || typeof itemId !== "number" || !name?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isValidFraction(fraction)) {
      return NextResponse.json(
        { error: "Invalid fraction" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    const updated = await updateReceipt(receiptId, (receipt) => {
      const item = receipt.items.find((i) => i.id === itemId);
      if (!item) throw new Error("Item not found");

      // Remove existing claim by this person
      item.claims = item.claims.filter((c) => c.name !== trimmedName);

      // If fraction is 0, just unclaim (already removed above)
      if (fraction > 0) {
        const remaining = remainingFraction(item);
        if (remaining < fraction - 0.01) {
          throw new Error(
            `Only ${Math.round(remaining * 100)}% of this item is available`
          );
        }
        item.claims.push({ name: trimmedName, fraction });
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
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
