import { NextRequest, NextResponse } from "next/server";
import { getReceipt } from "@/lib/kv";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing receipt ID" }, { status: 400 });
  }

  const receipt = await getReceipt(id);
  if (!receipt) {
    return NextResponse.json(
      { error: "Receipt not found or expired" },
      { status: 404 }
    );
  }

  return NextResponse.json({ receipt });
}
