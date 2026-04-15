"use client";

import { useEffect, useState, useCallback } from "react";
import { Receipt, calculateShare, isFullyClaimed } from "@/lib/receipt";
import ItemRow from "@/components/ItemRow";
import TotalBreakdown from "@/components/TotalBreakdown";
import PaymentButtons from "@/components/PaymentButtons";
import Odometer from "@/components/Odometer";

interface FriendViewProps {
  id: string;
}

export default function FriendView({ id }: FriendViewProps) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [markingPaid, setMarkingPaid] = useState(false);

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

  async function handleMarkPaid() {
    if (!userName || markingPaid) return;
    setMarkingPaid(true);
    try {
      const res = await fetch("/api/receipt/paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptId: id, name: userName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setReceipt(data.receipt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setToast(msg);
      setTimeout(() => setToast(""), 3000);
    } finally {
      setMarkingPaid(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center px-6 py-10">
        <div className="w-full max-w-md space-y-6 animate-pulse">
          <div className="text-center space-y-2">
            <div className="h-6 bg-[var(--border)] rounded w-48 mx-auto" />
          </div>
          <div className="text-center py-6 border-b border-[var(--border)]">
            <div className="h-3 bg-[var(--border)] rounded w-16 mx-auto mb-4" />
            <div className="h-14 bg-[var(--border)] rounded w-32 mx-auto" />
          </div>
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3.5 border-b border-[var(--border-light)]">
                <div className="h-4 bg-[var(--border)] rounded w-32" />
                <div className="h-4 bg-[var(--border)] rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="font-[family-name:var(--font-instrument-serif)] text-[22px] mb-2">
          Receipt not found
        </h1>
        <p className="text-[var(--text-secondary)] text-[14px] mb-6">
          This link may have expired or doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="px-6 py-3 rounded bg-[var(--text)] text-white font-medium text-[14px] hover:opacity-90 transition-opacity"
        >
          Split your own bill
        </a>
      </div>
    );
  }

  const share = userName
    ? calculateShare(receipt.items, userName, receipt.subtotal, receipt.tax, receipt.tip)
    : null;

  const allClaimed = receipt.items.every((item) => isFullyClaimed(item));
  const hasPaid = receipt.paidBy?.includes(userName);

  // Get unique claimant names
  const claimants = Array.from(
    new Set(receipt.items.flatMap((item) => item.claims.map((c) => c.name)))
  );

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
            {receipt.description && (
              <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                {receipt.description}
              </p>
            )}
            <p className="text-[13px] text-[var(--text-tertiary)] mt-2">
              {receipt.items.length} item{receipt.items.length !== 1 ? "s" : ""}
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
          {receipt.description && (
            <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
              {receipt.description}
            </p>
          )}
        </div>

        {/* All claimed banner */}
        {allClaimed && (
          <div className="text-center py-3 px-4 rounded bg-[var(--success)]/10 border border-[var(--success)]/20">
            <p className="text-[14px] font-medium text-[var(--success)]">
              All items claimed!
            </p>
          </div>
        )}

        {/* Hero total */}
        <div className="text-center py-6 border-b border-[var(--border)]">
          <div className="text-[13px] text-[var(--text-tertiary)] uppercase tracking-[0.1em]">
            You owe
          </div>
          <div className="text-[56px] font-normal text-[var(--text)] leading-none mt-2" aria-live="polite">
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
          <div role="list" aria-label="Receipt items">
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
            {!hasPaid ? (
              <>
                <PaymentButtons
                  payerName={receipt.payerName}
                  payerVenmo={receipt.payerVenmo}
                  amount={share.total}
                />
                <button
                  onClick={handleMarkPaid}
                  disabled={markingPaid}
                  className="w-full py-3 rounded border border-[var(--border)] text-[var(--text-secondary)] font-medium text-[13px] hover:border-[var(--text)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
                >
                  {markingPaid ? "Marking..." : "I've already paid"}
                </button>
              </>
            ) : (
              <div className="text-center py-4 px-4 rounded bg-[var(--success)]/10 border border-[var(--success)]/20">
                <p className="text-[14px] font-medium text-[var(--success)]">
                  You&apos;re all set!
                </p>
                <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                  Marked as paid to {receipt.payerName}
                </p>
                <button
                  onClick={handleMarkPaid}
                  className="text-[12px] text-[var(--text-tertiary)] underline underline-offset-2 hover:text-[var(--text-secondary)] transition-colors mt-2"
                >
                  Undo
                </button>
              </div>
            )}
          </>
        )}

        {share && share.itemsTotal === 0 && (
          <p className="text-[var(--text-tertiary)] text-[14px] text-center py-4">
            Tap items above to claim what you had.
          </p>
        )}

        {/* Per-person summary (shown when all items claimed) */}
        {allClaimed && claimants.length > 0 && (
          <div className="border-t border-[var(--border)] pt-4">
            <div className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-3">
              Everyone
            </div>
            {claimants.map((name) => {
              const personShare = calculateShare(
                receipt.items, name, receipt.subtotal, receipt.tax, receipt.tip
              );
              const paid = receipt.paidBy?.includes(name);
              return (
                <div key={name} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium">{name}</span>
                    {paid && (
                      <span className="text-[11px] font-medium text-[var(--success)]">Paid</span>
                    )}
                    {!paid && (
                      <span className="text-[11px] text-[var(--text-tertiary)]">Unpaid</span>
                    )}
                  </div>
                  <span className="text-[14px] font-medium tabular-nums">
                    {`$${personShare.total.toFixed(2)}`}
                  </span>
                </div>
              );
            })}
          </div>
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
