import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { linkReceiptToUser } from "@/lib/kv";

export async function POST(request: NextRequest) {
  try {
    const { receiptId, accessToken } = await request.json();

    if (!receiptId || !accessToken) {
      return NextResponse.json(
        { error: "Receipt ID and access token are required" },
        { status: 400 }
      );
    }

    // Verify the token server-side to get the authenticated user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const linked = await linkReceiptToUser(receiptId, user.id);
    return NextResponse.json({ linked });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
