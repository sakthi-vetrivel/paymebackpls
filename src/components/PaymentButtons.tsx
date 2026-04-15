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

  if (amount <= 0) return null;

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

  return (
    <div className="space-y-2.5">
      <a
        href={venmoUrl}
        onClick={() => {
          setTimeout(() => {
            window.location.href = venmoWebUrl;
          }, 500);
        }}
        className="flex items-center justify-center w-full py-4 rounded bg-[var(--success)] text-white font-medium text-[15px] hover:opacity-90 transition-opacity active:scale-[0.99]"
      >
        Pay {payerName} {formatCurrency(amount)} on Venmo
      </a>
      <button
        onClick={copyAmount}
        className="flex items-center justify-center w-full py-3 text-[var(--text-secondary)] font-medium text-[13px] hover:text-[var(--text)] transition-colors"
      >
        {copied ? "Copied!" : "Copy amount"}
      </button>
    </div>
  );
}
