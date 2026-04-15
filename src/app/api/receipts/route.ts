import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getReceiptsByUser } from "@/lib/kv";

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer /i, "");

  if (!accessToken) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
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

  const receipts = await getReceiptsByUser(user.id);
  return NextResponse.json({ receipts });
}
