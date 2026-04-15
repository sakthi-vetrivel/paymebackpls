import { NextRequest, NextResponse } from "next/server";
import { createBrowserClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone?.trim() || !code?.trim()) {
      return NextResponse.json(
        { error: "Phone and code are required" },
        { status: 400 }
      );
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: code.trim(),
      type: "sms",
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: "Invalid code. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: { id: data.user?.id, phone: data.user?.phone },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
