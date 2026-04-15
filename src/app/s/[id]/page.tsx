"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Receipt, calculateShare } from "@/lib/receipt";
import ItemRow from "@/components/ItemRow";
import TotalBreakdown from "@/components/TotalBreakdown";
import PaymentButtons from "@/components/PaymentButtons";
import Odometer from "@/components/Odometer";

export default function FriendView() {
  const params = useParams();
  const id = params.id as string;

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const fetchReceipt = useCallback(async () => {
    try {
      const res = await fetch(`/api/receipt?id=${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Not found");
      setReceipt(data.receipt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Receipt not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReceipt();
    const saved = localStorage.getItem(`pmbp-name-${id}`);
    if (saved) setUserName(saved);
  }, [id, fetchReceipt]);

  function handleSetName() {
    const name = nameInput.trim();
    if (!name) return;
    setUserName(name);
    localStorage.setItem(`pmbp-name-${id}`, name);
  }

  async function handleClaim(itemId: number, fraction: number) {
    if (!userName) return;
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptId: id,
          itemId,
          name: userName,
          fraction,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Claim failed");
      setReceipt(data.receipt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setToast(msg);
      setTimeout(() => setToast(""), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--text-tertiary)] text-[14px]">Loading...</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="font-[family-name:var(--font-instrument-serif)] text-[22px] mb-2">
          Receipt not found
        </h1>
        <p className="text-[var(--text-secondary)] text-[14px]">
          This link may have expired or doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const share = userName
    ? calculateShare(receipt.items, userName, receipt.subtotal, receipt.tax, receipt.tip)
    : null;

  // Name entry
  if (!userName) {
    return (
      <div className="flex-1 flex flex-col items-center px-6 py-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-[22px] font-normal">
              pay<span className="font-bold underline">{receipt.payerName}</span>backpls
            </h1>
            <p className="text-[14px] text-[var(--text-secondary)] mt-1">
              {receipt.payerName} shared a receipt with you
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-2">
              What&apos;s your name?
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetName()}
              placeholder="Your name"
              autoFocus
              className="w-full py-3.5 border-b border-[var(--border)] bg-transparent text-[16px] focus:outline-none focus:border-[var(--text)] transition-colors placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <button
            onClick={handleSetName}
            disabled={!nameInput.trim()}
            className="w-full py-4 rounded bg-[var(--text)] text-white font-medium text-[15px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.99]"
          >
            See the bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="font-[family-name:var(--font-instrument-serif)] text-[22px] font-normal text-[var(--text)]">
            pay<span className="font-bold underline">{receipt.payerName}</span>backpls
          </div>
        </div>

        {/* Hero total */}
        <div className="text-center py-6 border-b border-[var(--border)]">
          <div className="text-[13px] text-[var(--text-tertiary)] uppercase tracking-[0.1em]">
            You owe
          </div>
          <div className="text-[56px] font-normal text-[var(--text)] leading-none mt-2">
            <Odometer value={share ? share.total : 0} />
          </div>
          <div className="text-[14px] text-[var(--text-secondary)] mt-2">
            to <span className="font-medium text-[var(--text)]">{receipt.payerName}</span>
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-3">
            Select your items
          </div>
          <div>
            {receipt.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                userName={userName}
                onClaim={handleClaim}
              />
            ))}
          </div>
        </div>

        {/* Breakdown + Pay */}
        {share && share.itemsTotal > 0 && (
          <>
            <TotalBreakdown
              itemsTotal={share.itemsTotal}
              taxShare={share.taxShare}
              tipShare={share.tipShare}
              total={share.total}
            />
            <PaymentButtons
              payerName={receipt.payerName}
              payerVenmo={receipt.payerVenmo}
              amount={share.total}
            />
          </>
        )}

        {share && share.itemsTotal === 0 && (
          <p className="text-[var(--text-tertiary)] text-[14px] text-center py-4">
            Tap items above to claim what you had.
          </p>
        )}

        <div className="text-center text-[12px] text-[var(--text-tertiary)] pt-2">
          Viewing as <span className="font-medium text-[var(--text-secondary)]">{userName}</span>
          {" "}&middot;{" "}
          <button
            onClick={() => {
              setUserName("");
              localStorage.removeItem(`pmbp-name-${id}`);
            }}
            className="underline underline-offset-2 hover:text-[var(--text-secondary)] transition-colors"
          >
            Change
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--text)] text-white text-[14px] px-5 py-3 rounded shadow-lg animate-[fadeIn_0.15s_ease-out]">
          {toast}
        </div>
      )}
    </div>
  );
}
