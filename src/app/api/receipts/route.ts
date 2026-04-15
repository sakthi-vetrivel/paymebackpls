import { NextRequest, NextResponse } from "next/server";
import { getReceiptsByUser } from "@/lib/kv";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  const receipts = await getReceiptsByUser(userId);
  return NextResponse.json({ receipts });
}
