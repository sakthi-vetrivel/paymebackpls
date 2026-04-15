"use client";

import { useEffect, useState } from "react";
import { Receipt, formatCurrency } from "@/lib/receipt";

export default function MyReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("pmbp-user");
    if (!userStr) {
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setLoggedIn(true);
      fetchReceipts(user.id);
    } catch {
      setLoading(false);
    }
  }, []);

  async function fetchReceipts(userId: string) {
    try {
      const res = await fetch(`/api/receipts?userId=${userId}`);
      const data = await res.json();
      if (res.ok) setReceipts(data.receipts);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  }

  function claimedCount(receipt: Receipt) {
    const names = new Set<string>();
    for (const item of receipt.items) {
      for (const claim of item.claims) {
        names.add(claim.name);
      }
    }
    return names.size;
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--text-tertiary)] text-[14px]">Loading...</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-3">
          <h1 className="font-[family-name:var(--font-instrument-serif)] text-[22px] font-normal">
            My Receipts
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-xs">
            Save your phone number when creating a receipt to see it here.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-[var(--text)] text-white text-[14px] font-medium rounded hover:opacity-90 transition-opacity"
          >
            Split a bill
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-[family-name:var(--font-instrument-serif)] text-[22px] font-normal">
            My Receipts
          </h1>
          <a
            href="/"
            className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            + New
          </a>
        </div>

        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[14px] text-[var(--text-secondary)]">
              No receipts yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div>
            {receipts.map((receipt) => (
              <a
                key={receipt.id}
                href={`/s/${receipt.id}`}
                className="block py-4 border-b border-[var(--border-light)] hover:bg-[var(--claimed-bg)] -mx-3 px-3 rounded transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-[var(--text)] truncate">
                      {receipt.items.length} item{receipt.items.length !== 1 ? "s" : ""}
                    </div>
                    <div className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                      {formatDate(receipt.createdAt)}
                      {claimedCount(receipt) > 0 && (
                        <> &middot; {claimedCount(receipt)} claimed</>
                      )}
                    </div>
                  </div>
                  <div className="text-[16px] font-medium text-[var(--text)] tabular-nums shrink-0 ml-4">
                    {formatCurrency(receipt.total)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
