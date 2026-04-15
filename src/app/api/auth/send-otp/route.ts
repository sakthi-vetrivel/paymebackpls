import { NextRequest, NextResponse } from "next/server";
import { createBrowserClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone?.trim()) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });

    if (error) {
      console.error("OTP send error:", error);
      return NextResponse.json(
        { error: "Failed to send code. Check your number and try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
