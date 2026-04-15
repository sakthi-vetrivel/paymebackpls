import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { customAlphabet } from "nanoid";
import { setReceipt } from "@/lib/kv";
import type { Receipt } from "@/lib/receipt";
import { isValidImageType, isValidImageSize, isValidPrice } from "@/lib/validate";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

const RECEIPT_PROMPT = `Analyze this receipt image and extract all line items with their prices.

Return ONLY valid JSON in this exact format:
{
  "items": [{"name": "Item Name", "price": 12.99}],
  "subtotal": 45.97,
  "tax": 4.08,
  "tip": null,
  "total": 50.05
}

Rules:
- Each item should have a name (string) and price (number)
- If an item has a quantity like "2x Beer $18", list it as one item with the full price
- Prices must be numbers, not strings
- If tip is not on the receipt, set tip to null
- If subtotal or total is unclear, calculate from the items
- Do NOT include any text outside the JSON`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const payerName = formData.get("payerName") as string | null;
    const payerVenmo = formData.get("payerVenmo") as string | null;
    const tipOverride = formData.get("tip") as string | null;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!isValidImageType(image.type)) {
      return NextResponse.json(
        { error: "Please upload a JPEG, PNG, or WebP image" },
        { status: 400 }
      );
    }

    if (!isValidImageSize(image.size)) {
      return NextResponse.json(
        { error: "Image must be under 10MB" },
        { status: 400 }
      );
    }

    if (!payerName?.trim()) {
      return NextResponse.json(
        { error: "Please enter your name" },
        { status: 400 }
      );
    }

    if (!payerVenmo?.trim()) {
      return NextResponse.json(
        { error: "Please enter your Venmo handle" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = image.type as "image/jpeg" | "image/png" | "image/webp";

    // Call Claude Vision API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not configured");
      return NextResponse.json(
        { error: "Receipt scanning is temporarily unavailable" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            { type: "text", text: RECEIPT_PROMPT },
          ],
        },
      ],
    });

    // Parse Claude's response
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Couldn't read this receipt. Try a clearer photo." },
        { status: 422 }
      );
    }

    let parsed;
    try {
      // Extract JSON from response (Claude sometimes wraps in markdown code blocks)
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Failed to parse Claude response:", textBlock.text);
      return NextResponse.json(
        { error: "Couldn't read this receipt. Try a clearer photo or add items manually." },
        { status: 422 }
      );
    }

    // Validate and sanitize items
    const items = (parsed.items || [])
      .filter(
        (item: { name: string; price: number }) =>
          item.name && isValidPrice(item.price)
      )
      .map((item: { name: string; price: number }, index: number) => ({
        id: index,
        name: String(item.name).slice(0, 100),
        price: Math.round(item.price * 100) / 100,
        claims: [],
      }));

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No items found on this receipt. Try a clearer photo." },
        { status: 422 }
      );
    }

    const subtotal =
      typeof parsed.subtotal === "number" && parsed.subtotal > 0
        ? parsed.subtotal
        : items.reduce((sum: number, i: { price: number }) => sum + i.price, 0);

    const tax =
      typeof parsed.tax === "number" && parsed.tax >= 0 ? parsed.tax : 0;

    // Use tip override from payer, fallback to OCR, fallback to 20%
    let tip: number;
    if (tipOverride !== null && tipOverride !== "") {
      tip = Math.max(0, parseFloat(tipOverride) || 0);
    } else if (typeof parsed.tip === "number" && parsed.tip >= 0) {
      tip = parsed.tip;
    } else {
      tip = Math.round(subtotal * 0.2 * 100) / 100;
    }

    const total = Math.round((subtotal + tax + tip) * 100) / 100;

    // Store receipt
    const id = nanoid();
    const description = formData.get("description") as string | null;

    const receipt: Receipt = {
      id,
      payerName: payerName.trim(),
      payerVenmo: payerVenmo.trim(),
      description: description?.trim().slice(0, 200) || undefined,
      items,
      tax,
      tip,
      subtotal,
      total,
      createdAt: new Date().toISOString(),
      paidBy: [],
    };

    await setReceipt(receipt);

    return NextResponse.json({ receipt });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
