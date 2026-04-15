"use client";

import { formatCurrency } from "@/lib/receipt";
import { useState } from "react";

interface PaymentButtonsProps {
  payerName: string;
  payerVenmo: string;
  amount: number;
}

export default function PaymentButtons({
  payerName,
  payerVenmo,
  amount,
}: PaymentButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  if (amount <= 0) return null;

  const hasVenmo = payerVenmo.trim().length > 0;

  const venmoHandle = payerVenmo.startsWith("@")
    ? payerVenmo.slice(1)
    : payerVenmo;

  const venmoUrl = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(
    venmoHandle
  )}&amount=${amount.toFixed(2)}&note=${encodeURIComponent("paymebackpls")}`;

  const venmoWebUrl = `https://venmo.com/${encodeURIComponent(venmoHandle)}?txn=pay&amount=${amount.toFixed(2)}&note=${encodeURIComponent("paymebackpls")}`;

  async function copyAmount() {
    await navigator.clipboard.writeText(amount.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleVenmoClick() {
    // Try deep link, fallback to web after delay
    const timer = setTimeout(() => {
      setShowFallback(true);
      window.location.href = venmoWebUrl;
    }, 1500);

    // If Venmo app opens, page gets hidden — cancel the fallback
    function onVisibilityChange() {
      if (document.hidden) {
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
  }

  return (
    <div className="space-y-2.5">
      {hasVenmo && (
        <a
          href={venmoUrl}
          onClick={handleVenmoClick}
          className="flex items-center justify-center w-full py-4 rounded bg-[var(--success)] text-white font-medium text-[15px] hover:opacity-90 transition-opacity active:scale-[0.99]"
        >
          Pay {payerName} {formatCurrency(amount)} on Venmo
        </a>
      )}

      {showFallback && (
        <div className="text-center py-3 px-4 rounded border border-[var(--border)] bg-white">
          <p className="text-[13px] text-[var(--text-secondary)]">
            Having trouble? Send {formatCurrency(amount)} to{" "}
            <span className="font-medium text-[var(--text)]">@{venmoHandle}</span>{" "}
            on Venmo manually.
          </p>
        </div>
      )}

      <button
        onClick={copyAmount}
        className="flex items-center justify-center w-full py-3 text-[var(--text-secondary)] font-medium text-[13px] hover:text-[var(--text)] transition-colors"
      >
        {copied ? "Copied!" : `Copy amount (${formatCurrency(amount)})`}
      </button>
    </div>
  );
}
