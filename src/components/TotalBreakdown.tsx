"use client";

import { formatCurrency } from "@/lib/receipt";

interface TotalBreakdownProps {
  itemsTotal: number;
  taxShare: number;
  tipShare: number;
  total: number;
}

export default function TotalBreakdown({
  itemsTotal,
  taxShare,
  tipShare,
  total,
}: TotalBreakdownProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[14px] text-[var(--text-secondary)]">
        <span>Your items</span>
        <span className="font-medium text-[var(--text)] tabular-nums">{formatCurrency(itemsTotal)}</span>
      </div>
      <div className="flex justify-between text-[14px] text-[var(--text-secondary)]">
        <span>Tax</span>
        <span className="font-medium text-[var(--text)] tabular-nums">{formatCurrency(taxShare)}</span>
      </div>
      <div className="flex justify-between text-[14px] text-[var(--text-secondary)]">
        <span>Tip</span>
        <span className="font-medium text-[var(--text)] tabular-nums">{formatCurrency(tipShare)}</span>
      </div>
      <div className="flex justify-between text-[16px] font-semibold pt-2.5 mt-2 border-t border-[var(--text)]">
        <span>Total</span>
        <span className="text-[18px] font-semibold tabular-nums" aria-live="polite">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
