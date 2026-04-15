import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { setReceipt } from "@/lib/kv";
import { Receipt } from "@/lib/receipt";
import { isValidPrice } from "@/lib/validate";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payerName, payerVenmo, description, items, tax, tip, subtotal } = body;

    if (!payerName?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    const sanitizedItems = items
      .filter((item: { name: string; price: number }) => item.name?.trim() && isValidPrice(item.price))
      .map((item: { name: string; price: number }, index: number) => ({
        id: index,
        name: String(item.name).trim().slice(0, 100),
        price: Math.round(item.price * 100) / 100,
        claims: [],
      }));

    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items provided" },
        { status: 400 }
      );
    }

    const sanitizedTax = typeof tax === "number" && tax >= 0 ? Math.round(tax * 100) / 100 : 0;
    const sanitizedTip = typeof tip === "number" && tip >= 0 ? Math.round(tip * 100) / 100 : 0;
    const calculatedSubtotal = sanitizedItems.reduce((s: number, i: { price: number }) => s + i.price, 0);
    const total = Math.round((calculatedSubtotal + sanitizedTax + sanitizedTip) * 100) / 100;

    const id = nanoid();
    const receipt: Receipt = {
      id,
      payerName: payerName.trim().slice(0, 100),
      payerVenmo: (payerVenmo?.trim() || "").slice(0, 50),
      description: typeof description === "string" ? description.trim().slice(0, 200) : undefined,
      items: sanitizedItems,
      tax: sanitizedTax,
      tip: sanitizedTip,
      subtotal: calculatedSubtotal,
      total,
      createdAt: new Date().toISOString(),
      paidBy: [],
    };

    await setReceipt(receipt);

    return NextResponse.json({ receipt });
  } catch (error) {
    console.error("Create receipt error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
