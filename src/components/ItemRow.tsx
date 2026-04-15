"use client";

import {
  ReceiptItem,
  isFullyClaimed,
  remainingFraction,
  getClaimByName,
  formatCurrency,
  fractionLabel,
} from "@/lib/receipt";
import { useState } from "react";

interface ItemRowProps {
  item: ReceiptItem;
  userName: string;
  onClaim: (itemId: number, fraction: number) => Promise<void>;
  disabled?: boolean;
}

export default function ItemRow({ item, userName, onClaim, disabled }: ItemRowProps) {
  const [loading, setLoading] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customN, setCustomN] = useState("");
  const myClaim = getClaimByName(item, userName);
  const fullyClaimed = isFullyClaimed(item);
  const remaining = remainingFraction(item);

  async function handleClaim(fraction: number) {
    setLoading(true);
    try {
      await onClaim(item.id, fraction);
      setShowSplit(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnclaim() {
    setLoading(true);
    try {
      await onClaim(item.id, 0);
      setShowSplit(false);
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = disabled || loading;
  const cannotClaim = fullyClaimed && !myClaim;
  const otherClaims = item.claims.filter((c) => c.name !== userName);

  function handleRowTap() {
    if (isDisabled) return;
    if (myClaim) {
      handleUnclaim();
    } else if (!cannotClaim) {
      const maxFraction = remaining >= 0.99 ? 1 : remaining;
      handleClaim(maxFraction);
    }
  }

  // Figure out current split number from fraction (1/fraction rounded)
  const currentSplitN = myClaim ? Math.round(1 / myClaim.fraction) : 1;

  return (
    <div
      role="button"
      tabIndex={cannotClaim || isDisabled ? -1 : 0}
      aria-label={`${item.name} ${formatCurrency(item.price)}${myClaim ? ", claimed" : ""}${cannotClaim ? ", fully claimed" : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRowTap();
        }
      }}
      className={`transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--text)] focus-visible:ring-offset-2 ${
        cannotClaim
          ? "border-b border-[var(--border-light)] opacity-35"
          : myClaim
          ? "bg-[var(--claimed-bg)] border-b border-[var(--border-light)] -mx-6 px-6 border-l-2 border-l-[var(--text)]"
          : "border-b border-[var(--border-light)]"
      }`}
    >
      <div
        onClick={handleRowTap}
        className={`flex items-center justify-between py-3.5 ${
          !cannotClaim && !isDisabled ? "cursor-pointer active:opacity-70" : ""
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[15px] truncate">{item.name}</p>
          {(myClaim || otherClaims.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {myClaim && (
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                  You{myClaim.fraction < 0.99 ? ` · ${fractionLabel(myClaim.fraction)}` : ""}
                </span>
              )}
              {myClaim && (
                <>
                  <span className="text-[11px] text-[var(--text-tertiary)]">·</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowSplit(!showSplit); }}
                    className="text-[11px] text-[var(--text-tertiary)] underline underline-offset-2 hover:text-[var(--text-secondary)] transition-colors"
                  >
                    {showSplit ? "done" : "split"}
                  </button>
                </>
              )}
              {otherClaims.map((c) => (
                <span
                  key={c.name}
                  className="text-[11px] text-[var(--text-tertiary)]"
                >
                  · {c.name} · {fractionLabel(c.fraction)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[15px] font-medium tabular-nums">
            {formatCurrency(item.price)}
          </span>
          {loading ? (
            <span className="text-[11px] text-[var(--text-tertiary)]">...</span>
          ) : myClaim ? (
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--text)] text-white text-[12px] leading-none" aria-hidden="true">
              &#10003;
            </span>
          ) : !cannotClaim ? (
            <span className="w-5 h-5 flex items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-tertiary)] text-[14px] leading-none" aria-hidden="true">
              +
            </span>
          ) : null}
        </div>
      </div>

      {/* Split stepper — "shared among how many?" */}
      {showSplit && myClaim && (
        <div className="flex items-center gap-2 pb-3 -mt-1">
          <span className="text-[12px] text-[var(--text-tertiary)]">Split among</span>
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={(e) => { e.stopPropagation(); setShowCustom(false); handleClaim(1 / n); }}
              disabled={isDisabled}
              className={`text-[13px] font-medium w-11 h-11 rounded-full border transition-colors ${
                currentSplitN === n && !showCustom
                  ? "bg-[var(--text)] text-white border-[var(--text)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--text)] hover:text-white hover:border-[var(--text)]"
              } disabled:opacity-50`}
            >
              {n}
            </button>
          ))}
          {!showCustom ? (
            <button
              onClick={(e) => { e.stopPropagation(); setShowCustom(true); setCustomN(currentSplitN > 6 ? String(currentSplitN) : ""); }}
              className={`text-[13px] font-medium w-11 h-11 rounded-full border transition-colors ${
                currentSplitN > 6
                  ? "bg-[var(--text)] text-white border-[var(--text)]"
                  : "border-[var(--border)] text-[var(--text-tertiary)] hover:bg-[var(--text)] hover:text-white hover:border-[var(--text)]"
              }`}
            >
              {currentSplitN > 6 ? currentSplitN : "…"}
            </button>
          ) : (
            <input
              type="number"
              inputMode="numeric"
              min={2}
              max={99}
              autoFocus
              value={customN}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setCustomN(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const n = parseInt(customN, 10);
                  if (n >= 2 && n <= 99) {
                    handleClaim(1 / n);
                    setShowCustom(false);
                  }
                }
              }}
              onBlur={() => {
                const n = parseInt(customN, 10);
                if (n >= 2 && n <= 99) {
                  handleClaim(1 / n);
                }
                setShowCustom(false);
              }}
              className="w-12 h-11 text-[13px] font-medium text-center rounded-full border border-[var(--text)] bg-white focus:outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="#"
            />
          )}
        </div>
      )}
    </div>
  );
}
