"use client";

import { useState } from "react";

interface SavePhonePromptProps {
  receiptId: string;
}

type PromptStep = "phone" | "code" | "done";

export default function SavePhonePrompt({ receiptId }: SavePhonePromptProps) {
  const [step, setStep] = useState<PromptStep>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || step === "done") {
    if (step === "done") {
      return (
        <div className="text-center text-[13px] text-[var(--text-secondary)] py-3">
          Saved! Find this receipt in{" "}
          <a href="/receipts" className="underline underline-offset-2 font-medium text-[var(--text)]">
            My Receipts
          </a>
        </div>
      );
    }
    return null;
  }

  async function handleSendCode() {
    if (!phone.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Store session in localStorage for the my-receipts page
      localStorage.setItem("pmbp-session", JSON.stringify(data.session));
      localStorage.setItem("pmbp-user", JSON.stringify(data.user));

      // Link this receipt to the user
      await fetch("/api/receipt/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptId, accessToken: data.session.access_token }),
      });

      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-[var(--border)] rounded-lg bg-white p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[14px] font-medium text-[var(--text)]">
            Save this receipt
          </div>
          <div className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            Enter your number to find it later
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-[18px] leading-none transition-colors -mt-1"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>

      {error && (
        <div className="text-[var(--danger)] text-[12px]">{error}</div>
      )}

      {step === "phone" && (
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="flex-1 min-w-0 py-2.5 px-3 border border-[var(--border)] rounded text-[14px] bg-transparent focus:outline-none focus:border-[var(--text)] transition-colors placeholder:text-[var(--text-tertiary)]"
          />
          <button
            onClick={handleSendCode}
            disabled={loading || !phone.trim()}
            className="shrink-0 px-4 py-2.5 bg-[var(--text)] text-white text-[13px] font-medium rounded transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send code"}
          </button>
        </div>
      )}

      {step === "code" && (
        <div className="space-y-2">
          <div className="text-[12px] text-[var(--text-secondary)]">
            Enter the code sent to {phone}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="123456"
              maxLength={6}
              autoFocus
              className="flex-1 min-w-0 py-2.5 px-3 border border-[var(--border)] rounded text-[14px] bg-transparent text-center tracking-[0.3em] font-medium focus:outline-none focus:border-[var(--text)] transition-colors placeholder:text-[var(--text-tertiary)] placeholder:tracking-[0.3em]"
            />
            <button
              onClick={handleVerify}
              disabled={loading || !code.trim()}
              className="shrink-0 px-4 py-2.5 bg-[var(--text)] text-white text-[13px] font-medium rounded transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
          <button
            onClick={() => { setStep("phone"); setCode(""); setError(""); }}
            className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Use a different number
          </button>
        </div>
      )}
    </div>
  );
}
